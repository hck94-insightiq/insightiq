"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  variant?: "context" | "page";
  tiktokUsername: string;
}

function formatCountdown(d: Date): string {
  const diff = Math.max(0, d.getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return h > 0 ? `${h}j ${m}m` : `${m}m ${s}s`;
}

export function ReAnalyzeButton({ variant = "page", tiktokUsername }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [loading, setLoading] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function getLsKey(id: string) {
    return `iq_rl_reset_${id}`;
  }

  function applyRateLimit(resetAt: Date) {
    setRateLimitedUntil(resetAt);
    if (userId) localStorage.setItem(getLsKey(userId), resetAt.toISOString());
  }

  // On mount — cek localStorage, kalau stale fetch server
  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(getLsKey(userId));
    if (stored) {
      const d = new Date(stored);
      if (d > new Date()) {
        setRateLimitedUntil(d);
        return;
      }
      localStorage.removeItem(getLsKey(userId));
    }
    fetch("/api/analysis/rate-limit")
      .then((r) => r.json())
      .then((data) => {
        if (data.isLimited && data.resetAt)
          applyRateLimit(new Date(data.resetAt));
      })
      .catch(() => {});
  }, [userId]);

  // Countdown tick
  useEffect(() => {
    if (!rateLimitedUntil) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    function tick() {
      if (new Date(rateLimitedUntil!).getTime() - Date.now() <= 0) {
        setRateLimitedUntil(null);
        setCountdown("");
        if (userId) localStorage.removeItem(getLsKey(userId));
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setCountdown(formatCountdown(rateLimitedUntil!));
      }
    }
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rateLimitedUntil]);

  async function handleReanalyze() {
    // Pre-check rate limit sebelum mulai
    try {
      const rlRes = await fetch("/api/analysis/rate-limit");
      const rlData = await rlRes.json();
      if (rlData.isLimited && rlData.resetAt) {
        applyRateLimit(new Date(rlData.resetAt));
        toast.error("Batas re-analyze harian tercapai (3x/hari).");
        return;
      }
    } catch {
      /* lanjut, server handle 429 */
    }

    setLoading(true);
    try {
      const fetchRes = await fetch("/api/tiktok-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tiktokUsername }),
      });
      if (!fetchRes.ok) throw new Error("Gagal fetch data TikTok.");

      await fetch("/api/analysis", { method: "DELETE" });
      const analysisRes = await fetch("/api/analysis", { method: "POST" });

      if (analysisRes.status === 429) {
        const data = await analysisRes.json();
        applyRateLimit(new Date(data.resetAt));
        toast.error("Batas re-analyze harian tercapai (3x/hari).");
        return;
      }

      if (!analysisRes.ok) throw new Error("Gagal menjalankan AI analysis.");

      toast.success("Re-analyze selesai!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const isLimited = !!rateLimitedUntil;
  const isDisabled = loading || isLimited;

  if (variant === "context") {
    return (
      <button
        onClick={handleReanalyze}
        disabled={isDisabled}
        title={isLimited ? `Bisa digunakan lagi dalam ${countdown}` : undefined}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading
          ? "Fetching..."
          : isLimited
            ? `Re-analyze dalam ${countdown}`
            : "Re-analyze"}
      </button>
    );
  }

  return (
    <button
      onClick={handleReanalyze}
      disabled={isDisabled}
      title={isLimited ? `Bisa digunakan lagi dalam ${countdown}` : undefined}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
    >
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading
        ? "Re-analyzing..."
        : isLimited
          ? `Re-analyze dalam ${countdown}`
          : "Re-analyze"}
    </button>
  );
}
