// Builds the website (bracel.saurabhpagrut.in, Cloudflare Pages) into dist/site/: the pages in site/, the engine
// files the landing page's cat runs on, the icons and screenshots, and privacy.html made from PRIVACY.md, so the
// policy has one source. Cloudflare Pages: build command "npm run site", output directory "dist/site".
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "dist/site";
rmSync(out, { recursive: true, force: true }); mkdirSync(`${out}/js`, { recursive: true }); mkdirSync(`${out}/img`);
for (const f of ["index.html", "site.css", "_headers"]) cpSync(`site/${f}`, `${out}/${f}`);
for (const f of ["shared.js", "engine.js", "spots.js"]) cpSync(`src/${f}`, `${out}/js/${f}`);
cpSync("site/cat.js", `${out}/js/cat.js`);
for (const s of [32, 128]) cpSync(`icons/icon${s}.png`, `${out}/img/icon${s}.png`);
cpSync("store/screenshot-1.png", `${out}/img/screenshot-1.png`); cpSync("store/promo-440x280.png", `${out}/img/promo.png`);

// just enough Markdown for PRIVACY.md: headings, paragraphs, lists, one table, **bold**, *italic*, `code`, bare links
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>")
  .replace(/https:\/\/[^\s<)]+[^\s<).,]/g, u => `<a href="${u}">${u.replace(/^https:\/\//, "").replace(/\/$/, "")}</a>`);
function md(text) {
  const html = [];
  for (const block of text.trim().split(/\n\s*\n/)) {
    const lines = block.split("\n"), h = /^(#{1,3}) (.*)/.exec(block);
    if (h) html.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    else if (lines.every(l => /^\|/.test(l))) {
      const cells = l => l.replace(/^\||\|$/g, "").split("|").map(c => c.trim()), [head, , ...rows] = lines;
      html.push(`<table><thead><tr>${cells(head).map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>`
        + rows.map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") + "</tbody></table>");
    } else if (/^- /.test(block)) html.push("<ul>" + block.split(/\n(?=- )/).map(i => `<li>${inline(i.slice(2).replace(/\n\s*/g, " "))}</li>`).join("") + "</ul>");
    else html.push(`<p>${inline(block.replace(/\n/g, " "))}</p>`);
  }
  return html.join("\n");
}

// the inner pages share the landing page's header and footer
const index = readFileSync("site/index.html", "utf8"), part = (a, b) => index.slice(index.indexOf(a), index.indexOf(b) + b.length);
const page = (title, desc, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="icon" href="/img/icon32.png">
<link rel="stylesheet" href="/site.css">
</head>
<body>
${part('<header class="top">', "</div></header>").replace('href="#how"', 'href="/#how"')}

<main class="wrap doc">
${body}
</main>

${part("<footer>", "</div></footer>")}
</body>
</html>
`;
writeFileSync(`${out}/privacy.html`, page("Bracel privacy policy", "Bracel collects nothing and sends nothing anywhere. What it stores on your device, and why it asks for each permission.", md(readFileSync("PRIVACY.md", "utf8"))));
writeFileSync(`${out}/404.html`, page("Not found · Bracel", "This page does not exist.", '<h1>Nothing here</h1>\n<p>Bracel looked behind every edge and found no page at this address. <a href="/">Back home</a></p>'));
console.log(`${out}/`);
