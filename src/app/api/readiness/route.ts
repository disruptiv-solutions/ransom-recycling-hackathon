import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const readinessSchema = z.object({
  participantId: z.string().min(1),
  metrics: z.object({
    totalHours: z.number(),
    attendanceRate: z.number(),
    totalRevenue: z.number(),
    revenuePerHour: z.number(),
    daysInPhase: z.number(),
  }),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = readinessSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { participantId, metrics } = parsed.data;

  const status =
    metrics.attendanceRate >= 90 && metrics.revenuePerHour >= 5
      ? "ready"
      : metrics.attendanceRate >= 80
        ? "watch"
        : "not_ready";

  const assessment =
    status === "ready"
      ? "Consistent attendance and strong productivity indicate readiness for advancement."
      : status === "watch"
        ? "Performance is trending in the right direction but needs continued consistency."
        : "Attendance and output remain below threshold. Prioritize coaching and support.";

  const recommendation =
    status === "ready"
      ? "Schedule a phase review and confirm certification progress."
      : status === "watch"
        ? "Increase check-ins and revisit weekly goals."
        : "Coordinate with supervisors to address barriers to attendance.";

  const docRef = getFirebaseAdminDb().collection("readiness_assessments").doc();
  await docRef.set(
    {
      participantId,
      status,
      assessment,
      recommendation,
      generatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({
    ok: true,
    assessment: {
      id: docRef.id,
      participantId,
      status,
      assessment,
      recommendation,
      generatedAt: new Date().toISOString(),
    },
  });
};
