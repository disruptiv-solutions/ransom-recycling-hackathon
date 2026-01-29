import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapMaterialPrice } from "@/lib/ops/firestore";
import { getSessionProfile } from "@/lib/auth/session";

const createSchema = z.object({
  category: z.string().min(1),
  materialType: z.string().min(1),
  pricePerUnit: z.number().min(0),
  unit: z.enum(["lb", "each"]).optional(),
  role: z.string().min(1).optional(),
});

export const runtime = "nodejs";

export const GET = async () => {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const snapshot = await getFirebaseAdminDb().collection("material_prices").orderBy("category").get();
  const prices = snapshot.docs.map((doc) => mapMaterialPrice(doc.id, doc.data()));
  return NextResponse.json({ ok: true, prices });
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const docRef = getFirebaseAdminDb().collection("material_prices").doc();
  await docRef.set(
    {
      ...parsed.data,
      unit: parsed.data.unit ?? "lb",
      role: parsed.data.role ?? "processing",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return NextResponse.json({ ok: true, id: docRef.id });
};
