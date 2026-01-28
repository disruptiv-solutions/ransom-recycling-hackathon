"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Input } from "@/components/ui/input";

type OpsNavbarProps = {
  profile: SessionProfile;
  unreadAlertsCount: number;
};

const navItems = [
  { label: "Operations", href: "/operations" },
  { label: "Participants", href: "/participants" },
  { label: "Production", href: "/production" },
  { label: "Reports", href: "/reports" },
];

export const OpsNavbar = ({ profile, unreadAlertsCount }: OpsNavbarProps) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const displayName = useMemo(
    () => profile.displayName ?? profile.uid.slice(0, 6).toUpperCase(),
    [profile.displayName, profile.uid],
  );

  const handleToggleMenu = () => setMenuOpen((prev) => !prev);
  const handleToggleMobile = () => setMobileOpen((prev) => !prev);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/participants?search=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          const results = (data.participants ?? []).map((participant: any) => ({
            id: participant.id,
            name: participant.name,
          }));
          setSearchResults(results);
          setSearchOpen(true);
        } else {
          setSearchResults([]);
          setSearchOpen(false);
        }
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setSearchResults([]);
          setSearchOpen(false);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:hidden"
            aria-label="Toggle navigation"
            onClick={handleToggleMobile}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Link href="/operations" className="flex items-center gap-3" aria-label="Ransom Operations">
            <div className="relative h-9 w-28">
              <Image src="/RANSOM.png" alt="Ransom" fill className="object-contain" priority />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Operations Platform
              </p>
            </div>
          </Link>
        </div>

        <nav className="hidden" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Input
              className="w-72 bg-white"
              placeholder="Search participants..."
              aria-label="Search participants"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setSearchOpen(true);
              }}
              onBlur={() => {
                setTimeout(() => setSearchOpen(false), 150);
              }}
            />
            {searchOpen ? (
              <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {searchLoading ? (
                  <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No participants found.</p>
                ) : (
                  searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/participants/${result.id}`}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      aria-label={`Open ${result.name}`}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                    >
                      {result.name}
                    </Link>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <Link
            href="/alerts"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="View alerts"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadAlertsCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {unreadAlertsCount}
              </span>
            ) : null}
          </Link>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
              aria-label="Open user menu"
              onClick={handleToggleMenu}
            >
              <span className="hidden sm:inline">{displayName}</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <Link
                  href="/settings"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Settings
                </Link>
                <Link
                  href="/work-logs"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Work Logs
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
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold",
                    isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
};
