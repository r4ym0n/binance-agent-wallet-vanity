import { NextRequest, NextResponse } from "next/server";
import { getVanityByName } from "@/lib/data";
import { formatTime } from "@/lib/format";

// 供 /grid 悬停详情按需取数,避免把全量详情序列化进页面(曾致 /grid 单页 1.5MB,
// 动态流下每次访问都走源站传输,是 Fast Origin Transfer 暴涨的主因)。
export async function GET(req: NextRequest) {
  const name = (req.nextUrl.searchParams.get("name") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\.ai$/, "");
  if (!name) return NextResponse.json({ detail: null });

  const record = await getVanityByName(name);
  if (!record) return NextResponse.json({ detail: null });

  return NextResponse.json(
    {
      detail: {
        label: record.label,
        score: record.score,
        owner: record.owner,
        time: formatTime(record.ts),
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
