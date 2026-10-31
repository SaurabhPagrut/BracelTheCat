# Extension guidelines

The rules Bracel for every website follows. When a rule and a feature disagree, the rule wins, or the rule changes here
first, with the reason.

## 1. The promise to the user

- **Never in the way.** No clicks, no focus, no keys, no text selection: `pointer-events: none` on everything Bracel
  draws. A click where it sits makes it step aside; three quick clicks annoy it. It must never cover something the user
  is actively using: it leaves a spot when a popup, menu or dialog opens over it.
- **Nothing leaves the browser.** No network requests at all: no analytics, no error reporting, no remote config, no
  fonts or images from elsewhere. Settings live in `chrome.storage.sync`.
- **Quiet by default where it matters.** Respect `prefers-reduced-motion` (sits still) and stop completely in
  background tabs. The purr is on by default, but browsers only allow sound after the user clicks or taps the page.
- **Easy to turn off:** per site and everywhere, from the toolbar button, and with a keyboard shortcut.

## 2. Manifest V3 and permissions

- Manifest V3 only. A service worker for the background, which stays tiny (badge, per-site state, commands).
- **Ask for as little as possible.** Decided 30 Oct 2026 (roadmap, Decisions):
  - `activeTab` + `scripting`: the user clicks the toolbar button (or the shortcut) to bring Bracel to the current tab.
    No scary install warning. It lasts until the tab navigates away.
  - **On this site:** requests that one origin (`https://example.com/*`) at runtime, then a registered content script
    brings Bracel back on every visit.
  - **On every site:** optional host permissions (`optional_host_permissions: ["<all_urls>"]`), requested at runtime
    only when the user turns it on. The browser then shows its warning at that moment, with context. Sites switched off
    are excluded from the registered content script.
  - Where Bracel arrives on its own (this site, every site), it comes "most of the time": a few seconds after the page
    settles, and it sometimes leaves and comes back. Brought by a click, it arrives at once.
  - `storage` for settings. Nothing else unless a feature truly needs it, and then documented here.
- Never run on `chrome://`, `edge://`, `about:`, the extension stores, `file://` (unless the user allows it), or inside
  iframes (`all_frames: false`).
- A block list the user can edit, seeded with nothing. No hidden site lists.

## 3. Isolation from the page

- One host element (`<bracel-cat>`) appended to `document.documentElement`, holding a **closed Shadow DOM**. Inside it
  is the canvas plus a `<style>` with `:host{all:initial}`, so page CSS can't restyle it.
- The canvas: `position:fixed; left:0; top:0; pointer-events:none; contain:strict; z-index:2147483646`.
  `aria-hidden="true"`, no tab stop.
- Never modify the page's DOM outside the host element, never touch page globals, never read or write the page's
  `localStorage` / cookies. Listen to events with `{passive:true, capture:true}` and never call `preventDefault` or
  `stopPropagation`.
- Survive pages that replace `<body>` or the whole document (SPAs): re-attach the host if it is removed.
- Content scripts are not bound by the page's CSP, but the code must not use `eval`, `new Function` or inline
  `<script>` anywhere.

## 4. Finding spots on any website

The new part. It must be cheap, cautious and boring.

- **Kinds:** `ledge` (stand on the top edge of a box), `shelf`/`floor` (stand on the bottom inside a box or on the
  window's bottom), `bar` (hang below a header or a box's bottom edge), walls (vertical edges to scratch and hide behind).
- **Candidates:** visible elements at least ~2× Bracel's width with a clear rectangular edge. Use cards, panels,
  sections with a border or a background different from their parent, images, `header`/`nav`/`[role=banner]`, sticky
  or fixed top bars, sidebars (`aside`, `nav` along a side). Skip tiny, rotated, transparent or off-screen boxes.
- **Always available:** the bottom of the viewport is a floor, so Bracel has a home on any page.
- **Budget:** scan at most every 2.5 s and on scroll or resize settle, and stop after ~4 ms per scan (resume next idle
  callback). Use `requestIdleCallback` where it exists. Cache rectangles; never call `getBoundingClientRect` on the
  whole document in one frame.
- **Avoid:** text inputs and editors being typed in (keep a margin around the focused element), video players, canvases
  and maps the user is dragging, open dialogs and menus, anything with `aria-modal`.
- **Keep clear (added 30 Oct 2026):** standing spots stay out of the site's header and menu bars (it may hang under
  them), off buttons, links and form controls, and clear of every visible field to type in, focused or not. The bottom of
  the window gives way only to the focused field and open popups, so it stays a home.
- Re-check the current spot when the page mutates (MutationObserver on `body`, throttled) and leave smoothly if it
  disappears or moves under something.

## 5. Performance budget

- **One canvas,** sized to the cat's box only (about 270 × 270 CSS px at the default size), never full screen.
- **rAF only while visible,** paused when `document.hidden`, when Bracel is away, and with reduced motion (draw single
  frames on change instead).
- Under **1 ms of script per frame** on a mid-range laptop and under 2 ms on a phone; no layout reads inside the
  drawing frame except the current spot's rectangle.
- Backing store capped at 6× device pixels per CSS pixel; recompute on `resize` and `visualViewport` resize.
- Content script under 120 KB unminified and no dependencies.

## 6. Accessibility

- `aria-hidden="true"` on the host; Bracel is decoration and never announced.
- `prefers-reduced-motion: reduce` → sits still in one spot, no particles, no sound.
- No flashing; nothing faster than the purr vibration (already tiny).
- The popup is fully keyboard-usable, labelled, and follows the browser's light or dark theme.

## 7. Settings (the toolbar popup)

- **This site:** Bracel on/off here.
- **Everywhere:** on/off, with the permission request explained in one sentence.
- **Coat** (Cloud default), **Size** (0.20 default, 0.14–0.45), **Purr sound** (on by default).
- **Activities:** a tick for each, plus ▶ to show one now on the current tab.
- **Shortcut:** one `commands` entry to show or hide Bracel on the current tab.
- All stored in `chrome.storage.sync`; per-site choices in `chrome.storage.local` (they can be many).

## 8. Cross-browser

- One source, one package per browser (`npm run build`, `dist/<browser>/`). Chrome, Edge and Opera get the same files.
  Firefox gets `background.scripts` instead of the service worker, a `browser_specific_settings.gecko.id` and the
  "no data collected" declaration; `shared.js` points `chrome` at Firefox's and Safari's promise-based `browser`, so the
  code says `chrome.*` everywhere. Safari: the same package through Xcode's converter.
- No browser-specific APIs in the engine; only the host layer knows which browser it is in.

## 9. Store policy and listing

- **Single purpose:** "A cat that lives on the edges of the websites you visit." Every feature must serve that.
- No remote code, no obfuscation (minified is fine, with readable source in the repo).
- Privacy policy: one page saying nothing is collected or sent, with the permissions explained.
- Listing: name (check it is free in the stores and as a trademark), short and long description, 1280×800 screenshots
  on a few real-looking pages, a 440×280 promo tile, and icons at 16/32/48/128.

## 10. Art and licensing

- **Checked 30 Oct 2026:** Bracel's look (head, ears, eyes with two catchlights, the ω mouth, colours, base poses) is
  adapted from **"Bento Cat" by mikewirsch**, https://rive.app/marketplace/21131-39716-bento-cat/ , licensed
  **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). No `.riv` file or Rive runtime is used.
- CC BY 4.0 allows copying and adapting it **for any purpose, also commercially**. It requires us to:
  1. credit the creator (mikewirsch) and link the original,
  2. link the licence,
  3. say that we changed it,
  4. not suggest the creator endorses us,
  5. not add terms that stop others using the original under its licence.
- **Credit text** (use the same wording everywhere):
  "Bracel's look is adapted from Bento Cat by mikewirsch (rive.app/marketplace/21131-39716-bento-cat), licensed CC BY 4.0
  (creativecommons.org/licenses/by/4.0). Redrawn and animated in code; walking, hanging, jumping, hiding, spots,
  behaviour and coats are our own."
- **Where it goes:** the popup's About line, the store listing's long description, a `CREDITS.md` in the repo, and the
  engine file's header comment. Bracely carries the same credit (About, `cat.js`, README; Bracely PR #104).
- The code's own licence (MIT, like Bracely, unless decided otherwise) covers our code; the credit and the CC BY notice
  stay with the art wherever it is used.

## 11. Release checklist

1. All tests pass (engine unit tests, spot finder against the saved pages, Playwright smoke on live sites).
2. Checked at 1280 and 390 px, light and dark pages, 100% and 200% zoom, and with reduced motion.
3. No network requests in a full session (DevTools, or a Playwright request log).
4. Memory flat over 10 minutes on a busy page; CPU idle when the tab is hidden.
5. Version bumped in `manifest.json` (and `package.json` if there is one), changelog entry written.
6. Store listing text and screenshots match what this version does.
