import type { Page } from "@playwright/test";

export interface CspViolation {
  directive: string;
  blockedURI: string;
  sourceFile: string;
  disposition: string;
}

type ViolationWindow = Window & { __cspViolations?: CspViolation[] };

export async function recordCspViolations(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as ViolationWindow;
    w.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      w.__cspViolations?.push({
        directive: e.effectiveDirective,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
        disposition: e.disposition,
      });
    });
  });
}

export function readCspViolations(page: Page): Promise<CspViolation[]> {
  return page.evaluate(() => (window as ViolationWindow).__cspViolations ?? []);
}

export async function openExplorerFile(page: Page, name: string, isMobile: boolean): Promise<void> {
  if (isMobile) await page.locator('[data-mobile="explorer"]').tap();
  await page.locator("#file-tree").getByText(name, { exact: true }).click();
}
