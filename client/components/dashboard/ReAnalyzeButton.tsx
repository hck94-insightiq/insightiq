"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ReAnalyzeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReanalyze() {
    setLoading(true);
    try {
      // Hapus cache
      await fetch("/api/analysis", { method: "DELETE" });

      // Trigger fresh
      const res = await fetch("/api/analysis", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("AI analysis selesai!");
      router.refresh();
    } catch {
      toast.error("Gagal re-analyze");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleReanalyze} disabled={loading} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Analyzing..." : "Re-analyze"}
    </Button>
  );
}
