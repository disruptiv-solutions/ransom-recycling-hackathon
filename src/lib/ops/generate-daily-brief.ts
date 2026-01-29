import { 
  getParticipantData, 
  getWorkLogData, 
  getProductionData, 
  getUnreadAlerts, 
  getTodaySchedule, 
  getComparisons 
} from "@/lib/ops/daily-brief";
import { getServerDemoMode } from "@/lib/demo-mode-server";
import { getServerEnv } from "@/lib/env/server";

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

export async function generateDailyBrief(date: Date = new Date()) {
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
- Format as HTML with proper paragraphs and sections

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
        }),
      });

      if (!response.ok) {
        console.error("AI API Error:", await response.text());
        throw new Error("Failed to generate brief");
      }

      const data = await response.json();
      briefText = data.choices?.[0]?.message?.content || briefText;
    } catch (error) {
      console.error("AI Generation Error:", error);
    }
  }

  const metrics = {
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
  };

  return {
    brief: briefText,
    metrics,
    generatedAt: new Date().toISOString(),
    date: date.toISOString(),
  };
}
