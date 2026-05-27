import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { generateVerifyCode } from "@/lib/telegram";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const code = generateVerifyCode();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    {
      $set: {
        telegramVerifyCode: code,
        telegramVerifyExpiry: expiry,
      },
    }
  );

  return NextResponse.json({
    code,
    botUsername: process.env.TELEGRAM_BOT_USERNAME ?? "InsightIQ_Bot",
    expiresAt: expiry.toISOString(),
  });
}
