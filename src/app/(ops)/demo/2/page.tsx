import { X, Check } from "lucide-react";

export default function DemoPage2() {
  return (
    <div className="relative min-h-screen bg-[#f9fafb]">
      {/* Left edge: Thin vertical green bar */}
      <div className="fixed left-0 top-0 h-full w-2 bg-[#4a7c2c]" />

      {/* Title */}
      <div className="absolute left-0 right-0 top-16 text-center">
        <h1 className="text-[32px] font-semibold text-slate-800">THE DISCOVERY</h1>
      </div>

      {/* Three Column Layout */}
      <div className="flex min-h-screen items-center justify-center px-8 py-24 pt-32">
        <div className="grid w-full max-w-7xl grid-cols-3 gap-8">
          {/* Left Column - Problems */}
          <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <X className="h-8 w-8 flex-shrink-0 text-[#ef4444]" />
                <p className="text-base font-medium text-slate-800">
                  Already use HMIS for case management
                </p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-8 w-8 flex-shrink-0 text-[#ef4444]" />
                <p className="text-base font-medium text-slate-800">
                  Clinical data = HIPAA complications
                </p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-8 w-8 flex-shrink-0 text-[#ef4444]" />
                <p className="text-base font-medium text-slate-800">
                  ReProgram therapy notes off-limits
                </p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-8 w-8 flex-shrink-0 text-[#ef4444]" />
                <p className="text-base font-medium text-slate-800">
                  Building what they asked = compliance nightmare
                </p>
              </div>
            </div>
          </div>

          {/* Center Column - Excel Screenshot */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[400px] rounded-lg border-2 border-slate-300 bg-white p-4 shadow-md">
              {/* Excel-like table mockup */}
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-4 gap-1 border-b-2 border-slate-400 bg-slate-100 font-semibold">
                  <div className="p-2 text-center">Name</div>
                  <div className="p-2 text-center">Hours</div>
                  <div className="p-2 text-center">Phase</div>
                  <div className="p-2 text-center">Status</div>
                </div>
                <div className="grid grid-cols-4 gap-1 border-b border-slate-200">
                  <div className="p-2">John D.</div>
                  <div className="p-2 text-center">120</div>
                  <div className="p-2 text-center">2</div>
                  <div className="p-2 text-center">Active</div>
                </div>
                <div className="grid grid-cols-4 gap-1 border-b border-slate-200">
                  <div className="p-2">Sarah M.</div>
                  <div className="p-2 text-center">85</div>
                  <div className="p-2 text-center">1</div>
                  <div className="p-2 text-center">Active</div>
                </div>
                <div className="grid grid-cols-4 gap-1 border-b border-slate-200">
                  <div className="p-2">Mike T.</div>
                  <div className="p-2 text-center">200</div>
                  <div className="p-2 text-center">3</div>
                  <div className="p-2 text-center">Ready</div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <div className="p-2">Lisa K.</div>
                  <div className="p-2 text-center">45</div>
                  <div className="p-2 text-center">1</div>
                  <div className="p-2 text-center">Active</div>
                </div>
              </div>
            </div>
            <p className="text-center text-[20px] font-medium text-slate-800">
              "Can't connect participant work performance<br />
              to advancement decisions."
            </p>
          </div>

          {/* Right Column - Solutions */}
          <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-8 w-8 flex-shrink-0 text-[#10b981]" />
                <p className="text-base font-medium text-slate-800">
                  Exclude ALL clinical data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-8 w-8 flex-shrink-0 text-[#10b981]" />
                <p className="text-base font-medium text-slate-800">
                  Focus on operational metrics only
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-8 w-8 flex-shrink-0 text-[#10b981]" />
                <p className="text-base font-medium text-slate-800">
                  Work hours + production = advancement
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-8 w-8 flex-shrink-0 text-[#10b981]" />
                <p className="text-base font-medium text-slate-800">
                  Zero HIPAA exposure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#4a7c2c] py-4 text-center">
        <p className="text-lg font-semibold text-white">Security through smart scoping</p>
      </div>
    </div>
  );
}
