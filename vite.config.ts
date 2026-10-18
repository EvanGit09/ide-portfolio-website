/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist", assetsDir: "static" },
  test: {
    passWithNoTests: true,
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      include: ["server/**", "src/**"],
      exclude: ["**/*.test.{ts,tsx}", "src/test/**"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["server/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "ui",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["src/test/setup.ts"],
        },
      },
    ],
  },
});
