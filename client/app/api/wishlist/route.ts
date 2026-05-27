import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const items = await db
      .collection("wishlist")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      productId,
      title,
      price,
      priceNumber,
      imageUrl,
      productUrl,
      shopName,
      shopUrl,
    } = body;

    if (!productId || !title) {
      return NextResponse.json(
        { error: "Data product tidak lengkap" },
        { status: 400 },
      );
    }

    const db = await getDb();

    const existing = await db.collection("wishlist").findOne({
      userId: new ObjectId(session.user.id),
      productId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Product sudah ada di wishlist" },
        { status: 409 },
      );
    }

    const result = await db.collection("wishlist").insertOne({
      userId: new ObjectId(session.user.id),
      productId,
      title,
      price,
      priceNumber,
      imageUrl,
      productUrl,
      shopName,
      shopUrl,
      createdAt: new Date(),
    });

    return NextResponse.json({success: true, id: result.insertedId}, {status: 201})
  } catch (error) {
    return NextResponse.json({error: "Internal Server Error"}, {status: 500})
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "productId diperlukan" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("wishlist").deleteOne({
      userId: new ObjectId(session.user.id),
      productId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}