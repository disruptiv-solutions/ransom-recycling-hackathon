import StaffLayoutBase from "@/components/staff/staff-layout-base";
import { getSessionProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin" && profile?.originalRole !== "admin") {
    redirect("/");
  }

  return <StaffLayoutBase>{children}</StaffLayoutBase>;
}
