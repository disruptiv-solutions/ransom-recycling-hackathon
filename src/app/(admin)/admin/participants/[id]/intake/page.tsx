import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { IntakeForm } from "@/components/intake/intake-form";

export const runtime = "nodejs";

export default async function AdminParticipantIntakePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSessionProfile();
  if (!session || session.originalRole !== "admin") redirect("/");

  const { id } = await props.params;
  const db = getFirebaseAdminDb();

  const [profileSnap, participantSnap] = await Promise.all([
    db.doc(`profiles/${id}`).get(),
    db.doc(`participants/${id}`).get(),
  ]);

  if (!profileSnap.exists) redirect("/admin/participants");

  const profile = profileSnap.data() as any;
  const participant = participantSnap.exists ? (participantSnap.data() as any) : {};

  const displayName = typeof profile?.displayName === "string" ? profile.displayName : null;
  const email = typeof profile?.email === "string" ? profile.email : null;

  const intakeStatus =
    participant?.intakeStatus === "complete" || participant?.intakeStatus === "in_progress" || participant?.intakeStatus === "incomplete"
      ? participant.intakeStatus
      : "incomplete";

  const intake = typeof participant?.intake === "object" && participant?.intake ? participant.intake : {};

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 md:p-10">
      <IntakeForm
        participantId={id}
        participantName={displayName}
        participantEmail={email}
        initialStatus={intakeStatus}
        initialPayload={intake}
      />
    </div>
  );
}

