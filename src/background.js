/* The service worker. Tiny on purpose (guidelines §2): it shows "on" on the toolbar badge for tabs Bracel is on, brings
   Bracel to a tab or sends it away (toolbar popup, shortcut), and keeps one registered content script in step with the
   permissions the user granted: one origin per site switched on, or every site, minus the sites switched off. */
importScripts("shared.js");
const B = globalThis.BRACEL, ID = "bracel";
const FILES = B.FILES, AUTO = ["src/auto.js", ...FILES];

/* ---------- the registered content script follows the permissions and the per-site choices ---------- */
let syncing = Promise.resolve();
function sync() { return (syncing = syncing.then(syncNow, syncNow)); }
async function syncNow() {
  const { origins = [] } = await chrome.permissions.getAll();
  const everywhere = origins.includes("<all_urls>") || origins.includes("*://*/*");
  const { sites = {} } = await chrome.storage.local.get({ sites: {} });
  await chrome.storage.local.set({ everywhere });
  const own = Object.keys(sites).filter(s => sites[s] === "on" && origins.includes(B.patternOf(s))).map(B.patternOf);
  const matches = everywhere ? ["<all_urls>"] : own;
  const excludeMatches = Object.keys(sites).filter(s => sites[s] === "off").map(B.patternOf);
  const had = await chrome.scripting.getRegisteredContentScripts({ ids: [ID] }).catch(() => []);
  const script = { id: ID, js: AUTO, matches, excludeMatches, runAt: "document_idle", allFrames: false, persistAcrossSessions: true };
  // changed in place, so a page loading meanwhile never falls in a gap with no script registered
  if (had.length && matches.length) await chrome.scripting.updateContentScripts([script]);
  else if (had.length) await chrome.scripting.unregisterContentScripts({ ids: [ID] }).catch(() => {});
  else if (matches.length) await chrome.scripting.registerContentScripts([script]);
}

/* ---------- one tab: is Bracel there, bring it, send it away, play one activity ---------- */
const send = (tabId, msg) => chrome.tabs.sendMessage(tabId, msg, { frameId: 0 }).catch(() => null);
async function inject(tabId) {
  if (await send(tabId, { type: "status" })) return true;
  try { await chrome.scripting.executeScript({ target: { tabId, frameIds: [0] }, files: FILES }); return true; } catch (_) { return false; }
}
async function toTab(tabId, msg) { if (!(await inject(tabId))) return { error: "restricted" }; return (await send(tabId, msg)) || { error: "restricted" }; }

chrome.runtime.onMessage.addListener((m, sender, reply) => {
  if (!m || typeof m.type !== "string") return;
  // from a content script: Bracel arrived or left this tab
  if (m.type === "shown" && sender.tab) { badge(sender.tab.id, !!m.shown); return; }
  if (sender.id !== chrome.runtime.id || !(sender.url || "").startsWith(chrome.runtime.getURL("src/popup/"))) return;   // the rest only from the popup
  const tabId = m.tabId | 0;
  if (m.type === "status") send(tabId, { type: "status" }).then(r => reply(r || { on: false, shown: false }));
  else if (m.type === "bring") toTab(tabId, { type: "show" }).then(reply);
  else if (m.type === "away") send(tabId, { type: "hide" }).then(r => reply(r || {}));
  else if (m.type === "act") toTab(tabId, { type: "act", name: String(m.name) }).then(reply);
  else if (m.type === "sync") sync().then(() => reply({ ok: true }), e => reply({ error: String(e) }));
  else return;
  return true;
});

/* ---------- the badge ---------- */
function badge(tabId, on) {
  chrome.action.setBadgeText({ tabId, text: on ? "on" : "" }).catch(() => {});
  if (on) chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563eb" }).catch(() => {});
}
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.status === "loading") badge(tabId, false); });

/* ---------- the shortcut: show or hide Bracel on the current tab ---------- */
chrome.commands.onCommand.addListener(async (cmd, tab) => {
  if (cmd !== "toggle-bracel") return;
  if (!tab) [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab && tab.id != null) toTab(tab.id, { type: "toggle" });
});

/* ---------- permissions granted from the popup (the popup may close while the browser asks, so the rest happens here) ---------- */
chrome.permissions.onAdded.addListener(async ({ origins = [] }) => {
  const { sites = {} } = await chrome.storage.local.get({ sites: {} });
  for (const o of origins) { const s = o.endsWith("/*") ? o.slice(0, -2) : null; if (s && B.siteOf(s + "/") === s) sites[s] = "on"; }
  await chrome.storage.local.set({ sites }); await sync();
  // bring it to the tab the user was on when they said yes
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const s = tab && B.siteOf(tab.url || "");
  if (tab && s && sites[s] !== "off" && (origins.includes("<all_urls>") || origins.includes(B.patternOf(s)))) toTab(tab.id, { type: "show" });
});
chrome.permissions.onRemoved.addListener(() => sync());
chrome.storage.onChanged.addListener((ch, area) => { if (area === "local" && ch.sites) sync(); });
chrome.runtime.onInstalled.addListener(() => sync());
chrome.runtime.onStartup.addListener(() => sync());
