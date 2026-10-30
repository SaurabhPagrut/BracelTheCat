// Store screenshots (1280x800) of Bracel on the saved pages: store/screenshot-<n>.png. Needs the local server
// (npm run serve). Run after a visible change: node scripts/screenshots.mjs
import { chromium } from "@playwright/test";

const SHOTS = [
  ["news", "figure", "ledge", 0.62, "sit"],
  ["dashboard", "table", "ledge", 0.3, "groom"],
  ["bracely", ".appbar", "bar", 0.55, "hang"],
  ["dark", ".card", "ledge", 0.4, "knead"],
  ["docs", "pre", "ledge", 0.7, "nap"]
];
const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
let n = 0;
for (const [name, sel, kind, at, state] of SHOTS) {
  const p = await ctx.newPage(); await p.goto(`http://localhost:8080/test/pages/${name}.html`);
  for (const s of ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"]) await p.addScriptTag({ url: "/" + s });
  await p.evaluate(([sel, kind, at, state]) => {
    const e = bracelDemo.engine; bracelDemo.spots.start(); e.size(0.3);
    const el = document.querySelector(sel); e.debugPlace(el, el.getBoundingClientRect().width * at, state, kind);
    // hold that activity (frames run, so the pose settles) until the picture is taken
    e._t.interrupt(() => new Promise(() => e._t.setState(state)));
  }, [sel, kind, at, state]);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `store/screenshot-${++n}.png` }); await p.close();
}
await b.close();
console.log(`store/screenshot-1..${n}.png`);
