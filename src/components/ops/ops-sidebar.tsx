"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { RoleSwitcher } from "@/components/auth/role-switcher";

type OpsSidebarProps = {
  profile: SessionProfile;
  unreadAlertsCount: number;
};

const navItems = [
  { label: "Operations", href: "/operations" },
  { label: "Participants", href: "/participants" },
  { label: "Production", href: "/production" },
  { label: "Reports", href: "/reports" },
  { label: "Work Logs", href: "/work-logs" },
  { label: "Alerts", href: "/alerts" },
];

export const OpsSidebar = ({ profile, unreadAlertsCount }: OpsSidebarProps) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = useMemo(
    () => profile.displayName ?? profile.uid.slice(0, 6).toUpperCase(),
    [profile.displayName, profile.uid],
  );

  const handleToggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 md:flex">
      <div className="flex items-center gap-3 pb-6">
        <Link href="/operations" className="flex items-center gap-3" aria-label="Ransom Operations">
          <div className="relative h-10 w-28">
            <Image src="/RANSOM.png" alt="Ransom" fill className="object-contain" priority />
          </div>
        </Link>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
          <p className="text-xs text-slate-500">Platform</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-4 border-t border-slate-200 pt-4">
        <Link
          href="/alerts"
          className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
          aria-label="View alerts"
        >
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" aria-hidden="true" />
            Alerts
          </span>
          {unreadAlertsCount > 0 ? (
            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {unreadAlertsCount}
            </span>
          ) : null}
        </Link>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-between"
            aria-label="Open user menu"
            onClick={handleToggleMenu}
          >
            <span className="text-sm font-semibold">{displayName}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <Link
                href="/settings"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Settings
              </Link>
              {profile.originalRole === "admin" ? (
                <div className="px-2 py-2">
                  <RoleSwitcher currentRole={profile.role} isSuperAdmin />
                </div>
              ) : null}
              <div className="px-2 py-2">
                <LogoutButton />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
};
