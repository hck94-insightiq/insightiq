"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

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
}

export function WishlistButton({ product }: Props) {
  const [wished, setWished] = useState(false);
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
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });
        setWished(true);
      }
    } catch {
      // silent fail
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
      className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
    >
      <Heart
        size={14}
        className={
          wished
            ? "fill-rose-500 text-rose-500"
            : "text-gray-400 hover:text-rose-400"
        }
      />
    </button>
  );
}
