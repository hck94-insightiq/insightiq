import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = "shahidirfan~tokopedia-search-scraper";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_TOKEN belum dikonfigurasi." },
      { status: 500 },
    );
  }

  const { query, category } = await req.json();

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json(
      { error: "Query tidak boleh kosong." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const cacheKey = category ?? query.trim();

  // Cek cache MongoDB
  const cached = await db.collection("tokopedia_cache").findOne({
    userId,
    category: cacheKey,
    fetchedAt: { $gt: new Date(Date.now() - CACHE_TTL_MS) },
  });

  if (cached) {
    return NextResponse.json({ products: cached.products, cached: true });
  }

  // Cache miss — hit Apify
  const rawQuery = query.trim();
  const words = rawQuery.split(/\s+/);
  const simplifiedQuery =
    words.length > 4 ? words.slice(0, 4).join(" ") : rawQuery;

  let apifyRes: Response;
  try {
    apifyRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: simplifiedQuery,
          results_wanted: 9,
          max_pages: 1,
          proxyConfiguration: { useApifyProxy: false },
        }),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Gagal menghubungi Apify." },
      { status: 502 },
    );
  }

  if (!apifyRes.ok) {
    return NextResponse.json(
      { error: "Apify gagal menjalankan scraper." },
      { status: 502 },
    );
  }

  const raw = await apifyRes.json();

  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada hasil yang ditemukan." },
      { status: 404 },
    );
  }

  const products = raw.map((item: any) => ({
    name: item.title,
    price: item.price,
    rating: item.rating,
    url: item.product_url,
    image: item.image_url,
    productId: item.product_id,
    shopName: item.shop_name,
    shopUrl: item.shop_url,
    priceNumber: item.price_number,
  }));

  // Simpan ke cache (upsert)
  await db
    .collection("tokopedia_cache")
    .updateOne(
      { userId, category: cacheKey },
      { $set: { userId, category: cacheKey, products, fetchedAt: new Date() } },
      { upsert: true },
    );

  return NextResponse.json({ products, cached: false });
}
