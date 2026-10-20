"use client";

import { useMemo, useState } from "react";
import NameCard from "./NameCard";
import type { VanityRecord } from "@/lib/data";

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "极品", label: "极品" },
  { key: "3D", label: "3D" },
  { key: "4D", label: "4D" },
  { key: "3L", label: "3L" },
  { key: "AAAA", label: "AAAA" },
  { key: "ABAB", label: "ABAB" },
  { key: "AABB", label: "AABB" },
  { key: "顺子", label: "顺子" },
  { key: "倒序", label: "倒序" },
  { key: "回文", label: "回文" },
  { key: "520", label: "520" },
  { key: "1314", label: "1314" },
  { key: "年份", label: "年份" },
];

type SortKey = "score" | "length";

export default function VanityExplorer({
  records,
}: {
  records: VanityRecord[];
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("score");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = records;
    if (filter === "极品") {
      list = list.filter((r) => r.label === "极品");
    } else if (filter !== "all") {
      list = list.filter((r) => r.tags.includes(filter));
    }
    if (q) list = list.filter((r) => r.name.startsWith(q));
    return [...list].sort((a, b) =>
      sort === "score"
        ? b.score - a.score || a.block - b.block
        : a.name.length - b.name.length || b.score - a.score
    );
  }, [records, filter, query, sort]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filter === f.key
                ? "border-gold/60 bg-gold/15 text-gold"
                : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="按名字前缀搜索,如 88"
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none"
        />
        <div className="flex overflow-hidden rounded-lg border border-white/10 text-sm">
          {(
            [
              { key: "score", label: "按评分" },
              { key: "length", label: "按长度" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`px-3 py-2 transition-colors ${
                sort === s.key
                  ? "bg-gold/15 text-gold"
                  : "bg-white/5 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">共 {filtered.length} 个</span>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
          没有匹配的靓号,换个筛选条件试试。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <NameCard key={r.name} record={r} />
          ))}
        </div>
      )}
    </section>
  );
}
