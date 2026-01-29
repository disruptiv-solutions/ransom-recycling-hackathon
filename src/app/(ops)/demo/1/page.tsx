import Image from "next/image";

const QUOTE =
  "Track program participants: case notes, recycling operations, certifications, attendance, milestones.";

export default function DemoPage() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba]">
      {/* Logos */}
      <div className="absolute left-12 top-12 flex items-end gap-4 bg-white/95 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000">
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

      {/* Main content */}
      <div className="flex min-h-screen items-center justify-center px-12 pt-40">
        <div className="max-w-4xl w-full animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-16 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#3a91ba]/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="mb-10 inline-block px-6 py-2 bg-white/20 rounded-full text-sm font-bold uppercase tracking-[0.2em] text-white border border-white/30">
                The Challenge
              </div>
              <div className="text-[42px] leading-[1.3] font-medium text-white drop-shadow-sm">
                <span className="text-white/70 text-6xl font-serif absolute -left-8 -top-4">"</span>
                {QUOTE}
                <span className="text-white/70 text-6xl font-serif absolute -right-4 bottom-0">"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-both">
        <div className="h-px w-12 bg-white/50 mb-2" />
        <div className="text-lg font-medium text-white">Ransom Solutions</div>
        <div className="text-sm text-white/70 tracking-wider">JANUARY 2026</div>
      </div>
    </div>
  );
}
