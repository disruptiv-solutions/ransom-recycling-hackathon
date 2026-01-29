"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function DemoPage8() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Texture & Glow (Matching Demo 7/1) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Logos (Matching Demo 1 Styling) */}
      <div className="absolute left-12 top-12 flex items-center gap-4 bg-white/95 p-6 rounded-[2.5rem] shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000 ease-out will-change-transform">
        <div className="flex items-center pr-2">
          <Image
            src="/ransom-new.png"
            alt="Ransom Operations Platform"
            width={200}
            height={200}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <div className="w-px h-10 bg-slate-200/50 self-center" />
        <div className="flex items-center pl-2">
          <Image
            src="/hatchathon.png"
            alt="Hatchathon"
            width={200}
            height={200}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </div>

      <div className="w-full px-12 text-center relative z-10 flex flex-col justify-between min-h-screen py-24">
        {/* Top Section: The Question */}
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-8 duration-1000 ease-out will-change-transform">
          <div className="space-y-6">
            <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-sm font-bold uppercase tracking-[0.2em] text-white border border-white/30 backdrop-blur-md">
              The Challenge
            </div>
            <p className="text-[32px] md:text-[40px] text-white font-medium leading-tight max-w-3xl mx-auto drop-shadow-md">
              They couldn't answer:<br />
              <span className="italic text-white/90">"Who's ready to advance based on work?"</span>
            </p>
          </div>
        </div>

        {/* Middle Section: The Solution */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-1000 delay-500 ease-out will-change-transform">
          <div className="relative">
            <h1 className="text-[64px] md:text-[90px] font-black text-white tracking-tighter drop-shadow-2xl">
              Now they can.
            </h1>
          </div>

          {/* Feature List with Demo 7-style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
            {[
              "In 30 seconds, with AI analysis",
              "Backed by real production data",
              "Compliant with HIPAA",
              "Fundable by grants"
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-6 py-5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both shadow-lg"
                style={{ animationDelay: `${800 + (i * 150)}ms` }}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <p className="text-xl text-white font-bold tracking-tight">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: The Shift */}
        <div className="flex-1 flex flex-col items-center justify-end pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1500 ease-out will-change-transform">
          <div className="max-w-5xl space-y-8">
            <div className="h-px w-32 bg-white/30 mx-auto" />
            <p className="text-[36px] md:text-[52px] font-black text-white tracking-tight leading-[1.1] drop-shadow-lg">
              That's the shift from <span className="text-white/60">tracking participants</span><br />
              to <span className="text-white underline decoration-white/30 underline-offset-8">understanding performance.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Attribution (Matching Demo 1) */}
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-2000 fill-mode-both">
        <div className="h-px w-12 bg-white/50 mb-2" />
        <div className="text-lg font-medium text-white">Ransom Solutions</div>
        <div className="text-sm text-white/70 tracking-wider font-bold uppercase">January 2026</div>
      </div>

      <style jsx>{`
        .animate-in {
          animation-fill-mode: both;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          transform: translateZ(0);
        }
        
        .will-change-transform {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
