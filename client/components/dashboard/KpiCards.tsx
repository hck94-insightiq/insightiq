"use client";

import {
  Activity,
  Eye,
  Brain,
  Target,
  Music,
  Sparkles,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";
import { Account, Analysis } from "@/types";

interface Props {
  account: Account;
  analysis: Analysis | null;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function KpiCards({ account, analysis }: Props) {
  const engagementRate =
    account.avgViews > 0
      ? (
          ((account.avgLikes + account.avgComments + account.avgShares) /
            account.avgViews) *
          100
        ).toFixed(2)
      : "0.00";

  const avgMatch =
    analysis?.recommendations && analysis.recommendations.length > 0
      ? Math.round(
          analysis.recommendations
            .slice(0, 3)
            .reduce((sum, r) => sum + r.matchScore, 0) /
            Math.min(3, analysis.recommendations.length),
        )
      : null;

  const kpis = [
    {
      label: "Engagement Rate",
      value: `${engagementRate}%`,
      delta: "likes + comments + shares",
      icon: Activity,
      tone: "up" as const,
      accent: true,
    },
    {
      label: "Total Videos",
      value: String(account.totalVideos),
      delta: `${account.totalVideos} video`,
      icon: Music,
      tone: "up" as const,
    },
    {
      label: "Avg Views",
      value: formatNum(account.avgViews),
      delta: account.avgViews.toLocaleString("id-ID"),
      icon: Eye,
      tone: "up" as const,
    },
    {
      label: "Avg Likes",
      value: formatNum(account.avgLikes),
      delta: account.avgLikes.toLocaleString("id-ID"),
      icon: ThumbsUp,
      tone: "up" as const,
    },
    {
      label: "Niche Confidence",
      value: analysis ? `${analysis.confidenceScore}%` : "—",
      delta: "AI",
      icon: Brain,
      tone: "ai" as const,
    },
    {
      label: "Affiliate Match",
      value: avgMatch ? `${avgMatch}` : "—",
      delta: avgMatch
        ? `top ${analysis?.recommendations?.length ?? 0} categories`
        : "—",
      icon: Target,
      tone: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map(({ label, value, delta, icon: Icon, tone, accent }) => {
        if (accent) {
          return (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl bg-foreground dark:bg-teal-500/[0.04] dark:border dark:border-teal-500/40 p-4 sm:p-5 text-background dark:text-foreground"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.06em] text-background/55 dark:text-muted-foreground">
                  {label}
                </span>
                <Icon size={13} className="text-teal-400 shrink-0" />
              </div>
              <p className="mt-2 font-mono text-[20px] sm:text-[26px] font-semibold leading-none tracking-tight">
                {value}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-teal-400 truncate">
                <TrendingUp size={11} /> {delta}
              </p>
            </div>
          );
        }

        const deltaColor =
          tone === "ai"
            ? "text-teal-600 dark:text-teal-400"
            : "text-emerald-600 dark:text-emerald-400";
        const DeltaIcon = tone === "ai" ? Sparkles : TrendingUp;

        return (
          <div
            key={label}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {label}
              </span>
              <Icon size={13} className="text-muted-foreground shrink-0" />
            </div>
            <p className="mt-2 font-mono text-[20px] sm:text-[26px] font-semibold leading-none tracking-tight">
              {value}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium truncate ${deltaColor}`}
            >
              <DeltaIcon size={11} /> {delta}
            </p>
          </div>
        );
      })}
    </div>
  );
}
