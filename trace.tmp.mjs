import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
p.on("pageerror", e => console.log("ERR", e.message)); p.on("console", m => console.log("console", m.text()));
await p.goto(`http://localhost:8080/test/pages/${process.argv[2]}.html`);
for (const s of ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"]) await p.addScriptTag({ url: "/" + s });
await p.evaluate(() => bracelDemo.show());
for (let i = 0; i < 16; i++) { await p.waitForTimeout(300); console.log(await p.evaluate(() => { const t = bracelDemo.engine._t; return [bracelDemo.engine.shown(), t.sim.state, t.st.spot && t.st.spot.kind, t.st.spot && (t.st.spot.el.className || t.st.spot.el.tagName), Math.round(t.sim.x), Math.round(t.sim.groundY), t.sim.sink.toFixed(2), bracelDemo.spots.overlay()].join(" "); })); }
await b.close();
