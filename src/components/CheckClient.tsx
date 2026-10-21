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

export default function CheckClient({
  initialName = "",
}: {
  initialName?: string;
}) {
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
            placeholder={`输入靓号名字,如 888(无需输入 ${TLD})`}
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
          {loading ? "查询中…" : "查询"}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        仅支持小写字母、数字与连字符,1-32 位。
      </p>

      {!valid && input.trim() !== "" && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          输入格式不正确:{TLD}
          域名只包含小写字母 a-z、数字 0-9 与连字符 -,长度 1-32 位。
        </p>
      )}

      {checked && valid && !loading && record && (
        <div className="mt-6 rounded-xl border border-gold/30 bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-3xl font-bold text-gold">
              {record.name}
              <span className="text-lg font-normal text-zinc-500">{TLD}</span>
            </span>
            <LabelBadge label={record.label} />
          </div>
          <p className="mt-3 text-sm text-zinc-300">
            已被注册
            {record.ts
              ? ` · ${new Date(record.ts * 1000).toLocaleString("zh-CN", {
                  timeZone: "UTC",
                })} UTC`
              : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            持有者:
            <span className="ml-1 font-mono text-xs">
              {shortenAddress(record.owner, 8, 6)}
            </span>
            <span className="ml-2 text-gold/80">评分 {record.score}</span>
          </p>
          <Link
            href={`/name/${record.name}`}
            className="mt-4 inline-block rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
          >
            查看完整详情 →
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
            暂未收录,有可能还可以抢注!本站索引只收录靓号相关名字,
            普通名字未收录不代表仍可注册,请以下方链上查询为准。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={BSCSCAN_TOKEN_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5"
            >
              去 Bscscan 验证链上记录
            </a>
            <a
              href={BINANCE_WALLET_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold/90"
            >
              去币安钱包领取
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
