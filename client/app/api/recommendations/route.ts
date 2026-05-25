import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const analysis = await db.collection("analyses").findOne(
    { userId: new ObjectId(session.user.id) },
    {
      sort: { createdAt: -1 },
      projection: {
        recommendations: 1,
        createdAt: 1,
      },
    },
  );

  if (!analysis) {
    return NextResponse.json({
      recommendations: [],
      message: "Belum ada analisis. Jalankan AI analysis dulu.",
    });
  }

  // Sort by matchScore descending
  const sorted = [...(analysis.recommendations || [])].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  return NextResponse.json({
    recommendations: sorted,
    generatedAt: analysis.createdAt,
  });
}
