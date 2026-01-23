import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { 
  Sparkles,
  ChevronRight,
  Rocket
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ParticipantNav } from "@/components/participant/participant-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const runtime = "nodejs";

const navItems = [
  { label: "Home", href: "/participant", iconName: "home" as const },
  { label: "Growth", href: "/participant/growth", iconName: "growth" as const },
  { label: "Schedule", href: "/participant/schedule", iconName: "schedule" as const },
  { label: "Profile", href: "/participant/profile", iconName: "profile" as const },
];

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "participant" && profile.originalRole !== "admin") redirect("/");

  const isSuperAdmin = profile.originalRole === "admin";
  const initials = profile.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "P";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      {/* Side Navigation */}
      <aside className="hidden w-64 flex-col justify-between border-r border-border bg-card p-6 md:flex">
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">BridgePath</span>
          </div>

          {/* Navigation Links */}
          <ParticipantNav items={navItems} />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-6">
          {/* Next Milestone Card */}
          <div className="rounded-2xl bg-muted p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Next Milestone</p>
            <p className="mt-2 font-bold text-foreground">Mock Interview Session</p>
            <p className="text-xs text-muted-foreground">In 3 days</p>
          </div>

          {/* User & Logout */}
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-foreground">{profile.displayName}</p>
                <p className="text-[10px] text-muted-foreground">Participant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="h-10 w-auto px-3" />
              <RoleSwitcher currentRole={profile.role} isSuperAdmin={isSuperAdmin} />
          <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
        {children}
        </div>
      </main>
    </div>
  );
}

