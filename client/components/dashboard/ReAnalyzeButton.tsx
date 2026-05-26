"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  variant?: "context" | "page";
  tiktokUsername: string;
}

export function ReAnalyzeButton({ variant = "page", tiktokUsername }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReanalyze() {
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
      if (!analysisRes.ok) throw new Error("Gagal menjalankan AI analysis.");

      toast.success("Re-analyze selesai!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "context") {
    return (
      <button
        onClick={handleReanalyze}
        disabled={loading}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading ? "Fetching..." : "Re-fetch"}
      </button>
    );
  }

  return (
    <button
      onClick={handleReanalyze}
      disabled={loading}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
    >
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "Re-analyzing..." : "Re-analyze"}
    </button>
  );
}
