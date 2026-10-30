// Syntax and policy checks (guidelines §1, §3, §5, §9): every script parses; no eval, no remote code, no network;
// the injected scripts stay under 120 KB; the manifest and package agree on the version.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const js = [...walk("src"), ...walk("scripts"), ...walk("test"), ...walk("demo")].filter(f => /\.(m?js)$/.test(f));
const fail = [];
for (const f of js) { try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); } catch (e) { fail.push(`${f}: ${String(e.stderr).split("\n").slice(0, 4).join(" ")}`); } }

const BANNED = [
  [/\beval\s*\(/, "eval"], [/new\s+Function\b/, "new Function"], [/\bfetch\s*\(/, "fetch (no network)"], [/XMLHttpRequest/, "XMLHttpRequest (no network)"],
  [/\bWebSocket\b/, "WebSocket (no network)"], [/sendBeacon/, "sendBeacon (no network)"], [/\.innerHTML\s*=/, "innerHTML"], [/document\.write/, "document.write"],
  [/localStorage|sessionStorage|document\.cookie/, "the page's storage or cookies"], [/preventDefault|stopPropagation|stopImmediatePropagation/, "blocking page events"],
  [/setTimeout\s*\(\s*["'`]/, "setTimeout with a string"]
];
for (const f of walk("src").filter(f => f.endsWith(".js"))) {
  const src = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'])\/\/.*$/gm, "$1");
  for (const [re, what] of BANNED) {
    // the popup may stop a link's own navigation (it opens the shortcuts page itself); it is the extension's page, not a website
    if (what === "blocking page events" && f.endsWith("popup.js") && !/stopPropagation/.test(src)) continue;
    if (re.test(src)) fail.push(`${f}: uses ${what}`);
  }
  if (/importScripts\s*\(/.test(src) && !f.endsWith("background.js")) fail.push(`${f}: importScripts outside the service worker`);
  if (/https?:\/\/(?!rive\.app\/marketplace\/21131-39716-bento-cat\/|creativecommons\.org\/licenses\/by\/4\.0\/|example\.com\b)/.test(src)) fail.push(`${f}: a URL other than the credit's`);
}

const man = JSON.parse(readFileSync("manifest.json", "utf8")), pkg = JSON.parse(readFileSync("package.json", "utf8"));
if (man.version !== pkg.version) fail.push(`manifest.json ${man.version} and package.json ${pkg.version} differ`);
const files = ["src/shared.js", "src/engine.js", "src/spots.js", "src/content.js"];
const kb = files.reduce((a, f) => a + statSync(f).size, 0) / 1024;
if (kb > 120) fail.push(`injected scripts are ${kb.toFixed(1)} KB (limit 120)`);
for (const k of ["host_permissions", "content_scripts", "web_accessible_resources"]) if (man[k]) fail.push(`manifest.json has ${k}; Bracel asks at run time instead`);

if (fail.length) { console.error(fail.join("\n")); process.exit(1); }
console.log(`lint ok: ${js.length} scripts, injected ${kb.toFixed(1)} KB`);
