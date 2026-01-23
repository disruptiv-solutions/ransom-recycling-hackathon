import { redirect } from "next/navigation";

import { SupervisorDashboard } from "@/components/staff/supervisor-dashboard";
import { getSessionProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export default async function SupervisorHomePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "supervisor" && profile.originalRole !== "admin") redirect("/");

  return <SupervisorDashboard supervisorName={profile.displayName || "Supervisor"} />;
}

