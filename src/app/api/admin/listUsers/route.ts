import { NextResponse } from "next/server";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export const GET = async () => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const snapshot = await getFirebaseAdminDb().collection("profiles").orderBy("displayName").get();
  const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...(doc.data() ?? {}) }));

  return NextResponse.json({ ok: true, users });
};
