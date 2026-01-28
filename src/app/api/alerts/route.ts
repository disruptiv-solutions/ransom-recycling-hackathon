import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

const createSchema = z.object({
  participantId: z.string().optional().nullable(),
  participantName: z.string().optional().nullable(),
  type: z.enum(["attendance_low", "productivity_drop", "phase_ready", "cert_expiring", "milestone"]),
  priority: z.enum(["high", "medium", "low"]),
  message: z.string().min(3),
});

export const runtime = "nodejs";

export const GET = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const priority = searchParams.get("priority");
  const isRead = searchParams.get("isRead");

  let query: FirebaseFirestore.Query = getFirebaseAdminDb().collection("alerts");
  if (priority) query = query.where("priority", "==", priority);
  if (isRead === "true") query = query.where("isRead", "==", true);
  if (isRead === "false") query = query.where("isRead", "==", false);

  const snapshot = await query.orderBy("createdAt", "desc").get();
  const alerts = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() ?? {}) }));

  return NextResponse.json({ ok: true, alerts });
};

export const POST = async (req: Request) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const docRef = getFirebaseAdminDb().collection("alerts").doc();
  await docRef.set(
    {
      ...parsed.data,
      isRead: false,
      isDismissed: false,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, id: docRef.id });
};
