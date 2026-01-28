import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapParticipant } from "@/lib/ops/firestore";
import { ParticipantsDirectory } from "@/components/ops/participants/participants-directory";

export const runtime = "nodejs";

export default async function ParticipantsPage() {
  const snapshot = await getFirebaseAdminDb().collection("participants").orderBy("name").get();
  const participants = snapshot.docs.map((doc) => mapParticipant(doc.id, doc.data()));

  return <ParticipantsDirectory participants={participants} />;
}
