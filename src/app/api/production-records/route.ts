import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const createSchema = z.object({
  participantId: z.string().min(1),
  materialCategory: z.string().min(1),
  materialType: z.string().min(1),
  weight: z.number().min(0.1),
  productionDate: z.string(),
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

  let query: FirebaseFirestore.Query = getFirebaseAdminDb().collection("production_records");
  if (start && end) {
    query = query
      .where("productionDate", ">=", Timestamp.fromDate(new Date(start)))
      .where("productionDate", "<=", Timestamp.fromDate(new Date(end)));
  }
  if (participantId) query = query.where("participantId", "==", participantId);

  const snapshot = await query.orderBy("productionDate", "desc").get();
  const productionRecords = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() ?? {}) }));

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
  const priceSnapshot = await db
    .collection("material_prices")
    .where("category", "==", parsed.data.materialCategory)
    .where("materialType", "==", parsed.data.materialType)
    .limit(1)
    .get();

  if (!priceSnapshot.empty) {
    const price = Number(priceSnapshot.docs[0].data()?.price ?? 0);
    value = Number((price * parsed.data.weight).toFixed(2));
  }

  const docRef = db.collection("production_records").doc();
  const productionDate = Timestamp.fromDate(new Date(parsed.data.productionDate));

  await docRef.set(
    {
      ...parsed.data,
      participantName,
      value,
      productionDate,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, id: docRef.id, value });
};
