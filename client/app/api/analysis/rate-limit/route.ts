import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const RATE_LIMIT_MAX = 3;

// GET - cek rate limit status user saat ini
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db
    .collection("users")
    .findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { "rateLimits.reanalyze": 1 } },
    );

  const rl = user?.rateLimits?.reanalyze;
  const now = new Date();

  if (!rl || rl.resetAt <= now) {
    return NextResponse.json({
      isLimited: false,
      count: rl?.count ?? 0,
      resetAt: null,
    });
  }

  const isLimited = rl.count >= RATE_LIMIT_MAX;

  return NextResponse.json({
    isLimited,
    count: rl.count,
    resetAt: isLimited ? rl.resetAt : null,
  });
}
