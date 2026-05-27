import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendMessage, formatDailyMessage } from "@/lib/telegram";

// Force kirim notifikasi sekarang — bypass jam & double-send check (untuk testing)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.user.id),
  });

  if (!user?.telegramConnected || !user?.telegramChatId) {
    return NextResponse.json({ error: "Telegram belum terhubung" }, { status: 400 });
  }

  const analysis = await db
    .collection("analyses")
    .findOne({ userId: user._id }, { sort: { createdAt: -1 } });

  if (!analysis || !analysis.recommendations?.length) {
    return NextResponse.json(
      { error: "Belum ada analisis. Lakukan analisis TikTok terlebih dahulu." },
      { status: 400 }
    );
  }

  const account = await db.collection("accounts").findOne({ userId: user._id });
  if (!account) {
    return NextResponse.json({ error: "Data TikTok tidak ditemukan" }, { status: 400 });
  }

  const message = formatDailyMessage(user.name, analysis as any, account as any);
  await sendMessage(user.telegramChatId, message);

  // Tidak update lastNotificationSentAt agar notifikasi otomatis tetap berjalan normal

  return NextResponse.json({ success: true });
}
