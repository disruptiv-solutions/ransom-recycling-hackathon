import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import ParticipantProfilePage from "@/components/participant/participant-profile-page";

export const runtime = "nodejs";

export default async function CaseManagerParticipantOverviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSessionProfile();
  if (!session || session.role !== "case_manager") redirect("/");

  const db = getFirebaseAdminDb();
  const profileSnap = await db.doc(`profiles/${id}`).get();
  if (!profileSnap.exists) redirect("/case-manager/participants");

  const profile = profileSnap.data() as any;
  const assignedCaseManagerId = typeof profile?.caseManagerId === "string" ? profile.caseManagerId : null;
  if (!assignedCaseManagerId || assignedCaseManagerId !== session.uid) redirect("/case-manager/participants");

  return <ParticipantProfilePage participantId={id} />;
}

