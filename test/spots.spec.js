// The spot finder on the saved pages (roadmap Phase 2), at 1280 and 390 px: Bracel always has a home, never stands on
// a control, never under a sticky header, keeps away from what is being typed in and from open dialogs, and follows
// pages that swap their body.
import { test, expect } from "@playwright/test";
import { PAGES, withBracel, spotsOf, until } from "./helpers.js";

for (const width of [1280, 390]) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport: { width, height: width > 500 ? 800 : 844 } });
    for (const name of PAGES) {
      test(`${name}: spots are sane and Bracel finds one`, async ({ page }) => {
        const errors = await withBracel(page, name);
        const spots = await spotsOf(page);
        expect(spots.filter(s => s.view)).toHaveLength(1);                     // the bottom of the window
        for (const s of spots) {
          expect(s.r - s.l).toBeGreaterThanOrEqual(s.minW - 0.5);              // room to stand
          expect(s.l).toBeGreaterThanOrEqual(0); expect(s.r).toBeLessThanOrEqual(width);
          expect(["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "LABEL"]).not.toContain(s.tag);
          if (s.kind === "bar") expect(s.y + s.h).toBeLessThanOrEqual(width > 500 ? 800 : 844);
          else expect(s.y - s.h).toBeGreaterThanOrEqual(-6);
        }
        await until(page, () => bracelDemo.engine.shown());
        expect(errors).toEqual([]);
      });
    }
  });
}

test("Bracely-like page: the top bar to hang from, the panes to stand on", async ({ page }) => {
  await withBracel(page, "bracely");
  const spots = await spotsOf(page);
  expect(spots.some(s => s.kind === "bar" && s.cls.includes("appbar"))).toBe(true);
  expect(spots.filter(s => s.kind === "ledge" && s.cls === "pane").length).toBe(2);
});

for (const [name, top] of [["docs", ".top"], ["sticky", "header"], ["feed", ".top"]]) {
  test(`${name}: nothing to stand on under the sticky header`, async ({ page }) => {
    await withBracel(page, name);
    await page.mouse.wheel(0, 500); await page.waitForTimeout(400);
    const bottom = await page.evaluate(sel => document.querySelector(sel).getBoundingClientRect().bottom, top);
    for (const s of await spotsOf(page)) if (s.kind !== "bar") expect(s.y - s.h).toBeGreaterThanOrEqual(bottom - 6);
  });
}

test("feed: no spot over the box being typed in", async ({ page }) => {
  await withBracel(page, "feed");
  await page.focus("#compose"); await page.waitForTimeout(100);
  const box = await page.evaluate(() => { const r = document.querySelector("#compose").getBoundingClientRect(); return { l: r.left - 40, r: r.right + 40, t: r.top - 40, b: r.bottom + 40 }; });
  for (const s of await spotsOf(page)) {
    const t = s.kind === "bar" ? s.y : s.y - s.h, b = s.kind === "bar" ? s.y + s.h : s.y;
    expect(s.l < box.r && s.r > box.l && t < box.b && b > box.t).toBe(false);
  }
});

test("dialog: Bracel leaves while a modal is open and comes back after", async ({ page }) => {
  await withBracel(page, "dialog");
  await until(page, () => bracelDemo.engine.shown());
  await page.click("#open");
  await until(page, () => bracelDemo.spots.overlay() && !bracelDemo.engine.shown(), null, 5000);
  expect(await spotsOf(page)).toHaveLength(0);
  await page.click("#close");
  await until(page, () => !bracelDemo.spots.overlay() && bracelDemo.engine.shown(), null, 12000);
});

test("spa: after the body is swapped, Bracel finds the new page", async ({ page }) => {
  const errors = await withBracel(page, "spa");
  await until(page, () => bracelDemo.engine.shown());
  await page.evaluate(() => window.view2());
  await until(page, () => bracelDemo.spots.surfaces().some(s => s.el.id === "p2"), null, 8000);
  await until(page, () => { const s = bracelDemo.engine._t.st.spot; return bracelDemo.engine.shown() && s && s.el.isConnected; }, null, 12000);
  expect(await page.evaluate(() => document.querySelector("bracel-cat").isConnected)).toBe(true);
  expect(errors).toEqual([]);
});

test("themes: light and dark pages are told apart", async ({ page }) => {
  await withBracel(page, "dark", { show: false }); await page.evaluate(() => bracelDemo.spots.start());
  expect(await page.evaluate(() => bracelDemo.spots.theme())).toBe("dark");
  await withBracel(page, "news", { show: false }); await page.evaluate(() => bracelDemo.spots.start());
  expect(await page.evaluate(() => bracelDemo.spots.theme())).toBe("light");
});

test("budget: a full scan of the long page stays small, and a slice stays near 4 ms", async ({ page }) => {
  await withBracel(page, "long", { show: false });
  const r = await page.evaluate(async () => {
    const s = bracelDemo.spots; s.start();
    const t0 = performance.now(); s.scanNow(); const full = performance.now() - t0;
    // the background scan: watch the longest task while it runs
    let longest = 0; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) longest = Math.max(longest, e.duration); }); po.observe({ type: "longtask", buffered: false });
    window.scrollBy(0, 4000); await new Promise(r => setTimeout(r, 1500)); po.disconnect();
    return { full, longest, n: document.getElementsByTagName("*").length };
  });
  expect(r.n).toBeGreaterThan(1000);
  expect(r.full).toBeLessThan(80);
  expect(r.longest).toBeLessThan(60);   // no long task from the scan (longtask entries start at 50 ms)
});
