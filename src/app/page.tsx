import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";

export default async function Home() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const hasStaffAccess = isStaffRole(profile.role) || isStaffRole(profile.originalRole);
  if (!hasStaffAccess) redirect("/login");

  redirect("/operations");
}
