import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

export interface VanityRecord {
  name: string;
  owner: string;
  tokenId: string;
  block: number;
  tx: string;
  ts: number | null;
  score: number;
  tags: string[];
  label: string;
}

export interface Stats {
  lastIndexedBlock: number;
  lastSync: string;
  totalVanity: number;
  totalOwners: number;
}

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife({ revalidate: 300, expire: 3600 });
  return readJson<Stats>("stats.json", {
    lastIndexedBlock: 0,
    lastSync: "",
    totalVanity: 0,
    totalOwners: 0,
  });
}

export async function getVanity(): Promise<VanityRecord[]> {
  "use cache";
  cacheLife({ revalidate: 300, expire: 3600 });
  return readJson<VanityRecord[]>("vanity.json", []);
}

export async function getVanityByName(
  name: string
): Promise<VanityRecord | null> {
  "use cache";
  cacheLife({ revalidate: 300, expire: 3600 });
  const all = await getVanity();
  return all.find((r) => r.name === name) ?? null;
}
