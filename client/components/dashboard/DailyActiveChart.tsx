"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayData {
  day: string;
  users: number;
}

interface Props {
  data: DayData[];
  growth: number;
}

export default function DailyActiveChart({ data, growth }: Props) {
  const growthLabel =
    growth > 0 ? `↑ ${growth}%` : growth < 0 ? `↓ ${Math.abs(growth)}%` : "—";
  const growthClass =
    growth >= 0
      ? "bg-green-50 text-green-600 border-green-200"
      : "bg-red-50 text-red-500 border-red-200";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            Daily Active Users · 30 hari
          </CardTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Kreator yang menjalankan analisis
          </p>
        </div>
        <span
          className={`text-xs border px-2 py-1 rounded-full ${growthClass}`}
        >
          {growthLabel}
        </span>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
              }
            />
            <Tooltip
              formatter={(v) => [Number(v).toLocaleString(), "Active Users"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#colorUsers)"
              dot={{ r: 3, fill: "#14b8a6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
