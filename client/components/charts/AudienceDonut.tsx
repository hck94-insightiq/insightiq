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

const MOCK_DATA = [
  { name: "Female", value: 68 },
  { name: "Male", value: 28 },
  { name: "Other", value: 4 },
];

export function AudienceDonut() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Profile</CardTitle>
        <CardDescription>
          Estimasi gender audience — AI-estimated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_DATA}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {MOCK_DATA.map((_, index) => (
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