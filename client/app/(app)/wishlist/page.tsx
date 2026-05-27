import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import type { WishlistItem } from "@/types";
import { WishlistCard } from "@/components/shared/WishlistCard";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const db = await getDb();
  const items = await db
    .collection("wishlist")
    .find({ userId: new ObjectId(session.user.id) })
    .sort({ createdAt: -1 })
    .toArray();

  const serializedItems = JSON.parse(JSON.stringify(items)) as WishlistItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
          Mulai iklankan produk favoritmu!
        </h1>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {serializedItems.length} produk tersimpan
        </p>
      </div>

      <WishlistCard items={serializedItems} />
    </div>
  );
}
