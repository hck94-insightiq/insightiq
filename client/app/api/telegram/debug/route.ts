import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// Endpoint debug — cek kondisi user di database
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    {
      projection: {
        name: 1,
        telegramConnected: 1,
        telegramChatId: 1,
        notificationEnabled: 1,
        notificationHour: 1,
        lastNotificationSentAt: 1,
      },
    }
  );

  const nowUTC = new Date();
  const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
  const currentHourWIB = nowWIB.getUTCHours();

  const startOfDayWIB = new Date(nowWIB);
  startOfDayWIB.setUTCHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(startOfDayWIB.getTime() - 7 * 60 * 60 * 1000);

  const alreadySentToday =
    user?.lastNotificationSentAt &&
    new Date(user.lastNotificationSentAt) >= startOfDayUTC;

  return NextResponse.json({
    user: {
      name: user?.name,
      telegramConnected: user?.telegramConnected,
      telegramChatId: user?.telegramChatId ? "ada" : "tidak ada",
      notificationEnabled: user?.notificationEnabled,
      notificationHour: user?.notificationHour,
      notificationHourType: typeof user?.notificationHour,
      lastNotificationSentAt: user?.lastNotificationSentAt ?? null,
    },
    serverTime: {
      utc: nowUTC.toISOString(),
      wib: nowWIB.toUTCString(),
      currentHourWIB,
    },
    diagnosis: {
      hourMatch: user?.notificationHour === currentHourWIB,
      alreadySentToday,
      willSend:
        user?.telegramConnected &&
        user?.notificationEnabled &&
        user?.notificationHour === currentHourWIB &&
        !alreadySentToday,
    },
  });
}

// Reset lastNotificationSentAt agar bisa test ulang hari ini
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $unset: { lastNotificationSentAt: "" } }
  );

  return NextResponse.json({ success: true, message: "lastNotificationSentAt direset" });
}
