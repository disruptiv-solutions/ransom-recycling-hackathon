import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const POST = async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("__session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
};

