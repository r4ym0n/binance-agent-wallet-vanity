import type { Metadata } from "next";
import GridMatrix from "@/components/GridMatrix";
import { getVanity } from "@/lib/data";

export const metadata: Metadata = {
  title: "靓号地图",
  description:
    "3D / 4D 数字与 3L 字母 .ai 域名全集点阵图:金色已注册、暗色未注册,一眼发现还没被抢走的靓号。",
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

export default async function GridPage() {
  const vanity = await getVanity();
  const registered = new Set(vanity.map((r) => r.name));

  const inNamespace = (size: number, gen: (i: number) => string) => {
    const list: string[] = [];
    for (let i = 0; i < size; i++) {
      const name = gen(i);
      if (registered.has(name)) list.push(name);
    }
    return list;
  };

  const categories = [
    {
      key: "3D",
      label: "3D 数字",
      desc: "000–999",
      size: 1000,
      registered: inNamespace(1000, (i) => String(i).padStart(3, "0")),
      cell: 16,
      gap: 3,
    },
    {
      key: "4D",
      label: "4D 数字",
      desc: "0000–9999",
      size: 10000,
      registered: inNamespace(10000, (i) => String(i).padStart(4, "0")),
      cell: 8,
      gap: 2,
    },
    {
      key: "3L",
      label: "3L 字母",
      desc: "aaa–zzz",
      size: 17576,
      registered: inNamespace(17576, base26Name),
      cell: 7,
      gap: 2,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white">靓号地图</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        规则名字的「全集扫雷图」:每个格子是一个候选名字。金色 = 已被注册,暗色 =
        还有机会,开启「高亮未注册」可以只突出空缺。点格子直接跳转详情或领取页。
      </p>
      <div className="mt-6">
        <GridMatrix categories={categories} />
      </div>
    </div>
  );
}
