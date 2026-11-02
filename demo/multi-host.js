/* A demo host for more than one Bracel on a page (demo/multi.html). Like demo/host.js, but one shared spot finder feeds
   several engines, each with its own settings (coat) and its own canvas in the one <bracel-cat> element.
   It also times the work: requestAnimationFrame is wrapped so each frame's script time across all the cats is recorded,
   and the canvases' memory is added up. Load src/shared.js, src/engine.js and src/spots.js first, then this.
   Not in the extension: the engine is unchanged and each copy still has its own listeners, timer and audio. */
(() => {
  const B = globalThis.BRACEL, ORDER = ["cloud", "amber", "tuxedo", "blue", "slate"];
  // time every animation-frame callback; callbacks with the same timestamp belong to one frame
  const raf0 = window.requestAnimationFrame.bind(window), frames = [];
  let cur = null;
  window.requestAnimationFrame = cb => raf0(t => {
    const s = performance.now(); cb(t); const d = performance.now() - s;
    if (!cur || cur.t !== t) { cur = { t, ms: 0, at: performance.now() }; frames.push(cur); if (frames.length > 600) frames.shift(); }
    cur.ms += d;
  });

  const hostEl = document.createElement("bracel-cat"); hostEl.setAttribute("aria-hidden", "true");
  const root = hostEl.attachShadow({ mode: "open" }), st = document.createElement("style");
  st.textContent = ":host{all:initial!important;display:block!important;position:fixed!important;left:0!important;top:0!important;width:0!important;height:0!important;pointer-events:none!important;z-index:2147483646!important}"
    + "canvas{position:fixed;left:0;top:0;pointer-events:none;contain:strict;z-index:2147483646;visibility:hidden}";
  root.append(st);
  const put = () => { if (!hostEl.isConnected) document.documentElement.append(hostEl); }; put();
  new MutationObserver(put).observe(document.documentElement, { childList: true });

  const spots = globalThis.BracelSpots({ own: el => el === hostEl });
  const cats = [];
  let ownSpots = true, size = 0.2, mixNew = true;
  // with "one cat per spot", a cat is not offered the spots the other cats stand on; the bottom of the window is shared
  function surfacesFor(me) {
    return m => {
      const all = spots.surfaces(m); if (!ownSpots) return all;
      const taken = cats.filter(c => c !== me && c.engine.shown()).map(c => c.engine._t.st.spot).filter(Boolean);
      return all.filter(s => s.el.tagName === "VIEWPORT" || !taken.some(t => t.el === s.el && t.kind === s.kind));
    };
  }
  function add() {
    if (cats.length >= ORDER.length) return;
    const me = { S: { ...B.DEF, coat: ORDER[cats.length], size, sound: false } };
    me.extra = globalThis.BracelNewActions ? globalThis.BracelNewActions() : null;   // the roadmap's candidate actions
    me.engine = globalThis.BracelEngine({
      store: { get: (k, d) => (k in me.S ? me.S[k] : d), set: (k, v) => { me.S[k] = v; } }, test: true,
      pose: me.extra && me.extra.pose, paint: me.extra && me.extra.paint,
      surfaces: surfacesFor(me), overlay: () => spots.overlay(), theme: () => spots.theme(),
      mount: cv => root.append(cv), onPageChange: f => spots.onChange(f), onThemeChange: f => spots.onTheme(f)
    });
    if (me.extra) { me.extra.install(me.engine); me.extra.mix(mixNew); }
    cats.push(me); me.engine.set(true);
  }
  function remove() {
    const me = cats.pop(); if (!me) return;
    me.engine.set(false); const cv = me.engine.el(); cv && cv.remove();  // its listeners and timer stay until the page reloads
  }
  function stats(ms = 2000) {
    const since = performance.now() - ms, f = frames.filter(x => x.at >= since).map(x => x.ms).sort((a, b) => a - b);
    const avg = f.length ? f.reduce((a, b) => a + b, 0) / f.length : 0, p95 = f.length ? f[Math.min(f.length - 1, Math.floor(f.length * 0.95))] : 0;
    const bytes = cats.reduce((a, c) => { const cv = c.engine.el(); return a + (cv ? cv.width * cv.height * 4 : 0); }, 0);
    return { cats: cats.length, frames: f.length, perSecond: f.length / (ms / 1000), avg, p95, max: f.length ? f[f.length - 1] : 0, canvasMB: bytes / 1048576,
      states: cats.map(c => `${c.S.coat}: ${c.engine.shown() ? c.engine.state() : "away"}${c.engine.spot() ? " on " + c.engine.spot() : ""}`) };
  }
  spots.start();
  window.bracelMulti = {
    spots, cats, add, remove, stats,
    count: n => { while (cats.length < n) add(); while (cats.length > n) remove(); },
    size: v => { size = v; cats.forEach(c => c.engine.size(v)); },
    ownSpots: v => { ownSpots = v; },
    mix: v => { mixNew = v; cats.forEach(c => c.extra && c.extra.mix(v)); },
    act: k => cats.forEach(c => c.engine.act(k))
  };
})();
