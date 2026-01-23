import { redirect } from "next/navigation";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { CaseManagerParticipantsTable, type CaseManagerParticipantRow } from "@/components/case-manager/case-manager-participants-table";

export const runtime = "nodejs";

export default async function CaseManagerParticipantsPage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "case_manager") redirect("/");

  const db = getFirebaseAdminDb();

  const [participantsSnap, supervisorsSnap] = await Promise.all([
    db.collection("profiles").where("role", "==", "participant").where("caseManagerId", "==", session.uid).get(),
    db.collection("profiles").where("role", "==", "supervisor").get(),
  ]);

  const supervisorNameById = new Map<string, string>();
  supervisorsSnap.docs.forEach((d) => {
    const data = d.data() as any;
    supervisorNameById.set(d.id, typeof data?.displayName === "string" ? data.displayName : "Unnamed");
  });

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
  const participantDocs =
    participantIds.length > 0 ? await db.getAll(...participantIds.map((id) => db.doc(`participants/${id}`))) : [];
  const intakeStatusById = new Map<string, "incomplete" | "in_progress" | "complete">();
  participantDocs.forEach((snap) => {
    if (!snap.exists) return;
    const data = snap.data() as any;
    const intakeStatus = data?.intakeStatus;
    if (intakeStatus === "incomplete" || intakeStatus === "in_progress" || intakeStatus === "complete") {
      intakeStatusById.set(snap.id, intakeStatus);
    }
  });

  const rows: CaseManagerParticipantRow[] = participantsSnap.docs
    .map((d) => {
      const data = d.data() as any;
      const displayName = typeof data?.displayName === "string" ? data.displayName : null;
      const email = typeof data?.email === "string" ? data.email : null;
      const supervisorId = typeof data?.supervisorId === "string" ? data.supervisorId : null;

      const createdAt = data?.createdAt;
      const createdAtLabel =
        createdAt && typeof createdAt?.toDate === "function" ? createdAt.toDate().toLocaleDateString() : null;

      return {
        id: d.id,
        displayName,
        email,
        supervisorId,
        supervisorName: supervisorId ? supervisorNameById.get(supervisorId) || null : null,
        intakeStatus: intakeStatusById.get(d.id) || "incomplete",
        createdAtLabel,
      };
    })
    .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Participants</h1>
        <p className="mt-1 text-slate-600">Only participants assigned to you.</p>
      </div>

      <CaseManagerParticipantsTable rows={rows} supervisors={supervisors} />
    </div>
  );
}

