import { NextResponse } from "next/server";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { mapReport } from "@/lib/ops/firestore";

export const runtime = "nodejs";

export const GET = async (_req: Request, context: { params: Promise<{ reportId: string }> }) => {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { reportId } = await context.params;
  const db = getFirebaseAdminDb();
  const reportDoc = await db.doc(`reports/${reportId}`).get();

  if (!reportDoc.exists) {
    return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });
  }

  const report = mapReport(reportDoc.id, reportDoc.data() ?? {});
  return NextResponse.json({ ok: true, report });
};

export const DELETE = async (_req: Request, context: { params: Promise<{ reportId: string }> }) => {
  const profile = await getSessionProfile();
  if (!profile || profile.originalRole !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const { reportId } = await context.params;
  const db = getFirebaseAdminDb();
  await db.doc(`reports/${reportId}`).delete();

  return NextResponse.json({ ok: true });
};
