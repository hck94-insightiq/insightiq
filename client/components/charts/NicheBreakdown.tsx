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
import { Analysis } from "@/types";

const TEAL = "oklch(0.68 0.13 195)";
const tealAlpha = (a: number) => `oklch(0.68 0.13 195 / ${a})`;

interface Props {
  data?: Analysis["nicheBreakdown"];
}

export default function NicheBreakdown({ data }: Props) {
  const chartData =
    data?.map((item, i) => ({
      niche: item.niche,
      score: item.score,
      fill: i === 0 ? TEAL : tealAlpha(Math.max(0.25, 0.85 - i * 0.12)),
    })) ?? [];

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
            Niche Breakdown
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Distribusi konten berdasarkan analisis AI
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
          SCORE 0–100
        </span>
      </div>
      <div className="flex-1 px-5 pb-5">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 6, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 4"
                horizontal={false}
                stroke="var(--border)"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: "var(--muted-foreground)",
                }}
              />
              <YAxis
                type="category"
                dataKey="niche"
                tickLine={false}
                axisLine={false}
                width={130}
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
                formatter={(v) => [`${v as number}/100`, "Score"]}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
