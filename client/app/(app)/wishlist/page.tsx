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
        <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-white/30 uppercase mb-0.5">
          // WISHLIST
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Produk Tersimpan
        </h1>
      </div>

      <WishlistCard items={serializedItems} />
    </div>
  );
}