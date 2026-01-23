import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";
import type { AppRole } from "@/lib/auth/roles";

const bodySchema = z.object({
  role: z.enum(["participant", "case_manager", "supervisor"]),
  email: z.string().email(),
  displayName: z.string().min(2),
  caseManagerId: z.string().min(1).optional(),
  supervisorId: z.string().min(1).optional(),
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

  const { role, email, displayName, caseManagerId, supervisorId } = parsed.data;

  if (role === "participant" && (!caseManagerId || !supervisorId)) {
    return NextResponse.json({ ok: false, error: "Participant requires caseManagerId and supervisorId." }, { status: 400 });
  }

  try {
    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminDb();

    // Temporary password: user will set their own via reset link.
    const tempPassword = crypto.randomBytes(18).toString("base64url");

    const user = await auth.createUser({
      email,
      password: tempPassword,
      displayName,
    });

    const profileData: Record<string, unknown> = {
      role: role as AppRole,
      email,
      displayName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (role === "participant") {
      profileData.caseManagerId = caseManagerId;
      profileData.supervisorId = supervisorId;
    }

    await db.doc(`profiles/${user.uid}`).set(profileData, { merge: true });

    if (role === "participant") {
      await db.doc(`participants/${user.uid}`).set(
        {
          userId: user.uid,
          intakeStatus: "incomplete",
          intake: {},
          intakeUpdatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    const resetLink = await auth.generatePasswordResetLink(email);

    return NextResponse.json({
      ok: true,
      uid: user.uid,
      email,
      role,
      resetLink,
    });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Failed to create user";
    // Handle common Firebase Admin error
    if (typeof err?.code === "string" && err.code.includes("email-already-exists")) {
      return NextResponse.json({ ok: false, error: "That email is already in use." }, { status: 409 });
    }
    console.error("createUser failed:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
};

