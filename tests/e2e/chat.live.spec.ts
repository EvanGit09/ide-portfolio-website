import { expect, test } from "@playwright/test";
import { ChatPage } from "./helpers/chat-page";

const ANSWER_TIMEOUT_MS = 90_000;
const SEEDED_MESSAGE_COUNT = 6;

test.skip(!process.env.LIVE_CHAT, "set LIVE_CHAT=1 to run against the real model");

test.describe("live chat smoke (desktop)", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, "desktop only");
  });

  async function askAndExpect(chat: ChatPage, question: string, answer: RegExp, replyIndex: number): Promise<string> {
    await chat.ask(question);
    const reply = chat.messages.nth(replyIndex);
    const outcome = chat.error.or(reply.getByText(answer));
    await expect(outcome.first()).toBeVisible({ timeout: ANSWER_TIMEOUT_MS });
    if (await chat.error.isVisible()) {
      await chat.retry.click();
      await expect(chat.lastReply.getByText(answer)).toBeVisible({ timeout: ANSWER_TIMEOUT_MS });
    }
    return chat.lastReply.innerText();
  }

  test("answers a CV question and a trivial arithmetic question", async ({ page }, testInfo) => {
    testInfo.setTimeout(4 * ANSWER_TIMEOUT_MS);
    const chat = new ChatPage(page);
    await chat.open();
    await expect(chat.input).toBeEnabled();

    const first = await askAndExpect(chat, "Where did Corey study? Answer in one sentence.", /Durham/i, SEEDED_MESSAGE_COUNT + 1);
    testInfo.annotations.push({ type: "answer-1", description: first });
    await expect(chat.send).toBeVisible();

    const second = await askAndExpect(chat, "What is 12 multiplied by 12? Reply with just the number.", /144/, SEEDED_MESSAGE_COUNT + 3);
    testInfo.annotations.push({ type: "answer-2", description: second });
    await chat.screenshot("page", "desktop-live-answer");
  });
});
