import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getServerDemoMode } from "@/lib/demo-mode-server";
import { mapProductionRecord } from "@/lib/ops/firestore";

const createSchema = z.object({
  participantId: z.string().min(1),
  materialCategory: z.string().min(1),
  materialType: z.string().min(1),
  weight: z.number().min(0.1),
  productionDate: z.string(),
  customer: z.string().optional().nullable(),
  containerType: z.string().optional().nullable(),
});

export const runtime = "nodejs";

export const GET = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const isDemoMode = await getServerDemoMode();
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const participantId = searchParams.get("participantId");

  let query: FirebaseFirestore.Query = getFirebaseAdminDb().collection("production_records");
  if (start && end) {
    query = query
      .where("productionDate", ">=", Timestamp.fromDate(new Date(start)))
      .where("productionDate", "<=", Timestamp.fromDate(new Date(end)));
  }
  if (participantId) query = query.where("participantId", "==", participantId);

  const snapshot = await query.get();
  const mappedRecords = snapshot.docs.map((doc) => mapProductionRecord(doc.id, doc.data()));
  const productionRecords = isDemoMode
    ? mappedRecords
    : mappedRecords.filter((record) => !record.isMock);

  return NextResponse.json({ ok: true, productionRecords });
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

  let value = 0;
  let unit: "lb" | "each" = "lb";
  let pricePerUnit = 0;
  let role: string | undefined;
  const priceSnapshot = await db
    .collection("material_prices")
    .where("category", "==", parsed.data.materialCategory)
    .where("materialType", "==", parsed.data.materialType)
    .limit(1)
    .get();

  if (!priceSnapshot.empty) {
    const priceDoc = priceSnapshot.docs[0].data() ?? {};
    pricePerUnit =
      typeof priceDoc.pricePerUnit === "number" ? priceDoc.pricePerUnit : Number(priceDoc.price ?? 0);
    unit = priceDoc.unit === "each" ? "each" : "lb";
    role = typeof priceDoc.role === "string" ? priceDoc.role : undefined;
    value = Number((pricePerUnit * parsed.data.weight).toFixed(2));
  }

  const docRef = db.collection("production_records").doc();
  const productionDate = Timestamp.fromDate(new Date(parsed.data.productionDate));

  await docRef.set(
    {
      ...parsed.data,
      participantName,
      role,
      unit,
      pricePerUnit,
      value,
      customer: parsed.data.customer?.trim() || null,
      containerType: parsed.data.containerType || null,
      productionDate,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, id: docRef.id, value });
};
