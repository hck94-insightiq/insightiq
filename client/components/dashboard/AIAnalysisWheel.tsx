"use client";

import { useState } from "react";
import { Calendar, Users, Activity, Lightbulb } from "lucide-react";

interface PostingDay {
  day: string;
  avgViews: number;
  count: number;
}
interface EngagementBreakdown {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}
interface NicheItem {
  niche: string;
  score: number;
}
interface AudienceProfile {
  ageRange?: string;
  purchasePower?: string;
}
interface AnalysisReport {
  polaKonten?: string;
  profilAudience?: string;
  sinyalEngagement?: string;
  peluangBelumDioptimalkan?: string;
}

interface Props {
  postingDays: PostingDay[];
  hashtags: string[];
  engagementBreakdown?: EngagementBreakdown;
  audienceProfile?: AudienceProfile;
  nicheBreakdown?: NicheItem[];
  analysisReport?: AnalysisReport;
  bestDay?: PostingDay | null;
}

function arcPath(
  cx: number,
  cy: number,
  ri: number,
  ro: number,
  a1deg: number,
  a2deg: number,
) {
  const r = (d: number) => (d * Math.PI) / 180;
  const [a1, a2] = [r(a1deg), r(a2deg)];
  const x = (r: number, a: number) => cx + r * Math.cos(a);
  const y = (r: number, a: number) => cy + r * Math.sin(a);
  return [
    `M ${x(ro, a1)} ${y(ro, a1)}`,
    `A ${ro} ${ro} 0 0 1 ${x(ro, a2)} ${y(ro, a2)}`,
    `L ${x(ri, a2)} ${y(ri, a2)}`,
    `A ${ri} ${ri} 0 0 0 ${x(ri, a1)} ${y(ri, a1)}`,
    "Z",
  ].join(" ");
}

function centroid(
  cx: number,
  cy: number,
  r: number,
  a1deg: number,
  a2deg: number,
) {
  const mid = ((a1deg + a2deg) / 2) * (Math.PI / 180);
  return { x: cx + r * Math.cos(mid), y: cy + r * Math.sin(mid) };
}

const CX = 110,
  CY = 110,
  RI = 38,
  RO = 100,
  GAP = 5;

const SECTIONS = [
  {
    id: "pola",
    label: "Pola Konten",
    a1: -90 + GAP,
    a2: -GAP,
    color: "#0F6E56",
    colorLight: "#E1F5EE",
    Icon: Calendar,
  },
  {
    id: "audience",
    label: "Profil Audience",
    a1: GAP,
    a2: 90 - GAP,
    color: "#1D9E75",
    colorLight: "#E1F5EE",
    Icon: Users,
  },
  {
    id: "engagement",
    label: "Sinyal Engagement",
    a1: 90 + GAP,
    a2: 180 - GAP,
    color: "#5DCAA5",
    colorLight: "#E1F5EE",
    Icon: Activity,
  },
  {
    id: "peluang",
    label: "Peluang",
    a1: 180 + GAP,
    a2: 270 - GAP,
    color: "#9FE1CB",
    colorLight: "#E1F5EE",
    Icon: Lightbulb,
  },
] as const;

function PolaDetail({
  postingDays,
  hashtags,
  bestDay,
  insight,
}: {
  postingDays: PostingDay[];
  hashtags: string[];
  bestDay?: PostingDay | null;
  insight?: string;
}) {
  const maxViews = Math.max(...postingDays.map((d) => d.avgViews), 1);
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(0)}K`
        : "0";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1.5">
        {postingDays.map((d) => {
          const isBest = bestDay?.day === d.day;
          const h = Math.max(8, Math.round((d.avgViews / maxViews) * 100));
          return (
            <div
              key={d.day}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 ${isBest ? "bg-teal-500/15 border border-teal-500/40" : "bg-muted/40 border border-border"}`}
            >
              <span
                className={`font-mono text-[10px] font-medium ${isBest ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"}`}
              >
                {d.day}
              </span>
              <div
                className="w-full flex items-end justify-center"
                style={{ height: 100 }}
              >
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: h,
                    background: isBest
                      ? "oklch(0.68 0.13 195)"
                      : "oklch(0.68 0.13 195 / 0.28)",
                  }}
                />
              </div>
              <span
                className={`font-mono text-[10px] font-semibold ${isBest ? "text-teal-600 dark:text-teal-400" : "text-foreground"}`}
              >
                {fmt(d.avgViews)}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">
                {d.count}x
              </span>
            </div>
          );
        })}
      </div>
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.slice(0, 6).map((h) => (
            <span
              key={h}
              className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              #{h}
            </span>
          ))}
        </div>
      )}
      {insight && (
        <p className="text-[13px] leading-relaxed text-foreground/70 border-l-2 border-teal-500/50 pl-3">
          {insight}
        </p>
      )}
    </div>
  );
}

function AudienceDetail({
  audienceProfile,
  insight,
}: {
  audienceProfile?: AudienceProfile;
  insight?: string;
}) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Age Range
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {audienceProfile?.ageRange ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-teal-500/25 bg-teal-500/[0.08] px-4 py-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-teal-600 dark:text-teal-400">
            Purchase Power
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {cap(audienceProfile?.purchasePower ?? "—")}
          </p>
        </div>
      </div>
      {insight && (
        <p className="text-[13px] leading-relaxed text-foreground/70 border-l-2 border-teal-500/50 pl-3">
          {insight}
        </p>
      )}
    </div>
  );
}

function EngagementDetail({
  breakdown,
  insight,
}: {
  breakdown?: EngagementBreakdown;
  insight?: string;
}) {
  const total =
    (breakdown?.likes ?? 0) +
    (breakdown?.comments ?? 0) +
    (breakdown?.shares ?? 0) +
    (breakdown?.saves ?? 0);
  const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : "0");
  const COLORS = [
    "oklch(0.48 0.11 195)",
    "oklch(0.68 0.13 195)",
    "oklch(0.78 0.10 195)",
    "oklch(0.86 0.07 195)",
  ];
  const items = [
    { label: "Likes", value: breakdown?.likes ?? 0 },
    { label: "Saves", value: breakdown?.saves ?? 0 },
    { label: "Shares", value: breakdown?.shares ?? 0 },
    { label: "Comments", value: breakdown?.comments ?? 0 },
  ];
  const circ = 2 * Math.PI * 56;
  let offset = 0;
  const arcs = items.map((item, i) => {
    const p = total > 0 ? item.value / total : 0;
    const dash = p * circ;
    const arc = { dash, offset, color: COLORS[i] };
    offset += dash;
    return arc;
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="shrink-0"
        >
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="16"
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="70"
              cy="70"
              r="56"
              fill="none"
              stroke={arc.color}
              strokeWidth="16"
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={-arc.offset + circ / 4}
              transform="rotate(-90 70 70)"
            />
          ))}
          <text
            x="70"
            y="65"
            textAnchor="middle"
            className="fill-foreground"
            style={{
              fontSize: 18,
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
            }}
          >
            {pct(breakdown?.likes ?? 0)}%
          </text>
          <text
            x="70"
            y="82"
            textAnchor="middle"
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fill: "var(--muted-foreground)",
              textTransform: "uppercase",
            }}
          >
            LIKES
          </text>
        </svg>
        <div className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: COLORS[i] }}
              />
              <span className="flex-1 text-muted-foreground">{item.label}</span>
              <span className="font-mono font-semibold">
                {pct(item.value)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      {insight && (
        <p className="text-[13px] leading-relaxed text-foreground/70 border-l-2 border-teal-500/50 pl-3">
          {insight}
        </p>
      )}
    </div>
  );
}

function PeluangDetail({
  nicheBreakdown,
  insight,
}: {
  nicheBreakdown?: NicheItem[];
  insight?: string;
}) {
  const sorted = [...(nicheBreakdown ?? [])].sort((a, b) => b.score - a.score);
  const best = sorted[0]?.score ?? 1;
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {sorted.map((item, i) => {
          const isLowest = i === sorted.length - 1;
          return (
            <div
              key={item.niche}
              className="grid items-center gap-3"
              style={{ gridTemplateColumns: "minmax(0,1fr) 140px 40px" }}
            >
              <span
                className={`text-[13px] truncate font-mono ${isLowest ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-muted-foreground"}`}
              >
                {item.niche}
              </span>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.score / best) * 100}%`,
                    background: isLowest
                      ? "oklch(0.7 0.15 60)"
                      : `oklch(0.68 0.13 195 / ${0.3 + (item.score / 100) * 0.7})`,
                  }}
                />
              </div>
              <span
                className={`font-mono text-[14px] font-semibold text-right ${isLowest ? "text-amber-600 dark:text-amber-400" : ""}`}
              >
                {item.score}
              </span>
            </div>
          );
        })}
      </div>
      {insight && (
        <p className="text-[13px] leading-relaxed text-foreground/70 border-l-2 border-teal-500/50 pl-3">
          {insight}
        </p>
      )}
    </div>
  );
}

export function AIAnalysisWheel({
  postingDays,
  hashtags,
  engagementBreakdown,
  audienceProfile,
  nicheBreakdown,
  analysisReport,
  bestDay,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedSection = SECTIONS.find((s) => s.id === selected);

  const detailContent: Record<string, React.ReactNode> = {
    pola: (
      <PolaDetail
        postingDays={postingDays}
        hashtags={hashtags}
        bestDay={bestDay}
        insight={analysisReport?.polaKonten}
      />
    ),
    audience: (
      <AudienceDetail
        audienceProfile={audienceProfile}
        insight={analysisReport?.profilAudience}
      />
    ),
    engagement: (
      <EngagementDetail
        breakdown={engagementBreakdown}
        insight={analysisReport?.sinyalEngagement}
      />
    ),
    peluang: (
      <PeluangDetail
        nicheBreakdown={nicheBreakdown}
        insight={analysisReport?.peluangBelumDioptimalkan}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      {/* Wheel */}
      <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          {SECTIONS.map((s) => {
            const isSelected = selected === s.id;
            return (
              <path
                key={s.id}
                d={arcPath(CX, CY, RI, RO, s.a1, s.a2)}
                fill={isSelected ? s.color : `${s.color}88`}
                className="cursor-pointer transition-all duration-200"
                onClick={() =>
                  setSelected((prev) => (prev === s.id ? null : s.id))
                }
                style={{ outline: "none" }}
              />
            );
          })}
          {/* Center circle */}
          <circle
            cx={CX}
            cy={CY}
            r={RI - 2}
            fill="var(--color-background-secondary, #f5f5f5)"
            className="pointer-events-none"
          />
          {selectedSection ? (
            <>
              <text
                x={CX}
                y={CY - 4}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: selectedSection.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {selectedSection.label.split(" ")[0]}
              </text>
              <text
                x={CX}
                y={CY + 7}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: selectedSection.color,
                }}
              >
                {selectedSection.label.split(" ").slice(1).join(" ")}
              </text>
            </>
          ) : (
            <>
              <text
                x={CX}
                y={CY - 4}
                textAnchor="middle"
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: "var(--muted-foreground, #888)",
                }}
              >
                KLIK
              </text>
              <text
                x={CX}
                y={CY + 7}
                textAnchor="middle"
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono, monospace)",
                  fill: "var(--muted-foreground, #888)",
                }}
              >
                SECTION
              </text>
            </>
          )}
        </svg>

        {/* Icons overlaid at arc centroids */}
        {SECTIONS.map((s) => {
          const c = centroid(CX, CY, (RI + RO) / 2, s.a1, s.a2);
          const isSelected = selected === s.id;
          const Icon = s.Icon;
          return (
            <div
              key={s.id}
              className="pointer-events-none absolute flex flex-col items-center gap-0.5"
              style={{ left: c.x - 14, top: c.y - 18 }}
            >
              <Icon
                size={18}
                style={{ color: isSelected ? "#fff" : s.color }}
                strokeWidth={2}
              />
              <span
                style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono, monospace)",
                  color: isSelected ? "#fff" : s.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border">
            <p className="font-mono text-xs text-muted-foreground">
              Klik section untuk lihat detail
            </p>
          </div>
        ) : (
          <div className="flex h-[400px] flex-col rounded-2xl border border-border bg-card p-5 gap-4 overflow-y-auto">
            <div className="flex items-center gap-2.5">
              {selectedSection && (
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${selectedSection.color}22` }}
                >
                  <selectedSection.Icon
                    size={15}
                    style={{ color: selectedSection.color }}
                  />
                </div>
              )}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  AI Analysis Report
                </p>
                <p className="text-sm font-semibold leading-tight">
                  {selectedSection?.label}
                </p>
              </div>
            </div>
            {detailContent[selected]}
          </div>
        )}
      </div>
    </div>
  );
}
