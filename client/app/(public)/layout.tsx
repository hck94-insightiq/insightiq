export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080b12] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-white/5">
        {/* Subtle teal glow top-left */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            InsightIQ
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-5">
          <h2 className="text-white text-4xl font-bold leading-tight">
            &ldquo;Know your audience.
            <br />
            <span className="text-teal-400">Sell what they love.</span>
            &rdquo;
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Auto-fetch akun TikTok kamu, deteksi niche dengan Gemini AI, dan
            dapatkan rekomendasi produk affiliate yang relevan — semua dalam 2
            menit.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 space-y-3">
          <p className="text-white/25 text-xs font-mono tracking-widest">
            // 2,847 kreator &middot; 4,193 analisis
          </p>
          <p className="text-white/15 text-xs">
            © 2026 InsightIQ · Hacktiv8 Final Project
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
