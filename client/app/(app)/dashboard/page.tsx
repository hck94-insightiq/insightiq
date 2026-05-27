import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageSquare, Clock } from "lucide-react";
import KpiCards from "@/components/dashboard/KpiCards";
import { ReAnalyzeButton } from "@/components/dashboard/ReAnalyzeButton";
import { AnalysisLoadingOverlay } from "@/components/dashboard/AnalysisLoadingOverlay";
import EngagementChart from "@/components/charts/EngagementChart";
import EmptyState from "@/components/shared/EmptyState";
import NicheBreakdown from "@/components/charts/NicheBreakdown";
import AudienceDonut from "@/components/charts/AudienceDonut";
import ProductMatchChart from "@/components/charts/ProductMatchChart";
import PostingTimeChart from "@/components/charts/PostingTimeChart";
import { Account, Analysis } from "@/types";

function relativeTime(date: string | Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function getInitials(username: string): string {
  return username.replace("@", "").slice(0, 2).toUpperCase();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const db = await getDb();
  const account = await db
    .collection("accounts")
    .findOne({ userId: new ObjectId(session.user.id) });

  if (!account) redirect("/onboarding");

  const analysis = await db
    .collection("analyses")
    .findOne(
      { userId: new ObjectId(session.user.id) },
      { sort: { createdAt: -1 } },
    );

  const serializedAccount = JSON.parse(JSON.stringify(account)) as Account;
  const serializedAnalysis = analysis
    ? (JSON.parse(JSON.stringify(analysis)) as Analysis)
    : null;

  const bestDay = serializedAccount.postingDays?.length
    ? serializedAccount.postingDays.reduce((best: any, d: any) =>
        d.avgViews > best.avgViews ? d : best,
      )
    : null;

  const topMatch = serializedAnalysis?.recommendations?.[0];

  return (
    <div className="space-y-5">
      {params.new === "true" && <AnalysisLoadingOverlay />}

      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Selamat datang,{" "}
          <span className="text-teal-600 dark:text-teal-400">
            {session.user.name?.split(" ")[0] ?? "Creator"}
          </span>
        </h1>
        <Link
          href="/analysis"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Sparkles size={14} />
          View AI Analysis
        </Link>
      </div>

      {/* Context strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-teal-700 text-xs font-semibold text-white">
            {serializedAccount.avatarUrl ? (
              <img
                src={serializedAccount.avatarUrl}
                alt={serializedAccount.tiktokUsername}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(serializedAccount.tiktokUsername)
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              @{serializedAccount.tiktokUsername}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              {serializedAnalysis?.primaryNiche ?? "—"} ·{" "}
              {serializedAccount.followers.toLocaleString("id-ID")} followers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {serializedAnalysis?.createdAt && (
            <span className="inline-flex items-center gap-1.5 font-mono mr-1">
              <Clock size={11} />
              Last analysis {relativeTime(serializedAnalysis.createdAt)}
            </span>
          )}
          <ReAnalyzeButton
            variant="context"
            tiktokUsername={serializedAccount.tiktokUsername}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards account={serializedAccount} analysis={serializedAnalysis} />

      {/* Empty state */}
      {!serializedAnalysis && (
        <EmptyState
          title="AI Analysis Belum Tersedia"
          description="Klik tombol di bawah untuk menjalankan analisis AI berdasarkan data akun yang sudah kamu input."
          ctaLabel="Jalankan AI Analysis"
          ctaHref="/analysis"
        />
      )}

      {/* Charts */}
      {serializedAnalysis && (
        <>
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.7fr_1fr]">
            <EngagementChart account={serializedAccount} />
            <AudienceDonut account={serializedAccount} />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
            <NicheBreakdown data={serializedAnalysis.nicheBreakdown} />
            <PostingTimeChart account={serializedAccount} />
          </div>

          {/* Row 3 */}
          <ProductMatchChart
            recommendations={serializedAnalysis.recommendations}
          />

          {/* AI Insight band */}
          {serializedAnalysis.nuanceDescription && (
            <div className="flex flex-col gap-5 rounded-xl border border-border bg-gradient-to-br from-card to-teal-500/5 p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-7">
              <div className="flex-1">
                <div className="mb-2 inline-flex items-center gap-1.5">
                  <Sparkles
                    size={15}
                    className="text-teal-600 dark:text-teal-400"
                  />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-teal-700 dark:text-teal-400">
                    // AI INSIGHT
                  </span>
                </div>
                {bestDay && topMatch && (
                  <h3 className="text-pretty text-base font-semibold tracking-tight">
                    Posting hari {bestDay.day} + niche{" "}
                    {serializedAnalysis.primaryNiche} ={" "}
                    <span className="text-teal-600 dark:text-teal-400">
                      {topMatch.matchScore}% match
                    </span>{" "}
                    dengan audience kamu.
                  </h3>
                )}
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {serializedAnalysis.nuanceDescription}
                </p>
              </div>
              <Link
                href="/chat"
                className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-teal-500 px-4 text-sm font-semibold text-white hover:bg-teal-400 transition-colors lg:self-auto"
              >
                <MessageSquare size={15} />
                Tanya AI
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
