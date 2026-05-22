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

const MOCK_DATA = [
  { metric: "Views", value: 15400 },
  { metric: "Likes", value: 3200 },
  { metric: "Comments", value: 480 },
  { metric: "Shares", value: 210 },
];

export default function EngagementChart() {
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
              data={MOCK_DATA}
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
