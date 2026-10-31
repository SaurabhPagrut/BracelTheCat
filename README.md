# Bracel for every website

A browser extension that puts **Bracel**, a small round cat, on the websites you visit. Bracel lives on the edges of
the page (the tops of boxes and images, under headers, on the bottom of the window), walks, jumps, hangs, grooms, naps
and purrs, and never gets in the way: it takes no clicks, no focus and no keys.

- **Nothing leaves the browser.** No network requests, no analytics. Settings live in `chrome.storage.sync`.
- **Ask for as little as possible.** Click the toolbar button to bring Bracel to a tab. "On this site" and "On every
  site" ask for the permission they need at the moment you switch them on.
- Plain JavaScript, Manifest V3, no dependencies at run time.

## Try it

1. `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → pick this folder.
2. Open any website, click the Bracel button in the toolbar, then switch on **Show Bracel on this tab**.
3. Shortcut: `Alt+Shift+B` shows or hides Bracel on the current tab.

The demo pages in `demo/` run the engine without the extension: `npm run serve` and open http://localhost:8080/demo/.

## Working on it

| | |
| --- | --- |
| `src/engine.js` | Bracel itself: poses, drawing, behaviour, sound. Knows nothing about the page |
| `src/spots.js` | Finds places to stand and hang on any website, and open dialogs to keep away from |
| `src/content.js` | The content script: the closed Shadow DOM host, settings, messages |
| `src/background.js` | The service worker: badge, shortcut, per-site state, content script registration |
| `src/popup/` | The toolbar popup |
| `demo/` | Demo pages for the owner |
| `test/` | Playwright tests (engine, spot finder against saved pages, the extension end to end) |

```sh
npm install          # Playwright, for the tests only
npm run lint         # syntax and policy checks (no eval, no network, no remote code)
npm test             # all tests
npm run build        # dist/<browser>/ for Chrome, Edge, Opera, Firefox and Safari (dist/README.md says which goes where)
npm run site         # dist/site/, the website (bracel.saurabhpagrut.in) with the privacy policy
```

Releasing (website, Chrome Web Store, updates): `PUBLISHING.md`. Privacy policy: `PRIVACY.md`, published at
https://bracel.saurabhpagrut.in/privacy.

Rules: `EXTENSION_GUIDELINES.md`. Plan: `ROADMAP.md`. How to work on it: `CLAUDE.md`.

## Credits

Bracel's look is adapted from Bento Cat by mikewirsch (rive.app/marketplace/21131-39716-bento-cat), licensed CC BY 4.0
(creativecommons.org/licenses/by/4.0). Redrawn and animated in code; walking, hanging, jumping, hiding, spots,
behaviour and coats are our own. See `CREDITS.md`.

The code is MIT licensed (`LICENSE`). The CC BY 4.0 credit stays with the art.
