import { expect, test } from "@playwright/test";
import { readCspPolicy } from "../../server/dev/csp";
import { ChatPage } from "./helpers/chat-page";
import { fulfilReply } from "./helpers/chat-stream";
import { openExplorerFile, readCspViolations, recordCspViolations } from "./helpers/csp";

const FILES = ["work-experience.ts", "projects.ts", "education.ts", "about.tsx", "cv.pdf"];

test.describe("content security policy", () => {
  test("serves the CSP header on the document", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["content-security-policy"]).toBe(readCspPolicy());
  });

  test("the site and chat run with zero violations", async ({ page, isMobile }) => {
    await page.route("**/api/chat", (route) => fulfilReply(route, "Policy-safe reply."));
    await recordCspViolations(page);
    const chat = new ChatPage(page);
    await chat.open();

    for (const file of FILES) {
      await openExplorerFile(page, file, isMobile);
      if (file === "cv.pdf") await expect(page.locator("iframe.pdf-frame")).toBeAttached();
    }

    if (isMobile) await page.locator('[data-mobile="chat"]').tap();
    await expect(chat.input).toBeEnabled();
    await chat.ask("Hello under CSP");
    await expect(chat.lastReply).toContainText("Policy-safe reply.");

    const violations = await readCspViolations(page);
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});
