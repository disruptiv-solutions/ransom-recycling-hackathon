export default function DemoPage4() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-[#4d8227] to-[#3a91ba] overflow-hidden">
      {/* Title */}
      <div className="absolute left-0 right-0 top-20 text-center z-10">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">SECURITY BY DESIGN</h1>
      </div>

      {/* 2x2 Grid */}
      <div className="flex min-h-screen items-center justify-center px-12 py-24 pt-40">
        <div className="grid w-full max-w-6xl grid-cols-2 gap-6">
          {/* Top Left: Authentication */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            {/* Gradient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl" />
            
            <div className="relative z-10">
              <div className="mb-4 border-t-4 border-white/40 pt-6">
                <div className="mb-4 text-5xl">🔐</div>
                <h2 className="mb-4 text-xl font-bold text-white">AUTHENTICATION</h2>
                <ul className="space-y-2.5 text-base text-white/90">
                  <li>Firebase Auth</li>
                  <li>Protected routes</li>
                  <li>Session management</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Top Right: Access Control */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            {/* Gradient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl" />
            
            <div className="relative z-10">
              <div className="mb-4 border-t-4 border-white/40 pt-6">
                <div className="mb-4 text-5xl">👥</div>
                <h2 className="mb-4 text-xl font-bold text-white">ACCESS CONTROL</h2>
                <ul className="space-y-2.5 text-base text-white/90">
                  <li>Role-based (RBAC)</li>
                  <li>Firestore rules</li>
                  <li>Admin/Super/Direct</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Left: Data Protection */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            {/* Gradient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl" />
            
            <div className="relative z-10">
              <div className="mb-4 border-t-4 border-white/40 pt-6">
                <div className="mb-4 text-5xl">🛡️</div>
                <h2 className="mb-4 text-xl font-bold text-white">DATA PROTECTION</h2>
                <ul className="space-y-2.5 text-base text-white/90">
                  <li>Zero PII/PHI</li>
                  <li>Encrypted transit</li>
                  <li>Minimal data scope</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Right: API Security */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 group">
            {/* Gradient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl" />
            
            <div className="relative z-10">
              <div className="mb-4 border-t-4 border-white/40 pt-6">
                <div className="mb-4 text-5xl">🔌</div>
                <h2 className="mb-4 text-xl font-bold text-white">API SECURITY</h2>
                <ul className="space-y-2.5 text-base text-white/90">
                  <li>Server-side only</li>
                  <li>No exposed keys</li>
                  <li>Cloud Functions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Quote */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 py-6 text-center">
        <p className="text-lg italic text-white/95 px-8">
          "Production-grade from day one. Rate limiting ready for deployment."
        </p>
      </div>
    </div>
  );
}
