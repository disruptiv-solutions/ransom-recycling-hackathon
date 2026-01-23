import { NextResponse } from "next/server";
import { z } from "zod";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

const bodySchema = z.object({
  idToken: z.string().min(1),
});

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { idToken } = parsed.data;

  // 14 days; adjust if your compliance policy requires shorter sessions.
  const expiresInMs = 14 * 24 * 60 * 60 * 1000;
  const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(idToken, {
    expiresIn: expiresInMs,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("__session", sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(expiresInMs / 1000),
  });

  return res;
};

