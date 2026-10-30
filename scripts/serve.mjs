// A tiny static server for the demo pages and the tests (http://localhost:8080). Local only, no dependencies.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd(), port = +(process.env.PORT || 8080);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".jpg": "image/jpeg" };
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname); if (p.endsWith("/")) p += "index.html";
  const file = normalize(join(root, p)); if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { const body = await readFile(file); res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" }).end(body); }
  catch (_) { res.writeHead(404, { "content-type": "text/plain" }).end("not found"); }
}).listen(port, "127.0.0.1", () => console.log(`http://localhost:${port}/demo/`));
