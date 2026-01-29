"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { signOut } from "firebase/auth";

import type { SessionProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getFirebaseAuth } from "@/lib/firebase/client";

type OpsSidebarProps = {
  profile: SessionProfile;
  isAgentOpen: boolean;
  onToggleAgent: () => void;
};

const navItems = [
  { label: "Overview", href: "/overview" },
  { label: "Participants", href: "/participants" },
  { label: "Production", href: "/production" },
  { label: "Reports", href: "/reports" },
  { label: "Work Logs", href: "/work-logs" },
];

export const OpsSidebar = ({ profile, isAgentOpen, onToggleAgent }: OpsSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const isDemoPage = pathname.startsWith("/demo/");
  const demoMatch = pathname.match(/^\/demo\/(\d+)$/);
  const currentDemoNumber = demoMatch ? parseInt(demoMatch[1], 10) : null;
  const prevDemoNumber = currentDemoNumber && currentDemoNumber > 1 ? currentDemoNumber - 1 : null;
  const nextDemoNumber = currentDemoNumber ? currentDemoNumber + 1 : null;

  const isSpecialUser = profile.uid === "7kYaZzG7KNgfvQGC2XpcC23LCVm2";

  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!isDemoPage) return;

    // Reset to 5:00 when landing on demo/1
    if (pathname === "/demo/1") {
      setTimeLeft(300);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoPage, pathname]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePrevDemo = () => {
    if (prevDemoNumber) {
      router.push(`/demo/${prevDemoNumber}`);
    }
  };

  const handleNextDemo = () => {
    if (nextDemoNumber) {
      router.push(`/demo/${nextDemoNumber}`);
    }
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 md:sticky md:top-0 md:flex md:h-screen">
      <div className="flex items-center gap-3 pb-6">
        <Link href="/operations" className="flex items-center gap-3" aria-label="Ransom Operations">
          <div className="relative h-10 w-28">
            <Image src="/RANSOM.png" alt="Ransom" fill className="object-contain" priority unoptimized />
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

      {isDemoPage && currentDemoNumber && (
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevDemo}
              disabled={!prevDemoNumber}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                prevDemoNumber
                  ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  : "cursor-not-allowed border-slate-100 text-slate-300",
              )}
              aria-label="Previous demo"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextDemo}
              disabled={!nextDemoNumber}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                nextDemoNumber
                  ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  : "cursor-not-allowed border-slate-100 text-slate-300",
              )}
              aria-label="Next demo"
            >
              <span>Forward</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-3 shadow-lg shadow-slate-200">
            <Timer className={cn(
              "h-4 w-4",
              timeLeft < 60 ? "text-red-400 animate-pulse" : "text-blue-400"
            )} />
            <span className={cn(
              "text-lg font-mono font-bold tracking-widest",
              timeLeft < 60 ? "text-red-400 animate-pulse" : "text-white"
            )}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      <div className={cn("space-y-4", isDemoPage ? "mt-4" : "mt-6 border-t border-slate-200 pt-4")}>
        {isSpecialUser && (
          <Link
            href="/demo/1"
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
              pathname === "/demo/1"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600",
            )}
            aria-label="Open Demo"
          >
            Open Demo
          </Link>
        )}
        <Link
          href="/operations"
          className={cn(
            "flex w-full items-center justify-between rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
            pathname === "/operations" || pathname.startsWith("/operations/")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900",
          )}
          aria-label="Add log"
        >
          Add Log
        </Link>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/sessionLogout", { method: "POST" });
            await signOut(getFirebaseAuth());
            window.location.href = "/login";
          }}
          className={cn(
            "flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900",
          )}
          aria-label="Sign out"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};
