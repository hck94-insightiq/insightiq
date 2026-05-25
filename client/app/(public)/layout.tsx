export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-[#0a0f1e] to-[#0a0f1e]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Grid decoration */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              InsightIQ
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Mock metric cards */}
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs mb-1">Engagement Rate</p>
                <p className="text-white font-bold text-2xl">4.7%</p>
              </div>
              <div className="text-teal-400 text-xs bg-teal-400/10 px-2 py-1 rounded-full">
                ↑ 12%
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs mb-1">Affiliate Match</p>
                <p className="text-white font-bold text-2xl">92%</p>
              </div>
              <div className="text-teal-400 text-xs bg-teal-400/10 px-2 py-1 rounded-full">
                AI Score
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs mb-1">Avg Views / Video</p>
                <p className="text-white font-bold text-2xl">15.4K</p>
              </div>
              <div className="text-teal-400 text-xs bg-teal-400/10 px-2 py-1 rounded-full">
                ↑ 8%
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-white text-3xl font-bold leading-snug">
              Know your audience.
              <br />
              <span className="text-teal-400">Sell what they love.</span>
            </h2>
            <p className="text-white/40 text-sm mt-3 leading-relaxed">
              AI-powered analytics for TikTok affiliate creators. Understand
              your niche, match the right products, grow your revenue.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs">
            © 2025 InsightIQ · Hacktiv8 Final Project
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        {children}
      </div>
    </div>
  );
}
