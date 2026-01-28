import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const updateSchema = z.object({
  role: z.string().min(1).optional(),
  hours: z.number().min(0.25).max(24).optional(),
  notes: z.string().optional().nullable(),
  workDate: z.string().optional(),
});

export const runtime = "nodejs";

export const PATCH = async (req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (parsed.data.workDate) {
    updates.workDate = Timestamp.fromDate(new Date(parsed.data.workDate));
  }

  await getFirebaseAdminDb().doc(`work_logs/${context.params.id}`).set(updates, { merge: true });
  return NextResponse.json({ ok: true });
};

export const DELETE = async (_req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  await getFirebaseAdminDb().doc(`work_logs/${context.params.id}`).delete();
  return NextResponse.json({ ok: true });
};
