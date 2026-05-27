import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendMessage } from "@/lib/telegram";

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
    return NextResponse.json(
      { error: "Telegram belum terhubung" },
      { status: 400 }
    );
  }

  await sendMessage(
    user.telegramChatId,
    `✅ <b>Halo, ${user.name}!</b>\n\nKoneksi Telegram InsightIQ kamu berjalan dengan baik.\n\nKamu akan menerima rekomendasi produk harian sesuai jadwal yang kamu pilih. Semangat! 🚀`
  );

  return NextResponse.json({ success: true });
}
