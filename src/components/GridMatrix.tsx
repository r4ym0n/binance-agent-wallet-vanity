"use client";

import { useMemo, useState } from "react";

interface GridCategory {
  key: string;
  label: string;
  desc: string;
  size: number;
  /** 该全集里已注册的名字 */
  registered: string[];
  cell: number;
  gap: number;
  dimAvailable?: boolean;
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
}: {
  categories: GridCategory[];
}) {
  const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "3D");
  const [vacancyOnly, setVacancyOnly] = useState(false);

  const cat = categories.find((c) => c.key === activeKey) ?? categories[0];
  const registeredSet = useMemo(
    () => new Set(cat.registered),
    [cat]
  );

  const cols = Math.ceil(Math.sqrt(cat.size));
  const { cell, gap } = cat;
  const step = cell + gap;
  const width = cols * step - gap;
  const height = Math.ceil(cat.size / cols) * step - gap;

  const regCount = cat.registered.length;
  const freeCount = cat.size - regCount;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveKey(c.key)}
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
          高亮未注册
        </label>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-zinc-400">
        <span>
          {cat.desc} 全集 · 已注册{" "}
          <span className="font-mono font-bold text-gold">
            {regCount.toLocaleString()}
          </span>{" "}
          / {cat.size.toLocaleString()}
        </span>
        <span>
          剩余{" "}
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
            已注册
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: vacancyOnly ? "#34d399" : "#27272a" }}
            />
            未注册
          </span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-panel p-4">
        <svg
          width={width}
          height={height}
          className="mx-auto block"
          role="img"
          aria-label={`${cat.label} 注册情况点阵图`}
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
                aria-label={`${name}.ai ${reg ? "已注册" : "未注册"}`}
              >
                <rect x={x} y={y} width={cell} height={cell} rx={1} fill={fill}>
                  <title>
                    {name}.ai — {reg ? "已注册,点击查看详情" : "未注册,去查询/领取"}
                  </title>
                </rect>
              </a>
            );
          })}
        </svg>
        <p className="mt-3 text-center text-xs text-zinc-600">
          悬停查看号码,点击可跳转。注册状态以本站索引为准(合约最短支持 3 位)。
        </p>
      </div>
    </div>
  );
}
