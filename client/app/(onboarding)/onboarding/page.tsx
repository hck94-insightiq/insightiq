"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EXAMPLES = ["@parksully5", "@bima.cooks", "@haseulbintaro"];

function extractUsername(input: string): string {
  const urlMatch = input.match(/tiktok\.com\/@?([\w.]+)/i);
  if (urlMatch) return urlMatch[1];

  return input.replace(/^@/, "").trim();
}

export default function OnboardingPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    const username = extractUsername(input);
    if (!username) {
      setError("Masukkan username atau link TikTok kamu dulu.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await fetch("/api/tiktok-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!result.ok) {
        const json = await result.json();
        throw new Error(json.error || "Gagal mengambil data TikTok.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        {/* Label */}
        <p className="text-teal-600 text-xs font-semibold tracking-widest uppercase mb-4">
          // Let&apos;s get started
        </p>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Connect your TikTok account
        </h1>
        <p className="text-gray-500 text-base mb-10 leading-relaxed">
          Paste link profil TikTok kamu. Kami akan otomatis ambil data
          followers, engagement, dan hashtag — tidak perlu input manual.
        </p>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">
            TikTok profile URL
          </p>

          {/* Input + Button */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://tiktok.com/@username  atau  @username"
                className="pl-9 h-11 text-sm"
              />
            </div>
            <Button
              onClick={handleFetch}
              disabled={loading || !input.trim()}
              className="h-11 px-5 bg-teal-500 hover:bg-teal-400 text-white font-semibold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  Fetch Data
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          {/* Example pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-gray-400">Coba contoh:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setInput(ex)}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
