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
    Icon: Calendar,
  },
  {
    id: "audience",
    label: "Profil Audience",
    a1: GAP,
    a2: 90 - GAP,
    color: "#1D9E75",
    Icon: Users,
  },
  {
    id: "engagement",
    label: "Sinyal Engagement",
    a1: 90 + GAP,
    a2: 180 - GAP,
    color: "#5DCAA5",
    Icon: Activity,
  },
  {
    id: "peluang",
    label: "Peluang",
    a1: 180 + GAP,
    a2: 270 - GAP,
    color: "#9FE1CB",
    Icon: Lightbulb,
  },
] as const;

function Insight({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-sm leading-relaxed text-foreground/70 border-l-2 border-teal-500/50 pl-3 shrink-0">
      {text}
    </p>
  );
}

// ─── Pola Konten ──────────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-3">
      {/* 7-col bar chart — shrink padding on mobile */}
      <div className="grid grid-cols-7 gap-1">
        {postingDays.map((d) => {
          const isBest = bestDay?.day === d.day;
          return (
            <div
              key={d.day}
              className={`flex flex-col items-center gap-0.5 rounded-lg p-1 sm:p-2 ${
                isBest
                  ? "bg-teal-500/15 border border-teal-500/40"
                  : "bg-muted/40 border border-border"
              }`}
            >
              <span
                className={`font-mono text-[10px] sm:text-xs font-medium shrink-0 ${
                  isBest
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-muted-foreground"
                }`}
              >
                {d.day}
              </span>
              {/* Mini bar */}
              <div className="w-full h-10 sm:h-14 flex items-end justify-center">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${(d.avgViews / maxViews) * 100}%`,
                    minHeight: 2,
                    background: isBest
                      ? "oklch(0.68 0.13 195)"
                      : "oklch(0.68 0.13 195 / 0.28)",
                  }}
                />
              </div>
              <span
                className={`font-mono text-[9px] sm:text-xs font-semibold shrink-0 ${
                  isBest
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-foreground"
                }`}
              >
                {fmt(d.avgViews)}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground shrink-0">
                {d.count}x
              </span>
            </div>
          );
        })}
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {hashtags.slice(0, 6).map((h) => (
            <span
              key={h}
              className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:text-xs text-muted-foreground"
            >
              #{h}
            </span>
          ))}
        </div>
      )}
      <Insight text={insight} />
    </div>
  );
}

// ─── Profil Audience ──────────────────────────────────────────────────────────

function AudienceDetail({
  audienceProfile,
  insight,
}: {
  audienceProfile?: AudienceProfile;
  insight?: string;
}) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Age Range
          </p>
          {/* Reduced from text-3xl — too big on mobile for longer strings */}
          <p className="text-xl sm:text-3xl font-semibold tracking-tight">
            {audienceProfile?.ageRange ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-teal-500/25 bg-teal-500/8 px-4 py-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-teal-600 dark:text-teal-400">
            Purchase Power
          </p>
          {/* Reduced from text-2xl — long Rp strings overflow on mobile */}
          <p className="text-base sm:text-xl font-semibold tracking-tight leading-snug">
            {cap(audienceProfile?.purchasePower ?? "—")}
          </p>
        </div>
      </div>
      <Insight text={insight} />
    </div>
  );
}

// ─── Sinyal Engagement ────────────────────────────────────────────────────────

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
  const circ = 2 * Math.PI * 50;
  let offset = 0;
  const arcs = items.map((item) => {
    const p = total > 0 ? item.value / total : 0;
    const dash = p * circ;
    const arc = { dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: donut + legend side by side in a row; insight below */}
      {/* Desktop: all three in one row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Donut — fixed size on mobile, fills height on desktop */}
        <div className="flex justify-center sm:justify-start">
          <svg
            viewBox="0 0 120 120"
            className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] shrink-0"
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="16"
            />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={COLORS[i]}
                strokeWidth="16"
                strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                strokeDashoffset={-arc.offset + circ / 4}
                transform="rotate(-90 60 60)"
              />
            ))}
            <text
              x="60"
              y="54"
              textAnchor="middle"
              style={{
                fontSize: 16,
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
                fill: "var(--foreground)",
              }}
            >
              {pct(breakdown?.likes ?? 0)}%
            </text>
            <text
              x="60"
              y="72"
              textAnchor="middle"
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fill: "var(--muted-foreground)",
              }}
            >
              LIKES
            </text>
          </svg>
        </div>

        {/* Legend — horizontal wrap on mobile, vertical on sm+ */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-3 justify-center sm:justify-start">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ background: COLORS[i] }}
              />
              <span className="text-sm text-muted-foreground w-20 sm:w-24">
                {item.label}
              </span>
              <span className="font-mono text-sm font-bold">
                {pct(item.value)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight — always full width below on mobile */}
      {insight && (
        <p className="text-sm leading-relaxed text-foreground/70 border-l-2 border-teal-500/50 pl-3">
          {insight}
        </p>
      )}
    </div>
  );
}

// ─── Peluang ──────────────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-4">
      {/*
        Mobile:  grid-cols-[80px_1fr_28px]  — fixed label width, truncate
        sm+:     grid-cols-[max-content_1fr_28px] — label column auto-sizes to
                 the longest label; all bars start at the same position
        `contents` on the row wrapper makes children direct grid items
      */}
      <div className="grid grid-cols-[max-content_1fr_28px] gap-x-2 sm:gap-x-3 gap-y-2 sm:gap-y-3">
        {sorted.map((item, i) => {
          const isLowest = i === sorted.length - 1;
          return (
            <div key={item.niche} className="contents">
              {/* Label */}
              <span
                className={`font-mono text-xs sm:text-sm self-center truncate sm:whitespace-nowrap ${
                  isLowest
                    ? "text-amber-500 font-semibold"
                    : "text-muted-foreground"
                }`}
                title={item.niche}
              >
                {item.niche}
              </span>

              {/* Bar */}
              <div className="h-7 sm:h-10 rounded-lg overflow-hidden bg-muted/60 self-center">
                <div
                  className="h-full rounded-lg transition-[width] duration-500"
                  style={{
                    width: `${(item.score / best) * 100}%`,
                    background: isLowest
                      ? "oklch(0.7 0.15 60)"
                      : `oklch(0.68 0.13 195 / ${0.3 + (item.score / 100) * 0.7})`,
                  }}
                />
              </div>

              {/* Score */}
              <span
                className={`font-mono text-base sm:text-xl font-bold text-right self-center ${
                  isLowest ? "text-amber-500" : ""
                }`}
              >
                {item.score}
              </span>
            </div>
          );
        })}
      </div>
      <Insight text={insight} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
      {/* Wheel — centered on mobile */}
      <div
        className="mx-auto lg:mx-0 relative shrink-0"
        style={{ width: 220, height: 220 }}
      >
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
        </svg>

        {/* Center circle */}
        <div
          className="absolute inset-0 m-auto flex flex-col items-center justify-center rounded-full bg-white dark:bg-[#111] shadow-md dark:shadow-none pointer-events-none transition-colors"
          style={{ width: (RI - 2) * 2, height: (RI - 2) * 2 }}
        >
          {selectedSection ? (
            <>
              <span
                className="font-mono text-[10px] font-extrabold uppercase tracking-widest leading-none"
                style={{ color: selectedSection.color }}
              >
                {selectedSection.label.split(" ")[0]}
              </span>
              {selectedSection.label.split(" ").length > 1 && (
                <span
                  className="font-mono text-[8px] font-semibold leading-none mt-1"
                  style={{ color: selectedSection.color }}
                >
                  {selectedSection.label.split(" ").slice(1).join(" ")}
                </span>
              )}
            </>
          ) : (
            <span className="font-mono text-[9px] font-semibold text-muted-foreground text-center leading-tight">
              KLIK
              <br />
              SECTION
            </span>
          )}
        </div>

        {/* Icon overlays */}
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
                className={`transition-all duration-200 ${
                  isSelected
                    ? "text-white drop-shadow-sm"
                    : "text-teal-950/40 dark:text-white/40"
                }`}
                strokeWidth={isSelected ? 2.5 : 2}
              />
              <span
                className={`font-mono text-[8px] uppercase tracking-[0.04em] whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "text-white font-bold drop-shadow-sm"
                    : "text-teal-950/50 dark:text-white/40 font-semibold"
                }`}
              >
                {s.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail panel — auto height on mobile, fixed on lg */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex h-32 lg:h-[400px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border">
            <p className="font-mono text-xs text-muted-foreground">
              Klik section untuk lihat detail
            </p>
          </div>
        ) : (
          <div className="flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 gap-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 shrink-0">
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
            {/* Content */}
            <div>{detailContent[selected]}</div>
          </div>
        )}
      </div>
    </div>
  );
}
