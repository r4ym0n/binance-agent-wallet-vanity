import type { Metadata } from "next";
import Link from "next/link";
import NameCard from "@/components/NameCard";
import {
  BROWSE_FILTERS,
  PAGE_SIZE,
  browseVanity,
  parseBrowseQuery,
} from "@/lib/browse";
import { getVanity } from "@/lib/data";

export const metadata: Metadata = {
  title: "全部靓号",
  description: "浏览币安钱包 .ai 域名全部已索引靓号,支持按规律筛选、前缀搜索与分页。",
};

function buildHref(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v && v !== "all" && v !== "score" && v !== "1") params.set(k, v);
  }
  const s = params.toString();
  return s ? `/browse?${s}` : "/browse";
}

export default async function BrowsePage(props: PageProps<"/browse">) {
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;
  const query = parseBrowseQuery({
    filter: one(sp.filter),
    q: one(sp.q),
    sort: one(sp.sort),
    page: one(sp.page),
  });
  const vanity = await getVanity();
  const { items, total, page, pageCount } = browseVanity(vanity, query);

  const base = { filter: query.filter, q: query.q, sort: query.sort };

  const pages: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pageCount, page + 2); p++) {
    pages.push(p);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">全部靓号</h1>
          <p className="mt-1 text-sm text-zinc-500">
            共 {total.toLocaleString()} 个匹配,每页 {PAGE_SIZE} 个
          </p>
        </div>
        <Link
          href="/grid"
          className="text-sm text-zinc-400 transition-colors hover:text-gold"
        >
          想一眼发现还没被注册的号?去靓号地图 →
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {BROWSE_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={buildHref({ ...base, filter: f.key, page: "1" })}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              query.filter === f.key
                ? "border-gold/60 bg-gold/15 text-gold"
                : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form method="GET" action="/browse" className="flex gap-2">
          {query.filter !== "all" && (
            <input type="hidden" name="filter" value={query.filter} />
          )}
          {query.sort !== "score" && (
            <input type="hidden" name="sort" value={query.sort} />
          )}
          <input
            name="q"
            defaultValue={query.q}
            placeholder="按名字前缀搜索,如 88"
            className="w-56 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5"
          >
            搜索
          </button>
        </form>
        <div className="flex overflow-hidden rounded-lg border border-white/10 text-sm">
          {(
            [
              { key: "score", label: "按评分" },
              { key: "length", label: "按长度" },
            ] as const
          ).map((s) => (
            <Link
              key={s.key}
              href={buildHref({ ...base, sort: s.key, page: "1" })}
              className={`px-3 py-2 transition-colors ${
                query.sort === s.key
                  ? "bg-gold/15 text-gold"
                  : "bg-white/5 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
          没有匹配的靓号,换个筛选条件试试。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((r) => (
            <NameCard key={r.name} record={r} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildHref({ ...base, page: String(page - 1) })}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
            >
              ← 上一页
            </Link>
          )}
          {pages[0] > 1 && (
            <>
              <Link
                href={buildHref({ ...base, page: "1" })}
                className="rounded-lg border border-white/10 px-3 py-2 font-mono text-sm text-zinc-300 hover:text-gold"
              >
                1
              </Link>
              {pages[0] > 2 && <span className="text-zinc-600">…</span>}
            </>
          )}
          {pages.map((p) => (
            <Link
              key={p}
              href={buildHref({ ...base, page: String(p) })}
              className={`rounded-lg border px-3 py-2 font-mono text-sm ${
                p === page
                  ? "border-gold/60 bg-gold/15 text-gold"
                  : "border-white/10 text-zinc-300 hover:text-gold"
              }`}
            >
              {p}
            </Link>
          ))}
          {pages[pages.length - 1] < pageCount && (
            <>
              {pages[pages.length - 1] < pageCount - 1 && (
                <span className="text-zinc-600">…</span>
              )}
              <Link
                href={buildHref({ ...base, page: String(pageCount) })}
                className="rounded-lg border border-white/10 px-3 py-2 font-mono text-sm text-zinc-300 hover:text-gold"
              >
                {pageCount}
              </Link>
            </>
          )}
          {page < pageCount && (
            <Link
              href={buildHref({ ...base, page: String(page + 1) })}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
            >
              下一页 →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
