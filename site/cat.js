/* Bracel on its own website: what src/content.js does, without the extension. Load shared.js, engine.js and spots.js
   first, then this. Settings live in memory for the visit; nothing is saved and nothing is sent. Buttons with
   data-coat or data-act on the page change the coat or show an action now. */
(() => {
  const B = globalThis.BRACEL, S = { ...B.DEF, size: 0.26 };
  const hostEl = document.createElement("bracel-cat"); hostEl.setAttribute("aria-hidden", "true");
  const root = hostEl.attachShadow({ mode: "closed" }), st = document.createElement("style");
  st.textContent = ":host{all:initial!important;display:block!important;position:fixed!important;left:0!important;top:0!important;width:0!important;height:0!important;pointer-events:none!important;z-index:2147483646!important}"
    + "canvas{position:fixed;left:0;top:0;pointer-events:none;contain:strict;z-index:2147483646;visibility:hidden}";
  root.append(st); document.documentElement.append(hostEl);
  const spots = globalThis.BracelSpots({ own: el => el === hostEl });
  const engine = globalThis.BracelEngine({
    store: { get: (k, d) => (k in S ? S[k] : d), set: (k, v) => { S[k] = v; } },
    surfaces: m => spots.surfaces(m), overlay: () => spots.overlay(), theme: () => spots.theme(),
    mount: cv => root.append(cv), onPageChange: f => spots.onChange(f), onThemeChange: f => spots.onTheme(f)
  });
  spots.start(); engine.set(true);
  for (const b of document.querySelectorAll("[data-coat]")) b.addEventListener("click", () => {
    engine.coat(b.dataset.coat); for (const x of document.querySelectorAll("[data-coat]")) x.setAttribute("aria-pressed", x === b);
  });
  for (const b of document.querySelectorAll("[data-act]")) b.addEventListener("click", () => engine.act(b.dataset.act));
})();
