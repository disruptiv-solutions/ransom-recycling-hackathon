import { notFound } from "next/navigation";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapAssessment, mapCertification, mapParticipant, mapProductionRecord, mapWorkLog } from "@/lib/ops/firestore";
import ParticipantProfile from "@/app/(ops)/participants/[id]/participant-profile-client";

export const runtime = "nodejs";

export default async function ParticipantProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) notFound();
  const db = getFirebaseAdminDb();
  const participantSnap = await db.doc(`participants/${resolvedParams.id}`).get();

  if (!participantSnap.exists) notFound();

  const participant = mapParticipant(participantSnap.id, participantSnap.data() ?? {});

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [workLogsSnap, productionSnap, certsSnap, assessmentSnap] = await Promise.all([
    db
      .collection("work_logs")
      .where("participantId", "==", resolvedParams.id)
      .where("workDate", ">=", thirtyDaysAgo)
      .get(),
    db
      .collection("production_records")
      .where("participantId", "==", resolvedParams.id)
      .where("productionDate", ">=", thirtyDaysAgo)
      .get(),
    db.collection("certifications").where("participantId", "==", resolvedParams.id).get(),
    db
      .collection("readiness_assessments")
      .where("participantId", "==", resolvedParams.id)
      .get(),
  ]);

  const workLogs = workLogsSnap.docs
    .map((doc) => mapWorkLog(doc.id, doc.data()))
    .sort((a, b) => (b.workDate ?? "").localeCompare(a.workDate ?? ""));
  const productionRecords = productionSnap.docs
    .map((doc) => mapProductionRecord(doc.id, doc.data()))
    .sort((a, b) => (b.productionDate ?? "").localeCompare(a.productionDate ?? ""));
  const certifications = certsSnap.docs.map((doc) => mapCertification(doc.id, doc.data()));
  const assessmentDoc = assessmentSnap.docs
    .map((doc) => mapAssessment(doc.id, doc.data()))
    .sort((a, b) => (b.generatedAt ?? "").localeCompare(a.generatedAt ?? ""))[0];
  const assessment = assessmentDoc ?? null;

  const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
  const totalRevenue = productionRecords.reduce((sum, record) => sum + record.value, 0);
  const expectedDays = 20;
  const attendanceRate = expectedDays > 0 ? Math.round((workLogs.length / expectedDays) * 100) : 0;
  const revenuePerHour = totalHours > 0 ? Number((totalRevenue / totalHours).toFixed(2)) : 0;

  const productionBreakdown = productionRecords.reduce<Record<string, { weight: number; value: number }>>(
    (acc, record) => {
      const key = `${record.materialCategory} - ${record.materialType}`;
      acc[key] = acc[key] ?? { weight: 0, value: 0 };
      acc[key].weight += record.weight;
      acc[key].value += record.value;
      return acc;
    },
    {},
  );

  const breakdownRows = Object.entries(productionBreakdown).map(([label, values]) => ({
    label,
    weight: Number(values.weight.toFixed(2)),
    value: Number(values.value.toFixed(2)),
  }));

  return (
    <ParticipantProfile
      participant={participant}
      metrics={{
        totalHours,
        attendanceRate,
        totalRevenue,
        revenuePerHour,
        daysInPhase: participant.entryDate
          ? Math.max(
              0,
              Math.floor((Date.now() - new Date(participant.entryDate).getTime()) / (1000 * 60 * 60 * 24)),
            )
          : 0,
      }}
      breakdownRows={breakdownRows}
      workLogs={workLogs}
      certifications={certifications}
      assessment={assessment}
    />
  );
}
