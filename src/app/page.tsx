import type { Metadata } from "next";
import Link from "next/link";
import VanityExplorer from "@/components/VanityExplorer";
import { getStats, getVanity } from "@/lib/data";
import { formatSyncTime } from "@/lib/format";
import { BINANCE_WALLET_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: ".ai 靓号雷达",
  description:
    "发现币安钱包 × SPACE ID Agent ID(.ai 域名)已注册的靓号:短号、豹子号、顺子号、520/1314 寓意号,支持筛选与查询。",
};

export default async function Home() {
  const [stats, vanity] = await Promise.all([getStats(), getVanity()]);

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
          这里持续索引链上注册事件,帮你发现已被抢走的靓号、查询心仪名字是否还在。
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

      <section className="pb-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">靓号榜单</h2>
          <Link
            href="/patterns"
            className="text-sm text-zinc-400 transition-colors hover:text-gold"
          >
            靓号是怎么打分的?→
          </Link>
        </div>
        <VanityExplorer records={vanity} />
      </section>
    </div>
  );
}
