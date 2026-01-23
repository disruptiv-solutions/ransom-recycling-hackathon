"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateStaffModal } from "@/components/admin/create-staff-modal";
import type { AppRole } from "@/lib/auth/roles";

export function AdminQuickAdd() {
  const [isCaseManagerOpen, setIsCaseManagerOpen] = useState(false);
  const [isSupervisorOpen, setIsSupervisorOpen] = useState(false);

  const handleOpenRole = (role: Extract<AppRole, "case_manager" | "supervisor">) => {
    if (role === "case_manager") {
      setIsCaseManagerOpen(true);
      return;
    }
    setIsSupervisorOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-xl border-slate-200 px-6 font-bold text-slate-700 hover:bg-slate-50"
        onClick={() => handleOpenRole("case_manager")}
        aria-label="Add case manager"
      >
        Add Case Manager
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-xl border-slate-200 px-6 font-bold text-slate-700 hover:bg-slate-50"
        onClick={() => handleOpenRole("supervisor")}
        aria-label="Add supervisor"
      >
        Add Supervisor
      </Button>

      <CreateStaffModal
        isOpen={isCaseManagerOpen}
        onOpenChange={setIsCaseManagerOpen}
        presetRole="case_manager"
      />
      <CreateStaffModal
        isOpen={isSupervisorOpen}
        onOpenChange={setIsSupervisorOpen}
        presetRole="supervisor"
      />
    </div>
  );
}

