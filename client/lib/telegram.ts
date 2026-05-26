import type { Analysis, Account } from "@/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendMessage(chatId: string, text: string): Promise<void> {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telegram API error: ${err.description}`);
  }
}

export function formatDailyMessage(
  userName: string,
  analysis: Analysis,
  _account: Account
): string {
  const top3 = analysis.recommendations.slice(0, 3);

  const rankEmoji = ["1️⃣", "2️⃣", "3️⃣"];

  const produkLines = top3
    .map((rec, i) => {
      return (
        `${rankEmoji[i]} *${rec.category}* — Match: ${rec.matchScore}%\n` +
        `💰 ${rec.priceRange}\n` +
        `_${rec.reason}_`
      );
    })
    .join("\n\n");

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    `🌅 *Selamat pagi, ${userName}!*\n` +
    `📅 ${tanggal}\n\n` +
    `📊 *Rekomendasi Produk Hari Ini*\n` +
    `Niche kamu: _${analysis.primaryNiche}_\n\n` +
    `🔥 *Top 3 Produk untuk Kamu:*\n\n` +
    `${produkLines}\n\n` +
    `📱 Lihat analisis lengkap → ${APP_URL}/recommendations\n\n` +
    `Semangat jualan hari ini! 💪`
  );
}

export function generateVerifyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
