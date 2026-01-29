import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Participant } from "@/lib/ops/types";

export function AtRiskList({ participants }: { participants: Participant[] }) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">At-Risk Participants</CardTitle>
        <Link href="/staff/participants?filter=at-risk" className="text-xs font-bold text-blue-600 hover:text-blue-700">
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {participants.length > 0 ? (
          <div className="space-y-4">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{p.name}</h4>
                  <p className="text-xs text-red-700 dark:text-red-400">Needs immediate attention</p>
                </div>
                <Link href={`/staff/participants/${p.id}`} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                  <ArrowRight className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 h-full">
            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No at-risk participants.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
