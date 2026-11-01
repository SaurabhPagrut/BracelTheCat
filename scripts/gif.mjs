// The GIFs for Product Hunt (or anywhere a GIF is wanted), into dist/gif/:
//   gallery-1270x760.gif: Bracel on a dark title card walks along the box, grooms, is stroked by the pointer and purrs,
//     kneads and sits (Product Hunt's gallery size, with the Bento Cat credit)
//   icon-240.gif: only Bracel, on a plain background, staying in place: looks about, grooms, yawns, kneads, sits
//     (Product Hunt's thumbnail size; too small for the credit, so keep it in the listing text)
// Filmed frame by frame on Playwright's fake clock at twice the size, scaled down by the browser, then encoded here with
// gifenc: one shared palette, and each frame after the first marks the pixels that did not change as transparent, so
// only the cat's own pixels are stored. The last 0.6 s fade into the first frame, so the loop has no jump.
// Needs the local server (npm run serve). Run: node scripts/gif.mjs [--only gallery|icon] [--bg <colour>] [--coat <coat>]
// (--bg: the icon's background, white by default; --coat: slate, tuxedo, blue, amber or cloud, cloud by default)
import { chromium } from "@playwright/test";
import gifenc from "gifenc";
import { mkdirSync, writeFileSync } from "node:fs";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const FPS = 25, DUR = 13, XF = 15, W = 1270, H = 760, DPR = 2, BASE = "http://localhost:8080", OUT = "dist/gif";
const arg = n => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
const only = arg("--only"), BG = arg("--bg") || "#ffffff", COAT = arg("--coat") || "cloud";
const CREDIT = "Art adapted from Bento Cat by mikewirsch · CC BY 4.0";

/* ---------- the card: a dark page with a box Bracel stands on; the icon hides all of it but the box's top edge ---------- */
const card = icon => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box} html,body{margin:0;height:100%;background:#0b1220;color:#f1f5f9;font-family:system-ui,-apple-system,sans-serif}
body{display:flex;flex-direction:column;align-items:center;justify-content:center}
h1{font-size:92px;font-weight:700;letter-spacing:-.02em;margin:0 0 170px}
.shelf{width:780px;padding:26px 32px;border-radius:16px;background:#162036;border:1px solid #23314f;text-align:center}
.shelf p{margin:0;font-size:32px;color:#cbd5e1}.shelf small{display:block;margin-top:10px;font-size:22px;color:#93c5fd}
.credit{position:fixed;bottom:20px;left:0;right:0;text-align:center;font-size:15px;color:#64748b}
${icon ? `html,body{background:${BG}} h1,.shelf p,.shelf small,.credit{visibility:hidden}
.shelf{background:transparent;border-color:${BG}}` /* a border, even an invisible one, keeps the box a spot to stand on */ : ""}
</style></head><body><h1>Bracel</h1><div class="shelf"><p>A cute virtual cat for every website</p><small>Free browser extension · bracel.saurabhpagrut.in</small></div>
<div class="credit">${CREDIT}</div></body></html>`;

/* ---------- the two GIFs: where Bracel starts, what it does when, the pointer ---------- */
const E = "bracelDemo.engine";
const act = n => `${E}.act(${JSON.stringify(n)})`;
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * ease(t);
const GIFS = [
  { name: "gallery-1270x760", at: 0.22, beats: [[0.3, act("walk")], [3.2, act("groom")], [9.0, act("knead")], [11.6, act("sit")]],
    // the pointer comes in from the bottom right, strokes its back (it purrs), and goes
    pet: [5.6, 8.8], size: [W, H] },
  { name: "icon-240", icon: true, at: 0.5, beats: [[0.4, act("look")], [2.6, act("groom")], [5.8, act("yawn")], [7.8, act("knead")], [11.4, act("sit")]],
    size: [240, 240] }
];

/* ---------- filming: frames at 2x, kept as PNG until the palette is known ---------- */
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, reducedMotion: "no-preference" });
await ctx.route(`${BASE}/__gif/*`, r => r.fulfill({ contentType: "text/html", body: card(r.request().url().endsWith("icon")) }));
mkdirSync(OUT, { recursive: true });

async function film(g) {
  const p = await ctx.newPage(); await p.clock.install();
  await p.goto(`${BASE}/__gif/${g.icon ? "icon" : "card"}`);
  for (const s of ["src/shared.js", "src/engine.js", "src/spots.js", "demo/host.js"]) await p.addScriptTag({ url: `/${s}` });
  await p.evaluate(`bracelDemo.spots.start(); ${E}.sound(false); ${E}.coat(${JSON.stringify(COAT)});`);
  await p.clock.runFor(600);
  // only the box's top edge: nowhere else to wander off to
  await p.evaluate(() => { const sp = bracelDemo.spots, all = sp.surfaces.bind(sp), el = document.querySelector(".shelf"); sp.surfaces = m => all(m).filter(s => s.el === el && s.kind === "ledge"); });
  await p.evaluate(`(() => { const e = ${E}; e.size(0.45); const el = document.querySelector(".shelf"); e.debugPlace(el, el.getBoundingClientRect().width * ${g.at}, "sit", "ledge"); })()`);
  // the pointer, in a zero-size shadow host the spot finder never sees
  await p.evaluate(() => { const h = document.createElement("gif-fx"); Object.assign(h.style, { position: "fixed", left: 0, top: 0, width: 0, height: 0, zIndex: 2147483647, pointerEvents: "none" });
    const r = h.attachShadow({ mode: "open" }); document.documentElement.append(h);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("viewBox", "0 0 26 26"); svg.style.cssText = "position:fixed;left:0;top:0;width:26px;height:26px;display:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))";
    for (const [k, v] of Object.entries({ d: "M3 2 L3 21 L8 16.5 L11.5 24 L15 22.5 L11.5 15 L18 15 Z", fill: "#fff", stroke: "#0f172a", "stroke-width": "1.6", "stroke-linejoin": "round" })) path.setAttribute(k, v);
    svg.append(path); r.append(svg);
    window.CUR = xy => { svg.style.display = xy ? "block" : "none"; if (xy) svg.style.transform = `translate(${xy[0] - 3}px,${xy[1] - 2}px)`; }; });
  await p.clock.runFor(400);

  const beats = [...g.beats], frames = [], cat = `(() => { const s = ${E}._t.sim; return [s.x, s.groundY, s.scale]; })()`;
  let ms = 0;
  for (let i = 0; i < DUR * FPS; i++) {
    const t = i / FPS;
    while (beats.length && beats[0][0] <= t) await p.evaluate(beats.shift()[1]);
    let cur = null;
    if (g.pet && t >= g.pet[0] - 1.2 && t < g.pet[1] + 1) {
      const [x, y, s] = await p.evaluate(cat), home = [W - 80, H - 90], [a, b] = g.pet;
      const pet = [x + Math.sin((t - a) * 2.2 * Math.PI) * 50 * s * 2.2, y - 64 * s * 2 + Math.cos((t - a) * 4.4 * Math.PI) * 5];
      cur = t < a ? [lerp(home[0], pet[0], (t - a + 1.2) / 1.2), lerp(home[1], pet[1], (t - a + 1.2) / 1.2)]
        : t < b ? pet : [lerp(pet[0], home[0] + 200, t - b), lerp(pet[1], home[1] + 200, t - b)];
      await p.mouse.move(cur[0], cur[1]);
    }
    await p.evaluate(c => CUR(c), cur);
    const next = Math.round((i + 1) * 1000 / FPS); await p.clock.runFor(next - ms); ms = next;
    frames.push((await p.screenshot({ type: "png" })).toString("base64"));
  }
  await p.close();
  return frames;
}

/* ---------- pixels: the browser decodes and scales each frame (a crop of it, for the icon) ---------- */
const px = await ctx.newPage();
await px.setContent("<canvas></canvas>");
const pixels = (png, crop, [w, h]) => px.evaluate(async ({ png, crop, w, h }) => {
  const img = new Image(); img.src = "data:image/png;base64," + png; await img.decode();
  const c = document.querySelector("canvas"); c.width = w; c.height = h; const x = c.getContext("2d", { willReadFrequently: true });
  x.imageSmoothingQuality = "high"; const [l, t, cw, ch] = crop || [0, 0, img.width, img.height]; x.drawImage(img, l, t, cw, ch, 0, 0, w, h);
  let s = ""; const d = x.getImageData(0, 0, w, h).data; for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode(...d.subarray(i, i + 0x8000));
  return btoa(s);
}, { png, crop, w, h }).then(b => new Uint8Array(Buffer.from(b, "base64")));
// the box around everything the cat does over the whole GIF, at the frames' full size, as a square with some room
const catBox = frames => px.evaluate(async frames => {
  const c = document.querySelector("canvas"), x = c.getContext("2d", { willReadFrequently: true }); let b = null;
  for (const png of frames) {
    const img = new Image(); img.src = "data:image/png;base64," + png; await img.decode();
    c.width = img.width; c.height = img.height; x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data;
    const bg = [d[0], d[1], d[2]];
    for (let y = 0; y < c.height; y += 2) for (let i = y * c.width * 4, e = i + c.width * 4; i < e; i += 8) {
      if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) < 18) continue;
      const X = (i / 4) % c.width; b = b ? [Math.min(b[0], X), Math.min(b[1], y), Math.max(b[2], X), Math.max(b[3], y)] : [X, y, X, y];
    }
  }
  const s = Math.max(b[2] - b[0], b[3] - b[1]) * 1.18, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  return [Math.round(cx - s / 2), Math.round(cy - s / 2), Math.round(s), Math.round(s)];
}, frames.filter((f, i) => i % 5 === 0));

/* ---------- encoding ---------- */
async function encode(g, frames) {
  const crop = g.icon ? await catBox(frames) : null, [w, h] = g.size, n = frames.length;
  const first = await pixels(frames[0], crop, g.size);
  const rgba = async i => {
    const d = i === 0 ? first : await pixels(frames[i], crop, g.size), k = (i - (n - XF) + 1) / (XF + 1);
    if (k > 0) for (let j = 0; j < d.length; j++) d[j] = d[j] + (first[j] - d[j]) * k;   // the fade into the first frame
    return d;
  };
  // one palette for the whole GIF, from frames across it; its last entry is the "unchanged" colour
  const sample = new Uint8Array(w * h * 4 * 8);
  for (let s = 0; s < 8; s++) sample.set(await rgba(Math.floor(s * (n - 1) / 7)), s * w * h * 4);
  const palette = quantize(sample, 255), TR = palette.length; palette.push([255, 0, 255]);
  const gif = GIFEncoder(); let prev = null;
  for (let i = 0; i < n; i++) {
    const idx = applyPalette(await rgba(i), palette);
    if (!prev) gif.writeFrame(idx, w, h, { palette, delay: 1000 / FPS, repeat: 0 });
    else {
      const out = idx.slice(); for (let j = 0; j < out.length; j++) if (out[j] === prev[j]) out[j] = TR;
      gif.writeFrame(out, w, h, { delay: 1000 / FPS, transparent: true, transparentIndex: TR, dispose: 1 });
    }
    prev = idx;
  }
  gif.finish();
  const bytes = gif.bytes(); writeFileSync(`${OUT}/${g.name}.gif`, bytes);
  console.log(`${OUT}/${g.name}.gif: ${w}x${h}, ${n} frames, ${(bytes.length / 1e6).toFixed(2)} MB${bytes.length > 3e6 ? " (over Product Hunt's 3 MB)" : ""}`);
}

for (const g of GIFS.filter(g => !only || g.name.startsWith(only))) await encode(g, await film(g));
await browser.close();
