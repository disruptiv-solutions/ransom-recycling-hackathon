import { redirect } from "next/navigation";
import Link from "next/link";
import { isStaffRole } from "@/lib/auth/roles";
import { getSessionProfile } from "@/lib/auth/session";
import { 
  Leaf, 
  Menu, 
  Search,
  ShieldCheck,
  Settings2,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NotificationPopover } from "@/components/staff/notification-popover";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { StaffNav } from "@/components/staff/staff-nav";
import { StaffMobileNav } from "@/components/staff/staff-mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const CASE_MANAGER_NAV = [
  { label: "Overview", href: "/case-manager", iconName: "dashboard" },
  { label: "Participants", href: "/case-manager/participants", iconName: "participants" },
  { label: "Impact Tracker", href: "/case-manager/logs", iconName: "logs" },
  { label: "Appointments", href: "#", iconName: "appointments" },
  { label: "Reports", href: "/case-manager/reports", iconName: "reports" },
];

const SUPERVISOR_NAV = [
  { label: "Active Crew", href: "/supervisor", iconName: "crew" },
  { label: "Shift Logs", href: "/supervisor/logs", iconName: "history" },
  { label: "My Schedule", href: "#", iconName: "schedule" },
  { label: "Impact Reports", href: "/supervisor/reports", iconName: "trends" },
];

const ADMIN_NAV = [
  { label: "System Admin", href: "/admin", iconName: "dashboard" },
  { label: "Participants", href: "/admin/participants", iconName: "participants" },
  { label: "Config", href: "/admin/config", iconName: "reports" },
];

const adminItems = [
  { label: "Admin", href: "/admin", icon: ShieldCheck },
  { label: "Participants", href: "/admin/participants", icon: ShieldCheck },
  { label: "Config", href: "/admin/config", icon: Settings2 },
];

export default async function StaffLayoutBase({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  
  const originalIsStaff = isStaffRole(profile.originalRole);
  const currentIsStaff = isStaffRole(profile.role);
  
  if (!currentIsStaff && !originalIsStaff) redirect("/");

  const isSuperAdmin = profile.originalRole === "admin";
  
  let navItems = CASE_MANAGER_NAV;
  if (profile.role === "supervisor") navItems = SUPERVISOR_NAV;
  if (profile.role === "admin") navItems = ADMIN_NAV;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      {/* Side Navigation */}
      <aside className="hidden w-72 flex-col justify-between border-r border-border bg-card p-6 md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="rounded-lg bg-primary p-2 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Growth Platform</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {profile.role.replace("_", " ")} Portal
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <StaffNav items={navItems} />

            {isSuperAdmin && (
              <div className="flex flex-col gap-2">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">System Admin</p>
                <nav className="flex flex-col gap-1">
                  {adminItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 rounded-full px-4 py-2 text-sm text-foreground/80 transition-all hover:bg-muted"
                    >
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-primary/20 bg-primary/10 p-4 dark:bg-primary/5">
            <p className="mb-2 text-xs font-semibold uppercase text-primary">Program Tip</p>
            <p className="text-sm text-foreground/80">Regular check-ins improve retention by 40%.</p>
          </div>
          {profile.role === "admin" && (
            <Button 
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-white hover:bg-primary/90"
              asChild
            >
              <Link href="/admin/participants/create">
                <PlusCircle className="h-5 w-5" />
                Add New Case
              </Link>
            </Button>
          )}
          
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
            <ThemeToggle />
            <RoleSwitcher currentRole={profile.role} isSuperAdmin={isSuperAdmin} />
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-6 w-6 text-foreground/70" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-bold text-foreground">Growth Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Search className="h-5 w-5 text-foreground/70" />
          </Button>
          <div className="hidden sm:block">
            <ThemeToggle className="h-10 w-auto px-3" />
          </div>
          <NotificationPopover />
          <RoleSwitcher currentRole={profile.role} isSuperAdmin={isSuperAdmin} />
          <LogoutButton />
          <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background p-4 pb-32 md:p-8 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <StaffMobileNav items={navItems} />
    </div>
  );
}
