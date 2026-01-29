import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { mapProductionRecord, mapWorkLog } from "@/lib/ops/firestore";
import { ProductionDashboard } from "@/components/ops/production/production-dashboard";
import { getServerDemoMode } from "@/lib/demo-mode-server";

export const runtime = "nodejs";

export default async function ProductionPage() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  const isDemoMode = await getServerDemoMode();

  const db = getFirebaseAdminDb();
  const [productionSnap, workLogsSnap] = await Promise.all([
    db
      .collection("production_records")
      .where("productionDate", ">=", start)
      .where("productionDate", "<=", end)
      .orderBy("productionDate", "desc")
      .get(),
    db
      .collection("work_logs")
      .where("workDate", ">=", start)
      .where("workDate", "<=", end)
      .orderBy("workDate", "desc")
      .get(),
  ]);

  const productionRecords = productionSnap.docs.map((doc) => mapProductionRecord(doc.id, doc.data()));
  const workLogs = workLogsSnap.docs.map((doc) => mapWorkLog(doc.id, doc.data()));
  const visibleProductionRecords = isDemoMode
    ? productionRecords
    : productionRecords.filter((record) => !record.isMock);
  const visibleWorkLogs = isDemoMode ? workLogs : workLogs.filter((log) => !log.isMock);

  return (
    <ProductionDashboard
      initialRecords={visibleProductionRecords}
      initialWorkLogs={visibleWorkLogs}
      defaultRange={{
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      }}
    />
  );
}
