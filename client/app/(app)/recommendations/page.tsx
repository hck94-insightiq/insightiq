"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingBag,
  Search,
  Loader2,
  Sparkles,
  Star,
  Users,
  AlertCircle,
} from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { WishlistButton } from "@/components/shared/WishlistButton";

interface Recommendation {
  category: string;
  priceRange: string;
  matchScore: number;
  reason: string;
  examples: string[];
}

interface ShopProduct {
  name: string;
  price: string | null;
  priceNumber: number | null;
  rating: number | null;
  url: string | null;
  image: string | null;
  productId: string | null;
  shopName: string | null;
  shopUrl: string | null;
  commission: string | null;
  influencersCount: string | null;
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({
  p,
  wishlistedIds,
  onWishlistChange,
}: {
  p: ShopProduct;
  wishlistedIds: Set<string>;
  onWishlistChange: (id: string, added: boolean) => void;
}) {
  return (
    <a
      href={p.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-muted/40 transition-colors hover:border-teal-500/40 hover:bg-teal-500/5"
    >
      {/* Wishlist button */}
      {p.productId && (
        <div className="absolute right-2 top-2 z-10">
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
            initialWished={p.productId ? wishlistedIds.has(p.productId) : false}
            onToggle={(isWished) =>
              p.productId && onWishlistChange(p.productId, isWished)
            }
          />
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/60">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag size={28} className="text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-[11px] font-medium leading-tight">
          {p.name}
        </p>

        <p className="mt-auto pt-1 font-mono text-[12px] font-semibold">
          {p.price ?? "—"}
        </p>

        {/* Rating */}
        {p.rating && (
          <span className="flex items-center gap-0.5 text-[11px] text-amber-500">
            <Star size={10} className="fill-current" /> {p.rating}
          </span>
        )}

        {/* Commission + influencers badges */}
        {(p.commission || p.influencersCount) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {p.commission && (
              <span className="relative group/commission inline-flex items-center rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-400 cursor-default">
                {p.commission} komisi
                <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-max max-w-[160px] rounded-md bg-popover border border-border px-2 py-1 text-[10px] text-popover-foreground shadow-md opacity-0 group-hover/commission:opacity-100 transition-opacity text-center leading-snug z-50">
                  Seller membuka program afiliasi dengan komisi {p.commission}
                </span>
              </span>
            )}
            {p.influencersCount && p.influencersCount !== "0" && (
              <span
                className={`relative group/influencer inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground cursor-default`}
              >
                <Users size={9} />
                {p.influencersCount}
                <span
                  className={`pointer-events-none absolute bottom-full ${p.commission ? "left-1/2 -translate-x-1/2" : "left-0"} mb-1.5 w-max max-w-[160px] rounded-md bg-popover border border-border px-2 py-1 text-[10px] text-popover-foreground shadow-md opacity-0 group-hover/influencer:opacity-100 transition-opacity text-center leading-snug z-50`}
                >
                  {p.influencersCount} influencer telah mengiklankan produk ini
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Recommendation card ──────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  index,
  wishlistedIds,
  onWishlistChange,
}: {
  rec: Recommendation;
  index: number;
  wishlistedIds: Set<string>;
  onWishlistChange: (id: string, added: boolean) => void;
}) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "done">(
    "idle",
  );
  const isTop = index === 0;

  async function fetchProducts() {
    const keywords =
      rec.examples.length > 0 ? rec.examples.slice(0, 3) : [rec.category];

    const results = await Promise.all(
      keywords.map((kw) =>
        fetch("/api/tiktok-shop-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: kw, category: rec.category }),
        })
          .then((r) => r.json())
          .then((d) => (d.products ?? []) as ShopProduct[])
          .catch(() => [] as ShopProduct[]),
      ),
    );

    const seen = new Set<string>();
    const merged: ShopProduct[] = [];
    for (const batch of results) {
      for (const p of batch) {
        const key = p.productId ?? p.url ?? p.name;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(p);
        }
      }
    }

    return merged
      .filter((p) => !p.productId || !wishlistedIds.has(p.productId))
      .slice(0, 6);
  }

  async function handleSearch() {
    setSearchState("loading");
    try {
      setProducts(await fetchProducts());
      setSearchState("done");
    } catch {
      setProducts([]);
      setSearchState("idle");
    }
  }

  async function handleSearchAgain() {
    setSearchState("loading");
    try {
      setProducts(await fetchProducts());
      setSearchState("done");
    } catch {
      setSearchState("done");
    }
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-card p-6 ${
        isTop ? "border-teal-500/40" : "border-border"
      }`}
    >
      {isTop && (
        <div className="mb-3 flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Sparkles size={11} /> Top match
          </span>
        </div>
      )}

      {/* Responsive grid: 2-col on mobile, 3-col on sm+ */}
      <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[52px_1fr_200px] items-start gap-3 sm:gap-5">
        {/* Numbered badge */}
        <div
          className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl font-mono text-xl font-semibold ${
            isTop
              ? "bg-teal-500 text-white"
              : "bg-teal-500/10 text-teal-700 dark:text-teal-400"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Content */}
        <div className="min-w-0">
          <h3 className="mb-1 text-[17px] font-semibold leading-tight tracking-tight">
            {rec.category}
          </h3>
          {rec.priceRange && (
            <p className="mb-3 font-mono text-xs text-muted-foreground">
              {rec.priceRange}
            </p>
          )}
          {rec.reason && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {rec.reason}
            </p>
          )}
          {rec.examples.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {rec.examples.map((ex) => (
                <span
                  key={ex}
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {ex}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score + button — full width on mobile (col-span-2), right column on sm+ */}
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-3 sm:items-end">
          <div className="sm:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              MATCH SCORE
            </p>
            <p
              className={`font-mono text-4xl font-semibold leading-none tracking-tight ${
                isTop ? "text-teal-600 dark:text-teal-400" : ""
              }`}
            >
              {rec.matchScore}
              <span className="text-xl text-muted-foreground">%</span>
            </p>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${rec.matchScore}%` }}
            />
          </div>

          <button
            onClick={searchState === "done" ? handleSearchAgain : handleSearch}
            disabled={searchState === "loading"}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            {searchState === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            {searchState === "loading"
              ? "Mencari..."
              : searchState === "done"
                ? "Cari Lagi"
                : "Cari di TikTok Shop"}
          </button>
        </div>
      </div>

      {/* Results */}
      {searchState === "done" && products.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-teal-700 dark:text-teal-400">
            // HASIL TIKTOK SHOP
          </p>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
            {products.map((p, i) => (
              <ProductCard
                key={p.productId ?? i}
                p={p}
                wishlistedIds={wishlistedIds}
                onWishlistChange={onWishlistChange}
              />
            ))}
          </div>
        </div>
      )}

      {searchState === "done" && products.length === 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Tidak ada produk ditemukan untuk keyword ini.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  const firstName = session?.user?.name?.split(" ")[0] ?? "Kamu";

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

  useEffect(() => {
    fetch("/api/wishlist/ids")
      .then((r) => r.json())
      .then((data) => setWishlistedIds(new Set(data.ids ?? [])))
      .catch(() => {});
  }, []);

  function handleWishlistChange(id: string, added: boolean) {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      added ? next.add(id) : next.delete(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Memuat rekomendasi...</span>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Rekomendasi"
        description={
          message ??
          "Jalankan AI analysis dulu untuk mendapat rekomendasi produk."
        }
        icon={<ShoppingBag size={48} />}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Produk terbaik untuk kamu,{" "}
          <span className="text-teal-600 dark:text-teal-400">{firstName}</span>
        </h1>
        {generatedAt && (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {new Date(generatedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {recommendations.length} kategori produk
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Status afiliasi dan komisi produk dapat berubah sewaktu-waktu.
          Pastikan kamu mengecek ulang ketersediaan program afiliasi langsung di{" "}
          <span className="font-medium text-foreground">TikTok Shop</span>{" "}
          sebelum mulai promosi.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.category}
            rec={rec}
            index={i}
            wishlistedIds={wishlistedIds}
            onWishlistChange={handleWishlistChange}
          />
        ))}
      </div>
    </div>
  );
}
