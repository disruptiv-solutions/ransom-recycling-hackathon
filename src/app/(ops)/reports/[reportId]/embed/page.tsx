import { redirect } from "next/navigation";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { mapReport } from "@/lib/ops/firestore";
import { ReportDetailClient } from "@/components/ops/reports/report-detail-client";

export default async function ReportDetailEmbedPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile || !isStaffRole(profile.role)) {
    redirect("/login");
  }

  const { reportId } = await params;
  const db = getFirebaseAdminDb();
  const reportDoc = await db.doc(`reports/${reportId}`).get();

  if (!reportDoc.exists) {
    redirect("/reports");
  }

  const report = mapReport(reportDoc.id, reportDoc.data() ?? {});

  return <ReportDetailClient report={report} isAdmin={profile.originalRole === "admin"} />;
}
