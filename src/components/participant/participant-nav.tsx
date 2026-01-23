"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Calendar, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  iconName: "home" | "growth" | "schedule" | "profile";
}

interface ParticipantNavProps {
  items: NavItem[];
}

const iconMap = {
  home: Home,
  growth: LineChart,
  schedule: Calendar,
  profile: User,
};

export const ParticipantNav = ({ items }: ParticipantNavProps) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = iconMap[item.iconName];
        return (
          <Link
            key={item.label}
            href={item.href}
            className={[
              "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
