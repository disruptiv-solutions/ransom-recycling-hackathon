import { cookies } from "next/headers";
import { cache } from "react";

import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";
import type { AppRole } from "@/lib/auth/roles";

export type SessionUser = {
  uid: string;
  email: string | null;
};

export type SessionProfile = {
  uid: string;
  role: AppRole;
  originalRole: AppRole;
  displayName?: string | null;
  photoURL?: string | null;
};

const SESSION_COOKIE_NAME = "__session";

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
};

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const profileSnap = await getFirebaseAdminDb()
    .doc(`profiles/${sessionUser.uid}`)
    .get();
  if (!profileSnap.exists) return null;

  const data = profileSnap.data() ?? {};
  const originalRole = data.role as AppRole | undefined;
  if (!originalRole) return null;

  let role = originalRole;

  // Handle superadmin view-as impersonation
  if (originalRole === "admin") {
    const cookieStore = await cookies();
    const viewAsRole = cookieStore.get("view-as-role")?.value as AppRole | undefined;
    if (viewAsRole) {
      role = viewAsRole;
    }
  }

  return {
    uid: sessionUser.uid,
    role,
    originalRole,
    displayName: typeof data.displayName === "string" ? data.displayName : null,
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
  };
});

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

