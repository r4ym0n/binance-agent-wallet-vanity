import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { analyzeName } from "@/lib/vanity";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const zh = getDict("zh");

export const metadata: Metadata = {
  title: zh.patterns.title,
  description: zh.patterns.desc,
};

function Example({
  name,
  scoreTooltip,
}: {
  name: string;
  scoreTooltip: (score: number, tags: string) => string;
}) {
  const a = analyzeName(name);
  return (
    <Link
      href={`/check?name=${name}`}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
      title={scoreTooltip(a.score, a.tags.join("、"))}
    >
      {name}
    </Link>
  );
}

export default function PatternsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-zinc-500">Loading…</div>}>
      <PatternsBody />
    </Suspense>
  );
}

async function PatternsBody() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">{t.patterns.heading}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {t.patterns.intro}
      </p>

      <div className="mt-10 space-y-4">
        {t.patterns.list.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-white/5 bg-panel p-5"
          >
            <h2 className="text-lg font-bold text-white">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {p.desc}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.examples.map((e) => (
                <Example
                  key={e}
                  name={e}
                  scoreTooltip={t.patterns.scoreTooltip}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-gold/20 bg-gold/5 p-5 text-sm leading-relaxed text-zinc-300">
        {t.patterns.footerPre}
        <Link href="/check" className="mx-1 text-gold hover:underline">
          {t.patterns.footerCheck}
        </Link>
        {t.patterns.footerMid}
        <a
          href="https://github.com/r4ym0n/binance-agent-wallet-vanity/blob/main/src/lib/vanity.ts"
          target="_blank"
          rel="noreferrer"
          className="mx-1 font-mono text-gold hover:underline"
        >
          {t.patterns.footerRepo}
        </a>
        {t.patterns.footerPost}
      </div>
    </div>
  );
}
