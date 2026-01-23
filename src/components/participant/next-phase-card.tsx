"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Rocket, ChevronRight } from "lucide-react";

export const NextPhaseCard = () => {
  return (
    <Card className="border-none bg-[#E8FBF4] shadow-sm transition-all hover:translate-x-1 cursor-pointer">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Rocket className="h-6 w-6 text-[#30D59B]" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-[#1F292E]">Next Phase: Career Placement</h4>
          <p className="text-xs text-slate-500">Unlock this after completing 2 more modules.</p>
        </div>
        <ChevronRight className="h-5 w-5 text-[#30D59B]" />
      </CardContent>
    </Card>
  );
};
