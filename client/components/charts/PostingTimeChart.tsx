"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Account } from "@/types";

const TEAL = "oklch(0.68 0.13 195)";
const TEAL_DIM = "oklch(0.68 0.13 195 / 0.28)";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface Props {
  account?: Account;
}

export default function PostingTimeChart({ account }: Props) {
  const postingDays = (account?.postingDays ?? []).filter((d) => d.count > 0);
  const maxViews =
    postingDays.length > 0
      ? Math.max(...postingDays.map((d) => d.avgViews))
      : 0;
  const bestDay = postingDays.find((d) => d.avgViews === maxViews);

  const chartData = postingDays.map((d) => ({
    ...d,
    fill: d.avgViews === maxViews ? TEAL : TEAL_DIM,
  }));

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
            Best Posting Days
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Rata-rata views per hari berdasarkan 20 video
          </p>
        </div>
        {bestDay && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">
            {bestDay.day} best
          </span>
        )}
      </div>
      <div className="flex-1 px-5 pb-5">
        {postingDays.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Data belum tersedia
          </div>
        ) : (
          <div style={{ height: 260, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="day"
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
                  width={50}
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
                    "Average Views",
                  ]}
                />
                <Bar dataKey="avgViews" radius={[6, 6, 0, 0]} barSize={100} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
