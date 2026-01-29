import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Cloud, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleData {
  shifts: { period: "morning" | "afternoon"; role: string; count: number; checkedIn: number }[];
  pickups: { time: string; name: string; estWeight: number }[];
}

export function TodaySchedule({ data, className }: { data: ScheduleData; className?: string }) {
  const morningShifts = data.shifts.filter(s => s.period === "morning");
  const afternoonShifts = data.shifts.filter(s => s.period === "afternoon");

  return (
    <Card className={cn("border-none shadow-sm bg-white dark:bg-slate-900 flex flex-col", className)}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Today&apos;s Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto flex-1 pr-2">
        
        {/* Morning */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Sun className="h-4 w-4" /> Morning Shift (8am-12pm)
          </div>
          <div className="space-y-2 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
            {morningShifts.map((shift, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{shift.role}</span>
                <span className="text-slate-500">
                  {shift.count} scheduled, <span className={shift.checkedIn < shift.count ? "text-amber-600 font-bold" : "text-green-600"}>{shift.checkedIn} checked in</span>
                  {shift.checkedIn < shift.count && " ⚠️"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Afternoon */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <Cloud className="h-4 w-4" /> Afternoon Shift (12pm-4pm)
          </div>
          <div className="space-y-2 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
            {afternoonShifts.map((shift, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{shift.role}</span>
                <span className="text-slate-500">{shift.count} scheduled</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pickups */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400 font-bold text-sm">
            <Package className="h-4 w-4" /> Pickups Scheduled
          </div>
          <div className="space-y-2 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
            {data.pickups.length > 0 ? (
              data.pickups.map((pickup, i) => (
                <div key={i} className="text-sm">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{pickup.time}</span> - {pickup.name} <span className="text-slate-400">(est. {pickup.estWeight} lbs)</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">No pickups scheduled.</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
