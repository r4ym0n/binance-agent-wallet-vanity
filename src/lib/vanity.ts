// .ai 靓号规则库:纯函数,无运行时依赖。
// 同时被 Next.js 页面与 scripts/index.mjs(Node 26 原生 type stripping)复用。

export interface VanityAnalysis {
  score: number;
  tags: string[];
  label: string;
}

export type VanityLabel = "极品" | "罕见" | "精品" | "优质" | "普通";

export function labelOf(score: number): VanityLabel {
  if (score >= 80) return "极品";
  if (score >= 60) return "罕见";
  if (score >= 40) return "精品";
  if (score >= 20) return "优质";
  return "普通";
}

export function analyzeName(name: string): VanityAnalysis {
  const tags: string[] = [];
  let score = 0;

  const len = name.length;
  const digitsOnly = /^[0-9]+$/.test(name);
  const lettersOnly = /^[a-z]+$/.test(name);
  const alnumOnly = /^[a-z0-9]+$/.test(name);

  // 长度类
  if (digitsOnly) {
    if (len <= 3) {
      score += 50;
      tags.push("3D");
    } else if (len === 4) {
      score += 40;
      tags.push("4D");
    } else if (len === 5) {
      score += 30;
      tags.push("5D");
    } else if (len === 6) {
      score += 22;
      tags.push("6D");
    } else if (len === 7) {
      score += 16;
      tags.push("7D");
    } else if (len === 8) {
      score += 10;
      tags.push("8D");
    }
  } else if (lettersOnly) {
    if (len <= 3) {
      score += 45;
      tags.push("3L");
    } else if (len === 4) {
      score += 30;
      tags.push("4L");
    }
  } else if (alnumOnly && len <= 4) {
    score += len <= 3 ? 35 : 18;
    tags.push("4N");
  }

  // 模式类(仅在纯数字或纯字母上判定)
  const uniform = (s: string) => s.split("").every((c) => c === s[0]);
  let matchedAbba = false;
  if ((digitsOnly || lettersOnly) && len >= 2) {
    if (len >= 4 && uniform(name)) {
      score += 25;
      tags.push("AAAA");
    } else if (len >= 3 && uniform(name)) {
      score += 15;
      tags.push("AAA");
    } else if (len === 4) {
      const [a, b, c, d] = name.split("");
      if (a === c && b === d && a !== b) {
        score += 18;
        tags.push("ABAB");
      }
      if (a === b && c === d && a !== c) {
        score += 12;
        tags.push("AABB");
      }
      if (a === d && b === c && a !== b) {
        score += 12;
        tags.push("ABBA");
        matchedAbba = true;
      }
    }
    if (len === 6 && name.slice(0, 3) === name.slice(3)) {
      score += 14;
      tags.push("ABCABC");
    }
    if (digitsOnly && len >= 3) {
      const ds = name.split("").map(Number);
      const increasing = ds.every((v, i) => i === 0 || v === ds[i - 1] + 1);
      const decreasing = ds.every((v, i) => i === 0 || v === ds[i - 1] - 1);
      if (increasing) {
        score += 20;
        tags.push("顺子");
      } else if (decreasing) {
        score += 18;
        tags.push("倒序");
      }
    }
    // 回文(单一重复字符已由 AAA/AAAA 覆盖,ABBA 不再重复计回文)
    const reversed = name.split("").reverse().join("");
    if (len >= 3 && name === reversed && !uniform(name) && !matchedAbba) {
      score += 18;
      tags.push("回文");
    }
  }

  // 寓意类
  if (name.includes("520")) {
    score += 10;
    tags.push("520");
  }
  if (name.includes("1314")) {
    score += 10;
    tags.push("1314");
  }
  if (name.includes("168")) {
    score += 8;
    tags.push("168");
  }
  if (name.includes("888")) {
    score += 6;
    tags.push("含888");
  }
  if (name.includes("666")) {
    score += 4;
    tags.push("含666");
  }
  if (/^(19|20)\d{2}$/.test(name)) {
    const year = Number(name);
    if (year >= 1990 && year <= 2029) {
      score += 6;
      tags.push("年份");
    }
  }
  if (name === "42") {
    score += 10;
    tags.push("42");
  }

  if (name.includes("-")) score -= 10;

  score = Math.max(0, Math.min(100, score));
  return { score, tags, label: labelOf(score) };
}

// 索引用过滤:短名、纯数字短名、或规则得分 ≥20 的名才值得收录
export function isVanityRelevant(name: string): boolean {
  if (name.length <= 5) return true;
  if (/^[0-9]+$/.test(name) && name.length <= 8) return true;
  return analyzeName(name).score >= 20;
}
