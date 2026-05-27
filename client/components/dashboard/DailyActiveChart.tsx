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
import { useTheme } from "next-themes";

interface DayData {
  day: string;
  users: number;
}

interface Props {
  data: DayData[];
  avgPerDay: number;
}

export default function DailyActiveChart({ data, avgPerDay }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const avgLabel = `~${avgPerDay}/hari`;
  const avgClass =
    "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20 font-semibold";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            Registrasi User · 30 Hari
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            User baru yang bergabung per hari
          </p>
        </div>
        <span className={`text-xs border px-2 py-1 rounded-full ${avgClass}`}>
          {avgLabel}
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#ffffff14" : "#f0f0f0"}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: isDark ? "#6b7280" : "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? "#6b7280" : "#9ca3af" }}
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
                border: `1px solid ${isDark ? "#ffffff1a" : "#e5e7eb"}`,
                backgroundColor: isDark ? "#1c1c1c" : "#ffffff",
                color: isDark ? "#f3f4f6" : "#111827",
                fontSize: "12px",
              }}
              labelStyle={{
                color: isDark ? "#9ca3af" : "#6b7280",
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
