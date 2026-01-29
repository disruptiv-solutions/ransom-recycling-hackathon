import { NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";
import { getServerDemoMode } from "@/lib/demo-mode-server";
import { mapParticipant, mapProductionRecord, mapWorkLog } from "@/lib/ops/firestore";

const overviewSchema = z.object({
  phase: z.union([z.string(), z.number()]),
  status: z.string(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export const runtime = "nodejs";

// Helper to get expected work days (simple version: M-F)
const getExpectedWorkDays = (start: Date, end: Date) => {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return Math.max(1, count); // Avoid division by zero
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const isDemoMode = await getServerDemoMode();
  const json = await req.json().catch(() => null);
  
  // Clean up input - sometimes phase comes as string "all" or number
  const rawFilters = json?.filters || {};
  
  const parsed = overviewSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { phase, status, dateRange } = parsed.data;
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  // Ensure timestamps are valid for Firestore
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const db = getFirebaseAdminDb();

  // 1. Fetch Participants
  let participantsQuery: FirebaseFirestore.Query = db.collection("participants");
  
  // Phase filtering (if not "all")
  if (phase !== "all") {
    participantsQuery = participantsQuery.where("currentPhase", "==", Number(phase));
  }
  // Status filtering (if not "all")
  if (status !== "all") {
    participantsQuery = participantsQuery.where("status", "==", status);
  }

  // 2. Fetch Work Logs
  const workLogsQuery = db.collection("work_logs")
    .where("workDate", ">=", startTimestamp)
    .where("workDate", "<=", endTimestamp);

  // 3. Fetch Production Records
  const productionQuery = db.collection("production_records")
    .where("productionDate", ">=", startTimestamp)
    .where("productionDate", "<=", endTimestamp);

  const [participantsSnap, workLogsSnap, productionSnap] = await Promise.all([
    participantsQuery.get(),
    workLogsQuery.get(),
    productionQuery.get(),
  ]);

  // Map and Filter Data (Demo Mode)
  let participants = participantsSnap.docs.map(doc => mapParticipant(doc.id, doc.data()))
    .filter(p => p.name !== "Unknown"); // Filter out unknown participants
  let workLogs = workLogsSnap.docs.map(doc => mapWorkLog(doc.id, doc.data()));
  let productionRecords = productionSnap.docs.map(doc => mapProductionRecord(doc.id, doc.data()));

  if (!isDemoMode) {
    participants = participants.filter(p => !p.isMock);
    workLogs = workLogs.filter(l => !l.isMock);
    productionRecords = productionRecords.filter(r => !r.isMock);
  } else {
    // If demo mode is ON, include everything (or just mock? Previous implementation showed ALL)
    // The user requirement was: "When in demo mode all of these mock participants will appear. When not anyone that isn't a mock data participant will disappear."
    // This implies real participants are always visible, mock ones toggle.
    // However, for privacy in demos, usually you might want ONLY mock. 
    // But sticking to the established pattern: demo mode = show real + mock.
  }

  // 4. Calculate Metrics per Participant
  const participantMetrics = participants.map(p => {
    const pLogs = workLogs.filter(log => log.participantId === p.id);
    const pProduction = productionRecords.filter(rec => rec.participantId === p.id);
    
    const totalHours = pLogs.reduce((sum, log) => sum + log.hours, 0);
    
    // Calculate days worked
    const workedDates = new Set(pLogs.map(log => log.workDate ? new Date(log.workDate).toDateString() : ""));
    workedDates.delete(""); // remove invalid dates
    const daysWorked = workedDates.size;
    
    const expectedDays = getExpectedWorkDays(startDate, endDate);
    const attendanceRate = Math.min(100, Math.round((daysWorked / expectedDays) * 100));
    
    const totalRevenue = pProduction.reduce((sum, rec) => sum + rec.value, 0);
    const laborCost = totalHours * 10; // $10/hr wage assumption
    const netValue = totalRevenue - laborCost;
    const revenuePerHour = totalHours > 0 ? Number((totalRevenue / totalHours).toFixed(2)) : 0;
    const netValuePerHour = totalHours > 0 ? Number((netValue / totalHours).toFixed(2)) : 0;
    
    // Days in phase (approximate based on entry date for now, ideally we track phase history)
    // Using entryDate as fallback
    const entryDate = p.entryDate ? new Date(p.entryDate) : new Date();
    const daysInProgram = Math.floor((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    // Determine status label
    let performanceStatus = "On Track";
    if (attendanceRate < 70) performanceStatus = "At Risk";
    else if (attendanceRate < 85) performanceStatus = "Watch";
    else if (p.currentPhase >= 2 && attendanceRate > 90 && netValuePerHour > 5) performanceStatus = "Advancing"; // Adjusted for net value

    return {
      id: p.id,
      name: p.name,
      phase: p.currentPhase,
      daysInProgram,
      attendanceRate,
      totalHours,
      revenuePerHour,
      netValuePerHour,
      laborCost,
      netValue,
      totalRevenue,
      daysWorked,
      expectedDays,
      status: performanceStatus,
      productivityTrend: 0, // Placeholder for now (requires previous period data)
      attendanceTrend: 0,   // Placeholder
    };
  });

  // 5. Generate AI Overview
  let aiOverview = "Unable to generate insights at this time.";
  
  const env = getServerEnv();
  const openRouterApiKey = env.OPENROUTER_API_KEY;

  if (openRouterApiKey) {
    try {
      const prompt = `You are analyzing workforce development data for a recycling program supervisor.

FILTERED VIEW: ${phase !== 'all' ? `Phase ${phase}` : 'All Phases'}, ${status} participants
DATE RANGE: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
PARTICIPANT COUNT: ${participants.length}

PARTICIPANT METRICS (Sample):
${JSON.stringify(participantMetrics.slice(0, 30), null, 2)} 
(List truncated to top 30 if larger)

Provide an actionable summary for the supervisor that includes:

1. **Immediate Attention** (2-3 people max): Who needs intervention TODAY and why?
   - Focus on: attendance drops (<70%), low productivity, missed days.
   - Be specific with names and numbers.
   
2. **Positive Highlights** (1-2 people): Who's ready for advancement or performing exceptionally?

3. **Group Trends**: Any patterns across the filtered group?

4. **Suggested Actions**: 1-2 concrete things supervisor should do today.

Write in a clear, conversational tone. Be direct and actionable. Use bullet points.
Assume supervisor knows these participants personally.
Keep it under 200 words. 
IMPORTANT: Return ONLY Markdown formatted text. Do NOT use HTML tags like <p>, <ul>, <li>. Use standard Markdown syntax:
- Use ### for section headers (e.g. ### Immediate Attention)
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
              total: participantMetrics.length,
              atRisk: participantMetrics.filter(p => p.status === "At Risk").length,
              onTrack: participantMetrics.filter(p => p.status === "On Track").length,
              watch: participantMetrics.filter(p => p.status === "Watch").length,
              advancing: participantMetrics.filter(p => p.status === "Advancing").length,
            },
            participants: participantMetrics,
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
    overview: aiOverview,
    metrics: {
      total: participantMetrics.length,
      atRisk: participantMetrics.filter(p => p.status === "At Risk").length,
      onTrack: participantMetrics.filter(p => p.status === "On Track").length,
      watch: participantMetrics.filter(p => p.status === "Watch").length,
      advancing: participantMetrics.filter(p => p.status === "Advancing").length,
    },
    participants: participantMetrics,
    generatedAt: new Date().toISOString(),
  });
};
