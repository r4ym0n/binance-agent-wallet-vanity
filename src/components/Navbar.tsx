import Link from "next/link";
import { GITHUB_URL } from "@/lib/constants";
import { getDict, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Navbar() {
  const locale: Locale = await getLocale();
  const t = getDict(locale);

  const LINKS = [
    { href: "/", label: t.nav.home },
    { href: "/grid", label: t.nav.grid },
    { href: "/browse", label: t.nav.browse },
    { href: "/check", label: t.nav.check },
    { href: "/patterns", label: t.nav.patterns },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold font-mono text-sm font-bold text-ink">
            AI
          </span>
          <span className="text-lg font-bold tracking-wide text-white">
            {t.siteName}
            <span className="ml-1 font-mono text-sm font-normal text-gold">
              .ai
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:block"
          >
            {t.nav.github}
          </a>
          <LanguageSwitcher locale={locale} t={t.langSwitcher} />
        </div>
      </nav>
    </header>
  );
}
