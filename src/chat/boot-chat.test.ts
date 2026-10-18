import { afterEach, describe, expect, it, vi } from "vitest";
import { bootChat } from "./boot-chat";

const makeDoc = (html: string): Document => {
  document.body.innerHTML = html;
  return document;
};

afterEach(() => vi.restoreAllMocks());

describe("bootChat", () => {
  it("mounts into #chat-root once idle", async () => {
    const doc = makeDoc('<div id="chat-root"></div>');
    const mountChat = vi.fn();
    let idle: () => void = () => undefined;
    bootChat({ document: doc, loadMount: async () => ({ mountChat }), onIdle: (cb) => (idle = cb), isDesktop: () => true });
    expect(mountChat).not.toHaveBeenCalled();
    idle();
    await vi.waitFor(() => expect(mountChat).toHaveBeenCalledWith(doc.getElementById("chat-root")));
  });

  it("loads immediately when the mobile chat button is clicked, only once", async () => {
    const doc = makeDoc('<div id="chat-root"></div><button data-mobile="chat"></button>');
    const mountChat = vi.fn();
    const loadMount = vi.fn(async () => ({ mountChat }));
    let idle: () => void = () => undefined;
    bootChat({ document: doc, loadMount, onIdle: (cb) => (idle = cb), isDesktop: () => true });
    doc.querySelector<HTMLElement>('[data-mobile="chat"]')?.click();
    idle();
    await vi.waitFor(() => expect(mountChat).toHaveBeenCalledTimes(1));
    expect(loadMount).toHaveBeenCalledTimes(1);
  });

  it("does not throw and logs when #chat-root is missing", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const onIdle = vi.fn();
    expect(() => bootChat({ document: makeDoc(""), loadMount: vi.fn(), onIdle, isDesktop: () => true })).not.toThrow();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("#chat-root"));
    expect(onIdle).not.toHaveBeenCalled();
  });

  it("logs and keeps the fallback when the import fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const doc = makeDoc('<div id="chat-root">static</div>');
    bootChat({ document: doc, loadMount: () => Promise.reject(new Error("chunk")), onIdle: (cb) => cb(), isDesktop: () => true });
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining("chunk failed to load"), expect.any(Error)));
    expect(doc.getElementById("chat-root")?.textContent).toBe("static");
  });

  it("allows a retry via the mobile button after a failed chunk load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const doc = makeDoc('<div id="chat-root"></div><button data-mobile="chat"></button>');
    const mountChat = vi.fn();
    const loadMount = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ mountChat });
    bootChat({ document: doc, loadMount, onIdle: (cb) => cb(), isDesktop: () => true });
    await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
    doc.querySelector<HTMLElement>('[data-mobile="chat"]')?.click();
    await vi.waitFor(() => expect(mountChat).toHaveBeenCalledTimes(1));
    expect(loadMount).toHaveBeenCalledTimes(2);
  });

  it("logs a distinct message when mounting throws", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const doc = makeDoc('<div id="chat-root"></div>');
    const mountChat = vi.fn(() => {
      throw new Error("render");
    });
    bootChat({ document: doc, loadMount: async () => ({ mountChat }), onIdle: (cb) => cb(), isDesktop: () => true });
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining("mount failed"), expect.any(Error)));
  });

  it("does not idle-load on small viewports but loads on mobile button click", async () => {
    const doc = makeDoc('<div id="chat-root"></div><button data-mobile="chat"></button>');
    const mountChat = vi.fn();
    const onIdle = vi.fn();
    bootChat({ document: doc, loadMount: async () => ({ mountChat }), onIdle, isDesktop: () => false });
    expect(onIdle).not.toHaveBeenCalled();
    expect(mountChat).not.toHaveBeenCalled();
    doc.querySelector<HTMLElement>('[data-mobile="chat"]')?.click();
    await vi.waitFor(() => expect(mountChat).toHaveBeenCalledTimes(1));
  });
});
