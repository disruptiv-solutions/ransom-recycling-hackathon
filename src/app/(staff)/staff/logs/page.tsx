"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Recycle, 
  Scale, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const runtime = "nodejs";

const LOG_ENTRIES = [
  {
    id: "1",
    participant: {
      name: "Marcus Robinson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    type: "material",
    material: "Copper",
    value: "45 lbs",
    time: "10:45 AM",
    date: "2026-01-17",
    status: "verified",
    supervisor: "Sarah Miller",
  },
  {
    id: "2",
    participant: {
      name: "Elena Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    },
    type: "pulse",
    mood: "😊",
    performance: "Excellent",
    note: "Outstanding focus on sorting speed today.",
    time: "09:30 AM",
    date: "2026-01-17",
    status: "verified",
    supervisor: "Sarah Miller",
  },
  {
    id: "3",
    participant: {
      name: "Jordan Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    },
    type: "material",
    material: "Batteries",
    value: "120 lbs",
    time: "Yesterday, 3:15 PM",
    date: "2026-01-16",
    status: "verified",
    supervisor: "John Doe",
  },
  {
    id: "4",
    participant: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    type: "material",
    material: "Circuit Boards",
    value: "12 lbs",
    time: "Yesterday, 1:45 PM",
    date: "2026-01-16",
    status: "flagged",
    supervisor: "John Doe",
  },
  {
    id: "5",
    participant: {
      name: "Marcus Robinson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    type: "pulse",
    mood: "😐",
    performance: "Fair",
    note: "Arrived 10 mins late, but worked hard to catch up.",
    time: "Yesterday, 08:15 AM",
    date: "2026-01-16",
    status: "verified",
    supervisor: "John Doe",
  },
];

export default function SupervisorLogHistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = LOG_ENTRIES.filter((log) => {
    const matchesSearch = log.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.supervisor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const logDate = new Date(log.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const matchesDateRange = (!start || logDate >= start) && (!end || logDate <= end);
    
    return matchesSearch && matchesDateRange;
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#1F292E]">Shift Logs</h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage all recorded shift data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-600 font-bold rounded-xl px-6 py-5">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-[#E8FBF4]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Scale className="h-6 w-6 text-[#30D59B]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Tonnage (Today)</p>
              <p className="text-2xl font-black text-[#1F292E]">1,245 lbs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Entries</p>
              <p className="text-2xl font-black text-[#1F292E]">42</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Flags</p>
              <p className="text-2xl font-black text-[#1F292E]">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by participant or supervisor..." 
                className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input 
                    type="date"
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input 
                    type="date"
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="h-12 border-slate-100 rounded-xl px-4 text-slate-500 font-bold" onClick={() => { setStartDate(""); setEndDate(""); setSearchQuery(""); }}>
                  Reset
                </Button>
                <Button variant="outline" className="h-12 border-slate-100 rounded-xl px-4 text-slate-500 font-bold">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table/List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1F292E]">Recent Activity</h3>
          <span className="text-xs text-slate-400 font-bold">{filteredLogs.length} entries found</span>
        </div>

        <div className="flex flex-col gap-3">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="group border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Type Indicator */}
                  <div className={`w-1 md:w-2 self-stretch ${
                    log.type === "material" ? "bg-[#30D59B]" : "bg-primary"
                  }`} />
                  
                  <div className="flex flex-1 flex-col md:flex-row md:items-center gap-4 p-4 md:p-6">
                    {/* Participant */}
                    <div className="flex items-center gap-3 md:w-64">
                      <Avatar className="h-10 w-10 border-2 border-slate-50">
                        <AvatarImage src={log.participant.avatar} />
                        <AvatarFallback>{log.participant.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1F292E]">{log.participant.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{log.time}</span>
                          <span className="text-[10px] font-bold text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{log.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-wrap items-center gap-4">
                      {log.type === "material" ? (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#E8FBF4] text-[#30D59B] border border-[#30D59B]/10">
                          <Recycle className="h-4 w-4" />
                          <span className="text-sm font-black">{log.value}</span>
                          <span className="text-[10px] font-bold uppercase opacity-70">{log.material}</span>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start gap-3">
                          <div className="text-2xl pt-1">{log.mood}</div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-1.5 py-0">
                                Pulse: {log.performance}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{log.note}&rdquo;</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta/Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-48 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <span>Verified by</span>
                          <span className="text-[#1F292E]">{log.supervisor}</span>
                        </div>
                        {log.status === "flagged" && (
                          <Badge className="mt-1 bg-red-50 text-red-500 border-none text-[8px] font-black uppercase px-1.5 py-0">
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-primary rounded-full">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold">No entries found matching your criteria.</p>
            <Button variant="link" className="text-primary font-bold mt-2" onClick={() => { setStartDate(""); setEndDate(""); setSearchQuery(""); }}>
              Clear all filters
            </Button>
          </div>
        )}

        {filteredLogs.length > 0 && (
          <Button variant="ghost" className="mt-4 w-full py-8 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">
            Load More Activity
          </Button>
        )}
      </div>
    </div>
  );
}
