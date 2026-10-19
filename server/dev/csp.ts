import { readFileSync } from "node:fs";

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const CSP_KEYS: readonly string[] = ["Content-Security-Policy", "Content-Security-Policy-Report-Only"];
const DEFAULT_PATH = new URL("../../vercel.json", import.meta.url);

export function readCspPolicy(vercelJsonPath: string | URL = DEFAULT_PATH): string {
  const config = JSON.parse(readFileSync(vercelJsonPath, "utf8")) as { headers?: HeaderRule[] };
  const rule = config.headers?.find((entry) => entry.source === "/" && entry.headers.some((h) => CSP_KEYS.includes(h.key)));
  const header = rule?.headers.find((h) => CSP_KEYS.includes(h.key));
  if (!header) throw new Error('vercel.json has no Content-Security-Policy header for source "/"');
  return header.value;
}
