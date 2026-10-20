#!/usr/bin/env node
// .ai 靓号索引器:扫描 SPACE ID Agent ID 注册合约的 NameRegistered 事件,
// 用共享规则库过滤靓号,产出 data/vanity.json 与 data/stats.json。
//
// 用法:
//   node scripts/index.mjs            # 增量扫描(从 state.json 记录处继续)
//   node scripts/index.mjs --blocks N # 只扫最近 N 块(本地验证用,不回写 lastIndexedBlock)
//
// 环境变量:
//   BSC_RPC_URLS 可选;逗号分隔的付费/免费 key RPC 列表(如 OKX NodeOne、NodeReal、Ankr),
//   会排在公共节点之前,且每个请求优先尝试。注意:BscScan/Etherscan 的免费 API key 已不覆盖 BSC。
//   INDEX_MIN_INTERVAL_MS   请求间隔(默认 1200)
//   INDEX_TIME_BUDGET_MS    单轮时间预算(默认 6 分钟;本地全量补扫可调大)
//   INDEX_MAX_CALLS         单轮 RPC 调用上限(默认 200;本地全量补扫可调大)
//   INDEX_TS_BACKFILL_CAP   单轮时间戳补录块数上限(默认 60)
//
// 公共 RPC 限流严重,索引器多节点兜底;OKX NodeOne 特性:拒绝单块查询、空结果回 403、
// 按响应大小限流——均已适配(最小窗口 2、交易数探针区分空结果与真超限)。

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const VANITY_FILE = path.join(DATA_DIR, "vanity.json");
const STATS_FILE = path.join(DATA_DIR, "stats.json");

const CONTRACT = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";
const NAME_REGISTERED_TOPIC =
  "0x663d34a86c6277aafbd5c6912c96cc5df091e6702ea3ea91b8f378adcbd8a5e5";
// 首个注册区块在 (128583743, 128589138] 之间(OKX 空窗 403 二分定位下界,
// 128589138 是已验证 claim 交易所在块);取 128584000 留少量前缀余量,
// 如需更早可前移并删除 data/state.json 重扫
const START_BLOCK = 128584000;

// BSC_RPC_URLS 环境变量里的节点(带 key 的付费/免费层)排在最前优先使用
const RPCS = [
  ...(process.env.BSC_RPC_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-rpc.publicnode.com",
  "https://binance.llamarpc.com",
  "https://bsc.drpc.org",
  "https://bsc-mainnet.public.blastapi.io",
];

const MIN_INTERVAL_MS = Number(process.env.INDEX_MIN_INTERVAL_MS || 1200); // 请求间隔下限
const TIME_BUDGET_MS = Number(process.env.INDEX_TIME_BUDGET_MS || 6 * 60 * 1000); // 单轮时间预算
const MAX_CALLS = Number(process.env.INDEX_MAX_CALLS || 200); // 单轮 RPC 调用次数上限
const RPC_TIMEOUT_MS = 20000;
const MAX_WINDOW = 10000;
const INITIAL_WINDOW = 4000;
const MIN_WINDOW = 2; // 部分网关(如 OKX NodeOne)拒绝 fromBlock==toBlock 的单块查询
const TS_BACKFILL_CAP = Number(process.env.INDEX_TS_BACKFILL_CAP || 60); // 时间戳补录最多查多少个块
const HOLE_SKIP_THRESHOLD = 40; // 连续多少个最小窗口被跳过(无一次成功),判定为"洞"
const HOLE_JUMP = 50000; // 判洞后向前跳跃的块数,洞记入 state.holes 待后续回填

// 规则库:优先直接 import 共享的 TS(Node 26 原生 type stripping);
// 若失败则退化为下方复制的同逻辑实现,保证脚本始终可运行。
let analyzeName;
let isVanityRelevant;
try {
  ({ analyzeName, isVanityRelevant } = await import("../src/lib/vanity.ts"));
  log("已加载共享规则库 src/lib/vanity.ts");
} catch (e) {
  log(`import ../src/lib/vanity.ts 失败(${e.message}),退化为脚本内置副本`);
  ({ analyzeName, isVanityRelevant } = vanityFallback());
}

function vanityFallback() {
  // 与 src/lib/vanity.ts 保持一致的精简副本(仅在此文件内维护,改动需同步)。
  const labelOf = (s) =>
    s >= 80 ? "极品" : s >= 60 ? "罕见" : s >= 40 ? "精品" : s >= 20 ? "优质" : "普通";
  const analyzeName = (name) => {
    const tags = [];
    let score = 0;
    const len = name.length;
    const digitsOnly = /^[0-9]+$/.test(name);
    const lettersOnly = /^[a-z]+$/.test(name);
    const alnumOnly = /^[a-z0-9]+$/.test(name);
    if (digitsOnly) {
      if (len <= 3) { score += 50; tags.push("3D"); }
      else if (len === 4) { score += 40; tags.push("4D"); }
      else if (len === 5) { score += 30; tags.push("5D"); }
      else if (len === 6) { score += 22; tags.push("6D"); }
      else if (len === 7) { score += 16; tags.push("7D"); }
      else if (len === 8) { score += 10; tags.push("8D"); }
    } else if (lettersOnly) {
      if (len <= 3) { score += 45; tags.push("3L"); }
      else if (len === 4) { score += 30; tags.push("4L"); }
    } else if (alnumOnly && len <= 4) {
      score += len <= 3 ? 35 : 18;
      tags.push("4N");
    }
    const uniform = (s) => s.split("").every((c) => c === s[0]);
    let matchedAbba = false;
    if ((digitsOnly || lettersOnly) && len >= 2) {
      if (len >= 4 && uniform(name)) { score += 25; tags.push("AAAA"); }
      else if (len >= 3 && uniform(name)) { score += 15; tags.push("AAA"); }
      else if (len === 4) {
        const [a, b, c, d] = name.split("");
        if (a === c && b === d && a !== b) { score += 18; tags.push("ABAB"); }
        if (a === b && c === d && a !== c) { score += 12; tags.push("AABB"); }
        if (a === d && b === c && a !== b) { score += 12; tags.push("ABBA"); matchedAbba = true; }
      }
      if (len === 6 && name.slice(0, 3) === name.slice(3)) { score += 14; tags.push("ABCABC"); }
      if (digitsOnly && len >= 3) {
        const ds = name.split("").map(Number);
        const inc = ds.every((v, i) => i === 0 || v === ds[i - 1] + 1);
        const dec = ds.every((v, i) => i === 0 || v === ds[i - 1] - 1);
        if (inc) { score += 20; tags.push("顺子"); }
        else if (dec) { score += 18; tags.push("倒序"); }
      }
      const rev = name.split("").reverse().join("");
      if (len >= 3 && name === rev && !uniform(name) && !matchedAbba) { score += 18; tags.push("回文"); }
    }
    if (name.includes("520")) { score += 10; tags.push("520"); }
    if (name.includes("1314")) { score += 10; tags.push("1314"); }
    if (name.includes("168")) { score += 8; tags.push("168"); }
    if (name.includes("888")) { score += 6; tags.push("含888"); }
    if (name.includes("666")) { score += 4; tags.push("含666"); }
    if (/^(19|20)\d{2}$/.test(name)) {
      const y = Number(name);
      if (y >= 1990 && y <= 2029) { score += 6; tags.push("年份"); }
    }
    if (name === "42") { score += 10; tags.push("42"); }
    if (name.includes("-")) score -= 10;
    score = Math.max(0, Math.min(100, score));
    return { score, tags, label: labelOf(score) };
  };
  const isVanityRelevant = (name) => {
    if (name.length <= 5) return true;
    if (/^[0-9]+$/.test(name) && name.length <= 8) return true;
    return analyzeName(name).score >= 20;
  };
  return { analyzeName, isVanityRelevant };
}

// ---------- 工具 ----------

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastRequestAt = 0;
let callCount = 0;

async function throttle() {
  const now = Date.now();
  const wait = lastRequestAt + MIN_INTERVAL_MS - now;
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

class LimitError extends Error {}

let rpcIdx = 0;
// 节点对 eth_getLogs 的连续失败计数;钱包级 RPC(如 OKX NodeOne)可能整体关闭
// getLogs(任何窗口都回 params check error),检测后将其移出日志查询轮询,
// 但保留给 getBlockByNumber/getBlockReceipts 等查询使用。
const logsDead = new Set();
const logsFailStreak = new Map();
const LOGS_DEAD_THRESHOLD = 5;

async function rpcCall(method, params) {
  let lastErr;
  const eligible = RPCS.filter((u) => method !== "eth_getLogs" || !logsDead.has(u));
  if (eligible.length === 0) throw new Error("所有节点的 eth_getLogs 均不可用");
  for (let attempt = 0; attempt < eligible.length; attempt++) {
    if (callCount >= MAX_CALLS) throw new Error("调用次数已达上限");
    // 首次尝试固定用列表第一位(env 配置的优先节点),仅失败后才轮询其它节点
    const url =
      attempt === 0
        ? eligible[0]
        : eligible[(rpcIdx++ % (eligible.length - 1)) + 1];
    await throttle();
    callCount++;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: callCount,
          method,
          params,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      // 部分网关(如 OKX NodeOne)对空结果或超限结果直接回非 2xx + 纯文本 message,
      // 没有 jsonrpc error 结构;必须显式检查,否则会当成"无日志"静默跳过数据。
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error(`HTTP ${res.status}: 非 JSON 响应`);
      }
      if (!res.ok) {
        const msg = String(
          json.message || json.error?.message || (typeof json.error === "string" ? json.error : "") ||
            `HTTP ${res.status}`
        );
        if (/params check error|check error|limit exceeded|result too large|too many|exceed/i.test(msg)) {
          throw new LimitError(msg);
        }
        throw new Error(`HTTP ${res.status}: ${msg}`);
      }
      if (json.error) {
        const msg = String(json.error.message || "");
        if (/limit exceeded|result too large|max|range|window|too many|more than|exceed/i.test(msg)) {
          throw new LimitError(msg);
        }
        throw new Error(`RPC ${json.error.code}: ${msg}`);
      }
      if (method === "eth_getLogs") logsFailStreak.delete(url); // 成功则清零
      return json.result;
    } catch (e) {
      lastErr = e;
      log(`RPC 节点失败 [${new URL(url).host}] ${method}: ${e.message}`);
      if (method === "eth_getLogs") {
        if (e instanceof LimitError && /params check error|check error/i.test(e.message)) {
          const streak = (logsFailStreak.get(url) || 0) + 1;
          logsFailStreak.set(url, streak);
          if (streak >= LOGS_DEAD_THRESHOLD && !logsDead.has(url)) {
            logsDead.add(url);
            log(`节点 ${new URL(url).host} 连续 ${streak} 次拒绝 eth_getLogs,移出日志查询轮询`);
          }
        } else if (!(e instanceof LimitError)) {
          logsFailStreak.delete(url); // 偶发网络错误不累计
        }
      }
      // 限窗错误:各节点上限不同(dataseed 可能卡在窗口 2,drpc 能到 10000),
      // 先轮询完剩余节点;全部拒绝才向上抛 LimitError 让窗口自适应减半
      if (e instanceof LimitError) continue;
    }
  }
  throw lastErr || new Error("所有 RPC 节点均失败");
}

// ---------- 日志解析 ----------

function topicToAddress(topic) {
  // topics[2] 是 32 字节地址(左填充 12 字节)
  return "0x" + topic.slice(26).toLowerCase();
}

function dataToString(data) {
  // ABI 编码 string:offset(32B) + length(32B) + utf8 数据
  const buf = Buffer.from(data.replace(/^0x/, ""), "hex");
  if (buf.length < 64) return null;
  const offset = Number(BigInt("0x" + buf.subarray(0, 32).toString("hex")));
  const len = Number(BigInt("0x" + buf.subarray(offset, offset + 32).toString("hex")));
  const strBuf = buf.subarray(offset + 32, offset + 32 + len);
  if (strBuf.length < len) return null;
  return strBuf.toString("utf8");
}

function normalizeLog(raw) {
  // bscscan 返回 blockNumber/transactionHash 等带 0x 前缀字符串
  const topics = raw.topics;
  if (!topics || topics.length < 3) return null;
  if (topics[0].toLowerCase() !== NAME_REGISTERED_TOPIC) return null;
  const name = dataToString(raw.data);
  if (!name || !/^[a-z0-9-]{1,32}$/.test(name)) return null;
  const block = parseInt(raw.blockNumber, 16);
  const tx = (raw.transactionHash || "").toLowerCase();
  const tokenId = topics[1].toLowerCase();
  const owner = topicToAddress(topics[2].toLowerCase());
  if (!tx || !owner.startsWith("0x")) return null;
  // OKX NodeOne 的日志响应自带 blockTimestamp 扩展字段,有则省去逐块查时间戳
  const ts =
    typeof raw.blockTimestamp === "string" && raw.blockTimestamp.startsWith("0x")
      ? parseInt(raw.blockTimestamp, 16)
      : null;
  return { name, owner, tokenId, block, tx, ts };
}

// ---------- 主流程 ----------

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function saveJson(file, value) {
  await writeFile(file, JSON.stringify(value, null, 2) + "\n");
}

async function fetchHeadBlock() {
  const hex = await rpcCall("eth_blockNumber", []);
  return parseInt(hex, 16);
}

async function fetchBlockTimestamp(blockNumber) {
  const block = await rpcCall("eth_getBlockByNumber", [
    "0x" + blockNumber.toString(16),
    false,
  ]);
  if (!block || !block.timestamp) return null;
  return parseInt(block.timestamp, 16);
}

const startedAt = Date.now();
const recentOnly = process.argv.includes("--blocks");
const blocksArgIdx = process.argv.indexOf("--blocks");
const recentBlocks =
  blocksArgIdx > -1 ? parseInt(process.argv[blocksArgIdx + 1], 10) : 0;

let state = await loadJson(STATE_FILE, {
  lastIndexedBlock: START_BLOCK - 1,
  scannedUntil: START_BLOCK - 1,
  holes: [],
});
let holes = Array.isArray(state.holes) ? state.holes.filter((h) => Array.isArray(h) && h.length === 2) : [];
let vanity = await loadJson(VANITY_FILE, []);
if (!Array.isArray(vanity)) vanity = [];

// name -> 记录;同名保留最早注册者(最早 block)
const byName = new Map();
for (const rec of vanity) byName.set(rec.name, rec);

let newNames = 0;
let scannedLogs = 0;

function absorbLogs(logs) {
  for (const raw of logs) {
    scannedLogs++;
    const rec = normalizeLog(raw);
    if (!rec) continue;
    if (!isVanityRelevant(rec.name)) continue;
    const analysis = analyzeName(rec.name);
    const entry = { ...rec, score: analysis.score, tags: analysis.tags, label: analysis.label };
    const prev = byName.get(entry.name);
    if (prev && entry.ts == null && prev.ts != null) entry.ts = prev.ts; // 不覆盖已有时间戳
    if (!prev) {
      byName.set(entry.name, entry);
      newNames++;
    } else if (entry.block < prev.block) {
      // 同名重复注册:保留先注册者,但仍以最新规则重算
      byName.set(entry.name, { ...prev, ...entry });
    } else {
      byName.set(entry.name, { ...prev, score: entry.score, tags: entry.tags, label: entry.label });
    }
  }
}

// 跳过已知洞(曾经无法扫描的区段),避免每轮在洞上重复消耗调用
function skipHoles(cur, holes) {
  let c = cur;
  let moved = true;
  while (moved) {
    moved = false;
    for (const h of holes) {
      if (c >= h[0] && c <= h[1]) {
        c = h[1] + 1;
        moved = true;
      }
    }
  }
  return c;
}

async function scanRange(fromBlock, toBlock, holes = []) {
  let window = INITIAL_WINDOW;
  const txCountCache = new Map(); // 探针结果缓存,减半重试时避免重复查询同一块
  const newHoles = [];
  let floorSkips = 0; // 连续"最小窗口仍无法扫描"次数,达到阈值判洞
  let holeStart = null;
  let cur = skipHoles(fromBlock, holes);
  let lastDone = cur - 1;
  while (cur <= toBlock) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      log("达到单轮时间预算,保存进度退出");
      break;
    }
    if (callCount >= MAX_CALLS) {
      log("达到单轮调用次数上限,保存进度退出");
      break;
    }
    const skipped = skipHoles(cur, holes);
    if (skipped !== cur) {
      cur = skipped;
      continue;
    }
    const end = Math.min(cur + window - 1, toBlock);
    try {
      const logs = await rpcCall("eth_getLogs", [
        {
          address: CONTRACT,
          topics: [NAME_REGISTERED_TOPIC],
          fromBlock: "0x" + cur.toString(16),
          toBlock: "0x" + end.toString(16),
        },
      ]);
      absorbLogs(Array.isArray(logs) ? logs : []);
      lastDone = end;
      cur = end + 1;
      window = Math.min(MAX_WINDOW, Math.ceil(window * 1.25)); // 成功后缓慢回升
      floorSkips = 0;
      holeStart = null;
      process.stdout.write(
        `\r已扫至 ${cur - 1} / ${toBlock}(窗口 ${window},调用 ${callCount})    `
      );
    } catch (e) {
      if (e instanceof LimitError && window <= MIN_WINDOW) {
        // 最小窗口仍超限。两种可能(OKX NodeOne 行为):(1) 该窗口内日志量超网关
        // 上限(真丢数据);(2) 网关对空结果也回 403。每块注册笔数 ≤ 块内总交易数,
        // 故用交易数探针区分:总交易数低于日志上限 ⇒ 必然是空结果,安全跳过。
        // 若连续跳过次数达到阈值,判定为当前节点能力无法覆盖的"洞":整体跳过并记录,
        // 避免流水线永久卡死;洞可由后续轮次(更好的节点/key)用 --holes 回填。
        const span = end - cur + 1;
        if (holeStart == null) holeStart = cur;
        let totalTx = 0;
        let probeOk = true;
        for (let b = cur; b <= end; b++) {
          if (txCountCache.has(b)) {
            totalTx += txCountCache.get(b);
            continue;
          }
          try {
            const blk = await rpcCall("eth_getBlockByNumber", ["0x" + b.toString(16), false]);
            const n = Array.isArray(blk?.transactions) ? blk.transactions.length : 500;
            txCountCache.set(b, n);
            totalTx += n;
          } catch {
            probeOk = false;
            break;
          }
        }
        lastDone = end;
        cur = end + 1;
        window = Math.min(MAX_WINDOW, Math.max(MIN_WINDOW * 8, window * 16)); // 空区段快速跳窗
        if (!probeOk) {
          log(`\n区块 ${cur - span}-${cur - 1} 探针失败,按跳过处理`);
        } else if (totalTx >= 1500) {
          log(`\n窗口 ${cur - span}-${cur - 1} 交易数 ${totalTx} 达峰值量级,日志超网关上限,可能丢失该窗口靓号`);
        }
        // totalTx < 1500:必为空结果(或近空),静默跳过即可
        floorSkips++;
        if (floorSkips >= HOLE_SKIP_THRESHOLD) {
          newHoles.push([holeStart, cur - 1]);
          log(`\n连续 ${floorSkips} 次无法扫描,判定区块 ${holeStart}-${cur - 1} 为"洞",记入待回填列表,向前跳跃 ${HOLE_JUMP}`);
          lastDone = cur + HOLE_JUMP - 1;
          cur += HOLE_JUMP;
          window = INITIAL_WINDOW;
          floorSkips = 0;
          holeStart = null;
        }
      } else if (e instanceof LimitError) {
        window = Math.max(MIN_WINDOW, Math.floor(window / 2)); // 限窗/超限:减半重试
        log(`\n窗口超限(${e.message}),窗口降至 ${window}`);
      } else if (window > MIN_WINDOW) {
        window = Math.max(MIN_WINDOW, Math.floor(window / 2));
        log(`\n扫描失败,窗口降至 ${window} 重试: ${e.message}`);
      } else {
        log(`\n区块 ${cur}-${end} 扫描失败,跳过: ${e.message}`);
        if (holeStart == null) holeStart = cur;
        floorSkips++;
        lastDone = end;
        cur = end + 1; // 避免死锁
        if (floorSkips >= HOLE_SKIP_THRESHOLD) {
          newHoles.push([holeStart, cur - 1]);
          log(`\n连续 ${floorSkips} 次无法扫描,判定区块 ${holeStart}-${cur - 1} 为"洞",记入待回填列表,向前跳跃 ${HOLE_JUMP}`);
          lastDone = cur + HOLE_JUMP - 1;
          cur += HOLE_JUMP;
          window = INITIAL_WINDOW;
          floorSkips = 0;
          holeStart = null;
        }
      }
    }
  }
  process.stdout.write("\n");
  return { lastDone, newHoles };
}

// ---------- 执行 ----------

await mkdir(DATA_DIR, { recursive: true });

const head = await fetchHeadBlock();
log(`当前区块高度: ${head}`);

// 合并重叠/相邻的洞区间并排序
function coalesceHoles(list) {
  const sorted = [...list].sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const h of sorted) {
    const last = out[out.length - 1];
    if (last && h[0] <= last[1] + 1) last[1] = Math.max(last[1], h[1]);
    else out.push([h[0], h[1]]);
  }
  return out;
}

let scannedUntil = state.scannedUntil || START_BLOCK - 1;
let lastIndexedBlock = state.lastIndexedBlock || START_BLOCK - 1;
const holesMode = process.argv.includes("--holes");

if (holesMode) {
  // 回填模式:扫描 state.holes 里的洞,扫完的洞从列表移除(部分扫完则缩小范围)
  if (recentOnly) throw new Error("--holes 与 --blocks 不能同时使用");
  if (holes.length === 0) {
    log("无待回填的洞");
  } else {
    log(`回填模式:共 ${holes.length} 个洞待扫描`);
    const remaining = [];
    for (const h of holes) {
      if (Date.now() - startedAt > TIME_BUDGET_MS || callCount >= MAX_CALLS) {
        remaining.push(h);
        continue;
      }
      log(`回填洞 [${h[0]}, ${h[1]}]`);
      const { lastDone, newHoles } = await scanRange(h[0], h[1]);
      const overlapNew = newHoles.filter((n) => n[1] >= h[0] && n[0] <= h[1]);
      if (lastDone >= h[1] && overlapNew.length === 0) {
        log(`洞 [${h[0]}, ${h[1]}] 回填完成`);
      } else {
        remaining.push([Math.max(h[0], lastDone + 1), h[1]]);
        remaining.push(...overlapNew);
      }
    }
    holes = coalesceHoles(remaining);
    log(`回填结束:剩余 ${holes.length} 个洞`);
  }
} else if (recentOnly && recentBlocks > 0) {
  const from = Math.max(START_BLOCK, head - recentBlocks + 1);
  log(`--blocks 模式:仅扫描最近 ${recentBlocks} 块(${from} -> ${head}),不回写索引进度`);
  if (from <= head) await scanRange(from, head, holes);
} else {
  const from = Math.max(START_BLOCK, (state.lastIndexedBlock || START_BLOCK - 1) + 1);
  log(`增量扫描: ${from} -> ${head}(跳过 ${holes.length} 个已知洞)`);
  if (from <= head) {
    const { lastDone, newHoles } = await scanRange(from, head, holes);
    scannedUntil = Math.max(scannedUntil, lastDone);
    lastIndexedBlock = Math.max(lastIndexedBlock, lastDone);
    holes = coalesceHoles([...holes, ...newHoles]);
    if (newHoles.length > 0) log(`本轮新发现 ${newHoles.length} 个洞,待回填洞共 ${holes.length} 个`);
  } else {
    log("已是最新,无需扫描");
    lastIndexedBlock = Math.max(lastIndexedBlock, head);
    scannedUntil = Math.max(scannedUntil, head);
  }
}

// 时间戳补录:只对收录的名字、同名块去重,限流
const needTs = [...byName.values()].filter((r) => r.ts == null);
const tsByBlock = new Map();
for (const r of needTs) if (!tsByBlock.has(r.block)) tsByBlock.set(r.block, []);
for (const r of needTs) tsByBlock.get(r.block).push(r);

if (tsByBlock.size > 0) {
  log(`补录 ${Math.min(tsByBlock.size, TS_BACKFILL_CAP)}/${tsByBlock.size} 个区块的时间戳`);
  let filled = 0;
  for (const [block, recs] of [...tsByBlock.entries()].slice(0, TS_BACKFILL_CAP)) {
    if (Date.now() - startedAt > TIME_BUDGET_MS || callCount >= MAX_CALLS) break;
    try {
      const ts = await fetchBlockTimestamp(block);
      if (ts != null) for (const r of recs) r.ts = ts;
      filled++;
    } catch (e) {
      log(`区块 ${block} 时间戳获取失败: ${e.message}`);
    }
  }
  log(`时间戳补录完成 ${filled} 个区块`);
}

// 写文件:按 score 降序,block 升序作次序稳定的次关键字
const merged = [...byName.values()].sort(
  (a, b) => b.score - a.score || a.block - b.block || a.name.localeCompare(b.name)
);
await saveJson(VANITY_FILE, merged);

const owners = new Set(merged.map((r) => r.owner));
const stats = {
  lastIndexedBlock,
  lastSync: new Date().toISOString(),
  totalVanity: merged.length,
  totalOwners: owners.size,
};
await saveJson(STATS_FILE, stats);

if (!recentOnly) {
  await saveJson(STATE_FILE, { lastIndexedBlock, scannedUntil, holes });
}

log(
  `完成:解析日志 ${scannedLogs} 条,新增收录 ${newNames} 个,累计收录 ${merged.length} 个,` +
    `持有者 ${owners.size} 个,RPC 调用 ${callCount} 次,用时 ${((Date.now() - startedAt) / 1000).toFixed(1)}s`
);
