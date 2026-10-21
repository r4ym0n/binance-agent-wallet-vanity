import Link from "next/link";
import { Suspense } from "react";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <NotFoundBody />
    </Suspense>
  );
}

async function NotFoundBody() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">
        {t.notFound.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        {t.notFound.desc}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-gold px-5 py-2.5 font-medium text-ink transition-colors hover:bg-gold/90"
        >
          {t.notFound.backHome}
        </Link>
        <Link
          href="/check"
          className="rounded-lg border border-white/15 px-5 py-2.5 text-zinc-200 transition-colors hover:bg-white/5"
        >
          {t.notFound.goCheck}
        </Link>
      </div>
    </div>
  );
}
