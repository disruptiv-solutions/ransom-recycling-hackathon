import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const createSchema = z.object({
  participantId: z.string().min(1),
  certType: z.string().min(2),
  earnedDate: z.string(),
  expirationDate: z.string().nullable().optional(),
});

export const runtime = "nodejs";

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

  const docRef = getFirebaseAdminDb().collection("certifications").doc();

  await docRef.set(
    {
      participantId: parsed.data.participantId,
      certType: parsed.data.certType,
      earnedDate: Timestamp.fromDate(new Date(parsed.data.earnedDate)),
      expirationDate: parsed.data.expirationDate
        ? Timestamp.fromDate(new Date(parsed.data.expirationDate))
        : null,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, id: docRef.id });
};
