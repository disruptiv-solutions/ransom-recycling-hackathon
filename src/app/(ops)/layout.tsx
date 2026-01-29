import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getUnreadAlertCount } from "@/lib/ops/firestore";
import { OpsLayoutClient } from "@/components/ops/ops-layout-client";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const hasStaffAccess = isStaffRole(profile.role) || isStaffRole(profile.originalRole);
  if (!hasStaffAccess) redirect("/login");

  const unreadAlertsCount = await getUnreadAlertCount();

  return (
    <OpsLayoutClient profile={profile} unreadAlertsCount={unreadAlertsCount}>
      {children}
    </OpsLayoutClient>
  );
}
