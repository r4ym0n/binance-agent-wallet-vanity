import Link from "next/link";
import { GITHUB_URL } from "@/lib/constants";

const LINKS = [
  { href: "/", label: "首页" },
  { href: "/check", label: "靓号查询" },
  { href: "/patterns", label: "靓号规律" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold font-mono text-sm font-bold text-ink">
            AI
          </span>
          <span className="text-lg font-bold tracking-wide text-white">
            靓号
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
            className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
