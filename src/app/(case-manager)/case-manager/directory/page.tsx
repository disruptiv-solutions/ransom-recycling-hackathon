"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Plus, 
  LayoutList, 
  Kanban,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhaseBoard, Participant } from "@/components/staff/phase-board";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDemoMode } from "@/lib/demo-mode";

const MOCK_PARTICIPANTS: Participant[] = [
  { 
    id: "1", 
    name: "Amaya Johnson", 
    phase: "intake", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amaya", 
    riskLevel: "none", 
    lastCheckIn: "Today", 
    pulseEmoji: "😊", 
    missedHours: false,
    weightLbs: 12,
    totalHours: 6
  },
  { 
    id: "2", 
    name: "Elijah Brooks", 
    phase: "development", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elijah", 
    riskLevel: "low", 
    lastCheckIn: "2 days ago", 
    pulseEmoji: "😐", 
    missedHours: false,
    weightLbs: 85,
    totalHours: 42
  },
  { 
    id: "3", 
    name: "Sofia Martinez", 
    phase: "development", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia", 
    riskLevel: "low", 
    lastCheckIn: "1 week ago", 
    pulseEmoji: "🙂", 
    missedHours: false,
    weightLbs: 120,
    totalHours: 58
  },
  { 
    id: "4", 
    name: "Noah Evans", 
    phase: "readiness", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah", 
    riskLevel: "high", 
    lastCheckIn: "Yesterday", 
    pulseEmoji: "😔", 
    missedHours: true,
    weightLbs: 310,
    totalHours: 115
  },
  { 
    id: "5", 
    name: "Zoe Carter", 
    phase: "intake", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe", 
    riskLevel: "none", 
    lastCheckIn: "3 days ago", 
    pulseEmoji: "😊", 
    missedHours: false,
    weightLbs: 30,
    totalHours: 14
  },
  { 
    id: "6", 
    name: "Aiden Wright", 
    phase: "employed", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden", 
    riskLevel: "none", 
    lastCheckIn: "5 days ago", 
    pulseEmoji: "🎉", 
    missedHours: false,
    weightLbs: 1200,
    totalHours: 340
  },
  { 
    id: "7", 
    name: "Maya Patel", 
    phase: "intake", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya", 
    riskLevel: "low", 
    lastCheckIn: "Today", 
    pulseEmoji: "🙂", 
    missedHours: false,
    weightLbs: 18,
    totalHours: 9
  },
  { 
    id: "8", 
    name: "Lucas Nguyen", 
    phase: "readiness", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas", 
    riskLevel: "none", 
    lastCheckIn: "1 week ago", 
    pulseEmoji: "😊", 
    missedHours: false,
    weightLbs: 450,
    totalHours: 120
  },
  { 
    id: "9", 
    name: "Grace Kim", 
    phase: "readiness", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace", 
    riskLevel: "high", 
    lastCheckIn: "2 weeks ago", 
    pulseEmoji: "😟", 
    missedHours: true,
    weightLbs: 260,
    totalHours: 95
  },
  { 
    id: "10", 
    name: "Ethan Reynolds", 
    phase: "employed", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan", 
    riskLevel: "none", 
    lastCheckIn: "Jan 10, 2026", 
    pulseEmoji: "🎉", 
    missedHours: false,
    weightLbs: 980,
    totalHours: 280
  },
];

const ParticipantDirectoryPage = () => {
  const { isDemoMode } = useDemoMode();
  const visibleParticipants = useMemo(() => (isDemoMode ? MOCK_PARTICIPANTS : []), [isDemoMode]);

  const getStatusBadge = (participant: Participant) => {
    if (participant.riskLevel === "high" || participant.missedHours) {
      return <Badge className="bg-red-100 text-red-700 border-none hover:bg-red-100">At Risk</Badge>;
    }
    if (participant.riskLevel === "low" || participant.pulseEmoji === "😔") {
      return <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100">Needs Attention</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">On Track</Badge>;
  };

  return (
    <div className="relative flex w-full flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Participant Directory</h1>
          <p className="text-sm text-slate-500 md:text-base">
            Manage the BridgePath pipeline and track participant growth.
          </p>
        </div>
        <Button className="w-full rounded-xl bg-primary h-12 px-6 font-bold text-white hover:bg-primary/90 sm:w-auto">
          <Plus className="mr-2 h-5 w-5" /> Add Participant
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="w-full" id="directory-tabs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-1">
            <div className="relative md:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Find participant..." 
                className="pl-11 rounded-full border-none bg-white shadow-sm focus:ring-2 focus:ring-primary" 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm border-none h-10 w-10">
                <Filter className="h-4 w-4 text-slate-500" />
              </Button>
              <Button variant="outline" className="rounded-full bg-white shadow-sm border-none px-6 h-10 font-bold text-slate-500">
                Phase: All
              </Button>
            </div>
          </div>

          <TabsList className="bg-slate-200/50 p-1 rounded-full self-start md:self-auto">
            <TabsTrigger value="kanban" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">
              <Kanban className="mr-2 h-4 w-4" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">
              <LayoutList className="mr-2 h-4 w-4" /> List
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-8 outline-none">
          {visibleParticipants.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">
              Demo mode is off. Enable demo mode to view mock participants.
            </div>
          ) : (
            <PhaseBoard initialParticipants={visibleParticipants} />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-8 outline-none">
          <Card className="rounded-[2rem] border-none bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none">
                      <TableHead className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Participant</TableHead>
                      <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-center">Phase</TableHead>
                      <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-center">Growth</TableHead>
                      <TableHead className="py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                      <TableHead className="px-8 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleParticipants.length === 0 ? (
                      <TableRow className="border-slate-50">
                        <TableCell colSpan={5} className="px-8 py-10 text-center text-sm text-slate-500">
                          Demo mode is off. Enable demo mode to view mock participants.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleParticipants.map((p) => (
                      <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 rounded-2xl border-2 border-slate-100">
                              <AvatarImage src={p.avatar} />
                              <AvatarFallback>{p.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-500">ID: #BP-{1000 + parseInt(p.id)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-bold border-slate-200 text-slate-600 rounded-full px-4 uppercase text-[10px] tracking-tight">
                            {p.phase}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-bold text-slate-700">{p.weightLbs || 0} lbs</span>
                            <span className="text-[10px] text-slate-400">{p.totalHours || 0} hrs worked</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(p)}
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-primary hover:bg-primary/5">
                            <Link href={`/case-manager/participants/${p.id}`} className="flex items-center gap-2">
                              Profile <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParticipantDirectoryPage;
