import { expect, test, type Page } from "@playwright/test";

const CV_PATH = "/assets/Corey_Birnie_CV.pdf";

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

async function openFile(page: Page, name: string): Promise<void> {
  await page.locator("#file-tree").getByText(name, { exact: true }).click();
}

test.describe("document", () => {
  test("has title, JSON-LD and hidden SEO heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Corey Birnie/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
    await expect(page.locator(".seo-content h1")).toHaveCount(1);
    await expect(page.locator(".seo-content h1")).toContainText("Corey Birnie");
  });

  test("loads without console or page errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page.locator("#editor-content .code-line").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("serves robots.txt and sitemap.xml", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap: https://coreybirnie.com/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("https://coreybirnie.com");
  });
});

test.describe("editor", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, "explorer is an overlay on mobile");
  });

  test("renders the explorer file tree", async ({ page }) => {
    await page.goto("/");
    const tree = page.locator("#file-tree");
    await expect(tree.getByText("about.tsx", { exact: true })).toBeVisible();
    await expect(tree.getByText("work-experience.ts", { exact: true })).toBeVisible();
    await expect(tree.getByText("projects.ts", { exact: true })).toBeVisible();
    await expect(tree.getByText("education.ts", { exact: true })).toBeVisible();
    await expect(tree.getByText("cv.pdf", { exact: true })).toBeVisible();
  });

  for (const file of ["work-experience.ts", "projects.ts", "education.ts"]) {
    test(`opens ${file} in a tab and updates editor and breadcrumb`, async ({ page }) => {
      await page.goto("/");
      const content = page.locator("#editor-content");
      await expect(content.locator(".code-line").first()).toBeVisible();
      const before = await content.innerText();

      await openFile(page, file);

      await expect(page.locator("#tab-bar")).toContainText(file);
      await expect(page.locator("#breadcrumb-file")).toHaveText(file);
      await expect.poll(() => content.innerText()).not.toBe(before);
    });
  }

  test("shows the profile image on the about page", async ({ page }) => {
    await page.goto("/");
    const img = page.locator(".profile-image--linkedin");
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  });

  test("opens the CV in a PDF viewer with a working src and download link", async ({ page, request }) => {
    await page.goto("/");
    await openFile(page, "cv.pdf");

    const frame = page.locator("iframe.pdf-frame");
    await expect(frame).toBeAttached();
    const download = page.locator("a.pdf-download-btn");
    await expect(download).toBeAttached();

    for (const url of [await frame.getAttribute("src"), await download.getAttribute("href")]) {
      expect(url).toBeTruthy();
      const res = await request.get(new URL(url as string, page.url()).toString());
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/pdf");
    }
    await expect(frame).toHaveAttribute("src", /Corey_Birnie_CV\.pdf$/);
  });

  test("serves the CV at its canonical path", async ({ request }) => {
    const res = await request.get(CV_PATH);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });

  test("shows the chat panel with the Agent header and collapses it", async ({ page }) => {
    await page.goto("/");
    const panel = page.locator("#chat-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".chat-panel__header-title")).toHaveText("Agent");

    await panel.locator(".chat-panel__close").click();

    await expect(page.locator(".vscode-shell")).toHaveClass(/chat-collapsed/);
    await expect(panel).toHaveCSS("opacity", "0");
    await expect.poll(async () => (await panel.boundingBox())?.width ?? 0).toBeLessThan(5);
  });
});

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(!isMobile, "mobile only");
  });

  test("shows the bottom nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mobile-nav")).toBeVisible();
  });

  test("explorer button opens the sidebar overlay and backdrop closes it", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-mobile="explorer"]').tap();
    await expect(page.locator("body")).toHaveClass(/mobile-sidebar-open/);
    await expect(page.locator("#explorer-sidebar")).toBeInViewport();

    await page.locator("#mobile-backdrop").tap({ position: { x: 380, y: 300 } });
    await expect(page.locator("body")).not.toHaveClass(/mobile-sidebar-open/);
  });

  test("chat button opens the chat overlay and backdrop closes it", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-mobile="chat"]').tap();
    await expect(page.locator("body")).toHaveClass(/mobile-chat-open/);
    await expect(page.locator("#chat-panel")).toBeInViewport();

    await page.locator("#mobile-backdrop").tap({ position: { x: 20, y: 300 } });
    await expect(page.locator("body")).not.toHaveClass(/mobile-chat-open/);
  });
});
