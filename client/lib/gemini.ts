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
          .length(3)
          .describe(
            "Tepat 3 keyword pencarian Tiktok Shop yang pendek dan natural (maks 4 kata per keyword), " +
              "seperti yang diketik orang saat belanja online. " +
              "Contoh bagus: 'sarung jempol gaming', 'kopi susu kemasan', 'earphone gaming murah'. " +
              "Contoh buruk: 'Sarung Jempol / Finger Sleeve Gaming untuk Mobile Legends', " +
              "'Gantungan Kunci Akrilik Karakter HoK'.",
          ),
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

const reportSchema = z.object({
  polaKonten: z
    .string()
    .describe(
      "2-3 kalimat analisis pola konten: hari terbaik, hashtag dominan, dan apa yang membuat konten ini konsisten",
    ),
  profilAudience: z
    .string()
    .describe(
      "2-3 kalimat tentang siapa audience-nya, engagement rate dalam konteks, dan apa artinya untuk strategi konten",
    ),
  sinyalEngagement: z
    .string()
    .describe(
      "2-3 kalimat interpretasi breakdown engagement (likes vs saves vs comments) dan apa sinyal perilaku yang bisa dibaca dari sana",
    ),
  peluangBelumDioptimalkan: z
    .string()
    .describe(
      "2-3 kalimat tentang niche atau area yang belum dimanfaatkan, kenapa relevan, dan bagaimana potensinya",
    ),
});

export type AnalysisReport = z.infer<typeof reportSchema>;

export async function generateAnalysisReport(
  account: Account,
  analysis: AnalysisOutput,
): Promise<AnalysisReport> {
  const engagementRate =
    account.avgViews > 0
      ? (
          ((account.avgLikes + account.avgComments + account.avgShares) /
            account.avgViews) *
          100
        ).toFixed(2)
      : "0";

  const total =
    (account.engagementBreakdown?.likes ?? 0) +
    (account.engagementBreakdown?.comments ?? 0) +
    (account.engagementBreakdown?.shares ?? 0) +
    (account.engagementBreakdown?.saves ?? 0);

  const engagementBreakdownText =
    total > 0
      ? `Likes: ${(((account.engagementBreakdown?.likes ?? 0) / total) * 100).toFixed(1)}%, Comments: ${(((account.engagementBreakdown?.comments ?? 0) / total) * 100).toFixed(1)}%, Shares: ${(((account.engagementBreakdown?.shares ?? 0) / total) * 100).toFixed(1)}%, Saves: ${(((account.engagementBreakdown?.saves ?? 0) / total) * 100).toFixed(1)}%`
      : "Tidak tersedia";

  const bestDay =
    account.postingDays?.length > 0
      ? account.postingDays.reduce((best: any, d: any) =>
          d.avgViews > best.avgViews ? d : best,
        )
      : null;

  const nicheBreakdownText = analysis.nicheBreakdown
    .map((n) => `${n.niche} (${n.score}/100)`)
    .join(", ");

  const prompt = `
Kamu adalah analis konten TikTok profesional Indonesia. Tugas kamu adalah menulis laporan analisis akun yang insightful, spesifik, dan berbasis data — bukan generik.

# Data Akun
- Username: @${account.tiktokUsername}
- Followers: ${account.followers.toLocaleString("id-ID")}
- Total Video: ${account.totalVideos}
- Engagement Rate: ${engagementRate}%
- Avg Views: ${account.avgViews.toLocaleString("id-ID")}
- Avg Likes: ${account.avgLikes.toLocaleString("id-ID")}
- Avg Comments: ${account.avgComments.toLocaleString("id-ID")}
- Avg Shares: ${account.avgShares.toLocaleString("id-ID")}
- Avg Saves: ${account.avgSaves?.toLocaleString("id-ID") ?? "0"}
- Hashtag dominan: ${account.hashtags
    .slice(0, 5)
    .map((h: string) => `#${h}`)
    .join(", ")}
- Hari terbaik posting: ${bestDay ? `${bestDay.day} (avg ${bestDay.avgViews.toLocaleString("id-ID")} views)` : "—"}
- Engagement breakdown: ${engagementBreakdownText}

# Hasil AI Analysis
- Primary Niche: ${analysis.primaryNiche}
- Secondary Niche: ${analysis.secondaryNiche}
- Confidence: ${analysis.confidenceScore}%
- Audience: ${analysis.audienceProfile.ageRange}, daya beli ${analysis.audienceProfile.purchasePower}
- Niche breakdown: ${nicheBreakdownText}

# Instruksi
Tulis laporan analisis dengan 4 bagian berikut. Setiap bagian harus:
- Spesifik ke data akun ini, bukan generik
- Berbahasa Indonesia yang natural dan profesional
- Memberikan insight yang tidak langsung terlihat dari angka mentah
- 2-3 kalimat per bagian

Jangan gunakan bullet point. Tulis dalam bentuk paragraf mengalir.
`.trim();

  const { object } = await generateObject({
    model: MODEL,
    schema: reportSchema,
    prompt,
    temperature: 0.7,
  });

  return object;
}
