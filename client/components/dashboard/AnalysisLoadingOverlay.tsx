"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Step = "analyzing" | "done" | "error";

export function AnalysisLoadingOverlay() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("analyzing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runAnalysis() {
      try {
        await fetch("/api/analysis", { method: "DELETE" });

        const res = await fetch("/api/analysis", { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal menjalankan analisis.");
        }

        setStep("done");

        setTimeout(() => {
          router.replace("/dashboard");
          router.refresh();
        }, 1200);
      } catch (err: any) {
        setError(err.message ?? "Terjadi kesalahan.");
        setStep("error");
      }
    }

    runAnalysis();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        {step === "analyzing" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10">
              <Sparkles size={24} className="text-teal-500" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">
              AI sedang menganalisis akun kamu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Biasanya selesai dalam 10–20 detik. Jangan tutup halaman ini.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={13} className="animate-spin text-teal-500" />
              Mendeteksi niche & audience...
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10">
              <CheckCircle2 size={24} className="text-teal-500" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">
              Analisis selesai!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mengarahkan ke dashboard...
            </p>
          </>
        )}

        {step === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">
              Analisis gagal
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => {
                setStep("analyzing");
                setError(null);
              }}
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-teal-500 px-4 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
            >
              Coba lagi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
