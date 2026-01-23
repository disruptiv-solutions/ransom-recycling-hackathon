import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const intakePayloadSchema = z.object({
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  goals: z.string().optional(),
  barriers: z.string().optional(),
  notes: z.string().optional(),
});

type IntakePayload = z.infer<typeof intakePayloadSchema>;
type IntakeStatus = "incomplete" | "in_progress" | "complete";

const canAccessParticipantIntake = async (participantId: string) => {
  const session = await getSessionProfile();
  if (!session) return { ok: false as const, status: 401 as const, error: "Unauthorized" };

  if (session.originalRole === "admin") {
    return { ok: true as const, session };
  }

  if (session.role !== "case_manager") {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }

  const profileSnap = await getFirebaseAdminDb().doc(`profiles/${participantId}`).get();
  if (!profileSnap.exists) return { ok: false as const, status: 404 as const, error: "Participant not found" };

  const data = profileSnap.data() as any;
  const assignedCaseManagerId = typeof data?.caseManagerId === "string" ? data.caseManagerId : null;
  if (!assignedCaseManagerId || assignedCaseManagerId !== session.uid) {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }

  return { ok: true as const, session };
};

const ensureParticipantDoc = async (participantId: string) => {
  const db = getFirebaseAdminDb();
  const ref = db.doc(`participants/${participantId}`);
  const snap = await ref.get();

  if (snap.exists) return { ref, snap };

  await ref.set(
    {
      userId: participantId,
      intakeStatus: "incomplete",
      intake: {},
      intakeUpdatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const fresh = await ref.get();
  return { ref, snap: fresh };
};

export const GET = async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  const authz = await canAccessParticipantIntake(id);
  if (!authz.ok) return NextResponse.json({ ok: false, error: authz.error }, { status: authz.status });

  const { snap } = await ensureParticipantDoc(id);
  const data = snap.data() as any;

  const intakeStatus = (data?.intakeStatus as IntakeStatus | undefined) ?? "incomplete";
  const intake = (data?.intake as IntakePayload | undefined) ?? {};
  const intakeUpdatedAtLabel =
    data?.intakeUpdatedAt && typeof data?.intakeUpdatedAt?.toDate === "function"
      ? data.intakeUpdatedAt.toDate().toISOString()
      : null;

  return NextResponse.json({
    ok: true,
    participantId: id,
    intakeStatus,
    intake,
    intakeUpdatedAt: intakeUpdatedAtLabel,
  });
};

export const POST = async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  const authz = await canAccessParticipantIntake(id);
  if (!authz.ok) return NextResponse.json({ ok: false, error: authz.error }, { status: authz.status });

  const json = await req.json().catch(() => null);
  const parsed = intakePayloadSchema.safeParse(json?.intake ?? json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { ref, snap } = await ensureParticipantDoc(id);
  const prev = snap.data() as any;
  const prevStatus = (prev?.intakeStatus as IntakeStatus | undefined) ?? "incomplete";
  const nextStatus: IntakeStatus = prevStatus === "incomplete" ? "in_progress" : prevStatus;

  await ref.set(
    {
      intake: parsed.data,
      intakeStatus: nextStatus,
      intakeUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, participantId: id, intakeStatus: nextStatus });
};

export const PUT = async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  const authz = await canAccessParticipantIntake(id);
  if (!authz.ok) return NextResponse.json({ ok: false, error: authz.error }, { status: authz.status });

  const { ref } = await ensureParticipantDoc(id);

  await ref.set(
    {
      intakeStatus: "complete",
      intakeUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, participantId: id, intakeStatus: "complete" });
};

