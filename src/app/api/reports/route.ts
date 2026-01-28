import { NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const reportSchema = z.object({
  reportType: z.enum(["production", "outcomes", "environmental", "comprehensive"]),
  startDate: z.string(),
  endDate: z.string(),
  includeNarrative: z.boolean(),
  includeStories: z.boolean(),
  includeCharts: z.boolean(),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const db = getFirebaseAdminDb();
  const start = Timestamp.fromDate(new Date(parsed.data.startDate));
  const end = Timestamp.fromDate(new Date(parsed.data.endDate));

  const [participantsSnap, workLogsSnap, productionSnap, certsSnap] = await Promise.all([
    db.collection("participants").get(),
    db
      .collection("work_logs")
      .where("workDate", ">=", start)
      .where("workDate", "<=", end)
      .get(),
    db
      .collection("production_records")
      .where("productionDate", ">=", start)
      .where("productionDate", "<=", end)
      .get(),
    db
      .collection("certifications")
      .where("earnedDate", ">=", start)
      .where("earnedDate", "<=", end)
      .get(),
  ]);

  const participants = participantsSnap.docs.map((doc) => doc.data() ?? {});
  const workLogs = workLogsSnap.docs.map((doc) => doc.data() ?? {});
  const productionRecords = productionSnap.docs.map((doc) => doc.data() ?? {});

  const participantCount = participants.length;
  const phaseBreakdown = participants.reduce<Record<string, number>>((acc, participant) => {
    const phase = String(participant.currentPhase ?? "0");
    acc[phase] = (acc[phase] ?? 0) + 1;
    return acc;
  }, {});

  const totalWeight = productionRecords.reduce((sum, record) => sum + Number(record.weight ?? 0), 0);
  const revenue = productionRecords.reduce((sum, record) => sum + Number(record.value ?? 0), 0);
  const hours = workLogs.reduce((sum, log) => sum + Number(log.hours ?? 0), 0);
  const lbsDiverted = totalWeight;
  const certifications = certsSnap.size;
  const placements = participants.filter((p) => p.status === "graduated").length;
  const retention = participantCount > 0 ? Math.round((placements / participantCount) * 100) : 0;

  const revenueByParticipant = productionRecords.reduce<Record<string, number>>((acc, record) => {
    const name = String(record.participantName ?? "Participant");
    acc[name] = (acc[name] ?? 0) + Number(record.value ?? 0);
    return acc;
  }, {});
  const standout = Object.entries(revenueByParticipant).sort((a, b) => b[1] - a[1])[0];

  const stats = {
    participantCount,
    phaseBreakdown,
    totalWeight: Number(totalWeight.toFixed(2)),
    revenue: Number(revenue.toFixed(2)),
    hours: Number(hours.toFixed(2)),
    lbsDiverted: Number(lbsDiverted.toFixed(2)),
    certifications,
    placements,
    retention,
  };

  let narrative: string | null = null;
  if (parsed.data.includeNarrative) {
    const standoutLine =
      parsed.data.includeStories && standout
        ? `${standout[0]} led production with $${standout[1].toFixed(2)} in recovered value.`
        : "Participants showed measurable gains across attendance and productivity.";
    narrative = `From ${parsed.data.startDate} to ${parsed.data.endDate}, Ransom Recycling served ${participantCount} participants who logged ${hours.toFixed(
      0,
    )} hours of workforce training. The team processed ${totalWeight.toFixed(
      0,
    )} lbs of materials and generated $${revenue.toFixed(
      0,
    )} in revenue, demonstrating the connection between skills training and measurable recycling outcomes.\n\n${standoutLine} ${certifications} certifications were earned during the period, with ${placements} participants reaching placement or graduation milestones. This momentum reinforces the program’s ability to deliver both environmental impact and workforce stability.\n\nRansom’s operations now provide real-time visibility into production, attendance, and advancement readiness, allowing leadership to respond faster and funders to see the tangible outcomes of each investment.`;
  }

  return NextResponse.json({
    ok: true,
    report: {
      title: `${parsed.data.reportType.toUpperCase()} Report`,
      generatedAt: new Date().toISOString(),
      stats,
      narrative,
    },
  });
};
