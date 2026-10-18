import { expect, test } from "@playwright/test";
import { getChatErrorMessage, SERVER_FRIENDLY_MESSAGES } from "../../src/chat/error-messages";
import { ChatPage } from "./helpers/chat-page";
import {
  abortCount,
  closeStream,
  errorChunks,
  fulfilReply,
  fulfilStatus,
  fulfilStream,
  installControlledStream,
  pushChunks,
  readBody,
  textChunks,
  type ChatRequestBody,
} from "./helpers/chat-stream";

const MARKDOWN_REPLY = "Here is **bold** text.\n\n- first\n- second\n\n```ts\nconst answer = 42;\n```";
const SEED_LABELS = ["You", "Agent", "You", "Agent", "You", "Agent"];

test.describe("chat island (desktop)", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, "desktop layout");
  });

  test("mounts over the static fallback with the seeded conversation", async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.open();
    await expect(chat.input).toBeEnabled();
    await expect(chat.panel.locator(".chat-fallback")).toHaveCount(0);
    await expect(chat.messages).toHaveCount(6);
    await expect(chat.panel.locator(".chat-message__label")).toHaveText(SEED_LABELS);
    await expect(chat.messages.first()).toContainText("Tell me about Corey Birnie");
    await expect(chat.messages.last()).toContainText("predict stock prices");
  });

  test("sends on Enter with a minimal request body", async ({ page }) => {
    let body: ChatRequestBody | undefined;
    await page.route("**/api/chat", (route) => {
      body = readBody(route);
      return fulfilReply(route, "Hi there.");
    });
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Where is Corey based?");

    await expect(chat.messages.nth(6)).toContainText("Where is Corey based?");
    await expect(chat.lastReply).toContainText("Hi there.");
    expect(Object.keys(body ?? {}).sort()).toEqual(["id", "messages"]);
    const messages = body?.messages ?? [];
    expect(messages.length).toBeLessThanOrEqual(12);
    expect(messages.at(-1)?.role).toBe("user");
    expect(messages.at(-1)?.parts[0]?.text).toBe("Where is Corey based?");
    expect(messages.some((m) => m.role === "system")).toBe(false);
  });

  test("caps the request history at 12 messages", async ({ page }) => {
    const sizes: number[] = [];
    await page.route("**/api/chat", (route) => {
      sizes.push(readBody(route).messages.length);
      return fulfilReply(route, "ok");
    });
    const chat = new ChatPage(page);
    await chat.open();
    for (let i = 1; i <= 4; i += 1) {
      await chat.ask(`question ${i}`);
      await expect(chat.messages).toHaveCount(6 + i * 2);
    }
    expect(sizes).toEqual([7, 9, 11, 12]);
  });

  test("streams a markdown reply incrementally with a typing indicator", async ({ page }) => {
    await installControlledStream(page);
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Format something");

    await pushChunks(page, [{ type: "start" }, { type: "text-start", id: "t1" }]);
    await expect(chat.typing).toBeVisible();
    await chat.screenshot("panel", "desktop-typing-indicator");

    await pushChunks(page, [{ type: "text-delta", id: "t1", delta: "Here is **bold** text.\n\n- first\n" }]);
    await expect(chat.lastReply.locator("strong")).toHaveText("bold");
    await expect(chat.typing).toHaveCount(0);
    await expect(chat.lastReply).not.toContainText("const answer");

    await pushChunks(page, [
      { type: "text-delta", id: "t1", delta: "- second\n\n```ts\nconst answer = 42;\n```" },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ]);
    await closeStream(page);

    await expect(chat.lastReply.locator("ul li")).toHaveCount(2);
    await expect(chat.lastReply.locator("pre code")).toContainText("const answer = 42;");
    await expect(chat.send).toBeVisible();
  });

  test("renders markdown and offers Copy and Retry on the last reply", async ({ page }) => {
    await page.route("**/api/chat", (route) => fulfilReply(route, MARKDOWN_REPLY));
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Format something");

    await expect(chat.lastReply.locator("strong")).toHaveText("bold");
    await expect(chat.lastReply.locator("ul li")).toHaveCount(2);
    await expect(chat.lastReply.locator("pre code")).toContainText("const answer = 42;");
    await expect(chat.lastReply.getByRole("button", { name: "Copy message" })).toBeVisible();
    await expect(chat.lastReply.getByRole("button", { name: "Retry response" })).toBeVisible();
    await chat.screenshot("page", "desktop-markdown-reply");
  });

  test("Stop ends a slow stream and restores Send", async ({ page }) => {
    await installControlledStream(page);
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Tell me a long story");

    await pushChunks(page, [{ type: "start" }, { type: "text-start", id: "t1" }, { type: "text-delta", id: "t1", delta: "Once upon" }]);
    await expect(chat.stop).toBeVisible();
    await expect(chat.send).toHaveCount(0);
    await expect(chat.lastReply).toContainText("Once upon");

    await chat.stop.click();
    await expect(chat.send).toBeVisible();
    await expect(chat.stop).toHaveCount(0);
    await expect(chat.typing).toHaveCount(0);
    await expect(chat.lastReply).toContainText("Once upon");
    await expect.poll(() => abortCount(page)).toBe(1);
  });

  test("opens reply links in a new tab with noopener", async ({ page }) => {
    await page.route("**/api/chat", (route) => fulfilReply(route, "See [Corey](https://example.com/corey) now."));
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Link please");

    const link = chat.lastReply.getByRole("link", { name: "Corey" });
    await expect(link).toHaveAttribute("href", "https://example.com/corey");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });
});

test.describe("chat errors (desktop)", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, "desktop layout");
  });

  test("429 shows rate-limit copy and Retry recovers", async ({ page }) => {
    let calls = 0;
    await page.route("**/api/chat", (route) => {
      calls += 1;
      return calls === 1 ? fulfilStatus(route, 429, "Too many requests") : fulfilReply(route, "Back in business.");
    });
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Hello");

    const expected = getChatErrorMessage({ statusCode: 429 });
    await expect(chat.error).toContainText(expected);
    await expect(chat.error).toContainText(/too quickly/i);
    await chat.screenshot("page", "desktop-error-retry");
    await chat.retry.click();

    await expect(chat.lastReply).toContainText("Back in business.");
    await expect(chat.error).toHaveCount(0);
    expect(calls).toBe(2);
  });

  const statusCases: { status: number; pattern: RegExp }[] = [
    { status: 500, pattern: /unavailable/i },
    { status: 403, pattern: /blocked/i },
  ];
  for (const { status, pattern } of statusCases) {
    test(`${status} shows the mapped copy`, async ({ page }) => {
      await page.route("**/api/chat", (route) => fulfilStatus(route, status));
      const chat = new ChatPage(page);
      await chat.open();
      await chat.ask("Hello");

      await expect(chat.error).toContainText(getChatErrorMessage({ statusCode: status }));
      await expect(chat.error).toContainText(pattern);
      await expect(chat.retry).toBeVisible();
    });
  }

  test("mid-stream error chunk surfaces the friendly server message", async ({ page }) => {
    const friendly = SERVER_FRIENDLY_MESSAGES[1];
    await page.route("**/api/chat", (route) => fulfilStream(route, errorChunks(friendly)));
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Hello");

    await expect(chat.error).toContainText(friendly);
  });

  test("network failure shows the connection copy", async ({ page }) => {
    await page.route("**/api/chat", (route) => route.abort());
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Hello");

    await expect(chat.error).toContainText(getChatErrorMessage({ message: "Failed to fetch" }));
    await expect(chat.error).toContainText(/couldn't reach/i);
  });
});

test.describe("chat security and accessibility (desktop)", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, "desktop layout");
  });

  test("neutralises hostile markdown and HTML in replies", async ({ page }) => {
    const hostile = [
      'Hello <img src=x onerror="window.__xss=1"> there',
      "<script>window.__xss=1</script>",
      "![a](https://example.com/x.png)",
      "[click](javascript:window.__xss=1)",
    ].join("\n\n");
    const dialogs: string[] = [];
    const imageRequests: string[] = [];
    page.on("dialog", (dialog) => dialogs.push(dialog.message()));
    page.on("request", (req) => {
      if (req.url().includes("example.com/x.png")) imageRequests.push(req.url());
    });
    await page.route("**/api/chat", (route) => fulfilReply(route, hostile));
    const chat = new ChatPage(page);
    await chat.open();
    await chat.ask("Attack");

    await expect(chat.lastReply).toContainText("Hello");
    await expect(chat.lastReply).toContainText("click");
    await expect(chat.panel.locator("img")).toHaveCount(0);
    await expect(chat.panel.locator("script")).toHaveCount(0);
    await expect(chat.panel.locator('a[href^="javascript:" i]')).toHaveCount(0);
    const flagAfterSettle = await page.evaluate(
      () => new Promise<unknown>((resolve) => setTimeout(() => resolve((window as Window & { __xss?: number }).__xss), 500)),
    );
    expect(flagAfterSettle).toBeUndefined();
    expect(dialogs).toEqual([]);
    expect(imageRequests).toEqual([]);
  });

  test("exposes accessible names for the log and controls", async ({ page }) => {
    await installControlledStream(page);
    const chat = new ChatPage(page);
    await chat.open();
    await expect(chat.panel.getByRole("log", { name: "Conversation" })).toHaveCount(1);
    await expect(chat.input).toHaveAttribute("aria-label", "Message the agent");
    await expect(chat.send).toBeVisible();

    await chat.ask("Hello");
    await pushChunks(page, [{ type: "start" }, { type: "text-start", id: "t1" }, { type: "text-delta", id: "t1", delta: "Hi" }]);
    await expect(chat.stop).toBeVisible();
    await pushChunks(page, [{ type: "text-end", id: "t1" }, { type: "finish" }]);
    await closeStream(page);

    await expect(chat.lastReply.getByRole("button", { name: "Copy message" })).toBeVisible();
    await expect(chat.lastReply.getByRole("button", { name: "Retry response" })).toBeVisible();
    await expect(chat.send).toBeVisible();
  });
});

test.describe("chat island (mobile)", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(!isMobile, "mobile layout");
  });

  test("lazy-loads on first tap, uses 16px input and replies in the overlay", async ({ page }) => {
    const chunkRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("vendor-assistant-ui")) chunkRequests.push(req.url());
    });
    await page.route("**/api/chat", (route) => fulfilStream(route, textChunks("Mobile **reply** works.")));
    const chat = new ChatPage(page);
    await chat.open();
    await page.waitForLoadState("networkidle");
    expect(chunkRequests).toEqual([]);

    await page.locator('[data-mobile="chat"]').tap();
    await expect(chat.input).toBeEnabled();
    expect(chunkRequests.length).toBeGreaterThan(0);
    await expect(page.locator("body")).toHaveClass(/mobile-chat-open/);
    await expect(chat.input).toHaveCSS("font-size", "16px");

    await chat.input.fill("Hello from mobile");
    await chat.send.tap();
    await expect(chat.lastReply.locator("strong")).toHaveText("reply");
    await chat.screenshot("page", "mobile-chat-overlay");

    await page.locator("#mobile-backdrop").tap({ position: { x: 20, y: 300 } });
    await expect(page.locator("body")).not.toHaveClass(/mobile-chat-open/);
  });
});
