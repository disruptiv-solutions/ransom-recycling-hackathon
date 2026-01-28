import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const participantSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  entryDate: z.string(),
  currentPhase: z.number().int().min(0).max(4),
  categories: z.array(z.string()).min(1),
  status: z.enum(["active", "staffing", "graduated", "exited"]),
});

export const runtime = "nodejs";

export const GET = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const phase = searchParams.get("phase");
  const search = searchParams.get("search");

  const snapshot = await getFirebaseAdminDb().collection("participants").orderBy("name").get();
  const participants = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() ?? {}) }));

  const filtered = participants.filter((participant) => {
    if (status && participant.status !== status) return false;
    if (phase && Number(participant.currentPhase) !== Number(phase)) return false;
    if (search) {
      const normalized = String(participant.name ?? "").toLowerCase();
      if (!normalized.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return NextResponse.json({ ok: true, participants: filtered });
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = participantSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const db = getFirebaseAdminDb();
  const docRef = db.collection("participants").doc();
  const entryDate = Timestamp.fromDate(new Date(parsed.data.entryDate));

  const payload = {
    ...parsed.data,
    entryDate,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(payload, { merge: true });

  return NextResponse.json({ ok: true, id: docRef.id });
};
