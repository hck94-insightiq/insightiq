import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = "shahidirfan~tokopedia-search-scraper";

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

  const { query } = await req.json();
  const rawQuery = query.trim();
  const words = rawQuery.split(/\s+/);
  const simplifiedQuery = words.length > 4 ? words.slice(0, 4).join(" ") : rawQuery;
  console.log("Received query:", query);
  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json(
      { error: "Query tidak boleh kosong." },
      { status: 400 },
    );
  }

  let apifyRes: Response;
  try {
    apifyRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: simplifiedQuery,
          results_wanted: 2,
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
    const errText = await apifyRes.text();
    console.log("Apify status:", apifyRes.status, errText);
    return NextResponse.json(
      { error: "Apify gagal menjalankan scraper." },
      { status: 502 },
    );
  }

  const raw = await apifyRes.json();
  console.log(raw);

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
  }));

  return NextResponse.json({ products });
}
