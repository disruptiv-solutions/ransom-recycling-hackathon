import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateCaseForm } from "@/components/admin/create-case-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export default async function CreateCasePage() {
  const session = await getSessionProfile();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const db = getFirebaseAdminDb();
  
  // Fetch Case Managers
  const cmSnap = await db.collection("profiles").where("role", "==", "case_manager").get();
  const caseManagers = cmSnap.docs.map(doc => ({
    id: doc.id,
    displayName: doc.data().displayName || "Unnamed CM",
  }));

  // Fetch Supervisors
  const supervisorSnap = await db.collection("profiles").where("role", "==", "supervisor").get();
  const supervisors = supervisorSnap.docs.map(doc => ({
    id: doc.id,
    displayName: doc.data().displayName || "Unnamed Supervisor",
  }));

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Create New Case</h1>
          <p className="text-slate-500">Onboard a new participant and assign their support team.</p>
        </div>
      </div>
      
      <CreateCaseForm 
        caseManagers={caseManagers} 
        supervisors={supervisors} 
      />
    </div>
  );
}
