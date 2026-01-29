"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Users, Target, Recycle, DollarSign, Award, Briefcase, TrendingUp, Clock, BarChart3, Info, FileText, FileDown, Sparkles, Quote } from "lucide-react";

import type { ReportResult, VisualizationSpec } from "@/lib/ops/types";
import { formatDisplayDate } from "@/lib/ops/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReportCharts } from "./report-charts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  generateImpactEquivalenceSvg,
  generateParticipantJourneySvg,
  generateRevenueImpactSvg,
} from "@/lib/ops/visualizations";

type ReportDetailProps = {
  report: ReportResult;
  isAdmin: boolean;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const formatStatLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatStatValue = (key: string, value: string | number) => {
  if (typeof value !== "number") return value;
  if (["revenue", "laborCost", "netValue"].includes(key)) return formatCurrency(value);
  if (["totalWeight", "lbsDiverted"].includes(key)) return `${formatNumber(value)} lbs`;
  if (key === "retention") return `${formatNumber(value)}%`;
  return formatNumber(value);
};

const getVisualizationSvg = (spec: VisualizationSpec) => {
  const data = spec.data || {};
  if (spec.type === "icon_progression") {
    return generateParticipantJourneySvg({
      started: toNumber(data.started),
      retained: toNumber(data.retained),
      placements: toNumber(data.placements),
    });
  }
  if (spec.type === "impact_equivalence") {
    return generateImpactEquivalenceSvg({
      weightProcessed: toNumber(data.weightProcessed),
      revenue: toNumber(data.revenue),
    });
  }
  if (spec.type === "revenue_progress") {
    return generateRevenueImpactSvg({
      revenue: toNumber(data.revenue),
      targetRevenue: toNumber(data.targetRevenue),
      participantCount: toNumber(data.participantCount),
    });
  }
  if (spec.type === "custom_infographic") {
    if (data.started !== undefined || data.retained !== undefined || data.placements !== undefined) {
      return generateParticipantJourneySvg({
        started: toNumber(data.started),
        retained: toNumber(data.retained),
        placements: toNumber(data.placements),
      });
    }
    if (data.weightProcessed !== undefined) {
      return generateImpactEquivalenceSvg({
        weightProcessed: toNumber(data.weightProcessed),
        revenue: toNumber(data.revenue),
      });
    }
    return generateRevenueImpactSvg({
      revenue: toNumber(data.revenue),
      targetRevenue: toNumber(data.targetRevenue),
      participantCount: toNumber(data.participantCount),
    });
  }
  return null;
};

export const ReportDetail = ({ report, isAdmin }: ReportDetailProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("content");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;

    const res = await fetch(`/api/reports/${report.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/reports");
    }
  };

  const hasCharts = report.chartConfigurations && report.chartConfigurations.length > 0;
  const visualizations = report.visualizationSpecs || [];
  const hasVisualizations = visualizations.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/reports")}
            className="group mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-primary print:hidden"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Archive
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{report.title}</h1>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDisplayDate(report.generatedAt)}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              {report.reportType}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="h-11 rounded-xl border-slate-200 font-bold shadow-sm transition-all hover:bg-slate-50 print:hidden"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          {isAdmin && (
            <Button variant="ghost" onClick={handleDelete} className="h-11 rounded-xl font-bold text-red-500 transition-all hover:bg-red-50 hover:text-red-600 print:hidden">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Key Statistics - High Impact Design */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Main Impact Card */}
        <Card className="relative overflow-hidden border-none bg-slate-900 text-white shadow-2xl lg:col-span-2 impact-card print:border-2 print:border-black">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-64 w-64 rounded-full bg-primary/20 blur-3xl print:hidden" />
          <CardContent className="relative p-8 print:p-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary print:text-slate-500">Total Economic Impact</p>
                <h3 className="mt-2 text-5xl font-black tracking-tighter print:text-4xl print:text-black">
                  {formatCurrency(toNumber(report.stats.revenue))}
                </h3>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md print:bg-slate-50 print:border print:border-slate-200">
                <TrendingUp className="h-8 w-8 text-primary print:text-black" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 print:border-slate-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 print:text-slate-500">Net Program Value</p>
                <p className="mt-1 text-2xl font-bold print:text-xl print:text-black">{formatCurrency(toNumber(report.stats.netValue))}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 print:text-slate-500">Wages Distributed</p>
                <p className="mt-1 text-2xl font-bold print:text-xl print:text-black">{formatCurrency(toNumber(report.stats.laborCost))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Card */}
        <Card className="flex flex-col justify-between border-none bg-emerald-600 text-white shadow-xl impact-card print:border-2 print:border-black">
          <CardContent className="p-8 print:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 print:bg-slate-50 print:border print:border-slate-200">
              <Recycle className="h-6 w-6 print:text-black" />
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 print:text-slate-500">Materials Diverted</p>
              <h3 className="mt-1 text-4xl font-black tracking-tight print:text-3xl print:text-black">
                {formatNumber(toNumber(report.stats.totalWeight))}
                <span className="ml-2 text-lg font-medium opacity-80 print:text-slate-500">lbs</span>
              </h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-100 print:text-slate-500">
              <Target className="h-3 w-3" />
              <span>Grant Milestone: 85% of Goal</span>
            </div>
          </CardContent>
        </Card>

        {/* Workforce Card */}
        <Card className="flex flex-col justify-between border-none bg-blue-600 text-white shadow-xl impact-card print:border-2 print:border-black">
          <CardContent className="p-8 print:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 print:bg-slate-50 print:border print:border-slate-200">
              <Users className="h-6 w-6 print:text-black" />
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 print:text-slate-500">Active Participants</p>
              <h3 className="mt-1 text-4xl font-black tracking-tight print:text-3xl print:text-black">
                {formatNumber(toNumber(report.stats.participantCount))}
              </h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-100 print:text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{formatNumber(toNumber(report.stats.hours))} Training Hours</span>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <Award className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Certifications</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatNumber(toNumber(report.stats.certifications))}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <Briefcase className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Placements</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatNumber(toNumber(report.stats.placements))}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Retention</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{toNumber(report.stats.retention)}%</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <Info className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Program Health</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary" style={{ width: '92%' }} />
              </div>
              <span className="text-xs font-bold text-slate-600">92%</span>
            </div>
          </div>
        </div>

        {/* Phase Breakdown - Modern Horizontal Treatment */}
        <Card className="border-slate-100 bg-slate-50/50 shadow-none lg:col-span-4">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="shrink-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Workforce Pipeline</p>
                <h4 className="text-sm font-bold text-slate-900">Phase Distribution</h4>
              </div>
                      <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
                {report.stats.phaseBreakdown && typeof report.stats.phaseBreakdown === "object" && 
                  Object.entries(report.stats.phaseBreakdown)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([phase, count]) => (
                      <div key={phase} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 shadow-sm transition-all hover:shadow-md">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-black text-primary">
                          P{phase}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{formatNumber(Number(count))}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Content and Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-14 w-full items-center justify-start gap-8 border-b border-slate-200 bg-transparent p-0 print:hidden">
          <TabsTrigger 
            value="content" 
            className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-4 text-sm font-bold text-slate-500 transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Report Narrative
          </TabsTrigger>
          <TabsTrigger 
            value="charts" 
            disabled={!hasCharts && !hasVisualizations}
            className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-4 text-sm font-bold text-slate-500 transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
          >
            Impact Stories & Visuals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-10 space-y-10 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              {/* AI-Generated Narrative */}
              {report.narrative && (
                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-widest text-[10px]">Executive Summary</h2>
                  </div>
                  <div className="relative rounded-3xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-md">
                    <div className="prose prose-slate max-w-none">
                      <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-line font-medium print:hidden">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {report.narrative}
                        </ReactMarkdown>
                      </div>
                      {report.pdfNarrative && (
                        <div className="hidden print:block text-lg leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report.pdfNarrative}
                          </ReactMarkdown>
                        </div>
                      )}
                      {!report.pdfNarrative && (
                        <div className="hidden print:block text-lg leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report.narrative}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Participant Stories */}
              {report.stories && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Quote className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-widest text-[10px]">Human Impact Stories</h2>
                  </div>
                  <div className="grid gap-6">
                    {report.stories.split('\n\n').map((story, i) => (
                      <div key={i} className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
                        <div className="prose prose-slate max-w-none">
                          <div className="text-slate-600 italic leading-relaxed whitespace-pre-line">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {story}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Report Metadata Sidebar */}
              <div className="sticky top-24 space-y-6">
                <Card className="overflow-hidden border-none bg-slate-50 shadow-none">
                  <CardHeader className="border-b border-slate-100 bg-white/50 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Report Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coverage Period</p>
                      <p className="text-sm font-bold text-slate-700">
                        {formatDisplayDate(report.startDate)} - {formatDisplayDate(report.endDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Report Framework</p>
                      <p className="text-sm font-bold text-slate-700 capitalize">{report.reportType} Analysis</p>
                    </div>
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Included Components</p>
                      <div className="flex flex-wrap gap-2">
                        {report.includeNarrative && <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm">Narrative</span>}
                        {report.includeStories && <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm">Stories</span>}
                        {report.includeCharts && <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm">Visuals</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-xs font-bold text-slate-400">This report is encrypted and verified for grant compliance.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-10 space-y-10 focus-visible:outline-none">
          {hasVisualizations ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Visual Narrative</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Impact Stories</h2>
                </div>
                <div className="hidden h-px flex-1 bg-slate-100 mx-8 md:block" />
                <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 border border-slate-100">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-slate-600">AI-Generated Visuals</span>
                </div>
              </div>

              <div className="grid gap-10">
                {visualizations.map((spec, index) => {
                  const svg = getVisualizationSvg(spec);
                  if (!svg) return null;
                  return (
                    <div key={`${spec.type}-${index}`} className="group space-y-6 impact-story-section">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                        <div className="flex-1">
                          <div className="relative rounded-[2rem] border border-slate-100 bg-white p-2 shadow-sm transition-all group-hover:shadow-xl group-hover:border-primary/10">
                            <div
                              className="w-full overflow-hidden rounded-[1.8rem]"
                              role="img"
                              aria-label={spec.title}
                              dangerouslySetInnerHTML={{ __html: svg }}
                            />
                          </div>
                        </div>
                        
                        <div className="w-full lg:w-80 space-y-6 pt-4">
                          <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900">{spec.title}</h3>
                            {spec.subtitle ? <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">{spec.subtitle}</p> : null}
                          </div>
                          
                          {spec.annotations && spec.annotations.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Takeaways</p>
                              <div className="grid gap-2">
                                {spec.annotations.map((note, noteIndex) => (
                                  <div key={`${spec.title}-note-${noteIndex}`} className="relative rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-bold text-slate-600 transition-colors hover:bg-white hover:border-primary/20">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary/20 rounded-r-full" />
                                    {note}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {hasCharts && (
            <div className="pt-10 border-t border-slate-100">
              <div className="mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supporting Data</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Detailed Analytics</h2>
              </div>
              <ReportCharts chartConfigurations={report.chartConfigurations!} />
            </div>
          )}

          {!hasCharts && !hasVisualizations && (
            <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <BarChart3 className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-400">No visual data available for this report.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
