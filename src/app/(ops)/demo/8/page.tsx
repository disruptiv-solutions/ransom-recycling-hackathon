export default function DemoPage8() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Left edge: Thin vertical green bar */}
      <div className="fixed left-0 top-0 h-full w-2 bg-[#4a7c2c]" />

      {/* Placeholder content */}
      <div className="flex min-h-screen items-center justify-center px-8 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-slate-800">Demo Page 8</h1>
          <p className="text-lg text-slate-600">Placeholder content</p>
        </div>
      </div>
    </div>
  );
}
