import { Sparkles } from "lucide-react";

export default function DemoPage5() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Left edge: Thin vertical green bar */}
      <div className="fixed left-0 top-0 h-full w-2 bg-[#4a7c2c]" />

      {/* Title and Subtitle */}
      <div className="absolute left-0 right-0 top-16 text-center">
        <h1 className="mb-3 text-[26px] font-bold text-slate-900">AI INTELLIGENCE LAYER</h1>
        <p className="text-[18px] font-normal text-slate-700">
          Not just tracking—contextual insights across every view
        </p>
      </div>

      {/* Three Screenshots */}
      <div className="flex min-h-screen items-center justify-center px-8 py-24 pt-40">
        <div className="flex flex-col items-center gap-8">
          <div className="flex gap-4">
            {/* Overview Screenshot */}
            <div className="h-[220px] w-[220px] rounded-lg border-2 border-slate-300 bg-white p-3 shadow-md">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">Overview</span>
              </div>
              <div className="space-y-2 rounded-md bg-blue-50 p-2 text-[10px] text-slate-700">
                <div className="font-semibold">AI Analysis</div>
                <div>• Attendance patterns detected</div>
                <div>• 3 participants at risk</div>
                <div>• Production trending up</div>
              </div>
            </div>

            {/* Production Screenshot */}
            <div className="h-[220px] w-[220px] rounded-lg border-2 border-slate-300 bg-white p-3 shadow-md">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">Production</span>
              </div>
              <div className="space-y-2 rounded-md bg-blue-50 p-2 text-[10px] text-slate-700">
                <div className="font-semibold">AI Insights</div>
                <div>• Efficiency up 12%</div>
                <div>• Cross-train needed</div>
                <div>• Material mix optimal</div>
              </div>
            </div>

            {/* Participant Screenshot */}
            <div className="h-[220px] w-[220px] rounded-lg border-2 border-slate-300 bg-white p-3 shadow-md">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">Participant</span>
              </div>
              <div className="space-y-2 rounded-md bg-blue-50 p-2 text-[10px] text-slate-700">
                <div className="font-semibold">AI Assessment</div>
                <div>• On track for Phase 3</div>
                <div>• Ready for advancement</div>
                <div>• Strong performance</div>
              </div>
            </div>
          </div>

          {/* Bullet List */}
          <div className="mt-4 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#10b981]" />
              <p className="text-base text-slate-800">
                Patterns ("attendance drops on Mondays")
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#10b981]" />
              <p className="text-base text-slate-800">
                Predictions ("Devon at risk of dropout—intervene today")
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#10b981]" />
              <p className="text-base text-slate-800">
                Recommendations ("cross-train 2 staff for Hammermill")
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-base font-bold text-slate-900">
          Adapts to user role and current filter context.
        </p>
      </div>
    </div>
  );
}
