import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdminDb, getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/roles";

const bodySchema = z.object({
  targetUid: z.string().min(1),
  role: z.enum(["participant", "supervisor", "case_manager", "admin"]).optional(),
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const sessionProfile = await getSessionProfile();
  if (!sessionProfile || sessionProfile.originalRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { targetUid, role, displayName, email } = parsed.data;

  try {
    const db = getFirebaseAdminDb();
    const auth = getFirebaseAdminAuth();

    // 1. Update Firebase Auth (Email & Display Name)
    const authUpdate: any = {};
    if (displayName) authUpdate.displayName = displayName;
    if (email) authUpdate.email = email;

    if (Object.keys(authUpdate).length > 0) {
      await auth.updateUser(targetUid, authUpdate);
    }

    // 2. Update Firestore Profile
    const profileUpdate: any = { updatedAt: new Date() };
    if (role) profileUpdate.role = role;
    if (displayName) profileUpdate.displayName = displayName;
    if (email) profileUpdate.email = email;

    await db.doc(`profiles/${targetUid}`).set(profileUpdate, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update user:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
};
