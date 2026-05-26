"use client";

import {
  Activity,
  Eye,
  Brain,
  Target,
  Music,
  Sparkles,
  TrendingUp,
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
      delta: "+0.6%",
      icon: Activity,
      tone: "up" as const,
      accent: true,
    },
    {
      label: "Total Videos",
      value: String(account.totalVideos),
      delta: `${account.totalVideos} total`,
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
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map(({ label, value, delta, icon: Icon, tone, accent }) => {
        if (accent) {
          return (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl bg-foreground p-5 text-background"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-background/55">
                  {label}
                </span>
                <Icon size={14} className="text-teal-400" />
              </div>
              <p className="mt-2 font-mono text-[26px] font-semibold leading-none tracking-tight">
                {value}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-teal-400">
                <TrendingUp size={12} /> {delta}
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
            className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {label}
              </span>
              <Icon size={14} className="text-muted-foreground" />
            </div>
            <p className="mt-2 font-mono text-[26px] font-semibold leading-none tracking-tight">
              {value}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${deltaColor}`}
            >
              <DeltaIcon size={12} /> {delta}
            </p>
          </div>
        );
      })}
    </div>
  );
}
