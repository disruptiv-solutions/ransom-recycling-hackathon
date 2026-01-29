export default function DemoPage4() {
  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      {/* Left edge: Thin vertical green bar */}
      <div className="fixed left-0 top-0 h-full w-2 bg-[#4a7c2c]" />

      {/* Title */}
      <div className="absolute left-0 right-0 top-16 text-center">
        <h1 className="text-[32px] font-semibold text-slate-800">SECURITY BY DESIGN</h1>
      </div>

      {/* 2x2 Grid */}
      <div className="flex min-h-screen items-center justify-center px-8 py-24 pt-32">
        <div className="grid w-full max-w-6xl grid-cols-2 gap-5">
          {/* Top Left: Authentication */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 border-t-4 border-[#4a7c2c] pt-4">
              <div className="mb-3 text-[32px]">🔐</div>
              <h2 className="mb-3 text-base font-bold text-slate-900">AUTHENTICATION</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Firebase Auth</li>
                <li>Protected routes</li>
                <li>Session management</li>
              </ul>
            </div>
          </div>

          {/* Top Right: Access Control */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 border-t-4 border-[#4a7c2c] pt-4">
              <div className="mb-3 text-[32px]">👥</div>
              <h2 className="mb-3 text-base font-bold text-slate-900">ACCESS CONTROL</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Role-based (RBAC)</li>
                <li>Firestore rules</li>
                <li>Admin/Super/Direct</li>
              </ul>
            </div>
          </div>

          {/* Bottom Left: Data Protection */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 border-t-4 border-[#4a7c2c] pt-4">
              <div className="mb-3 text-[32px]">🛡️</div>
              <h2 className="mb-3 text-base font-bold text-slate-900">DATA PROTECTION</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Zero PII/PHI</li>
                <li>Encrypted transit</li>
                <li>Minimal data scope</li>
              </ul>
            </div>
          </div>

          {/* Bottom Right: API Security */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 border-t-4 border-[#4a7c2c] pt-4">
              <div className="mb-3 text-[32px]">🔌</div>
              <h2 className="mb-3 text-base font-bold text-slate-900">API SECURITY</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Server-side only</li>
                <li>No exposed keys</li>
                <li>Cloud Functions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Quote */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-300 py-4 text-center">
        <p className="text-base italic text-slate-800">
          "Production-grade from day one. Rate limiting ready for deployment."
        </p>
      </div>
    </div>
  );
}
