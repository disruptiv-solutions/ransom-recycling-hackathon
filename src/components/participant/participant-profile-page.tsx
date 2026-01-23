"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  UserCircle,
  FileDown,
  FileText,
  Settings2,
  Plus,
  Award,
  HeartPulse,
  Users,
  Star,
  Lock,
  Clock,
  Scale,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IntakeStatus = "incomplete" | "in_progress" | "complete";

const getIntakeBadge = (status: IntakeStatus) => {
  if (status === "complete") {
    return <Badge className="rounded-full border-none bg-green-100 px-3 text-green-700 hover:bg-green-100">Complete</Badge>;
  }
  if (status === "in_progress") {
    return <Badge className="rounded-full border-none bg-blue-100 px-3 text-blue-700 hover:bg-blue-100">In progress</Badge>;
  }
  return <Badge className="rounded-full border-none bg-slate-100 px-3 text-slate-700 hover:bg-slate-100">Incomplete</Badge>;
};

const AttendanceChart = ({ percentage }: { percentage: number }) => {
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative size-32">
      <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36">
        <circle
          className="text-slate-100 dark:text-slate-800"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="18"
          cy="18"
        />
        <circle
          className="text-primary transition-all duration-1000 ease-in-out"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="18"
          cy="18"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{percentage}%</span>
        <span className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
      </div>
    </div>
  );
};

const PulseBar = ({ value, label, max = 10 }: { value: number; label: string; max?: number }) => {
  const height = (value / max) * 100;
  return (
    <div className="group flex flex-1 flex-col items-center gap-2">
      <div className="relative h-48 w-1.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className="absolute bottom-0 w-full rounded-full bg-primary transition-all duration-500"
          style={{ height: `${height}%` }}
        />
        <div className="absolute inset-0 cursor-help transition-colors group-hover:bg-primary/5" />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
          {value}
        </span>
      </div>
      <span className="text-[9px] font-bold uppercase text-slate-400">{label}</span>
    </div>
  );
};

const TimelineCard = ({
  type,
  title,
  description,
  time,
  tags,
  metrics,
  hasAction,
}: {
  type: "note" | "work" | "workshop" | "general";
  title: string;
  description: string;
  time: string;
  tags?: string[];
  metrics?: { label: string; icon: any }[];
  hasAction?: boolean;
}) => {
  const labels = {
    note: "Case Manager Note",
    work: "Daily Work Log",
    workshop: "Workshop Completion",
    general: "General Log",
  };

  return (
    <div
      className={cn(
        "rounded-xl border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-slate-900",
        type === "note"
          ? "border-l-[#E6C259]"
          : type === "workshop"
            ? "border-l-[#4DDBD6]"
            : "border-l-[#9FE2BF]",
      )}
    >
      <div className="mb-3 flex justify-between">
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            type === "note"
              ? "text-[#E6C259]"
              : type === "workshop"
                ? "text-[#4DDBD6]"
                : "text-[#9FE2BF]",
          )}
        >
          {labels[type]}
        </span>
        <span className="text-[10px] font-bold text-slate-400">{time}</span>
      </div>
      <h4 className="mb-2 text-lg font-bold leading-tight text-slate-900 dark:text-white">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>

      {tags ? (
        <div className="mt-4 flex gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {metrics ? (
        <div className="mt-4 flex items-center gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-1">
              <m.icon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {hasAction ? (
        <div className="mt-4">
          <button className="flex items-center gap-1 text-[10px] font-black uppercase text-primary transition-all hover:gap-2">
            View Certificate <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

const ParticipantProfilePage = ({ participantId }: { participantId: string }) => {
  const pathname = usePathname();
  const [intakeStatus, setIntakeStatus] = useState<IntakeStatus>("incomplete");
  const [intakeUpdatedAtLabel, setIntakeUpdatedAtLabel] = useState<string | null>(null);

  const intakeHref = useMemo(() => {
    if (pathname.startsWith("/admin/participants/")) return `/admin/participants/${participantId}/intake`;
    if (pathname.startsWith("/case-manager/participants/")) return `/case-manager/participants/${participantId}/intake`;
    if (pathname.startsWith("/staff/participants/")) return `/staff/participants/${participantId}/intake`;
    return null;
  }, [pathname, participantId]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/participants/${participantId}/intake`, { method: "GET" });
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; intakeStatus?: IntakeStatus; intakeUpdatedAt?: string | null }
          | null;

        if (!res.ok || !data?.ok || !data.intakeStatus) return;
        setIntakeStatus(data.intakeStatus);
        setIntakeUpdatedAtLabel(typeof data.intakeUpdatedAt === "string" ? data.intakeUpdatedAt : null);
      } catch {
        // ignore
      }
    };
    run();
  }, [participantId]);

  // Mock engagement data
  const pulseData = [
    { value: 8.2, label: "Mon" },
    { value: 8.9, label: "Tue" },
    { value: 7.1, label: "Wed" },
    { value: 9.4, label: "Thu" },
    { value: 8.5, label: "Fri" },
    { value: 7.8, label: "Sat" },
    { value: 9.1, label: "Sun" },
  ];

  return (
    <div className="flex w-full flex-col gap-6 md:gap-8">
      {/* Header */}
      <header className="-mx-4 -mt-4 mb-4 flex flex-col gap-6 border-b border-slate-200 bg-white/80 px-6 py-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:-mx-8 md:-mt-8 md:mb-0 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded bg-primary text-white md:size-14">
            <UserCircle className="h-8 w-8 md:h-9 md:w-9" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white md:text-3xl">
              Marcus Thompson
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary md:text-xs">
                Phase 2: Employment Ready
              </span>
              <span className="text-[10px] font-medium text-slate-400 md:text-xs">• Joined Oct 2023</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide md:gap-3 md:pb-0">
          <Button
            variant="ghost"
            className="h-10 shrink-0 gap-2 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 md:h-11 md:px-5 md:text-sm"
          >
            <FileDown className="h-4 w-4 md:h-5 md:w-5" /> Export
          </Button>
          <Button
            variant="ghost"
            className="h-10 shrink-0 gap-2 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 md:h-11 md:px-5 md:text-sm"
          >
            <Settings2 className="h-4 w-4 md:h-5 md:w-5" /> Settings
          </Button>
          <Button className="h-10 shrink-0 gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 md:h-11 md:px-8 md:text-sm">
            <Plus className="h-4 w-4 md:h-5 md:w-5" /> Add Entry
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr_340px]">
        {/* Left Column: Vitals */}
        <aside className="flex flex-col gap-4">
          <Card className="rounded-xl border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center text-center">
              <AttendanceChart percentage={94} />
              <div className="mt-4 flex w-full gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Target</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">90%</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                  <p className="text-sm font-extrabold text-green-600">On Track</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cumulative Tonnage</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">1,200</span>
                  <span className="text-sm font-bold text-slate-500">kg</span>
                  <span className="ml-auto rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-600">+15%</span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Hours logged</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">320</span>
                  <span className="text-sm font-bold text-slate-500">hrs</span>
                  <span className="ml-auto rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-600">+10%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex-1 rounded-xl border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <Award className="h-4 w-4 text-primary" /> Badge Vault
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div
                className="flex aspect-square cursor-help items-center justify-center rounded-lg bg-[#9FE2BF]/20 text-[#9FE2BF] transition-all hover:bg-[#9FE2BF]/40"
                title="Safety First"
              >
                <HeartPulse className="h-6 w-6" />
              </div>
              <div
                className="flex aspect-square cursor-help items-center justify-center rounded-lg bg-[#4DDBD6]/20 text-[#4DDBD6] transition-all hover:bg-[#4DDBD6]/40"
                title="Peer Mentor"
              >
                <Users className="h-6 w-6" />
              </div>
              <div
                className="flex aspect-square cursor-help items-center justify-center rounded-lg bg-[#E6C259]/20 text-[#E6C259] transition-all hover:bg-[#E6C259]/40"
                title="Perfect Week"
              >
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-slate-100 text-slate-200 dark:border-slate-800">
                <Lock className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </aside>

        {/* Center Column: Timeline */}
        <section className="flex h-[calc(100vh-160px)] flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Activity Timeline</h2>
            <div className="flex gap-2">
              <span className="size-2 rounded-full bg-[#9FE2BF]" />
              <span className="size-2 rounded-full bg-[#4DDBD6]" />
              <span className="size-2 rounded-full bg-[#E6C259]" />
            </div>
          </div>

          <div className="hide-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
            <TimelineCard
              type="note"
              title="Housing Interview Preparation"
              description="Marcus completed the mock interview session. He showed strong communication skills but needs to refine his response regarding his gap in employment. Scheduled follow-up for tomorrow."
              time="2 HOURS AGO"
              tags={["Housing", "Phase2"]}
            />
            <TimelineCard
              type="work"
              title="Shift Completion: Site B"
              description="Successfully managed the sorting line. Recorded 240kg of material processed. Zero safety incidents reported. Lead supervisor noted his punctuality."
              time="YESTERDAY"
              metrics={[
                { label: "8 Hours", icon: Clock },
                { label: "240kg", icon: Scale },
              ]}
            />
            <TimelineCard
              type="workshop"
              title="Advanced Safety Protocols"
              description="Marcus passed the certification for Phase 2 safety standards with a score of 98%. He is now eligible for equipment operation training."
              time="OCT 24, 2023"
              hasAction
            />
            <TimelineCard
              type="general"
              title="Peer Mentorship Session"
              description="Marcus volunteered to assist a new participant (Julian R.) with the orientation process. Outstanding leadership initiative displayed."
              time="OCT 22, 2023"
            />
          </div>
        </section>

        {/* Right Column: Actions & Analytics */}
        <aside className="flex flex-col gap-4">
          <Card className="rounded-xl border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <FileText className="h-4 w-4 text-primary" /> Docs
                </h3>
                <p className="text-xs text-slate-500">Participant documents and forms.</p>
              </div>
              {getIntakeBadge(intakeStatus)}
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">Intake Form</p>
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {intakeUpdatedAtLabel ? `Updated ${new Date(intakeUpdatedAtLabel).toLocaleString()}` : "Not started"}
                  </p>
                </div>

                {intakeHref ? (
                  <Link
                    href={intakeHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-xs font-black text-white shadow-sm shadow-primary/20 hover:bg-primary/90"
                    aria-label="Open intake form in a new tab"
                  >
                    Open
                  </Link>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Unavailable</span>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest">Quick Note</h3>
            <Textarea
              className="min-h-[120px] resize-none border-none bg-[#f9fafa] p-3 text-sm focus:ring-1 focus:ring-primary dark:bg-slate-800"
              placeholder="Type a quick update or observation..."
            />
            <Button className="mt-3 w-full rounded bg-primary text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90">
              Save Note
            </Button>
          </Card>

          <Card className="flex-1 rounded-xl border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest">7-Day Pulse Trend</h3>
              <Info className="h-4.5 w-4.5 text-slate-400" />
            </div>

            <div className="mt-8 flex h-48 w-full items-end justify-between px-2">
              {pulseData.map((d, i) => (
                <PulseBar key={i} value={d.value} label={d.label} />
              ))}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Engagement Analysis</p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Marcus remains consistently above the program average (7.2). Peak engagement correlates with afternoon work shifts.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ParticipantProfilePage;

