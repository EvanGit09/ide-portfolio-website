import { beforeEach, describe, expect, it, vi } from "vitest";

const checkBotId = vi.hoisted(() => vi.fn());
vi.mock("botid/server", () => ({ checkBotId }));

import { checkBot } from "./bot-check";

describe("checkBot", () => {
  beforeEach(() => checkBotId.mockReset());

  it("forwards request headers and returns the verdict", async () => {
    checkBotId.mockResolvedValue({ isBot: true, isHuman: false });
    const request = new Request("https://x.test/api/chat", { headers: { "x-test": "1" } });
    expect(await checkBot(request)).toEqual({ isBot: true });
    expect(checkBotId).toHaveBeenCalledWith({
      advancedOptions: { headers: expect.objectContaining({ "x-test": "1" }) },
    });
  });

  it("reports humans as not bots", async () => {
    checkBotId.mockResolvedValue({ isBot: false });
    expect(await checkBot(new Request("https://x.test/"))).toEqual({ isBot: false });
  });
});
