import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const bodySchema = z.object({
  participantId: z.string().min(1),
  supervisorId: z.string().optional().nullable(),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const session = await getSessionProfile();
  if (!session || session.role !== "case_manager") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { participantId, supervisorId } = parsed.data;

  const db = getFirebaseAdminDb();
  const participantProfileSnap = await db.doc(`profiles/${participantId}`).get();
  if (!participantProfileSnap.exists) {
    return NextResponse.json({ ok: false, error: "Participant not found" }, { status: 404 });
  }

  const participantProfile = participantProfileSnap.data() as any;
  const assignedCaseManagerId = typeof participantProfile?.caseManagerId === "string" ? participantProfile.caseManagerId : null;
  if (!assignedCaseManagerId || assignedCaseManagerId !== session.uid) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  update.supervisorId = supervisorId ? supervisorId : FieldValue.delete();

  await db.doc(`profiles/${participantId}`).set(update, { merge: true });

  return NextResponse.json({ ok: true });
};

