import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  entryDate: z.string().optional(),
  currentPhase: z.number().int().min(0).max(4).optional(),
  categories: z.array(z.string()).min(1).optional(),
  status: z.enum(["active", "staffing", "graduated", "exited"]).optional(),
});

export const runtime = "nodejs";

export const GET = async (_req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const doc = await getFirebaseAdminDb().doc(`participants/${context.params.id}`).get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, participant: { id: doc.id, ...(doc.data() ?? {}) } });
};

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

  if (parsed.data.entryDate) {
    updates.entryDate = Timestamp.fromDate(new Date(parsed.data.entryDate));
  }

  await getFirebaseAdminDb().doc(`participants/${context.params.id}`).set(updates, { merge: true });
  return NextResponse.json({ ok: true });
};

export const DELETE = async (_req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  await getFirebaseAdminDb().doc(`participants/${context.params.id}`).delete();
  return NextResponse.json({ ok: true });
};
