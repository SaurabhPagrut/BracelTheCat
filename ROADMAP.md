# Bracel for every website: roadmap

The one planning file for this project. Current and upcoming work, decisions and open questions. Update it as PRs open
and merge. Rules and limits are in `EXTENSION_GUIDELINES.md`; how to work is in `CLAUDE.md`.

**Started:** 30 Oct 2026, as a separate project from Bracely, starting from Bracely's `cat.js` (Bracely #103).

## Where things stand

- [x] Bracel built and shipped inside Bracely (#103, merged 30 Oct 2026): 22 activities, hanging, jumping, hiding,
      five coats, sound, Settings. Copied to `reference/cat.js`.
- [ ] **Next: Phase 0** (decisions and setup).

## Phase 0: decisions and setup (before any code)

- [x] **Art licence (checked 30 Oct 2026):** "Bento Cat" by mikewirsch is CC BY 4.0, so adapting it, also commercially, is
      allowed with credit, a link to the licence and a note of changes. Credit text and where it goes: guidelines §10.
      Bracely already carries it (PR #104).
- [ ] **Name:** "Bracel" free in the Chrome Web Store, Edge Add-ons and Firefox Add-ons; quick trademark search.
      Listing title, e.g. "Bracel: a cat for every website". 30 Oct 2026: a web search found no extension called
      Bracel; the owner still checks each store's search and a trademark database before submitting.
- [x] **Permission model:** click-to-bring (`activeTab`), "on this site" (one origin at runtime) and optional "on every
      site" (`<all_urls>` at runtime). Recorded in the guidelines §2.
- [x] **Repo:** github.com/SaurabhPagrut/bracel (private for now; public before the store submission so the source is
      readable), MIT licence, README, `CREDITS.md`, this folder's documents, CI with lint + tests.
- [ ] **Store accounts:** Chrome Web Store developer account (one-time fee), Microsoft Partner Center, Firefox AMO.

## Phase 1: split the engine from the host

Goal: the same Bracel runs in a plain test page with no Bracely around it.

- [ ] Split `reference/cat.js` into `engine.js` (poses, drawing, behaviour, sound) and a **host interface**: `storage`,
      `surfaces()`, `overlayOpen()`, `theme()`, `onPageChange()`. See `reference/BRACELY_GLUE.md`.
- [ ] A Bracely-like test host (two panes, a top bar, a menu) that reproduces today's behaviour, so nothing regresses.
- [ ] Engine unit tests: pose blending, the gait (a planted paw moves backwards at walking speed), activity picking
      respects the ticks, `interrupt` cancels cleanly, reduced motion draws a single frame.
- [ ] **Demo page** for the owner: the engine on the test host, with the activity buttons.

## Phase 2: spots on any website

Goal: Bracel finds good, safe places to be on real pages.

- [ ] `findSpots()`: ledges (box tops), floors (box bottoms and the viewport's bottom), bars (header bottoms, box
      bottoms with room below), walls (sidebar and box edges). Budgeted and cached (guidelines §4).
- [ ] Overlay detection: `dialog[open]`, `[aria-modal=true]`, large fixed layers with a high z-index, open menus.
- [ ] Stay clear of the focused input or editor, video players and anything being dragged.
- [ ] A **saved-pages test set** (static copies, no live network): a news article, a docs site, a web app dashboard,
      a search results page, a shop product page, a social feed, a page with a sticky header and sidebar, a dark site,
      a very long page, an SPA that swaps its body. The finder's results for each are checked in tests.
- [ ] **Demo:** Bracel on three of the saved pages, for the owner to try.

## Phase 3: the extension shell

- [ ] `manifest.json` (MV3), service worker, content script that injects the closed-Shadow-DOM host (guidelines §3).
- [ ] Toolbar button: bring Bracel to this tab or send it away; badge shows on/off for the site.
- [ ] `CREDITS.md` and the credit in the engine's header (guidelines §10).
- [ ] Settings in `chrome.storage.sync` (coat, size, sound, activities) and per-site state in `chrome.storage.local`.
- [ ] Keyboard shortcut (`commands`) to show or hide on the current tab.
- [ ] Survives SPA navigation, body swaps, bfcache restores and tab switches.

## Phase 4: the popup

- [ ] This site on/off, everywhere on/off (with the permission request), coat, size, purr sound, activity ticks and ▶.
- [ ] An About line with the Bento Cat credit and licence link.
- [ ] Light and dark, keyboard-friendly, labelled. Matches Bracely's minimal look (slate palette, 1px borders, small
      controls).
- [ ] **Demo** of the popup for the owner before it ships.

## Phase 5: quality

- [ ] Performance budget met (guidelines §5) on a busy page, on a laptop and a phone-sized window.
- [ ] Reduced motion, zoom (100/200%), light and dark pages, 1280 and 390 px.
- [ ] No network requests in a full session; memory flat over 10 minutes.
- [ ] Playwright smoke run on a handful of live sites, kept optional in CI.

## Phase 6: publish

- [ ] Store listing: description (with the Bento Cat credit, guidelines §10), screenshots (1280×800) on saved pages, promo tile, icons 16/32/48/128.
- [ ] Privacy policy page (nothing collected; permissions explained).
- [ ] Chrome Web Store and Edge Add-ons submission (same package). Version 1.0.0.
- [ ] Link from Bracely's About page once it is live (a small Bracely PR, only after the extension is approved).

## Later

- [ ] Firefox (browser.* shim, gecko id), then Safari (Xcode converter).
- [ ] "Follow me": when the pointer moves far away, Bracel travels along edges towards it and sits nearby (opt-in).
- [ ] More coats; a coat that follows the site's own colours.
- [ ] Shared engine: if Bracel changes in one place, decide whether Bracely and the extension share `engine.js`
      (copied with a version note, or a small package).

## Decisions

- 30 Oct 2026: a **separate project**, not part of Bracely. Bracely keeps its own `cat.js`.
- 30 Oct 2026: starts from Bracel as merged in Bracely #103 (canvas, posed in code; no Rive runtime or `.riv` file).
- 30 Oct 2026: the art stays: Bento Cat by mikewirsch is CC BY 4.0, so we credit it instead of redrawing.
- 30 Oct 2026: permissions are click-to-bring (`activeTab`) plus "on this site" and "on every site" asked at runtime.
- 30 Oct 2026: where Bracel arrives on its own, it is there "most of the time", like in Bracely (it arrives after a
  few seconds and sometimes leaves and comes back).
- 30 Oct 2026: repo `SaurabhPagrut/bracel`, private while it is built.

## Open questions

- Free only, or a paid tier later (more coats)? Affects store setup.
