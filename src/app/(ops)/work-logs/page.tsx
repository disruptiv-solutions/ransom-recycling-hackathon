import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapParticipant, mapWorkLog } from "@/lib/ops/firestore";
import { WorkLogsHistory } from "@/components/ops/work-logs/work-logs-history";
import { getSessionProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export default async function WorkLogsPage() {
  const profile = await getSessionProfile();
  const isAdmin = profile?.originalRole === "admin";

  const [workLogsSnap, participantsSnap] = await Promise.all([
    getFirebaseAdminDb().collection("work_logs").orderBy("workDate", "desc").limit(500).get(),
    getFirebaseAdminDb().collection("participants").orderBy("name").get(),
  ]);

  const workLogs = workLogsSnap.docs.map((doc) => mapWorkLog(doc.id, doc.data()));
  const participants = participantsSnap.docs.map((doc) => mapParticipant(doc.id, doc.data()));

  return <WorkLogsHistory initialLogs={workLogs} participants={participants} isAdmin={isAdmin} />;
}
