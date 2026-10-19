import { describe, expect, it } from "vitest";
import { z } from "zod";
import "./csp-safe-zod";

describe("csp-safe-zod", () => {
  it("disables zod's eval-based JIT so strict CSPs see no violation", () => {
    expect(z.core.globalConfig.jitless).toBe(true);
  });
});
