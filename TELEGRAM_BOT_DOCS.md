# 📬 Dokumentasi Lengkap Fitur Telegram Bot — InsightIQ

Fitur ini memungkinkan setiap user InsightIQ menerima **rekomendasi produk harian secara otomatis via Telegram**, berdasarkan hasil analisis niche TikTok mereka masing-masing.

---

## 🗂️ Daftar File & Fungsinya

| No | File | Jenis | Fungsi Singkat |
|----|------|-------|----------------|
| 1 | `client/lib/telegram.ts` | Backend Library | Kirim pesan, format pesan, generate kode |
| 2 | `client/app/api/telegram/generate-code/route.ts` | Backend API | Buat kode verifikasi 8 karakter |
| 3 | `client/app/api/telegram/status/route.ts` | Backend API | Cek & update pengaturan notifikasi |
| 4 | `client/app/api/telegram/verify-internal/route.ts` | Backend API | Verifikasi kode dari bot |
| 5 | `client/app/api/telegram/test/route.ts` | Backend API | Kirim pesan tes ke Telegram |
| 6 | `client/app/api/telegram/disconnect/route.ts` | Backend API | Putus koneksi Telegram |
| 7 | `client/app/api/cron/daily-notifications/route.ts` | Backend API | Kirim notifikasi harian ke semua user |
| 8 | `client/scripts/telegram-bot.ts` | Script | Bot polling yang mendengarkan pesan masuk |
| 9 | `client/scripts/cron-scheduler.ts` | Script | Scheduler yang memicu notifikasi tiap menit |
| 10 | `client/vercel.json` | Config | Konfigurasi cron otomatis saat production |

### File yang Dimodifikasi
| File | Perubahan |
|------|-----------|
| `client/types/index.ts` | Tambah 7 field Telegram ke interface `User` |
| `client/app/(app)/settings/page.tsx` | Tambah section "Notifikasi Telegram" di UI |
| `client/package.json` | Tambah script `npm run bot` dan `npm run cron` |
| `client/.env` | Tambah 4 environment variable baru |

---

## 🔄 Alur Kerja Sistem (Flow Lengkap)

```
[USER] Klik "Hubungkan Telegram" di Settings
         ↓
[FRONTEND] Panggil POST /api/telegram/generate-code
         ↓
[BACKEND] Generate kode 8 karakter → simpan ke DB (expired 15 menit)
         ↓
[FRONTEND] Tampilkan kode + instruksi ke user
         ↓
[USER] Buka Telegram → kirim "/start KODE8KARAKTER" ke bot
         ↓
[BOT SCRIPT] Terima pesan → panggil POST /api/telegram/verify-internal
         ↓
[BACKEND] Validasi kode di DB → simpan chat_id → hapus kode
         ↓
[BOT] Kirim pesan konfirmasi ke user via Telegram
         ↓
[USER] Kembali ke Settings → klik "Cek Status" → status jadi hijau ✅
         ↓
[USER] Aktifkan notifikasi + pilih jam (default 05:00 WIB)
         ↓
============ SETIAP MENIT ============
[CRON SCRIPT] Panggil GET /api/cron/daily-notifications
         ↓
[BACKEND] Cek jam WIB sekarang → cari user yang waktunya cocok
         ↓
[BACKEND] Ambil analisis AI terbaru user dari DB
         ↓
[BACKEND] Format pesan rekomendasi → kirim via Telegram API
         ↓
[BACKEND] Catat waktu kirim → cegah double-send hari yang sama
```

---

## ⚙️ Environment Variable (`.env`)

```env
# Token dari BotFather Telegram
TELEGRAM_BOT_TOKEN=8920436901:AAGbV3qLhzWcSn59s0NEf5PCuspPbcqQpRQ

# Username bot yang sudah dibuat
TELEGRAM_BOT_USERNAME=InsightIQNotifBot

# Secret key acak untuk keamanan endpoint cron & bot
# Generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CRON_SECRET=96d0b3dcd2c2912f35acb251cc63c0543598545c81400a241921d92120d80a7f

# URL aplikasi (ganti saat production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗃️ Perubahan Database (Collection `users`)

Field baru yang ditambahkan ke setiap dokumen user di MongoDB:

```ts
// client/types/index.ts — interface User
telegramChatId?: string          // ID chat Telegram user (dari Telegram API)
telegramConnected?: boolean      // Apakah Telegram sudah terhubung
telegramVerifyCode?: string      // Kode verifikasi sementara (dihapus setelah berhasil)
telegramVerifyExpiry?: Date      // Waktu expired kode (15 menit dari dibuat)
notificationEnabled?: boolean    // Apakah notifikasi harian aktif
notificationHour?: number        // Jam pengiriman (0-23 WIB, default: 5)
lastNotificationSentAt?: Date    // Waktu terakhir notifikasi dikirim (cegah double-send)
```

---

## 🔧 BACKEND — Penjelasan Kode Lengkap

---

### 1. `client/lib/telegram.ts` — Library Utama

File ini adalah **inti dari seluruh komunikasi dengan Telegram**. Semua file lain mengimport dari sini.

```ts
import type { Analysis, Account } from "@/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Fungsi 1: Kirim pesan ke user Telegram tertentu
// chatId = ID unik setiap user di Telegram (didapat saat verifikasi)
// text = isi pesan (support Markdown: *bold*, _italic_)
export async function sendMessage(chatId: string, text: string): Promise<void> {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown", // supaya *bold* dan _italic_ jalan
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telegram API error: ${err.description}`);
  }
}

// Fungsi 2: Format pesan notifikasi harian
// Mengambil top 3 rekomendasi dari hasil analisis AI
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

  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
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

// Fungsi 3: Generate kode verifikasi acak 8 karakter
// Tidak pakai huruf/angka yang mirip (O=0, I=1, dll) agar tidak membingungkan user
export function generateVerifyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // contoh hasil: "D3S8PLFZ"
}
```

---

### 2. `client/app/api/telegram/generate-code/route.ts` — Buat Kode Verifikasi

Dipanggil saat user klik **"Hubungkan Telegram"** di Settings.

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { generateVerifyCode } from "@/lib/telegram";

// METHOD: POST /api/telegram/generate-code
export async function POST() {
  // Cek apakah user sudah login
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const code = generateVerifyCode();                          // buat kode: "D3S8PLFZ"
  const expiry = new Date(Date.now() + 15 * 60 * 1000);     // expired 15 menit dari sekarang

  // Simpan kode & expiry ke dokumen user di MongoDB
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { telegramVerifyCode: code, telegramVerifyExpiry: expiry } }
  );

  // Kembalikan kode + info bot ke frontend
  return NextResponse.json({
    code,
    botUsername: process.env.TELEGRAM_BOT_USERNAME ?? "InsightIQ_Bot",
    expiresAt: expiry.toISOString(),
  });
}
```

**Response contoh:**
```json
{
  "code": "D3S8PLFZ",
  "botUsername": "InsightIQNotifBot",
  "expiresAt": "2026-05-27T01:16:00.000Z"
}
```

---

### 3. `client/app/api/telegram/status/route.ts` — Cek & Update Pengaturan

Digunakan frontend untuk load status awal dan simpan perubahan pengaturan.

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// METHOD: GET /api/telegram/status
// Dipanggil saat Settings page dibuka → load status awal
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { telegramConnected: 1, notificationEnabled: 1, notificationHour: 1 } }
  );

  return NextResponse.json({
    connected: user?.telegramConnected ?? false,
    notificationEnabled: user?.notificationEnabled ?? false,
    notificationHour: user?.notificationHour ?? 5, // default jam 5 pagi
  });
}

// METHOD: PATCH /api/telegram/status
// Dipanggil saat user toggle notif ON/OFF atau ganti jam
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  // Hanya update field yang dikirim (tidak replace semua)
  if (typeof body.notificationEnabled === "boolean") {
    updates.notificationEnabled = body.notificationEnabled;
  }
  if (typeof body.notificationHour === "number" && body.notificationHour >= 0 && body.notificationHour <= 23) {
    updates.notificationHour = body.notificationHour;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: updates }
  );

  return NextResponse.json({ success: true });
}
```

---

### 4. `client/app/api/telegram/verify-internal/route.ts` — Verifikasi Kode dari Bot

Endpoint ini **hanya dipanggil oleh bot script**, bukan oleh user langsung. Dilindungi `CRON_SECRET`.

```ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendMessage } from "@/lib/telegram";

// METHOD: POST /api/telegram/verify-internal
// Dipanggil bot script setelah user kirim "/start KODE" ke Telegram
export async function POST(request: NextRequest) {
  // Validasi bahwa yang memanggil adalah bot script kita (bukan orang luar)
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, chatId, firstName } = await request.json();
  // code     = kode yang dikirim user ke bot, misal "D3S8PLFZ"
  // chatId   = ID chat Telegram user (angka unik dari Telegram)
  // firstName = nama depan user di Telegram (opsional, untuk sapaan)

  const db = await getDb();

  // Cari user yang memiliki kode ini dan belum expired
  const user = await db.collection("users").findOne({
    telegramVerifyCode: code,
    telegramVerifyExpiry: { $gt: new Date() }, // harus lebih besar dari sekarang
  });

  if (!user) {
    // Kode salah atau sudah expired → kirim pesan error ke Telegram user
    await sendMessage(
      String(chatId),
      "❌ Kode tidak valid atau sudah kadaluarsa.\n\nMinta kode baru di halaman Settings InsightIQ."
    );
    return NextResponse.json({ success: false, reason: "invalid_code" });
  }

  // Kode valid → simpan chat_id, tandai terhubung, hapus kode verifikasi
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
        telegramVerifyCode: "",    // hapus kode setelah dipakai
        telegramVerifyExpiry: "",  // hapus expiry
      },
    }
  );

  // Kirim pesan sukses ke Telegram user
  const greeting = firstName ? `, ${firstName}` : "";
  await sendMessage(
    String(chatId),
    `✅ *Berhasil${greeting}!*\n\nAkun InsightIQ kamu (*${user.name}*) sudah terhubung ke Telegram.\n\nKamu akan mendapat rekomendasi produk harian setiap hari sesuai jadwal yang kamu set di Settings. 🎉\n\nSelamat jualan! 🚀`
  );

  return NextResponse.json({ success: true, userName: user.name });
}
```

---

### 5. `client/app/api/telegram/test/route.ts` — Kirim Pesan Tes

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendMessage } from "@/lib/telegram";

// METHOD: POST /api/telegram/test
// Dipanggil saat user klik "Kirim Pesan Tes" di Settings
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session.user.id),
  });

  // Pastikan user sudah connect Telegram dulu
  if (!user?.telegramConnected || !user?.telegramChatId) {
    return NextResponse.json({ error: "Telegram belum terhubung" }, { status: 400 });
  }

  // Kirim pesan tes
  await sendMessage(
    user.telegramChatId,
    `✅ *Halo, ${user.name}!*\n\nKoneksi Telegram InsightIQ kamu berjalan dengan baik.\n\nKamu akan menerima rekomendasi produk harian sesuai jadwal yang kamu pilih. Semangat! 🚀`
  );

  return NextResponse.json({ success: true });
}
```

---

### 6. `client/app/api/telegram/disconnect/route.ts` — Putus Koneksi

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// METHOD: DELETE /api/telegram/disconnect
// Dipanggil saat user klik "Putuskan" di Settings
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    {
      $set: {
        telegramConnected: false,
        notificationEnabled: false,
      },
      $unset: {
        telegramChatId: "",        // hapus ID chat Telegram
        telegramVerifyCode: "",
        telegramVerifyExpiry: "",
      },
    }
  );

  return NextResponse.json({ success: true });
}
```

---

### 7. `client/app/api/cron/daily-notifications/route.ts` — Kirim Notifikasi Harian

Ini adalah **endpoint paling penting** — dipanggil setiap menit oleh cron scheduler.

```ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { sendMessage, formatDailyMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic"; // Pastikan tidak di-cache oleh Next.js

// METHOD: GET /api/cron/daily-notifications
// Dilindungi CRON_SECRET — hanya cron scheduler yang boleh akses
export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUTC = new Date();
  const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000); // konversi ke WIB
  const currentHour = nowWIB.getUTCHours();                         // ambil jam sekarang (WIB)

  // Hitung awal hari ini (00:00 WIB) dalam UTC → untuk cek double-send
  const startOfDayWIB = new Date(nowWIB);
  startOfDayWIB.setUTCHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(startOfDayWIB.getTime() - 7 * 60 * 60 * 1000);

  const db = await getDb();

  // Cari semua user yang:
  // 1. Telegram terhubung
  // 2. Notifikasi diaktifkan
  // 3. Jam notifikasi = jam sekarang (WIB)
  const users = await db.collection("users").find({
    telegramConnected: true,
    notificationEnabled: true,
    notificationHour: currentHour,
  }).toArray();

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of users) {
    // Skip jika sudah dikirim hari ini → cegah double-send
    if (
      user.lastNotificationSentAt &&
      new Date(user.lastNotificationSentAt) >= startOfDayUTC
    ) {
      skipped++;
      continue;
    }

    try {
      // Ambil analisis AI terbaru user
      const analysis = await db.collection("analyses").findOne(
        { userId: user._id },
        { sort: { createdAt: -1 } }
      );

      // Skip jika belum punya analisis atau tidak ada rekomendasi
      if (!analysis || !analysis.recommendations?.length) {
        skipped++;
        continue;
      }

      // Ambil data akun TikTok user
      const account = await db.collection("accounts").findOne({ userId: user._id });
      if (!account) { skipped++; continue; }

      // Format pesan → kirim ke Telegram
      const message = formatDailyMessage(user.name, analysis as any, account as any);
      await sendMessage(user.telegramChatId, message);

      // Catat waktu pengiriman
      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { lastNotificationSentAt: nowUTC } }
      );

      sent++;
    } catch (err: any) {
      errors.push(`${user._id}: ${err.message}`);
    }
  }

  // Return summary pengiriman
  return NextResponse.json({ hour: currentHour, sent, skipped, errors: errors.length ? errors : undefined });
}
```

**Contoh response:**
```json
{ "hour": 5, "sent": 12, "skipped": 3 }
```

---

## 🤖 SCRIPTS — Bot & Cron

---

### 8. `client/scripts/telegram-bot.ts` — Bot Polling

Script ini berjalan terus di background dan **mendengarkan pesan masuk** ke bot Telegram.

```ts
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import path from "path";

// Load .env dari folder client/
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;

// Validasi env sebelum mulai
if (!BOT_TOKEN) { console.error("❌ TELEGRAM_BOT_TOKEN tidak ditemukan"); process.exit(1); }
if (!CRON_SECRET) { console.error("❌ CRON_SECRET tidak ditemukan"); process.exit(1); }

// Buat instance bot dengan mode polling
// polling = bot aktif request ke Telegram terus-menerus (cocok untuk development)
// webhook = Telegram push ke server kita (cocok untuk production)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 InsightIQ Bot mulai berjalan (polling mode)...");

// Handler: /start KODE — user mengirim kode verifikasi
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match![1].trim().toUpperCase(); // normalisasi ke uppercase
  const firstName = msg.from?.first_name;

  console.log(`[BOT] /start dari chat_id=${chatId}, kode=${code}`);

  try {
    // Panggil API kita untuk validasi kode
    const res = await fetch(`${APP_URL}/api/telegram/verify-internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": CRON_SECRET!, // header keamanan
      },
      body: JSON.stringify({ code, chatId, firstName }),
    });

    const data = await res.json();

    if (res.status === 401) {
      // CRON_SECRET tidak cocok antara bot dan server
      console.error("[BOT] CRON_SECRET tidak cocok!");
      bot.sendMessage(chatId, "❌ Konfigurasi bot bermasalah. Hubungi admin.");
      return;
    }

    if (!data.success) {
      console.log(`[BOT] Verifikasi gagal: ${data.reason}`);
      // Pesan error sudah dikirim oleh endpoint verify-internal
    } else {
      console.log(`[BOT] ✅ User ${data.userName} berhasil terhubung`);
    }
  } catch (err: any) {
    // Server tidak bisa dihubungi (npm run dev tidak jalan)
    console.error("[BOT] Error:", err.message);
    bot.sendMessage(chatId, "❌ Server InsightIQ tidak bisa dihubungi. Pastikan `npm run dev` sudah berjalan.");
  }
});

// Handler: /start tanpa kode — user baru pertama kali buka bot
bot.onText(/\/start$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Halo! Saya bot InsightIQ.\n\nUntuk menghubungkan akun, pergi ke Settings InsightIQ dan klik *Hubungkan Telegram*, lalu kirim kode yang diberikan ke sini.",
    { parse_mode: "Markdown" }
  );
});

// Handler error polling
bot.on("polling_error", (err) => {
  console.error("[BOT] Polling error:", err.message);
});

// Graceful shutdown saat Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Bot dihentikan.");
  bot.stopPolling();
  process.exit(0);
});
```

---

### 9. `client/scripts/cron-scheduler.ts` — Scheduler Lokal

Script ini berjalan terus dan **memicu endpoint notifikasi setiap menit**.

```ts
import cron from "node-cron";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) { console.error("❌ CRON_SECRET tidak ditemukan"); process.exit(1); }

console.log("⏰ InsightIQ Cron Scheduler mulai berjalan...");
console.log(`   Target: ${APP_URL}/api/cron/daily-notifications`);
console.log("   Jadwal: setiap menit\n");

// Jadwal cron: "* * * * *" = setiap menit
// Format: detik  menit  jam  hari  bulan  hari-minggu
cron.schedule("* * * * *", async () => {
  const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  try {
    const res = await fetch(`${APP_URL}/api/cron/daily-notifications`, {
      headers: { "x-cron-secret": CRON_SECRET! },
    });
    const data = await res.json();

    // Hanya log jika ada yang dikirim (agar terminal tidak spam)
    if (data.sent > 0 || data.errors?.length) {
      console.log(`[CRON] ${timestamp} — Terkirim: ${data.sent}, Skip: ${data.skipped}`);
      if (data.errors?.length) {
        console.error("[CRON] Errors:", data.errors);
      }
    }
  } catch (err: any) {
    console.error(`[CRON] ${timestamp} — Error:`, err.message);
  }
});

process.on("SIGINT", () => {
  console.log("\n🛑 Cron scheduler dihentikan.");
  process.exit(0);
});
```

---

### 10. `client/vercel.json` — Konfigurasi Production

Saat aplikasi di-deploy ke Vercel, file ini menggantikan `npm run cron`.

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-notifications",
      "schedule": "0 * * * *"
    }
  ]
}
```

`"0 * * * *"` = jalankan di menit ke-0 setiap jam (setiap jam tepat).
Vercel otomatis menambahkan header `Authorization` yang perlu disesuaikan saat production.

---

## 🖥️ FRONTEND — Penjelasan UI Settings

Tambahan section di `client/app/(app)/settings/page.tsx`:

### State yang Ditambahkan

```ts
// Status koneksi & pengaturan (di-load dari API saat halaman dibuka)
const [tgConnected, setTgConnected] = useState(false);
const [tgNotifEnabled, setTgNotifEnabled] = useState(false);
const [tgNotifHour, setTgNotifHour] = useState(5);          // default jam 5 pagi

// State untuk flow verifikasi
const [tgVerifyCode, setTgVerifyCode] = useState<string | null>(null);
const [tgBotUsername, setTgBotUsername] = useState("InsightIQ_Bot");
const [tgCodeCopied, setTgCodeCopied] = useState(false);    // animasi tombol copy

// Loading states
const [tgLoading, setTgLoading] = useState(false);
const [tgCheckLoading, setTgCheckLoading] = useState(false);
const [tgTestLoading, setTgTestLoading] = useState(false);
const [tgDisconnectLoading, setTgDisconnectLoading] = useState(false);

// Feedback pesan sukses/error
const [tgFeedback, setTgFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
```

### Fungsi Handler

```ts
// Klik "Hubungkan Telegram" → minta kode dari backend
async function handleGenerateTgCode() {
  const res = await fetch("/api/telegram/generate-code", { method: "POST" });
  const data = await res.json();
  setTgVerifyCode(data.code);        // tampilkan kode di UI
  setTgBotUsername(data.botUsername);
}

// Klik "Cek Status" → cek apakah user sudah kirim kode ke bot
async function handleCheckTgStatus() {
  const res = await fetch("/api/telegram/status");
  const data = await res.json();
  setTgConnected(data.connected);
  if (data.connected) {
    setTgVerifyCode(null);           // sembunyikan panel kode
  }
}

// Toggle ON/OFF notifikasi
async function handleTgNotifToggle(enabled: boolean) {
  setTgNotifEnabled(enabled);
  await fetch("/api/telegram/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationEnabled: enabled }),
  });
}

// Ganti jam notifikasi
async function handleTgHourChange(hour: number) {
  setTgNotifHour(hour);
  await fetch("/api/telegram/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationHour: hour }),
  });
}

// Kirim pesan tes
async function handleTgTest() {
  await fetch("/api/telegram/test", { method: "POST" });
}

// Putus koneksi
async function handleTgDisconnect() {
  await fetch("/api/telegram/disconnect", { method: "DELETE" });
  setTgConnected(false);
  setTgNotifEnabled(false);
}

// Copy kode ke clipboard
function handleCopyCode() {
  navigator.clipboard.writeText(`/start ${tgVerifyCode}`);
  setTgCodeCopied(true);
  setTimeout(() => setTgCodeCopied(false), 2000); // reset setelah 2 detik
}
```

### Tampilan UI (2 State)

**State A — Belum terhubung:**
- Tombol "Hubungkan Telegram"
- Setelah klik → muncul panel kode + instruksi
- Tombol "Cek Status" dan "Minta Kode Baru"

**State B — Sudah terhubung:**
- Badge hijau ✅ "Telegram terhubung"
- Toggle aktifkan/nonaktifkan notifikasi
- Dropdown pilih jam (00:00 - 23:00 WIB)
- Tombol "Kirim Pesan Tes"
- Tombol merah "Putuskan"

---

## 📨 Contoh Output Pesan Telegram

### Pesan saat berhasil connect:
```
✅ Berhasil, Bima!

Akun InsightIQ kamu (Zenka) sudah terhubung ke Telegram.

Kamu akan mendapat rekomendasi produk harian setiap hari
sesuai jadwal yang kamu set di Settings. 🎉

Selamat jualan! 🚀
```

### Pesan tes:
```
✅ Halo, Zenka!

Koneksi Telegram InsightIQ kamu berjalan dengan baik.

Kamu akan menerima rekomendasi produk harian sesuai jadwal
yang kamu pilih. Semangat! 🚀
```

### Pesan notifikasi harian (otomatis sesuai jam pilihan):
```
🌅 Selamat pagi, Bima!
📅 Selasa, 27 Mei 2026

📊 Rekomendasi Produk Hari Ini
Niche kamu: gadget review budget mahasiswa

🔥 Top 3 Produk untuk Kamu:

1️⃣ Aksesoris Smartphone — Match: 92%
💰 Rp 25.000 - Rp 150.000
Audience-mu sangat aktif di konten unboxing gadget murah...

2️⃣ Earphone & Headset — Match: 87%
💰 Rp 50.000 - Rp 200.000
Engagement tinggi di konten review audio budget...

3️⃣ Power Bank & Charger — Match: 81%
💰 Rp 75.000 - Rp 250.000
Konten tutorial charging hack-mu konsisten mendapat saves...

📱 Lihat analisis lengkap → http://localhost:3000/recommendations

Semangat jualan hari ini! 💪
```

---

## 🚀 Cara Setup & Menjalankan

### Step 1 — Buat Bot di Telegram
1. Buka Telegram → cari `@BotFather` → kirim `/newbot`
2. Masukkan nama dan username bot (harus diakhiri `bot`)
3. Copy token yang diberikan

### Step 2 — Isi `.env`
```env
TELEGRAM_BOT_TOKEN=token_dari_botfather
TELEGRAM_BOT_USERNAME=NamaBotKamu
CRON_SECRET=hasil_generate_dari_perintah_di_bawah
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Generate CRON_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3 — Jalankan 3 Terminal
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run bot

# Terminal 3
npm run cron
```

### Step 4 — Hubungkan di Settings
1. Buka `http://localhost:3000/settings`
2. Section "Notifikasi Telegram" → klik "Hubungkan Telegram"
3. Kirim `/start KODE8KARAKTER` ke bot di Telegram
4. Klik "Cek Status" → badge hijau muncul
5. Aktifkan notifikasi → pilih jam → selesai

---

## ⚠️ Hal Penting

| Kondisi | Keterangan |
|---------|-----------|
| Kode expired | Kode berlaku 15 menit. Klik "Minta Kode Baru" jika lewat |
| Notifikasi tidak terkirim | Pastikan `npm run bot` dan `npm run cron` aktif |
| User belum punya analisis | Notifikasi tidak dikirim jika belum pernah analisis TikTok |
| Double send | Sistem otomatis cegah pengiriman lebih dari 1x per hari |
| Semua jam dalam WIB | Sistem konversi UTC → WIB (UTC+7) secara otomatis |
| Production | `npm run cron` digantikan Vercel Cron otomatis via `vercel.json` |

---

*Dokumentasi ini dibuat untuk tim InsightIQ — 27 Mei 2026*
