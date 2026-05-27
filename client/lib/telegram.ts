import type { Analysis, Account } from "@/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Escape karakter HTML agar tidak merusak parse_mode HTML Telegram
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    },
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telegram API error: ${err.description}`);
  }
}

export function formatDailyMessage(
  userName: string,
  analysis: Analysis,
  _account: Account,
): string {
  const top3 = analysis.recommendations.slice(0, 3);

  const rankEmoji = ["1️⃣", "2️⃣", "3️⃣"];

  const produkLines = top3
    .map((rec, i) => {
      return (
        `${rankEmoji[i]} <b>${esc(rec.category)}</b> — Match: ${rec.matchScore}%\n` +
        `💰 ${esc(rec.priceRange)}\n` +
        `<i>${esc(rec.reason)}</i>`
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

  // Greeting berdasarkan jam WIB
  const jamWIB = new Date(now.getTime() + 7 * 60 * 60 * 1000).getUTCHours();
  const greeting =
    jamWIB >= 5 && jamWIB < 12
      ? "🌅 Selamat pagi"
      : jamWIB >= 12 && jamWIB < 15
        ? "☀️ Selamat siang"
        : jamWIB >= 15 && jamWIB < 19
          ? "🌤️ Selamat sore"
          : "🌙 Selamat malam";

  const linkUrl = `${APP_URL}/recommendations`;
  const isLocalhost = APP_URL.includes("localhost");

  return (
    `${greeting}, <b>${esc(userName)}!</b>\n` +
    `📅 ${tanggal}\n\n` +
    `📊 <b>Rekomendasi Produk Hari Ini</b>\n` +
    `Niche kamu: <i>${esc(analysis.primaryNiche)}</i>\n\n` +
    `🔥 <b>Top 3 Produk untuk Kamu:</b>\n\n` +
    `${produkLines}\n\n` +
    (isLocalhost
      ? `📱 Lihat analisis lengkap → ${linkUrl}\n\n`
      : `📱 <a href="${linkUrl}">Lihat analisis lengkap →</a>\n\n`) +
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
