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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/chart-colors";
import { Account } from "@/types";

interface Props {
  account?: Account;
}

function formatViews(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export default function PostingTimeChart({ account }: Props) {
  const postingDays = (account?.postingDays ?? []).filter((d) => d.count > 0);
  const maxViews =
    postingDays.length > 0
      ? Math.max(...postingDays.map((d) => d.avgViews))
      : 0;
  const chartData = postingDays.map((d) => ({
    day: d.day,
    avgViews: d.avgViews,
    fill: d.avgViews === maxViews ? CHART_COLORS.emerald : CHART_COLORS.blue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Posting Days</CardTitle>
        <CardDescription>
          Rata-rata views per hari berdasarkan 20 video terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 280 }}>
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Data belum tersedia
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={formatViews}
                  width={45}
                />
                <Tooltip
                  formatter={(value) => [
                    (value as number).toLocaleString("id-ID"),
                    "Avg Views",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="avgViews" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
