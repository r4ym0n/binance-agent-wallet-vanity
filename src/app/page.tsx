import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NameCard from "@/components/NameCard";
import { PAGE_SIZE, browseVanity } from "@/lib/browse";
import { getStats, getVanity } from "@/lib/data";
import { formatSyncTime } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { BINANCE_WALLET_URL } from "@/lib/constants";

const zh = getDict("zh");

export const metadata: Metadata = {
  title: zh.siteNameFull,
  description: zh.meta.defaultDesc,
};

export default function Home() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-zinc-500">Loading…</div>}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  const locale = await getLocale();
  const t = getDict(locale);
  const [stats, vanity] = await Promise.all([getStats(), getVanity()]);
  const top = browseVanity(vanity, {
    filter: "all",
    q: "",
    sort: "score",
    page: 1,
  }).items;

  const statItems = [
    { value: stats.totalVanity, label: t.home.statVanity },
    { value: stats.totalOwners, label: t.home.statOwners },
    { value: stats.lastIndexedBlock.toLocaleString(), label: t.home.statBlock },
    { value: formatSyncTime(stats.lastSync, t.check.unknown), label: t.home.statSync },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-14 text-center sm:py-20">
        <p className="mb-3 font-mono text-sm tracking-widest text-gold">
          {t.siteTagline}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {t.siteNameFull}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
          {t.home.heroDesc}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={BINANCE_WALLET_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-gold px-6 py-3 font-medium text-ink transition-colors hover:bg-gold/90"
          >
            {t.home.claimCta}
          </a>
          <Link
            href="/check"
            className="rounded-lg border border-white/15 px-6 py-3 text-zinc-200 transition-colors hover:bg-white/5"
          >
            {t.home.checkCta}
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
              {t.home.gridCardTitle}
            </h2>
            <span className="text-gold transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {t.home.gridCardDesc}
          </p>
        </Link>
        <Link
          href="/browse"
          className="group rounded-2xl border border-white/10 bg-panel p-6 transition-colors hover:border-gold/40"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white group-hover:text-gold">
              {t.home.browseCardTitle}
            </h2>
            <span className="text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-gold">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {t.home.browseCardDesc}
          </p>
        </Link>
      </section>

      <section className="pb-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">
            {t.home.topTitle} {PAGE_SIZE}
          </h2>
          <Link
            href="/browse"
            className="text-sm text-zinc-400 transition-colors hover:text-gold"
          >
            {t.home.browseAll}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {top.map((r) => (
            <NameCard key={r.name} record={r} t={t} />
          ))}
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/browse"
            className="text-sm text-zinc-400 transition-colors hover:text-gold"
          >
            {t.home.viewAll(stats.totalVanity.toLocaleString(locale === "zh" ? "zh-CN" : "en-US"))}
          </Link>
        </p>
      </section>
    </div>
  );
}
