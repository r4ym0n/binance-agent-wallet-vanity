# AI 靓号 · .ai 域名靓号雷达

发现与查询 BNB Chain 上 SPACE ID **Agent ID(.ai 域名)**的已注册靓号。
币安钱包(Binance Web3 Wallet)内免费 claim,本站持续索引链上注册事件,
展示靓号榜单、提供占用查询、科普靓号规律。

## 链上事实

| 项目 | 值 |
| --- | --- |
| 注册合约(NFT 本体) | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`(SPACE ID Agent ID,symbol: AI) |
| 注册事件 | `NameRegistered`,topic0 `0x663d34a86c6277aafbd5c6912c96cc5df091e6702ea3ea91b8f378adcbd8a5e5` |
| topics[1] / topics[2] | tokenId(bytes32)/ owner 地址;data 为 ABI 编码的明文域名 |
| 注册起始区块 | `128589000`(2026-10-20 上线当天) |
| 领取入口 | [币安 Web3 钱包](https://www.binance.com/zh-CN/web3wallet) |

## 技术栈

Next.js 16(App Router + Cache Components)+ TypeScript + Tailwind CSS v4,零重型依赖。

## 数据管线

`scripts/index.mjs`(Node 26,零依赖)扫描合约的 NameRegistered 事件,
用共享规则库 `src/lib/vanity.ts` 过滤靓号,产出:

- `data/vanity.json`:收录的靓号记录(按评分降序)
- `data/stats.json`:统计(区块高度、同步时间、总数、持有者数)
- `data/state.json`:索引进度

```bash
# 增量扫描(从 state.json 继续)
node scripts/index.mjs

# 只扫最近 N 块,本地快速验证
node scripts/index.mjs --blocks 2000
```

公共 RPC 限流严重,索引器内置:多节点轮询(请求间隔 ≥1.2s)、
窗口自适应(初始 4000 块,超限自动减半、成功后缓慢回升)、
单轮 6 分钟时间预算与 200 次调用上限(到点保存进度退出,留给下一轮)。

设置 `BSCSCAN_API_KEY`(见 `.env.example`,去 https://bscscan.com/apis
免费申请)后优先走 Bscscan getLogs API,无窗口限制、速度快得多。

GitHub Actions(`.github/workflows/index.yml`)每 15 分钟运行一次索引器,
有数据变更自动 commit + push(concurrency group 防并发)。

## 开发

```bash
npm install
npm run dev     # 开发
npm run build   # 构建
npx tsc --noEmit  # 类型检查
```

## 部署

推送到 main 后可直接部署到 Vercel(零配置识别 Next.js)。
数据文件在仓库内,索引 Action 每次推送都会触发重新部署,榜单随之更新。

## 免责声明

本站为非官方社区项目,与币安(Binance)、SPACE ID 无隶属关系,
不构成任何投资建议。免费 claim 以币安钱包内实际规则为准;
链上索引可能存在遗漏或延迟,注册状态请以链上记录为准。
