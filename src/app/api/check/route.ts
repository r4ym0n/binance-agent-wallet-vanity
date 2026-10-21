import { NextRequest, NextResponse } from "next/server";
import { getVanity } from "@/lib/data";

export async function GET(req: NextRequest) {
  const name = (req.nextUrl.searchParams.get("name") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\.ai$/, "");
  if (!name) return NextResponse.json({ record: null });

  const vanity = await getVanity();
  const record = vanity.find((r) => r.name === name) ?? null;
  return NextResponse.json(
    { record },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
  );
}
