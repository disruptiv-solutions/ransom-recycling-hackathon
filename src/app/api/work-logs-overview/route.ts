import { NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";
import { getServerDemoMode } from "@/lib/demo-mode-server";
import { mapWorkLog } from "@/lib/ops/firestore";

const overviewSchema = z.object({
  filters: z.object({
    search: z.string().optional(),
    participantId: z.string().optional(),
    role: z.string().optional(),
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const isDemoMode = await getServerDemoMode();
  const json = await req.json().catch(() => null);
  
  const parsed = overviewSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { filters } = parsed.data;
  const startDate = new Date(filters.dateRange.start);
  const endDate = new Date(filters.dateRange.end);
  
  // Ensure timestamps are valid for Firestore
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const db = getFirebaseAdminDb();

  // Fetch Work Logs
  let workLogsQuery = db.collection("work_logs")
    .where("workDate", ">=", startTimestamp)
    .where("workDate", "<=", endTimestamp);

  if (filters.participantId && filters.participantId !== "all") {
    workLogsQuery = workLogsQuery.where("participantId", "==", filters.participantId);
  }

  if (filters.role && filters.role !== "all") {
    workLogsQuery = workLogsQuery.where("role", "==", filters.role);
  }

  const workLogsSnap = await workLogsQuery.get();

  // Map and Filter Data (Demo Mode)
  let workLogs = workLogsSnap.docs.map(doc => mapWorkLog(doc.id, doc.data()));

  if (!isDemoMode) {
    workLogs = workLogs.filter(l => !l.isMock);
  }

  // Filter out "Unknown" participants
  workLogs = workLogs.filter(l => l.participantName !== "Unknown");

  // Client-side search filtering if needed (Firestore doesn't support partial text search easily)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    workLogs = workLogs.filter(l => 
      l.participantName.toLowerCase().includes(searchLower) ||
      (l.notes && l.notes.toLowerCase().includes(searchLower))
    );
  }

  // --- Analyze Patterns ---

  // 1. Role Distribution
  const roleDistribution: Record<string, number> = {};
  workLogs.forEach(l => {
    roleDistribution[l.role] = (roleDistribution[l.role] || 0) + l.hours;
  });

  // 2. Participant Workload
  const participantWorkload: Record<string, number> = {};
  workLogs.forEach(l => {
    participantWorkload[l.participantName] = (participantWorkload[l.participantName] || 0) + l.hours;
  });
  
  const topParticipants = Object.entries(participantWorkload)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);

  // 3. Notes Themes (Sample)
  const notesSamples = workLogs
    .filter(l => l.notes && l.notes.length > 10)
    .map(l => l.notes)
    .slice(0, 20); // Take a sample for the AI

  // 4. Shift Length Analysis
  const shiftLengths = {
    short: workLogs.filter(l => l.hours < 4).length,
    standard: workLogs.filter(l => l.hours >= 4 && l.hours <= 8).length,
    long: workLogs.filter(l => l.hours > 8).length,
    avg: workLogs.length > 0 ? workLogs.reduce((sum, l) => sum + l.hours, 0) / workLogs.length : 0
  };

  // --- Generate AI Overview ---
  
  const env = getServerEnv();
  const openRouterApiKey = env.OPENROUTER_API_KEY;

  if (openRouterApiKey) {
    try {
      const prompt = `Analyze work log patterns for a recycling workforce program:

FILTERED VIEW: ${filters.role || 'All Roles'}, ${workLogs.length} entries
DATE RANGE: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}

ROLE DISTRIBUTION (Total Hours):
${JSON.stringify(roleDistribution)}

PARTICIPANT WORKLOAD (Top 10 by hours):
${JSON.stringify(topParticipants)}

SUPERVISOR NOTES (Sample):
${JSON.stringify(notesSamples)}

SHIFT LENGTH ANALYSIS:
${JSON.stringify(shiftLengths)}

Identify patterns and concerns for supervisors:

1. **Staffing Observations**: Are roles evenly covered? Anyone overworked? Any coverage gaps?

2. **Notes Patterns**: What themes appear in supervisor notes? Training needs? Behavioral trends?

3. **Attendance Concerns**: Short shifts? Gaps? Overtime patterns?

4. **Recommended Actions**: 1-2 things to address.

Write for operations supervisors. Be specific with names and numbers.
IMPORTANT: Return ONLY Markdown formatted text. Do NOT use HTML tags like <p>, <ul>, <li>. Use standard Markdown syntax:
- Use ### for section headers (e.g. ### Staffing Observations)
- Use **bold** for emphasis
- Use - or * for bullet points
- Use 1. 2. 3. for numbered lists`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Ransom Solutions Dashboard",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        console.error("AI API Error:", await response.text());
        return NextResponse.json({
          ok: false,
          error: "AI Error"
        });
      }

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          // 1. Send data payload
          const dataPayload = JSON.stringify({
            type: "data",
            ok: true,
            metrics: {
              totalEntries: workLogs.length,
              uniqueParticipants: new Set(workLogs.map(l => l.participantId)).size,
              totalHours: workLogs.reduce((sum, l) => sum + l.hours, 0),
              avgShiftLength: shiftLengths.avg,
              shortShifts: shiftLengths.short,
            },
            generatedAt: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(dataPayload + "\n"));

          // 2. Stream text
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      const chunkPayload = JSON.stringify({ type: "chunk", content });
                      controller.enqueue(encoder.encode(chunkPayload + "\n"));
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }
          } catch (e) {
            console.error("Stream reading error", e);
          } finally {
            controller.close();
          }
        }
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
    }
  }

  return NextResponse.json({
    ok: true,
    overview: "AI analysis unavailable.",
    metrics: {
      totalEntries: workLogs.length,
      uniqueParticipants: new Set(workLogs.map(l => l.participantId)).size,
      totalHours: workLogs.reduce((sum, l) => sum + l.hours, 0),
      avgShiftLength: 0,
      shortShifts: 0,
    },
    generatedAt: new Date().toISOString(),
  });
};
