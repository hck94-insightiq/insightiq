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
import { CHART_COLORS } from "@/lib/chart-colors";

const MOCK_DATA = [
  { day: "Mon", score: 5 },
  { day: "Tue", score: 6 },
  { day: "Wed", score: 7 },
  { day: "Thu", score: 8 },
  { day: "Fri", score: 9 },
  { day: "Sat", score: 9 },
  { day: "Sun", score: 7 },
];

export default function PostingTimeChart() {
  const maxScore = Math.max(...MOCK_DATA.map((d) => d.score));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Posting Days</CardTitle>
        <CardDescription>
          AI rekomendasi hari posting paling optimal untuk audiencemu
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
              <XAxis dataKey="day" className="text-xs" />
              <YAxis domain={[0, 10]} className="text-xs" />
              <Tooltip
                formatter={(value) => [`${value}/10`, "Score"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {MOCK_DATA.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.score === maxScore
                        ? CHART_COLORS.emerald
                        : CHART_COLORS.blue
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}