import ParticipantProfilePage from "@/components/participant/participant-profile-page";

export const runtime = "nodejs";

export default function ParticipantByIdPage({ params }: { params: { id: string } }) {
  return <ParticipantProfilePage participantId={params.id} />;
}
