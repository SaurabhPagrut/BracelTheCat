// Tests: the engine and the spot finder on the saved pages (test/pages, served locally, no network), and the built
// extension end to end. Live sites only with npm run test:live.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  globalSetup: "./test/global-setup.js",
  timeout: 60000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:8080", viewport: { width: 1280, height: 800 } },
  testIgnore: process.env.LIVE ? [] : ["**/live.spec.js"],
  webServer: { command: "node scripts/serve.mjs", url: "http://localhost:8080/test/pages/index.html", reuseExistingServer: true }
});
