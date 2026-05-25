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

  nuanceDescription: z
    .string()
    .describe("2-3 kalimat karakter unik akun ini dalam Bahasa Indonesia"),

  audienceProfile: z.object({
    ageRange: z.string().describe("Range usia dominan, e.g. '18-24 tahun'"),
    purchasePower: z
      .string()
      .describe("Estimasi daya beli, e.g. 'menengah bawah (Rp 50rb-200rb)'"),
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

export type AnalysisOutput = z.infer<typeof analysisSchema>;

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
  const engagementRate =
    account.avgViews > 0
      ? (
          ((account.avgLikes + account.avgComments + account.avgShares) /
            account.avgViews) *
          100
        ).toFixed(2)
      : "0";

  return `
  Kamu adalah AI analyst untuk platform TikTok affiliate Indonesia. Tugasmu menganalisis data akun TikTok seorang kreator dan memberikan insight serta rekomendasi produk TikTok Shop yang relevan.

# Data Akun TikTok Kreator

- Username: @${account.tiktokUsername}
- Followers: ${account.followers.toLocaleString("id-ID")}
- Following: ${account.following.toLocaleString("id-ID")}
- Total Video: ${account.totalVideos}
- Engagement Rate (estimasi): ${engagementRate}%
- Rata-rata Views per Video: ${account.avgViews.toLocaleString("id-ID")}
- Rata-rata Likes per Video: ${account.avgLikes.toLocaleString("id-ID")}
- Rata-rata Comments per Video: ${account.avgComments.toLocaleString("id-ID")}
- Rata-rata Shares per Video: ${account.avgShares.toLocaleString("id-ID")}
- Hashtag yang sering dipakai: ${account.hashtags.map((h) => `#${h}`).join(", ")}
- Bio akun: "${account.contentDescription}"

# Konteks Pasar

- Audience TikTok Indonesia mayoritas usia 18-34 tahun
- Produk TikTok Shop populer: skincare, fashion, gadget, makanan kemasan, aksesoris
- Daya beli rata-rata: Rp 50.000 - Rp 500.000 per pembelian

# Yang Harus Kamu Analisis

1. **Primary & secondary niche** — spesifik, bukan generic. Contoh bagus: "gadget review budget mahasiswa", "skincare remaja oily skin". Contoh tidak bagus: "tech", "beauty"
2. **Nuance description** — 2-3 kalimat karakter unik akun ini
3. **Audience profile** — gender breakdown (total female+male+other = 100), age range, purchase power
4. **Niche breakdown** — 3-7 niche dengan score (0-100), urutkan dari tertinggi
5. **Product recommendations** — 4-6 kategori produk TikTok Shop yang cocok, dengan match score, harga realistis pasar Indonesia, alasan spesifik, dan 2-4 contoh produk konkret

# Aturan Output

- Confidence score harus realistic (60-95)
- Recommendations harus spesifik dan reasoned, bukan generic
- Semua field text dalam Bahasa Indonesia
- Price ranges realistic untuk pasar Indonesia

Analisis akun ini sekarang.
    `.trim();
}
