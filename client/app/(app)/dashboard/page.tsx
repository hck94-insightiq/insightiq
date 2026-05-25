import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import KpiCards from "@/components/dashboard/KpiCards";
import EngagementChart from "@/components/charts/EngagementChart";
import EmptyState from "@/components/shared/EmptyState";
import NicheBreakdown from "@/components/charts/NicheBreakdown";
import AudienceDonut from "@/components/charts/AudienceDonut";
import ProductMatchChart from "@/components/charts/ProductMatchChart";
import PostingTimeChart from "@/components/charts/PostingTimeChart";
import { Account, Analysis } from "@/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const db = await getDb();
  const account = await db
    .collection("accounts")
    .findOne({ userId: new ObjectId(session.user.id) });

  if (!account) redirect("/onboarding");

  const analysis = await db
    .collection("analyses")
    .findOne(
      { userId: new ObjectId(session.user.id) },
      { sort: { createdAt: -1 } },
    );

  const serializedAccount = JSON.parse(JSON.stringify(account)) as Account;
  const serializedAnalysis = analysis
    ? (JSON.parse(JSON.stringify(analysis)) as Analysis)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Insight untuk @{account.tiktokUsername}
        </p>
      </div>

      <KpiCards account={serializedAccount} analysis={serializedAnalysis} />

      {!serializedAnalysis && (
        <EmptyState
          title="AI Analysis Belum Tersedia"
          description="Klik tombol di bawah untuk menjalankan analisis AI berdasarkan data akun yang sudah kamu input."
          ctaLabel="Jalankan AI Analysis"
          ctaHref="/dashboard/analysis"
        />
      )}

      {serializedAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementChart account={serializedAccount} />
          <NicheBreakdown data={serializedAnalysis.nicheBreakdown} />
          <AudienceDonut account={serializedAccount} />
          <ProductMatchChart
            recommendations={serializedAnalysis.recommendations}
          />
          <PostingTimeChart account={serializedAccount} />
        </div>
      )}
    </div>
  );
}
