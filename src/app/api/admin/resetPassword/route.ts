import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";

const bodySchema = z.object({
  email: z.string().email(),
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
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const auth = getFirebaseAdminAuth();
    // Firebase Admin SDK doesn't send the email directly for password resets, 
    // it generates a link. We will generate the link and in a production app 
    // you might send it via your own email provider (SendGrid, etc.).
    // For now, we will use the standard generatePasswordResetLink.
    const link = await auth.generatePasswordResetLink(parsed.data.email);
    
    // In this context, we'll assume we want the standard Firebase behavior if possible,
    // but Admin SDK usually requires you to send the link yourself.
    // HOWEVER, many users just want to trigger the "official" reset email.
    // The Admin SDK doesn't have a "sendPasswordResetEmail" method like the Client SDK.
    // So we provide the link back to the admin to send manually, or log it.
    
    return NextResponse.json({ ok: true, link });
  } catch (err) {
    console.error("Failed to generate reset link:", err);
    return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 });
  }
};
