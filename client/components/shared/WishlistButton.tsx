"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface Props {
  product: {
    productId: string;
    title: string;
    price: string;
    priceNumber: number;
    imageUrl: string;
    productUrl: string;
    shopName: string;
    shopUrl: string;
  };
  initialWished?: boolean;
  onToggle?: (wished: boolean) => void;
}

export function WishlistButton({
  product,
  initialWished = false,
  onToggle,
}: Props) {
  const [wished, setWished] = useState(initialWished);
  const [loading, setLoading] = useState(false);

  async function toggleWishlist() {
    setLoading(true);
    try {
      if (wished) {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.productId }),
        });
        setWished(false);
        onToggle?.(false);
        toast.success("Dihapus dari wishlist.");
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });
        setWished(true);
        onToggle?.(true);
        toast.success(
          `${product.title.slice(0, 40)}${product.title.length > 40 ? "..." : ""} ditambahkan ke wishlist!`,
        );
      }
    } catch {
      toast.error("Gagal memperbarui wishlist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist();
      }}
      disabled={loading}
      className="rounded-full bg-card/80 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-card"
    >
      <Heart
        size={14}
        className={
          wished
            ? "fill-rose-500 text-rose-500"
            : "text-muted-foreground hover:text-rose-400"
        }
      />
    </button>
  );
}
