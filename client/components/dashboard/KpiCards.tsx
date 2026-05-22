"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_KPI = {
  engagementRate: 4.7,
  totalVideos: 128,
  avgViews: 15400,
  nicheConfidence: 87,
  affiliateMatch: 92,
};

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Engagement Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{MOCK_KPI.engagementRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Total Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{MOCK_KPI.totalVideos}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Avg Views / Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {MOCK_KPI.avgViews.toLocaleString("id-ID")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Niche Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{MOCK_KPI.nicheConfidence}%</p>
          <p className="text-xs text-muted-foreground mt-1">AI-estimated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Affiliate Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{MOCK_KPI.affiliateMatch}%</p>
          <p className="text-xs text-muted-foreground mt-1">AI-estimated</p>
        </CardContent>
      </Card>
    </div>
  );
}