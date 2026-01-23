import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";

export default async function Home() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  if (profile.role === "participant") redirect("/participant");
  if (profile.role === "case_manager") redirect("/case-manager");
  if (profile.role === "supervisor") redirect("/supervisor");
  if (profile.role === "admin") redirect("/admin");

  redirect("/login");
}
