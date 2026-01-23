"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PhaseProgressRingProps {
  phaseName: string;
  percentage: number;
}

export const PhaseProgressRing = ({ 
  phaseName, 
  percentage
}: PhaseProgressRingProps) => {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="flex items-center gap-8 p-8">
        {/* Progress Ring */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="absolute inset-0 -rotate-90 transform" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E8FBF4"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#30D59B"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-[#1F292E]">{percentage}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Done</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold text-[#1F292E]">Phase Progress</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            You are <span className="font-bold text-[#30D59B]">{percentage}% through {phaseName}</span>. Almost at the finish line for Phase 2!
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="bg-[#E8FBF4] text-[#30D59B] hover:bg-[#E8FBF4] border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              Synthesized Mint Theme
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              {phaseName}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
