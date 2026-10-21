# AI 靓号星图 · .ai Vanity Atlas

发现与查询 BNB Chain 上 SPACE ID **Agent ID(.ai 域名)**的已注册靓号。
币安钱包(Binance Web3 Wallet)内免费 claim,本站持续索引链上注册事件,
用点阵地图展示规则名字全集的注册情况、提供榜单浏览与占用查询。
界面支持中文 / English,按浏览器语言自动切换,导航栏可手动切换。

## 链上事实

| 项目 | 值 |
| --- | --- |
| 注册合约(NFT 本体) | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`(SPACE ID Agent ID,symbol: AI) |
| 注册事件 | `NameRegistered`,topic0 `0x663d34a86c6277aafbd5c6912c96cc5df091e6702ea3ea91b8f378adcbd8a5e5` |
| topics[1] / topics[2] | tokenId(bytes32)/ owner 地址;data 为 ABI 编码的明文域名 |
| 注册起始区块 | `128506365`(2026-10-21 复核;合约部署于 127950748。早期曾误判为 128733522,导致漏扫 1,454 条前置注册) |
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
预算可用环境变量调整:`INDEX_MIN_INTERVAL_MS`、`INDEX_TIME_BUDGET_MS`、
`INDEX_MAX_CALLS`、`INDEX_TS_BACKFILL_CAP`(本地一次性全量补扫时调大,
例如 `INDEX_MAX_CALLS=6000 INDEX_TIME_BUDGET_MS=5400000`)。

可配置带 key 的 RPC(见 `.env.example` 的 `BSC_RPC_URLS`,多个用逗号分隔),
会排在公共节点之前优先使用。注意:BscScan/Etherscan 的免费 API key
已不覆盖 BSC(v2 统一 API 仅付费计划可用),请使用 BSC 原生 RPC 服务商
(如 [NodeReal](https://nodereal.io/) 免费层)的 key。

GitHub Actions(`.github/workflows/index.yml`)每 15 分钟运行一次索引器,
有数据变更自动 commit + push(concurrency group 防并发)。

## 页面

| 路由 | 说明 |
| --- | --- |
| `/` | 首页:统计 + 评分 Top 48 榜单(全量记录不再内联) |
| `/grid` | 靓号地图:3D / 4D 数字与 3L 字母全集点阵图,悬停查看详情,一眼发现未注册靓号 |
| `/browse` | 全部靓号:按规律筛选、前缀搜索、分页(每页 48 条) |
| `/check` | 单个名字占用查询,支持 `?name=` 预填,走 `/api/check` 按需取数 |
| `/name/[name]` | 靓号详情(ISR,全部已收录名字预渲染) |
| `/patterns` | 靓号规律与打分规则说明 |

合约最短支持 3 位名字,因此地图从 3D / 3L 起。

## i18n

`src/lib/i18n.ts` 内置 zh/en 字典(含少量带参函数,仅供服务端使用);
`src/lib/locale.ts` 负责探测(cookie `lang` 优先,其次 Accept-Language)。
因为字典含函数且 locale 依赖 cookies,所有页面采用 Suspense 包裹的
异步 Body:静态外壳预渲染,本地化内容按请求流式渲染(Partial Prerender)。
客户端组件(GridMatrix / CheckClient)接收 `locale` prop 后用 `getDict`
取字典,避免跨 RSC 边界传函数。切换语言写入 cookie 并 `router.refresh()`。

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
