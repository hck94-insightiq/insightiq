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

function formatCountdown(resetAt: Date): string {
  const diff = Math.max(0, new Date(resetAt).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m ${s}s`;
}

function getLsKey(userId: string) {
  return `iq_rl_reset_${userId}`;
}

export function ReAnalyzeButton({ variant = "page", tiktokUsername }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [loading, setLoading] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper: set rate limit + persist ke localStorage
  function applyRateLimit(resetAt: Date) {
    setRateLimitedUntil(resetAt);
    if (userId) {
      localStorage.setItem(getLsKey(userId), resetAt.toISOString());
    }
  }

  // Helper: clear rate limit + hapus dari localStorage
  function clearRateLimit() {
    setRateLimitedUntil(null);
    setCountdown("");
    if (userId) {
      localStorage.removeItem(getLsKey(userId));
    }
  }

  // On mount — cek localStorage kalau stale/kosong fetch server
  useEffect(() => {
    if (!userId) return;

    const stored = localStorage.getItem(getLsKey(userId));
    if (stored) {
      const storedDate = new Date(stored);
      if (storedDate > new Date()) {
        // Masih valid, pakai langsung
        setRateLimitedUntil(storedDate);
        return;
      } else {
        // Sudah expired, hapus
        localStorage.removeItem(getLsKey(userId));
      }
    }

    // Fetch dari server
    fetch("/api/analysis/rate-limit")
      .then((r) => r.json())
      .then((data) => {
        if (data.isLimited && data.resetAt) {
          applyRateLimit(new Date(data.resetAt));
        }
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
      const remaining = new Date(rateLimitedUntil!).getTime() - Date.now();
      if (remaining <= 0) {
        clearRateLimit();
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
    // Pre-check rate limit ke server sebelum mulai
    try {
      const rlRes = await fetch("/api/analysis/rate-limit");
      const rlData = await rlRes.json();
      if (rlData.isLimited && rlData.resetAt) {
        applyRateLimit(new Date(rlData.resetAt));
        toast.error("Batas re-analyze harian tercapai (3x/hari).");
        return;
      }
    } catch {
      // Kalau gagal fetch, lanjut saja — server akan handle 429
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

  const isRateLimited = !!rateLimitedUntil;
  const isDisabled = loading || isRateLimited;

  if (variant === "context") {
    return (
      <button
        onClick={handleReanalyze}
        disabled={isDisabled}
        title={
          isRateLimited ? `Bisa digunakan lagi dalam ${countdown}` : undefined
        }
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading
          ? "Fetching..."
          : isRateLimited
            ? `Re-analyze dalam ${countdown}`
            : "Re-analyze"}
      </button>
    );
  }

  return (
    <button
      onClick={handleReanalyze}
      disabled={isDisabled}
      title={
        isRateLimited ? `Bisa digunakan lagi dalam ${countdown}` : undefined
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
    >
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading
        ? "Re-analyzing..."
        : isRateLimited
          ? `Re-analyze dalam ${countdown}`
          : "Re-analyze"}
    </button>
  );
}
