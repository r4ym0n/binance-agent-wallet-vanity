import type { Metadata } from "next";
import { Suspense } from "react";
import CheckClient from "@/components/CheckClient";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const zh = getDict("zh");

export const metadata: Metadata = {
  title: zh.check.title,
  description: zh.check.desc,
};

export default function CheckPage(props: PageProps<"/check">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-zinc-500">Loading…</div>}>
      <CheckBody {...props} />
    </Suspense>
  );
}

async function CheckBody(props: PageProps<"/check">) {
  const [locale, sp] = await Promise.all([getLocale(), props.searchParams]);
  const t = getDict(locale);
  const initial = typeof sp.name === "string" ? sp.name : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">{t.check.heading}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.check.subheading}</p>
      </div>
      <CheckClient locale={locale} initialName={initial} />
      <p className="mx-auto mt-10 max-w-2xl rounded-xl border border-white/5 bg-panel p-4 text-xs leading-relaxed text-zinc-500">
        {t.check.notIndexed}
      </p>
    </div>
  );
}
