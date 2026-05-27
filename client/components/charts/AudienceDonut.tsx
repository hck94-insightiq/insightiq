"use client";

import { PieChart, Pie, Sector, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles } from "lucide-react";
import { Account } from "@/types";

const DONUT_COLORS = [
  "oklch(0.68 0.13 195)",
  "oklch(0.78 0.10 195)",
  "oklch(0.48 0.11 195)",
  "oklch(0.86 0.07 195)",
];

interface Props {
  account?: Account;
}

export default function AudienceDonut({ account }: Props) {
  const breakdown = account?.engagementBreakdown;

  const chartData = breakdown
    ? [
        { name: "Likes", value: breakdown.likes ?? 0 },
        { name: "Comments", value: breakdown.comments ?? 0 },
        { name: "Shares", value: breakdown.shares ?? 0 },
        { name: "Saves", value: breakdown.saves ?? 0 },
      ].filter((d) => d.value > 0)
    : [];

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const primary = chartData[0];
  const primaryPct =
    primary && total > 0 ? Math.round((primary.value / total) * 100) : 0;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
            Engagement Breakdown
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Proporsi likes, comments, shares & saves
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400 shrink-0">
          <Sparkles size={10} /> AI
        </span>
      </div>
      <div className="flex-1 px-5 pb-5">
        {chartData.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Data belum tersedia
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-5">
            {/* Donut */}
            <div className="relative h-[200px] md:h-[230px] flex-1 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="92%"
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                    shape={(props: any) => (
                      <Sector
                        {...props}
                        fill={DONUT_COLORS[props.index % DONUT_COLORS.length]}
                      />
                    )}
                  />
                  <Tooltip
                    wrapperStyle={{ zIndex: 50 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--foreground)",
                    }}
                    formatter={(v, _: any, props: any) => [
                      `${(((v as number) / total) * 100).toFixed(1)}%`,
                      props.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0">
                <p className="font-mono text-2xl font-semibold tracking-tight">
                  {primaryPct}%
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {primary?.name}
                </p>
              </div>
            </div>

            {/* Legend — horizontal wrap on mobile, vertical on md+ */}
            <div className="flex flex-row flex-wrap justify-center gap-x-4 gap-y-2 md:flex-col md:gap-2.5 md:flex-none">
              {chartData.map((d, i) => {
                const pct =
                  total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
                return (
                  <div
                    key={d.name}
                    className="flex items-center gap-2.5 text-xs"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ background: DONUT_COLORS[i] }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-mono font-semibold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
