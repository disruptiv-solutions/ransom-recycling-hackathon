import { NextResponse } from "next/server";

import { getSessionProfile, getSessionUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export const GET = async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ authenticated: false }, { status: 401 });

  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json(
      { authenticated: true, provisioned: false, uid: sessionUser.uid },
      { status: 409 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    provisioned: true,
    uid: profile.uid,
    role: profile.role,
    displayName: profile.displayName ?? null,
  });
};

