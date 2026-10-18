import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";
import { HISTORY_WINDOW, buildRequestBody, createChatTransport } from "./transport";

const makeMessages = (count: number): UIMessage[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `m${i}`,
    role: i % 2 === 0 ? "user" : "assistant",
    parts: [{ type: "text", text: `t${i}` }],
  }));

describe("buildRequestBody", () => {
  it("keeps only the last HISTORY_WINDOW messages and the chat id", () => {
    const body = buildRequestBody("chat-1", makeMessages(30));
    expect(Object.keys(body).sort()).toEqual(["id", "messages"]);
    expect(body.id).toBe("chat-1");
    expect(body.messages).toHaveLength(HISTORY_WINDOW);
    expect(body.messages[0].id).toBe("m18");
    expect(body.messages.at(-1)?.id).toBe("m29");
  });

  it("keeps every message when under the window", () => {
    expect(buildRequestBody("c", makeMessages(3)).messages).toHaveLength(3);
  });

  it("does not mutate the input", () => {
    const input = makeMessages(20);
    buildRequestBody("c", input);
    expect(input).toHaveLength(20);
  });
});

describe("createChatTransport", () => {
  it("posts only { id, messages } to the configured api", async () => {
    let captured: { url: string; body: unknown } | undefined;
    const transport = createChatTransport("/api/test", (async (url: RequestInfo | URL, init?: RequestInit) => {
      captured = { url: String(url), body: JSON.parse(String(init?.body)) };
      return new Response("", { status: 400 });
    }) as typeof fetch);
    await transport
      .sendMessages({
        chatId: "abc",
        messages: makeMessages(15),
        trigger: "submit-message",
        messageId: undefined,
        abortSignal: undefined,
        body: { system: "evil" },
      })
      .catch(() => undefined);
    expect(captured?.url).toBe("/api/test");
    expect(Object.keys(captured?.body as object).sort()).toEqual(["id", "messages"]);
    expect((captured?.body as { messages: unknown[] }).messages).toHaveLength(12);
  });
});
