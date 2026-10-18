import type { Locator, Page } from "@playwright/test";
import { stubBotIdChallenge } from "./chat-stream";

const SCREENSHOT_DIR = process.env.CHAT_SCREENSHOT_DIR;

export class ChatPage {
  readonly panel: Locator;
  readonly input: Locator;
  readonly messages: Locator;
  readonly send: Locator;
  readonly stop: Locator;
  readonly typing: Locator;
  readonly error: Locator;
  readonly retry: Locator;

  constructor(readonly page: Page) {
    this.panel = page.locator("#chat-panel");
    this.input = this.panel.locator(".chat-composer__input");
    this.messages = this.panel.locator(".chat-message");
    this.send = this.panel.getByRole("button", { name: "Send message" });
    this.stop = this.panel.getByRole("button", { name: "Stop generating" });
    this.typing = this.panel.locator(".chat-typing");
    this.error = this.panel.locator(".chat-error");
    this.retry = this.panel.locator(".chat-error__retry");
  }

  get lastReply(): Locator {
    return this.panel.locator(".chat-message--ai").last();
  }

  async open(): Promise<void> {
    await stubBotIdChallenge(this.page);
    await this.page.goto("/");
  }

  async ask(text: string): Promise<void> {
    await this.input.fill(text);
    await this.input.press("Enter");
  }

  async screenshot(target: "page" | "panel", name: string): Promise<void> {
    if (!SCREENSHOT_DIR) return;
    const path = `${SCREENSHOT_DIR}/${name}.png`;
    if (target === "page") await this.page.screenshot({ path, fullPage: true });
    else await this.panel.screenshot({ path });
  }
}
