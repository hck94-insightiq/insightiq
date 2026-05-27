"use client";

import { useState } from "react";
import { Heart, ExternalLink, Trash2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EmptyState from "@/components/shared/EmptyState";
import type { WishlistItem } from "@/types";

interface Props {
  items: WishlistItem[];
}

export function WishlistCard({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();

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

  const handleAIConsult = (item: WishlistItem) => {
    const prompt =
      `Tolong buatkan tutorial dan langkah-langkah lengkap untuk membuat konten video TikTok yang menarik untuk mempromosikan produk berikut:\n\n` +
      `Nama Produk: ${item.title}\n` +
      `Harga: ${item.price}\n` +
      `Toko: ${item.shopName}\n\n` +
      `Sertakan:\n` +
      `1. Konsep dan angle video yang tepat untuk produk ini\n` +
      `2. Hook pembuka yang menarik perhatian dalam 3 detik pertama\n` +
      `3. Struktur konten (opening, demonstrasi produk, CTA)\n` +
      `4. Tips editing dan musik yang cocok\n` +
      `5. Caption dan hashtag yang relevan\n` +
      `6. Waktu posting terbaik\n\n` +
      `Tujuannya agar audiens tertarik dan mau membeli produk ini melalui link affiliate saya.`;

    const encoded = encodeURIComponent(prompt);
    router.push(`/chat?prompt=${encoded}`);
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
        >
          {/* Image */}
          <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="aspect-square w-full rounded-xl bg-muted/40 object-cover"
            />
          </a>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-xs font-medium text-foreground/80 transition-colors hover:text-teal-600 dark:hover:text-teal-400"
            >
              {item.title}
            </a>
            <p className="font-mono text-sm font-semibold">{item.price}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {item.shopName}
            </p>
          </div>

          {/* AI Consult Button */}
          <button
            type="button"
            onClick={() => handleAIConsult(item)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-xs font-medium text-teal-600 transition-all hover:border-teal-500/40 hover:bg-teal-500/20 dark:text-teal-400"
          >
            <Sparkles size={12} />
            Buat Konten Video dengan AI
          </button>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-teal-600 transition-colors hover:underline dark:text-teal-400"
            >
              <ExternalLink size={11} />
              Cek di Tiktok Shop
            </a>
            <button
              type="button"
              onClick={() => handleRemove(item.productId)}
              className="rounded-full p-1 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-rose-500"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
