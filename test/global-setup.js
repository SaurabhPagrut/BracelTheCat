// Builds dist/test once before the tests (the extension tests load it).
import { execFileSync } from "node:child_process";
export default () => { execFileSync(process.execPath, ["scripts/build.mjs", "--test"], { stdio: "inherit" }); };
