"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LayoutDashboard, Users, ClipboardList, CalendarDays, FileText, Users2, History, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  iconName: string;
}

interface StaffMobileNavProps {
  items: NavItem[];
}

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  participants: Users,
  logs: ClipboardList,
  appointments: CalendarDays,
  reports: FileText,
  crew: Users2,
  history: History,
  trends: TrendingUp,
  schedule: Clock,
};

export const StaffMobileNav = ({ items }: StaffMobileNavProps) => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-border bg-card px-4 pb-4 md:hidden">
      {items.slice(0, 4).map((item) => {
        const isActive = pathname === item.href;
        const Icon = iconMap[item.iconName] || LayoutDashboard;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-foreground/70"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
