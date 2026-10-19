import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readCspPolicy } from "./csp";

function fixture(config: unknown): string {
  const path = join(mkdtempSync(join(tmpdir(), "csp-")), "vercel.json");
  writeFileSync(path, JSON.stringify(config));
  return path;
}

describe("readCspPolicy", () => {
  it("reads the policy for / from the real vercel.json", () => {
    expect(readCspPolicy()).toContain("default-src 'self'");
  });

  it("reads an enforcing header", () => {
    const path = fixture({ headers: [{ source: "/", headers: [{ key: "Content-Security-Policy", value: "default-src 'none'" }] }] });
    expect(readCspPolicy(path)).toBe("default-src 'none'");
  });

  it("reads a report-only header", () => {
    const path = fixture({ headers: [{ source: "/", headers: [{ key: "Content-Security-Policy-Report-Only", value: "a" }] }] });
    expect(readCspPolicy(path)).toBe("a");
  });

  it("ignores other sources", () => {
    const path = fixture({ headers: [{ source: "/other", headers: [{ key: "Content-Security-Policy", value: "x" }] }] });
    expect(() => readCspPolicy(path)).toThrow(/no Content-Security-Policy/);
  });

  it("throws when headers are absent", () => {
    expect(() => readCspPolicy(fixture({}))).toThrow(/no Content-Security-Policy/);
  });

  it("throws on a missing file", () => {
    expect(() => readCspPolicy("/nonexistent/vercel.json")).toThrow();
  });
});
