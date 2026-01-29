import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapMaterialPrice, mapProductionRecord, mapWorkLog, mapParticipant } from "@/lib/ops/firestore";
import { getDayRange } from "@/lib/ops/date";
import { OperationsDashboard } from "@/components/ops/operations/operations-dashboard";
import { getSessionProfile } from "@/lib/auth/session";
import { getServerDemoMode } from "@/lib/demo-mode-server";

export const runtime = "nodejs";

export default async function OperationsPage() {
  const profile = await getSessionProfile();
  const isAdmin = profile?.originalRole === "admin";
  const isDemoMode = await getServerDemoMode();
  const today = new Date();
  const { start, end } = getDayRange(today);

  const db = getFirebaseAdminDb();

  const [participantsSnap, workLogsSnap, productionSnap, pricesSnap] = await Promise.all([
    db.collection("participants").orderBy("name").get(),
    db
      .collection("work_logs")
      .where("workDate", ">=", start)
      .where("workDate", "<=", end)
      .orderBy("workDate", "desc")
      .get(),
    db
      .collection("production_records")
      .where("productionDate", ">=", start)
      .where("productionDate", "<=", end)
      .orderBy("productionDate", "desc")
      .get(),
    db.collection("material_prices").orderBy("category").get(),
  ]);

  const participants = participantsSnap.docs.map((doc) => mapParticipant(doc.id, doc.data()));
  const workLogs = workLogsSnap.docs.map((doc) => mapWorkLog(doc.id, doc.data()));
  const productionRecords = productionSnap.docs.map((doc) => mapProductionRecord(doc.id, doc.data()));
  const materialPrices = pricesSnap.docs.map((doc) => mapMaterialPrice(doc.id, doc.data()));

  const visibleParticipants = isDemoMode ? participants : participants.filter((p) => !p.isMock);
  const visibleWorkLogs = isDemoMode ? workLogs : workLogs.filter((log) => !log.isMock);
  const visibleProductionRecords = isDemoMode ? productionRecords : productionRecords.filter((record) => !record.isMock);

  return (
    <OperationsDashboard
      dateLabel={today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
      participants={visibleParticipants}
      workLogs={visibleWorkLogs}
      productionRecords={visibleProductionRecords}
      materialPrices={materialPrices}
      isAdmin={isAdmin}
    />
  );
}
