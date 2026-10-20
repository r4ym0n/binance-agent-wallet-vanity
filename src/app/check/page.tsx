import type { Metadata } from "next";
import CheckClient from "@/components/CheckClient";
import { getVanity } from "@/lib/data";

export const metadata: Metadata = {
  title: "靓号查询",
  description:
    "查询心仪的 .ai 域名靓号是否已被注册:输入名字,即刻匹配链上索引结果。",
};

export default async function CheckPage() {
  const vanity = await getVanity();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">靓号查询</h1>
        <p className="mt-2 text-sm text-zinc-400">
          输入你想要的名字,看看有没有被人抢走。
        </p>
      </div>
      <CheckClient records={vanity} />
      <p className="mx-auto mt-10 max-w-2xl rounded-xl border border-white/5 bg-panel p-4 text-xs leading-relaxed text-zinc-500">
        说明:本站索引只收录「靓号相关」名字(短位、纯数字、规律组合等),
        未收录不代表仍可注册。最终结果请以下方链上记录为准:
        所有 .ai 域名都是 SPACE ID Agent ID 合约下的 NFT,可在 Bscscan
        上查看全部注册记录;领取请前往币安 Web3 钱包。
      </p>
    </div>
  );
}
