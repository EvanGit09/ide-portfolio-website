import { APICallError, RetryError } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { logChatError, textResponse, toFriendlyStreamError } from "./errors";

const apiError = (statusCode: number | undefined, message = "boom", responseBody?: string): APICallError =>
  new APICallError({
    message,
    url: "https://openrouter.ai/api/v1/chat/completions",
    requestBodyValues: { secret: "user content" },
    statusCode,
    responseBody,
    responseHeaders: { authorization: "Bearer sk-secret" },
  });

describe("toFriendlyStreamError", () => {
  it("maps the daily free quota to the usage-limit message", () => {
    const text = toFriendlyStreamError(apiError(429, "Rate limit", '{"error":"free-models-per-day exceeded"}'));
    expect(text).toContain("today's free usage limit");
    expect(text).toContain("coreybirnie@gmail.com");
  });

  it("detects per-day in the message", () => {
    expect(toFriendlyStreamError(apiError(429, "limit per-day reached"))).toContain("today's free usage limit");
  });

  it("maps other 429s to busy", () => {
    expect(toFriendlyStreamError(apiError(429))).toContain("busy right now");
  });

  it("maps 5xx to busy", () => {
    expect(toFriendlyStreamError(apiError(503))).toContain("busy right now");
  });

  it("maps provider errors without status to busy", () => {
    expect(toFriendlyStreamError(apiError(undefined))).toContain("busy right now");
  });

  it("maps a 4xx API error to generic", () => {
    expect(toFriendlyStreamError(apiError(400))).toContain("Something went wrong");
  });

  it("unwraps RetryError to the last error", () => {
    const retry = new RetryError({ message: "retries", reason: "maxRetriesExceeded", errors: [apiError(429, "x", "per-day")] });
    expect(toFriendlyStreamError(retry)).toContain("today's free usage limit");
  });

  it.each([[new Error("x")], [null], [undefined], ["str"]])("maps unknown %s to generic", (error) => {
    expect(toFriendlyStreamError(error)).toBe("Something went wrong while generating a reply. Please try again.");
  });
});

describe("textResponse", () => {
  it("returns plain text with no-store", async () => {
    const response = textResponse(403, "nope");
    expect(response.status).toBe(403);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("nope");
  });
});

describe("logChatError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs status and name without secrets or content", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logChatError("stream", apiError(429, "rate limited"));
    const logged = JSON.stringify(spy.mock.calls);
    expect(logged).toContain("429");
    expect(logged).toContain("APICallError");
    expect(logged).not.toContain("sk-secret");
    expect(logged).not.toContain("user content");
  });

  it("handles non-error values", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logChatError("x", "weird");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("logs plain Errors by name only", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logChatError("x", new TypeError("something"));
    expect(JSON.stringify(spy.mock.calls)).toContain("TypeError");
  });
});
