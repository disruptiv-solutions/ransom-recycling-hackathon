import { OverviewDashboard } from "@/components/staff/overview/overview-dashboard";
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function OverviewPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">Overview Dashboard</h2>
        <p className="text-sm text-slate-500 md:text-base">Welcome back, {profile.displayName || "Staff"}.</p>
      </div>
      <OverviewDashboard />
    </div>
  );
}
