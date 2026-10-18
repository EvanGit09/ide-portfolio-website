import { afterEach, describe, expect, it, vi } from "vitest";

const initBotId = vi.fn();
vi.mock("botid/client/core", () => ({ initBotId }));
const mountChat = vi.fn();
vi.mock("./mount", () => ({ mountChat }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.resetModules();
  vi.clearAllMocks();
});

const stubMatchMedia = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query }));

describe("boot entry", () => {
  it("registers BotID for POST /api/chat and mounts via requestIdleCallback", async () => {
    document.body.innerHTML = '<div id="chat-root"></div>';
    stubMatchMedia(true);
    await import("./boot");
    expect(initBotId).toHaveBeenCalledWith({ protect: [{ path: "/api/chat", method: "POST" }] });
    await vi.waitFor(() => expect(mountChat).toHaveBeenCalledWith(document.getElementById("chat-root")));
  });

  it("falls back to setTimeout when requestIdleCallback is unavailable", async () => {
    document.body.innerHTML = '<div id="chat-root"></div>';
    stubMatchMedia(true);
    const original = window.requestIdleCallback;
    // @ts-expect-error simulate Safari
    window.requestIdleCallback = undefined;
    try {
      await import("./boot");
      await vi.waitFor(() => expect(mountChat).toHaveBeenCalled(), { timeout: 1000 });
    } finally {
      window.requestIdleCallback = original;
    }
  });

  it("still inits BotID but does not mount on small viewports", async () => {
    document.body.innerHTML = '<div id="chat-root"></div>';
    stubMatchMedia(false);
    await import("./boot");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(initBotId).toHaveBeenCalled();
    expect(mountChat).not.toHaveBeenCalled();
  });
});
