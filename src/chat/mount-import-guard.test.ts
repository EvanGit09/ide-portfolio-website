import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const CHAT_DIR = dirname(fileURLToPath(import.meta.url));
const MOUNT_IMPORT = /["']\.\/mount(?:\.tsx?)?["']/;

describe("mount import guard", () => {
  it("only load-mount imports ./mount, so zod is made CSP-safe before ai loads", () => {
    const importers = readdirSync(CHAT_DIR)
      .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name))
      .filter((name) => MOUNT_IMPORT.test(readFileSync(join(CHAT_DIR, name), "utf8")));
    expect(importers).toEqual(["load-mount.ts"]);
  });
});
