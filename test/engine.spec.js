// The engine on its own (roadmap Phase 1): poses blend, the gait plants paws, picking respects the ticks, interrupting
// cancels cleanly, reduced motion draws still frames. Runs in the browser on the Bracely-like saved page.
import { test, expect } from "@playwright/test";
import { withBracel, until } from "./helpers.js";

test("the engine and the popup list the same activities", async ({ page }) => {
  await withBracel(page, "bracely", { show: false });
  const [a, b] = await page.evaluate(() => [bracelDemo.engine.acts(), BRACEL.ACTS]);
  expect(a).toEqual(b);
});

test("Bracel arrives at once when brought, on a spot, and draws", async ({ page }) => {
  const errors = await withBracel(page, "bracely");
  await until(page, () => bracelDemo.engine.shown());
  const r = await page.evaluate(() => ({ spot: bracelDemo.engine.spot(), cv: bracelDemo.engine.el(), pe: getComputedStyle(bracelDemo.engine.el()).pointerEvents }));
  expect(r.spot).toBeTruthy(); expect(r.pe).toBe("none");
  expect(errors).toEqual([]);
});

test("walking: a planted paw slides back as fast as the body goes forward; a paw lifts only while it swings forward", async ({ page }) => {
  await withBracel(page, "bracely", { show: false });
  const steps = await page.evaluate(() => {
    const t = bracelDemo.engine._t, sim = t.sim, s = sim.scale, ks = ["fl", "fr", "bl", "br"];
    sim.state = "walk"; sim.x = 100; sim.dir = 1; sim.gait = 0;
    const out = []; let prev = null;
    for (let i = 0; i < 400; i++) {
      sim.moving = false; t.stepToward(sim.x + 5000, 42, 1 / 60, true);
      const T = { ...t.POSE0 }; t.gait(T);
      const now = ks.map(k => ({ wx: sim.x + sim.dir * T[k + "Px"] * s, lx: T[k + "Px"], dy: T[k + "Py"] - t.POSE0[k + "Py"] }));
      if (prev) ks.forEach((k, j) => out.push({ k, planted: now[j].dy === 0 && prev[j].dy === 0, lifted: now[j].dy < -0.5 && prev[j].dy < -0.5, dwx: now[j].wx - prev[j].wx, dlx: now[j].lx - prev[j].lx }));
      prev = now;
    }
    return { out, stride: 22 * s };
  });
  // lifted: moving forwards in the body's frame (this was inverted once)
  const lifted = steps.out.filter(o => o.lifted);
  expect(lifted.length).toBeGreaterThan(50);
  for (const o of lifted) expect(o.dlx).toBeGreaterThanOrEqual(0);
  // planted: moving backwards in the body's frame, and over each planted stretch it stays put on the ground
  const planted = steps.out.filter(o => o.planted);
  for (const o of planted) expect(o.dlx).toBeLessThanOrEqual(0);
  for (const k of ["fl", "fr", "bl", "br"]) {
    let run = 0, n = 0; const runs = [];
    for (const o of steps.out.filter(o => o.k === k)) { if (o.planted) { run += o.dwx; n++; } else if (n) { runs.push({ run, n }); run = 0; n = 0; } }
    const full = runs.slice(1).filter(r => r.n > 8);   // the first stretch starts mid-step
    expect(full.length).toBeGreaterThan(0);
    for (const r of full) expect(Math.abs(r.run)).toBeLessThan(steps.stride * 0.35);
  }
});

test("poses blend towards the activity's target", async ({ page }) => {
  await withBracel(page, "bracely", { show: false });
  const r = await page.evaluate(() => {
    const t = bracelDemo.engine._t; t.sim.state = "sit"; t.sim.stateTime = 0; const first = t.sim.pose.hy; const seen = [first];
    for (let i = 0; i < 90; i++) { t.computeTargetPose(1 / 60); seen.push(t.sim.pose.hy); }
    return { first, after1: seen[1], last: seen[seen.length - 1] };
  });
  expect(Math.abs(r.after1 - r.first)).toBeLessThan(Math.abs(-44 - r.first));   // eased, not snapped
  expect(Math.abs(r.last - -44)).toBeLessThan(1);
});

test("picking respects the ticks", async ({ page }) => {
  await withBracel(page, "bracely", { show: false });
  const picks = await page.evaluate(() => {
    const e = bracelDemo.engine; for (const [k] of e.acts()) e.setAct(k, k === "walk" || k === "look");
    const out = new Set(); for (let i = 0; i < 300; i++) out.add(e._t.pick()); return [...out];
  });
  expect(picks.sort()).toEqual(["look", "walk"]);
});

test("a new activity interrupts the current one cleanly", async ({ page }) => {
  const errors = await withBracel(page, "bracely");
  await until(page, () => bracelDemo.engine.shown());
  await page.evaluate(() => bracelDemo.engine.act("nap"));
  await until(page, () => bracelDemo.engine.state() === "nap");
  const g0 = await page.evaluate(() => bracelDemo.engine._t.gen());
  await page.evaluate(() => bracelDemo.engine.act("groom"));
  await until(page, () => bracelDemo.engine.state() === "groom");
  expect(await page.evaluate(() => bracelDemo.engine._t.gen())).toBeGreaterThan(g0);
  expect(errors).toEqual([]);
});

test("reduced motion: it sits still and no frames run", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await withBracel(page, "bracely");
  await until(page, () => bracelDemo.engine.shown());
  await page.waitForTimeout(600);
  const a = await page.evaluate(() => bracelDemo.engine._t.sim.globalTime);
  await page.waitForTimeout(1200);
  const b = await page.evaluate(() => ({ t: bracelDemo.engine._t.sim.globalTime, state: bracelDemo.engine.state(), parts: bracelDemo.engine._t.sim.particles.length }));
  expect(b.t).toBe(a); expect(["sit", "hang"]).toContain(b.state); expect(b.parts).toBe(0);
});

test("settings: coat, size and ticks apply at once", async ({ page }) => {
  await withBracel(page, "bracely");
  const r = await page.evaluate(() => { const e = bracelDemo.engine; e.apply({ coat: "amber", size: 0.3, acts: ["nap"] }); return { coat: e._t.sim.coat, size: e._t.sim.scale, nap: e.enabled("nap") }; });
  expect(r).toEqual({ coat: "amber", size: 0.3, nap: false });
});

test("on a dark page it wears the dark-page coat", async ({ page }) => {
  await withBracel(page, "dark");
  expect(await page.evaluate(() => bracelDemo.engine._t.sim.bgTheme)).toBe("dark");
});

test("a size set before Bracel first appears still sizes its canvas", async ({ page }) => {
  await withBracel(page, "bracely", { show: false });
  await page.evaluate(() => { bracelDemo.engine.size(0.3); bracelDemo.show(); });
  await until(page, () => bracelDemo.engine.shown());
  const r = await page.evaluate(() => { const c = bracelDemo.engine.el(); return { w: c.width, css: parseFloat(c.style.width), dpr: devicePixelRatio }; });
  expect(r.w).toBe(Math.round(r.css * r.dpr)); expect(r.css).toBeGreaterThan(160);
});
