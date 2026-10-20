import type { Metadata } from "next";
import Link from "next/link";
import { analyzeName } from "@/lib/vanity";

export const metadata: Metadata = {
  title: "靓号规律",
  description:
    ".ai 域名靓号打分规则科普:长度、豹子号、顺子号、回文、520/1314 寓意号,教你一眼识别好名字。",
};

interface Pattern {
  title: string;
  tag: string;
  desc: string;
  examples: string[];
}

const PATTERNS: Pattern[] = [
  {
    title: "短数字(3D / 4D / 5D …)",
    tag: "3D",
    desc: "纯数字越短越稀缺:3 位以内 +50 分,4 位 +40 分,依此类推。总共只有 1000 个三位数,先到先得。",
    examples: ["403", "888", "520"],
  },
  {
    title: "短字母(3L / 4L)",
    tag: "3L",
    desc: "纯字母短名同样是硬通货:3 位以内 +45 分,4 位 +30 分。",
    examples: ["abc", "ai", "nft"],
  },
  {
    title: "豹子号(AAAA / AAA)",
    tag: "AAAA",
    desc: "四位全同 +25 分,三位全同 +15 分。8888、666 这类号码在华人圈历来是顶流。",
    examples: ["8888", "6666", "999"],
  },
  {
    title: "对子号(ABAB / AABB / ABBA)",
    tag: "ABAB",
    desc: "ABAB +18 分,AABB 与 ABBA 各 +12 分,读起来有节奏感的组合都很抢手。",
    examples: ["1212", "8899", "1001"],
  },
  {
    title: "循环号(ABCABC)",
    tag: "ABCABC",
    desc: "六位数字前后各三位相同 +14 分,例如 123123。",
    examples: ["123123", "456456"],
  },
  {
    title: "顺子 / 倒序",
    tag: "顺子",
    desc: "连续递增 3 位以上 +20 分,连续递减 +18 分。1234、4321 这类名字一眼难忘。",
    examples: ["1234", "6789", "4321"],
  },
  {
    title: "回文",
    tag: "回文",
    desc: "正着读反着读都一样 +18 分,例如 1221、level。",
    examples: ["1221", "level", "6996"],
  },
  {
    title: "寓意号(520 / 1314 / 168)",
    tag: "520",
    desc: "520(我爱你)+10 分,1314(一生一世)+10 分,168(一路发)+8 分;含 888 +6 分,含 666 +4 分。",
    examples: ["520", "1314", "1688"],
  },
  {
    title: "年份号",
    tag: "年份",
    desc: "1990-2029 的年份 +6 分:生日、纪念日、重要年份,专属感极强。",
    examples: ["2000", "2026", "1997"],
  },
];

function Example({ name }: { name: string }) {
  const a = analyzeName(name);
  return (
    <Link
      href={`/check`}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold"
      title={`评分 ${a.score} · ${a.tags.join("、") || "无标签"}`}
    >
      {name}
    </Link>
  );
}

export default function PatternsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">靓号规律科普</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        本站用一套公开透明的规则给每个 .ai 名字打分(0-100),分数越高名字越靓。
        评级分五档:80 分以上「极品」、60 分以上「罕见」、40 分以上「精品」、
        20 分以上「优质」,其余为「普通」。名字里带连字符 - 会扣 10 分。
        以下是各类规律的定义与示例(悬停示例可看到实时打分)。
      </p>

      <div className="mt-10 space-y-4">
        {PATTERNS.map((p) => (
          <div
            key={p.tag}
            className="rounded-xl border border-white/5 bg-panel p-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-white">{p.title}</h2>
              <span className="rounded bg-gold/10 px-2 py-0.5 font-mono text-xs text-gold">
                {p.tag}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {p.desc}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.examples.map((e) => (
                <Example key={e} name={e} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-gold/20 bg-gold/5 p-5 text-sm leading-relaxed text-zinc-300">
        想查某个名字值多少分、有没有被注册?去
        <Link href="/check" className="mx-1 text-gold hover:underline">
          靓号查询
        </Link>
        输入即可;全部打分逻辑开源在
        <a
          href="https://github.com/r4ym0n/binance-agent-wallet-vanity/blob/main/src/lib/vanity.ts"
          target="_blank"
          rel="noreferrer"
          className="mx-1 text-gold hover:underline"
        >
          src/lib/vanity.ts
        </a>
        。
      </div>
    </div>
  );
}
