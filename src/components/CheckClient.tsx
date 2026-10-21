"use client";

import { useState } from "react";
import Link from "next/link";
import LabelBadge from "./LabelBadge";
import {
  BINANCE_WALLET_URL,
  BSCSCAN_TOKEN_URL,
  NAME_PATTERN,
  TLD,
} from "@/lib/constants";
import { shortenAddress } from "@/lib/format";
import type { VanityRecord } from "@/lib/data";
import { getDict, type Locale } from "@/lib/i18n";

export default function CheckClient({
  locale,
  initialName = "",
}: {
  locale: Locale;
  initialName?: string;
}) {
  const t = getDict(locale);
  const [input, setInput] = useState(initialName);
  const [checked, setChecked] = useState(initialName.trim() !== "");
  const [record, setRecord] = useState<VanityRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const name = input.trim().toLowerCase().replace(/\.ai$/, "");
  const valid = NAME_PATTERN.test(name);

  async function handleCheck() {
    if (!valid || !name) return;
    setChecked(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/check?name=${encodeURIComponent(name)}`);
      const data = (await res.json()) as { record: VanityRecord | null };
      setRecord(data.record);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setChecked(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder={t.check.placeholder}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg text-white placeholder:text-sm placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-lg text-zinc-500">
            {TLD}
          </span>
        </div>
        <button
          onClick={handleCheck}
          disabled={!valid || !name || loading}
          className="rounded-lg bg-gold px-6 py-3 font-medium text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {loading ? t.check.loading : t.check.submit}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">{t.check.inputHint}</p>

      {!valid && input.trim() !== "" && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {t.check.invalid}
        </p>
      )}

      {checked && valid && !loading && record && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-3xl font-bold text-gold">
              {record.name}
              <span className="text-lg font-normal text-zinc-500">{TLD}</span>
            </span>
            <LabelBadge label={record.label} t={t} />
          </div>
          <p className="mt-3 text-sm text-zinc-300">
            {t.check.registered}
            {record.ts
              ? ` · ${new Date(record.ts * 1000).toLocaleString("zh-CN", {
                  timeZone: "UTC",
                })} UTC`
              : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {t.check.holder}
            <span className="ml-1 font-mono text-xs">
              {shortenAddress(record.owner, 8, 6)}
            </span>
            <span className="ml-2 text-gold/80">
              {t.check.scoreSuffix} {record.score}
            </span>
          </p>
          <Link
            href={`/name/${record.name}`}
            className="mt-4 inline-block rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
          >
            {t.check.viewDetail}
          </Link>
        </div>
      )}

      {checked && valid && !loading && !record && (
        <div className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-6">
          <div className="font-mono text-3xl font-bold text-white">
            {name}
            <span className="text-lg font-normal text-zinc-500">{TLD}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {t.check.notIndexed}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={BSCSCAN_TOKEN_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5"
            >
              {t.check.verifyChain}
            </a>
            <a
              href={BINANCE_WALLET_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              {t.check.claim}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
