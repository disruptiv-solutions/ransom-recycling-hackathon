import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";

const updateSchema = z.object({
  category: z.string().min(1).optional(),
  materialType: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
});

export const runtime = "nodejs";

export const PATCH = async (req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  await getFirebaseAdminDb().doc(`material_prices/${context.params.id}`).set(
    {
      ...parsed.data,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
};

export const DELETE = async (_req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  await getFirebaseAdminDb().doc(`material_prices/${context.params.id}`).delete();
  return NextResponse.json({ ok: true });
};
