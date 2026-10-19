import { expect, test, type Page } from "@playwright/test";
import { ChatPage } from "./helpers/chat-page";
import { openExplorerFile, readCspViolations, recordCspViolations } from "./helpers/csp";

const PROD_URL = process.env.PROD_CSP_URL;
const BOTID_PREFIX = "/149e9513-01fa-4fb0-aad4-566afd725d1b/";
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
  const botIdRequests: string[] = [];
  page.on("requestfinished", (req) => {
    if (new URL(req.url()).pathname.startsWith(BOTID_PREFIX)) botIdRequests.push(req.url());
  });
  const chat = new ChatPage(page);
  await page.goto("/");

  for (const file of FILES) await openExplorerFile(page, file, false);
  await expect(chat.input).toBeEnabled({ timeout: 30_000 });

  // BotID loads its challenge lazily on the first protected fetch, so it is exercised by sending.
  const apiResponse = page.waitForResponse(
    (res) => new URL(res.url()).pathname === "/api/chat" && res.request().method() === "POST",
    { timeout: 60_000 },
  );
  await chat.ask("Hi");
  const status = (await apiResponse).status();
  await expect(chat.messages.nth(SEEDED_MESSAGE_COUNT + 1)).toBeVisible({ timeout: 60_000 });
  await expect(chat.send).toBeVisible({ timeout: 60_000 });
  process.stdout.write(`/api/chat responded ${status}\n`);

  const violations = (await readCspViolations(page)).map(({ directive, blockedURI, sourceFile }) => ({ directive, blockedURI, sourceFile }));
  process.stdout.write(`${JSON.stringify({ violations, consoleMessages, botIdRequests }, null, 2)}\n`);
  expect(botIdRequests.length).toBeGreaterThan(0);
  expect(violations).toEqual([]);
  expect(consoleMessages).toEqual([]);
});
