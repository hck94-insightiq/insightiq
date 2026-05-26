import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendMessage } from "@/lib/telegram";

// Endpoint ini dipanggil oleh bot script (bukan user langsung)
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, chatId, firstName } = await request.json();

  if (!code || !chatId) {
    return NextResponse.json({ error: "Missing code or chatId" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({
    telegramVerifyCode: code,
    telegramVerifyExpiry: { $gt: new Date() },
  });

  if (!user) {
    await sendMessage(
      String(chatId),
      "❌ Kode tidak valid atau sudah kadaluarsa.\n\nMinta kode baru di halaman Settings InsightIQ."
    );
    return NextResponse.json({ success: false, reason: "invalid_code" });
  }

  await db.collection("users").updateOne(
    { _id: user._id },
    {
      $set: {
        telegramChatId: String(chatId),
        telegramConnected: true,
        notificationEnabled: true,
        notificationHour: user.notificationHour ?? 5,
      },
      $unset: {
        telegramVerifyCode: "",
        telegramVerifyExpiry: "",
      },
    }
  );

  const greeting = firstName ? `, ${firstName}` : "";
  await sendMessage(
    String(chatId),
    `✅ *Berhasil${greeting}!*\n\nAkun InsightIQ kamu (*${user.name}*) sudah terhubung ke Telegram.\n\nKamu akan mendapat rekomendasi produk harian setiap hari sesuai jadwal yang kamu set di Settings. 🎉\n\nSelamat jualan! 🚀`
  );

  return NextResponse.json({ success: true, userName: user.name });
}
