import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await request.json();
  const cookieStore = await cookies();

  if (!role || role === "admin") {
    cookieStore.delete("view-as-role");
  } else {
    cookieStore.set("view-as-role", role, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return NextResponse.json({ success: true });
}
