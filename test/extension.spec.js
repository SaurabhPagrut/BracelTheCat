// The built extension end to end (roadmap Phases 3-5): popup, bringing Bracel and sending it away, the badge, the page
// left untouched, per-site off, the registered content script, and no network requests. Uses dist/test (host access
// granted at install, open Shadow DOM), built by test/global-setup.js.
import { test as base, expect, chromium } from "@playwright/test";
import { resolve } from "node:path";

const EXT = resolve("dist/test");
const test = base.extend({
  ctx: [async ({}, use) => {
    const ctx = await chromium.launchPersistentContext("", { channel: "chromium", viewport: { width: 1280, height: 800 }, args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] });
    await use(ctx); await ctx.close();
  }, { scope: "test" }],
  sw: async ({ ctx }, use) => { let [sw] = ctx.serviceWorkers(); if (!sw) sw = await ctx.waitForEvent("serviceworker"); await use(sw); },
  popup: async ({ ctx, sw }, use) => { const id = new URL(sw.url()).host, p = await ctx.newPage(); await p.goto(`chrome-extension://${id}/src/popup/popup.html`); await use(p); }
});
const U = "http://localhost:8080/test/pages/";
const tabIdOf = (sw, url) => sw.evaluate(async u => (await chrome.tabs.query({ url: u }))[0].id, url);
const send = (popup, msg) => popup.evaluate(m => chrome.runtime.sendMessage(m), msg);
const shown = page => page.evaluate(() => { const h = document.querySelector("bracel-cat"); return !!h && h.dataset.shown === "1"; });

test("the popup opens cleanly: show switch, coats, size, sound, folded actions and the credit", async ({ ctx, sw }) => {
  const id = new URL(sw.url()).host, p = await ctx.newPage(), errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto(`chrome-extension://${id}/src/popup/popup.html`);
  await expect(p.locator("#acts li")).toHaveCount(22);
  await expect(p.locator("#coats input")).toHaveCount(5);
  await expect(p.locator("#show")).toHaveAttribute("role", "switch");
  for (const s of ["#size", "#sound"]) await expect(p.locator(s)).toBeVisible();
  // Actions start folded and open on a click
  await expect(p.locator("#actions")).not.toHaveAttribute("open");
  await expect(p.locator("#acts")).toBeHidden();
  await expect(p.locator("#actsCount")).toHaveText("22 of 22 on");
  await p.locator("#actions summary").click();
  await expect(p.locator("#acts")).toBeVisible();
  await expect(p.locator("#credit")).toContainText("Bento Cat");
  await expect(p.locator("#credit a")).toHaveCount(2);
  expect(errors).toEqual([]);
});

test("bring and send away: the cat, the badge, and the page left as it was", async ({ ctx, sw, popup }) => {
  await sw.evaluate(() => chrome.storage.local.set({ sites: { "http://localhost": "off" } }));   // no arrival on its own here
  const page = await ctx.newPage(); await page.goto(U + "news.html");
  const before = await page.evaluate(() => ({ body: document.body.outerHTML, kids: [...document.documentElement.children].map(e => e.tagName) }));
  const tabId = await tabIdOf(sw, U + "news.html");
  const r = await send(popup, { type: "bring", tabId });
  expect(r.on).toBe(true);
  await expect.poll(() => shown(page)).toBe(true);
  await expect.poll(() => sw.evaluate(t => chrome.action.getBadgeText({ tabId: t }), tabId)).toBe("on");
  const after = await page.evaluate(() => ({ body: document.body.outerHTML, kids: [...document.documentElement.children].map(e => e.tagName),
    cv: (() => { const c = document.querySelector("bracel-cat").shadowRoot.querySelector("canvas"); const cs = getComputedStyle(c); return { pe: cs.pointerEvents, pos: cs.position, aria: c.getAttribute("aria-hidden") }; })() }));
  expect(after.body).toBe(before.body);
  expect(after.kids).toEqual([...before.kids, "BRACEL-CAT"]);
  expect(after.cv).toEqual({ pe: "none", pos: "fixed", aria: "true" });
  await send(popup, { type: "away", tabId });
  await expect.poll(() => shown(page)).toBe(false);
  await expect.poll(() => sw.evaluate(t => chrome.action.getBadgeText({ tabId: t }), tabId)).toBe("");
});

test("▶ plays one activity now", async ({ ctx, sw, popup }) => {
  const page = await ctx.newPage(); await page.goto(U + "bracely.html");
  const tabId = await tabIdOf(sw, U + "bracely.html");
  await send(popup, { type: "act", tabId, name: "nap" });
  await expect.poll(() => page.evaluate(() => document.querySelector("bracel-cat") && document.querySelector("bracel-cat").dataset.state), { timeout: 10000 }).toBe("nap");
});

test("pages the browser keeps for itself say so", async ({ sw, popup }) => {
  const tabId = await sw.evaluate(async () => (await chrome.tabs.create({ url: "chrome://version" })).id);
  expect(await send(popup, { type: "bring", tabId })).toEqual({ error: "restricted" });
});

test("every site: the registered script brings Bracel on its own, and a site switched off is left out", async ({ ctx, sw }) => {
  await sw.evaluate(() => chrome.storage.local.set({ sites: {} }));
  await expect.poll(() => sw.evaluate(async () => (await chrome.scripting.getRegisteredContentScripts()).map(s => s.matches.join()).join()), { timeout: 10000 }).toBe("<all_urls>");
  const page = await ctx.newPage(); await page.goto(U + "dashboard.html");
  // it arrives on its own 2.5-9 s after the page loads (src/content.js), more on a busy CI runner
  await expect.poll(() => shown(page), { timeout: 25000 }).toBe(true);
  // switched off here: it goes, and the registration leaves the site out
  await sw.evaluate(() => chrome.storage.local.set({ sites: { "http://localhost": "off" } }));
  await expect.poll(() => shown(page)).toBe(false);
  // Chrome leaves excludeMatches out when it is empty, and the worker may not have caught up yet: read it gently
  const excluded = () => sw.evaluate(async () => { const [s] = await chrome.scripting.getRegisteredContentScripts(); return s ? (s.excludeMatches || []).join() : "none"; });
  await expect.poll(excluded, { timeout: 10000 }).toBe("http://localhost/*");
  // switched back on: the script is updated in place and the site is no longer left out
  await sw.evaluate(() => chrome.storage.local.set({ sites: {} }));
  await expect.poll(excluded, { timeout: 10000 }).toBe("");
});

test("nothing leaves the browser", async ({ ctx, sw, popup }) => {
  const urls = []; ctx.on("request", r => urls.push(r.url()));
  const page = await ctx.newPage(); await page.goto(U + "shop.html");
  const tabId = await tabIdOf(sw, U + "shop.html");
  await send(popup, { type: "bring", tabId }); await expect.poll(() => shown(page)).toBe(true);
  for (const k of ["hop", "play_yarn", "knead"]) { await send(popup, { type: "act", tabId, name: k }); await page.waitForTimeout(700); }
  await page.mouse.move(600, 400); await page.mouse.down(); await page.mouse.up();
  const outside = urls.filter(u => !u.startsWith("http://localhost:8080/") && !u.startsWith("chrome-extension://") && !u.startsWith("data:"));
  expect(outside).toEqual([]);
});
