import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, BarChart3, TrendingUp } from "lucide-react";

async function getStats() {
  const db = await getDb();

  const [users, accounts, analyses] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("accounts").countDocuments(),
    db.collection("analyses").countDocuments(),
  ]);

  const niches = await db
    .collection("accounts")
    .aggregate([
      { $group: { _id: "$primaryNiche", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])
    .toArray();

  return { users, accounts, analyses, niches };
}
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Statistik platform InsightIQ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Onboarded Accounts
            </CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.accounts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Analyses Run
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.analyses}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <CardTitle>Top 5 Niches</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {stats.niches.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada data niche.</p>
            ) : (
              stats.niches.map((n, index) => (
                <li
                  key={n._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-4">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-800">{n._id}</span>
                  </div>
                  <Badge variant="secondary">{n.count} accounts</Badge>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
