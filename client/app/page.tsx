"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  ShoppingBag,
  MessageSquare,
  Link2,
  Moon,
  Sun,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";


function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className={`flex items-center gap-2.5`}>
      <span
        className={`relative flex items-center justify-center rounded-md bg-foreground font-mono font-semibold text-background ${size === "sm" ? "h-6 w-6 text-xs" : "h-7 w-7 text-sm"}`}
      >
        IQ
        <span
          className={`absolute rounded-full bg-teal-500 ${size === "sm" ? "bottom-0.5 right-0.5 h-1 w-1" : "bottom-1 right-1 h-1.5 w-1.5"}`}
        />
      </span>
      <span
        className={`font-bold tracking-tight ${size === "sm" ? "text-sm" : "text-base"}`}
      >
        InsightIQ
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-full bg-background text-foreground font-sans antialiased">
      <nav className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <a
              href="#features"
              className="hidden sm:inline-flex rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Fitur
            </a>
            <a
              href="#how"
              className="hidden sm:inline-flex rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cara kerja
            </a>
            <ThemeToggle />
            <Link
              href="/login"
              className="ml-1 inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="ml-1 inline-flex h-9 items-center rounded-lg bg-teal-500 px-3.5 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <section className="pb-16 pt-20 lg:pb-20 lg:pt-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
            <Sparkles size={13} />
            AI-powered untuk TikTok affiliate creators
          </span>

          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.035em] lg:text-7xl">
            Know your audience.
            <br />
            <span className="font-medium italic text-teal-600 dark:text-teal-400">
              Sell what they love.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            InsightIQ menganalisis akun TikTok kamu lewat AI dan
            merekomendasikan kategori produk affiliate yang paling cocok dengan
            niche dan audience kamu. Bukan tebakan — keputusan berbasis data.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-teal-500 px-5 text-[15px] font-semibold text-white shadow-sm hover:bg-teal-400 transition-colors"
            >
              Mulai Gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-background px-5 text-[15px] font-medium hover:bg-muted transition-colors"
            >
              Masuk
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-7 text-sm text-muted-foreground">
            <div>
              <span className="font-mono font-semibold text-foreground">
                2,847
              </span>{" "}
              kreator aktif
            </div>
            <div>
              <span className="font-mono font-semibold text-foreground">
                4,193
              </span>{" "}
              analisis dijalankan
            </div>
            <div>
              <span className="font-mono font-semibold text-foreground">
                84%
              </span>{" "}
              rata-rata confidence
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_48px_-12px_rgb(0_0_0/0.12),0_8px_16px_-8px_rgb(0_0_0/0.08)] dark:shadow-[0_24px_48px_-12px_rgb(0_0_0/0.5)]">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <div className="flex-1" />
              <span className="font-mono text-[11px] text-muted-foreground">
                app.insightiq.id/dashboard
              </span>
              <div className="flex-1" />
            </div>

            <div className="p-6 lg:p-7">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    // OVERVIEW
                  </p>
                  <h3 className="mt-0.5 text-lg font-semibold tracking-tight">
                    Selamat datang,{" "}
                    <span className="text-teal-600 dark:text-teal-400">
                      Rara
                    </span>
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                  <CheckCircle2 size={12} />
                  87% confidence
                </span>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-700 text-[10px] font-semibold text-white">
                    RA
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">
                      @rara_lifestyle
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      Lifestyle Minimalis · 24.8K followers
                    </p>
                  </div>
                </div>
                <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                  Last sync 2h ago
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                <div className="relative overflow-hidden rounded-lg bg-foreground px-3.5 py-3 text-background">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-background/55">
                      ENGAGEMENT
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-lg font-semibold leading-none tracking-tight">
                    7.84%
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-teal-400">
                    <TrendingUp size={10} /> +0.6%
                  </p>
                </div>
                {[
                  { label: "VIDEOS", value: "184", delta: "+12" },
                  { label: "AVG VIEWS", value: "38.4K", delta: "+2.1K" },
                  { label: "CONFIDENCE", value: "87%", delta: "AI" },
                  { label: "MATCH", value: "91", delta: "+5" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg border border-border bg-muted/40 px-3.5 py-3"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                      {kpi.label}
                    </span>
                    <p className="mt-1 font-mono text-lg font-semibold leading-none tracking-tight">
                      {kpi.value}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      {kpi.delta}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1.7fr_1fr]">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-semibold">
                        Engagement Metrics
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Avg per video
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-500/10 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      PER VIDEO
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 400 140"
                    preserveAspectRatio="none"
                    className="h-28 w-full"
                  >
                    <line
                      x1="0"
                      x2="400"
                      y1="20"
                      y2="20"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="3 4"
                    />
                    <line
                      x1="0"
                      x2="400"
                      y1="60"
                      y2="60"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="3 4"
                    />
                    <line
                      x1="0"
                      x2="400"
                      y1="100"
                      y2="100"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="3 4"
                    />
                    <rect
                      x="30"
                      y="10"
                      width="70"
                      height="110"
                      rx="5"
                      fill="oklch(0.68 0.13 195)"
                    />
                    <rect
                      x="120"
                      y="100"
                      width="70"
                      height="20"
                      rx="5"
                      fill="oklch(0.68 0.13 195 / 0.32)"
                    />
                    <rect
                      x="210"
                      y="111"
                      width="70"
                      height="9"
                      rx="5"
                      fill="oklch(0.68 0.13 195 / 0.32)"
                    />
                    <rect
                      x="300"
                      y="107"
                      width="70"
                      height="13"
                      rx="5"
                      fill="oklch(0.68 0.13 195 / 0.32)"
                    />
                    <text
                      x="65"
                      y="134"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="currentColor"
                      fillOpacity="0.4"
                      textAnchor="middle"
                    >
                      Views
                    </text>
                    <text
                      x="155"
                      y="134"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="currentColor"
                      fillOpacity="0.4"
                      textAnchor="middle"
                    >
                      Likes
                    </text>
                    <text
                      x="245"
                      y="134"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="currentColor"
                      fillOpacity="0.4"
                      textAnchor="middle"
                    >
                      Comments
                    </text>
                    <text
                      x="335"
                      y="134"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="currentColor"
                      fillOpacity="0.4"
                      textAnchor="middle"
                    >
                      Shares
                    </text>
                  </svg>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-[13px] font-semibold">Top product match</p>
                  <p className="mb-3 text-[11px] text-muted-foreground">
                    Ranked by score
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Skincare", score: 94 },
                      { label: "Fashion", score: 91 },
                      { label: "Home Decor", score: 84 },
                      { label: "Stationery", score: 78 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-mono text-[11px] font-semibold">
                            {item.score}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.score}%`,
                              background: `oklch(0.68 0.13 195 / ${item.score / 100})`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-t border-border py-20 lg:py-24"
        >
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              // FITUR UTAMA
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight lg:text-5xl">
              Empat hal yang InsightIQ kerjakan untuk kamu.
            </h2>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Sinkronisasi data TikTok, deteksi niche dengan AI, rekomendasi
              produk yang relevan, dan konsultan chat 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                icon: Brain,
                title: "AI Analysis",
                desc: "Gemini 2.0 menganalisis pola konten, niche, dan engagement akun TikTok kamu — lengkap dengan confidence score per kategori.",
              },
              {
                n: "02",
                icon: ShoppingBag,
                title: "Product Recommendations",
                desc: "Rekomendasi kategori produk TikTok Shop dengan match score, rentang harga, dan alasan spesifik di balik tiap rekomendasi.",
              },
              {
                n: "03",
                icon: MessageSquare,
                title: "AI Consultant",
                desc: "Chatbot yang sudah tahu data akun kamu. Tanya soal strategi, waktu posting, atau hashtag kapan pun — 24/7.",
              },
              {
                n: "04",
                icon: Link2,
                title: "TikTok Data Sync",
                desc: "Auto-fetch followers, 20 video terbaru, hashtag, dan engagement metrics hanya dari URL profil — tidak perlu input manual.",
              },
            ].map((f) => (
              <div
                key={f.n}
                className="group relative flex min-h-[230px] flex-col gap-3 rounded-2xl border border-border bg-card p-6 hover:border-foreground/20 transition-colors"
              >
                <span className="absolute right-5 top-5 font-mono text-[11px] tracking-wide text-muted-foreground/60">
                  {f.n}
                </span>
                <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <f.icon size={18} />
                </div>
                <h3 className="text-base font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="border-t border-border py-20 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              // CARA KERJA
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight lg:text-5xl">
              Dari URL profil ke strategi affiliate — tiga langkah.
            </h2>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Setup di bawah dua menit. Tidak perlu input manual followers atau
              hitung engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-3 font-mono text-xs font-medium tracking-wide text-teal-600 dark:text-teal-400">
                STEP 01
              </p>
              <h3 className="text-base font-semibold tracking-tight">
                Paste TikTok URL
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Masukkan link profil TikTok kamu — username atau full URL,
                keduanya jalan.
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <div className="font-mono text-xs text-muted-foreground">
                  tiktok.com/
                  <span className="text-teal-500">@rara_lifestyle</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-3 font-mono text-xs font-medium tracking-wide text-teal-600 dark:text-teal-400">
                STEP 02
              </p>
              <h3 className="text-base font-semibold tracking-tight">
                AI Analyze
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Auto-fetch data publik, lalu Gemini deteksi niche utama dan
                audience profile.
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-500" />
                  Detecting niche · 12s avg
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-3 font-mono text-xs font-medium tracking-wide text-teal-600 dark:text-teal-400">
                STEP 03
              </p>
              <h3 className="text-base font-semibold tracking-tight">
                Get Recommendations
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Dashboard berisi 5 chart, top product match, dan AI chat siap
                pakai.
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                    94% match
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Skincare
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Fashion
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="my-10">
          <div className="flex flex-col items-start gap-8 rounded-3xl bg-foreground p-10 text-background lg:flex-row lg:items-center lg:justify-between lg:p-14">
            <div className="max-w-xl">
              <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
                Berhenti tebak-tebakan. Mulai jual berdasarkan data.
              </h2>
              <p className="mt-2 text-background/70">
                Free tier untuk satu akun TikTok. Tidak perlu kartu kredit.
                Setup di bawah 2 menit.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-teal-500 px-6 text-[15px] font-semibold text-white hover:bg-teal-400 transition-colors"
            >
              Daftar sekarang
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-4 border-t border-border py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <div className="opacity-75">
            <Logo size="sm" />
          </div>
          <div>© 2026 InsightIQ · Hacktiv8 Final Project</div>
        </footer>
      </div>
    </div>
  );
}
