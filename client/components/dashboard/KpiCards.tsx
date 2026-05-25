"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, Sparkles, Target, Video } from "lucide-react";
import { Account, Analysis } from "@/types";

interface Props {
  account: Account;
  analysis: Analysis | null;
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
            Math.min(3, analysis.recommendations.length)
        )
      : null;

  const kpis = [
    {
      label: "Engagement Rate",
      value: `${engagementRate}%`,
      icon: Heart,
      color: "text-pink-500",
    },
    {
      label: "Total Videos",
      value: account.totalVideos.toLocaleString("id-ID"),
      icon: Video,
      color: "text-blue-500",
    },
    {
      label: "Avg Views",
      value: account.avgViews.toLocaleString("id-ID"),
      icon: Eye,
      color: "text-purple-500",
    },
    {
      label: "Niche Confidence",
      value: analysis ? `${analysis.confidenceScore}%` : "—",
      icon: Sparkles,
      color: "text-amber-500",
    },
    {
      label: "Affiliate Match",
      value: avgMatch ? `${avgMatch}%` : "—",
      icon: Target,
      color: "text-emerald-500",
    },
  ];    

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
