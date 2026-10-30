// Optional smoke run on a few live sites (npm run test:live; not in CI, it needs the network): Bracel finds a spot,
// arrives, and the page logs no errors from it. The page's CSP is bypassed only so the test can add the scripts;
// the extension itself is injected by the browser and is not bound by it.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const SITES = ["https://en.wikipedia.org/wiki/Cat", "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API", "https://news.ycombinator.com/", "https://github.com/", "https://example.com/"];
const code = ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"].map(f => readFileSync(f, "utf8")).join("\n;\n");
test.use({ bypassCSP: true });
for (const url of SITES) {
  test(`live: ${url}`, async ({ page }) => {
    const errors = []; page.on("pageerror", e => { if (/Bracel|bracel/.test(e.stack || e.message)) errors.push(e.message); });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.addScriptTag({ content: code });
    await page.evaluate(() => bracelDemo.show());
    await page.waitForFunction(() => bracelDemo.engine.shown(), null, { timeout: 15000 });
    const n = await page.evaluate(() => bracelDemo.spots.surfaces().length);
    expect(n).toBeGreaterThan(0); expect(errors).toEqual([]);
  });
}
