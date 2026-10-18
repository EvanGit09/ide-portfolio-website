import type { Page, Route } from "@playwright/test";
import { BOTID_CHALLENGE_PATH, BOTID_CHALLENGE_STUB } from "../../../server/dev/botid-challenge-stub";

export type UiChunk = Record<string, unknown>;

export interface ChatRequestBody {
  id: string;
  messages: { role: string; parts: { type: string; text?: string }[] }[];
  [key: string]: unknown;
}

const STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  "x-vercel-ai-ui-message-stream": "v1",
};

export function textChunks(text: string, id = "t1"): UiChunk[] {
  return [
    { type: "start" },
    { type: "text-start", id },
    { type: "text-delta", id, delta: text },
    { type: "text-end", id },
    { type: "finish" },
  ];
}

export function errorChunks(errorText: string): UiChunk[] {
  return [{ type: "start" }, { type: "error", errorText }];
}

export function sseBody(chunks: readonly UiChunk[]): string {
  const lines = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`);
  return [...lines, "data: [DONE]\n\n"].join("");
}

export function fulfilStream(route: Route, chunks: readonly UiChunk[]): Promise<void> {
  return route.fulfill({ status: 200, headers: STREAM_HEADERS, body: sseBody(chunks) });
}

export function fulfilReply(route: Route, text: string): Promise<void> {
  return fulfilStream(route, textChunks(text));
}

export function fulfilStatus(route: Route, status: number, body = "error"): Promise<void> {
  return route.fulfill({ status, contentType: "text/plain", body });
}

export function readBody(route: Route): ChatRequestBody {
  return route.request().postDataJSON() as ChatRequestBody;
}

type ControlledWindow = Window & { __chatControllers?: ReadableStreamDefaultController<Uint8Array>[]; __chatAborts?: number };

export async function installControlledStream(page: Page): Promise<void> {
  await page.addInitScript((headers: Record<string, string>) => {
    const w = window as ControlledWindow;
    w.__chatControllers = [];
    w.__chatAborts = 0;
    const realFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      if (!url.endsWith("/api/chat")) return realFetch(input, init);
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          w.__chatControllers?.push(controller);
          init?.signal?.addEventListener("abort", () => {
            w.__chatAborts = (w.__chatAborts ?? 0) + 1;
            try {
              controller.error(new DOMException("aborted", "AbortError"));
            } catch {
              return;
            }
          });
        },
      });
      return Promise.resolve(new Response(body, { status: 200, headers }));
    };
  }, STREAM_HEADERS);
}

export async function pushChunks(page: Page, chunks: readonly UiChunk[], index = 0): Promise<void> {
  const payload = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("");
  await page.waitForFunction((i) => !!(window as ControlledWindow).__chatControllers?.[i], index);
  await page.evaluate(
    ([i, text]) => (window as ControlledWindow).__chatControllers?.[i as number].enqueue(new TextEncoder().encode(text as string)),
    [index, payload] as const,
  );
}

export async function closeStream(page: Page, index = 0): Promise<void> {
  await page.evaluate((i) => (window as ControlledWindow).__chatControllers?.[i].close(), index);
}

export async function stubBotIdChallenge(page: Page): Promise<void> {
  await page.route(`**${BOTID_CHALLENGE_PATH}*`, (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: BOTID_CHALLENGE_STUB }),
  );
}

export function abortCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as ControlledWindow).__chatAborts ?? 0);
}
