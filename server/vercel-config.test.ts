import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as { headers: HeaderRule[] };

function globalHeaders(): Record<string, string> {
  const rule = config.headers.find((entry) => entry.source === "/(.*)");
  return Object.fromEntries((rule?.headers ?? []).map(({ key, value }) => [key, value]));
}

describe("vercel.json security headers", () => {
  it("applies baseline security headers to every path", () => {
    expect(globalHeaders()).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
  });
});
