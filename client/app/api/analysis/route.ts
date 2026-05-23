import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb"
import { analyzeAccount } from "@/lib/gemini";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam

// POST - trigger fresh analysis (dengan caching)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const userId = new ObjectId(session.user.id);

  // Cek apakah user sudah onboarding
  const account = await db.collection("accounts").findOne({ userId });
  if (!account) {
    return NextResponse.json(
      {
        error: "Account data belum ada. Lakukan onboarding dulu.",
      },
      { status: 400 },
    );
  }

  // CACHING CHECK - kalau ada analysis < 24h, return yang existing
  const existing = await db
    .collection("analyses")
    .findOne({ userId }, { sort: { createdAt: -1 } });

  if (
    existing &&
    Date.now() - new Date(existing.createdAt).getTime() < CACHE_DURATION_MS
  ) {
    return NextResponse.json({
      analysis: existing,
      cached: true,
    });
  }

  // Trigger AI analysis
  try {
    const result = await analyzeAccount(account as any);

    const analysisDoc = {
      userId,
      accountId: account._id,
      ...result,
      createdAt: new Date(),
    };

    const insert = await db.collection("analyses").insertOne(analysisDoc);

    return NextResponse.json({
      analysis: { ...analysisDoc, _id: insert.insertedId },
      cached: false,
    });
  } catch (error: any) {
    console.error("AI analysis failed:", error);
    return NextResponse.json(
      {
        error: "Gagal menjalankan AI analysis",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// GET - fetch latest analysis
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const analysis = await db
    .collection("analyses")
    .findOne(
      { userId: new ObjectId(session.user.id) },
      { sort: { createdAt: -1 } },
    );

  return NextResponse.json({ analysis });
}

// DELETE - force re-analysis (hapus cache)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  await db
    .collection("analyses")
    .deleteMany({ userId: new ObjectId(session.user.id) });

  return NextResponse.json({ success: true });
}
