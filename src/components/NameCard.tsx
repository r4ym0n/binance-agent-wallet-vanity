import Link from "next/link";
import LabelBadge from "./LabelBadge";
import { shortenAddress } from "@/lib/format";
import type { VanityRecord } from "@/lib/data";

export default function NameCard({ record }: { record: VanityRecord }) {
  return (
    <Link
      href={`/name/${record.name}`}
      className="group flex flex-col gap-3 rounded-xl border border-white/5 bg-panel p-4 transition-all hover:border-gold/40 hover:bg-panel/80"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate font-mono text-2xl font-bold tracking-tight text-white group-hover:text-gold">
          {record.name}
          <span className="text-sm font-normal text-zinc-500">.ai</span>
        </span>
        <LabelBadge label={record.label} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {record.tags.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400"
          >
            {t}
          </span>
        ))}
        {record.tags.length === 0 && (
          <span className="text-[11px] text-zinc-600">短位靓号</span>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
        <span className="font-mono" title={record.owner}>
          {shortenAddress(record.owner)}
        </span>
        <span className="font-mono text-gold/80">{record.score} 分</span>
      </div>
    </Link>
  );
}
