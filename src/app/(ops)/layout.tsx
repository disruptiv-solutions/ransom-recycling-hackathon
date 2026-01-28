import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getUnreadAlertCount } from "@/lib/ops/firestore";
import { OpsNavbar } from "@/components/ops/ops-navbar";
import { OpsSidebar } from "@/components/ops/ops-sidebar";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const hasStaffAccess = isStaffRole(profile.role) || isStaffRole(profile.originalRole);
  if (!hasStaffAccess) redirect("/login");

  const unreadAlertsCount = await getUnreadAlertCount();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <OpsSidebar profile={profile} unreadAlertsCount={unreadAlertsCount} />
      <div className="flex min-h-screen flex-1 flex-col">
        <OpsNavbar profile={profile} unreadAlertsCount={unreadAlertsCount} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
