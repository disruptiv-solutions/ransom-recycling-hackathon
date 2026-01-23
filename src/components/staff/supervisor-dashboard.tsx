"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Target, 
  UserPlus, 
  Users,
  MoreHorizontal,
  Clock,
  Recycle,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import Link from "next/link";

interface CrewMember {
  id: string;
  name: string;
  avatar: string;
  status: "active" | "missing";
  processedLbs: number;
  targetLbs: number;
  lastAction?: string;
}

const MOCK_CREW: CrewMember[] = [
  { id: "1", name: "Marcus Robinson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus", status: "active", processedLbs: 245, targetLbs: 500, lastAction: "Logged 45 lbs" },
  { id: "2", name: "Elena Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", status: "active", processedLbs: 412, targetLbs: 500, lastAction: "Shift Start" },
  { id: "3", name: "Jordan Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan", status: "missing", processedLbs: 0, targetLbs: 500, lastAction: "Last seen 2h ago" },
  { id: "4", name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "active", processedLbs: 180, targetLbs: 400, lastAction: "In Workshop" },
];

export const SupervisorDashboard = ({ supervisorName }: { supervisorName: string }) => {
  const totalProcessed = MOCK_CREW.reduce((acc, member) => acc + member.processedLbs, 0);
  const totalTarget = MOCK_CREW.reduce((acc, member) => acc + member.targetLbs, 0);
  const progressPercentage = Math.round((totalProcessed / totalTarget) * 100);

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Shift Header */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-[#1F292E] md:text-3xl">Active Crew</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Saturday, Jan 17</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Mobile Recycling Center</span>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-bold text-[#1F292E]">Daily Tonnage Goal</span>
                </div>
                <span className="text-sm font-black text-primary">{progressPercentage}%</span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-[#30D59B] transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{totalProcessed.toLocaleString()} lbs processed</span>
                <span>{totalTarget.toLocaleString()} lbs goal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Crew List */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-[#1F292E]">Currently Clocked In</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
            {MOCK_CREW.filter(m => m.status === "active").length} Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {MOCK_CREW.map((member) => (
            <Card key={member.id} className="group overflow-hidden border-none bg-white transition-all hover:shadow-md">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  {/* Member Info */}
                  <Link 
                    href={`/supervisor/participants/${member.id}/log`}
                    className="flex flex-1 items-center gap-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-slate-100">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center ${
                        member.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {member.status === "active" ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#1F292E]">{member.name}</h4>
                        <Badge 
                          className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0 border-none ${
                            member.status === "active" 
                              ? "bg-green-50 text-green-600" 
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{member.lastAction}</p>
                    </div>
                  </Link>

                  {/* Personal Stats */}
                  <div className="flex flex-col gap-2 lg:w-64">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PROGRESS</span>
                      <span className="text-[#1F292E]">{Math.round((member.processedLbs / member.targetLbs) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          member.status === "active" ? "bg-[#30D59B]" : "bg-slate-300"
                        }`}
                        style={{ width: `${(member.processedLbs / member.targetLbs) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#1F292E]">
                        {member.processedLbs} <span className="text-[10px] font-bold text-slate-400">/ {member.targetLbs} lbs</span>
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-primary">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions (Desktop only) */}
                  <div className="hidden gap-2 lg:flex">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-200 font-bold rounded-xl text-xs px-4"
                      asChild
                    >
                      <Link href={`/supervisor/participants/${member.id}/log`}>
                        Log Work
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-200 font-bold rounded-xl text-xs px-4">
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAB */}
      <Button 
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-primary shadow-2xl transition-all hover:scale-110 hover:shadow-primary/40 group z-50 p-0"
        aria-label="Start Shift or Check-in"
      >
        <div className="flex items-center justify-center relative h-full w-full">
          <Plus className="h-8 w-8 text-white transition-transform group-hover:rotate-90" />
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#30D59B] border-2 border-white flex items-center justify-center animate-pulse">
            <UserPlus className="h-3 w-3 text-white" />
          </div>
        </div>
      </Button>

      {/* FAB Label (Optional/On Hover) */}
      <div className="fixed bottom-12 right-28 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
        <Badge className="bg-[#1F292E] text-white border-none py-1 px-3 shadow-lg">
          Add Late-comer
        </Badge>
      </div>
    </div>
  );
};
