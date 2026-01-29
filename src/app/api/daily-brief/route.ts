import { NextResponse } from "next/server";
import { 
  getParticipantData, 
  getWorkLogData, 
  getProductionData, 
  getUnreadAlerts, 
  getTodaySchedule, 
  getComparisons 
} from "@/lib/ops/daily-brief";
import { getServerDemoMode } from "@/lib/demo-mode-server";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";

function calculateProgramHealth(data: {
  attendanceRate: number;
  revenueVsTarget: number;
  atRiskCount: number;
}): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CONCERNING' {
  const { attendanceRate, revenueVsTarget, atRiskCount } = data;
  
  if (attendanceRate >= 90 && revenueVsTarget >= 95 && atRiskCount <= 2) {
    return 'EXCELLENT';
  }
  if (attendanceRate >= 80 && revenueVsTarget >= 85 && atRiskCount <= 5) {
    return 'GOOD';
  }
  if (attendanceRate >= 70 && revenueVsTarget >= 75 && atRiskCount <= 8) {
    return 'FAIR';
  }
  return 'CONCERNING';
}

export async function POST(req: Request) {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { date: dateString } = await req.json().catch(() => ({ date: new Date().toISOString() }));
  const date = new Date(dateString);
  const isDemoMode = await getServerDemoMode();

  // Fetch all data (parallel queries)
  const participantsData = await getParticipantData(isDemoMode);
  
  const [
    workLogs,
    production,
    alerts,
    schedule,
  ] = await Promise.all([
    getWorkLogData(date, isDemoMode, participantsData.all),
    getProductionData(date, isDemoMode),
    getUnreadAlerts(),
    getTodaySchedule(date),
  ]);

  const comparisons = await getComparisons(production.totalRevenue, workLogs.attendanceRate);

  // Prepare the synthesis
  const env = getServerEnv();
  const openRouterApiKey = env.OPENROUTER_API_KEY;
  
  let briefText = "AI analysis unavailable. Please check configuration.";

  if (openRouterApiKey) {
    try {
      const prompt = `You are the operations intelligence system for a nonprofit recycling 
workforce development program. Generate a daily executive brief for program leadership.

TODAY: ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

=== PARTICIPANT DATA ===
Total Active: ${participantsData.total}
Phase Breakdown: ${JSON.stringify(participantsData.byPhase)}
At-Risk (attendance <80% or productivity decline >30%): 
${JSON.stringify(participantsData.atRisk.map(p => ({ name: p.name, status: p.status })))}
Ready to Advance (>85 days in phase, strong metrics):
${JSON.stringify(participantsData.readyToAdvance.map(p => ({ name: p.name, phase: p.currentPhase })))}

=== WORK LOGS (Last 7 Days) ===
Total Hours: ${workLogs.totalHours}
Attendance Rate: ${workLogs.attendanceRate}%
Role Distribution: ${JSON.stringify(workLogs.byRole)}
Staffing Gaps: ${JSON.stringify(workLogs.gaps)}
Attendance Trends: ${JSON.stringify(workLogs.trends)}

=== PRODUCTION (Last 7 Days) ===
Revenue: $${production.totalRevenue}
Materials Processed: ${production.totalWeight} lbs
Daily Revenue: ${JSON.stringify(production.dailyBreakdown)}
Material Mix: ${JSON.stringify(production.materialMix)}
Top Performers: ${JSON.stringify(production.topPerformers.slice(0, 3))}

=== ALERTS (Unread) ===
High Priority: ${alerts.high.length} (${alerts.high.map(a => a.message).join('; ')})
Medium Priority: ${alerts.medium.length}
Low Priority: ${alerts.low.length}

=== TODAY'S SCHEDULE ===
Morning Shift Coverage: ${JSON.stringify(schedule.shifts.filter(s => s.period === 'morning'))}
Afternoon Shift Coverage: ${JSON.stringify(schedule.shifts.filter(s => s.period === 'afternoon'))}
Scheduled Pickups: ${JSON.stringify(schedule.pickups)}

=== COMPARISONS ===
vs Last Week: ${JSON.stringify(comparisons.vsLastWeek)}
vs Weekly Target: ${JSON.stringify(comparisons.vsTarget)}
Emerging Patterns: ${JSON.stringify(comparisons.trends)}

YOUR TASK:
Write a daily executive brief that synthesizes this data into actionable intelligence.

STRUCTURE:
1. **Program Health Summary** (1 line): Overall status (EXCELLENT/GOOD/FAIR/CONCERNING) 
   with direction indicator vs last week

2. **Critical Attention** (2-3 items max): Issues requiring IMMEDIATE action today
   - Be specific: names, numbers, context
   - Explain WHY it's critical
   - Suggest WHAT to do

3. **Positive Momentum** (1-2 items): Good news, wins, opportunities
   - Specific achievements or milestones
   - People to recognize

4. **This Week's Pattern** (1-2 items): Trends or recurring issues
   - Must span multiple days/data sources
   - Connect dots (e.g., "low attendance + understaffing = production drop")

5. **Top Priority Today** (3 items max): Numbered action list
   - Concrete, doable today
   - Ordered by urgency

6. **Weekly Forecast** (1 sentence): Will we hit targets? What's needed?

CRITICAL RULES:
- Connect disparate data points (participant attendance → production impact)
- Use specific names and numbers (not "some people" but "Devon Roberts")
- Identify ROOT CAUSES not just symptoms
- Be direct and actionable
- Write conversationally (like a smart colleague briefing you)
- Keep under 350 words
- Don't use markdown headers or bullets (prose is fine, but we'll format)

Example of good synthesis:
❌ "Attendance is low" 
✅ "Devon Roberts missed 3 days (60% attendance) and hasn't called. 
    Last logged Monday 8am. Combined with James's productivity drop, 
    your Processing team is down 2 effective workers - this explains 
    yesterday's 40% revenue decline."

Begin with: "Good morning. Here's what you need to know today:"`;

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
          brief: "Error generating brief.",
          metrics: {
            programHealth: calculateProgramHealth({
              attendanceRate: workLogs.attendanceRate,
              revenueVsTarget: comparisons.vsTarget.revenuePercent,
              atRiskCount: participantsData.atRisk.length,
            }),
            criticalAlerts: alerts.high.length,
            totalParticipants: participantsData.total,
            weekRevenue: production.totalRevenue,
            weeklyTarget: comparisons.vsTarget.target,
            onTrackForTarget: comparisons.vsTarget.revenuePercent >= 90,
          },
          generatedAt: new Date().toISOString(),
          data: {
            participants: participantsData,
            workLogs,
            production,
            alerts,
            schedule,
            comparisons
          }
        });
      }

      // Create a ReadableStream to stream data + text
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          // 1. Send the data payload first
          const dataPayload = JSON.stringify({
            type: "data",
            metrics: {
              programHealth: calculateProgramHealth({
                attendanceRate: workLogs.attendanceRate,
                revenueVsTarget: comparisons.vsTarget.revenuePercent,
                atRiskCount: participantsData.atRisk.length,
              }),
              criticalAlerts: alerts.high.length,
              totalParticipants: participantsData.total,
              weekRevenue: production.totalRevenue,
              weeklyTarget: comparisons.vsTarget.target,
              onTrackForTarget: comparisons.vsTarget.revenuePercent >= 90,
            },
            generatedAt: new Date().toISOString(),
            data: {
              participants: participantsData,
              workLogs,
              production,
              alerts,
              schedule,
              comparisons
            }
          });
          controller.enqueue(encoder.encode(dataPayload + "\n"));

          // 2. Stream the AI text chunks
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
                    // Ignore parse errors
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
      // Fallback response
    }
  }

  // Fallback if no API key or error occurred
  return NextResponse.json({
    brief: briefText,
    metrics: {
      programHealth: calculateProgramHealth({
        attendanceRate: workLogs.attendanceRate,
        revenueVsTarget: comparisons.vsTarget.revenuePercent,
        atRiskCount: participantsData.atRisk.length,
      }),
      criticalAlerts: alerts.high.length,
      totalParticipants: participantsData.total,
      weekRevenue: production.totalRevenue,
      weeklyTarget: comparisons.vsTarget.target,
      onTrackForTarget: comparisons.vsTarget.revenuePercent >= 90,
    },
    generatedAt: new Date().toISOString(),
    data: {
      participants: participantsData,
      workLogs,
      production,
      alerts,
      schedule,
      comparisons
    }
  });
}
