import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getServerEnv } from "@/lib/env/server";
import { listMcpTools, mapToolsToOpenAI, runTool } from "@/lib/ops/agent-tools";

const postSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
  pageContext: z.record(z.string(), z.string()).optional(),
});

export const GET = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const list = searchParams.get("list");

  const db = getFirebaseAdminDb();

  if (list === "true") {
    const sessionsSnap = await db
      .collection("ops_agent_sessions")
      .where("userId", "==", profile.uid)
      .orderBy("updatedAt", "desc")
      .limit(20)
      .get();

    const sessions = sessionsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        firstMessage: data.messages?.[0]?.content || "New Conversation",
      };
    });

    return NextResponse.json({ ok: true, sessions });
  }

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400 });
  }

  const sessionRef = db.collection("ops_agent_sessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) {
    return NextResponse.json({ ok: true, messages: [] });
  }

  const data = sessionSnap.data() ?? {};
  return NextResponse.json({ ok: true, messages: Array.isArray(data.messages) ? data.messages : [] });
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { sessionId, message, pageContext } = parsed.data;
  const env = getServerEnv();
  if (!env.OPENROUTER_API_KEY) {
    return NextResponse.json({ ok: false, error: "OpenRouter key missing" }, { status: 500 });
  }
  if (!env.PIPEDREAM_CLIENT_ID || !env.PIPEDREAM_CLIENT_SECRET || !env.PIPEDREAM_PROJECT_ID || !env.PIPEDREAM_ENVIRONMENT) {
    return NextResponse.json({ ok: false, error: "Pipedream MCP credentials missing" }, { status: 500 });
  }

  const db = getFirebaseAdminDb();
  const sessionRef = db.collection("ops_agent_sessions").doc(sessionId);
  await sessionRef.set(
    {
      userId: profile.uid,
      pageContext: pageContext ?? {},
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const systemPrompt = `You are the Ops Agent for Ransom Operations Platform.
You help staff understand the current page and answer questions using MCP tools.
Current page context: ${JSON.stringify(pageContext ?? {})}
If a participantId or reportId is present, prefer using tools to fetch context.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  const runModel = async (inputMessages: any[], tools: any[], stream = false) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Ransom Ops Agent",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: inputMessages,
        tools,
        tool_choice: "auto",
        stream,
      }),
    });
    return response;
  };

  const extractContent = (message: any) => {
    if (!message) return "";
    if (typeof message.content === "string") return message.content;
    if (Array.isArray(message.content)) {
      return message.content
        .map((part: any) => (typeof part === "string" ? part : part?.text))
        .filter(Boolean)
        .join("");
    }
    return "";
  };

  const mcpTools = await listMcpTools(profile.uid);
  const openAiTools = mapToolsToOpenAI(mcpTools);

  const runStreamingResponse = async (inputMessages: any[]) => {
    const response = await runModel(inputMessages, openAiTools, true);
    if (!response.ok) {
      throw new Error("Streaming failed");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let fullContent = "";
        let buffer = "";
        let toolCalls: any[] = [];

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            while (true) {
              const lineEnd = buffer.indexOf("\n");
              if (lineEnd === -1) break;

              const line = buffer.slice(0, lineEnd).trim();
              buffer = buffer.slice(lineEnd + 1);

              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6);
                if (dataStr === "[DONE]") break;

                try {
                  const data = JSON.parse(dataStr);
                  
                  // Handle mid-stream errors
                  if (data.error) {
                    console.error("OpenRouter mid-stream error:", data.error);
                    const errorMsg = `\n\n[Error: ${data.error.message}]`;
                    controller.enqueue(encoder.encode(errorMsg));
                    fullContent += errorMsg;
                    break;
                  }

                  const delta = data.choices?.[0]?.delta;
                  
                  if (delta?.tool_calls) {
                    for (const tc of delta.tool_calls) {
                      if (tc.index !== undefined) {
                        if (!toolCalls[tc.index]) toolCalls[tc.index] = { id: tc.id, function: { name: "", arguments: "" } };
                        if (tc.id) toolCalls[tc.index].id = tc.id;
                        if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
                        if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
                      }
                    }
                    continue;
                  }

                  const content = delta?.content || "";
                  if (content) {
                    fullContent += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore parsing errors for partial chunks
                }
              }
            }
          }

          if (toolCalls.length > 0) {
            // If we collected tool calls, we need to run them and then stream the result
            const toolResults = [];
            const assistantMessage = { role: "assistant", tool_calls: toolCalls.filter(Boolean) };
            
            for (const toolCall of assistantMessage.tool_calls) {
              const name = toolCall.function.name;
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const result = await runTool(profile.uid, name, args);
              toolResults.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result.result),
              });
            }

            // Start a new stream for the final response
            const secondResponse = await runModel([...inputMessages, assistantMessage, ...toolResults], openAiTools, true);
            const secondReader = secondResponse.body?.getReader();
            let secondBuffer = "";
            
            if (secondReader) {
              while (true) {
                const { done, value } = await secondReader.read();
                if (done) break;

                secondBuffer += decoder.decode(value, { stream: true });

                while (true) {
                  const lineEnd = secondBuffer.indexOf("\n");
                  if (lineEnd === -1) break;

                  const line = secondBuffer.slice(0, lineEnd).trim();
                  secondBuffer = secondBuffer.slice(lineEnd + 1);

                  if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6);
                    if (dataStr === "[DONE]") break;

                    try {
                      const data = JSON.parse(dataStr);
                      const content = data.choices?.[0]?.delta?.content || "";
                      if (content) {
                        fullContent += content;
                        controller.enqueue(encoder.encode(content));
                      }
                    } catch (e) {}
                  }
                }
              }
            }
          }

          // Save to history after everything completes
          const payloadMessage = {
            role: "user",
            content: message,
            createdAt: new Date().toISOString(),
          };
          const payloadReply = {
            role: "assistant",
            content: fullContent || "I'm not sure yet. Can you rephrase?",
            createdAt: new Date().toISOString(),
          };

          const existingSnap = await sessionRef.get();
          const existing = existingSnap.data()?.messages;
          const updatedMessages = Array.isArray(existing) ? [...existing, payloadMessage, payloadReply] : [payloadMessage, payloadReply];
          await sessionRef.set({ messages: updatedMessages, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

        } catch (error) {
          console.error("Stream error", error);
        } finally {
          controller.close();
        }
      },
    });
  };

  try {
    const stream = await runStreamingResponse(messages);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to start stream" }, { status: 500 });
  }
};
