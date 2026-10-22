// 轻量 i18n:字典 + locale 类型。locale 探测在 server-only 的
// src/lib/locale.ts(getLocale),客户端组件通过 props 接收 locale 后
// 用 getDict(locale) 取字典,避免函数字典跨 RSC 边界序列化。

export type Locale = "zh" | "en";

const zh = {
  siteName: "靓号星图",
  siteNameFull: ".ai 靓号星图",
  siteTagline: "BNB Chain · SPACE ID Agent ID",

  nav: {
    home: "首页",
    grid: "靓号地图",
    browse: "全部靓号",
    check: "靓号查询",
    patterns: "靓号规律",
    github: "GitHub",
  },

  langSwitcher: { zh: "中文", en: "EN", label: "语言" },

  home: {
    heroDesc:
      "币安钱包 × SPACE ID 推出的 .ai 域名正在免费 claim。这里持续索引链上注册事件,帮你发现已被抢走的靓号、用点阵地图一眼找出还没被注册的好号。",
    claimCta: "去币安钱包领取",
    checkCta: "查询靓号是否被抢",
    statVanity: "已索引靓号",
    statOwners: "独立持有者",
    statBlock: "最新同步区块",
    statSync: "同步时间",
    syncJustNow: "刚刚",
    syncMinutesAgo: (m: number) => `${m} 分钟前`,
    syncHoursAgo: (h: number) => `${h} 小时前`,
    gridCardTitle: "靓号地图",
    gridCardDesc:
      "3D / 4D 数字、3L 字母全集点阵图:金色 = 已被注册,暗色 = 还有机会。剩下的好号一眼看全。",
    browseCardTitle: "全部靓号",
    browseCardDesc: "按豹子号、顺子号、520/1314 等规律筛选,支持前缀搜索。",
    topTitle: "评分 Top",
    browseAll: "浏览全部 →",
    viewAll: (n: string) => `查看全部 ${n} 个靓号 →`,
  },

  browse: {
    title: "全部靓号",
    desc: "浏览币安钱包 .ai 域名全部已索引靓号,支持按规律筛选、前缀搜索与分页。",
    resultCount: (total: string, size: number) => `共 ${total} 个匹配,每页 ${size} 个`,
    toGrid: "想一眼发现还没被注册的号?去靓号地图 →",
    searchPlaceholder: "按名字前缀搜索,如 88",
    search: "搜索",
    sortScore: "按评分",
    sortLength: "按长度",
    empty: "没有匹配的靓号,换个筛选条件试试。",
    prev: "← 上一页",
    next: "下一页 →",
    filterAll: "全部",
    filterLegendary: "极品",
  },

  grid: {
    title: "靓号地图",
    desc: "3D / 4D 数字与 3L 字母 .ai 域名全集点阵图:金色已注册、暗色未注册,一眼发现还没被抢走的靓号。",
    intro:
      "规则名字的「全集扫雷图」:每个格子是一个候选名字。金色 = 已被注册,暗色 = 还有机会,开启「高亮未注册」可以只突出空缺。点格子直接跳转详情或领取页。",
    cat3D: "3D 数字",
    cat4D: "4D 数字",
    cat3L: "3L 字母",
    highlightVacancy: "高亮未注册",
    randomBtn: "🎲 随机抽个好号",
    randomAgain: "换一个",
    randomGo: "去领取 →",
    randomScore: "评分",
    randomTags: "规律",
    randomEmpty: "手气一般,再抽一次?",
    registeredOf: (reg: string, size: string) => `${size} 全集 · 已注册 ${reg} / ${size}`,
    free: "剩余",
    legendRegistered: "已注册",
    legendFree: "未注册",
    hint: "悬停查看详情,点击可跳转。注册状态以本站索引为准(合约最短支持 3 位)。",
    tooltipRegistered: "已注册 · 点击查看详情",
    tooltipFree: "未注册 · 点击去查询/领取",
    score: "评分",
    owner: "持有者",
    registeredAt: "注册时间",
    label: "评级",
  },

  check: {
    title: "靓号查询",
    desc: "查询心仪的 .ai 域名靓号是否已被注册:输入名字,即刻匹配链上索引结果。",
    heading: "靓号查询",
    subheading: "输入你想要的名字,看看有没有被人抢走。",
    placeholder: "输入靓号名字,如 888(无需输入 .ai)",
    submit: "查询",
    loading: "查询中…",
    inputHint: "仅支持小写字母、数字与连字符,1-32 位。",
    invalid:
      "输入格式不正确:.ai 域名只包含小写字母 a-z、数字 0-9 与连字符 -,长度 1-32 位。",
    registered: "已被注册",
    holder: "持有者:",
    scoreSuffix: "评分",
    viewDetail: "查看完整详情 →",
    notIndexedTitle: "暂未收录",
    notIndexed:
      "有可能还可以抢注!本站索引只收录靓号相关名字,普通名字未收录不代表仍可注册,请以下方链上查询为准。",
    verifyChain: "去 Bscscan 验证链上记录",
    claim: "去币安钱包领取",
    unknown: "未知",
  },

  detail: {
    back: "← 返回",
    score: "评分",
    holder: "持有者",
    holderShort: "持有者缩写",
    tokenId: "tokenId",
    block: "注册区块",
    time: "注册时间",
    tx: "注册交易",
    noTags: "短位靓号,无附加规律",
    notIndexedTitle: "未收录的靓号",
  },

  patterns: {
    title: "靓号规律",
    desc: ".ai 域名靓号打分规则科普:长度、豹子号、顺子号、回文、520/1314 寓意号,教你一眼识别好名字。",
    heading: "靓号规律科普",
    intro:
      "本站用一套公开透明的规则给每个 .ai 名字打分(0-100),分数越高名字越靓。评级分五档:80 分以上「极品」、60 分以上「罕见」、40 分以上「精品」、20 分以上「优质」,其余为「普通」。名字里带连字符 - 会扣 10 分。以下是各类规律的定义与示例(悬停示例可看到实时打分)。",
    scoreTooltip: (score: number, tags: string) => `评分 ${score} · ${tags || "无标签"}`,
    footerPre: "想查某个名字值多少分、有没有被注册?去",
    footerCheck: "靓号查询",
    footerMid: "输入即可;全部打分逻辑开源在",
    footerRepo: "src/lib/vanity.ts",
    footerPost: "。",
    list: [
      {
        title: "短数字(3D / 4D / 5D …)",
        desc: "纯数字越短越稀缺:3 位以内 +50 分,4 位 +40 分,依此类推。总共只有 1000 个三位数,先到先得。",
        examples: ["403", "888", "520"],
      },
      {
        title: "短字母(3L / 4L)",
        desc: "纯字母短名同样是硬通货:3 位以内 +45 分,4 位 +30 分。",
        examples: ["abc", "ai", "nft"],
      },
      {
        title: "豹子号(AAAA / AAA)",
        desc: "四位全同 +25 分,三位全同 +15 分。8888、666 这类号码在华人圈历来是顶流。",
        examples: ["8888", "6666", "999"],
      },
      {
        title: "对子号(ABAB / AABB / ABBA)",
        desc: "ABAB +18 分,AABB 与 ABBA 各 +12 分,读起来有节奏感的组合都很抢手。",
        examples: ["1212", "8899", "1001"],
      },
      {
        title: "循环号(ABCABC)",
        desc: "六位数字前后各三位相同 +14 分,例如 123123。",
        examples: ["123123", "456456"],
      },
      {
        title: "顺子 / 倒序",
        desc: "连续递增 3 位以上 +20 分,连续递减 +18 分。1234、4321 这类名字一眼难忘。",
        examples: ["1234", "6789", "4321"],
      },
      {
        title: "回文",
        desc: "正着读反着读都一样 +18 分,例如 1221、level。",
        examples: ["1221", "level", "6996"],
      },
      {
        title: "寓意号(520 / 1314 / 168)",
        desc: "520(我爱你)+10 分,1314(一生一世)+10 分,168(一路发)+8 分;含 888 +6 分,含 666 +4 分。",
        examples: ["520", "1314", "1688"],
      },
      {
        title: "年份号",
        desc: "1990-2029 的年份 +6 分:生日、纪念日、重要年份,专属感极强。",
        examples: ["2000", "2026", "1997"],
      },
    ],
  },

  card: {
    scoreUnit: "分",
    shortVanity: "短位靓号",
  },

  labels: {
    极品: "极品",
    罕见: "罕见",
    精品: "精品",
    优质: "优质",
    普通: "普通",
  } as Record<string, string>,

  notFound: {
    title: "页面不存在或名字未收录",
    desc: "你访问的页面不存在;如果是靓号详情页,说明这个名字暂未进入链上索引,不代表仍可注册 —— 可以去查询页确认或到链上验证。",
    backHome: "返回首页",
    goCheck: "去查询靓号",
  },

  footer: {
    dataPrefix: "数据来自 BNB Chain 链上索引(SPACE ID Agent ID 注册合约",
    dataSuffix: "的 NameRegistered 事件),同步可能有数分钟延迟。",
    source: "开源代码与索引器(GitHub)",
    contract: "Bscscan 合约页",
    disclaimer:
      "免责声明:本站为非官方社区项目,与币安(Binance)、SPACE ID 无隶属关系,不构成任何投资建议。免费 claim 活动以币安钱包内实际规则为准;链上数据索引可能存在遗漏或延迟,注册状态请以链上记录为准。",
  },

  meta: {
    defaultDesc:
      "发现 BNB Chain 上 SPACE ID Agent ID(.ai 域名)的已注册靓号:点阵地图、榜单、查询、规律科普。币安钱包免费 claim,手快有手慢无。",
  },
};

export type Dict = typeof zh;

const en: Dict = {
  siteName: "Vanity Atlas",
  siteNameFull: ".ai Vanity Atlas",
  siteTagline: "BNB Chain · SPACE ID Agent ID",

  nav: {
    home: "Home",
    grid: "Atlas",
    browse: "All Names",
    check: "Check",
    patterns: "Patterns",
    github: "GitHub",
  },

  langSwitcher: { zh: "中文", en: "EN", label: "Language" },

  home: {
    heroDesc:
      "The .ai domains by Binance Wallet × SPACE ID are free to claim. We index on-chain registrations continuously — discover taken vanity names and spot the best ones still available on the dot-matrix atlas.",
    claimCta: "Claim in Binance Wallet",
    checkCta: "Check a name",
    statVanity: "Vanity indexed",
    statOwners: "Unique owners",
    statBlock: "Latest block",
    statSync: "Last synced",
    syncJustNow: "just now",
    syncMinutesAgo: (m: number) => `${m} min ago`,
    syncHoursAgo: (h: number) => `${h} h ago`,
    gridCardTitle: "Vanity Atlas",
    gridCardDesc:
      "Full dot-matrix of 3D / 4D digits and 3L letters: gold = taken, dark = still up for grabs. See every gap at a glance.",
    browseCardTitle: "All Vanity Names",
    browseCardDesc:
      "Filter by patterns like AAAA, sequences, 520/1314, or search by prefix.",
    topTitle: "Top by score",
    browseAll: "Browse all →",
    viewAll: (n: string) => `View all ${n} vanity names →`,
  },

  browse: {
    title: "All Vanity Names",
    desc: "Browse every indexed .ai vanity name: filter by pattern, prefix search, paginated.",
    resultCount: (total: string, size: number) =>
      `${total} matches, ${size} per page`,
    toGrid: "Want to spot unregistered names at a glance? Go to the Atlas →",
    searchPlaceholder: "Search by prefix, e.g. 88",
    search: "Search",
    sortScore: "By score",
    sortLength: "By length",
    empty: "No matches — try a different filter.",
    prev: "← Prev",
    next: "Next →",
    filterAll: "All",
    filterLegendary: "Legendary",
  },

  grid: {
    title: "Vanity Atlas",
    desc: "Full dot-matrix of 3D / 4D digit and 3L letter .ai names: gold = registered, dark = available — spot the best unclaimed vanity names at a glance.",
    intro:
      "A minesweeper view of every candidate name: each cell is one name. Gold = registered, dark = still available. Toggle “Highlight available” to surface only the gaps. Click a cell to jump to details or claim.",
    cat3D: "3D digits",
    cat4D: "4D digits",
    cat3L: "3L letters",
    highlightVacancy: "Highlight available",
    randomBtn: "🎲 Surprise me",
    randomAgain: "Roll again",
    randomGo: "Claim it →",
    randomScore: "Score",
    randomTags: "Patterns",
    randomEmpty: "Meh. Roll again?",
    registeredOf: (reg: string, size: string) =>
      `Full space of ${size} · ${reg} registered`,
    free: "Available",
    legendRegistered: "Registered",
    legendFree: "Available",
    hint: "Hover for details, click to jump. Registration status reflects our index (min. 3 chars on-chain).",
    tooltipRegistered: "Registered · click for details",
    tooltipFree: "Available · click to check / claim",
    score: "Score",
    owner: "Owner",
    registeredAt: "Registered",
    label: "Grade",
  },

  check: {
    title: "Check a Name",
    desc: "Check whether your favorite .ai vanity name is taken: type it in, match against our on-chain index instantly.",
    heading: "Check a Name",
    subheading: "Type the name you want and see if it's still up for grabs.",
    placeholder: "Enter a name, e.g. 888 (no .ai needed)",
    submit: "Check",
    loading: "Checking…",
    inputHint: "Lowercase letters, digits and hyphens only, 1-32 chars.",
    invalid:
      "Invalid format: .ai names contain only lowercase a-z, digits 0-9 and hyphens, 1-32 chars.",
    registered: "Registered",
    holder: "Owner:",
    scoreSuffix: "Score",
    viewDetail: "Full details →",
    notIndexedTitle: "Not indexed yet",
    notIndexed:
      "It might still be claimable! Our index only covers vanity-relevant names; absence here doesn't guarantee availability — verify on-chain below.",
    verifyChain: "Verify on Bscscan",
    claim: "Claim in Binance Wallet",
    unknown: "Unknown",
  },

  detail: {
    back: "← Back",
    score: "Score",
    holder: "Owner",
    holderShort: "Owner (short)",
    tokenId: "tokenId",
    block: "Block",
    time: "Registered",
    tx: "Tx",
    noTags: "Short name, no extra patterns",
    notIndexedTitle: "Name not indexed",
  },

  patterns: {
    title: "Patterns",
    desc: "How .ai vanity names are scored: length, quads, sequences, palindromes, 520/1314 lucky numbers — learn to spot a great name.",
    heading: "Vanity Pattern Guide",
    intro:
      "Every .ai name is scored 0-100 by an open, transparent rule set — the higher the score, the better the name. Grades: 80+ Legendary, 60+ Rare, 40+ Fine, 20+ Good, below that Common. Names containing a hyphen lose 10 points. Below are the pattern definitions with examples (hover an example to see its live score).",
    scoreTooltip: (score: number, tags: string) =>
      `Score ${score} · ${tags || "no tags"}`,
    footerPre: "Want to know a name's score or whether it's taken? Go to",
    footerCheck: "Check a Name",
    footerMid: "and type it in. All scoring logic is open source at",
    footerRepo: "src/lib/vanity.ts",
    footerPost: ".",
    list: [
      {
        title: "Short digits (3D / 4D / 5D …)",
        desc: "Pure digits get scarcer as they shorten: 3 chars or fewer +50, 4 chars +40, and so on. There are only 1,000 three-digit numbers — first come, first served.",
        examples: ["403", "888", "520"],
      },
      {
        title: "Short letters (3L / 4L)",
        desc: "Short pure-letter names are solid gold too: 3 chars or fewer +45, 4 chars +30.",
        examples: ["abc", "ai", "nft"],
      },
      {
        title: "Quads & triples (AAAA / AAA)",
        desc: "Four identical chars +25, three identical +15. Numbers like 8888 and 666 have always been top-tier in Chinese culture.",
        examples: ["8888", "6666", "999"],
      },
      {
        title: "Pairs (ABAB / AABB / ABBA)",
        desc: "ABAB +18, AABB and ABBA +12 each — rhythmic combinations are always in demand.",
        examples: ["1212", "8899", "1001"],
      },
      {
        title: "Repeats (ABCABC)",
        desc: "Six digits with the same three repeated +14, e.g. 123123.",
        examples: ["123123", "456456"],
      },
      {
        title: "Runs & reverse runs",
        desc: "Ascending runs of 3+ +20, descending +18. Names like 1234 and 4321 are unforgettable.",
        examples: ["1234", "6789", "4321"],
      },
      {
        title: "Palindromes",
        desc: "Reads the same both ways +18, e.g. 1221, level.",
        examples: ["1221", "level", "6996"],
      },
      {
        title: "Lucky numbers (520 / 1314 / 168)",
        desc: "520 (“I love you”) +10, 1314 (“forever”) +10, 168 (“prosperity”) +8; containing 888 +6, containing 666 +4.",
        examples: ["520", "1314", "1688"],
      },
      {
        title: "Years",
        desc: "Years 1990-2029 +6: birthdays, anniversaries and milestone years make a name personal.",
        examples: ["2000", "2026", "1997"],
      },
    ],
  },

  card: {
    scoreUnit: "pts",
    shortVanity: "Short vanity",
  },

  labels: {
    极品: "Legendary",
    罕见: "Rare",
    精品: "Fine",
    优质: "Good",
    普通: "Common",
  } as Record<string, string>,

  notFound: {
    title: "Page not found, or name not indexed",
    desc: "The page you visited doesn't exist; if this was a name detail page, the name isn't in our on-chain index yet — that doesn't guarantee it's available. Confirm on the check page or verify on-chain.",
    backHome: "Back home",
    goCheck: "Check a name",
  },

  footer: {
    dataPrefix: "Data indexed from BNB Chain (NameRegistered events of the SPACE ID Agent ID contract",
    dataSuffix: "); sync may lag a few minutes behind the chain.",
    source: "Open source & indexer (GitHub)",
    contract: "Contract on Bscscan",
    disclaimer:
      "Disclaimer: an unofficial community project, not affiliated with Binance or SPACE ID; nothing here is investment advice. The free-claim campaign follows the actual rules inside Binance Wallet. The on-chain index may lag or miss records — always verify registration status on-chain.",
  },

  meta: {
    defaultDesc:
      "Discover registered vanity names among SPACE ID Agent ID (.ai domains) on BNB Chain: dot-matrix atlas, leaderboards, lookup and pattern guide. Free to claim in Binance Wallet — first come, first served.",
  },
};

const dicts: Record<Locale, Dict> = { zh, en };

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}
