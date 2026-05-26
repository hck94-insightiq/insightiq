"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Loader2,
  ExternalLink,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import { WishlistButton } from "@/components/shared/WishlistButton";

interface Recommendation {
  category: string;
  priceRange: string;
  matchScore: number;
  reason: string;
  examples: string[];
}

interface TokopediaProduct {
  name: string;
  price: string | null;
  priceNumber: number | null;
  rating: number | null;
  url: string | null;
  image: string | null;
  productId: string | null;
  shopName: string | null;
  shopUrl: string | null;
}

function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
      : score >= 60
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40";

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}% match
    </span>
  );
}

function TokopediaResults({
  products,
  loading,
}: {
  products: TokopediaProduct[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/30 pt-3">
        <Loader2 size={14} className="animate-spin" />
        Mencari produk di Tokopedia...
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-white/30 uppercase">
        // HASIL TOKOPEDIA
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {products.map((p, i) => (
          <a
            key={i}
            href={p.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 p-3 rounded-lg border border-gray-100 dark:border-white/5 hover:border-teal-300 dark:hover:border-teal-500/30 transition-colors bg-gray-50 dark:bg-white/5 group relative"
          >
            {p.productId && (
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton
                  product={{
                    productId: p.productId,
                    title: p.name,
                    price: p.price ?? "",
                    priceNumber: p.priceNumber ?? 0,
                    imageUrl: p.image ?? "",
                    productUrl: p.url ?? "",
                    shopName: p.shopName ?? "",
                    shopUrl: p.shopUrl ?? "",
                  }}
                />
              </div>
            )}

            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-24 object-contain rounded-md bg-white"
              />
            )}
            <p className="text-xs font-medium text-gray-800 dark:text-white/80 line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {p.name}
            </p>
            <div className="flex items-center justify-between mt-auto">
              {p.price && (
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {p.price}
                </p>
              )}
              <div className="flex items-center gap-1">
                {p.rating && (
                  <>
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-gray-400">
                      {p.rating}
                    </span>
                  </>
                )}
                <ExternalLink
                  size={10}
                  className="text-gray-300 dark:text-white/20 ml-1"
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [products, setProducts] = useState<TokopediaProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setSearchLoading(true);
    setSearched(true);
    try {
      const query = rec.examples.length > 0 ? rec.examples[0] : rec.category;

      const res = await fetch("/api/tokopedia-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white capitalize">
            {rec.category}
          </h3>
          <p className="text-xs text-gray-400 dark:text-white/30">
            {rec.priceRange}
          </p>
        </div>
        <MatchScoreBadge score={rec.matchScore} />
      </div>

      <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
        {rec.reason}
      </p>

      {rec.examples.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rec.examples.map((ex) => (
            <span
              key={ex}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50"
            >
              {ex}
            </span>
          ))}
        </div>
      )}

      {!searched ? (
        <Button
          onClick={handleSearch}
          variant="outline"
          className="h-8 px-4 text-xs font-semibold gap-2"
        >
          <Search size={13} />
          Cari di Tokopedia
        </Button>
      ) : (
        <TokopediaResults products={products} loading={searchLoading} />
      )}
    </div>
  );
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((data) => {
        setRecommendations(data.recommendations ?? []);
        setGeneratedAt(data.generatedAt ?? null);
        setMessage(data.message ?? null);
      })
      .catch(() => setMessage("Gagal memuat rekomendasi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-gray-400 dark:text-white/30">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Memuat rekomendasi...</span>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Belum Ada Rekomendasi"
          description={
            message ??
            "Jalankan AI analysis dulu untuk mendapat rekomendasi produk."
          }
          icon={<ShoppingBag size={48} />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-white/30 uppercase mb-0.5">
            // PRODUCT RECOMMENDATIONS
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Top kategori produk untuk akun kamu
          </h1>
        </div>
        {generatedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/30">
            <Sparkles size={12} />
            {new Date(generatedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={i} rec={rec} />
        ))}
      </div>
    </div>
  );
}
