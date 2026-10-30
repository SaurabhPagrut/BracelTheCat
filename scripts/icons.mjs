// Draws Bracel's head (the engine's head, ears and eyes, Cloud coat) into icons/icon{16,32,48,128}.png and the store
// promo tile, with Playwright's Chromium. Run after changing the look: npm run icons
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const page = `<!doctype html><canvas id=c></canvas><script>
function head(ctx, S, dark) {
  const c = dark ? { top: "#f1f5f9", bot: "#e2e8f0", ear: "#e2e8f0", inner: "#94a3b8", feat: "#334155" } : { top: "#e2e8f0", bot: "#cbd5e1", ear: "#cbd5e1", inner: "#94a3b8", feat: "#334155" };
  ctx.save(); ctx.translate(S / 2, S * 0.58); const k = S / 190; ctx.scale(k, k);
  for (const [x, r] of [[-52, -0.31], [50, 0.31]]) { ctx.save(); ctx.translate(x, -38); ctx.rotate(r);
    ctx.fillStyle = c.ear; ctx.beginPath(); ctx.moveTo(0, -34); ctx.bezierCurveTo(14, -34, 26, -4, 24, 26); ctx.bezierCurveTo(12, 30, -12, 30, -24, 26); ctx.bezierCurveTo(-26, -4, -14, -34, 0, -34); ctx.fill();
    ctx.fillStyle = c.inner; ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(9, -22, 16, -2, 15, 18); ctx.bezierCurveTo(6, 20, -6, 20, -15, 18); ctx.bezierCurveTo(-16, -2, -9, -22, 0, -22); ctx.fill(); ctx.restore(); }
  const w = 73, t = 66, b = 38; ctx.beginPath(); ctx.moveTo(0, -t); ctx.bezierCurveTo(w * .55, -t, w, -t * .55, w, 0); ctx.bezierCurveTo(w, b * .78, w * .48, b, 0, b); ctx.bezierCurveTo(-w * .48, b, -w, b * .78, -w, 0); ctx.bezierCurveTo(-w, -t * .55, -w * .55, -t, 0, -t);
  const g = ctx.createLinearGradient(0, -t, 0, b); g.addColorStop(0, c.top); g.addColorStop(.75, c.top); g.addColorStop(1, c.bot); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = S <= 32 ? 6 : 3.5; ctx.strokeStyle = "#64748b"; ctx.stroke();
  for (const x of [-34, 33]) { ctx.save(); ctx.translate(x, -6); const ew = 20.5, et = 19.5, eb = 13.5;
    ctx.beginPath(); ctx.moveTo(0, -et); ctx.bezierCurveTo(ew * .62, -et, ew, -et * .45, ew, 0); ctx.bezierCurveTo(ew, eb * .75, ew * .55, eb, 0, eb); ctx.bezierCurveTo(-ew * .55, eb, -ew, eb * .75, -ew, 0); ctx.bezierCurveTo(-ew, -et * .45, -ew * .62, -et, 0, -et);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(2, 1, 11.4, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(7.8, -4.2, 2.9, 0, 7); ctx.fill(); ctx.restore(); ctx.restore(); }
  if (S > 32) { ctx.fillStyle = c.feat; ctx.beginPath(); ctx.moveTo(-4.5, 8.5); ctx.lineTo(4.5, 8.5); ctx.lineTo(0, 13.1); ctx.fill();
    ctx.strokeStyle = c.feat; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(-3.6, 12.7, 3.6, .05 * Math.PI, .92 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(3.6, 12.7, 3.6, .08 * Math.PI, .95 * Math.PI); ctx.stroke(); }
  ctx.restore();
}
window.icon = S => { const c = document.getElementById("c"); c.width = c.height = S; const x = c.getContext("2d"); x.clearRect(0, 0, S, S); head(x, S); return c.toDataURL("image/png"); };
window.tile = (W, H) => { const c = document.getElementById("c"); c.width = W; c.height = H; const x = c.getContext("2d");
  x.fillStyle = "#0f172a"; x.fillRect(0, 0, W, H); x.save(); x.translate(W * 0.04, H * 0.14); head(x, H * 0.72, true); x.restore();
  x.fillStyle = "#f1f5f9"; x.font = "600 " + Math.round(H * 0.16) + "px system-ui, sans-serif"; x.fillText("Bracel", W * 0.5, H * 0.48);
  x.fillStyle = "#94a3b8"; x.font = Math.round(H * 0.06) + "px system-ui, sans-serif"; x.fillText("a cat for every website", W * 0.5, H * 0.61);
  return c.toDataURL("image/png"); };
</script>`;
const browser = await chromium.launch(), p = await browser.newPage();
await p.setContent(page);
mkdirSync("icons", { recursive: true }); mkdirSync("store", { recursive: true });
const save = (f, d) => writeFileSync(f, Buffer.from(d.split(",")[1], "base64"));
for (const s of [16, 32, 48, 128]) save(`icons/icon${s}.png`, await p.evaluate(s => window.icon(s), s));
save("store/promo-440x280.png", await p.evaluate(() => window.tile(440, 280)));
await browser.close();
console.log("icons/icon{16,32,48,128}.png, store/promo-440x280.png");
