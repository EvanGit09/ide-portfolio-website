import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loadMount } from "./load-mount";

describe("loadMount", () => {
  it("turns off zod JIT before resolving the chat mount module", async () => {
    const mod = await loadMount();
    expect(z.core.globalConfig.jitless).toBe(true);
    expect(typeof mod.mountChat).toBe("function");
  });
});
