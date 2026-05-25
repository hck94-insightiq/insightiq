"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CHART_PALETTE } from "@/lib/chart-colors";
import { Analysis } from "@/types";

interface Props {
  data?: Analysis["audienceProfile"]["genderBreakdown"]
  ageRange?: string
}

export default function AudienceDonut({data, ageRange}: Props) {
  const chartData = data ? [
    {name: "Female", value: data.female},
    {name: "Male", value: data.male},
    {name: "Other", value: data.other},
  ] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Profile</CardTitle>
        <CardDescription>
          Estimasi gender audience — AI-estimated
          {ageRange && ` · ${ageRange}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 280 }}>
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
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Proporsi"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}