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
  recommendations?: Analysis["recommendations"]
}

export default function ProductMatchChart({recommendations}: Props) {
  const chartData = recommendations?.map((item) => ({
    category: item.category,
    matchScore: item.matchScore
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Match Score</CardTitle>
        <CardDescription>
          Ranking kategori produk yang paling cocok untuk akunmu
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
              <YAxis type="category" dataKey="category" className="text-xs" width={70} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Match Score"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="matchScore" radius={[0, 6, 6, 0]}>
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