import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapAlert } from "@/lib/ops/firestore";
import { AlertsInbox } from "@/components/ops/alerts/alerts-inbox";

export const runtime = "nodejs";

export default async function AlertsPage() {
  const snapshot = await getFirebaseAdminDb().collection("alerts").orderBy("createdAt", "desc").get();
  const alerts = snapshot.docs.map((doc) => mapAlert(doc.id, doc.data())).filter((alert) => !alert.isDismissed);

  return <AlertsInbox initialAlerts={alerts} />;
}
