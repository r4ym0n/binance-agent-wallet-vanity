import type { Metadata } from "next";
import { Suspense } from "react";
import GridMatrix from "@/components/GridMatrix";
import { getVanity } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const zh = getDict("zh");

export const metadata: Metadata = {
  title: zh.grid.title,
  description: zh.grid.desc,
};

function base26Name(i: number): string {
  let s = "";
  let n = i;
  for (let k = 0; k < 3; k++) {
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

export default function GridPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-zinc-500">Loading…</div>}>
      <GridBody />
    </Suspense>
  );
}

async function GridBody() {
  const [locale, vanity] = await Promise.all([getLocale(), getVanity()]);
  const t = getDict(locale);

  const gen =
    locale === "zh"
      ? [
          { key: "3D", label: "3D 数字", desc: "000–999(1,000)" },
          { key: "4D", label: "4D 数字", desc: "0000–9999(10,000)" },
          { key: "3L", label: "3L 字母", desc: "aaa–zzz(17,576)" },
        ]
      : [
          { key: "3D", label: t.grid.cat3D, desc: "000–999 (1,000)" },
          { key: "4D", label: t.grid.cat4D, desc: "0000–9999 (10,000)" },
          { key: "3L", label: t.grid.cat3L, desc: "aaa–zzz (17,576)" },
        ];

  const categories = [
    { ...gen[0], size: 1000, cell: 16, gap: 3 },
    { ...gen[1], size: 10000, cell: 8, gap: 2 },
    { ...gen[2], size: 17576, cell: 7, gap: 2 },
  ];

  // 只传三个全集内已注册的名字用于着色(约 5k 个字符串,~25KB);
  // 悬停详情由客户端按需请求 /api/name-detail,不再内联进页面
  const inSpace = (name: string) =>
    /^[0-9]{3}$/.test(name) ||
    /^[0-9]{4}$/.test(name) ||
    /^[a-z]{3}$/.test(name);
  const registered = vanity.filter((r) => inSpace(r.name)).map((r) => r.name);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">{t.grid.title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {t.grid.intro}
      </p>
      <div className="mt-6">
        <GridMatrix categories={categories} registered={registered} locale={locale} />
      </div>
    </div>
  );
}
