import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env");
  process.exit(1);
}

if (!CRON_SECRET) {
  console.error("❌ CRON_SECRET tidak ditemukan di .env");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 InsightIQ Bot mulai berjalan (polling mode)...");

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match![1].trim().toUpperCase();
  const firstName = msg.from?.first_name;

  console.log(`[BOT] /start dari chat_id=${chatId}, kode=${code}`);

  try {
    const res = await fetch(`${APP_URL}/api/telegram/verify-internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": CRON_SECRET!,
      },
      body: JSON.stringify({ code, chatId, firstName }),
    });

    const data = await res.json();

    if (res.status === 401) {
      console.error("[BOT] CRON_SECRET tidak cocok dengan server!");
      bot.sendMessage(chatId, "❌ Konfigurasi bot bermasalah. Hubungi admin.");
      return;
    }

    if (!data.success) {
      console.log(`[BOT] Verifikasi gagal: ${data.reason}`);
      // pesan error sudah dikirim oleh verify-internal endpoint
    } else {
      console.log(`[BOT] ✅ User ${data.userName} berhasil terhubung`);
    }
  } catch (err: any) {
    console.error("[BOT] Error:", err.message);
    bot.sendMessage(
      chatId,
      "❌ Server InsightIQ tidak bisa dihubungi. Pastikan `npm run dev` sudah berjalan lalu coba lagi."
    );
  }
});

bot.onText(/\/start$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Halo! Saya bot InsightIQ.\n\nUntuk menghubungkan akun, pergi ke Settings InsightIQ dan klik <b>Hubungkan Telegram</b>, lalu kirim kode yang diberikan ke sini.",
    { parse_mode: "HTML" }
  );
});

bot.on("polling_error", (err) => {
  console.error("[BOT] Polling error:", err.message);
});

process.on("SIGINT", () => {
  console.log("\n🛑 Bot dihentikan.");
  bot.stopPolling();
  process.exit(0);
});
