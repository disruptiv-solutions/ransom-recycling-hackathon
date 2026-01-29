import { Check } from "lucide-react";

export default function DemoPage3() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Left edge: Thin vertical green bar */}
      <div className="fixed left-0 top-0 h-full w-2 bg-[#4a7c2c]" />

      {/* Title and Tagline */}
      <div className="absolute left-0 right-0 top-24 text-center">
        <h1 className="mb-4 text-[28px] font-bold text-slate-900">
          RECYCLING OPERATIONS INTELLIGENCE
        </h1>
        <p className="text-[18px] font-normal text-slate-600">
          Manual spreadsheets → Real-time workforce intelligence
        </p>
      </div>

      {/* Center: Four checkmarks */}
      <div className="flex min-h-screen items-center justify-center px-8 py-16 pt-48">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 flex-shrink-0 text-[#10b981]" />
            <p className="text-base font-medium text-slate-800">
              30-second work logging
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 flex-shrink-0 text-[#10b981]" />
            <p className="text-base font-medium text-slate-800">
              Auto-calculated production value
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 flex-shrink-0 text-[#10b981]" />
            <p className="text-base font-medium text-slate-800">
              AI advancement readiness scoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 flex-shrink-0 text-[#10b981]" />
            <p className="text-base font-medium text-slate-800">
              15-minute grant reports
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Gray box with emphasis */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-200 py-6 text-center">
        <p className="text-lg font-semibold text-slate-900">
          Zero clinical data. 100% operational metrics.
        </p>
      </div>
    </div>
  );
}
