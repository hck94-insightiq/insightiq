import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const db = await getDb();
    const userId = new ObjectId(session.user.id);

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Nama minimal 2 karakter." },
          { status: 400 },
        );
      }
      if (name.trim().length > 50) {
        return NextResponse.json(
          { error: "Nama maksimal 50 karakter." },
          { status: 400 },
        );
      }

      await db
        .collection("users")
        .updateOne({ _id: userId }, { $set: { name: name.trim() } });

      return NextResponse.json({ message: "Nama berhasil diperbarui." });
    }

    if (currentPassword !== undefined && newPassword !== undefined) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Semua field password wajib diisi." },
          { status: 400 },
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password baru minimal 6 karakter." },
          { status: 400 },
        );
      }

      const user = await db.collection("users").findOne({ _id: userId });
      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan." },
          { status: 404 },
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Password saat ini tidak sesuai." },
          { status: 400 },
        );
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await db
        .collection("users")
        .updateOne({ _id: userId }, { $set: { password: hashed } });

      return NextResponse.json({ message: "Password berhasil diubah." });
    }

    return NextResponse.json(
      { error: "Tidak ada data yang dikirim." },
      { status: 400 },
    );
  } catch (error) {
    console.error("[PATCH /api/user]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userId = new ObjectId(session.user.id);

    await db.collection("analyses").deleteMany({ userId });
    await db.collection("accounts").deleteMany({ userId });
    await db.collection("users").deleteOne({ _id: userId });

    return NextResponse.json({ message: "Akun berhasil dihapus." });
  } catch (error) {
    console.error("[DELETE /api/user]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
