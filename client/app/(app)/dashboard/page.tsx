import { AudienceDonut } from "@/components/charts/AudienceDonut";
import EngagementChart from "@/components/charts/EngagementChart";
import { NicheBreakdown } from "@/components/charts/NicheBreakdown";
import { PostingTimeChart } from "@/components/charts/PostingTimeChart";
import { ProductMatchChart } from "@/components/charts/ProductMatchChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Insight untuk @username</p>
      </div>

      <KpiCards />

      {/* {!analysis && (
        <EmptyState
          title="AI Analysis Belum Tersedia"
          description="Klik tombol di bawah untuk menjalankan analisis AI berdasarkan data akun yang sudah kamu input."
          ctaLabel="Jalankan AI Analysis"
          ctaHref="/dashboard/analysis"
        />
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart />
        <NicheBreakdown />
        <AudienceDonut />
        <ProductMatchChart />
        <PostingTimeChart />
      </div>
    </div>
  );
}
