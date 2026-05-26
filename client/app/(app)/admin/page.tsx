import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, Activity, Brain } from "lucide-react";
import Link from "next/link";
import DailyActiveChart from "@/components/dashboard/DailyActiveChart";

interface NicheItem {
  _id: string;
  count: number;
}

interface ActivityItem {
  user: { name?: string }[];
  primaryNiche?: string;
  confidenceScore?: number;
  createdAt?: Date;
}

interface DailyActiveItem {
  date: string;
  users: number;
}

async function getDailyActive(): Promise<{ data: { day: string; users: number }[]; growth: number }> {
  const db = await getDb();

  // Ambil semua data tanpa filter tanggal, lalu ambil 30 hari terakhir yang ada datanya
  const raw = (await db
    .collection("analyses")
    .aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          users: { $size: "$users" },
        },
      },
      { $sort: { date: -1 } },
      { $limit: 30 },
    ])
    .toArray()) as DailyActiveItem[];

  const dailyMap = new Map(raw.map((d) => [d.date, d.users]));

  // Bangun grid 30 hari mundur dari tanggal terbaru yang ada datanya
  const latestDate = raw.length > 0 ? new Date(raw[raw.length - 1].date) : new Date();
  const data = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(latestDate);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    // Format DD/MM agar tidak ambigu saat lintas bulan
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    return { day: label, users: dailyMap.get(key) ?? 0 };
  });

  const last7 = data.slice(-7).reduce((s, d) => s + d.users, 0);
  const prev7 = data.slice(-14, -7).reduce((s, d) => s + d.users, 0);
  const growth = prev7 === 0 ? 0 : Math.round(((last7 - prev7) / prev7) * 100);

  return { data, growth };
}

async function getStats() {
  const db = await getDb();

  const [users, accounts, analyses] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("accounts").countDocuments(),
    db.collection("analyses").countDocuments(),
  ]);

  const niches = (await db
    .collection("analyses")
    .aggregate([
      { $match: { primaryNiche: { $exists: true, $ne: null } } },
      { $group: { _id: "$primaryNiche", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ])
    .toArray()) as NicheItem[];

  const recentActivity = (await db
    .collection("analyses")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
    ])
    .toArray()) as ActivityItem[];

  const avgConfidence =
    analyses > 0
      ? await db
          .collection("analyses")
          .aggregate([
            { $group: { _id: null, avg: { $avg: "$confidenceScore" } } },
          ])
          .toArray()
          .then((r) => Math.round(r[0]?.avg || 0))
      : 0;

  return { users, accounts, analyses, niches, recentActivity, avgConfidence };
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const maxNicheCount = (niches: NicheItem[]) =>
  Math.max(...niches.map((n) => n.count), 1);

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const [stats, daily] = await Promise.all([getStats(), getDailyActive()]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
          // ADMIN
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
            <p className="text-xs text-green-500 mt-1">Platform members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Analyses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.analyses}</p>
            <p className="text-xs text-green-500 mt-1">AI analyses run</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Onboarded Accounts
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.accounts}</p>
            <p className="text-xs text-green-500 mt-1">TikTok accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Confidence
            </CardTitle>
            <Brain className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {stats.avgConfidence}%
            </p>
            <p className="text-xs text-green-500 mt-1">AI niche accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Niche Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DailyActiveChart data={daily.data} growth={daily.growth} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Niche Distribution
            </CardTitle>
            <p className="text-xs text-gray-400">Top niche di platform</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.niches.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada data niche.</p>
            ) : (
              stats.niches.map((n) => {
                const pct = Math.round(
                  (n.count / maxNicheCount(stats.niches)) * 100,
                );
                return (
                  <div key={n._id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{n._id}</span>
                      <span className="text-gray-500">{n.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Recent Platform Activity
            </CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">Last 20 events</p>
          </div>
          <Link
            href="/admin/users"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View all users →
          </Link>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b">
                <th className="text-left pb-2 font-medium">Event</th>
                <th className="text-left pb-2 font-medium">User</th>
                <th className="text-left pb-2 font-medium">Detail</th>
                <th className="text-right pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Belum ada aktivitas.
                  </td>
                </tr>
              ) : (
                stats.recentActivity.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        NEW_ANALYSIS
                      </Badge>
                    </td>
                    <td className="py-3 font-medium text-gray-800">
                      {a.user?.[0]?.name ?? "Unknown"}
                    </td>
                    <td className="py-3 text-gray-500">
                      Niche detected: {a.primaryNiche ?? "-"}
                      {a.confidenceScore ? ` (${a.confidenceScore}% conf)` : ""}
                    </td>
                    <td className="py-3 text-right text-gray-400">
                      {a.createdAt ? timeAgo(a.createdAt) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
