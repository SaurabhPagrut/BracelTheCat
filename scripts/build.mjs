// Builds the extension, one folder per browser: dist/<browser>/bracel-<browser>-<version>/ (unpacked) and, for the
// stores that take one, dist/<browser>/bracel-<browser>-<version>.zip; dist/README.md says which goes where. With --test
// it builds dist/test/, a build for the end-to-end tests only: host access granted at install, an open Shadow DOM and a
// marker file (guidelines: a test hook only in test builds). No bundler, no minifying: the stores get the readable source.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const test = process.argv.includes("--test");
const base = JSON.parse(readFileSync("manifest.json", "utf8")), V = base.version;

function copy(out, man) {
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  for (const f of ["LICENSE", "CREDITS.md"]) cpSync(f, `${out}/${f}`);
  cpSync("icons", `${out}/icons`, { recursive: true });
  cpSync("src", `${out}/src`, { recursive: true });
  writeFileSync(`${out}/manifest.json`, JSON.stringify(man, null, 2) + "\n");
}
function zip(dir, name) {
  const z = `${dir}/${name}.zip`; rmSync(z, { force: true });
  execFileSync("zip", ["-qr", "-X", `../${name}.zip`, "."], { cwd: `${dir}/${name}` });
  if (!existsSync(z)) throw new Error("zip failed"); return z;
}

if (test) {
  const man = { ...base, host_permissions: ["<all_urls>"], name: base.name + " (test build)" };
  copy("dist/test", man);
  writeFileSync("dist/test/src/test-flag.js", "/* test builds only */\nglobalThis.__BRACEL_TEST__ = true;\n");
  const sh = "dist/test/src/shared.js", src = readFileSync(sh, "utf8");
  if (!src.includes('FILES: ["src/shared.js"')) throw new Error("shared.js FILES moved; update build.mjs");
  writeFileSync(sh, src.replace('FILES: ["src/shared.js"', 'FILES: ["src/test-flag.js", "src/shared.js"'));
  console.log("dist/test");
  process.exit(0);
}

// Firefox: a background script instead of a service worker (shared.js first, as importScripts does in Chrome), an add-on
// id, and the built-in data consent saying nothing is collected (required for new add-ons since November 2025; Firefox
// for Android has it from 142, so its minimum is set too, or AMO warns)
function firefox(m) {
  const { minimum_chrome_version, ...man } = m;
  man.background = { scripts: ["src/shared.js", "src/background.js"] };
  man.browser_specific_settings = { gecko: { id: "bracel@saurabhpagrut.in", strict_min_version: "140.0", data_collection_permissions: { required: ["none"] } },
    gecko_android: { strict_min_version: "142.0" } };
  return man;
}
// Safari: the same package, turned into an Xcode project by Apple's converter on a Mac (see dist/README.md)
function safari(m) { const { minimum_chrome_version, ...man } = m; return man; }

const BROWSERS = [
  ["chrome", m => m, true], ["edge", m => m, true], ["opera", m => m, true],
  ["firefox", firefox, true], ["safari", safari, false]
];
const made = [];
for (const [b, adapt, zipped] of BROWSERS) {
  const dir = `dist/${b}`, name = `bracel-${b}-${V}`;
  rmSync(dir, { recursive: true, force: true });
  copy(`${dir}/${name}`, adapt(structuredClone(base)));
  made.push(zipped ? zip(dir, name) : `${dir}/${name}/`);
}

writeFileSync("dist/README.md", `# Bracel ${V}: one folder per browser

Built by \`npm run build\`. Each folder holds the unpacked extension (to try it locally) and the zip to upload.

| Folder | Upload this | Where | Notes |
| --- | --- | --- | --- |
| \`chrome/\` | \`bracel-chrome-${V}.zip\` | https://chrome.google.com/webstore/devconsole | Also what Brave, Vivaldi, Arc and Yandex users install, from the Chrome Web Store |
| \`edge/\` | \`bracel-edge-${V}.zip\` | https://partner.microsoft.com/dashboard/microsoftedge | Same files as Chrome |
| \`opera/\` | \`bracel-opera-${V}.zip\` | https://addons.opera.com/developer/ | Same files as Chrome; Opera users can also install from the Chrome Web Store |
| \`firefox/\` | \`bracel-firefox-${V}.zip\` | https://addons.mozilla.org/developers/ | Background script instead of a service worker, add-on id \`bracel@saurabhpagrut.in\`, "no data collected" declared; Firefox 140+ |
| \`safari/\` | (no zip) | App Store Connect, inside a Mac app | Needs Xcode and the Apple Developer Program: \`xcrun safari-web-extension-converter dist/safari/bracel-safari-${V} --app-name Bracel --bundle-identifier in.saurabhpagrut.bracel\`, then build, sign and submit from Xcode |

Try one locally: Chrome/Edge/Opera → extensions page → Developer mode → Load unpacked → the \`bracel-<browser>-${V}\` folder.
Firefox → \`about:debugging#/runtime/this-firefox\` → Load Temporary Add-on → its \`manifest.json\`.
`);
console.log(made.join("\n") + "\ndist/README.md");
