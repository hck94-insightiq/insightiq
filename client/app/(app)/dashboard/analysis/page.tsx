import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReAnalyzeButton } from "@/components/dashboard/ReAnalyzeButton";
import EmptyState from "@/components/shared/EmptyState";
import { Sparkles, Users, Calendar, TrendingUp } from "lucide-react";

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const account = await db.collection("accounts").findOne({
    userId,
  });

  if (!account) redirect("/onboarding");

  const analysis = await db
    .collection("analyses")
    .findOne({ userId }, { sort: { createdAt: -1 } });

  if (!analysis) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">AI Analysis</h1>
        <EmptyState
          title="Belum Ada Analisis"
          description="Klik tombol untuk menjalankan AI analysis berdasarkan data akun TikTok kamu."
          icon={<Sparkles size={48} />}
        />
        <div className="flex justify-center">
          <ReAnalyzeButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Analysis</h1>
          <p className="text-muted-foreground">
            Generated {new Date(analysis.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <ReAnalyzeButton />
      </div>

      {/* Primary & Secondary Niche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-amber-500" /> Niche Detection
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <Badge variant="secondary">{analysis.confidenceScore}%</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Primary Niche</p>
            <p className="text-2xl font-bold">{analysis.primaryNiche}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Secondary Niche
            </p>
            <p className="text-lg">{analysis.secondaryNiche}</p>
          </div>
          <Progress value={analysis.confidenceScore} className="mt-4" />
        </CardContent>
      </Card>

      {/* Nuance Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-blue-500" /> Nuance & Character
          </CardTitle>
          <CardDescription>Karakter unik akun kamu menurut AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">
            {analysis.nuanceDescription}
          </p>
        </CardContent>
      </Card>

      {/* Audience Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-pink-500" /> Audience Profile
            <Badge variant="secondary" className="ml-auto text-xs">
              AI-Estimated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Age Range</p>
              <p className="font-semibold">
                {analysis.audienceProfile.ageRange}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Purchase Power
              </p>
              <p className="font-semibold">
                {analysis.audienceProfile.purchasePower}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posting Time Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-emerald-500" /> Best Posting Days
          </CardTitle>
          <CardDescription>
            Score rekomendasi posting per hari berdasarkan kebiasaan audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {account.postingDays?.map((d: any) => (
              <div
                key={d.day}
                className="text-center p-3 rounded-lg bg-secondary/50"
              >
                <p className="text-xs text-muted-foreground mb-1">{d.day}</p>
                <p className="text-xl font-bold">
                  {Number(d.avgViews).toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-muted-foreground">{d.count}x</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
