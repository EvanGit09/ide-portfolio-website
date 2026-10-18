import { initBotId } from "botid/client/core";

const ROOT_ID = "chat-root";
const IDLE_FALLBACK_MS = 200;
const DESKTOP_QUERY = "(min-width: 1025px)";

type MountModule = { mountChat: (container: HTMLElement) => void };

export interface BootDeps {
  document: Document;
  loadMount: () => Promise<MountModule>;
  onIdle: (callback: () => void) => void;
  isDesktop: () => boolean;
}

const defaultOnIdle = (callback: () => void): void => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(callback);
  else window.setTimeout(callback, IDLE_FALLBACK_MS);
};

const defaultIsDesktop = (): boolean => window.matchMedia(DESKTOP_QUERY).matches;

export function bootChat({ document: doc, loadMount, onIdle, isDesktop }: BootDeps): void {
  const root = doc.getElementById(ROOT_ID);
  if (!root) {
    console.error(`[chat] #${ROOT_ID} not found; chat disabled`);
    return;
  }
  let started = false;
  const start = (): void => {
    if (started) return;
    started = true;
    loadMount().then(
      ({ mountChat }) => {
        try {
          mountChat(root);
        } catch (error: unknown) {
          console.error("[chat] chat mount failed; showing static fallback", error);
        }
      },
      (error: unknown) => {
        started = false;
        console.error("[chat] chat chunk failed to load; showing static fallback", error);
      },
    );
  };
  if (isDesktop()) onIdle(start);
  doc.querySelector('[data-mobile="chat"]')?.addEventListener("click", start);
}

export function initChat(): void {
  initBotId({ protect: [{ path: "/api/chat", method: "POST" }] });
  bootChat({
    document,
    loadMount: () => import("./mount"),
    onIdle: defaultOnIdle,
    isDesktop: defaultIsDesktop,
  });
}
