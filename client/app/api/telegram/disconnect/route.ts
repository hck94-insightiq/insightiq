import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    {
      $set: {
        telegramConnected: false,
        notificationEnabled: false,
      },
      $unset: {
        telegramChatId: "",
        telegramVerifyCode: "",
        telegramVerifyExpiry: "",
      },
    }
  );

  return NextResponse.json({ success: true });
}
