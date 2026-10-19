import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "csp.prod.spec.ts",
  reporter: "list",
  timeout: 120_000,
  use: { baseURL: process.env.PROD_CSP_URL, trace: "retain-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
});
