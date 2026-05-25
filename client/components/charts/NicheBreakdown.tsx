"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CHART_PALETTE } from "@/lib/chart-colors";
import { Analysis } from "@/types";

interface Props {
  data? : Analysis["nicheBreakdown"]
}

export default function NicheBreakdown({data}: Props) {
  const chartData = data?.map((item) => ({niche: item.niche, score: item.score})) ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>Niche Breakdown</CardTitle>
        <CardDescription>
          Distribusi konten berdasarkan analisis AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} className="text-xs" />
              <YAxis type="category" dataKey="niche" className="text-xs" width={60} />
              <Tooltip
                formatter={(value) => [`${value}/100`, "Score"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}