"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingBag,
  Search,
  Loader2,
  ExternalLink,
  Sparkles,
  Star,
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

// ─── Tokopedia product card ───────────────────────────────────────────────────

function ProductCard({ p }: { p: TokopediaProduct }) {
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
          />
        </div>
      )}

      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/60">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
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
        <p className="mt-auto pt-1.5 font-mono text-[12px] font-semibold">
          {p.price ?? "—"}
        </p>
        <div className="flex items-center justify-between">
          {p.rating && (
            <span className="flex items-center gap-0.5 text-[11px] text-amber-500">
              <Star size={10} className="fill-current" /> {p.rating}
            </span>
          )}
          <ExternalLink
            size={12}
            className="ml-auto text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </a>
  );
}

// ─── Recommendation card ──────────────────────────────────────────────────────

function RecommendationCard({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
  const [products, setProducts] = useState<TokopediaProduct[]>([]);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "done">(
    "idle",
  );
  const isTop = index === 0;

  async function handleSearch() {
    if (searchState === "done") {
      setSearchState("idle");
      setProducts([]);
      return;
    }

    setSearchState("loading");
    try {
      const keywords =
        rec.examples.length > 0 ? rec.examples.slice(0, 3) : [rec.category];

      const results = await Promise.all(
        keywords.map((kw) =>
          fetch("/api/tokopedia-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: kw }),
          })
            .then((r) => r.json())
            .then((d) => (d.products ?? []) as TokopediaProduct[])
            .catch(() => [] as TokopediaProduct[]),
        ),
      );

      const seen = new Set<string>();
      const merged: TokopediaProduct[] = [];
      for (const batch of results) {
        for (const p of batch) {
          const key = p.url ?? p.name;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(p);
          }
        }
      }
      setProducts(merged.slice(0, 6));
      setSearchState("done");
    } catch {
      setProducts([]);
      setSearchState("idle");
    }
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-card p-6 ${
        isTop ? "border-teal-500/40" : "border-border"
      }`}
    >
      {/* Top match badge */}
      {isTop && (
        <div className="mb-3 flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Sparkles size={11} /> Top match
          </span>
        </div>
      )}

      {/* 3-column grid: badge | content | score+button */}
      <div
        className="grid items-start gap-5"
        style={{ gridTemplateColumns: "52px 1fr 200px" }}
      >
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

        {/* Score + button */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
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

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${rec.matchScore}%` }}
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={searchState === "loading"}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            {searchState === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            {searchState === "done"
              ? "Tutup"
              : searchState === "loading"
                ? "Mencari..."
                : "Cari di Tokopedia"}
          </button>
        </div>
      </div>

      {/* Tokopedia results — full width below */}
      {searchState === "done" && products.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-teal-700 dark:text-teal-400">
            // HASIL TOKOPEDIA
          </p>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
            {products.map((p, i) => (
              <ProductCard key={i} p={p} />
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

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.category} rec={rec} index={i} />
        ))}
      </div>
    </div>
  );
}
