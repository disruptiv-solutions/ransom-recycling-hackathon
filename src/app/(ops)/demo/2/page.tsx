"use client";

import React from "react";
import Image from "next/image";

const RED_ITEMS = [
  '"Spreadsheets, paper files, people slip through cracks" -- Their stated problem',
  "Already use HMIS for case management (therapy, housing, clinical = HIPAA-protected)",
  "Recycling operations tracked manually -- no connection to advancement decisions",
  'Cannot answer: "Who\'s ready to advance based on work?"',
];

const GREEN_ITEMS = [
  "Strategic pivot: Build what's MISSING (operations intelligence, not case management)",
  "Individual work performance tracking (hours logged + materials processed = advancement data)",
  "AI scores readiness based on productivity (replace gut-feel with measurable criteria)",
  "Complements HMIS, avoids HIPAA entirely (right tool for the right job)",
];

const QUOTE = "Operations data becomes advancement data -- without touching HIPAA systems.";

export default function DemoPage2() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden">
      {/* Main content */}
      <div className="flex min-h-screen items-center justify-center px-12 pt-12 pb-24">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-12 gap-10 items-center">
            {/* Left: Spreadsheet (taller with more rows) */}
            <div className="col-span-7 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
              <div className="w-full bg-white rounded-lg shadow-2xl border-4 border-[#217346] overflow-hidden">
                {/* Excel Title Bar */}
                <div className="bg-[#217346] px-4 py-3 flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                  <div className="text-sm font-semibold text-white">Workforce_Intelligence.xlsx - Excel</div>
                </div>

                {/* Excel Ribbon */}
                <div className="h-10 bg-[#f3f2f1] border-b border-slate-300 flex items-center px-3 gap-6">
                  <div className="text-xs font-medium text-slate-600">File</div>
                  <div className="text-xs font-medium text-slate-600">Home</div>
                  <div className="text-xs font-medium text-[#217346]">Insert</div>
                  <div className="text-xs font-medium text-slate-600">Data</div>
                </div>

                {/* Spreadsheet Grid */}
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
                      {/* Frozen Row 1 - Header labels */}
                      <tr className="bg-slate-100 font-semibold sticky top-8 z-10">
                        <td className="w-10 h-9 border border-slate-300 text-center text-[10px] text-slate-500 font-bold bg-[#e6e6e6]">1</td>
                        <td className="h-9 border border-slate-300 px-4 text-slate-700 bg-slate-100">Name</td>
                        <td className="h-9 border border-slate-300 text-center text-slate-700 bg-slate-100">Hours</td>
                        <td className="h-9 border border-slate-300 text-center text-slate-700 bg-slate-100">Phase</td>
                        <td className="h-9 border border-slate-300 text-center text-slate-700 bg-slate-100">Status</td>
                      </tr>
                    </thead>
                  </table>
                  
                  {/* Scrolling data rows */}
                  <div className="h-[400px] overflow-hidden">
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
                          ].map((row, idx) => (
                            <tr key={idx} className="bg-white hover:bg-slate-50">
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
                `}</style>
              </div>
            </div>

            {/* Right: Friction and Solution stacked */}
            <div className="col-span-5 flex flex-col gap-6">
              {/* The Friction */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both">
                <div className="mb-4 inline-block px-3 py-1 bg-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-200 border border-red-500/30">
                  The Friction
                </div>
                <div className="flex flex-col gap-3">
                  {RED_ITEMS.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-red-500/20 p-1.5 rounded-lg shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white leading-tight">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Solution */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-700 fill-mode-both">
                <div className="mb-4 inline-block px-3 py-1 bg-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-200 border border-emerald-500/30">
                  The Solution
                </div>
                <div className="flex flex-col gap-3">
                  {GREEN_ITEMS.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-emerald-500/20 p-1.5 rounded-lg shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white leading-tight">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quote - Below the spreadsheet */}
          <div className="col-span-12 animate-in fade-in duration-1000 delay-1000 fill-mode-both mt-12">
            <div className="relative pl-8 pr-12">
              <span className="text-white/15 text-8xl font-serif absolute -left-2 -top-10 select-none">"</span>
              <p className="text-3xl font-bold text-white leading-relaxed drop-shadow-lg relative z-10">
                {QUOTE}
              </p>
              <div className="mt-6 h-1.5 w-32 bg-emerald-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 p-6 flex justify-center animate-in fade-in slide-in-from-bottom-full duration-1000 delay-1000 fill-mode-both">
        <p className="text-2xl font-bold text-white tracking-wide uppercase">
          Security through smart scoping
        </p>
      </div>

    </div>
  );
}
