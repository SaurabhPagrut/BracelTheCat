// The intro and demo video for YouTube: dist/video/bracel-demo.webm (2560x1440, 60 fps, VP9, no sound: 1440p gets
// YouTube's better codecs at every quality, so Bracel's thin lines stay sharp) and
// dist/video/thumbnail.jpg (1280x720). Bracel is filmed on the saved pages (test/pages/) and on title cards, frame by
// frame on Playwright's fake clock, so every frame is exact and nothing drops. Captions, the fade, the pointer and the
// cards live in a zero-size shadow host that the spot finder doesn't see, so they never make Bracel leave. A scene with
// `zoom` closes in 1.15x on the cat: a smaller part of the page, drawn at a higher resolution, so nothing is enlarged.
// Needs the local server (npm run serve). Run: node scripts/video.mjs [--still] [--only <scene>] (--still: one picture
// per scene only; --only: that scene alone, for a quick look)
// Encodes with Playwright's own ffmpeg (or FFMPEG=/path/to/ffmpeg).
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const FPS = 60, W = 1280, H = 720, ZMAX = 1.15, OUTW = 2560, DPR = OUTW / W * ZMAX, BASE = "http://localhost:8080", OUT = "dist/video";
const still = process.argv.includes("--still"), only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const CREDIT = "Art adapted from Bento Cat by mikewirsch · CC BY 4.0";

function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const dir = join(homedir(), "Library/Caches/ms-playwright"), linux = join(homedir(), ".cache/ms-playwright");
  for (const d of [dir, linux]) if (existsSync(d)) for (const f of readdirSync(d).filter(f => f.startsWith("ffmpeg-")))
    for (const b of ["ffmpeg-mac", "ffmpeg-linux"]) if (existsSync(join(d, f, b))) return join(d, f, b);
  return "ffmpeg";
}

/* ---------- the title cards: a dark page with a box Bracel stands on ---------- */
const card = (title, sub, extra = "") => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box} html,body{margin:0;height:100%;background:#0b1220;color:#f1f5f9;font-family:system-ui,-apple-system,sans-serif}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
h1{font-size:96px;font-weight:700;letter-spacing:-.02em;margin:0 0 150px}
.shelf{width:760px;padding:26px 32px;border-radius:16px;background:#162036;border:1px solid #23314f;text-align:center}
.shelf p{margin:0;font-size:32px;color:#cbd5e1}.shelf small{display:block;margin-top:10px;font-size:22px;color:#93c5fd}
.credit{position:fixed;bottom:22px;left:0;right:0;text-align:center;font-size:15px;color:#64748b}
</style></head><body><h1>${title}</h1><div class="shelf"><p>${sub}</p>${extra}</div><div class="credit">${CREDIT}</div></body></html>`;
const CARDS = {
  title: card("Bracel", "A cute virtual cat for every website"),
  privacy: card("Private by design", "Collects nothing. Sends nothing.", "<small>No account, no analytics, no network requests</small>"),
  end: card("Bracel", "Free on the Chrome Web Store", "<small>bracel.saurabhpagrut.in</small>"),
  thumb: card("Bracel", "A virtual cat for your browser")
};

/* ---------- the overlay: fade, caption bar, pointer (inside a shadow root the spot finder never walks) ---------- */
const OVERLAY = () => {
  const host = document.createElement("video-fx"); Object.assign(host.style, { position: "fixed", left: 0, top: 0, width: 0, height: 0, zIndex: 2147483647, pointerEvents: "none" });
  const r = host.attachShadow({ mode: "open" }); document.documentElement.append(host);
  r.innerHTML = `<style>
    *{pointer-events:none} #fade{position:fixed;inset:0;background:#000}
    #cap{position:fixed;display:flex;align-items:center;justify-content:center;font-weight:600;font-family:system-ui,-apple-system,sans-serif;letter-spacing:-.01em}
    #cur{position:fixed;left:0;top:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
    #ring{position:fixed;left:0;top:0;border-radius:50%;border:solid #2563eb}
  </style><div id="cap"></div><svg id="cur" viewBox="0 0 26 26"><path d="M3 2 L3 21 L8 16.5 L11.5 24 L15 22.5 L11.5 15 L18 15 Z" fill="#fff" stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round"/></svg><div id="ring"></div><div id="fade"></div>`;
  const $ = id => r.getElementById(id);
  // s.view: the part of the page in the frame ([x, y, zoom]); the caption bar, pointer and ring shrink by the zoom, so they
  // come out the same size in every frame
  window.V = { set(s) {
    const [vx, vy, z] = s.view || [0, 0, 1], px = n => n / z + "px";
    $("fade").style.opacity = s.fade; const c = $("cap"); const a = s.cap ? s.capA : 0;
    Object.assign(c.style, { left: vx + "px", top: vy + (innerHeight - 84) / z + "px", width: px(innerWidth), height: px(84), fontSize: px(30) });
    // faded by colour, not opacity or a transform: those give the bar a layer of its own, screenshotted before its text was drawn
    if (c.textContent !== (s.cap || "")) c.textContent = s.cap || ""; c.style.background = `rgba(37,99,235,${a})`; c.style.color = `rgba(255,255,255,${a})`;
    const cu = $("cur"); cu.style.display = s.cur ? "block" : "none"; if (s.cur) Object.assign(cu.style, { width: px(26), height: px(26), transform: `translate(${s.cur[0] - 3 / z}px,${s.cur[1] - 2 / z}px)` });
    const g = $("ring"); g.style.display = s.ring > 0 ? "block" : "none";
    if (s.ring > 0) Object.assign(g.style, { width: px(44), height: px(44), margin: `${-22 / z}px 0 0 ${-22 / z}px`, borderWidth: px(3), transform: `translate(${s.cur[0]}px,${s.cur[1]}px) scale(${1.6 - s.ring * 0.8})`, opacity: s.ring });
    return [scrollX, scrollY];
  } };
};

/* ---------- scenes: where, how long, what Bracel does when, the captions and the pointer ---------- */
const E = "bracelDemo.engine";
const place = (sel, at, state, kind, size = 0.3) => `(() => { const e = ${E}; e.size(${size}); const el = document.querySelector(${JSON.stringify(sel)}); e.debugPlace(el, el.getBoundingClientRect().width * ${at}, ${JSON.stringify(state)}, ${JSON.stringify(kind)}); })()`;
const act = n => `${E}.act(${JSON.stringify(n)})`;
const cat = `(() => { const s = ${E}._t.sim; return [s.x, s.groundY, s.scale]; })()`;
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * ease(t);

const SCENES = [
  { name: "title", card: "title", dur: 5, setup: [place(".shelf", 0.2, "idle", "ledge", 0.36)], beats: [[0.6, act("walk")], [3.6, act("sit")]] },
  { name: "news", page: "news", dur: 8, setup: [place("figure", 0.25, "sit", "ledge")],
    caps: [[0, 8, "Meet Bracel: a virtual cat that lives on the websites you visit"]], beats: [[0.8, act("walk")], [4.6, act("hop")]] },
  { name: "montage", page: "dashboard", dur: 13, setup: [place("table", 0.3, "sit", "ledge")],
    caps: [[0, 3.2, "It grooms,"], [3.2, 6.4, "kneads and purrs,"], [6.4, 10, "plays with a ball of yarn,"], [10, 13, "and naps when you are busy"]],
    beats: [[0.1, act("groom")], [3.2, act("knead")], [6.4, act("play_yarn")], [10, act("nap")]] },
  { name: "hang", page: "bracely", dur: 7, setup: [place(".appbar", 0.55, "hang", "bar")],
    caps: [[0, 7, "It hangs under headers and jumps from box to box"]], beats: [[0.1, act("hang")], [3.4, act("drop")]] },
  { name: "pet", page: "docs", dur: 9, zoom: [0.6, 8.4], setup: [place("pre", 0.5, "sit", "ledge", 0.34)],
    caps: [[0, 4.8, "Stroke it with your pointer and it purrs"], [4.8, 9, "Wiggle the pointer above it and it pounces"]],
    beats: [[4.9, act("hunt")]],
    // the pointer comes in, strokes the cat's back, then wiggles above its spot
    pointer: (t, [x, y, s]) => {
      if (t < 1.2) return [lerp(1180, x + 60, t / 1.2), lerp(560, y - 90 * s * 2, t / 1.2)];
      if (t < 4.6) { const k = (t - 1.2) * 2.2; return [x + Math.sin(k * Math.PI) * 55 * s * 2.2, y - 70 * s * 2 + Math.cos(k * Math.PI * 2) * 6]; }
      const k = (t - 4.6) * 3; return [x + 140 + Math.sin(k * Math.PI) * 90, y - 60 + Math.cos(k * Math.PI * 1.7) * 18];
    } },
  { name: "dialog", page: "dialog", dur: 8, setup: [place(".box", 0.62, "sit", "ledge"),
      `(() => { document.querySelector("h1").textContent = "Your account"; document.querySelector("#dlg h2").textContent = "Sign in to continue"; document.querySelector("#dlg p").textContent = "Bracel waits outside while a dialog is open."; })()`],
    caps: [[0, 8, "Never in the way: clicks go through, and it steps aside for dialogs"]],
    click: [[2.6, "#open"], [6.2, "#close"]] },
  { name: "coats", page: "dark", dur: 9, zoom: [0.3, 8.6], setup: [place(".card", 0.45, "sit", "ledge", 0.26)],
    caps: [[0, 9, "Five coats, any size, on light and dark pages"]],
    beats: [[0.1, act("knead")], [1.6, `${E}.coat("slate")`], [3.0, `${E}.coat("tuxedo")`], [4.4, `${E}.coat("blue")`], [5.8, `${E}.coat("amber")`], [7.2, `${E}.coat("cloud")`]],
    size: t => 0.26 + 0.14 * ease((t - 6.8) / 1.6) },
  { name: "popup", page: "news", dur: 8, popup: true,
    // it arrives on the picture, in view (not behind the popup)
    setup: [`${E}.size(0.3)`, `${E}.set(false)`, `(() => { const sp = bracelDemo.spots, all = sp.surfaces.bind(sp), fig = document.querySelector("figure"); sp.surfaces = m => all(m).filter(s => s.el === fig); })()`],
    caps: [[0, 8, "One click, or Alt+Shift+B, brings it to any tab"]],
    click: [[2.2, "popup:#show"]], beats: [[2.4, act("sit")]] },
  { name: "privacy", card: "privacy", dur: 5, setup: [place(".shelf", 0.7, "sit", "ledge", 0.36)], beats: [[0.2, act("nap")]] },
  { name: "end", card: "end", dur: 6, setup: [place(".shelf", 0.25, "idle", "ledge", 0.36)], beats: [[0.3, act("walk")], [3.4, act("yawn")]] }
];

/* ---------- filming ---------- */
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, reducedMotion: "no-preference" });
await ctx.route(`${BASE}/__video/*`, r => r.fulfill({ contentType: "text/html", body: CARDS[r.request().url().split("/").pop()] }));
mkdirSync(OUT, { recursive: true });

let enc = null;
if (!still) {
  enc = spawn(ffmpegPath(), ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "pipe:0",
    "-c:v", "libvpx-vp9", "-b:v", "24M", "-crf", "16", "-g", String(FPS * 2), "-deadline", "good", "-cpu-used", "3", "-row-mt", "1", "-tile-columns", "2", "-pix_fmt", "yuv420p", `${OUT}/bracel-demo.webm`], { stdio: ["pipe", "inherit", "inherit"] });
  // an encoder that stops early (a bad option, a missing codec) ends the run instead of leaving it waiting
  enc.on("exit", c => { if (c && !ending) { console.error(`ffmpeg exited ${c}`); process.exit(1); } }); enc.stdin.on("error", e => { console.error(e.message); process.exit(1); });
}
let ending = false;
const write = buf => new Promise(res => enc.stdin.write(buf) ? res() : enc.stdin.once("drain", res));
// one frame: the part of the page in view, drawn at OUTW pixels wide (Chrome's own screenshot, with a scale per frame)
async function shot(cdp, [x, y, z], [sx, sy]) {
  const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 92, clip: { x: sx + x, y: sy + y, width: W / z, height: H / z, scale: OUTW / W * z } });
  const buf = Buffer.from(data, "base64");
  // every frame must be the same size, or the encoder stops
  for (let i = 2; i < buf.length - 8; i++) if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
    const w = buf.readUInt16BE(i + 7), h = buf.readUInt16BE(i + 5);
    if (w !== OUTW || h !== OUTW * H / W) throw new Error(`frame is ${w}x${h}`); break;
  }
  return buf;
}

async function open(sc) {
  const p = await ctx.newPage(); await p.clock.install();
  await p.goto(sc.card ? `${BASE}/__video/${sc.card}` : `${BASE}/test/pages/${sc.page}.html`);
  for (const s of ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"]) await p.addScriptTag({ url: `/${s}` });
  await p.evaluate(`bracelDemo.spots.start(); ${E}.sound(false);`);
  await p.clock.runFor(600);
  for (const s of sc.setup || []) await p.evaluate(s);
  if (sc.popup) {
    await p.evaluate(() => { const f = document.createElement("iframe"); f.id = "popup"; f.src = "/src/popup/popup.html";
      Object.assign(f.style, { position: "fixed", top: "8px", right: "16px", width: "320px", height: "300px", border: "1px solid rgba(100,116,139,.35)", borderRadius: "10px", boxShadow: "0 12px 32px rgba(15,23,42,.28)", background: "#fff", zIndex: 2147483000 });
      document.body.append(f); });
    const pf = await (await p.$("#popup")).contentFrame(); await pf.waitForLoadState(); await p.clock.runFor(800);
    const h = await pf.evaluate(() => document.body.scrollHeight);
    await p.evaluate(h => { document.getElementById("popup").style.height = Math.min(h, 600) + "px"; }, h);
  }
  await p.evaluate(OVERLAY);
  await p.clock.runFor(400);
  return p;
}
// where a click target is, in the page (popup: targets live in the popup's frame)
async function spot(p, target) {
  if (target.startsWith("popup:")) {
    const f = await p.$("#popup"), fb = await f.boundingBox(), el = await p.frame({ url: /popup\.html/ }).$(target.slice(6)), b = await el.boundingBox();
    return [b.x + b.width / 2, b.y + b.height / 2];
  }
  const b = await (await p.$(target)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2];
}

let frames = 0;
for (const sc of SCENES.filter(s => !only || s.name === only)) {
  const p = await open(sc), cdp = await ctx.newCDPSession(p), n = Math.round(sc.dur * FPS), beats = [...(sc.beats || [])], clicks = [];
  for (const [at, target] of sc.click || []) clicks.push({ at, target });
  let cur = null, ring = 0, ms = 0, focus = null;
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    while (beats.length && beats[0][0] <= t) await p.evaluate(beats.shift()[1]);
    if (sc.size) await p.evaluate(`${E}._t.sim.scale = ${sc.size(t)}`);
    // the pointer: a path around the cat, or a glide to each click (in from the right), then the click
    if (sc.pointer) cur = sc.pointer(t, await p.evaluate(cat));
    else if (clicks.length) {
      const c = clicks.find(c => t <= c.at + 0.3) || clicks[clicks.length - 1], prev = clicks[clicks.indexOf(c) - 1];
      if (!c.xy) c.xy = await spot(p, c.target);   // looked up when it comes due (a dialog's button exists only once it is open)
      const from = prev ? prev.xy : [W - 120, H - 140], k = (t - (c.at - 1.4)) / 1.2;
      cur = [lerp(from[0], c.xy[0], k), lerp(from[1], c.xy[1], k)];
      if (!c.done && t >= c.at) { c.done = true; ring = 1;
        if (c.target.startsWith("popup:")) await p.frame({ url: /popup\.html/ }).click(c.target.slice(6)); else await p.click(c.target); }
    }
    if (cur && !sc.click) await p.mouse.move(cur[0], cur[1]);
    const cap = (sc.caps || []).find(([a, b]) => t >= a && t < b), capA = cap ? Math.min(1, (t - cap[0]) / 0.35, (cap[1] - t) / 0.35 + (cap[1] >= sc.dur ? 1 : 0)) : 0;
    const fade = Math.max(0, 1 - t / 0.45, 1 - (sc.dur - t) / 0.45);
    // the zoom: eases in and out over a second, centred a little above the cat's feet, following it slowly, kept on the page
    let view = [0, 0, 1];
    if (sc.zoom) {
      const z = 1 + (ZMAX - 1) * Math.min(ease(t - sc.zoom[0]), ease(sc.zoom[1] - t)), [x, y, s] = await p.evaluate(cat), aim = [x, y - 120 * s];
      focus = focus ? [focus[0] + (aim[0] - focus[0]) * 0.04, focus[1] + (aim[1] - focus[1]) * 0.04] : aim;
      const vw = W / z, vh = H / z;
      view = [Math.min(W - vw, Math.max(0, focus[0] - vw / 2)), Math.min(H - vh, Math.max(0, focus[1] - vh / 2)), z];
    }
    const scroll = await p.evaluate(s => V.set(s), { fade, cap: cap && cap[2], capA: Math.max(0, capA), cur, ring, view });
    ring = Math.max(0, ring - 2.4 / FPS);
    const next = Math.round((i + 1) * 1000 / FPS); await p.clock.runFor(next - ms); ms = next;
    if (still) { if (i === Math.round(n * 0.55)) writeFileSync(`${OUT}/still-${sc.name}.jpg`, await shot(cdp, view, scroll)); continue; }
    await write(await shot(cdp, view, scroll)); frames++;
  }
  await p.close();
  console.log(`${sc.name}: ${sc.dur}s`);
}

// the thumbnail: Bracel big on its title card
{
  const p = await open({ card: "thumb", setup: [place(".shelf", 0.5, "sit", "ledge", 0.45)] });
  await p.evaluate(s => V.set(s), { fade: 0, cap: "", capA: 0, cur: null, ring: 0 }); await p.clock.runFor(1500);
  const buf = await p.screenshot({ type: "jpeg", quality: 92, scale: "css" }); writeFileSync(`${OUT}/thumbnail.jpg`, buf); await p.close();
}
await browser.close();
if (enc) { ending = true; enc.stdin.end(); await new Promise((res, rej) => enc.on("close", c => c ? rej(new Error(`ffmpeg exited ${c}`)) : res())); }
console.log(still ? `${OUT}/still-*.jpg` : `${OUT}/bracel-demo.webm (${(frames / FPS).toFixed(1)} s), ${OUT}/thumbnail.jpg`);
