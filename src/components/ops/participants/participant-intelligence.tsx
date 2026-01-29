"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Info, Zap, Target, Users, BarChart3, Lightbulb, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateAdvancementTimeline } from "@/lib/ops/visualizations/advancement";
import { PeerScatterPlot } from "@/lib/ops/visualizations/peer-scatter";
import { cn } from "@/lib/utils";

type IntelligenceData = {
  snapshot: {
    status: "EXCELLING" | "ON TRACK" | "NEEDS ATTENTION" | "CRITICAL";
    narrative: string;
    actions: string[];
  };
  advancement: {
    onTrack: boolean;
    projectedDay: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    confidence: number;
    gaps: string[];
    requirements: string[];
  };
  peerContext: {
    productivityRank: string;
    attendanceRank: string;
    analysis: string;
    similarProfile: string;
  };
  production: {
    specialization: string;
    efficiency: string;
    opportunity: string;
    analysis: string;
  };
  generatedAt: string;
};

export const ParticipantIntelligence = ({ participantId, participantName, currentDay }: { participantId: string, participantName: string, currentDay: number }) => {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/participant-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const result = await response.json();
      if (result.ok) {
        setData(result);
      } else {
        setError(result.error || "Failed to load intelligence");
      }
    } catch (err) {
      setError("Failed to connect to intelligence engine");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [participantId]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 4);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 4) % 4);

  if (loading) return <IntelligenceSkeleton />;
  if (error) return <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">{error}</div>;
  if (!data) return null;

  const statusColors = {
    EXCELLING: "bg-emerald-100 text-emerald-700 border-emerald-200",
    "ON TRACK": "bg-blue-100 text-blue-700 border-blue-200",
    "NEEDS ATTENTION": "bg-amber-100 text-amber-700 border-amber-200",
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
  };

  const statusIcons = {
    EXCELLING: <CheckCircle2 className="h-5 w-5" />,
    "ON TRACK": <TrendingUp className="h-5 w-5" />,
    "NEEDS ATTENTION": <AlertTriangle className="h-5 w-5" />,
    CRITICAL: <Zap className="h-5 w-5" />,
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">AI Intelligence Modules</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentSlide === i ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200 hover:bg-slate-300"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevSlide} className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSlide} className="h-8 w-8 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {/* Performance Snapshot */}
        <div className={cn("transition-all duration-500", currentSlide === 0 ? "opacity-100 translate-x-0 relative" : "opacity-0 absolute inset-0 pointer-events-none translate-x-8")}>
          <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-bold text-slate-900 uppercase tracking-wider">Performance Snapshot</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchIntelligence} className="text-xs font-bold text-blue-600 hover:bg-blue-100/50">
                <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest", statusColors[data.snapshot.status])}>
                  {statusIcons[data.snapshot.status]}
                  {data.snapshot.status}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Updated {new Date(data.generatedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-inner">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-base leading-relaxed text-slate-700 font-medium">
                    {data.snapshot.narrative}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended Actions</p>
                  </div>
                  <div className="grid gap-3">
                    {data.snapshot.actions.map((action, i) => (
                      <div key={i} className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">{i + 1}</span>
                        <span className="text-sm font-bold text-slate-700 leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="rounded-3xl border border-blue-100 bg-blue-50/30 p-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Next Milestone</p>
                    </div>
                    <p className="text-xl font-black text-slate-900 leading-tight">Mid-Phase Review</p>
                    <p className="mt-2 text-sm font-bold text-blue-600/80 tracking-wide">
                      Scheduled for Day 45 <span className="text-slate-400 font-medium">· in {45 - currentDay} days</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advancement Readiness */}
        <div className={cn("transition-all duration-500", currentSlide === 1 ? "opacity-100 translate-x-0 relative" : "opacity-0 absolute inset-0 pointer-events-none translate-x-8")}>
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold text-slate-900 uppercase tracking-wider">Advancement Readiness Prediction</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div 
                className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-inner"
                dangerouslySetInnerHTML={{ __html: generateAdvancementTimeline({
                  currentDay,
                  phaseLength: 90,
                  onTrack: data.advancement.onTrack,
                  projectedDay: data.advancement.projectedDay
                })}}
              />
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Trajectory</p>
                    <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full", 
                      data.advancement.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 
                      data.advancement.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    )}>
                      {data.advancement.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {data.advancement.onTrack ? "On track for scheduled advancement." : `Projected delay of ${data.advancement.projectedDay - 90} days.`}
                  </p>
                  <div className="space-y-2">
                    {data.advancement.gaps.map((gap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        {gap}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advancement Requirements</p>
                  <div className="grid gap-2">
                    {data.advancement.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-bold text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                        {req}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${data.advancement.confidence}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{data.advancement.confidence}% CONFIDENCE</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Peer Comparison */}
        <div className={cn("transition-all duration-500", currentSlide === 2 ? "opacity-100 translate-x-0 relative" : "opacity-0 absolute inset-0 pointer-events-none translate-x-8")}>
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-bold text-slate-900 uppercase tracking-wider">Peer Comparison</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <PeerScatterPlot 
                  currentParticipantName={participantName}
                  data={[
                    { name: participantName, attendance: 60, productivity: 9.96, isCurrent: true },
                    { name: "Peer A", attendance: 85, productivity: 8.2 },
                    { name: "Peer B", attendance: 92, productivity: 7.5 },
                    { name: "Peer C", attendance: 78, productivity: 11.2 },
                    { name: "Peer D", attendance: 88, productivity: 8.8 },
                    { name: "Peer E", attendance: 95, productivity: 6.4 },
                  ]} 
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 rounded-3xl border border-slate-100 bg-slate-50 p-6 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Productivity</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{data.peerContext.productivityRank.replace('_', ' ')}</p>
                    </div>
                    <div className="flex-1 rounded-3xl border border-slate-100 bg-slate-50 p-6 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Attendance</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{data.peerContext.attendanceRank.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {data.peerContext.similarProfile !== "None" && (
                    <div className="flex items-start gap-4 rounded-[2.5rem] bg-blue-600 p-6 shadow-xl shadow-blue-600/20">
                      <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Success Pattern</p>
                        <p className="text-sm font-bold text-white leading-relaxed">
                          Similar Profile: <span className="underline decoration-white/30 underline-offset-4">{data.peerContext.similarProfile}</span> recovered with transportation assistance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-3xl bg-slate-900 p-8 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="h-24 w-24 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Peer Analysis</p>
                    <p className="text-lg font-bold leading-relaxed text-white italic">
                      "{data.peerContext.analysis}"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Insights */}
        <div className={cn("transition-all duration-500", currentSlide === 3 ? "opacity-100 translate-x-0 relative" : "opacity-0 absolute inset-0 pointer-events-none translate-x-8")}>
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg font-bold text-slate-900 uppercase tracking-wider">Production Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[2.5rem] bg-slate-900 p-8 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BarChart3 className="h-24 w-24 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Production Analysis</p>
                    <p className="text-lg font-bold leading-relaxed text-white">
                      {data.production.analysis}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Material Specialization</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{data.production.specialization}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Efficiency Pattern</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{data.production.efficiency}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-[2.5rem] border-2 border-dashed border-amber-200 bg-amber-50/30 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Strategic Growth Opportunity</p>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {data.production.opportunity}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const IntelligenceSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between px-2">
      <Skeleton className="h-5 w-48" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-1.5 w-24 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
    <Skeleton className="h-[450px] w-full rounded-3xl" />
  </div>
);
