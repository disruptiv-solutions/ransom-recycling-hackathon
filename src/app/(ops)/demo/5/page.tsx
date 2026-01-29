"use client";

import React, { useState } from "react";

type ViewKey = "overview" | "production" | "participants" | "worklogs";

export default function DemoPage5() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");

  const insightByView: Record<ViewKey, { title: string; bullets: string[]; path: string }> = {
    overview: {
      title: "Overview insights",
      bullets: [
        "Daily executive brief summarizing program health",
        "Immediate-risk participants flagged for action",
        "Momentum notes highlight who is ready to advance",
      ],
      path: "/overview?embed=true",
    },
    production: {
      title: "Production insights",
      bullets: [
        "Executive summary with revenue deltas",
        "Mid-week peak signals material throughput swings",
        "Optimization signals for staffing and sourcing",
      ],
      path: "/production?embed=true",
    },
    participants: {
      title: "Participant insights",
      bullets: [
        "Risk and readiness signals for advancement",
        "Actionable coaching and next milestones",
        "Individual performance metrics",
      ],
      path: "/participants?embed=true",
    },
    worklogs: {
      title: "Work log insights",
      bullets: [
        "Staffing imbalance by role and hours",
        "Burnout risk for top-heavy workloads",
        "Recurring note patterns that impact output",
      ],
      path: "/work-logs?embed=true",
    },
  };

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden">
      <div className="mx-auto w-full max-w-none px-12 py-0">
        <div className="grid min-h-screen grid-cols-12 gap-6 items-stretch">
          {/* Left Panel: AI Intelligence Layer */}
          <div className="col-span-5 space-y-8 py-12">
            <div className="animate-in fade-in duration-700">
              <h1 className="text-6xl font-black text-white drop-shadow-2xl tracking-tighter">
                AI INTELLIGENCE LAYER
              </h1>
              <p className="mt-6 text-xl font-medium text-white/90 leading-relaxed">
                Not just tracking—contextual insights across every view.
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in duration-700">
              <div className="text-sm font-black text-white/60 uppercase tracking-[0.2em]">
                Select Perspective
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { key: "overview", label: "Overview" },
                  { key: "production", label: "Production" },
                  { key: "participants", label: "Participants" },
                  { key: "worklogs", label: "Work Logs" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key as ViewKey)}
                    className={`rounded-2xl border-2 px-6 py-4 transition-all hover:scale-[1.02] font-bold text-lg ${
                      activeView === item.key
                        ? "bg-white text-slate-900 border-white shadow-xl"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in duration-700 delay-150">
              <div className="text-sm font-black text-white/60 uppercase tracking-[0.2em] mb-8">
                {insightByView[activeView].title}
              </div>
              <div className="space-y-6">
                {insightByView[activeView].bullets.map((bullet, index) => (
                  <div
                    key={bullet}
                    className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 150}ms`, animationFillMode: "both" }}
                  >
                    <div className="h-2 w-2 mt-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] shrink-0" />
                    <div className="text-xl font-bold text-white leading-tight">
                      {bullet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Full Bleed Browser Window */}
          <div className="col-span-7 flex items-stretch">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-700 delay-150 h-screen w-full">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/20 bg-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-4 text-sm font-medium text-white/80">
                  Live View · <span className="text-white">{insightByView[activeView].path}</span>
                </div>
              </div>
              <div className="bg-white h-full">
                <iframe
                  title="Perspective Live View"
                  src={insightByView[activeView].path}
                  className="w-full h-[calc(100vh-52px)] border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
