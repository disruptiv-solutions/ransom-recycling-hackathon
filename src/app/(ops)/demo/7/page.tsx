"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export default function DemoPage7() {
  const rows = [
    { before: "Manual spreadsheets", after: "Real-time intelligence" },
    { before: "10+ hrs/week admin", after: "70% time reduction" },
    { before: "Gut-feel decisions", after: "AI-driven readiness scores" },
    { before: "Hours for reports", after: "30 second reports" },
    { before: "People slip through", after: "Predictive alerts" },
    { before: "General tracking", after: "Individual performance" },
  ];
  const aiInsights = [
    { text: "Pattern detected from reported work logs.", tone: "bg-emerald-50 text-emerald-900", delayMs: 80 },
    { text: "Readiness score updated for grant narrative.", tone: "bg-blue-50 text-blue-900", delayMs: 210 },
    { text: "Recommended actions generated.", tone: "bg-slate-100 text-slate-700", delayMs: 360 },
    { text: "Weekly outlier flagged for coaching check-in.", tone: "bg-amber-50 text-amber-900", delayMs: 540 },
    { text: "Top contributors identified across sites.", tone: "bg-indigo-50 text-indigo-900", delayMs: 720 },
    { text: "New milestone achieved for 12 participants.", tone: "bg-emerald-50 text-emerald-900", delayMs: 890 },
    { text: "Narrative summary drafted from hours data.", tone: "bg-blue-50 text-blue-900", delayMs: 1050 },
    { text: "At-risk participation trend stabilized week-over-week.", tone: "bg-rose-50 text-rose-900", delayMs: 1230 },
    { text: "Shift coverage gaps reduced by 18%.", tone: "bg-violet-50 text-violet-900", delayMs: 1410 },
    { text: "Eligibility flags synced for upcoming grant cycle.", tone: "bg-slate-100 text-slate-700", delayMs: 1580 },
  ];
  const insightCards = [
    { label: "Wages earned", value: "$205", tone: "bg-white text-slate-900", span: "col-span-3" },
    { label: "Attendance", value: "50%", tone: "bg-white text-red-500", span: "col-span-3" },
    {
      label: "Status",
      value: "At risk",
      tone: "bg-white text-rose-600",
      span: "col-span-2 row-span-1 row-start-3",
    },
    {
      label: "Phase",
      value: "3",
      tone: "bg-white text-slate-900",
      span: "col-span-2 row-span-1 row-start-4",
    },
    {
      label: "At-risk participants",
      value: "Jasmine Lee - Needs immediate attention",
      tone: "bg-rose-50 text-rose-700",
      span: "col-span-6",
    },
    {
      label: "Recommended actions",
      value: "Mandate enrollment in first certification module within 48 hours.",
      tone: "bg-white text-slate-800",
      span: "col-span-4 row-span-2",
    },
    {
      label: "Total revenue",
      value: "$10,503.35 (+12% vs last period)",
      tone: "bg-emerald-50 text-emerald-900",
      span: "col-span-6",
    },
    {
      label: "Growth opportunity",
      value: "Advanced Sorting and Quality Control",
      tone: "bg-amber-50 text-amber-900",
      span: "col-span-6",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [countPercent, setCountPercent] = useState(0);

  const isTimeReductionActive = useMemo(
    () => rows[activeIndex]?.before === "10+ hrs/week admin",
    [activeIndex, rows],
  );
  const isGutFeelActive = useMemo(
    () => rows[activeIndex]?.before === "Gut-feel decisions",
    [activeIndex, rows],
  );
  const isReportsActive = useMemo(
    () => rows[activeIndex]?.before === "Hours for reports",
    [activeIndex, rows],
  );
  const isSlipActive = useMemo(
    () => rows[activeIndex]?.before === "People slip through",
    [activeIndex, rows],
  );
  const isRoleTrackingActive = useMemo(
    () => rows[activeIndex]?.before === "General tracking",
    [activeIndex, rows],
  );

  useEffect(() => {
    if (!isTimeReductionActive) {
      setCountPercent(0);
      return;
    }

    let animationFrameId = 0;
    const animationDurationMs = 1200;
    const animationStart = performance.now();

    const handleAnimate = (timestamp: number) => {
      const progress = Math.min((timestamp - animationStart) / animationDurationMs, 1);
      const nextValue = Math.round(progress * 70);
      setCountPercent(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(handleAnimate);
      }
    };

    animationFrameId = requestAnimationFrame(handleAnimate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isTimeReductionActive]);

  return (
    <>
      <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-none flex-col px-8 py-10">
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">IMPACT</h1>

        <div className="mt-8 flex-1 grid grid-cols-[0.5fr_2fr_0.5fr] gap-8 items-stretch">
          <div className="rounded-[28px] border border-white/30 bg-white/20 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-7 text-base font-black uppercase tracking-widest text-white drop-shadow-md">
              Before
            </div>
            <div className="px-6 pb-7 pt-2 flex flex-col gap-3">
              {rows.map((row, index) => (
                <div
                  key={row.before}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`rounded-2xl px-5 py-4 text-lg text-white text-left border transition-all cursor-pointer shadow-sm ${
                    index === activeIndex
                      ? "bg-white/30 font-bold border-white/50 shadow-xl scale-[1.02]"
                      : "bg-black/10 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {row.before}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-md p-10 shadow-2xl overflow-hidden">
            <div className="text-sm font-bold uppercase tracking-wider text-white/70">
              Transformation
            </div>
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 px-6 py-6 backdrop-blur-sm">
              <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                {rows[activeIndex].before} → {rows[activeIndex].after}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6">
              {isTimeReductionActive ? (
                <div className="relative w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 overflow-hidden min-h-[620px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Admin paperwork
                  </div>
                  <div className="mt-5 relative h-[480px]">
                    {Array.from({ length: 7 }).map((_, index) => {
                      const stackOffset = 18 - index * 2.5;
                      const stackRotate = (index % 2 === 0 ? -1 : 1) * (2.2 - index * 0.2);
                      const stackScale = 1 - index * 0.02;
                      return (
                      <div
                        key={`stacked-page-${index}`}
                        className="stacked-page"
                        style={{
                          animationDelay: `${index * 140}ms`,
                          ["--stack-y" as never]: `${stackOffset}px`,
                          ["--stack-rot" as never]: `${stackRotate}deg`,
                          ["--stack-scale" as never]: `${stackScale}`,
                        }}
                      >
                        <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                        <div className="mt-3 space-y-2">
                          <div className="h-2 w-full rounded-full bg-slate-100" />
                          <div className="h-2 w-5/6 rounded-full bg-slate-100" />
                          <div className="h-2 w-2/3 rounded-full bg-slate-100" />
                          <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                        </div>
                      </div>
                    );
                    })}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-500">
                    Pages stack automatically as reports build.
                  </div>
                </div>
              ) : isGutFeelActive ? (
                <div className="relative w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 overflow-hidden min-h-[620px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                      Gut feel
                    </div>
                    <div className="mt-8 text-[140px] leading-none drop-shadow-sm animate-gut">
                      🫃
                    </div>
                    <div className="mt-6 text-sm font-semibold text-slate-500">
                      Intuition replaced with measurable signals.
                    </div>
                  </div>
                </div>
              ) : isReportsActive ? (
                <div className="relative w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 overflow-hidden min-h-[620px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                      Hours for reports
                    </div>
                    <div className="mt-8 text-[140px] leading-none drop-shadow-sm animate-alarm">
                      ⏰
                    </div>
                    <div className="mt-6 text-sm font-semibold text-slate-500">
                      Reporting time reduced dramatically.
                    </div>
                  </div>
                </div>
              ) : isSlipActive ? (
                <div className="relative w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 overflow-hidden min-h-[620px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Coverage gaps
                  </div>
                  <div className="relative mt-6 h-[480px] overflow-hidden">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
                      <div className="relative h-2 w-full rounded-full bg-slate-200">
                        <div className="absolute left-1/2 top-1/2 h-2 w-16 -translate-x-1/2 -translate-y-1/2 bg-white" />
                      </div>
                    </div>
                    {["🧍", "🧑‍🦱", "🧑‍🦰", "🧑‍🦳", "🧑‍🦲"].map((emoji, index) => (
                      <div
                        key={`${emoji}-${index}`}
                        className="falling-person-center"
                        style={{ animationDelay: `${index * 700}ms` }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-500">
                    People can slip through without timely signals.
                  </div>
                </div>
              ) : isRoleTrackingActive ? (
                <div className="relative w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 overflow-hidden min-h-[620px]">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Phases
                  </div>
                  <div className="mt-6 flex flex-col gap-4">
                    {["Phase 0", "Phase 1", "Phase 2", "Phase 3", "Phase 4"].map((phase, index) => (
                      <div key={phase} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {index}
                        </div>
                        <div className="text-lg font-semibold text-slate-800">{phase}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
              <div className="w-full bg-white rounded-lg shadow-2xl border-4 border-[#217346] overflow-hidden">
                <div className="bg-[#217346] px-4 py-3 flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                  <div className="text-sm font-semibold text-white">Workforce_Intelligence.xlsx - Excel</div>
                </div>

                <div className="h-10 bg-[#f3f2f1] border-b border-slate-300 flex items-center px-3 gap-6">
                  <div className="text-xs font-medium text-slate-600">File</div>
                  <div className="text-xs font-medium text-slate-600">Home</div>
                  <div className="text-xs font-medium text-[#217346]">Insert</div>
                  <div className="text-xs font-medium text-slate-600">Data</div>
                </div>

                <div className="bg-white overflow-hidden relative">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#e6e6e6]">
                        <th className="w-10 h-8 border border-slate-300 text-[10px] text-slate-500 font-bold"></th>
                        <th className="h-8 border border-slate-300 text-[10px] text-slate-500 font-bold">A</th>
                        <th className="h-8 border border-slate-300 text-[10px] text-slate-500 font-bold">B</th>
                        <th className="h-8 border border-slate-300 text-[10px] text-slate-500 font-bold">C</th>
                        <th className="h-8 border border-slate-300 text-[10px] text-slate-500 font-bold">D</th>
                      </tr>
                      <tr className="bg-slate-100 font-semibold sticky top-8 z-10">
                        <td className="w-10 h-9 border border-slate-300 text-center text-[10px] text-slate-500 font-bold bg-[#e6e6e6]">1</td>
                        <td className="h-9 border border-slate-300 px-4 text-slate-700 bg-slate-100">Name</td>
                        <td className="h-9 border border-slate-300 text-center text-slate-700 bg-slate-100">Hours</td>
                        <td className="h-9 border border-slate-300 text-center text-slate-700 bg-slate-100">Phase</td>
                        <td className="h-9 border border-slate-300 text-center text-slate-700 bg-slate-100">Status</td>
                      </tr>
                    </thead>
                  </table>

                  <div className="h-[500px] overflow-hidden">
                    <div className="animate-scroll-rows">
                      <table className="w-full border-collapse text-sm">
                        <tbody>
                          {[
                            { id: 2, name: "John D.", hours: "120", phase: "2", status: "Active" },
                            { id: 3, name: "Sarah M.", hours: "85", phase: "1", status: "Active" },
                            { id: 4, name: "Mike T.", hours: "200", phase: "3", status: "Ready" },
                            { id: 5, name: "Lisa K.", hours: "45", phase: "1", status: "Active" },
                            { id: 6, name: "Chris R.", hours: "165", phase: "2", status: "Active" },
                            { id: 7, name: "Ana P.", hours: "92", phase: "1", status: "Active" },
                            { id: 8, name: "James W.", hours: "210", phase: "3", status: "Ready" },
                            { id: 9, name: "Maria G.", hours: "78", phase: "1", status: "Active" },
                            { id: 10, name: "David L.", hours: "145", phase: "2", status: "Active" },
                            { id: 11, name: "Emma S.", hours: "189", phase: "2", status: "Active" },
                            { id: 12, name: "Robert K.", hours: "67", phase: "1", status: "Active" },
                            { id: 13, name: "Jennifer L.", hours: "225", phase: "3", status: "Ready" },
                            { id: 14, name: "Michael B.", hours: "156", phase: "2", status: "Active" },
                            { id: 15, name: "Amanda C.", hours: "98", phase: "1", status: "Active" },
                            { id: 16, name: "Kevin T.", hours: "178", phase: "2", status: "Active" },
                            { id: 17, name: "Rachel M.", hours: "134", phase: "2", status: "Active" },
                            { id: 18, name: "Brandon H.", hours: "245", phase: "3", status: "Ready" },
                            { id: 19, name: "Nicole P.", hours: "56", phase: "1", status: "Active" },
                            { id: 20, name: "Steven J.", hours: "112", phase: "1", status: "Active" },
                            { id: 21, name: "Laura W.", hours: "198", phase: "2", status: "Active" },
                            { id: 22, name: "Daniel F.", hours: "167", phase: "2", status: "Active" },
                            { id: 23, name: "Ashley R.", hours: "89", phase: "1", status: "Active" },
                            { id: 24, name: "Timothy N.", hours: "215", phase: "3", status: "Ready" },
                            { id: 25, name: "Jessica A.", hours: "143", phase: "2", status: "Active" },
                            { id: 26, name: "Andrew D.", hours: "76", phase: "1", status: "Active" },
                            { id: 27, name: "Melissa V.", hours: "188", phase: "2", status: "Active" },
                            { id: 28, name: "Joshua E.", hours: "234", phase: "3", status: "Ready" },
                            { id: 29, name: "Stephanie O.", hours: "101", phase: "1", status: "Active" },
                            { id: 30, name: "Ryan I.", hours: "159", phase: "2", status: "Active" },
                            { id: 2, name: "John D.", hours: "120", phase: "2", status: "Active" },
                            { id: 3, name: "Sarah M.", hours: "85", phase: "1", status: "Active" },
                            { id: 4, name: "Mike T.", hours: "200", phase: "3", status: "Ready" },
                            { id: 5, name: "Lisa K.", hours: "45", phase: "1", status: "Active" },
                            { id: 6, name: "Chris R.", hours: "165", phase: "2", status: "Active" },
                            { id: 7, name: "Ana P.", hours: "92", phase: "1", status: "Active" },
                            { id: 8, name: "James W.", hours: "210", phase: "3", status: "Ready" },
                            { id: 9, name: "Maria G.", hours: "78", phase: "1", status: "Active" },
                            { id: 10, name: "David L.", hours: "145", phase: "2", status: "Active" },
                          ].map((row, index) => (
                            <tr key={index} className="bg-white hover:bg-slate-50">
                              <td className="w-10 h-9 border border-slate-300 text-center text-[10px] text-slate-500 font-bold bg-[#e6e6e6]">{row.id}</td>
                              <td className="h-9 border border-slate-300 px-4 text-slate-700">{row.name}</td>
                              <td className="h-9 border border-slate-300 text-center text-slate-700">{row.hours}</td>
                              <td className="h-9 border border-slate-300 text-center text-slate-700">{row.phase}</td>
                              <td className="h-9 border border-slate-300 text-center text-slate-700">{row.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}

                <div className="rounded-xl border border-slate-200/60 bg-white p-5 min-h-[620px] flex flex-col">
                  {isTimeReductionActive ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Time reduction
                      </div>
                      <div className="mt-6 text-[120px] leading-none font-bold text-emerald-600">
                        {countPercent}%
                      </div>
                      <div className="mt-3 text-sm text-slate-500">
                        Admin hours reduced in real time.
                      </div>
                    </div>
                  ) : isGutFeelActive ? (
                    <div className="flex flex-1 flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                        AI Insight
                      </div>
                      <div className="mt-4 grid grid-cols-6 auto-rows-[86px] gap-4">
                        {insightCards.map((card, index) => (
                          <div
                            key={card.label}
                            className={`rounded-2xl border border-slate-200/70 p-4 shadow-sm animate-card-rise min-w-0 ${card.tone} ${card.span}`}
                            style={{ animationDelay: `${120 + index * 140}ms` }}
                          >
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              {card.label}
                            </div>
                            <div className="mt-2 text-lg font-semibold break-words whitespace-normal leading-snug overflow-hidden">
                              {card.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isReportsActive ? (
                    <div className="flex flex-1 flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        30 second reports
                      </div>
                      <div className="mt-4 flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white shadow-sm overflow-hidden min-h-[440px]">
                          <div className="flex items-center justify-between bg-slate-100 px-4 py-3">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Official report
                            </div>
                            <div className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500">
                              PDF
                            </div>
                          </div>
                          <div className="px-5 py-4 min-h-[380px] flex flex-col">
                            <div className="text-lg font-semibold text-slate-900">
                              Workforce Readiness Summary
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Generated instantly from live metrics
                            </div>
                            <div className="mt-4 space-y-2">
                              <div className="h-2 w-full rounded-full bg-slate-100" />
                              <div className="h-2 w-5/6 rounded-full bg-slate-100" />
                              <div className="h-2 w-2/3 rounded-full bg-slate-100" />
                              <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                            </div>
                            <div className="mt-6 h-32 rounded-xl border border-slate-200 bg-slate-50" />
                            <div className="mt-4 h-24 rounded-xl border border-slate-200 bg-slate-50" />
                            <div className="mt-4 h-16 rounded-xl border border-slate-200 bg-slate-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isSlipActive ? (
                    <div className="flex flex-1 flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Predictive alerts
                      </div>
                      <div className="mt-4 flex flex-1 flex-col gap-4">
                        {[
                          { title: "Attendance dip", detail: "Flagged after two consecutive absences.", tone: "bg-amber-50 text-amber-900" },
                          { title: "Needs support", detail: "Outlier hours detected compared to peers.", tone: "bg-rose-50 text-rose-700" },
                          { title: "Coaching suggested", detail: "Performance variance rising this week.", tone: "bg-blue-50 text-blue-900" },
                          { title: "Check-in scheduled", detail: "Reminder sent to supervisor.", tone: "bg-emerald-50 text-emerald-900" },
                          { title: "Risk score elevated", detail: "Early warning threshold crossed today.", tone: "bg-violet-50 text-violet-900" },
                          { title: "Transportation issue", detail: "Late arrivals trending upward.", tone: "bg-slate-100 text-slate-700" },
                          { title: "Engagement drop", detail: "Participation rate down week-over-week.", tone: "bg-amber-50 text-amber-900" },
                          { title: "Follow-up queued", detail: "Case manager review scheduled.", tone: "bg-emerald-50 text-emerald-900" },
                        ].map((alert, index) => (
                          <div
                            key={alert.title}
                            className={`rounded-2xl border border-slate-200/70 px-4 py-3 shadow-sm alert-card ${alert.tone}`}
                            style={{ animationDelay: `${index * 700}ms` }}
                          >
                            <div className="text-sm font-semibold">{alert.title}</div>
                            <div className="mt-1 text-xs text-slate-500">{alert.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isRoleTrackingActive ? (
                    <div className="flex flex-1 flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                        Individual dashboard
                      </div>
                      <div className="mt-4 flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-500">Participant</div>
                            <div className="text-2xl font-bold text-slate-900">Jasmine Lee</div>
                          </div>
                          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Phase 3
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["Certified: Safety Basics", "On Track", "High Engagement"].map((badge) => (
                            <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {badge}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Attendance", value: "92%" },
                            { label: "Hours", value: "165" },
                            { label: "Readiness", value: "High" },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-3 text-center">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {stat.label}
                              </div>
                              <div className="mt-1 text-lg font-semibold text-slate-900">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Streak", value: "5 weeks" },
                            { label: "Next review", value: "Feb 4" },
                            { label: "Supervisor", value: "T. Alvarez" },
                            { label: "Placement", value: "Sorting Crew" },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-slate-200/70 bg-white px-3 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {stat.label}
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Insights</div>
                          <ul className="mt-2 space-y-2 text-sm text-slate-700">
                            <li>Productivity above program average for 3 weeks.</li>
                            <li>On track for certification completion this month.</li>
                            <li>Supervisor feedback trend improving.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                        AI Insight
                      </div>
                      <div className="mt-4 space-y-3 flex-1">
                        {aiInsights.map((insight) => (
                          <div
                            key={insight.text}
                            className={`rounded-lg px-3 py-2 text-lg leading-relaxed bubble-rise ${insight.tone}`}
                            style={{ animationDelay: `${insight.delayMs}ms` }}
                          >
                            {insight.text}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/30 bg-white/20 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-7 text-base font-black uppercase tracking-widest text-white text-right drop-shadow-md">
              After
            </div>
            <div className="px-6 pb-7 pt-2 flex flex-col gap-3">
              {rows.map((row, index) => (
                <div
                  key={row.after}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`rounded-2xl px-5 py-4 text-lg text-white text-right border transition-all cursor-pointer shadow-sm ${
                    index === activeIndex
                      ? "bg-white/30 font-bold border-white/50 shadow-xl scale-[1.02]"
                      : "bg-black/10 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {row.after}
                </div>
              ))}
            </div>
          </div>
        </div>

          <div className="mt-6">
            <div className="w-full rounded-2xl bg-[#4d8227] px-10 py-6 text-center text-lg font-semibold text-white">
              Workforce development + Environmental impact, measured and managed in real-time.
            </div>
          </div>
        </div>
      </div>

      {/* Logos */}
      <div className="absolute right-12 bottom-12 flex items-end gap-4 bg-white/95 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
        <div className="flex items-end pr-2">
          <Image
            src="/ransom-new.png"
            alt="Ransom Operations Platform"
            width={280}
            height={280}
            className="h-32 w-auto object-contain"
          />
        </div>
        <div className="w-px h-20 bg-slate-200/50 self-center" />
        <div className="flex items-end pl-2 pb-2">
          <Image
            src="/hatchathon.png"
            alt="Hatchathon"
            width={300}
            height={300}
            className="h-24 w-auto object-contain"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollRows {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll-rows {
          animation: scrollRows 20s linear infinite;
        }
        @keyframes bubbleRise {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .bubble-rise {
          animation: bubbleRise 600ms ease-out both;
        }
      @keyframes cardRise {
        0% {
          opacity: 0;
          transform: translateY(18px) scale(0.98);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .animate-card-rise {
        animation: cardRise 600ms ease-out both;
      }
      @keyframes alarmShake {
        0% {
          transform: rotate(0deg);
        }
        20% {
          transform: rotate(6deg);
        }
        40% {
          transform: rotate(-6deg);
        }
        60% {
          transform: rotate(5deg);
        }
        80% {
          transform: rotate(-5deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }
      .animate-alarm {
        animation: alarmShake 0.6s ease-in-out infinite;
        transform-origin: center;
      }
      @keyframes fallThroughCenter {
        0% {
          opacity: 0;
          transform: translate(-50%, -30px);
        }
        15% {
          opacity: 1;
        }
        60% {
          opacity: 1;
          transform: translate(-50%, 220px);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, 520px);
        }
      }
      .falling-person-center {
        position: absolute;
        top: -10px;
        left: 50%;
        font-size: 40px;
        animation: fallThroughCenter 3.5s ease-in-out infinite;
      }
      @keyframes alertCycle {
        0% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .alert-card {
        animation: alertCycle 2.8s ease-in-out both;
      }
      @keyframes gutFloat {
        0% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
        100% {
          transform: translateY(0);
        }
      }
      .animate-gut {
        animation: gutFloat 2.6s ease-in-out infinite;
      }
      @keyframes stackPages {
        0% {
          opacity: 0;
          transform: translateY(calc(var(--stack-y) + 26px)) rotate(var(--stack-rot)) scale(calc(var(--stack-scale) - 0.04));
        }
        100% {
          opacity: 1;
          transform: translateY(var(--stack-y)) rotate(var(--stack-rot)) scale(var(--stack-scale));
        }
      }
      .stacked-page {
        position: absolute;
        inset: 0;
        margin: auto;
        width: 90%;
        height: 78%;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.6);
        background: white;
        padding: 18px;
        box-shadow: 0 18px 40px -28px rgba(15, 23, 42, 0.45);
        animation: stackPages 700ms ease-out both;
      }
      `}</style>
    </>
  );
}
