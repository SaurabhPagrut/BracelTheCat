/* The content script: Bracel's host on a web page. It makes the one element Bracel lives in (<bracel-cat>, holding a
   closed Shadow DOM with the canvas), hands the engine its settings from chrome.storage.sync and its spots from
   spots.js, and answers the toolbar popup and the service worker. It is injected when the toolbar button or the
   shortcut brings Bracel, or by the registered content script on sites where Bracel comes on its own.
   It never changes the page outside its own element, never reads the page's storage or cookies, and sends nothing
   anywhere: its only messages go to this extension. */
(() => {
  if (globalThis.__bracelHost) return;   // injected twice (registered script, then a click): the first one answers
  const B = globalThis.BRACEL, TEST = !!globalThis.__BRACEL_TEST__, site = B.siteOf(location.href);
  const S = { ...B.DEF };
  let engine = null, spots = null, hostEl = null, root = null, ready = null, dead = false;

  /* ---------- the element Bracel lives in ---------- */
  const CSS = ":host{all:initial!important;display:block!important;position:fixed!important;left:0!important;top:0!important;width:0!important;height:0!important;"
    + "overflow:visible!important;pointer-events:none!important;z-index:2147483646!important;contain:none!important}"
    + "canvas{position:fixed;left:0;top:0;pointer-events:none;contain:strict;z-index:2147483646;will-change:transform;visibility:hidden}";
  function ensureHost() {
    if (!hostEl) {
      hostEl = document.createElement("bracel-cat"); hostEl.setAttribute("aria-hidden", "true");
      root = hostEl.attachShadow({ mode: TEST ? "open" : "closed" });
      const st = document.createElement("style"); st.textContent = CSS; root.append(st);
    }
    if (!hostEl.isConnected && document.documentElement) document.documentElement.append(hostEl);
  }
  // pages that replace <body> or empty <html> take it with them: put it back
  let keeper = null;
  function keep() { if (keeper || typeof MutationObserver !== "function") return; keeper = new MutationObserver(() => { if (hostEl && !hostEl.isConnected && engine && engine.on()) ensureHost(); }); keeper.observe(document, { childList: true, subtree: false }); keeper.observe(document.documentElement, { childList: true }); }

  /* ---------- talking to the extension (and noticing when it was updated or removed) ---------- */
  const alive = () => { try { return !dead && !!chrome.runtime && !!chrome.runtime.id; } catch (_) { return false; } };
  function die() { dead = true; if (engine) engine.set(false); if (spots) spots.stop(); if (keeper) keeper.disconnect(); if (hostEl) hostEl.remove(); }
  function tell(msg) { if (!alive()) return die(); try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) { die(); } }
  const store = { get: (k, d) => (k in S ? S[k] : d), set: (k, v) => { S[k] = v; if (alive()) chrome.storage.sync.set({ [k]: v }).catch(() => {}); } };

  /* ---------- Bracel itself, made on first use ---------- */
  function load() {
    if (!ready) ready = chrome.storage.sync.get(B.DEF).then(v => { Object.assign(S, v); }).catch(() => {}).then(() => {
      spots = globalThis.BracelSpots({ own: el => el === hostEl });
      engine = globalThis.BracelEngine({
        store, test: TEST,
        surfaces: m => spots.surfaces(m), overlay: () => spots.overlay(), theme: () => spots.theme(),
        mount: cv => { ensureHost(); root.append(cv); keep(); },
        onPageChange: f => spots.onChange(f), onThemeChange: f => spots.onTheme(f),
        onShown: shown => { tell({ type: "shown", shown }); if (TEST && hostEl) hostEl.dataset.shown = shown ? "1" : ""; }
      });
      if (TEST) setInterval(() => { if (hostEl && engine) { hostEl.dataset.state = engine.state(); hostEl.dataset.spot = engine.spot() || ""; } }, 100);
      return engine;
    });
    return ready;
  }
  async function show(delay = 0) { if (dead) return; await load(); spots.start(); ensureHost(); engine.set(true, delay); }
  async function hide() { if (!engine) return; engine.set(false); spots.stop(); }
  const status = () => ({ on: !!engine && engine.on(), shown: !!engine && engine.shown(), state: engine ? engine.state() : "", site });

  chrome.runtime.onMessage.addListener((m, _sender, reply) => {
    if (!alive() || !m || typeof m.type !== "string") return;
    const done = () => reply(status());
    if (m.type === "status") done();
    else if (m.type === "show") show(0).then(done);
    else if (m.type === "hide") hide().then(done);
    else if (m.type === "toggle") (engine && engine.on() ? hide() : show(0)).then(done);
    else if (m.type === "act") load().then(() => { spots.start(); ensureHost(); engine.act(String(m.name)); done(); });
    else return;
    return true;
  });
  // settings changed in the popup or another tab
  chrome.storage.onChanged.addListener((ch, area) => {
    if (!alive()) return die();
    if (area === "sync" && engine) { const o = {}; for (const k of Object.keys(B.DEF)) if (ch[k]) o[k] = S[k] = ch[k].newValue === undefined ? B.DEF[k] : ch[k].newValue; engine.apply(o); }
    if (area === "local" && ch.sites && site && engine && engine.on() && (ch.sites.newValue || {})[site] === "off") hide();
  });
  addEventListener("pageshow", e => { if (e.persisted && !alive()) die(); }, { passive: true });

  // where Bracel comes on its own (this site, or every site and this one isn't switched off), it arrives after a moment
  globalThis.__bracelHost = { status };
  chrome.storage.local.get({ everywhere: false, sites: {} }).then(({ everywhere, sites }) => {
    const s = site && sites[site];
    if (globalThis.__bracelAuto && (s === "on" || everywhere && s !== "off")) show(2500 + Math.random() * 6500);
  }).catch(() => {});
})();
