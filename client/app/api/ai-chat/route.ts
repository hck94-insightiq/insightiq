import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { google } from "@ai-sdk/google"
import { generateText } from "ai";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = (await req.json()) as { messages: ChatMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Messages array required" },
      { status: 400 },
    );
  }

  // Limit messages untuk hemat context window (last 20 messages)
  const limitedMessages = messages.slice(-20);

  // Fetch user context dari DB
  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const account = await db.collection("accounts").findOne({ userId });
  const analysis = await db
    .collection("analyses")
    .findOne({ userId }, { sort: { createdAt: -1 } });

  // Build system prompt dengan context user
  const systemPrompt = buildChatSystemPrompt(account, analysis);

  try {
    const { text } = await generateText({
      model: google("gemini-3.5-flash"),
      system: systemPrompt,
      messages: limitedMessages,
      temperature: 0.7,
    });

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "AI chat failed", details: error.message },
      { status: 500 },
    );
  }
}

function buildChatSystemPrompt(account: any, analysis: any): string {
  if (!account) {
    return `Kamu adalah AI affiliate consultant untuk platform TikTok Indonesia.
User belum mengisi data akun. Jawab pertanyaan umum dengan ramah, dan arahkan
mereka untuk melakukan onboarding di /onboarding supaya kamu bisa kasih advice
yang dipersonalisasi.`;
  }

  return `
Kamu adalah AI affiliate consultant yang expert dalam TikTok Shop dan affiliate
marketing di pasar Indonesia. Kamu sedang berbicara dengan kreator TikTok yang
butuh advice strategis.

# Data Akun User
- Username: @${account.tiktokUsername}
- Followers: ${account.followers.toLocaleString("id-ID")}
- Niche utama: ${account.primaryNiche}
- Hashtag favorit: ${account.hashtags.map((h: string) => "#" + h).join(", ")}
- Deskripsi konten: "${account.contentDescription}"
- Rentang harga produk nyaman: Rp ${account.priceRange.min.toLocaleString("id-ID")} - Rp ${account.priceRange.max.toLocaleString("id-ID")}
${
  analysis
    ? `
# Hasil Analisis AI Terbaru
- Primary niche: ${analysis.primaryNiche}
- Secondary niche: ${analysis.secondaryNiche}
- Nuance: ${analysis.nuanceDescription}
- Audience: ${analysis.audienceProfile.gender}, ${analysis.audienceProfile.ageRange}, ${analysis.audienceProfile.purchasePower}
- Top 3 rekomendasi produk: ${analysis.recommendations
        .slice(0, 3)
        .map((r: any) => `${r.category} (${r.matchScore}% match)`)
        .join(", ")}
`
    : "\n# Catatan: User belum menjalankan AI analysis. Sarankan mereka jalankan dulu untuk advice lebih akurat.\n"
}

# Aturan Jawaban
- Selalu gunakan Bahasa Indonesia yang natural dan friendly
- Reference data user dalam jawaban (e.g. "Untuk niche ${account.primaryNiche} kamu..." atau "Dengan ${account.followers.toLocaleString("id-ID")} followers...")
- Jawaban concise — maksimal 2-4 paragraf, langsung to the point
- Kalau pertanyaan ambigu, minta clarifikasi spesifik
- Kalau pertanyaan di luar topik TikTok affiliate (mis. coding, masakan), arahkan kembali ke topik utama dengan ramah
- Berikan saran yang actionable dan spesifik untuk pasar Indonesia
- JANGAN tampilkan data raw user kembali ke mereka (e.g. "kamu punya 24.500 followers") — itu mereka sudah tahu
  `.trim();
}