"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Recycle, Clock } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  iconName: "recycle" | "clock";
  progress: number;
}

const iconMap = {
  recycle: Recycle,
  clock: Clock,
};

export const MetricCard = ({ label, value, unit, iconName, progress }: MetricCardProps) => {
  const Icon = iconMap[iconName];
  return (
    <Card className="relative overflow-hidden border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#1F292E]">{value}</span>
            <span className="text-sm font-bold text-slate-400">{unit}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div 
            className="h-full bg-[#30D59B] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Background Icon */}
        <Icon className="absolute -bottom-2 -right-2 h-20 w-20 text-slate-50 opacity-[0.03]" />
      </CardContent>
    </Card>
  );
};
