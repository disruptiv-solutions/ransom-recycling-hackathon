"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Briefcase, BookOpen, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgendaItem {
  id: string;
  type: "active" | "pending" | "completed";
  time?: string;
  title: string;
  description: string;
  location?: string;
  iconName: "check-in" | "recycling" | "workshop" | "safety";
}

const iconMap = {
  "check-in": ClipboardCheck,
  recycling: Briefcase,
  workshop: BookOpen,
  safety: ShieldCheck,
};

export const DailyAgenda = ({ items }: { items: AgendaItem[] }) => {
  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
        <CardTitle className="text-xl font-bold text-[#1F292E]">Daily Agenda</CardTitle>
        <Badge className="bg-[#E8FBF4] text-[#30D59B] border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Today</Badge>
      </CardHeader>
      <CardContent className="space-y-4 px-8 pb-8">
        {items.map((item) => {
          const Icon = iconMap[item.iconName];
          return (
            <div
              key={item.id}
              className={`group relative flex gap-4 rounded-2xl p-4 transition-all ${
                item.type === "active" 
                  ? "border-2 border-[#30D59B] bg-[#F9FFF7] ring-4 ring-[#30D59B]/5" 
                  : item.type === "completed"
                  ? "bg-slate-50 opacity-60"
                  : "border border-slate-100 bg-white"
              }`}
            >
              {/* Icon Container */}
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                item.type === "active" ? "bg-[#30D59B] text-white" : "bg-slate-100 text-slate-400"
              }`}>
                <Icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  {item.type === "active" && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#30D59B]">Morning</span>
                  )}
                  {item.time && (
                    <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                  )}
                </div>
                <h4 className={`font-bold ${item.type === "active" ? "text-[#1F292E]" : "text-slate-600"}`}>
                  {item.title}
                </h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>
                
                {item.location && (
                  <div className="flex items-center gap-1 pt-1 text-[10px] font-medium text-slate-400">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </div>
                )}

                {item.type === "active" && (
                  <Button className="mt-3 w-full bg-[#30D59B] font-bold text-white hover:bg-[#28B986] rounded-xl py-5">
                    Log Pulse
                  </Button>
                )}

                {item.type === "completed" && (
                  <div className="flex items-center gap-2 pt-2">
                    <CheckCircle2 className="h-4 w-4 text-[#30D59B]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#30D59B]">Completed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
