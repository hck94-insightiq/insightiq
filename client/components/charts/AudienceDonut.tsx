"use client";

import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

const COLORS = [
  CHART_COLORS.pink,
  CHART_COLORS.blue,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
];

export default function AudienceDonut({ account }: Props) {
  const breakdown = account?.engagementBreakdown;

  const chartData = breakdown
    ? [
        { name: "Likes", value: breakdown.likes, fill: CHART_COLORS.pink },
        {
          name: "Comments",
          value: breakdown.comments,
          fill: CHART_COLORS.blue,
        },
        { name: "Shares", value: breakdown.shares, fill: CHART_COLORS.emerald },
        { name: "Saves", value: breakdown.saves, fill: CHART_COLORS.amber },
      ].filter((d) => d.value > 0)
    : [];

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Breakdown</CardTitle>
        <CardDescription>
          Proporsi likes, comments, shares & saves dari 20 video terakhir
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
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                ></Pie>
                <Tooltip
                  formatter={(value) => [
                    `${(((value as number) / total) * 100).toFixed(1)}% (${(value as number).toLocaleString("id-ID")})`,
                    "Proporsi",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
