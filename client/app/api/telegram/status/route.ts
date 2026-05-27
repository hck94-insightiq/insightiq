import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

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
        telegramConnected: 1,
        notificationEnabled: 1,
        notificationHour: 1,
      },
    }
  );

  return NextResponse.json({
    connected: user?.telegramConnected ?? false,
    notificationEnabled: user?.notificationEnabled ?? false,
    notificationHour: user?.notificationHour ?? 5,
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.notificationEnabled === "boolean") {
    updates.notificationEnabled = body.notificationEnabled;
  }
  if (typeof body.notificationHour === "number" && body.notificationHour >= 0 && body.notificationHour <= 23) {
    updates.notificationHour = body.notificationHour;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: updates }
  );

  return NextResponse.json({ success: true });
}
