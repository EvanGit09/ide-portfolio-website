import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FUNCTION_DIRS = ["api", "server/chat"];
const RELATIVE_IMPORT = /(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g;

function runtimeSourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return runtimeSourceFiles(path);
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

function extensionlessImports(file: string): string[] {
  const source = readFileSync(join(ROOT, file), "utf8");
  return [...source.matchAll(RELATIVE_IMPORT)]
    .map((match) => match[1])
    .filter((specifier) => !specifier.endsWith(".js"))
    .map((specifier) => `${relative(ROOT, join(ROOT, file))}: ${specifier}`);
}

describe("Vercel function ESM imports", () => {
  it("uses .js extensions on every relative import so Node ESM can resolve the compiled function", () => {
    const offenders = FUNCTION_DIRS.flatMap(runtimeSourceFiles).flatMap(extensionlessImports);
    expect(offenders).toEqual([]);
  });
});
