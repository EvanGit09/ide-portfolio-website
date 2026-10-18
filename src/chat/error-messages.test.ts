import { describe, expect, it } from "vitest";
import { SERVER_FRIENDLY_MESSAGES, getChatErrorMessage } from "./error-messages";

const GENERIC = "Something went wrong. Please try again.";
const UNAVAILABLE = "The assistant is unavailable right now. Please try again later.";

describe("getChatErrorMessage", () => {
  it.each([
    [400, "That message couldn't be sent. Try rephrasing it."],
    [403, "Your request was blocked. Refresh the page and try again."],
    [413, "That message is too long. Please shorten it."],
    [429, "You're sending messages too quickly. Wait a minute and try again."],
  ])("maps status %i to a friendly message", (statusCode, expected) => {
    expect(getChatErrorMessage({ statusCode, message: "<html>raw</html>" })).toBe(expected);
  });

  it("never exposes the raw body for 429", () => {
    expect(getChatErrorMessage({ statusCode: 429, message: "secret body" })).not.toContain("secret");
  });

  it("maps every 5xx to the unavailable message and ignores the body", () => {
    expect(getChatErrorMessage({ statusCode: 500, message: "Model offline." })).toBe(UNAVAILABLE);
    expect(getChatErrorMessage({ statusCode: 502, message: "<html>bad</html>" })).toBe(UNAVAILABLE);
    expect(getChatErrorMessage({ statusCode: 503 })).toBe(UNAVAILABLE);
  });

  it.each(SERVER_FRIENDLY_MESSAGES)("shows the known server message: %s", (message) => {
    expect(getChatErrorMessage({ message })).toBe(message);
    expect(getChatErrorMessage({ message: `  ${message}\n` })).toBe(message);
  });

  it("never forwards unknown server or SDK text", () => {
    expect(getChatErrorMessage({ message: "Internal: key sk-123 invalid" })).toBe(GENERIC);
    expect(getChatErrorMessage({ message: `${SERVER_FRIENDLY_MESSAGES[1]} extra` })).toBe(GENERIC);
    expect(getChatErrorMessage({ statusCode: 418, message: "teapot" })).toBe(GENERIC);
    expect(getChatErrorMessage({})).toBe(GENERIC);
  });

  it("detects network failures", () => {
    const network = "Couldn't reach the assistant. Check your connection and try again.";
    expect(getChatErrorMessage({ message: "Failed to fetch" })).toBe(network);
    expect(getChatErrorMessage({ message: "TypeError: NetworkError when attempting to fetch resource." })).toBe(network);
    expect(getChatErrorMessage({ message: "Load failed" })).toBe(network);
  });
});
