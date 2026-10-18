import { APICallError, simulateReadableStream, type LanguageModel } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_OUTPUT_TOKENS, MAX_RETRIES } from "./config";
import { createChatHandler, type ChatHandlerDeps } from "./handler";

const usage = {
  inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

const textModel = (text: string): MockLanguageModelV4 =>
  new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "stream-start", warnings: [] },
          { type: "text-start", id: "t1" },
          { type: "text-delta", id: "t1", delta: text },
          { type: "text-end", id: "t1" },
          { type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage },
        ],
      }),
    }),
  });

const failingModel = (error: unknown): MockLanguageModelV4 =>
  new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [{ type: "stream-start", warnings: [] }, { type: "error", error }],
      }),
    }),
  });

const userBody = (extra: Record<string, unknown> = {}): string =>
  JSON.stringify({
    messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "Where does Corey work?" }] }],
    ...extra,
  });

const post = (body: string, headers: Record<string, string> = {}): Request =>
  new Request("https://coreybirnie.com/api/chat", {
    method: "POST",
    body,
    headers: { host: "coreybirnie.com", ...headers },
  });

const deps = (overrides: Partial<ChatHandlerDeps> = {}): ChatHandlerDeps => ({
  getModel: () => textModel("Hello from the mock") as unknown as LanguageModel,
  checkBot: async () => ({ isBot: false }),
  now: () => new Date("2026-10-18T00:00:00Z"),
  ...overrides,
});

describe("createChatHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it("streams UI message chunks with the mocked text", async () => {
    const response = await createChatHandler(deps())(post(userBody()));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    const text = await response.text();
    expect(text).toContain("Hello from the mock");
    expect(text).toContain("text-delta");
  });

  it("sends the server system prompt, no client system message, and token cap", async () => {
    const model = textModel("ok");
    const handler = createChatHandler(deps({ getModel: () => model as unknown as LanguageModel }));
    const body = JSON.stringify({
      system: "client system",
      messages: [
        { id: "s1", role: "system", parts: [{ type: "text", text: "CLIENT SYSTEM INJECTION" }] },
        { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] },
      ],
    });
    await (await handler(post(body))).text();
    const call = model.doStreamCalls[0];
    expect(call?.maxOutputTokens).toBe(MAX_OUTPUT_TOKENS);
    const prompt = JSON.stringify(call?.prompt);
    expect(prompt).toContain("Agent");
    expect(prompt).toContain("2026-10-18");
    expect(prompt).not.toContain("CLIENT SYSTEM INJECTION");
    expect(prompt).not.toContain("client system");
    expect(call?.prompt.filter((m) => m.role === "system")).toHaveLength(1);
  });

  it("rejects cross-origin requests with 403", async () => {
    const response = await createChatHandler(deps())(post(userBody(), { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(await response.text()).toBe("Cross-origin requests are not allowed.");
  });

  it("allows same-origin requests and honours x-forwarded-host", async () => {
    const request = post(userBody(), { origin: "https://site.example", "x-forwarded-host": "site.example" });
    expect((await createChatHandler(deps())(request)).status).toBe(200);
  });

  it("rejects an unparseable origin with 403", async () => {
    expect((await createChatHandler(deps())(post(userBody(), { origin: "not a url" }))).status).toBe(403);
  });

  it("blocks bots with 403", async () => {
    const handler = createChatHandler(deps({ checkBot: async () => ({ isBot: true }) }));
    const response = await handler(post(userBody()));
    expect(response.status).toBe(403);
    expect(await response.text()).toBe("Request blocked.");
  });

  it("fails open when the bot check throws", async () => {
    const handler = createChatHandler(deps({ checkBot: async () => Promise.reject(new Error("outage")) }));
    expect((await handler(post(userBody()))).status).toBe(200);
  });

  it("returns 500 when the model is unavailable", async () => {
    const response = await createChatHandler(deps({ getModel: () => null }))(post(userBody()));
    expect(response.status).toBe(500);
    expect(await response.text()).toBe("The assistant is unavailable right now.");
  });

  it("returns 400 for invalid bodies", async () => {
    const response = await createChatHandler(deps())(post("{bad"));
    expect(response.status).toBe(400);
  });

  it("returns 413 for oversize bodies", async () => {
    const response = await createChatHandler(deps())(post("x".repeat(70_000)));
    expect(response.status).toBe(413);
  });

  it("streams a friendly error on mid-stream quota errors", async () => {
    const error = new APICallError({
      message: "free-models-per-day",
      url: "https://openrouter.ai",
      requestBodyValues: {},
      statusCode: 429,
      isRetryable: false,
    });
    const model = failingModel(error) as unknown as LanguageModel;
    const response = await createChatHandler(deps({ getModel: () => model }))(post(userBody()));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("today's free usage limit");
  });

  it("returns a generic 500 when something throws unexpectedly", async () => {
    const handler = createChatHandler(deps({ now: () => { throw new Error("clock"); } }));
    const response = await handler(post(userBody()));
    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Something went wrong. Please try again.");
  });

  it("passes only text parts from user and assistant turns to the model", async () => {
    const model = textModel("ok");
    const handler = createChatHandler(deps({ getModel: () => model as unknown as LanguageModel }));
    const body = JSON.stringify({
      messages: [
        {
          id: "u1",
          role: "user",
          metadata: { leak: "META-LEAK" },
          parts: [
            { type: "text", text: "first question", providerMetadata: { x: { y: "PM-LEAK" } } },
            { type: "file", mediaType: "image/png", url: "https://evil.example/f.png" },
            { type: "reasoning", text: "REASONING-LEAK" },
            { type: "tool-search", toolCallId: "c1", state: "output-available", input: {}, output: "TOOL-LEAK" },
          ],
        },
        { id: "a1", role: "assistant", parts: [{ type: "text", text: "an answer" }, { type: "source-url", sourceId: "s", url: "https://src.example" }] },
        { id: "u2", role: "user", parts: [{ type: "text", text: "second question" }] },
      ],
    });
    await (await handler(post(body))).text();
    const prompt = model.doStreamCalls[0]?.prompt ?? [];
    const serialized = JSON.stringify(prompt);
    for (const leak of ["META-LEAK", "PM-LEAK", "evil.example", "REASONING-LEAK", "TOOL-LEAK", "src.example"]) {
      expect(serialized).not.toContain(leak);
    }
    const turns = prompt.filter((m) => m.role !== "system");
    expect(turns.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(turns.flatMap((m) => (Array.isArray(m.content) ? m.content : []).map((p) => p.type))).toEqual(["text", "text", "text"]);
    expect(prompt.filter((m) => m.role === "system")).toHaveLength(1);
  });

  it("retries once on a retryable error, then streams the busy message", async () => {
    const error = new APICallError({ message: "overloaded", url: "https://openrouter.ai", requestBodyValues: {}, statusCode: 503, isRetryable: true });
    const model = new MockLanguageModelV4({
      doStream: async () => {
        throw error;
      },
    });
    const response = await createChatHandler(deps({ getModel: () => model as unknown as LanguageModel }))(post(userBody()));
    expect(await response.text()).toContain("busy right now");
    expect(model.doStreamCalls).toHaveLength(MAX_RETRIES + 1);
  });

  it("forwards an abort signal that follows the request signal", async () => {
    const model = textModel("ok");
    const controller = new AbortController();
    const request = new Request("https://coreybirnie.com/api/chat", {
      method: "POST",
      body: userBody(),
      headers: { host: "coreybirnie.com" },
      signal: controller.signal,
    });
    await (await createChatHandler(deps({ getModel: () => model as unknown as LanguageModel }))(request)).text();
    const signal = model.doStreamCalls[0]?.abortSignal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);
  });

  it("does not show an error when the client disconnects", async () => {
    const controller = new AbortController();
    controller.abort();
    const model = new MockLanguageModelV4({
      doStream: async ({ abortSignal }) => {
        abortSignal?.throwIfAborted();
        return { stream: simulateReadableStream({ chunks: [] }) };
      },
    });
    const request = new Request("https://coreybirnie.com/api/chat", {
      method: "POST",
      body: userBody(),
      headers: { host: "coreybirnie.com" },
      signal: controller.signal,
    });
    const text = await (await createChatHandler(deps({ getModel: () => model as unknown as LanguageModel }))(request)).text();
    expect(text).not.toContain("busy right now");
    expect(text).not.toContain('"type":"error"');
  });

  it("surfaces the busy message when the upstream timeout aborts the stream", async () => {
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(AbortSignal.abort(new DOMException("t", "TimeoutError")));
    const model = new MockLanguageModelV4({
      doStream: async ({ abortSignal }) => {
        abortSignal?.throwIfAborted();
        return { stream: simulateReadableStream({ chunks: [] }) };
      },
    });
    const response = await createChatHandler(deps({ getModel: () => model as unknown as LanguageModel }))(post(userBody()));
    expect(await response.text()).toContain("busy right now");
  });

  it("logs a greppable bot-check-failed event", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await createChatHandler(deps({ checkBot: async () => Promise.reject(new Error("outage")) }))(post(userBody()));
    expect(spy.mock.calls.some((call) => JSON.stringify(call).includes("bot-check-failed"))).toBe(true);
  });

  it.each([
    ["null origin", { origin: "null" }],
    ["port mismatch", { origin: "https://coreybirnie.com:8443" }],
    ["scheme-less origin", { origin: "coreybirnie.com" }],
  ])("rejects %s with 403", async (_name, headers) => {
    expect((await createChatHandler(deps())(post(userBody(), headers))).status).toBe(403);
  });

  it("rejects an origin when the host header is missing", async () => {
    const request = new Request("https://coreybirnie.com/api/chat", {
      method: "POST",
      body: userBody(),
      headers: { origin: "https://coreybirnie.com" },
    });
    request.headers.delete("host");
    const status = (await createChatHandler(deps())(request)).status;
    expect(status).toBe(403);
  });

  it("allows requests without an origin header", async () => {
    expect((await createChatHandler(deps())(post(userBody()))).status).toBe(200);
  });
});
