// Store screenshots (1280x800) of Bracel on the saved pages: store/screenshot-<n>.png. The first two also show the
// toolbar popup (on its pretend browser) where Chrome opens it, folded and then with Actions open. Needs the local
// server (npm run serve). Run after a visible change: node scripts/screenshots.mjs
import { chromium } from "@playwright/test";

const SHOTS = [
  ["news", "figure", "ledge", 0.62, "sit", "folded"],
  ["dashboard", "table", "ledge", 0.3, "groom", "open"],
  ["bracely", ".appbar", "bar", 0.55, "hang"],
  ["dark", ".card", "ledge", 0.4, "knead"],
  ["docs", "pre", "ledge", 0.7, "nap"]
];
const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
let n = 0;
for (const [name, sel, kind, at, state, popup] of SHOTS) {
  const p = await ctx.newPage(); await p.goto(`http://localhost:8080/test/pages/${name}.html`);
  for (const s of ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"]) await p.addScriptTag({ url: "/" + s });
  await p.evaluate(([sel, kind, at, state]) => {
    const e = bracelDemo.engine; bracelDemo.spots.start(); e.size(0.36);
    const el = document.querySelector(sel); e.debugPlace(el, el.getBoundingClientRect().width * at, state, kind);
    // hold that activity (frames run, so the pose settles) until the picture is taken
    e._t.interrupt(() => new Promise(() => e._t.setState(state)));
  }, [sel, kind, at, state]);
  if (popup) {
    // the popup as Chrome draws it under the toolbar: Bracel shown on this tab, Actions folded or open
    await p.evaluate(() => { const f = document.createElement("iframe"); f.id = "popup"; f.src = "/src/popup/popup.html";
      Object.assign(f.style, { position: "fixed", top: "8px", right: "16px", width: "320px", height: "100px", border: "1px solid rgba(100,116,139,.35)", borderRadius: "10px", boxShadow: "0 12px 32px rgba(15,23,42,.28)", background: "#fff", zIndex: 2147483647 });
      document.body.append(f); });
    const fr = p.frameLocator("#popup"); await fr.locator("#show").check();
    if (popup === "open") await fr.locator("#actions summary").click();
    await p.waitForTimeout(300);
    // Chrome caps a popup at 600 px and scrolls the rest; with Actions open, show it scrolled to them
    const pf = p.frame({ url: /popup\.html/ }), h = await pf.evaluate(() => document.body.scrollHeight);
    await p.evaluate(h => { document.getElementById("popup").style.height = Math.min(h, 600) + "px"; }, h);
    await pf.evaluate(open => { if (open) document.querySelector("#actions").scrollIntoView(); else scrollTo(0, 0); }, popup === "open");
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `store/screenshot-${++n}.png` }); await p.close();
}
await b.close();
console.log(`store/screenshot-1..${n}.png`);
