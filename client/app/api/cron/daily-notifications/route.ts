import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { sendMessage, formatDailyMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUTC = new Date();
  // WIB = UTC+7
  const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
  const currentHour = nowWIB.getUTCHours();

  // Tengah malam WIB untuk cek duplikat pengiriman hari ini
  const startOfDayWIB = new Date(nowWIB);
  startOfDayWIB.setUTCHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(startOfDayWIB.getTime() - 7 * 60 * 60 * 1000);

  const db = await getDb();

  const users = await db
    .collection("users")
    .find({
      telegramConnected: true,
      notificationEnabled: true,
    })
    .toArray();

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of users) {
    // Skip jika sudah dikirim hari ini
    if (
      user.lastNotificationSentAt &&
      new Date(user.lastNotificationSentAt) >= startOfDayUTC
    ) {
      skipped++;
      continue;
    }

    try {
      const analysis = await db
        .collection("analyses")
        .findOne({ userId: user._id }, { sort: { createdAt: -1 } });

      if (!analysis || !analysis.recommendations?.length) {
        skipped++;
        continue;
      }

      const account = await db
        .collection("accounts")
        .findOne({ userId: user._id });

      if (!account) {
        skipped++;
        continue;
      }

      const message = formatDailyMessage(
        user.name,
        analysis as any,
        account as any,
      );

      await sendMessage(user.telegramChatId, message);

      await db
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $set: { lastNotificationSentAt: nowUTC } },
        );

      sent++;
    } catch (err: any) {
      errors.push(`${user._id}: ${err.message}`);
    }
  }

  return NextResponse.json({
    hour: currentHour,
    sent,
    skipped,
    errors: errors.length ? errors : undefined,
  });
}
