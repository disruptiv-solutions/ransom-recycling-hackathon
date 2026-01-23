import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const bodySchema = z.object({
  participantId: z.string().min(1),
  caseManagerId: z.string().optional().nullable(),
  supervisorId: z.string().optional().nullable(),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const sessionProfile = await getSessionProfile();
  if (!sessionProfile || sessionProfile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { participantId, caseManagerId, supervisorId } = parsed.data;

  const db = getFirebaseAdminDb();

  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (typeof caseManagerId !== "undefined") {
    update.caseManagerId = caseManagerId || FieldValue.delete();
  }

  if (typeof supervisorId !== "undefined") {
    update.supervisorId = supervisorId || FieldValue.delete();
  }

  await db.doc(`profiles/${participantId}`).set(update, { merge: true });

  return NextResponse.json({ ok: true });
};

