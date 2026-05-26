import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Target,
} from "lucide-react";
import { ReAnalyzeButton } from "@/components/dashboard/ReAnalyzeButton";
import EmptyState from "@/components/shared/EmptyState";

function fmtDate(iso: string | Date): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function fmtViews(n: number): string {
  if (n === 0) return "0";
  return n.toLocaleString("id-ID");
}

function ConfidenceRing({ value }: { value: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="9"
          />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="oklch(0.68 0.13 195)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[28px] font-semibold leading-none tracking-tight">
            {value}%
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            confidence
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const db = await getDb();
  const userId = new ObjectId(session.user.id);

  const account = await db.collection("accounts").findOne({ userId });
  if (!account) redirect("/onboarding");

  const analysis = await db
    .collection("analyses")
    .findOne({ userId }, { sort: { createdAt: -1 } });

  const tiktokUsername = account.tiktokUsername as string;
  const firstName = session.user.name?.split(" ")[0] ?? "Creator";

  const postingDays = (account.postingDays ?? []) as Array<{
    day: string;
    avgViews: number;
    count: number;
  }>;
  const bestDay =
    postingDays.length > 0
      ? postingDays.reduce((best, d) => (d.avgViews > best.avgViews ? d : best))
      : null;

  if (!analysis) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Kenali audience-mu,{" "}
              <span className="text-teal-600 dark:text-teal-400">
                {firstName}
              </span>
            </h1>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Belum ada analisis
            </p>
          </div>
          <ReAnalyzeButton tiktokUsername={tiktokUsername} />
        </div>
        <EmptyState
          title="Belum Ada Analisis"
          description="Klik Re-analyze untuk menjalankan AI analysis berdasarkan data akun TikTok kamu."
          icon={<Sparkles size={48} />}
        />
      </div>
    );
  }

  function toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kenali audience-mu,{" "}
            <span className="text-teal-600 dark:text-teal-400">
              {firstName}
            </span>
          </h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            Generated {fmtDate(analysis.createdAt)}
          </p>
        </div>
        <ReAnalyzeButton tiktokUsername={tiktokUsername} />
      </div>

      {/* Hero card: Niche + Confidence */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.13 195 / 0.14), transparent 70%)",
          }}
        />
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-teal-700 dark:text-teal-400">
              // PRIMARY NICHE DETECTED
            </span>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
              {toTitleCase(analysis.primaryNiche)}
            </h2>
            {analysis.secondaryNiche && (
              <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <Target size={11} /> Primary
                </span>
                <span>·</span>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Secondary: {analysis.secondaryNiche}
                </span>
              </div>
            )}
          </div>
          <ConfidenceRing value={analysis.confidenceScore} />
        </div>
      </div>

      {analysis.analysisReport && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-teal-700 dark:text-teal-400">
              // AI ANALYSIS REPORT
            </p>
            <h3 className="mt-1 text-[15px] font-semibold leading-tight tracking-tight">
              Ringkasan Analisis Akun
            </h3>
          </div>

          <div className="space-y-4 divide-y divide-border">
            <div className="pt-4 first:pt-0">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Pola Konten
              </p>
              <p className="text-[15px] leading-relaxed text-foreground/80">
                {analysis.analysisReport.polaKonten}
              </p>
            </div>

            <div className="pt-4">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Profil Audience
              </p>
              <p className="text-[15px] leading-relaxed text-foreground/80">
                {analysis.analysisReport.profilAudience}
              </p>
            </div>

            <div className="pt-4">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Sinyal Engagement
              </p>
              <p className="text-[15px] leading-relaxed text-foreground/80">
                {analysis.analysisReport.sinyalEngagement}
              </p>
            </div>

            <div className="pt-4">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Peluang yang Belum Dioptimalkan
              </p>
              <p className="text-[15px] leading-relaxed text-foreground/80">
                {analysis.analysisReport.peluangBelumDioptimalkan}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Nuance + Audience Profile */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Nuance */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <TrendingUp
              size={17}
              className="text-teal-600 dark:text-teal-400"
            />
            <div>
              <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
                Nuance & Character
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Karakter unik akun kamu menurut AI
              </p>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-foreground/85">
            {analysis.nuanceDescription}
          </p>
        </div>

        {/* Audience Profile */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Users size={17} className="text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
                  Audience Profile
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Estimasi demografi audience
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              AI-Estimated
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3.5">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Age Range
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {analysis.audienceProfile?.ageRange ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-teal-500/25 bg-teal-500/[0.08] px-4 py-3.5">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.06em] text-teal-600 dark:text-teal-400">
                Purchase Power
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {toTitleCase(analysis.audienceProfile?.purchasePower ?? "—")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Posting Days */}
      {postingDays.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Calendar size={17} className="text-teal-600 dark:text-teal-400" />
            <div>
              <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
                Best Posting Days
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Rata-rata views per hari berdasarkan 20 video terakhir
              </p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {postingDays.map((d) => {
              const isBest = bestDay?.day === d.day;
              return (
                <div
                  key={d.day}
                  className={`rounded-xl border p-3.5 text-center ${
                    isBest
                      ? "border-teal-500/40 bg-teal-500/[0.08]"
                      : "border-border bg-muted/40"
                  }`}
                >
                  <p
                    className={`mb-2 font-mono text-[11px] font-medium ${
                      isBest
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {d.day}
                  </p>
                  <p className="font-mono text-sm font-semibold leading-tight tracking-tight">
                    {fmtViews(d.avgViews)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {d.count}x
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="flex justify-end pt-1">
        <Link
          href="/recommendations"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
        >
          <ShoppingBag size={15} />
          Lihat rekomendasi produk
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
