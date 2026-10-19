import { expect, test, type Page } from "@playwright/test";
import { ChatPage } from "./helpers/chat-page";
import { openExplorerFile, readCspViolations, recordCspViolations } from "./helpers/csp";

const PROD_URL = process.env.PROD_CSP_URL;
const CHALLENGE_PATH = "/a-4-a/c.js";
const CV_PATH = "/assets/Corey_Birnie_CV.pdf";
const CSP_HEADERS = ["content-security-policy", "content-security-policy-report-only"];
const FILES = ["work-experience.ts", "projects.ts", "education.ts", "about.tsx", "cv.pdf"];
const SEEDED_MESSAGE_COUNT = 6;

test.skip(!PROD_URL, "set PROD_CSP_URL to run against the deployed site");

// Only "Refused to …" lines are violations; Chrome also warns that frame-ancestors is ignored in Report-Only.
function collectCspConsole(page: Page): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("Refused to")) messages.push(msg.text());
  });
  return messages;
}

function cspHeader(headers: Record<string, string>): string | undefined {
  const name = CSP_HEADERS.find((key) => headers[key]);
  return name ? headers[name] : undefined;
}

test("document carries a CSP and the PDF does not", async ({ request }) => {
  const doc = await request.get("/");
  expect(cspHeader(doc.headers())).toContain("default-src 'self'");
  const pdf = await request.get(CV_PATH);
  expect(pdf.status()).toBe(200);
  expect(cspHeader(pdf.headers())).toBeUndefined();
});

test("production page and chat raise no CSP violations", async ({ page }) => {
  const consoleMessages = collectCspConsole(page);
  await recordCspViolations(page);
  const challenge = page.waitForResponse((res) => res.url().includes(CHALLENGE_PATH), { timeout: 30_000 });
  const chat = new ChatPage(page);
  await page.goto("/");

  for (const file of FILES) await openExplorerFile(page, file, false);
  await expect(chat.input).toBeEnabled({ timeout: 30_000 });
  await challenge;

  await chat.ask("Hi");
  await expect(chat.lastReply.or(chat.error).first()).toBeVisible({ timeout: 60_000 });
  await expect(chat.messages.nth(SEEDED_MESSAGE_COUNT)).toBeVisible();

  const violations = (await readCspViolations(page)).map(({ directive, blockedURI, sourceFile }) => ({ directive, blockedURI, sourceFile }));
  process.stdout.write(`${JSON.stringify({ violations, consoleMessages }, null, 2)}\n`);
  expect(violations).toEqual([]);
  expect(consoleMessages).toEqual([]);
});
