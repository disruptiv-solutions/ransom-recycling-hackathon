import { NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";
import { getServerDemoMode } from "@/lib/demo-mode-server";
import { mapProductionRecord, mapWorkLog } from "@/lib/ops/firestore";

const overviewSchema = z.object({
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
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

  const { dateRange } = parsed.data;
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  // Ensure timestamps are valid for Firestore
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  // Calculate previous period for comparison
  const duration = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - duration);
  const prevEndDate = new Date(endDate.getTime() - duration);
  const prevStartTimestamp = Timestamp.fromDate(prevStartDate);
  const prevEndTimestamp = Timestamp.fromDate(prevEndDate);

  const db = getFirebaseAdminDb();

  // 1. Fetch Production Records (Current & Previous)
  const productionQuery = db.collection("production_records")
    .where("productionDate", ">=", startTimestamp)
    .where("productionDate", "<=", endTimestamp);

  const prevProductionQuery = db.collection("production_records")
    .where("productionDate", ">=", prevStartTimestamp)
    .where("productionDate", "<=", prevEndTimestamp);

  // 2. Fetch Work Logs (Current)
  const workLogsQuery = db.collection("work_logs")
    .where("workDate", ">=", startTimestamp)
    .where("workDate", "<=", endTimestamp);

  const [productionSnap, prevProductionSnap, workLogsSnap] = await Promise.all([
    productionQuery.get(),
    prevProductionQuery.get(),
    workLogsQuery.get(),
  ]);

  // Map and Filter Data (Demo Mode)
  let productionRecords = productionSnap.docs.map(doc => mapProductionRecord(doc.id, doc.data()));
  let prevProductionRecords = prevProductionSnap.docs.map(doc => mapProductionRecord(doc.id, doc.data()));
  let workLogs = workLogsSnap.docs.map(doc => mapWorkLog(doc.id, doc.data()));

  if (!isDemoMode) {
    productionRecords = productionRecords.filter(r => !r.isMock);
    prevProductionRecords = prevProductionRecords.filter(r => !r.isMock);
    workLogs = workLogs.filter(l => !l.isMock);
  }

  // Filter out "Unknown" participants
  productionRecords = productionRecords.filter(r => r.participantName !== "Unknown");
  prevProductionRecords = prevProductionRecords.filter(r => r.participantName !== "Unknown");
  workLogs = workLogs.filter(l => l.participantName !== "Unknown");

  // --- Calculate Metrics ---

  // 1. Revenue Trends
  const totalRevenue = productionRecords.reduce((sum, r) => sum + r.value, 0);
  const prevTotalRevenue = prevProductionRecords.reduce((sum, r) => sum + r.value, 0);
  const revenueTrend = totalRevenue - prevTotalRevenue;
  
  const dailyRevenue: Record<string, number> = {};
  productionRecords.forEach(r => {
    if (!r.productionDate) return;
    const day = new Date(r.productionDate).toLocaleDateString();
    dailyRevenue[day] = (dailyRevenue[day] || 0) + r.value;
  });

  // 2. Material Mix
  const materialMix: Record<string, number> = {};
  productionRecords.forEach(r => {
    materialMix[r.materialCategory] = (materialMix[r.materialCategory] || 0) + r.value;
  });
  
  // Convert to percentages
  const materialMixPercent: Record<string, string> = {};
  Object.entries(materialMix).forEach(([cat, val]) => {
    materialMixPercent[cat] = ((val / totalRevenue) * 100).toFixed(1) + "%";
  });

  // 3. Efficiency & Top Performers
  const participantStats: Record<string, { revenue: number; hours: number }> = {};
  
  productionRecords.forEach(r => {
    if (!participantStats[r.participantName]) participantStats[r.participantName] = { revenue: 0, hours: 0 };
    participantStats[r.participantName].revenue += r.value;
  });

  workLogs.forEach(l => {
    if (!participantStats[l.participantName]) participantStats[l.participantName] = { revenue: 0, hours: 0 };
    participantStats[l.participantName].hours += l.hours;
  });

  const performerStats = Object.entries(participantStats)
    .map(([name, stats]) => ({
      name,
      revenue: stats.revenue,
      hours: stats.hours,
      efficiency: stats.hours > 0 ? stats.revenue / stats.hours : 0
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  const topPerformers = performerStats.slice(0, 5);
  const bottomPerformers = performerStats.filter(p => p.hours > 5).sort((a, b) => a.efficiency - b.efficiency).slice(0, 5);

  // 4. Customer Sources
  const customerSources: Record<string, number> = {};
  productionRecords.forEach(r => {
    const source = r.customer || "Unknown";
    customerSources[source] = (customerSources[source] || 0) + r.value;
  });

  // --- Generate AI Overview ---
  
  const env = getServerEnv();
  const openRouterApiKey = env.OPENROUTER_API_KEY;

  if (openRouterApiKey) {
    try {
      const prompt = `Analyze this recycling program's production data for leadership:

DATE RANGE: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}

DAILY REVENUE:
${JSON.stringify(dailyRevenue)}

MATERIAL MIX (% of total revenue):
${JSON.stringify(materialMixPercent)}

TOP PERFORMERS (Efficiency $/hr):
${JSON.stringify(topPerformers)}

BOTTOM PERFORMERS (Efficiency $/hr, >5 hrs worked):
${JSON.stringify(bottomPerformers)}

CUSTOMER SOURCES:
${JSON.stringify(customerSources)}

COMPARISON TO LAST PERIOD:
Current Revenue: $${totalRevenue}
Previous Revenue: $${prevTotalRevenue}
Trend: ${revenueTrend >= 0 ? "+" : ""}$${revenueTrend}

Provide an executive summary for program leadership that includes:

1. **Revenue Pattern Analysis**: What do you notice about the trend? Any spikes/drops? What's driving them?

2. **Material Mix Insights**: Any shifts in categories? Why might that be? Is this good or concerning?

3. **Efficiency Gaps**: Looking at top vs bottom performers, what opportunities exist? Be specific.

4. **Action Items**: 2-3 concrete things leadership should do this week.

Write for a nonprofit executive who understands the program but isn't technical. Be direct and actionable. Use bullet points.

IMPORTANT: Return ONLY Markdown formatted text. Do NOT use HTML tags like <p>, <ul>, <li>. Use standard Markdown syntax:
- Use ### for section headers (e.g. ### Revenue Pattern Analysis)
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
              totalRevenue,
              totalWeight: productionRecords.reduce((sum, r) => sum + r.weight, 0),
              totalHours: workLogs.reduce((sum, l) => sum + l.hours, 0),
              efficiency: workLogs.reduce((sum, l) => sum + l.hours, 0) > 0 ? totalRevenue / workLogs.reduce((sum, l) => sum + l.hours, 0) : 0,
              trendDirection: revenueTrend >= 0 ? 'up' : 'down',
              trendPercent: prevTotalRevenue > 0 ? Math.abs((revenueTrend / prevTotalRevenue) * 100) : 0,
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
      totalRevenue: productionRecords.reduce((sum, r) => sum + r.value, 0),
      totalWeight: productionRecords.reduce((sum, r) => sum + r.weight, 0),
      totalHours: workLogs.reduce((sum, l) => sum + l.hours, 0),
      efficiency: 0,
      trendDirection: 'up',
      trendPercent: 0,
    },
    generatedAt: new Date().toISOString(),
  });
};
