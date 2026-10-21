// 榜单筛选/排序/分页逻辑:服务端与客户端共用的纯函数。

import type { VanityRecord } from "./data";

export const PAGE_SIZE = 48;

export const BROWSE_FILTERS = [
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
] as const;

export type SortKey = "score" | "length";

export interface BrowseQuery {
  filter: string;
  q: string;
  sort: SortKey;
  page: number;
}

export interface BrowseResult {
  items: VanityRecord[];
  total: number;
  page: number;
  pageCount: number;
}

export function parseBrowseQuery(sp: {
  filter?: string;
  q?: string;
  sort?: string;
  page?: string;
}): BrowseQuery {
  const filter = BROWSE_FILTERS.some((f) => f.key === sp.filter)
    ? (sp.filter as string)
    : "all";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 32);
  const sort: SortKey = sp.sort === "length" ? "length" : "score";
  const page = Math.max(1, Math.floor(Number(sp.page) || 1));
  return { filter, q, sort, page };
}

export function browseVanity(
  records: VanityRecord[],
  query: BrowseQuery
): BrowseResult {
  let list = records;
  if (query.filter === "极品") {
    list = list.filter((r) => r.label === "极品");
  } else if (query.filter !== "all") {
    list = list.filter((r) => r.tags.includes(query.filter));
  }
  if (query.q) list = list.filter((r) => r.name.startsWith(query.q));
  const sorted = [...list].sort((a, b) =>
    query.sort === "score"
      ? b.score - a.score || a.block - b.block
      : a.name.length - b.name.length || b.score - a.score
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: sorted.length,
    page,
    pageCount,
  };
}
