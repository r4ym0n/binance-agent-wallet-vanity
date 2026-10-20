import {
  BSCSCAN_TOKEN_URL,
  CONTRACT_ADDRESS,
  GITHUB_URL,
} from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-black/30">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-zinc-500">
        <div>
          数据来自 BNB Chain 链上索引(SPACE ID Agent ID 注册合约
          <a
            href={BSCSCAN_TOKEN_URL}
            target="_blank"
            rel="noreferrer"
            className="mx-1 font-mono text-xs text-gold/80 hover:text-gold"
          >
            {CONTRACT_ADDRESS}
          </a>
          的 NameRegistered 事件),同步可能有数分钟延迟。
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gold"
          >
            开源代码与索引器(GitHub)
          </a>
          <a
            href={BSCSCAN_TOKEN_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gold"
          >
            Bscscan 合约页
          </a>
        </div>
        <p className="text-xs leading-relaxed text-zinc-600">
          免责声明:本站为非官方社区项目,与币安(Binance)、SPACE ID
          无隶属关系,不构成任何投资建议。免费 claim 活动以币安钱包内实际规则为准;
          链上数据索引可能存在遗漏或延迟,注册状态请以链上记录为准。
        </p>
      </div>
    </footer>
  );
}
