import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET!;

// Vercel akan set ini saat register webhook
const WEBHOOK_SECRET = process.env.CRON_SECRET!;

// POST — dipanggil Telegram setiap ada pesan masuk
export async function POST(req: NextRequest) {
  // Validasi secret token dari Telegram
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const message = body?.message;

  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text: string = message.text ?? "";
  const firstName = message.from?.first_name;

  // Handler: /start KODE
  const startWithCode = text.match(/^\/start (.+)/);
  if (startWithCode) {
    const code = startWithCode[1].trim().toUpperCase();

    try {
      const res = await fetch(`${APP_URL}/api/telegram/verify-internal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": CRON_SECRET,
        },
        body: JSON.stringify({ code, chatId, firstName }),
      });

      if (res.status === 401) {
        await sendMessage(
          String(chatId),
          "❌ Konfigurasi bot bermasalah. Hubungi admin.",
        );
      }
      // Pesan sukses/gagal sudah dikirim oleh verify-internal
    } catch {
      await sendMessage(
        String(chatId),
        "❌ Server InsightIQ tidak bisa dihubungi. Coba lagi dalam beberapa saat.",
      );
    }

    return NextResponse.json({ ok: true });
  }

  // Handler: /start tanpa kode
  if (text === "/start") {
    await sendMessage(
      String(chatId),
      "👋 Halo! Saya bot InsightIQ.\n\nUntuk menghubungkan akun, pergi ke Settings InsightIQ dan klik <b>Hubungkan Telegram</b>, lalu kirim kode yang diberikan ke sini.",
    );
    return NextResponse.json({ ok: true });
  }

  // Pesan lain — abaikan
  return NextResponse.json({ ok: true });
}

// GET — untuk register/cek webhook (opsional, helper)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (!BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN tidak ditemukan" },
      { status: 500 },
    );
  }

  // ?action=set — register webhook ke Telegram
  if (action === "set") {
    const webhookUrl = `${APP_URL}/api/telegram/webhook`;
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: WEBHOOK_SECRET,
          allowed_updates: ["message"],
        }),
      },
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  // ?action=delete — hapus webhook (untuk dev lokal pakai polling lagi)
  if (action === "delete") {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  // Default — cek status webhook
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
