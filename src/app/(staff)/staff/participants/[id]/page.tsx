import ParticipantProfilePage from "@/components/participant/participant-profile-page";

export const runtime = "nodejs";

export default async function StaffParticipantOverviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <ParticipantProfilePage participantId={id} />;
}
