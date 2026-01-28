import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const createSchema = z.object({
  participantId: z.string().min(1),
  role: z.string().min(1),
  hours: z.number().min(0.25).max(24),
  notes: z.string().optional().nullable(),
  workDate: z.string(),
});

export const runtime = "nodejs";

export const GET = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const participantId = searchParams.get("participantId");
  const role = searchParams.get("role");

  let query: FirebaseFirestore.Query = getFirebaseAdminDb().collection("work_logs");

  if (start && end) {
    query = query
      .where("workDate", ">=", Timestamp.fromDate(new Date(start)))
      .where("workDate", "<=", Timestamp.fromDate(new Date(end)));
  }
  if (participantId) query = query.where("participantId", "==", participantId);
  if (role) query = query.where("role", "==", role);

  const snapshot = await query.orderBy("workDate", "desc").get();
  const workLogs = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() ?? {}) }));

  return NextResponse.json({ ok: true, workLogs });
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const db = getFirebaseAdminDb();
  const participantSnap = await db.doc(`participants/${parsed.data.participantId}`).get();
  const participantName = participantSnap.exists
    ? String(participantSnap.data()?.name ?? "Unknown")
    : "Unknown";

  const docRef = db.collection("work_logs").doc();
  const workDate = Timestamp.fromDate(new Date(parsed.data.workDate));

  await docRef.set(
    {
      ...parsed.data,
      participantName,
      workDate,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, id: docRef.id });
};
