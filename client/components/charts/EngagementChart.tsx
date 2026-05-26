"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Account } from "@/types";

const TEAL = "oklch(0.68 0.13 195)";
const TEAL_DIM = "oklch(0.68 0.13 195 / 0.32)";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface Props {
  account?: Account;
}

export default function EngagementChart({ account }: Props) {
  const chartData = [
    { metric: "Likes", value: account?.avgLikes ?? 0, fill: TEAL },
    { metric: "Comments", value: account?.avgComments ?? 0, fill: TEAL_DIM },
    { metric: "Shares", value: account?.avgShares ?? 0, fill: TEAL_DIM },
    { metric: "Saves", value: account?.avgSaves ?? 0, fill: TEAL_DIM },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
            Engagement Metrics
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Rata-rata likes, comments, dan shares per video
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400 shrink-0">
          PER VIDEO
        </span>
      </div>
      <div className="flex-1 px-5 pb-5">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 4"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="metric"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: "var(--muted-foreground)",
                }}
              />
              <YAxis
                tickFormatter={formatNum}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: "var(--muted-foreground)",
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 500 }}
                itemStyle={{ color: "var(--muted-foreground)" }}
                formatter={(v) => [
                  (v as number).toLocaleString("id-ID"),
                  "Total",
                ]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={120} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
