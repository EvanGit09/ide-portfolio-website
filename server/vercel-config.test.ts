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

const CSP_KEY = "Content-Security-Policy";
const HTML_SOURCES = ["/", "/index.html"];
const REQUIRED_DIRECTIVES = [
  "default-src",
  "script-src",
  "style-src",
  "font-src",
  "img-src",
  "connect-src",
  "frame-src",
  "worker-src",
  "object-src",
  "base-uri",
  "form-action",
  "frame-ancestors",
];

function cspRules(): HeaderRule[] {
  return config.headers.filter((entry) => entry.headers.some((h) => h.key.startsWith("Content-Security-Policy")));
}

function directives(): Map<string, string> {
  const value = cspRules()[0].headers.find((h) => h.key === CSP_KEY)?.value ?? "";
  return new Map(value.split(";").map((part) => part.trim().split(/\s+(.*)/s).slice(0, 2) as [string, string]));
}

describe("vercel.json Content-Security-Policy", () => {
  it("applies only to the HTML document routes", () => {
    expect(cspRules().map((rule) => rule.source).sort()).toEqual([...HTML_SOURCES].sort());
  });

  it("uses the same policy on both routes", () => {
    const values = cspRules().map((rule) => rule.headers.find((h) => h.key === CSP_KEY)?.value);
    expect(new Set(values).size).toBe(1);
    expect(values[0]).toBeTruthy();
  });

  it.each(REQUIRED_DIRECTIVES)("declares %s", (name) => {
    expect(directives().has(name)).toBe(true);
  });

  it("blocks plugins and restricts framing", () => {
    expect(directives().get("object-src")).toBe("'none'");
    expect(directives().get("frame-ancestors")).toBe("'self'");
  });

  it("never allows eval or inline scripts", () => {
    const scriptSrc = directives().get("script-src") ?? "";
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });
});
