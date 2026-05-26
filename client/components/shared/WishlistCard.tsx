"use client";

import { useState } from "react";
import { Heart, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/shared/EmptyState";
import type { WishlistItem } from "@/types";

interface Props {
  items: WishlistItem[];
}

export function WishlistCard({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);

  const handleRemove = async (productId: string) => {
    try {
      await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      toast.success("Dihapus dari wishlist");
    } catch {
      toast.error("Gagal menghapus. Coba lagi.");
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Wishlist Kosong"
        description="Tambahkan produk dari halaman rekomendasi dengan menekan tombol love."
        ctaLabel="Lihat Rekomendasi"
        ctaHref="/recommendations"
        icon={<Heart size={48} />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col gap-3"
        >
          {/* Image */}
          <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-32 object-contain rounded-lg bg-gray-50 dark:bg-white/5"
            />
          </a>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-800 dark:text-white/80 line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {item.title}
            </a>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.price}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-white/30 truncate">
              {item.shopName}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              <ExternalLink size={11} />
              Beli di Tokopedia
            </a>
            <button
              type="button"
              onClick={() => handleRemove(item.productId)}
              className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}