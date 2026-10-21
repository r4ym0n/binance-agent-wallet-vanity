// 服务端 locale 探测:cookie `lang` 优先,其次 Accept-Language。仅可在
// 服务端组件 / route handler 中使用;客户端组件应通过 props 接收 locale。

import { cookies, headers } from "next/headers";
import type { Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  try {
    const c = await cookies();
    const saved = c.get("lang")?.value;
    if (saved === "zh" || saved === "en") return saved;
    const h = await headers();
    const al = (h.get("accept-language") ?? "").toLowerCase();
    return al.startsWith("zh") ? "zh" : "en";
  } catch {
    return "zh";
  }
}
