"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function DemoPage8() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <div className="w-full px-12 text-center relative z-10">
        {/* Top Pills */}
        <div className="flex items-center justify-center gap-6 mb-20 animate-in fade-in slide-in-from-top-4 duration-1000 ease-out will-change-transform">
          <span className="text-lg font-black uppercase tracking-[0.5em] text-white/70">Secure</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <span className="text-lg font-black uppercase tracking-[0.5em] text-white/70">Scalable</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <span className="text-lg font-black uppercase tracking-[0.5em] text-white/70">Fundable</span>
        </div>

        {/* The Quote */}
        <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300 mb-16 ease-out will-change-transform">
          <h1 className="text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
            “ I didn't just build software. <br />
            I found the problem <span className="text-emerald-300">underneath <br />
            the problem.</span> ”
          </h1>
        </div>

        {/* Divider Line */}
        <div className="mx-auto w-32 h-0.5 bg-white/30 rounded-full mb-16 animate-in fade-in duration-1000 delay-700 ease-out will-change-opacity" />

        {/* Subtext */}
        <p className="text-xl lg:text-2xl text-white/80 font-medium max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 ease-out will-change-transform">
          This is the shift from simple tracking to <span className="text-white font-bold">true operations intelligence.</span>
        </p>

        {/* CTA Section */}
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1200 ease-out will-change-transform">
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
            Ready for deployment and impact.
          </h2>
        </div>
      </div>

      {/* Logos */}
      <div className="absolute right-12 bottom-12 flex items-center gap-4 bg-white/95 p-5 rounded-[2rem] shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 ease-out will-change-transform">
        <div className="flex items-center">
          <Image
            src="/ransom-new.png"
            alt="Ransom Operations Platform"
            width={200}
            height={200}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>
        <div className="w-px h-12 bg-slate-200/50" />
        <div className="flex items-center">
          <Image
            src="/hatchathon.png"
            alt="Hatchathon"
            width={200}
            height={200}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
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
        
        .will-change-opacity {
          will-change: opacity;
        }
      `}</style>
    </div>
  );
}
