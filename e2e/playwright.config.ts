import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  outputDir: "./.results",
  use: { baseURL: "http://127.0.0.1:4499", locale: "ko-KR", screenshot: "only-on-failure" },
  webServer: { command: "node stack.mjs", url: "http://127.0.0.1:54421/health", timeout: 120_000, gracefulShutdown: { signal: "SIGTERM", timeout: 5000 } },
});
