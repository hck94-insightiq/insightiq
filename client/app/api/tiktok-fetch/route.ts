import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = "clockworks~tiktok-scraper";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

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

  const { username: rawInput } = await req.json();
  if (!rawInput) {
    return NextResponse.json(
      { error: "Username tidak boleh kosong." },
      { status: 400 },
    );
  }

  const urlMatch = rawInput.match(/tiktok\.com\/@?([\w.]+)/i);
  const username = urlMatch ? urlMatch[1] : rawInput.replace(/^@/, "").trim();

  if (!username) {
    return NextResponse.json(
      { error: "Username tidak valid." },
      { status: 400 },
    );
  }

  let apifyRes: Response;

  try {
    apifyRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&memory=512`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profiles: [username],
          resultsPerPage: 20,
          profileScrapeSections: ["videos"],
          profileSorting: "latest",
        }),
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data dari Apify." },
      { status: 502 },
    );
  }

  if (!apifyRes.ok) {
    return NextResponse.json(
      { error: "Apify gagal menjalankan scraper." },
      { status: 502 },
    );
  }

  const videos = await apifyRes.json();

  if (!Array.isArray(videos) || videos.length === 0) {
    return NextResponse.json(
      { error: "Akun TikTok tidak ditemukan atau bersifat privat." },
      { status: 404 },
    );
  }

  const profile = videos[0].authorMeta;
  if (!profile) {
    return NextResponse.json(
      { error: "Data profil tidak tersedia." },
      { status: 422 },
    );
  }

  const avgViews = mean(videos.map((v: any) => v.playCount ?? 0));
  const avgLikes = mean(videos.map((v: any) => v.diggCount ?? 0));
  const avgComments = mean(videos.map((v: any) => v.commentCount ?? 0));
  const avgShares = mean(videos.map((v: any) => v.shareCount ?? 0));

  const hashtagSet = new Set<string>();
  for (const v of videos) {
    for (const tag of v.hashtags ?? []) {
      if (tag.name) {
        hashtagSet.add(tag.name.toLowerCase());
      }
    }
    const textTags = (v.text ?? "").match(/#(\w+)/g) ?? [];
    for (const t of textTags) {
      hashtagSet.add(t.slice(1).toLowerCase());
    }
  }
  const hashtags = [...hashtagSet].filter(Boolean).slice(0, 20);

  const dayMap: Record<string, number[]> = {};
  for (const d of DAYS) {
    dayMap[d] = [];
  }
  for (const v of videos) {
    if (!v.createTimeISO) continue;
    const dt = new Date(v.createTimeISO);
    const dayIndex = (dt.getUTCDay() + 6) % 7;
    dayMap[DAYS[dayIndex]].push(v.playCount ?? 0);
  }

  const postingDays = DAYS.map((day) => ({
    day,
    avgViews: mean(dayMap[day]),
    count: dayMap[day].length,
  }));

  const engagementBreakdown = {
    likes: videos.reduce((s: number, v: any) => s + (v.diggCount ?? 0), 0),
    comments: videos.reduce(
      (s: number, v: any) => s + (v.commentCount ?? 0),
      0,
    ),
    shares: videos.reduce((s: number, v: any) => s + (v.shareCount ?? 0), 0),
    saves: videos.reduce((s: number, v: any) => s + (v.collectCount ?? 0), 0),
  };

  const db = await getDb();
  const now = new Date();

  await db.collection("accounts").findOneAndUpdate(
    { userId: new ObjectId(session.user.id) },
    {
      $set: {
        userId: new ObjectId(session.user.id),
        tiktokUsername: profile.name,
        nickName: profile.nickName ?? profile.name,
        contentDescription: profile.signature ?? "",
        followers: profile.fans ?? 0,
        following: profile.following ?? 0,
        totalVideos: profile.video ?? 0,
        avgViews,
        avgLikes,
        avgComments,
        avgShares,
        hashtags,
        postingDays,
        engagementBreakdown,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  fetch(`${baseUrl}/api/analysis`, {
    method: "POST",
    headers: { cookie: req.headers.get("cookie") ?? "" },
  }).catch(() => {});

  return NextResponse.json({ success: true, username: profile.name });
}
