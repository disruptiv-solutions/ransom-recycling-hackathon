import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const updateSchema = z.object({
  materialCategory: z.string().min(1).optional(),
  materialType: z.string().min(1).optional(),
  weight: z.number().min(0.1).optional(),
  productionDate: z.string().optional(),
  customer: z.string().optional().nullable(),
  containerType: z.string().optional().nullable(),
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

  const db = getFirebaseAdminDb();
  const updates: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (parsed.data.productionDate) {
    updates.productionDate = Timestamp.fromDate(new Date(parsed.data.productionDate));
  }

  if (parsed.data.customer !== undefined) {
    updates.customer = parsed.data.customer?.trim() || null;
  }

  if (parsed.data.containerType !== undefined) {
    updates.containerType = parsed.data.containerType || null;
  }

  const shouldRecalculate =
    parsed.data.materialCategory || parsed.data.materialType || typeof parsed.data.weight === "number";

  if (shouldRecalculate) {
    const doc = await db.doc(`production_records/${context.params.id}`).get();
    const existing = doc.data() ?? {};
    const category = parsed.data.materialCategory ?? existing.materialCategory;
    const type = parsed.data.materialType ?? existing.materialType;
    const weight = typeof parsed.data.weight === "number" ? parsed.data.weight : Number(existing.weight ?? 0);

    let value = 0;
    let pricePerUnit = Number(existing.pricePerUnit ?? existing.price ?? 0);
    let unit: "lb" | "each" = existing.unit === "each" ? "each" : "lb";
    let role: string | undefined = typeof existing.role === "string" ? existing.role : undefined;
    const priceSnapshot = await db
      .collection("material_prices")
      .where("category", "==", category)
      .where("materialType", "==", type)
      .limit(1)
      .get();

    if (!priceSnapshot.empty) {
      const priceDoc = priceSnapshot.docs[0].data() ?? {};
      pricePerUnit =
        typeof priceDoc.pricePerUnit === "number" ? priceDoc.pricePerUnit : Number(priceDoc.price ?? 0);
      unit = priceDoc.unit === "each" ? "each" : "lb";
      role = typeof priceDoc.role === "string" ? priceDoc.role : role;
      value = Number((pricePerUnit * weight).toFixed(2));
    }
    updates.value = value;
    updates.pricePerUnit = pricePerUnit;
    updates.unit = unit;
    updates.role = role;
  }

  await db.doc(`production_records/${context.params.id}`).set(updates, { merge: true });
  return NextResponse.json({ ok: true });
};

export const DELETE = async (_req: Request, context: { params: { id: string } }) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  await getFirebaseAdminDb().doc(`production_records/${context.params.id}`).delete();
  return NextResponse.json({ ok: true });
};
