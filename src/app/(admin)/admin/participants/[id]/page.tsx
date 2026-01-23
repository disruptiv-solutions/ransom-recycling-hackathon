import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";
import ParticipantProfilePage from "@/components/participant/participant-profile-page";

export const runtime = "nodejs";

export default async function AdminParticipantOverviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSessionProfile();
  if (!session || session.originalRole !== "admin") redirect("/");

  return <ParticipantProfilePage participantId={id} />;
}

