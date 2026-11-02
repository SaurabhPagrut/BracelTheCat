# Bracel for every website: roadmap

The one planning file for this project. Current and upcoming work, decisions and open questions. Update it as PRs open
and merge. Rules and limits are in `EXTENSION_GUIDELINES.md`; how to work is in `CLAUDE.md`.

**Started:** 30 Oct 2026, as a separate project from Bracely, starting from Bracely's `cat.js` (Bracely #103).

## Where things stand

- [x] Bracel built and shipped inside Bracely (#103, merged 30 Oct 2026): 22 activities, hanging, jumping, hiding,
      five coats, sound, Settings. Copied to `reference/cat.js`.
- [x] Phases 0-5 built on 30 Oct 2026. Version 1.0.0 is packaged (`npm run build`) and waiting for the owner's
      checks and the store accounts.
- [x] Release prep (30 Oct 2026): popup reshaped (Show switch, settings, folded Actions), website and privacy page
      (`site/`, `npm run site`), store icon padded to 96+16 px, marquee tile, screenshots with the popup.
- [x] 30 Oct 2026: Bracel 1.0.0 submitted to the Chrome Web Store for review.
- [x] 31 Oct 2026: 1.0.0 approved and live in the Chrome Web Store
      (https://chromewebstore.google.com/detail/bracel-a-cat-for-every-we/diiopbiepmlejbbibggfhhdmnaeiehjf).
- [x] 31 Oct 2026 (1.0.1): store search words (name, summary, description, captioned screenshots), and a build for
      every store (`dist/chrome`, `edge`, `opera`, `firefox`, `safari`). See Phase 7.
- [x] 31 Oct 2026: 1.0.1 submitted to the Chrome Web Store (new name, summary, description, captioned screenshots).
- [x] 2 Nov 2026: Product Hunt GIFs (`npm run gif`): a 240×240 icon with only Bracel, and a 1270×760 gallery GIF.
- [x] By 2 Nov 2026: video on YouTube and linked from the Chrome listing; submitted to Firefox (AMO), Edge Add-ons and
      Opera add-ons; the website https://bracel.saurabhpagrut.in and its privacy page are live.
- [ ] **Next:** wait for the 1.0.1 review and the Firefox, Edge and Opera reviews; 1.0.2 with the Buy Me a Coffee link,
      then the demo of new coats and actions (Phase 8).

## Phase 0: decisions and setup (before any code)

- [x] **Art licence (checked 30 Oct 2026):** "Bento Cat" by mikewirsch is CC BY 4.0, so adapting it, also commercially, is
      allowed with credit, a link to the licence and a note of changes. Credit text and where it goes: guidelines §10.
      Bracely already carries it (PR #104).
- [ ] **Name:** "Bracel" free in the Chrome Web Store, Edge Add-ons and Firefox Add-ons; quick trademark search.
      Listing title, e.g. "Bracel: a cat for every website". 30 Oct 2026: a web search found no extension called
      Bracel; the owner still checks each store's search and a trademark database before submitting.
- [x] **Permission model:** click-to-bring (`activeTab`), "on this site" (one origin at runtime) and optional "on every
      site" (`<all_urls>` at runtime). Recorded in the guidelines §2.
- [x] **Repo:** github.com/SaurabhPagrut/BracelTheCat (renamed from `bracel` on 30 Oct 2026; private for now; public before the store submission so the source is
      readable), MIT licence, README, `CREDITS.md`, this folder's documents, CI with lint + tests.
- [x] **Store accounts (owner):** Chrome Web Store developer account (one-time fee), Microsoft Partner Center,
      Firefox AMO and Opera, all set up by 2 Nov 2026. The Chrome account is new, so it holds only 2 items for now: Bracel and PinScout
      (Bracely's listing was unpublished on 30 Oct 2026 to make room).

## Phase 1: split the engine from the host

Goal: the same Bracel runs in a plain test page with no Bracely around it.

- [x] Split `reference/cat.js` into `engine.js` (poses, drawing, behaviour, sound) and a **host interface**: `storage`,
      `surfaces()`, `overlayOpen()`, `theme()`, `onPageChange()`. See `reference/BRACELY_GLUE.md`.
- [x] A Bracely-like test host (two panes, a top bar, a menu) that reproduces today's behaviour, so nothing regresses.
- [x] Engine unit tests: pose blending, the gait (a planted paw moves backwards at walking speed), activity picking
      respects the ticks, `interrupt` cancels cleanly, reduced motion draws a single frame. (`test/engine.spec.js`, run in
      the browser.) The split is generated from `reference/cat.js`, so the drawing code is unchanged; the host interface
      is `createBracel(host)` (top of `src/engine.js`).
- [x] **Demo page** for the owner: the engine on the test host, with the activity buttons.

## Phase 2: spots on any website

Goal: Bracel finds good, safe places to be on real pages.

- [x] `findSpots()`: ledges (box tops), floors (box bottoms and the viewport's bottom), bars (header bottoms, box
      bottoms with room below), walls (sidebar and box edges). Budgeted and cached (guidelines §4).
- [x] Overlay detection: `dialog[open]`, `[aria-modal=true]`, large fixed layers with a high z-index, open menus.
- [x] Stay clear of the focused input or editor, video players and anything being dragged.
- [x] A **saved-pages test set** (static copies, no live network): a news article, a docs site, a web app dashboard,
      a search results page, a shop product page, a social feed, a page with a sticky header and sidebar, a dark site,
      a very long page, an SPA that swaps its body. The finder's results for each are checked in tests. (`test/pages/`:
      written by hand as stand-ins for those kinds of page, so nothing copyrighted is checked in; plus a Bracely-like
      page and a modal dialog page.)
- [x] **Demo:** Bracel on all the saved pages, for the owner to try (`npm run serve`, then /demo/).

## Phase 3: the extension shell

- [x] `manifest.json` (MV3), service worker, content script that injects the closed-Shadow-DOM host (guidelines §3).
- [x] Toolbar button: bring Bracel to this tab or send it away; badge shows on/off for the site.
- [x] `CREDITS.md` and the credit in the engine's header (guidelines §10).
- [x] Settings in `chrome.storage.sync` (coat, size, sound, activities) and per-site state in `chrome.storage.local`.
- [x] Keyboard shortcut (`commands`) to show or hide on the current tab.
- [x] Survives SPA navigation, body swaps, bfcache restores and tab switches.

## Phase 4: the popup

- [x] This site on/off, everywhere on/off (with the permission request), coat, size, purr sound, activity ticks and ▶.
- [x] An About line with the Bento Cat credit and licence link.
- [x] Light and dark, keyboard-friendly, labelled. Matches Bracely's minimal look (slate palette, 1px borders, small
      controls).
- [x] **Demo** of the popup for the owner before it ships (`/demo/popup.html`, on a pretend browser).

## Phase 5: quality

- [x] Performance budget met (guidelines §5) on a busy page, on a laptop and a phone-sized window. (A full scan of a
      4,000-element page is under 80 ms in a test and background slices make no long task; injected scripts ~104 KB.)
- [x] Reduced motion, zoom (100/200%), light and dark pages, 1280 and 390 px. (Tests at 1280 and 390 on every saved
      page and with reduced motion; 2× and dark pages checked by screenshot. Pinch zoom: owner, on a phone.)
- [x] No network requests in a full session (`test/extension.spec.js`).
- [ ] Memory flat over 10 minutes on a busy page (owner, in DevTools; not automated).
- [x] Playwright smoke run on a handful of live sites, kept out of CI (`npm run test:live`).

## Phase 6: publish

- [x] Store listing: description (with the Bento Cat credit, guidelines §10), screenshots (1280×800) on saved pages, promo
      tile, icons 16/32/48/128. (`store/LISTING.md`, `store/*.png`, `icons/`.)
- [x] Privacy policy page (nothing collected; permissions explained). Written (`PRIVACY.md`), built into
      https://bracel.saurabhpagrut.in/privacy by `npm run site`; live by 2 Nov 2026.
- [x] Website https://bracel.saurabhpagrut.in (Cloudflare Pages project `bracel`, bracel.pages.dev): landing page with
      Bracel on it, privacy page. After approval, point its "Add to Chrome" button at the listing.
- [x] Chrome Web Store submission: 1.0.0 (`dist/bracel-1.0.0.zip`) submitted for review on 30 Oct 2026.
- [x] Chrome Web Store approval (31 Oct 2026); the listing URL is on the website's "Add to Chrome" button (1.0.1).
- [x] Edge Add-ons submission (`dist/edge/`), by 2 Nov 2026; waiting for review.
- [ ] Link from Bracely's About page once it is live (a small Bracely PR, only after the extension is approved).

## Phase 7: more stores, and being found (31 Oct 2026)

From the owner's SEO guide (kept out of the repo, in `var/`) and a look at which browsers take extensions.

- [x] Store text aimed at what people search for (virtual pet, browser pet, virtual cat, screen pet, desktop pet,
      study companion): name "Bracel – Virtual Cat & Screen Pet", new summary and description (`store/LISTING.md`,
      `manifest.json`). No keyword lists and no other products' trademarks.
- [x] Captions on the five store screenshots (`scripts/screenshots.mjs`).
- [x] Website title and description use the same words; "Add to Chrome" points at the listing.
- [x] One build per browser: `npm run build` → `dist/<browser>/` and `dist/README.md`.
- [x] Firefox package: background script, add-on id `bracel@saurabhpagrut.in`, no data collected declared, Firefox
      140+. `web-ext lint`: 0 errors, 0 warnings.
- [x] Upload 1.0.1 to the Chrome Web Store (new name, summary, description and screenshots): submitted 31 Oct 2026.
- [x] Firefox package submitted to AMO, by 2 Nov 2026; waiting for review. `PUBLISHING.md` §5.
- [x] Edge (above) and Opera add-ons (`PUBLISHING.md` §6), submitted by 2 Nov 2026; waiting for review.
- [ ] First honest reviews: share the listing with friends and colleagues; ask for real feedback (owner). No paid
      or swapped reviews (store policy).
- [ ] Share it: a short clip of Bracel on a page for Reddit (r/chrome_extensions, r/webdev with how it was made, cat
      subreddits where self-promotion is allowed), short-video sites, and Product Hunt (owner).
- [x] Intro and demo video for YouTube (`npm run video`, `store/YOUTUBE.md`): 78 s, captions, credit on the cards.
- [x] Upload the video to YouTube and add its link to the Chrome listing, by 2 Nov 2026.
- [ ] Safari: needs Xcode and the Apple Developer Program (US$99 a year); `dist/safari/` is ready for Apple's converter.
- [ ] Firefox for Android and Samsung Internet: only after trying Bracel on a phone (touch has no hover or pounce).

Not separate stores: Brave, Vivaldi, Arc, Yandex and Naver Whale install from the Chrome Web Store.

## Phase 8: support, and more coats and actions (2 Nov 2026)

Bracel stays **free**. Support comes from a Buy Me a Coffee link, as in PinScout; the paid tier below is on hold.

- [ ] A "Buy me a coffee" button in the website's navbar and a "☕ Buy me a coffee" link at the bottom of the popup
      (1.0.2). Plain links in Buy Me a Coffee's colours: no widget, no script, nothing loaded from them, so Bracel still
      makes no network requests. `PRIVACY.md` says so; AMO's listing gets the Contributions URL.
- [ ] Demo first: a page with the candidate coats and actions below, for the owner to pick (CLAUDE.md "Demo first").
- [ ] The chosen ones in the engine and the popup, free like the rest.

Candidate coats (each with a dark-page variant, like the five today):

- Ginger tabby: orange with darker stripes on the back, tail and head.
- Calico: white with orange and black patches.
- Black cat: near black, with green eyes so the face still reads on dark pages.
- Siamese: cream body with dark brown ears, face, paws and tail tip.
- Grey tabby: silver grey with soft stripes.
- Site colours: a coat picked from the page's own colours (from "Later").
- Seasonal extras worn over any coat: a Santa hat in December, a small pumpkin at Halloween.

Candidate actions (on top of the 22 today; each must keep to the spots and never get in the way):

- Chase its tail: spins on the spot a few turns, then sits as if nothing happened.
- Loaf: tucks its paws under and becomes a bread loaf; a long, quiet rest.
- Box: a small cardboard box appears on a ledge; Bracel hops in and peeks out.
- Laser dot: a red dot runs along the edge; Bracel stalks it, pounces, loses it.
- Knock it off: pats a tiny cup at the edge of a ledge until it falls and disappears.
- Zoomies: a sudden fast run along the ledge and back, then a groom.
- Bird watching: a bird flies past above; Bracel chatters at it, tail twitching.
- Roll over: lies on its back, belly up, paws in the air.
- Follow me: walks along the edges towards the pointer and sits nearby (opt-in; from "Later").

## Paid tier (on hold since 2 Nov 2026)

Planned on 2 Nov 2026, then put on hold: Bracel stays free for now. Kept here for when it comes back to the table.
The idea was: new coats and actions, bought once on the website, while everything free stays free.
Bracel itself would still make no network requests, so `PRIVACY.md`, the store privacy forms and the Firefox "no data
collected" declaration would not change.

How it would work:

- **Buy on the website.** A "Get more coats" button on bracel.saurabhpagrut.in opens a Lemon Squeezy checkout (Lemon
  Squeezy is the merchant of record: it charges the card and handles sales tax and GST worldwide). The Chrome Web Store
  takes no payments since 2020, so the stores are not involved.
- **The key.** After paying, Lemon Squeezy sends the buyer back to a page on the website (a Cloudflare Pages Function).
  It checks the order with the Lemon Squeezy API and shows a key: the order number signed with our private key
  (Ed25519). The private key lives only in Cloudflare's secrets, never in the repo.
- **Unlock.** The buyer pastes the key into the popup. The extension checks the signature with the public key built
  into it (Web Crypto), offline. A good key unlocks the paid coats and actions; it is kept in `chrome.storage.sync`,
  so it follows the buyer's browser profile to their other computers.
- **Removed the extension, or a new computer?** Buyers never pay twice. The key is the same every time for the same
  order, so it can always be fetched again: it is in the receipt email, and a "Find my key" page on the website shows
  it again from the order number (or from Lemon Squeezy's "My orders" page, which signs in by email).
- **Honest limits.** The code is public (MIT), so someone could switch the check off; that is fine for a small fun
  extension. Keys cannot be revoked offline; a refund simply does not get a key back.

Steps, if it goes ahead:

- [ ] Engine: the paid coats and actions, marked paid in `src/shared.js`; the popup shows them locked until a key.
- [ ] Popup: an "Unlock" field for the key, with a link to the website; clear messages for a wrong key.
- [ ] Key check: Ed25519 verify with Web Crypto in the extension; tests with good, bad and tampered keys.
- [ ] Website: "Get more coats" section and button, the after-payment key page and "Find my key" (Pages Functions),
      the signing key in Cloudflare secrets. Lemon Squeezy store and product set up (owner).
- [ ] Words: store listings and the website say what is free and what is paid; the stores allow paid features
      unlocked outside the store when the listing says so.
- [ ] Check the Lemon Squeezy fees and payouts for a seller in India (owner) before setting the price.

## Later

- [ ] Shared engine: if Bracel changes in one place, decide whether Bracely and the extension share `engine.js`
      (copied with a version note, or a small package).

## Decisions

- 30 Oct 2026: a **separate project**, not part of Bracely. Bracely keeps its own `cat.js`.
- 30 Oct 2026: starts from Bracel as merged in Bracely #103 (canvas, posed in code; no Rive runtime or `.riv` file).
- 30 Oct 2026: the art stays: Bento Cat by mikewirsch is CC BY 4.0, so we credit it instead of redrawing.
- 30 Oct 2026: permissions are click-to-bring (`activeTab`) plus "on this site" and "on every site" asked at runtime.
- 30 Oct 2026: where Bracel arrives on its own, it is there "most of the time", like in Bracely (it arrives after a
  few seconds and sometimes leaves and comes back).
- 30 Oct 2026: repo `SaurabhPagrut/bracel`, private while it is built; renamed to `SaurabhPagrut/BracelTheCat`.
- 30 Oct 2026: the toolbar button opens a **popup**, not a side panel. Settings first (Show, sites, coat, size, sound);
  the 22 actions are folded under "Actions" until opened, so the popup stays under Chrome's 600 px.
- 30 Oct 2026: the website and privacy policy live at bracel.saurabhpagrut.in on Cloudflare Pages, built from `site/`
  and `PRIVACY.md` (one source for the policy). No analytics on the site.
- 30 Oct 2026: no bundler. The content script is four plain files injected in order (`BRACEL.FILES` in `src/shared.js`).
- 30 Oct 2026: on any website Bracel keeps out of the site's header and menu bars, off buttons and links, and clear of
  fields to type in (focused or not), video players and frames; the bottom of the window is always a home.
- 31 Oct 2026: the store name becomes "Bracel – Virtual Cat & Screen Pet" (people search for "virtual pet", not "a cat
  for every website"); the website's headline stays "A cat for every website".
- 31 Oct 2026: one source tree, one package per browser made by the build; no `browser.*` polyfill library, just one line
  in `shared.js`.
- 2 Nov 2026: a paid tier was planned (a one-time purchase through Lemon Squeezy, unlocked by a signed key checked
  offline), then put **on hold** the same day: Bracel stays free, with a Buy Me a Coffee link (Phase 8). The plan is
  kept under "Paid tier (on hold)".

## Open questions

- Which of the candidate coats and actions (Phase 8) to build first (after the demo).
- A paid tier later, or free with Buy Me a Coffee only? On hold; the plan is under "Paid tier (on hold)".
