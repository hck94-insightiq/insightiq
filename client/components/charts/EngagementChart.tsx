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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CHART_COLORS } from "@/lib/chart-colors";
import { Account } from "@/types";

interface Props {
  account?: Account
}

export default function EngagementChart( {account}: Props) {
  const chartData = [
    { metric: "Views", value: account?.avgViews ?? 0 },
    { metric: "Likes", value: account?.avgLikes ?? 0 },
    { metric: "Comments", value: account?.avgComments ?? 0 },
    { metric: "Shares", value: account?.avgShares ?? 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
        <CardDescription>
          Rata-rata views, likes, comments, dan shares per video
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.blue}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
