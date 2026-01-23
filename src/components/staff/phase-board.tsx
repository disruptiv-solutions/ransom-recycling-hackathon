"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CircleAlert as AlertCircle, 
  CircleCheckBig as CheckCircle2, 
  MessageSquare, 
  Clock, 
  TriangleAlert as AlertTriangle,
  Scale,
  Frown,
  MoreHorizontal,
  X,
  BadgeCheck,
  CalendarCheck,
  FileEdit,
  ArrowRight,
  ArrowLeft,
  Leaf,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type Phase = "intake" | "development" | "readiness" | "employed";

export interface Participant {
  id: string;
  name: string;
  phase: Phase;
  avatar: string;
  riskLevel: "none" | "low" | "high";
  lastCheckIn: string;
  pulseEmoji: string;
  missedHours: boolean;
  weightLbs?: number;
  totalHours?: number;
}

const PHASES: { id: Phase; label: string; description: string }[] = [
  { id: "intake", label: "Intake", description: "New participants entering the program" },
  { id: "development", label: "Personal Dev", description: "Skill building and personal growth" },
  { id: "readiness", label: "Job Ready", description: "Ready for placement opportunities" },
  { id: "employed", label: "Employed", description: "Successfully placed in a role" },
];

// Hooks
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Components
const ParticipantCard = ({ 
  participant, 
  onMovePhase,
  basePath,
}: { 
  participant: Participant; 
  onMovePhase: (id: string, direction: 'up' | 'down') => void;
  basePath: string;
}) => {
  const getRiskStyles = () => {
    if (participant.riskLevel === "high" || participant.missedHours) {
      return "border-red-400 border-2 risk-pulse-red";
    }
    if (participant.riskLevel === "low" || participant.pulseEmoji === "😔") {
      return "border-amber-400 border-2 attention-pulse-amber";
    }
    return "border-slate-100 dark:border-slate-800";
  };

  const currentPhaseIdx = PHASES.findIndex(p => p.id === participant.phase);
  const canMoveUp = currentPhaseIdx < PHASES.length - 1;
  const canMoveDown = currentPhaseIdx > 0;

  return (
    <Card 
      className={cn(
        "mb-3 transition-all hover:shadow-md w-full rounded-[2rem]",
        getRiskStyles()
      )}
    >
      <CardContent className="p-6">
        <div className="flex gap-4 mb-4">
          <Avatar className="h-12 w-12 rounded-2xl">
            <AvatarImage src={participant.avatar} className="object-cover" />
            <AvatarFallback>{participant.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-black text-slate-800 dark:text-white text-base truncate">{participant.name}</h4>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {participant.phase === "intake" ? `Joined ${participant.lastCheckIn}` : 
               participant.phase === "employed" ? "Starbucks Barista" : 
               participant.riskLevel === "high" ? "Missed Shift" : "Validated Progress"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {participant.pulseEmoji === "😔" ? "😔" : participant.pulseEmoji}
            </span>
            <Link 
              href={`${basePath}/${participant.id}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-primary hover:text-white dark:bg-slate-800"
              title="View Profile"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{participant.weightLbs || 0} lbs</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{participant.totalHours || 0} hrs</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canMoveDown && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-400"
                onClick={() => onMovePhase(participant.id, 'down')}
                aria-label="Phase Down"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {canMoveUp && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-primary/5 text-primary"
                onClick={() => onMovePhase(participant.id, 'up')}
                aria-label="Phase Up"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {participant.missedHours && (
          <div className="mt-2">
            <Badge variant="destructive" className="h-4 px-1 text-[8px] font-bold uppercase">
              Missed
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PhaseColumn = ({ phase, participants, onMovePhase, basePath }: { phase: typeof PHASES[0]; participants: Participant[]; onMovePhase: (id: string, direction: 'up' | 'down') => void; basePath: string }) => {
  return (
    <div className="flex flex-col w-full md:min-w-[280px] md:max-w-[320px] shrink-0">
      <div className="mb-6 hidden items-center justify-between px-4 md:flex">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-primary uppercase tracking-[0.2em] text-[10px]">
            {phase.label}
          </h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {participants.length}
          </span>
        </div>
        <button className="text-slate-300 hover:text-primary transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 rounded-xl bg-[#f2f0ed]/50 dark:bg-slate-900/50 p-3 min-h-[500px] border border-primary/5 md:p-4">
        <div className="flex flex-col gap-3">
          {participants.map((p) => (
            <ParticipantCard key={p.id} participant={p} onMovePhase={onMovePhase} basePath={basePath} />
          ))}
          {participants.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No participants
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function PhaseBoard({ initialParticipants, basePath = "/case-manager/participants" }: { initialParticipants: Participant[]; basePath?: string }) {
  const isMobile = useIsMobile();
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [pendingMove, setPendingMove] = useState<{ id: string; name: string; targetPhase: Phase; originalPhase: Phase } | null>(null);
  const [activeTab, setActiveTab] = useState<Phase>("intake");

  const handleMovePhase = useCallback((id: string, direction: 'up' | 'down') => {
    setParticipants(prev => {
      const participant = prev.find(p => p.id === id);
      if (!participant) return prev;

      const currentPhaseIdx = PHASES.findIndex(p => p.id === participant.phase);
      const nextPhaseIdx = direction === 'up' ? currentPhaseIdx + 1 : currentPhaseIdx - 1;

      if (nextPhaseIdx < 0 || nextPhaseIdx >= PHASES.length) return prev;

      const targetPhase = PHASES[nextPhaseIdx].id;
      const originalPhase = participant.phase;

      // Determine if validation is needed (Promotion to Job Ready or Employed)
      const isPromotion = 
        (targetPhase === "readiness" && originalPhase !== "readiness") ||
        (targetPhase === "employed" && originalPhase !== "employed");

      if (isPromotion && direction === 'up') {
        setPendingMove({ 
          id, 
          name: participant.name,
          targetPhase,
          originalPhase
        });
      }

      // Automatically switch tab on mobile
      if (isMobile) {
        setActiveTab(targetPhase);
      }

      return prev.map(p => p.id === id ? { ...p, phase: targetPhase } : p);
    });
  }, [isMobile]);

  const confirmMove = useCallback(() => {
    setPendingMove(null);
  }, []);

  const cancelMove = useCallback(() => {
    if (pendingMove) {
      setParticipants(prev => {
        return prev.map(p => p.id === pendingMove.id ? { ...p, phase: pendingMove.originalPhase } : p);
      });
      if (isMobile) setActiveTab(pendingMove.originalPhase);
      setPendingMove(null);
    }
  }, [pendingMove, isMobile]);

  const columns = useMemo(() => {
    return PHASES.map(phase => ({
      ...phase,
      participants: participants.filter(p => p.phase === phase.id)
    }));
  }, [participants]);

  return (
    <div className="w-full">
      {isMobile ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Phase)} className="w-full">
          <div className="sticky top-0 z-30 mb-6 bg-slate-50/95 py-6 backdrop-blur-md">
            <TabsList className="flex h-14 w-full items-center justify-around gap-2 bg-slate-200/50 p-2 rounded-full border border-slate-100 shadow-sm">
              {PHASES.map((phase) => (
                <TabsTrigger
                  key={phase.id}
                  value={phase.id}
                  className="rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md"
                >
                  {phase.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {columns.map((column) => (
            <TabsContent 
              key={column.id} 
              value={column.id} 
              forceMount 
              className={cn(
                "mt-0 outline-none transition-opacity duration-200",
                activeTab !== column.id && "hidden"
              )}
            >
              <PhaseColumn 
                phase={column} 
                participants={column.participants} 
                onMovePhase={handleMovePhase}
                basePath={basePath}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
          {columns.map((column) => (
            <PhaseColumn 
              key={column.id} 
              phase={column} 
              participants={column.participants} 
              onMovePhase={handleMovePhase}
              basePath={basePath}
            />
          ))}
        </div>
      )}

      {/* Phase Change Modal */}
      <Dialog open={!!pendingMove} onOpenChange={(open) => !open && cancelMove()}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none bg-white/70 backdrop-blur-xl shadow-2xl">
          <div className="relative p-8">
            {/* Soft Glow Decoration */}
            <div className="absolute -top-12 -right-12 size-32 bg-tracker-mint/30 blur-3xl rounded-full"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <DialogTitle className="text-xl font-bold text-primary">Transition Validation</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500">
                    Promoting <strong className="text-slate-900">{pendingMove?.name}</strong> to {PHASES.find(p => p.id === pendingMove?.targetPhase)?.label}
                  </DialogDescription>
                </div>
                <button 
                  onClick={cancelMove}
                  className="size-8 rounded-full hover:bg-white/50 transition-colors flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Checklist Section */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-primary/10">
                  <div className="flex h-5 w-5 items-center justify-center rounded border-primary bg-primary text-white">
                    <BadgeCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Certification Check</p>
                    <p className="text-xs text-slate-500">Safety & health certifications verified</p>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-primary/10">
                  <div className="flex h-5 w-5 items-center justify-center rounded border-primary bg-primary text-white">
                    <CalendarCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Attendance Check</p>
                    <p className="text-xs text-slate-500">95% attendance over last 30 days</p>
                  </div>
                  <CalendarCheck className="h-5 w-5 text-primary" />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-primary/10 group cursor-pointer hover:bg-white/80 transition-all">
                  <div className="flex h-5 w-5 items-center justify-center rounded border-slate-300 border bg-white"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Supervisor Sign-off</p>
                    <p className="text-xs text-slate-500">Final review by area lead</p>
                  </div>
                  <FileEdit className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {/* Leaf Animation Decoration */}
                  <div className="absolute -right-6 -top-6 text-primary/60 animate-bounce">
                    <Leaf className="h-6 w-6 fill-primary/20" />
                  </div>
                  <Button 
                    onClick={confirmMove}
                    className="bg-tracker-mint hover:bg-tracker-mint/90 text-primary font-bold py-7 px-12 rounded-xl transition-all shadow-lg shadow-tracker-mint/20 flex items-center gap-2 group border-none"
                  >
                    <span>Confirm Transition</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <button 
                  onClick={cancelMove}
                  className="text-[10px] text-slate-400 uppercase tracking-widest font-bold hover:text-slate-600 transition-colors"
                >
                  Cancel & Revert
                </button>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Validation stage: 2 of 3 complete</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
