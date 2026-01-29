"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function DemoPage9() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Texture & Glow */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Logos */}
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

      <div className="w-full px-12 relative z-10 flex flex-col justify-between min-h-screen py-24">
        <div className="flex-1 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Profile Info */}
          <div className="flex flex-col items-center lg:items-start gap-8 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000 ease-out will-change-transform">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src="/ian - pro image.png"
                  alt="Ian McDonald"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-sm font-bold uppercase tracking-[0.2em] text-white border border-white/30 backdrop-blur-md">
                The Developer
              </div>
              <h1 className="text-[64px] md:text-[80px] lg:text-[100px] font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                I'm Ian McDonald.
              </h1>
              <p className="text-[24px] md:text-[32px] text-white/90 font-medium leading-tight drop-shadow-md">
                Scan to connect or find my socials.
              </p>
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="flex items-center justify-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 ease-out will-change-transform">
            <div className="relative group">
              <div className="absolute -inset-8 bg-white/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 p-12 rounded-[3rem] shadow-2xl">
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] bg-white rounded-3xl flex items-center justify-center shadow-inner overflow-hidden border-8 border-white">
                  <Image
                    src="/url_qrcodecreator.com_15_41_35.png"
                    alt="QR Code"
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <p className="mt-8 text-white font-black uppercase tracking-[0.4em] text-lg text-center opacity-60">Scan Me</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Closing */}
        <div className="flex flex-col items-center justify-end pb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1000 ease-out will-change-transform">
          <div className="max-w-5xl w-full space-y-8 text-center">
            <div className="h-px w-32 bg-white/30 mx-auto" />
            <p className="text-[24px] md:text-[32px] font-black text-white tracking-tight leading-[1.1] drop-shadow-lg">
              Building the future of <span className="text-white/60">impact operations.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1500 fill-mode-both">
        <div className="h-px w-12 bg-white/50 mb-2" />
        <div className="text-lg font-medium text-white">Ian McDonald</div>
        <div className="text-sm text-white/70 tracking-wider font-bold uppercase">Full Stack Developer</div>
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
