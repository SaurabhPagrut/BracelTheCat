// Shared by the tests: open a saved page with the engine and the demo host in it.
export const PAGES = ["bracely", "news", "docs", "dashboard", "search", "shop", "feed", "sticky", "dark", "long", "spa", "dialog"];
export async function withBracel(page, name, { show = true } = {}) {
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(`/test/pages/${name}.html`);
  for (const s of ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"]) await page.addScriptTag({ url: "/" + s });
  if (show) await page.evaluate(() => bracelDemo.show());
  return errors;
}
// the spots as plain data: kind, element, the line it stands on, the run in page px, and Bracel's height now
export const spotsOf = page => page.evaluate(() => {
  const t = bracelDemo.engine._t, h = t.H(), m = { h, minW: t.HALF() * 2 + 12, half: t.HALF() };
  return bracelDemo.spots.surfaces(m).map(s => {
    const r = s.el.getBoundingClientRect(), y = s.kind === "bar" ? r.bottom : s.kind === "floor" ? r.bottom - 3 : r.top;
    return { kind: s.kind, tag: s.el.tagName, cls: s.el.className || "", id: s.el.id || "", y, l: r.left + s.x0, r: r.left + s.x1, h, minW: m.minW, view: s.el === bracelDemo.spots.VIEW };
  });
});
export const until = async (page, fn, arg, ms = 15000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 100 });
