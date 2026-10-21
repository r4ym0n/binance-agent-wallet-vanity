import type { Metadata } from "next";
import Link from "next/link";
import NameCard from "@/components/NameCard";
import { PAGE_SIZE, browseVanity } from "@/lib/browse";
import { getStats, getVanity } from "@/lib/data";
import { formatSyncTime } from "@/lib/format";
import { BINANCE_WALLET_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: ".ai 靓号雷达",
  description:
    "发现币安钱包 × SPACE ID Agent ID(.ai 域名)已注册的靓号:短号、豹子号、顺子号、520/1314 寓意号,点阵地图一眼发现还没被注册的靓号。",
};

export default async function Home() {
  const [stats, vanity] = await Promise.all([getStats(), getVanity()]);
  const top = browseVanity(vanity, {
    filter: "all",
    q: "",
    sort: "score",
    page: 1,
  }).items;

  const statItems = [
    { value: stats.totalVanity, label: "已索引靓号" },
    { value: stats.totalOwners, label: "独立持有者" },
    { value: stats.lastIndexedBlock.toLocaleString(), label: "最新同步区块" },
    { value: formatSyncTime(stats.lastSync), label: "同步时间" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-14 text-center sm:py-20">
        <p className="mb-3 font-mono text-sm tracking-widest text-gold">
          BNB Chain · SPACE ID Agent ID
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          .ai 靓号雷达
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
          币安钱包 × SPACE ID 推出的 .ai 域名正在免费 claim。
          这里持续索引链上注册事件,帮你发现已被抢走的靓号、
          用点阵地图一眼找出还没被注册的好号。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={BINANCE_WALLET_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-gold px-6 py-3 font-medium text-ink transition-colors hover:bg-gold/90"
          >
            去币安钱包领取
          </a>
          <Link
            href="/check"
            className="rounded-lg border border-white/15 px-6 py-3 text-zinc-200 transition-colors hover:bg-white/5"
          >
            查询靓号是否被抢
          </Link>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/5 bg-panel px-4 py-4 text-center"
          >
            <div className="font-mono text-xl font-bold text-gold sm:text-2xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="mb-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/grid"
          className="group rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent p-6 transition-colors hover:border-gold/50"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white group-hover:text-gold">
              靓号地图
            </h2>
            <span className="text-gold transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            3D / 4D 数字、3L 字母全集点阵图:金色 = 已被注册,暗色 =
            还有机会。剩下的好号一眼看全。
          </p>
        </Link>
        <Link
          href="/browse"
          className="group rounded-2xl border border-white/10 bg-panel p-6 transition-colors hover:border-gold/40"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white group-hover:text-gold">
              全部靓号
            </h2>
            <span className="text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-gold">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            按豹子号、顺子号、520/1314 等规律筛选,支持前缀搜索,
            共 {stats.totalVanity.toLocaleString()} 条已索引记录。
          </p>
        </Link>
      </section>

      <section className="pb-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">评分 Top {PAGE_SIZE}</h2>
          <Link
            href="/browse"
            className="text-sm text-zinc-400 transition-colors hover:text-gold"
          >
            浏览全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {top.map((r) => (
            <NameCard key={r.name} record={r} />
          ))}
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/browse"
            className="text-sm text-zinc-400 transition-colors hover:text-gold"
          >
            查看全部 {stats.totalVanity.toLocaleString()} 个靓号 →
          </Link>
        </p>
      </section>
    </div>
  );
}
