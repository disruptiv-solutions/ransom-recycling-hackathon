export default function DemoPage6() {
  const alerts = [
    {
      title: "Grant narrative ready",
      detail: "Outcomes summarized",
      tone: "bg-emerald-400/20 text-white border-emerald-300/40",
    },
    {
      title: "Metrics refreshed",
      detail: "Impact evidence compiled",
      tone: "bg-blue-400/20 text-white border-blue-300/40",
    },
  ];

  const metrics = [
    { label: "Reports Generated", value: "~50", sub: "Estimated monthly" },
    { label: "Staff Time Saved", value: "~140h", sub: "Estimated monthly" },
  ];

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden">
      <div className="mx-auto w-full max-w-none px-12 py-0">
        <div className="grid min-h-screen grid-cols-12 gap-6 items-stretch">
          <div className="col-span-5 flex flex-col py-12 overflow-hidden">
            <div className="animate-in fade-in duration-700 shrink-0">
              <h1 className="text-6xl font-black text-white drop-shadow-2xl tracking-tighter">
                AI REPORTS COMMAND
              </h1>
              <p className="mt-6 text-xl font-medium text-white/90 leading-relaxed">
                Grant-ready reporting for job readiness and recycling impact.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in duration-700 shrink-0 mt-8">
              <div className="text-sm font-black text-white/60 uppercase tracking-[0.2em]">
                Report Queue
              </div>
              <div className="mt-8 space-y-6">
                {alerts.map((alert) => (
                  <div
                    key={alert.title}
                    className={`rounded-3xl border-2 px-8 py-6 transition-all hover:scale-[1.02] ${alert.tone}`}
                  >
                    <div className="text-2xl font-black">{alert.title}</div>
                    <div className="mt-2 text-base text-white/80">{alert.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in duration-700 delay-300 mt-8 flex-1 min-h-0 flex flex-col">
              <div className="text-sm font-black text-white/60 uppercase tracking-[0.2em] mb-6 shrink-0">
                Funding Impact
              </div>
              <div className="grid grid-cols-2 gap-4 shrink-0">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5"
                  >
                    <div className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">{metric.label}</div>
                    <div className="text-5xl font-black text-white tracking-tighter">
                      {metric.value}
                    </div>
                    <div className="mt-2 text-sm font-bold text-emerald-400/80">{metric.sub}</div>
                    <div className="mt-1 text-[10px] font-medium text-white/40 uppercase tracking-wider">Estimated</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-7 flex items-stretch">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-700 delay-150 h-screen w-full">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/20 bg-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-4 text-sm text-white/80">
                  Live Reports View · <span className="text-white">/reports/xhyIJfgCahc7xq9ksgQD/embed</span>
                </div>
              </div>
              <div className="bg-white">
                <iframe
                  title="Reports Live Demo"
                  src="/reports/xhyIJfgCahc7xq9ksgQD/embed"
                  className="w-full h-[calc(100vh-52px)] border-0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm text-white/90">
            AI packages narratives, budgets, and evidence for rapid submission.
          </div>
        </div>
      </div>
    </div>
  );
}
