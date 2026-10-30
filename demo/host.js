/* A demo host: what src/content.js does, without the extension. Load src/shared.js, src/engine.js and src/spots.js
   first, then this. Settings live in memory; the Shadow DOM is open so tests can look inside; window.bracelDemo has the
   engine and the spot finder, and showSpots(true) outlines the spots it found. */
(() => {
  const B = globalThis.BRACEL, S = { ...B.DEF };
  const hostEl = document.createElement("bracel-cat"); hostEl.setAttribute("aria-hidden", "true");
  const root = hostEl.attachShadow({ mode: "open" }), st = document.createElement("style");
  st.textContent = ":host{all:initial!important;display:block!important;position:fixed!important;left:0!important;top:0!important;width:0!important;height:0!important;pointer-events:none!important;z-index:2147483646!important}"
    + "canvas{position:fixed;left:0;top:0;pointer-events:none;contain:strict;z-index:2147483646;visibility:hidden}"
    + ".spots{position:fixed;inset:0;pointer-events:none}.spots div{position:fixed;pointer-events:none;font:10px ui-monospace,monospace;color:#fff;padding:0 3px}";
  root.append(st);
  const put = () => { if (!hostEl.isConnected) document.documentElement.append(hostEl); }; put();
  new MutationObserver(put).observe(document.documentElement, { childList: true });
  const spots = globalThis.BracelSpots({ own: el => el === hostEl });
  const engine = globalThis.BracelEngine({
    store: { get: (k, d) => (k in S ? S[k] : d), set: (k, v) => { S[k] = v; } }, test: true,
    surfaces: m => spots.surfaces(m), overlay: () => spots.overlay(), theme: () => spots.theme(),
    mount: cv => root.append(cv), onPageChange: f => spots.onChange(f), onThemeChange: f => spots.onTheme(f),
    onShown: s => { hostEl.dataset.shown = s ? "1" : ""; }
  });
  // outlines of the spots: ledge green, floor blue, bar orange (where its line is, and the run it may use)
  const layer = document.createElement("div"); layer.className = "spots"; root.append(layer); let outl = 0;
  const COL = { ledge: "#16a34a", floor: "#2563eb", shelf: "#2563eb", bar: "#ea580c" };
  function paint() {
    layer.replaceChildren(); if (!outl) return;
    for (const s of spots.surfaces()) {
      const r = s.el.getBoundingClientRect(), y = s.kind === "bar" ? r.bottom : s.kind === "floor" ? r.bottom - 3 : r.top, d = document.createElement("div");
      Object.assign(d.style, { left: r.left + s.x0 + "px", top: y - 2 + "px", width: s.x1 - s.x0 + "px", height: "4px", background: COL[s.kind] });
      const t = document.createElement("div"); t.textContent = s.kind; Object.assign(t.style, { left: r.left + s.x0 + "px", top: y - 16 + "px", background: COL[s.kind] });
      layer.append(d, t);
    }
  }
  spots.onChange(paint); addEventListener("scroll", () => outl && requestAnimationFrame(paint), { passive: true });
  function show() { spots.start(); engine.set(true); }
  window.bracelDemo = { engine, spots, S, show, hide: () => { engine.set(false); spots.stop(); }, showSpots: v => { outl = v ? 1 : 0; clearInterval(window.__bp); if (v) window.__bp = setInterval(paint, 500); paint(); } };
})();
