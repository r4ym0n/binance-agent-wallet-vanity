"use client";

import { useMemo, useRef, useState } from "react";
import { getDict, type Dict, type Locale } from "@/lib/i18n";
import { analyzeName } from "@/lib/vanity";

interface GridCategory {
  key: string;
  label: string;
  desc: string;
  size: number;
  cell: number;
  gap: number;
}

interface Hover {
  name: string;
  x: number;
  y: number;
}

interface GridDetail {
  label: string;
  score: number;
  owner: string;
  time: string;
}

function genName(key: string, i: number): string {
  if (key === "3L") {
    let s = "";
    let n = i;
    for (let k = 0; k < 3; k++) {
      s = String.fromCharCode(97 + (n % 26)) + s;
      n = Math.floor(n / 26);
    }
    return s;
  }
  return String(i).padStart(key === "3D" ? 3 : 4, "0");
}

export default function GridMatrix({
  categories,
  registered,
  locale,
}: {
  categories: GridCategory[];
  /** 三个全集内已注册的名字(仅用于点阵着色) */
  registered: string[];
  locale: Locale;
}) {
  const t: Dict = getDict(locale);
  const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "3D");
  const [vacancyOnly, setVacancyOnly] = useState(false);
  const [hover, setHover] = useState<Hover | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // 已注册格子的详情改为悬停时按需拉取(/api/name-detail),客户端缓存防重复请求
  const detailCache = useRef(new Map<string, GridDetail | null>());
  const hoverRef = useRef<string | null>(null);
  const [detail, setDetail] = useState<GridDetail | null>(null);
  // 随机抽号:在未注册全集里随机采样并用共享打分函数淘高分
  const [lucky, setLucky] = useState<{ name: string; score: number; tags: string[] } | null>(null);

  const cat = categories.find((c) => c.key === activeKey) ?? categories[0];
  const registeredSet = useMemo(() => new Set(registered), [registered]);

  const cols = Math.ceil(Math.sqrt(cat.size));
  const { cell, gap } = cat;
  const step = cell + gap;
  const width = cols * step - gap;
  const height = Math.ceil(cat.size / cols) * step - gap;

  let regCount = 0;
  for (let i = 0; i < cat.size; i++) {
    if (registeredSet.has(genName(cat.key, i))) regCount++;
  }
  const freeCount = cat.size - regCount;

  function drawLucky() {
    let best: { name: string; score: number; tags: string[] } | null = null;
    for (let i = 0; i < 600; i++) {
      const idx = Math.floor(Math.random() * cat.size);
      const name = genName(cat.key, idx);
      if (registeredSet.has(name)) continue;
      const a = analyzeName(name);
      if (a.score < 30) continue;
      if (!best || a.score > best.score) best = { name, score: a.score, tags: a.tags };
      if (best.score >= 55) break;
    }
    setLucky(best);
  }

  function handleEnter(name: string, e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    hoverRef.current = name;
    setHover({ name, x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (registeredSet.has(name)) {
      if (detailCache.current.has(name)) {
        setDetail(detailCache.current.get(name) ?? null);
      } else {
        setDetail(null);
        fetch(`/api/name-detail?name=${encodeURIComponent(name)}`)
          .then((r) => r.json())
          .then((d: { detail: GridDetail | null }) => {
            detailCache.current.set(name, d.detail);
            // 只有仍悬停在同一格时才更新,避免快速移动被旧响应覆盖
            setDetail((cur) =>
              hoverRef.current === name ? d.detail : cur
            );
          })
          .catch(() => detailCache.current.set(name, null));
      }
    } else {
      setDetail(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setActiveKey(c.key);
              setHover(null);
            }}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              c.key === activeKey
                ? "border-gold/60 bg-gold/15 text-gold"
                : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
            }`}
          >
            {c.label}
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={vacancyOnly}
            onChange={(e) => setVacancyOnly(e.target.checked)}
            className="accent-[#f0b90b]"
          />
          {t.grid.highlightVacancy}
        </label>
        <button
          onClick={drawLucky}
          className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm text-gold transition-colors hover:bg-gold/20"
        >
          {t.grid.randomBtn}
        </button>
      </div>

      {lucky && (
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 to-transparent px-5 py-4">
          <span className="font-mono text-3xl font-bold tracking-tight text-gold">
            {lucky.name}
            <span className="text-base font-normal text-zinc-500">.ai</span>
          </span>
          <span className="text-sm text-zinc-400">
            {t.grid.randomScore}{" "}
            <span className="font-mono font-bold text-gold">{lucky.score}</span>
          </span>
          {lucky.tags.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {lucky.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gold/10 px-1.5 py-0.5 font-mono text-[11px] text-gold"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
          <span className="ml-auto flex gap-2">
            <button
              onClick={drawLucky}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/5"
            >
              {t.grid.randomAgain}
            </button>
            <a
              href={`/check?name=${lucky.name}`}
              className="rounded-lg bg-gold px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              {t.grid.randomGo}
            </a>
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-zinc-400">
        <span>
          {cat.desc} ·{" "}
          <span className="font-mono font-bold text-gold">
            {regCount.toLocaleString()}
          </span>{" "}
          / {cat.size.toLocaleString()} {t.grid.legendRegistered.toLowerCase()}
        </span>
        <span>
          {t.grid.free}{" "}
          <span className="font-mono font-bold text-emerald-400">
            {freeCount.toLocaleString()}
          </span>
        </span>
        <span className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: vacancyOnly ? "#3f3f46" : "#f0b90b" }}
            />
            {t.grid.legendRegistered}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: vacancyOnly ? "#34d399" : "#27272a" }}
            />
            {t.grid.legendFree}
          </span>
        </span>
      </div>

      <div ref={wrapRef} className="relative">
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-panel p-4">
          <svg
            width={width}
            height={height}
            className="mx-auto block"
            role="img"
            aria-label={`${cat.label} .ai registration dot matrix`}
            onMouseLeave={() => setHover(null)}
          >
            {Array.from({ length: cat.size }, (_, i) => {
              const name = genName(cat.key, i);
              const reg = registeredSet.has(name);
              const x = (i % cols) * step;
              const y = Math.floor(i / cols) * step;
              const fill = reg
                ? vacancyOnly
                  ? "#3f3f46"
                  : "#f0b90b"
                : vacancyOnly
                  ? "#34d399"
                  : "#27272a";
              return (
                <a
                  key={name}
                  href={reg ? `/name/${name}` : `/check?name=${name}`}
                  aria-label={`${name}.ai ${reg ? t.grid.tooltipRegistered : t.grid.tooltipFree}`}
                >
                  <rect x={x} y={y} width={cell} height={cell} rx={1} fill={fill} />
                  {/* 透明放大热区:小格点(7-8px)难以精确悬停,外扩 2px 捕获事件 */}
                  <rect
                    x={x - 2}
                    y={y - 2}
                    width={cell + 4}
                    height={cell + 4}
                    fill="transparent"
                    onMouseEnter={(e) => handleEnter(name, e)}
                  />
                </a>
              );
            })}
          </svg>
          <p className="mt-3 text-center text-xs text-zinc-600">{t.grid.hint}</p>
        </div>

        {hover && (
          <div
            className="pointer-events-none absolute z-20 w-56 rounded-xl border border-white/10 bg-ink/95 p-3 shadow-xl backdrop-blur"
            style={{
              left: Math.min(hover.x + 12, Math.max(0, width - 236)),
              top: hover.y + 16,
            }}
          >
            <HoverBody
              name={hover.name}
              registered={registeredSet.has(hover.name)}
              detail={detail}
              t={t}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function HoverBody({
  name,
  registered,
  detail,
  t,
}: {
  name: string;
  registered: boolean;
  detail: GridDetail | null;
  t: Dict;
}) {
  if (!registered) {
    return (
      <div>
        <div className="font-mono text-lg font-bold text-emerald-400">
          {name}
          <span className="text-sm font-normal text-zinc-500">.ai</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">{t.grid.tooltipFree}</p>
      </div>
    );
  }
  if (!detail) {
    return (
      <div>
        <div className="font-mono text-lg font-bold text-gold">
          {name}
          <span className="text-sm font-normal text-zinc-500">.ai</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Loading…</p>
      </div>
    );
  }
  const d = detail;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-lg font-bold text-gold">
          {name}
          <span className="text-sm font-normal text-zinc-500">.ai</span>
        </span>
        <span className="text-xs text-zinc-400">
          {t.grid.label} {d.label}
        </span>
      </div>
      <div className="mt-2 space-y-1 text-xs text-zinc-400">
        <div>
          {t.grid.score}:{" "}
          <span className="font-mono text-gold/90">{d.score}</span>
        </div>
        <div className="truncate font-mono" title={d.owner}>
          {t.grid.owner} {d.owner.slice(0, 6)}…{d.owner.slice(-4)}
        </div>
        {d.time && (
          <div>
            {t.grid.registeredAt} {d.time}
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        {t.grid.tooltipRegistered}
      </p>
    </div>
  );
}
