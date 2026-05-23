import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { Account } from "@/types";

export const analysisSchema = z.object({
  primaryNiche: z
    .string()
    .describe(
      "Niche utama akun dalam Bahasa Indonesia, spesifik (bukan cuma 'lifestyle' tapi 'lifestyle minimalis mahasiswa')",
    ),
  secondaryNiche: z.string().describe("Niche pendukung yang terdeteksi"),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence AI terhadap deteksi niche, 0-100"),

  audienceProfile: z.object({
    gender: z
      .string()
      .describe("Deskripsi gender dominasi, e.g. 'female dominant (68%)'"),
    ageRange: z.string().describe("Range usia, e.g. '18-24 tahun'"),
    purchasePower: z
      .string()
      .describe("Estimasi daya beli, e.g. 'menengah bawah (Rp 50rb-200rb)'"),
    genderBreakdown: z
      .object({
        female: z.number().min(0).max(100),
        male: z.number().min(0).max(100),
        other: z.number().min(0).max(100),
      })
      .describe("Breakdown gender dalam persen, total harus 100"),
  }),

  nicheBreakdown: z
    .array(
      z.object({
        niche: z.string(),
        score: z.number().min(0).max(100),
      }),
    )
    .min(3)
    .max(7)
    .describe("Breakdown distribusi niche, urutkan dari score tertinggi"),

  postingTimeRecommendation: z
    .array(
      z.object({
        day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
        score: z.number().min(0).max(10),
      }),
    )
    .length(7)
    .describe("Score rekomendasi posting untuk 7 hari (Mon-Sun"),

  recommendations: z
    .array(
      z.object({
        category: z.string(),
        priceRange: z
          .string()
          .describe(
            "Rentang harga produk dalam Rupiah, e.g. 'Rp 45.000 - 150.000'",
          ),
        matchScore: z.number().min(0).max(100),
        reason: z
          .string()
          .describe("1-2 kalimat alasan spesifik kenapa kategori ini cocok"),
        examples: z
          .array(z.string())
          .min(2)
          .max(4)
          .describe("2-4 contoh produk spesifik dalam kategori"),
      }),
    )
    .min(4)
    .max(6)
    .describe("Rekomendasi kategori produk, urutkan dari matchScore tertinggi"),
});

export type AnalysisOutput = z.infer<typeofanalysisSchema>;

const MODEL = google("gemini-3.5-flash");

export async function analyzeAccount(
  account: Account,
): Promise<AnalysisOutput> {
  const prompt = buildAnalysisPrompt(account);

  const { object } = await generateObject({
    model: MODEL,
    schema: analysisSchema,
    prompt,
    temperature: 0.7,
  });

  return object;
}

function buildAnalysisPrompt(account: Account): string {
  return `
  Kamu adalah AI analyst untuk platform TikTok affiliate Indonesia. Tugasmu menganalisis data akun TikTok seorang kreator dan memberikan insight serta rekomendasi produk TikTok Shop yang relevan.

# Data Akun TikTok Kreator

- Username: @${account.tiktokUsername}
- Followers: ${account.followers.toLocaleString("id-ID")}
- Following: ${account.following.toLocaleString("id-ID")}
- Total Video: ${account.totalVideos}
- Rata-rata Views per Video: ${account.avgViews.toLocaleString("id-ID")}
- Rata-rata Likes per Video: ${account.avgLikes.toLocaleString("id-ID")}
- Rata-rata Comments per Video: ${account.avgComments.toLocaleString("id-ID")}
- Rata-rata Shares per Video: ${account.avgShares.toLocaleString("id-ID")}
- Niche yang dirasa user: ${account.primaryNiche}
- Hashtag favorit: ${account.hashtags.map((h) => `#${h}`).join(", ")}
- Deskripsi konten dari user: "${account.contentDescription}"
- Rentang harga produk yang nyaman dipromosikan: Rp ${account.priceRange.min.toLocaleString("id-ID")} – Rp ${account.priceRange.max.toLocaleString("id-ID")}

# Konteks Pasar

- Audience TikTok Indonesia mayoritas usia 18-34 tahun
- Produk TikTok Shop populer: skincare, fashion, gadget, makanan kemasan, aksesoris
- Daya beli rata-rata: Rp 50.000 - Rp 500.000 per pembelian
- Pertimbangkan budget yang user comfortable promosikan

# Yang Harus Kamu Analisis

1. **Primary & secondary niche** — spesifik, bukan generic. Contoh bagus: "lifestyle minimalis mahasiswa", "skincare remaja budget". Contoh tidak bagus: "lifestyle", "beauty"
2. **Nuance description** — 2-3 kalimat yang menjelaskan karakter unik akun ini
3. **Audience profile** — gender breakdown (total female+male+other = 100), age range, purchase power
4. **Niche breakdown** — 5-7 niche dengan score (0-100), urutkan dari tertinggi
5. **Posting time recommendation** — score 0-10 untuk masing-masing hari (Mon, Tue, Wed, Thu, Fri, Sat, Sun) berdasarkan kebiasaan audience niche tersebut
6. **Product recommendations** — 4-6 kategori produk TikTok Shop yang cocok, dengan match score, harga, alasan spesifik, dan 2-4 contoh produk

# Aturan Output

- Confidence score harus realistic (60-95), bukan selalu 90+
- Recommendations harus spesifik dan reasoned, bukan generic
- Bahasa: gunakan Bahasa Indonesia untuk semua field text
- Price ranges harus realistic untuk pasar Indonesia
- Gender breakdown harus berjumlah 100

Analisis akun ini sekarang.
    `.trim();
}
