import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import LabelBadge from "@/components/LabelBadge";
import { getVanity, getVanityByName } from "@/lib/data";
import { formatTime, shortenAddress } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import {
  BSCSCAN_ADDRESS_URL,
  BSCSCAN_TX_URL,
  TLD,
} from "@/lib/constants";

const zh = getDict("zh");

// 不预渲染 1.2 万个详情页:按需渲染(getVanityByName 带 300s cacheLife,
// 命中即缓存),否则每次部署的产物里都带着 1.2 万页的 HTML/RSC,
// 部署存储轻松冲破 Hobby 10GB 的 Deployment Storage 上限,且每次构建要 4 分钟。
// 不设 generateStaticParams 即为按需渲染;缓存由 getVanityByName 的
// cacheLife(300s) 负责。

export async function generateMetadata(
  props: PageProps<"/name/[name]">
): Promise<Metadata> {
  const { name } = await props.params;
  const record = await getVanityByName(name);
  if (!record) return { title: zh.detail.notIndexedTitle };
  return {
    title: `${record.name}${TLD}`,
    description: `${record.name}${TLD} · ${zh.labels[record.label] ?? record.label}(${zh.detail.score} ${record.score})`,
  };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-mono text-sm text-zinc-200 sm:text-right">
        {children}
      </span>
    </div>
  );
}

async function NameDetail({
  name,
  record,
}: {
  name: string;
  record: NonNullable<Awaited<ReturnType<typeof getVanityByName>>>;
}) {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/browse"
        className="text-sm text-zinc-500 transition-colors hover:text-gold"
      >
        {t.detail.back}
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-5xl font-bold tracking-tight text-white sm:text-6xl">
          {record.name}
          <span className="text-2xl font-normal text-zinc-500">{TLD}</span>
        </h1>
        <LabelBadge label={record.label} t={t} size="lg" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm text-zinc-400">{t.detail.score}</span>
        <span className="font-mono text-2xl font-bold text-gold">
          {record.score}
        </span>
        <span className="text-sm text-zinc-600">/ 100</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {record.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg border border-gold/20 bg-gold/5 px-3 py-1 font-mono text-sm text-gold"
          >
            {tag}
          </span>
        ))}
        {record.tags.length === 0 && (
          <span className="text-sm text-zinc-500">{t.detail.noTags}</span>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-white/5 bg-panel px-5 py-2">
        <Row label={t.detail.holder}>
          <a
            href={BSCSCAN_ADDRESS_URL(record.owner)}
            target="_blank"
            rel="noreferrer"
            className="break-all text-gold/90 hover:text-gold"
            title={record.owner}
          >
            {record.owner}
          </a>
        </Row>
        <Row label={t.detail.holderShort}>
          {shortenAddress(record.owner, 8, 6)}
        </Row>
        <Row label={t.detail.tokenId}>
          <span className="break-all text-xs" title={record.tokenId}>
            {shortenAddress(record.tokenId, 10, 8)}
          </span>
        </Row>
        <Row label={t.detail.block}>
          <a
            href={`https://bscscan.com/block/${record.block}`}
            target="_blank"
            rel="noreferrer"
            className="text-gold/90 hover:text-gold"
          >
            {record.block.toLocaleString()}
          </a>
        </Row>
        <Row label={t.detail.time}>
          {formatTime(record.ts, t.check.unknown)}
        </Row>
        <Row label={t.detail.tx}>
          <a
            href={BSCSCAN_TX_URL(record.tx)}
            target="_blank"
            rel="noreferrer"
            className="break-all text-gold/90 hover:text-gold"
            title={record.tx}
          >
            {shortenAddress(record.tx, 10, 8)}
          </a>
        </Row>
      </div>
    </div>
  );
}

export default async function NamePage(props: PageProps<"/name/[name]">) {
  // 查表放在 Suspense 外:getVanityByName 走 "use cache" 不读 cookies,
  // 未收录时在此 notFound() 才能返回真正的 404 状态码(Suspense 内
  // notFound 只会流式替换内容,HTTP 状态仍是 200,成为 soft 404)。
  const { name } = await props.params;
  const record = await getVanityByName(name);
  if (!record) notFound();

  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-12 text-sm text-zinc-500">Loading…</div>}>
      <NameDetail name={name} record={record} />
    </Suspense>
  );
}
