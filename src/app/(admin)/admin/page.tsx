import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, ShieldCheck, Settings2, Mail, ExternalLink } from "lucide-react";
import { getFirebaseAdminDb, getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { UserTable } from "@/components/admin/user-table";
import { AdminQuickAdd } from "@/components/admin/admin-quick-add";
import type { AppRole } from "@/lib/auth/roles";

export const runtime = "nodejs";

type ProfileRecord = {
  id: string;
  displayName: string | null;
  role: AppRole;
};

const AdminPage = async () => {
  const session = await getSessionProfile();
  if (!session || session.originalRole !== "admin") {
    redirect("/");
  }

  const db = getFirebaseAdminDb();
  const auth = getFirebaseAdminAuth();

  // Fetch all profiles from Firestore
  const profilesSnap = await db.collection("profiles").get();
  const isAppRole = (role: unknown): role is AppRole =>
    role === "participant" || role === "case_manager" || role === "supervisor" || role === "admin";

  const profileData: ProfileRecord[] = profilesSnap.docs
    .map((doc) => {
      const data = doc.data() as { displayName?: unknown; role?: unknown } | null;
      if (!isAppRole(data?.role)) return null;

      return {
        id: doc.id,
        displayName: typeof data?.displayName === "string" ? data.displayName : null,
        role: data.role,
      };
    })
    .filter((x): x is ProfileRecord => Boolean(x));

  // Fetch all user accounts from Firebase Auth to get real emails
  const authUsers = await auth.listUsers();
  const emailMap = new Map(authUsers.users.map(u => [u.uid, u.email]));

  const users = profileData.map(p => ({
    id: p.id,
    displayName: p.displayName || null,
    email: emailMap.get(p.id) || null,
    role: p.role,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Console</h1>
          <p className="text-muted-foreground">
            Manage staff permissions and system-wide settings.
          </p>
        </div>
        <AdminQuickAdd />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* User Management Table */}
        <Card className="lg:col-span-2 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-xl font-bold">Staff Management</CardTitle>
            <CardDescription>Configure roles and access for BridgePath employees.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <UserTable initialUsers={users} currentUserUid={session.uid} />
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-8">
          <Card className="rounded-[2.5rem] p-2">
            <CardHeader className="px-6 pt-6">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Security Audit</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent sensitive data access:</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground/80">Sarah M. viewed Marcus J.</span>
                  <span className="text-xs text-muted-foreground">10m ago</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground/80">Admin viewed System Logs</span>
                  <span className="text-xs text-muted-foreground">1h ago</span>
                </div>
              </div>
              <Button className="w-full rounded-xl h-12 font-bold transition-all" variant="outline">
                View Full Audit Trail
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] p-2 flex-1">
            <CardHeader className="px-6 pt-6">
              <div className="flex items-center gap-2 text-primary">
                <Settings2 className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Global Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted rounded-xl py-6 px-4 font-bold transition-all group">
                <Mail className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                Email Templates
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted rounded-xl py-6 px-4 font-bold transition-all group">
                <div className="mr-3 h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                </div>
                System Backups
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted rounded-xl py-6 px-4 font-bold transition-all group">
                <ExternalLink className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                API Integration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
