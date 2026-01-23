"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCircle,
  ShieldCheck,
  Briefcase,
  ChevronDown,
} from "lucide-react";

interface RoleSwitcherProps {
  currentRole: string;
  isSuperAdmin: boolean;
}

const roleConfig = [
  {
    role: "participant",
    label: "Participant View",
    icon: UserCircle,
    path: "/participant",
    color: "text-accent",
  },
  {
    role: "supervisor",
    label: "Supervisor View",
    icon: Briefcase,
    path: "/supervisor",
    color: "text-primary",
  },
  {
    role: "case_manager",
    label: "Case Manager View",
    icon: Users,
    path: "/case-manager",
    color: "text-tracker-teal",
  },
  {
    role: "admin",
    label: "Admin View",
    icon: ShieldCheck,
    path: "/admin",
    color: "text-amber",
  },
];

export const RoleSwitcher = ({ currentRole, isSuperAdmin }: RoleSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!isSuperAdmin) return null;

  const currentRoleConfig = roleConfig.find((r) => r.role === currentRole);

  const handleRoleSwitch = async (role: string, path: string) => {
    setIsOpen(false);
    
    try {
      // Set the view-as cookie via API
      await fetch("/api/auth/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      
      // Navigate to the target dashboard
      router.push(path);
      router.refresh(); // Refresh to ensure server components update with new role
    } catch (error) {
      console.error("Failed to switch view:", error);
      router.push(path);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-primary/20 bg-card hover:bg-accent/10"
        aria-label="Switch role view"
        aria-expanded={isOpen}
      >
        {currentRoleConfig && (
          <currentRoleConfig.icon className={`h-4 w-4 ${currentRoleConfig.color}`} />
        )}
        <span className="hidden text-xs font-medium md:inline">Switch View</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Menu */}
          <div className="absolute bottom-full right-0 z-50 mb-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <div className="border-b border-border bg-muted/50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                🔐 SuperAdmin Tools
              </p>
            </div>
            <div className="p-1">
              {roleConfig.map((role) => {
                const isCurrentRole = role.role === currentRole;
                return (
                  <button
                    key={role.role}
                    onClick={() => handleRoleSwitch(role.role, role.path)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      isCurrentRole
                        ? "bg-accent/20 font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    disabled={isCurrentRole}
                    aria-label={`Switch to ${role.label}`}
                  >
                    <role.icon className={`h-4 w-4 ${role.color}`} />
                    <span className="flex-1">{role.label}</span>
                    {isCurrentRole && (
                      <span className="text-xs font-bold text-accent">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border bg-muted/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground">
                Viewing as: <span className="font-semibold">{currentRoleConfig?.label}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
