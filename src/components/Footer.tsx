import {
  BSCSCAN_TOKEN_URL,
  CONTRACT_ADDRESS,
  GITHUB_URL,
} from "@/lib/constants";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function Footer() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <footer className="mt-16 border-t border-white/5 bg-black/30">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-zinc-500">
        <div>
          {t.footer.dataPrefix}
          <a
            href={BSCSCAN_TOKEN_URL}
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-mono text-xs text-gold/80 hover:text-gold"
          >
            {CONTRACT_ADDRESS}
          </a>
          {t.footer.dataSuffix}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gold"
          >
            {t.footer.source}
          </a>
          <a
            href={BSCSCAN_TOKEN_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gold"
          >
            {t.footer.contract}
          </a>
        </div>
        <p className="text-xs leading-relaxed text-zinc-600">
          {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
