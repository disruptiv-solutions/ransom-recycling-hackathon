import { redirect } from "next/navigation";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { AdminParticipantsTable, type AdminParticipantRow } from "@/components/admin/admin-participants-table";

export const runtime = "nodejs";

export default async function AdminParticipantsPage() {
  const session = await getSessionProfile();
  if (!session || session.originalRole !== "admin") redirect("/");

  const db = getFirebaseAdminDb();

  const [participantsSnap, caseManagersSnap, supervisorsSnap] = await Promise.all([
    db.collection("profiles").where("role", "==", "participant").get(),
    db.collection("profiles").where("role", "==", "case_manager").get(),
    db.collection("profiles").where("role", "==", "supervisor").get(),
  ]);

  const caseManagerNameById = new Map<string, string>();
  caseManagersSnap.docs.forEach((d) => {
    const data = d.data() as any;
    caseManagerNameById.set(d.id, typeof data?.displayName === "string" ? data.displayName : "Unnamed");
  });

  const supervisorNameById = new Map<string, string>();
  supervisorsSnap.docs.forEach((d) => {
    const data = d.data() as any;
    supervisorNameById.set(d.id, typeof data?.displayName === "string" ? data.displayName : "Unnamed");
  });

  const caseManagers = caseManagersSnap.docs
    .map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        displayName: typeof data?.displayName === "string" ? data.displayName : "Unnamed",
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const supervisors = supervisorsSnap.docs
    .map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        displayName: typeof data?.displayName === "string" ? data.displayName : "Unnamed",
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const participantIds = participantsSnap.docs.map((d) => d.id);
  const participantDocs = participantIds.length > 0 ? await db.getAll(...participantIds.map((id) => db.doc(`participants/${id}`))) : [];
  const intakeStatusById = new Map<string, "incomplete" | "in_progress" | "complete">();
  participantDocs.forEach((snap) => {
    if (!snap.exists) return;
    const data = snap.data() as any;
    const intakeStatus = data?.intakeStatus;
    if (intakeStatus === "incomplete" || intakeStatus === "in_progress" || intakeStatus === "complete") {
      intakeStatusById.set(snap.id, intakeStatus);
    }
  });

  const rows: AdminParticipantRow[] = participantsSnap.docs
    .map((d) => {
      const data = d.data() as any;
      const displayName = typeof data?.displayName === "string" ? data.displayName : null;
      const email = typeof data?.email === "string" ? data.email : null;
      const caseManagerId = typeof data?.caseManagerId === "string" ? data.caseManagerId : null;
      const supervisorId = typeof data?.supervisorId === "string" ? data.supervisorId : null;

      const createdAt = data?.createdAt;
      const createdAtLabel =
        createdAt && typeof createdAt?.toDate === "function" ? createdAt.toDate().toLocaleDateString() : null;

      return {
        id: d.id,
        displayName,
        email,
        caseManagerId,
        supervisorId,
        caseManagerName: caseManagerId ? caseManagerNameById.get(caseManagerId) || null : null,
        supervisorName: supervisorId ? supervisorNameById.get(supervisorId) || null : null,
        intakeStatus: intakeStatusById.get(d.id) || "incomplete",
        createdAtLabel,
      };
    })
    .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Participants</h1>
        <p className="mt-1 text-muted-foreground">All participant cases and their current assignments.</p>
      </div>

      <AdminParticipantsTable rows={rows} caseManagers={caseManagers} supervisors={supervisors} />
    </div>
  );
}

