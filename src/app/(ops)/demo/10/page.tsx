"use client";

import { useEffect, useState } from "react";

export default function DemoPage10() {
  const summaryPoints = [
    {
      title: "Smart Scoping",
      desc: "Zero HIPAA exposure. 100% focused on workforce outcomes.",
      icon: "🛡️",
    },
    {
      title: "Efficiency",
      desc: "10+ hours of paperwork cut to a 70% automated reduction.",
      icon: "⚡",
    },
    {
      title: "AI Readiness",
      desc: "Objective readiness scores replacing subjective intuition.",
      icon: "🧠",
    },
    {
      title: "Instant Reports",
      desc: "Grant-ready narratives generated in 30 seconds flat.",
      icon: "📄",
    },
    {
      title: "Safety Net",
      desc: "Real-time alerts catch participants before they slip through.",
      icon: "🚨",
    },
    {
      title: "Individual Clarity",
      desc: "Granular dashboards for every single program participant.",
      icon: "👤",
    },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <div className="relative min-h-screen bg-[#020617] text-slate-200 overflow-hidden flex flex-col font-sans selection:bg-emerald-500/30">
        {/* Background Scrolling Text (Watermark style) */}
        <div className="absolute top-[15%] left-0 whitespace-nowrap text-[200px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter animate-scroll-text">
          IMPACT OUTCOMES SCALE GROWTH INTELLIGENCE READINESS
        </div>
        <div className="absolute bottom-[15%] right-0 whitespace-nowrap text-[200px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter animate-scroll-text-reverse">
          REPORTING SAFETY COMPLIANCE EFFICIENCY AUTOMATION
        </div>

        {/* Deep Cinematic Background */}
        <div className="absolute top-[-25%] right-[-15%] w-[80%] h-[80%] bg-emerald-600/10 rounded-full blur-[160px] animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-25%] left-[-15%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse duration-[12s] delay-1000" />
        
        {/* Textural Layers */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.1]" />

        <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative z-10">
          <div className="max-w-7xl w-full">
            {/* Nav / Branding */}
            <div className="flex justify-between items-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="flex items-center gap-5 group cursor-default">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-12 h-12 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-[15deg] transition-all duration-500">
                    <div className="w-6 h-6 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30" />
                  </div>
                </div>
                <div>
                  <span className="text-white font-black text-2xl tracking-tighter block leading-none">CircleUp</span>
                  <span className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1 block">Operational Intelligence</span>
                </div>
              </div>
              <div className="px-6 py-2.5 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 shadow-inner">
                Closing Summary • 2026
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.1fr_1.5fr] gap-24 items-center">
              {/* Hero */}
              <div className="animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Full Transformation Complete
                </div>
                <h1 className="text-[100px] lg:text-[120px] font-black text-white leading-[0.75] tracking-tighter mb-12">
                  THE NEW <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-emerald-400 to-blue-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.2)]">STANDARD.</span>
                </h1>
                <p className="max-w-md text-xl text-slate-400 leading-relaxed font-medium mb-16">
                  CircleUp turns fragmented program data into a high-performance engine for participant outcomes and real-time reporting.
                </p>
                
                <div className="flex gap-16">
                  <div className="relative group cursor-default">
                    <div className="text-6xl font-black text-white mb-2 group-hover:text-emerald-400 transition-all duration-500 group-hover:scale-105 origin-left tracking-tighter">70%</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">Admin Savings</div>
                  </div>
                  <div className="relative group cursor-default">
                    <div className="text-6xl font-black text-white mb-2 group-hover:text-blue-400 transition-all duration-500 group-hover:scale-105 origin-left tracking-tighter">30s</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">Report Speed</div>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
                {summaryPoints.map((item, index) => (
                  <div
                    key={item.title}
                    className={`group relative bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-10 rounded-[56px] transition-all duration-700 hover:bg-white/[0.05] hover:border-white/[0.1] hover:translate-y-[-12px] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] ${index % 2 === 1 ? 'lg:mt-16' : ''}`}
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-white/[0.02] to-transparent rounded-[56px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center text-3xl mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/[0.05] shadow-inner">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-300 transition-colors duration-500 leading-none">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm font-medium group-hover:text-slate-200 transition-colors duration-500">
                        {item.desc}
                      </p>
                    </div>
                    
                    <div className="absolute bottom-10 right-10 text-4xl font-black text-white/[0.03] italic group-hover:text-white/[0.07] transition-colors pointer-events-none select-none">
                      0{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-32 pt-16 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-12 animate-in fade-in duration-1000 delay-1200 fill-mode-both">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-2xl">
                      U{i}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 tracking-[0.1em] uppercase mb-1">
                    The Infrastructure for <span className="text-emerald-400">Impact.</span>
                  </p>
                  <p className="text-slate-500 font-medium">Joined by leading regional program sites in 2026.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-12">
                <div className="text-right">
                  <div className="text-2xl font-black text-white tracking-tighter leading-none mb-2">Ransom Solutions</div>
                  <div className="text-[10px] font-black text-emerald-500/60 tracking-[0.5em] uppercase">Scale Outcomes</div>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-white blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative h-24 w-24 rounded-[40px] bg-white text-[#020617] flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-6 transition-all duration-500 group-active:scale-95">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -80px) scale(1.2); }
            66% { transform: translate(-40px, 40px) scale(0.8); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-blob {
            animation: blob 15s infinite ease-in-out;
          }
          @keyframes scroll-text {
            0% { transform: translateX(0); }
            100% { transform: translateX(-40%); }
          }
          @keyframes scroll-text-reverse {
            0% { transform: translateX(-40%); }
            100% { transform: translateX(0); }
          }
          .animate-scroll-text {
            animation: scroll-text 60s linear infinite;
          }
          .animate-scroll-text-reverse {
            animation: scroll-text-reverse 60s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
}
