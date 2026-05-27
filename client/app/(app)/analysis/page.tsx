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
  FileText,
  Activity,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { ReAnalyzeButton } from "@/components/dashboard/ReAnalyzeButton";
import { AIAnalysisWheel } from "@/components/dashboard/AIAnalysisWheel";
import EmptyState from "@/components/shared/EmptyState";

export const metadata = { title: "AI Analysis" };

function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

// ─── Derive key insight per section from real data ────────────────────────────

function derivePolaKey(account: any, bestDay: any): string {
  const day = bestDay?.day ?? "—";
  const topTags = (account.hashtags ?? [])
    .slice(0, 2)
    .map((h: string) => `#${h}`)
    .join(", ");
  return topTags ? `${day} terbaik · ${topTags}` : `${day} terbaik`;
}

function deriveAudienceKey(analysis: any): string {
  const age = analysis.audienceProfile?.ageRange ?? "—";
  const power = toTitleCase(
    (analysis.audienceProfile?.purchasePower ?? "—").split(" ")[0],
  );
  return `${age} · Daya beli ${power}`;
}

function deriveEngagementKey(account: any): string {
  const bd = account.engagementBreakdown;
  if (!bd) return "—";
  const total =
    (bd.likes ?? 0) + (bd.comments ?? 0) + (bd.shares ?? 0) + (bd.saves ?? 0);
  if (total === 0) return "—";
  const likePct = Math.round(((bd.likes ?? 0) / total) * 100);
  const savePct = Math.round(((bd.saves ?? 0) / total) * 100);
  const dominant =
    likePct >= 70 ? "entertaining" : savePct >= 10 ? "edukasional" : "seimbang";
  return `${likePct}% Likes · Konten ${dominant}`;
}

function derivePeluangKey(analysis: any): string {
  const niches = [...(analysis.nicheBreakdown ?? [])].sort(
    (a: any, b: any) => a.score - b.score,
  );
  if (niches.length === 0) return "—";
  const lowest = niches[0] as any;
  return `${lowest.niche} (${lowest.score}/100) terendah`;
}

// ─── Confidence Ring ──────────────────────────────────────────────────────────

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

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({
  number,
  icon: Icon,
  label,
  keyValue,
  detail,
  teal,
}: {
  number: string;
  icon: any;
  label: string;
  keyValue: string;
  detail: string;
  teal?: boolean;
}) {
  return (
    <details
      className={`group rounded-2xl border ${teal ? "border-teal-500/20 bg-teal-500/[0.04]" : "border-border bg-card"} overflow-hidden`}
    >
      <summary className="flex cursor-pointer list-none select-none items-center gap-3.5 p-5 hover:bg-muted/20 transition-colors">
        {/* Numbered badge */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold ${teal ? "bg-teal-500/15 text-teal-600 dark:text-teal-400" : "bg-teal-500/10 text-teal-600 dark:text-teal-400"}`}
        >
          {number}
        </div>

        {/* Icon */}
        <Icon size={15} className="shrink-0 text-teal-600 dark:text-teal-400" />

        {/* Label + key value */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground leading-none mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold leading-tight truncate">
            {keyValue}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        />
      </summary>

      {/* Detail */}
      <div className="border-t border-border/50 px-5 pb-5 pt-4">
        <p className="text-[14px] leading-relaxed text-foreground/75">
          {detail}
        </p>
      </div>
    </details>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

      {/* Featured CTA */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-teal-500/25 bg-teal-500/[0.06] px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Siap lihat rekomendasi produk?
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Berdasarkan analisis niche dan audience kamu —{" "}
            {analysis.recommendations?.length ?? 0} kategori produk siap
            dijelajahi
          </p>
        </div>
        <Link
          href="/recommendations"
          className="group relative inline-flex h-11 shrink-0 items-center gap-2.5 overflow-hidden rounded-xl bg-teal-500 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-colors"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <ShoppingBag size={16} />
          Lihat Rekomendasi
          <ArrowRight
            size={15}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
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
              <div className="mt-4 flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <Target size={11} /> Primary
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Secondary: {analysis.secondaryNiche}
                </span>
              </div>
            )}
          </div>
          <ConfidenceRing value={analysis.confidenceScore} />
        </div>
      </div>

      {/* AI Analysis Report — Accordion */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-teal-700 dark:text-teal-400">
            // AI ANALYSIS REPORT
          </p>
          <div className="flex-1 h-px bg-border" />
        </div>
        <AIAnalysisWheel
          postingDays={postingDays}
          hashtags={account.hashtags ?? []}
          engagementBreakdown={account.engagementBreakdown}
          audienceProfile={analysis.audienceProfile}
          nicheBreakdown={analysis.nicheBreakdown}
          analysisReport={analysis.analysisReport}
          bestDay={bestDay}
        />
      </div>

      {/* Section divider */}
      <div className="flex items-center gap-3 pt-1">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/50">
          // DETAIL ANALYSIS
        </p>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <TrendingUp size={17} className="text-teal-600 dark:text-teal-400" />
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
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">
                    avg views
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
    </div>
  );
}
