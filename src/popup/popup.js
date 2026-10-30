/* The toolbar popup: bring Bracel to this tab or send it away, switch it on for this site or every site (the browser
   asks for the permission right then), and pick its coat, size, sound and activities. Settings go to
   chrome.storage.sync; per-site choices to chrome.storage.local. Opened outside the extension (the demo page), it
   runs on a pretend browser so it can be tried. */
(async () => {
  const B = globalThis.BRACEL, $ = id => document.getElementById(id);
  const api = globalThis.chrome && chrome.runtime && chrome.runtime.id ? chrome : pretend();
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  const tabId = tab && tab.id, site = tab && B.siteOf(tab.url || ""), host = site ? site.replace(/^\w+:\/\//, "") || "local files" : "";
  const ask = msg => api.runtime.sendMessage({ ...msg, tabId }).catch(() => null);
  const S = await api.storage.sync.get(B.DEF);
  const local = await api.storage.local.get({ everywhere: false, sites: {} });

  /* ---------- this tab ---------- */
  let st = site ? await ask({ type: "status" }) : null;
  const bring = $("bring");
  function paintTab() {
    $("restricted").hidden = !!site; bring.disabled = !site;
    const here = !!(st && st.on);
    bring.textContent = here ? "Send Bracel away" : "Bring Bracel here"; bring.classList.toggle("away", here);
    $("where").textContent = here ? "here now" : "";
  }
  bring.addEventListener("click", async () => {
    bring.disabled = true; const r = await ask({ type: st && st.on ? "away" : "bring" });
    if (r && r.error) { $("restricted").hidden = false; } else st = r; bring.disabled = !site; paintTab();
  });

  /* ---------- this site and every site ---------- */
  const siteBox = $("site"), every = $("every");
  $("siteName").textContent = host ? "(" + host + ")" : "";
  function paintSites() {
    const s = site && local.sites[site];
    every.checked = !!local.everywhere;
    siteBox.checked = !!site && (s === "on" || local.everywhere && s !== "off"); siteBox.disabled = !site;
  }
  async function setSite(v) {
    const sites = { ...local.sites };
    if (v) {
      if (local.everywhere) delete sites[site];
      else if (!(await api.permissions.request({ origins: [B.patternOf(site)] }))) return paintSites();   // the worker marks it on and brings Bracel
      else return reload();
    } else {
      sites[site] = "off";
      if (!local.everywhere) await api.permissions.remove({ origins: [B.patternOf(site)] }).catch(() => {});
      st = await ask({ type: "away" });
    }
    local.sites = sites; await api.storage.local.set({ sites }); paintSites(); paintTab();
  }
  async function setEvery(v) {
    if (v) { if (!(await api.permissions.request({ origins: ["<all_urls>"] }))) return paintSites(); }
    else await api.permissions.remove({ origins: ["<all_urls>"] }).catch(() => {});
    await ask({ type: "sync" }); reload();
  }
  async function reload() { Object.assign(local, await api.storage.local.get({ everywhere: false, sites: {} })); st = site ? await ask({ type: "status" }) : null; paintSites(); paintTab(); }
  siteBox.addEventListener("change", () => setSite(siteBox.checked));
  every.addEventListener("change", () => setEvery(every.checked));

  /* ---------- look ---------- */
  const save = (k, v) => { S[k] = v; api.storage.sync.set({ [k]: v }); };
  const coats = $("coats");
  for (const [k, name, sw] of B.COATS) {
    const l = document.createElement("label"); l.className = "coat";
    const i = document.createElement("input"); i.type = "radio"; i.name = "coat"; i.value = k; i.checked = S.coat === k;
    i.addEventListener("change", () => i.checked && save("coat", k));
    const dot = document.createElement("i"); dot.style.background = sw; if (k === "tuxedo") dot.className = "tux";
    l.append(i, dot, document.createTextNode(name)); coats.append(l);
  }
  const size = $("size"), out = $("sizeOut");
  size.value = S.size; out.textContent = (+S.size).toFixed(2);
  size.addEventListener("input", () => { out.textContent = (+size.value).toFixed(2); });
  size.addEventListener("change", () => save("size", +size.value));
  $("sound").checked = !!S.sound; $("sound").addEventListener("change", e => save("sound", e.target.checked));

  /* ---------- activities ---------- */
  const off = new Set(S.acts), list = $("acts");
  for (const [k, name] of B.ACTS) {
    const li = document.createElement("li"), l = document.createElement("label"), c = document.createElement("input"), t = document.createElement("span");
    c.type = "checkbox"; c.checked = !off.has(k); t.textContent = name; t.title = name;
    c.addEventListener("change", () => { if (c.checked) off.delete(k); else off.add(k); save("acts", [...off]); });
    const play = document.createElement("button"); play.type = "button"; play.textContent = "▶"; play.setAttribute("aria-label", "Show " + name + " now"); play.disabled = !site;
    play.addEventListener("click", async () => { const r = await ask({ type: "act", name: k }); if (r && !r.error) { st = r; paintTab(); } else $("restricted").hidden = false; });
    l.append(c, t); li.append(l, play); list.append(li);
  }

  /* ---------- shortcut and credit ---------- */
  const cmds = api.commands ? await api.commands.getAll().catch(() => []) : [];
  const cmd = cmds.find(c => c.name === "toggle-bracel");
  $("kbd").textContent = (cmd && cmd.shortcut) || "not set";
  $("keys").addEventListener("click", e => { e.preventDefault(); api.tabs.create({ url: /Edg\//.test(navigator.userAgent) ? "edge://extensions/shortcuts" : "chrome://extensions/shortcuts" }); });
  const cr = $("credit"), link = (text, href) => { const a = document.createElement("a"); a.textContent = text; a.href = href; a.target = "_blank"; a.rel = "noopener"; return a; };
  cr.append("Bracel's look is adapted from ", link("Bento Cat", "https://rive.app/marketplace/21131-39716-bento-cat/"), " by mikewirsch, licensed ",
    link("CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"), ". Redrawn and animated in code; walking, hanging, jumping, hiding, spots, behaviour and coats are our own.");

  paintTab(); paintSites();

  // a pretend browser for trying the popup outside the extension: nothing is saved, nothing is asked
  function pretend() {
    const mem = { sync: { ...B.DEF }, local: { everywhere: false, sites: {} } }, cat = { on: false };
    const area = a => ({ get: async d => ({ ...d, ...mem[a] }), set: async o => { Object.assign(mem[a], o); } });
    return {
      tabs: { query: async () => [{ id: 1, url: "https://example.com/" }], create: async () => {} },
      storage: { sync: area("sync"), local: area("local") },
      permissions: { request: async ({ origins }) => { if (origins[0] === "<all_urls>") mem.local.everywhere = true; else mem.local.sites["https://example.com"] = "on"; return true; },
        remove: async ({ origins }) => { if (origins[0] === "<all_urls>") mem.local.everywhere = false; return true; } },
      runtime: { sendMessage: async m => { if (m.type === "bring" || m.type === "act") cat.on = true; if (m.type === "away") cat.on = false; return { ...cat, shown: cat.on }; } },
      commands: { getAll: async () => [{ name: "toggle-bracel", shortcut: B.SHORTCUT }] }
    };
  }
})();
