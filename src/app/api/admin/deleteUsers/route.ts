import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";

const bodySchema = z.object({
  uids: z.array(z.string().min(1)).min(1),
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

  const { uids } = parsed.data;
  if (uids.includes(sessionProfile.uid)) {
    return NextResponse.json(
      { ok: false, error: "You can't delete your own Super Admin account." },
      { status: 400 },
    );
  }

  const auth = getFirebaseAdminAuth();
  const db = getFirebaseAdminDb();

  const results = await Promise.allSettled(
    uids.map(async (uid) => {
      // Delete Auth user first; if it doesn't exist, still try to delete profile.
      try {
        await auth.deleteUser(uid);
      } catch (e: any) {
        const msg = typeof e?.message === "string" ? e.message : "";
        const code = typeof e?.code === "string" ? e.code : "";
        // Ignore if already deleted in auth
        if (!code.includes("auth/user-not-found") && !msg.toLowerCase().includes("user-not-found")) {
          throw e;
        }
      }

      await db.doc(`profiles/${uid}`).delete().catch(() => null);
      return { uid };
    }),
  );

  const failed = results
    .map((r, idx) => ({ r, uid: uids[idx] }))
    .filter((x) => x.r.status === "rejected")
    .map((x) => ({
      uid: x.uid,
      error: (x.r as PromiseRejectedResult).reason?.message || "Delete failed",
    }));

  if (failed.length > 0) {
    return NextResponse.json({ ok: false, error: "Some deletions failed.", failed }, { status: 207 });
  }

  return NextResponse.json({ ok: true });
};

