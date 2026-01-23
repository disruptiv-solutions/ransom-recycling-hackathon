import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (profile) redirect("/");
  return children;
}

