import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

afterEach(() => cleanup());

if (typeof globalThis.ResizeObserver === "undefined") {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
}

if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollTo ??= () => undefined;
  window.HTMLElement.prototype.scrollIntoView ??= () => undefined;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  window.requestIdleCallback ??= ((cb: IdleRequestCallback) =>
    window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0)) as typeof window.requestIdleCallback;
  window.cancelIdleCallback ??= ((id: number) => window.clearTimeout(id)) as typeof window.cancelIdleCallback;
}
