# InsightIQ — TikTok Affiliate Intelligence Platform

> Platform berbasis AI untuk kreator TikTok yang ingin memaksimalkan potensi affiliate marketing mereka — analisis niche otomatis, rekomendasi produk personal, dan notifikasi harian via Telegram.

**Live:** [https://insightiq-94.vercel.app](https://insightiq-94.vercel.app)

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Struktur Proyek](#struktur-proyek)
- [Database Collections](#database-collections)
- [Environment Variables](#environment-variables)
- [Instalasi & Development](#instalasi--development)
- [Deployment (Vercel)](#deployment-vercel)
- [Telegram Bot Setup](#telegram-bot-setup)
- [API Routes](#api-routes)
- [Role & Akses](#role--akses)

---

## Tentang Proyek

InsightIQ adalah aplikasi web full-stack yang membantu kreator TikTok memahami niche konten mereka dan menemukan produk affiliate yang relevan. Pengguna cukup memasukkan username TikTok mereka, lalu sistem akan otomatis mengambil data akun via Apify, menganalisis niche dengan Gemini AI, dan memberikan rekomendasi produk dari TikTok Shop.

---

## Fitur Utama

### Untuk User

- **Onboarding** — input username TikTok, sistem fetch data otomatis via Apify
- **Dashboard** — ringkasan KPI akun (engagement rate, avg views, total video, followers)
- **AI Analysis** — deteksi niche, profil audiens, breakdown engagement, waktu posting terbaik, dan laporan AI lengkap dari Gemini
- **Re-analyze** — perbarui analisis dengan data TikTok terbaru (limit 3x/24 jam)
- **Recommendations** — rekomendasi kategori produk TikTok Shop berdasarkan niche, lengkap dengan badge komisi dan jumlah influencer
- **TikTok Shop Search** — cari produk langsung dari rekomendasi, hasil di-cache 24 jam per kategori
- **Wishlist** — simpan produk favorit dari TikTok Shop
- **AI Consultant** — chat dengan AI yang sudah tahu data akun TikTok kamu
- **Notifikasi Telegram** — terima rekomendasi produk harian otomatis setiap pukul 05.00 WIB
- **Settings** — ubah nama, re-analyze TikTok, ganti password, kelola Telegram, hapus akun

### Untuk Admin

- **Platform Overview** — statistik total user, wishlist, onboarded accounts, avg AI confidence
- **Grafik registrasi** user baru 30 hari terakhir
- **Niche Distribution** — kategori niche terpopuler di platform
- **Recent Activity** — 20 aktivitas analysis terbaru
- **Daftar User** — seluruh user beserta data TikTok dan role

---

## Tech Stack

| Layer         | Teknologi                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router)                                                      |
| Language      | TypeScript                                                                   |
| Styling       | Tailwind CSS v4 + shadcn/ui                                                  |
| Database      | MongoDB (via MongoDB Atlas)                                                  |
| Auth          | NextAuth.js v4                                                               |
| AI            | Google Gemini (via AI SDK)                                                   |
| Scraping      | Apify — `clockworks/tiktok-scraper`, `pratikdani/tiktok-shop-search-scraper` |
| Charts        | Recharts                                                                     |
| Notifications | Telegram Bot API                                                             |
| Deployment    | Vercel (Hobby)                                                               |

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                           │
│                                                         │
│   Next.js App (App Router)                              │
│   ├── (public)   → /login, /register                   │
│   ├── (onboarding) → /onboarding                       │
│   └── (app)      → /dashboard, /analysis, /chat, ...   │
│                                                         │
│   API Routes                                            │
│   ├── /api/tiktok-fetch    → Apify TikTok Scraper      │
│   ├── /api/analysis        → Gemini AI                  │
│   ├── /api/tiktok-shop-search → Apify TikTok Shop      │
│   ├── /api/telegram/*      → Telegram Bot API          │
│   └── /api/cron/*          → Daily notifications       │
│                                                         │
│   Vercel Cron (0 22 * * * = 05.00 WIB)                 │
│   └── /api/cron/daily-notifications                     │
└─────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
   MongoDB Atlas              Telegram Bot API
   (users, accounts,          (webhook → /api/telegram/webhook)
    analyses, wishlist,
    tiktokshop_cache)
```

---

## Struktur Proyek

```
insightiq/
├── client/                          # Next.js application
│   ├── app/
│   │   ├── (app)/                   # Protected routes (auth required)
│   │   │   ├── dashboard/           # Dashboard utama
│   │   │   ├── analysis/            # AI Analysis detail
│   │   │   ├── recommendations/     # Rekomendasi produk TikTok Shop
│   │   │   ├── wishlist/            # Produk tersimpan
│   │   │   ├── chat/                # AI Consultant
│   │   │   ├── settings/            # Pengaturan akun
│   │   │   └── admin/               # Admin panel (role: admin)
│   │   ├── (onboarding)/            # Flow onboarding user baru
│   │   ├── (public)/                # Login & Register
│   │   └── api/                     # API Routes
│   │       ├── analysis/            # Trigger & fetch AI analysis
│   │       │   └── rate-limit/      # Cek rate limit re-analyze
│   │       ├── tiktok-fetch/        # Fetch data TikTok via Apify
│   │       ├── tiktok-shop-search/  # Search produk TikTok Shop
│   │       ├── recommendations/     # Fetch rekomendasi dari analysis
│   │       ├── wishlist/            # CRUD wishlist
│   │       │   └── ids/             # Lightweight wishlist ID check
│   │       ├── ai-chat/             # AI Consultant chat
│   │       ├── telegram/            # Telegram bot endpoints
│   │       │   ├── webhook/         # Webhook handler (production)
│   │       │   ├── generate-code/   # Generate kode verifikasi
│   │       │   ├── verify-internal/ # Verifikasi kode dari bot
│   │       │   ├── status/          # Status & update notif settings
│   │       │   ├── test/            # Kirim pesan tes
│   │       │   ├── force-send/      # Force kirim notifikasi
│   │       │   └── disconnect/      # Putus koneksi Telegram
│   │       └── cron/
│   │           └── daily-notifications/ # Kirim notif harian
│   ├── components/
│   │   ├── charts/                  # Recharts components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   ├── shared/                  # Shared components
│   │   └── ui/                      # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth config
│   │   ├── gemini.ts                # Gemini AI schema & functions
│   │   ├── mongodb.ts               # MongoDB connection
│   │   ├── telegram.ts              # Telegram utilities
│   │   ├── validators.ts            # Zod schemas
│   │   └── utils.ts                 # Utility functions
│   ├── scripts/
│   │   ├── telegram-bot.ts          # Bot polling (development only)
│   │   ├── cron-scheduler.ts        # Cron local (development only)
│   │   └── seed.ts                  # Seed demo & admin user
│   ├── types/index.ts               # TypeScript interfaces
│   ├── proxy.ts                     # Next.js middleware (auth guard)
│   └── vercel.json                  # Vercel cron config
└── TELEGRAM_BOT_DOCS.md             # Dokumentasi lengkap Telegram bot
```

---

## Database Collections

| Collection         | Deskripsi                                                             |
| ------------------ | --------------------------------------------------------------------- |
| `users`            | Data user — auth, role, Telegram settings, rate limits                |
| `accounts`         | Data TikTok per user — followers, avg metrics, hashtags, posting days |
| `analyses`         | Hasil AI Gemini — niche, confidence, recommendations, report          |
| `wishlist`         | Produk TikTok Shop yang disimpan user                                 |
| `tiktokshop_cache` | Cache hasil search TikTok Shop per user per kategori (TTL 24 jam)     |

### Index yang perlu dibuat manual

```js
// tiktokshop_cache — unique per user + category
db.tiktokshop_cache.createIndex({ userId: 1, category: 1 }, { unique: true });
```

---

## Environment Variables

Buat file `.env` di dalam folder `client/` berdasarkan `env-example`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000          # Ganti ke URL production saat deploy
NEXTAUTH_SECRET=your_random_secret_here    # Generate: openssl rand -base64 32

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# Apify (TikTok Scraper + TikTok Shop)
APIFY_TOKEN=your_apify_token

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token          # Dari @BotFather
TELEGRAM_BOT_USERNAME=NamaBotKamu          # Username bot tanpa @
CRON_SECRET=your_random_secret             # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Ganti ke URL production saat deploy
```

---

## Instalasi & Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (atau MongoDB lokal)
- Akun Apify
- Google AI Studio API key (Gemini)
- Telegram Bot (opsional untuk notifikasi)

### Setup

```bash
# Clone repository
git clone https://github.com/hck94-insightiq/insightiq.git
cd insightiq/client

# Install dependencies
npm install

# Buat file .env dari template
cp env-example .env
# Isi semua value di .env

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Seed Database (opsional)

Untuk membuat akun demo dan admin awal:

```bash
npm run seed
```

Akan membuat:

- `demo@insightiq.com` / `demo123` (role: user)
- `admin@insightiq.com` / `admin123` (role: admin)

### Development dengan Telegram Bot (opsional)

Saat development, bot menggunakan mode **polling** (bukan webhook). Jalankan di terminal terpisah:

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Telegram bot (polling mode, hanya untuk lokal)
npm run bot

# Terminal 3 — Cron scheduler lokal (opsional)
npm run cron
```

> **Catatan:** `npm run bot` dan `npm run cron` hanya diperlukan saat development lokal. Di production (Vercel), bot menggunakan webhook dan cron dihandle oleh Vercel Cron.

---

## Deployment (Vercel)

### 1. Push ke GitHub

Pastikan semua perubahan sudah di-commit dan di-push ke branch `main`.

### 2. Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → **New Project**
2. Import repository `hck94-insightiq/insightiq`
3. Set **Root Directory** ke `client`
4. Isi semua **Environment Variables** (sama seperti `.env` lokal, tapi ganti URL ke production)
5. Deploy

### 3. Environment Variables di Vercel

Pastikan nilai berikut disesuaikan untuk production:

```
NEXTAUTH_URL=https://insightiq-94.vercel.app
NEXT_PUBLIC_APP_URL=https://insightiq-94.vercel.app
```

### 4. Vercel Cron

`vercel.json` sudah dikonfigurasi untuk menjalankan notifikasi harian:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-notifications",
      "schedule": "0 22 * * *"
    }
  ]
}
```

`0 22 * * *` = setiap hari jam 22:00 UTC = **05:00 WIB**. Notifikasi dikirim otomatis ke semua user yang telah mengaktifkan Telegram.

> **Catatan:** Vercel Hobby plan membatasi cron maksimal sekali sehari. Schedule di atas sudah sesuai dengan limitasi tersebut.

---

## Telegram Bot Setup

### Cara Kerja di Production

Di production, bot menggunakan **webhook** — Telegram mengirim pesan masuk langsung ke endpoint `/api/telegram/webhook`, tanpa perlu persistent process yang terus berjalan. Semua dihandle oleh Vercel serverless.

### 1. Buat Bot di Telegram

1. Buka Telegram → cari `@BotFather`
2. Kirim `/newbot`
3. Masukkan nama dan username bot (harus diakhiri `bot`)
4. Copy token yang diberikan → isi ke `TELEGRAM_BOT_TOKEN` di `.env`

### 2. Register Webhook (setelah deploy)

Setelah aplikasi berhasil di-deploy ke Vercel, register webhook sekali dengan membuka URL ini di browser:

```
https://insightiq-94.vercel.app/api/telegram/webhook?action=set
```

Response sukses:

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

### 3. Cek Status Webhook

```
https://insightiq-94.vercel.app/api/telegram/webhook
```

### 4. Menghubungkan Akun User ke Telegram

Alur dari sisi user:

```
1. Buka Settings → section "Notifikasi Telegram"
2. Klik "Hubungkan Telegram"
3. Sistem generate kode verifikasi 8 karakter (berlaku 15 menit)
4. Buka Telegram → cari @NamaBotKamu
5. Kirim: /start KODE8KARAKTER
6. Bot memverifikasi dan mengirim pesan konfirmasi
7. Kembali ke Settings → klik "Cek Status"
8. Badge hijau ✅ "Telegram terhubung" muncul
9. Toggle "Aktifkan Notifikasi Harian" → notifikasi akan dikirim setiap 05.00 WIB
```

### 5. Contoh Pesan Notifikasi Harian

```
🌅 Selamat pagi, Bima!
📅 Rabu, 28 Mei 2026

📊 Rekomendasi Produk Hari Ini
Niche kamu: K-pop fandom dan gaya hidup idol Korea

🔥 Top 3 Produk untuk Kamu:

1️⃣ Aksesoris Smartphone — Match: 92%
💰 Rp 25.000 - Rp 150.000
Audience-mu sangat aktif di konten unboxing gadget murah...

2️⃣ Photocard Holder — Match: 88%
💰 Rp 15.000 - Rp 65.000
Konten koleksi photocard-mu konsisten mendapat saves...

3️⃣ Album Foto Polaroid — Match: 83%
💰 Rp 30.000 - Rp 120.000
Hashtag #kpop dan #photocard dominan di akun kamu...

📱 Lihat analisis lengkap → https://insightiq-94.vercel.app/recommendations

Semangat jualan hari ini! 💪
```

---

## API Routes

| Method   | Endpoint                        | Deskripsi                               | Auth   |
| -------- | ------------------------------- | --------------------------------------- | ------ |
| POST     | `/api/auth/register`            | Register user baru                      | —      |
| GET      | `/api/account`                  | Fetch data TikTok user                  | ✅     |
| POST     | `/api/tiktok-fetch`             | Fetch & simpan data TikTok dari Apify   | ✅     |
| GET      | `/api/analysis`                 | Fetch analysis terbaru                  | ✅     |
| POST     | `/api/analysis`                 | Trigger AI analysis (rate limit 3x/24h) | ✅     |
| DELETE   | `/api/analysis`                 | Hapus cache analysis                    | ✅     |
| GET      | `/api/analysis/rate-limit`      | Cek status rate limit                   | ✅     |
| GET      | `/api/recommendations`          | Fetch rekomendasi produk                | ✅     |
| POST     | `/api/tiktok-shop-search`       | Search produk TikTok Shop (cached)      | ✅     |
| GET      | `/api/wishlist`                 | Fetch semua wishlist user               | ✅     |
| POST     | `/api/wishlist`                 | Tambah produk ke wishlist               | ✅     |
| DELETE   | `/api/wishlist`                 | Hapus produk dari wishlist              | ✅     |
| GET      | `/api/wishlist/ids`             | Fetch array productId wishlist          | ✅     |
| POST     | `/api/ai-chat`                  | Chat dengan AI Consultant               | ✅     |
| GET      | `/api/user`                     | Fetch profil user                       | ✅     |
| PATCH    | `/api/user`                     | Update nama / password                  | ✅     |
| DELETE   | `/api/user`                     | Hapus akun                              | ✅     |
| POST     | `/api/telegram/generate-code`   | Generate kode verifikasi Telegram       | ✅     |
| GET      | `/api/telegram/status`          | Cek status Telegram                     | ✅     |
| PATCH    | `/api/telegram/status`          | Update pengaturan notifikasi            | ✅     |
| POST     | `/api/telegram/verify-internal` | Verifikasi kode dari bot                | Secret |
| POST     | `/api/telegram/test`            | Kirim pesan tes ke Telegram             | ✅     |
| POST     | `/api/telegram/force-send`      | Force kirim notifikasi sekarang         | ✅     |
| DELETE   | `/api/telegram/disconnect`      | Putus koneksi Telegram                  | ✅     |
| POST/GET | `/api/telegram/webhook`         | Webhook handler Telegram                | Secret |
| GET      | `/api/cron/daily-notifications` | Trigger notifikasi harian               | Secret |

> **Secret** = dilindungi header `x-cron-secret` yang hanya diketahui sistem internal.

---

## Role & Akses

| Role    | Akses                                                                              |
| ------- | ---------------------------------------------------------------------------------- |
| `user`  | Semua halaman app (dashboard, analysis, recommendations, wishlist, chat, settings) |
| `admin` | Semua akses user + `/admin` (platform overview, daftar user)                       |

Admin pertama dibuat via `npm run seed` atau diset manual di MongoDB dengan mengubah field `role` menjadi `"admin"`.

---

## Dibuat oleh

Tim InsightIQ — Hacktiv8 Final Project 2026
