"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CalendarDays, 
  FileText,
  Users2,
  History,
  TrendingUp,
  Clock
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  iconName: string;
}

interface StaffNavProps {
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

export const StaffNav = ({ items }: StaffNavProps) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = iconMap[item.iconName] || LayoutDashboard;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-3 transition-all",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-foreground/80 hover:bg-muted"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-primary")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
