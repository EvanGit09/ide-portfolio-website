/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const nm = (names: string) => new RegExp(`node_modules/(${names})/`);

const VENDOR_GROUPS = [
  { name: "vendor-react", test: nm("react|react-dom|scheduler"), priority: 40 },
  { name: "vendor-ai", test: nm("ai|@ai-sdk/[^/]+|@opentelemetry/api|zod|eventsource-parser|json-schema"), priority: 30 },
  { name: "vendor-assistant-ui", test: nm("@assistant-ui/[^/]+|assistant-stream|assistant-cloud|@radix-ui/[^/]+|nanoid"), priority: 20 },
  {
    name: "vendor-markdown",
    test: nm(
      "react-markdown|remark-[^/]+|rehype-[^/]+|micromark[^/]*|mdast-[^/]+|hast-[^/]+|unified|unist-[^/]+|vfile[^/]*|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities[^/]*|trim-lines|trough|bail|devlop|estree-[^/]+|html-url-attributes|is-plain-obj|ccount|markdown-table|zwitch|longest-streak|stringify-entities",
    ),
    priority: 10,
  },
];

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "static",
    chunkSizeWarningLimit: 700, // vendor-assistant-ui is lazy-loaded and ~680KB raw
    rolldownOptions: { output: { codeSplitting: { groups: VENDOR_GROUPS } } },
  },
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
