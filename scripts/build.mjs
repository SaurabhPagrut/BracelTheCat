// Builds the extension: dist/bracel-<version>/ (unpacked) and dist/bracel-<version>.zip for the stores, or with --test
// dist/test/, a build for the end-to-end tests only: host access granted at install, an open Shadow DOM and a marker
// file (guidelines: a test hook only in test builds). No bundler, no minifying: the store gets the readable source.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const test = process.argv.includes("--test");
const man = JSON.parse(readFileSync("manifest.json", "utf8"));
const out = test ? "dist/test" : `dist/bracel-${man.version}`;
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
for (const f of ["manifest.json", "LICENSE", "CREDITS.md"]) cpSync(f, `${out}/${f}`);
cpSync("icons", `${out}/icons`, { recursive: true });
cpSync("src", `${out}/src`, { recursive: true });

if (test) {
  man.host_permissions = ["<all_urls>"]; man.name += " (test build)";
  writeFileSync(`${out}/manifest.json`, JSON.stringify(man, null, 2));
  writeFileSync(`${out}/src/test-flag.js`, "/* test builds only */\nglobalThis.__BRACEL_TEST__ = true;\n");
  const sh = `${out}/src/shared.js`, src = readFileSync(sh, "utf8");
  if (!src.includes('FILES: ["src/shared.js"')) throw new Error("shared.js FILES moved; update build.mjs");
  writeFileSync(sh, src.replace('FILES: ["src/shared.js"', 'FILES: ["src/test-flag.js", "src/shared.js"'));
  console.log(out);
} else {
  const zip = `dist/bracel-${man.version}.zip`; rmSync(zip, { force: true });
  execFileSync("zip", ["-qr", "-X", `../bracel-${man.version}.zip`, "."], { cwd: out });
  if (!existsSync(zip)) throw new Error("zip failed");
  console.log(`${out}/ and ${zip}`);
}
