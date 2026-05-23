import { AudienceDonut } from "@/components/charts/AudienceDonut";
import EngagementChart from "@/components/charts/EngagementChart";
import { NicheBreakdown } from "@/components/charts/NicheBreakdown";
import { PostingTimeChart } from "@/components/charts/PostingTimeChart";
import { ProductMatchChart } from "@/components/charts/ProductMatchChart";
import { KpiCards } from "@/components/dashboard/KpiCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Insight untuk @username</p>
      </div>

      <KpiCards />

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
