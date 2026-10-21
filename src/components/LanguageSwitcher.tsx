"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher({
  locale,
  t,
}: {
  locale: Locale;
  t: { zh: string; en: string; label: string };
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Locale>(locale);

  useEffect(() => {
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";
  }, [current]);

  function switchTo(next: Locale) {
    if (next === current) return;
    setCurrent(next);
    document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <div
      className="flex overflow-hidden rounded-lg border border-white/10 text-xs"
      role="group"
      aria-label={t.label}
    >
      {(["zh", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-pressed={current === l}
          className={`px-2.5 py-1.5 transition-colors ${
            current === l
              ? "bg-gold/15 text-gold"
              : "bg-white/5 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {t[l]}
        </button>
      ))}
    </div>
  );
}
