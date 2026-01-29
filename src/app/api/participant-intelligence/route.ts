import { NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerEnv } from "@/lib/env/server";
import { mapParticipant, mapWorkLog, mapProductionRecord } from "@/lib/ops/firestore";

const intelligenceSchema = z.object({
  participantId: z.string().min(1),
});

export const runtime = "nodejs";

async function getMetrics(participantId: string, daysBack: number, offsetDays: number = 0) {
  const db = getFirebaseAdminDb();
  const start = new Date();
  start.setDate(start.getDate() - (daysBack + offsetDays));
  const end = new Date();
  end.setDate(end.getDate() - offsetDays);

  const [workLogsSnap, productionSnap] = await Promise.all([
    db.collection("work_logs")
      .where("participantId", "==", participantId)
      .where("workDate", ">=", Timestamp.fromDate(start))
      .where("workDate", "<=", Timestamp.fromDate(end))
      .get(),
    db.collection("production_records")
      .where("participantId", "==", participantId)
      .where("productionDate", ">=", Timestamp.fromDate(start))
      .where("productionDate", "<=", Timestamp.fromDate(end))
      .get(),
  ]);

  const workLogs = workLogsSnap.docs.map(doc => mapWorkLog(doc.id, doc.data()));
  const production = productionSnap.docs.map(doc => mapProductionRecord(doc.id, doc.data()));

  const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
  const totalRevenue = production.reduce((sum, record) => sum + record.value, 0);
  const totalWeight = production.reduce((sum, record) => sum + record.weight, 0);
  
  // Assuming 5 days a week, 4 weeks = 20 days
  const expectedDays = Math.min(20, daysBack); 
  const attendanceRate = expectedDays > 0 ? Math.round((workLogs.length / expectedDays) * 100) : 0;
  const productivity = totalHours > 0 ? totalRevenue / totalHours : 0;

  const materialMix = production.reduce((acc, record) => {
    const role = record.role || "Unknown";
    acc[role] = (acc[role] || 0) + record.value;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalHours,
    totalRevenue,
    totalWeight,
    attendanceRate,
    productivity,
    materialMix,
    count: workLogs.length
  };
}

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = intelligenceSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { participantId } = parsed.data;
  const db = getFirebaseAdminDb();

  // 1. Fetch Participant & Cohort
  const participantSnap = await db.doc(`participants/${participantId}`).get();
  if (!participantSnap.exists) {
    return NextResponse.json({ ok: false, error: "Participant not found" }, { status: 404 });
  }
  const participant = mapParticipant(participantSnap.id, participantSnap.data()!);

  // 2. Fetch Metrics (Current vs Previous)
  const [currentMetrics, prevMetrics, cohortSnap, certsSnap] = await Promise.all([
    getMetrics(participantId, 30),
    getMetrics(participantId, 30, 30),
    db.collection("participants")
      .where("currentPhase", "==", participant.currentPhase)
      .where("status", "==", "active")
      .get(),
    db.collection("certifications").where("participantId", "==", participantId).get(),
  ]);

  const cohortParticipants = cohortSnap.docs.map(doc => mapParticipant(doc.id, doc.data()));
  const certifications = certsSnap.size;

  // 3. Prepare AI Prompts
  const env = getServerEnv();
  const openRouterApiKey = env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    return NextResponse.json({ ok: false, error: "AI API key not configured" }, { status: 500 });
  }

  const daysInPhase = participant.entryDate
    ? Math.floor((Date.now() - new Date(participant.entryDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const commonContext = `
PARTICIPANT: ${participant.name}
PHASE: ${participant.currentPhase} (Day ${daysInPhase}/90)
LAST 30 DAYS:
- Hours: ${currentMetrics.totalHours}
- Attendance: ${currentMetrics.attendanceRate}% (expected 80%+)
- Revenue: $${currentMetrics.totalRevenue.toFixed(2)}
- Productivity: $${currentMetrics.productivity.toFixed(2)}/hr
- Certifications: ${certifications}
- Material Mix: ${JSON.stringify(currentMetrics.materialMix)}

PREVIOUS 30 DAYS:
- Attendance: ${prevMetrics.attendanceRate}%
- Productivity: $${prevMetrics.productivity.toFixed(2)}/hr

COHORT SIZE: ${cohortParticipants.length}
`;

  try {
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{
          role: "user",
          content: `You are a workforce development AI advisor. Analyze this participant data and provide 4 specific modules of intelligence.

${commonContext}

PHASE 3 REQUIREMENTS (if applicable):
- 85%+ attendance
- $8+/hr productivity
- 1+ certification

YOUR TASK:
Provide a JSON object with exactly these 4 keys:

1. "snapshot": {
   "status": "EXCELLING" | "ON TRACK" | "NEEDS ATTENTION" | "CRITICAL",
   "narrative": "3-paragraph synthesis of health, concerns, and strengths.",
   "actions": ["action 1", "action 2", "action 3"]
}

2. "advancement": {
   "onTrack": boolean,
   "projectedDay": number,
   "riskLevel": "LOW" | "MEDIUM" | "HIGH",
   "confidence": number,
   "gaps": ["gap 1", "gap 2"],
   "requirements": ["req 1", "req 2"]
}

3. "peerContext": {
   "productivityRank": "TOP_THIRD" | "MIDDLE_THIRD" | "BOTTOM_THIRD",
   "attendanceRank": "TOP_THIRD" | "MIDDLE_THIRD" | "BOTTOM_THIRD",
   "analysis": "2-3 sentences comparing them to the cohort.",
   "similarProfile": "Name of a similar past profile or 'None'"
}

4. "production": {
   "specialization": "Primary focus area",
   "efficiency": "Efficiency pattern (e.g. Morning vs Afternoon)",
   "opportunity": "Specific cross-training recommendation",
   "analysis": "2-3 paragraphs on production patterns."
}

Return ONLY valid JSON.`
        }],
        response_format: { type: "json_object" }
      }),
    });

    const aiData = await aiResponse.json();
    const intelligence = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json({
      ok: true,
      ...intelligence,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Intelligence Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to generate AI intelligence" }, { status: 500 });
  }
};
