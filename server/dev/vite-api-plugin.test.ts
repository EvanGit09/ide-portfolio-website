import { afterEach, describe, expect, it, vi } from "vitest";
import { chatApiDevPlugin, shouldApplyDevApi } from "./vite-api-plugin.ts";

afterEach(() => vi.unstubAllEnvs());

describe("shouldApplyDevApi", () => {
  const serve = { command: "serve", mode: "development" } as const;

  it("is off under Vitest", () => {
    vi.stubEnv("VITEST", "true");
    expect(shouldApplyDevApi({}, serve)).toBe(false);
  });

  it("is on for serve outside Vitest", () => {
    vi.stubEnv("VITEST", "");
    expect(shouldApplyDevApi({}, serve)).toBe(true);
  });

  it("is off for build", () => {
    vi.stubEnv("VITEST", "");
    expect(shouldApplyDevApi({}, { command: "build", mode: "production" })).toBe(false);
  });

  it("is wired into the plugin", () => {
    expect(chatApiDevPlugin().apply).toBe(shouldApplyDevApi);
  });
});
