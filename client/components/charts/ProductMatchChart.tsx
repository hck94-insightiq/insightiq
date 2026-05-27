"use client";

import { Analysis } from "@/types";

const TEAL = "oklch(0.68 0.13 195)";
const tealAlpha = (a: number) => `oklch(0.68 0.13 195 / ${a})`;

interface Props {
  recommendations?: Analysis["recommendations"];
}

export default function ProductMatchChart({ recommendations }: Props) {
  const data = recommendations ?? [];

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="px-5 pb-3 pt-5">
        <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
          Product Match Score
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Ranking kategori produk TikTok Shop yang paling cocok untuk audience
          kamu
        </p>
      </div>
      <div className="px-5 pb-5">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Data belum tersedia
          </p>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {data.map((r, i) => (
              <div
                key={r.category}
                className="grid items-center gap-3"
                style={{ gridTemplateColumns: "minmax(140px, 220px) 1fr 44px" }}
              >
                <p
                  className="truncate text-sm text-foreground/85"
                  title={r.category}
                >
                  {r.category}
                </p>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${r.matchScore}%`,
                      background:
                        i === 0
                          ? TEAL
                          : tealAlpha(Math.max(0.35, r.matchScore / 100)),
                    }}
                  />
                </div>
                <span className="text-right font-mono text-sm font-semibold">
                  {r.matchScore}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
