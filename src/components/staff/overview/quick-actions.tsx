import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, BarChart2, Users } from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button asChild className="aspect-square h-auto w-full flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm whitespace-normal text-center p-4 rounded-2xl">
        <Link href="/staff/operations?tab=work">
          <Plus className="h-8 w-8 text-blue-600" />
          <span className="font-bold text-sm">Log Work</span>
        </Link>
      </Button>
      
      <Button asChild className="aspect-square h-auto w-full flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm whitespace-normal text-center p-4 rounded-2xl">
        <Link href="/staff/operations?tab=production">
          <Plus className="h-8 w-8 text-emerald-600" />
          <span className="font-bold text-sm">Log Production</span>
        </Link>
      </Button>

      <Button asChild className="aspect-square h-auto w-full flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm whitespace-normal text-center p-4 rounded-2xl">
        <Link href="/staff/reports">
          <FileText className="h-8 w-8 text-purple-600" />
          <span className="font-bold text-sm">Generate Report</span>
        </Link>
      </Button>

      <Button asChild className="aspect-square h-auto w-full flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm whitespace-normal text-center p-4 rounded-2xl">
        <Link href="/staff/participants">
          <Users className="h-8 w-8 text-amber-600" />
          <span className="font-bold text-sm">Participants</span>
        </Link>
      </Button>
    </div>
  );
}
