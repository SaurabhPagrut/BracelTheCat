# Bracel for every website

A browser extension that puts **Bracel**, Bracely's cat, on any website. Bracel lives on the edges of the page (the tops of
boxes and images, under headers, on the bottom of the window), walks, jumps, hangs, grooms, naps and purrs, and never
gets in the way: it takes no clicks, no focus and no keys.

This is a **separate project** from Bracely (the JSON tools web app). It starts from Bracely's `cat.js` (copied into
`reference/cat.js`) but has its own repo, its own releases and its own roadmap. Nothing here is built or shipped by Bracely.

## Files in this repo (github.com/SaurabhPagrut/bracel)

| File | What it is |
| --- | --- |
| `CLAUDE.md` | This file: what the project is and how to work on it |
| `EXTENSION_GUIDELINES.md` | The rules the extension follows: permissions, isolation, performance, privacy, store policy, release checklist |
| `ROADMAP.md` | The one roadmap: phases, decisions, open questions. Keep it updated as work lands |
| `manifest.json` | Manifest V3 |
| `src/engine.js` | Bracel: poses, drawing, behaviour, sound. Host-independent: `createBracel(host)` (interface at its top) |
| `src/spots.js` | The spot finder for any website: spots, overlays, light or dark page |
| `src/content.js` | The content script: closed Shadow DOM host, settings, messages |
| `src/background.js` | The service worker: badge, shortcut, per-site state, the registered content script |
| `src/shared.js` | Defaults, the injected file list, activity and coat lists shared by all of the above |
| `src/popup/` | The toolbar popup (runs on a pretend browser when opened outside the extension) |
| `demo/` | Demo pages for the owner (`npm run serve`, then http://localhost:8080/demo/) |
| `test/` | Playwright: engine, spot finder on `test/pages/` (saved pages), the built extension; `live.spec.js` optional |
| `scripts/` | lint, build, icons, store screenshots, the local server |
| `store/` | Listing text, screenshots, promo tile |
| `reference/cat.js` | Bracel as it ships in Bracely (merged in Bracely #103, 30 Oct 2026). `src/engine.js` was generated from it |
| `reference/BRACELY_GLUE.md` | What `cat.js` borrows from Bracely and how the extension replaces it |

## Ground rules (from the owner)

- **Separate project.** Don't change Bracely to suit the extension, and don't add extension work to Bracely's roadmap.
  If something should be shared later, copy it and note where it came from.
- **One roadmap:** `ROADMAP.md`. Planning lives there, not in scattered notes.
- **Every change ends in a branch, a push and a PR.** Never commit to `main`. Ask before merging
  anything that isn't CI or Dependabot.
- **Demo first** for anything visual (a new pose, a new behaviour, a new coat): a standalone HTML page the owner can open
  and try, before it goes into the extension.
- **Strings with `\u` escapes:** the Edit and Write tools can turn them into invisible characters; write those with a script.
- **Credit the art.** Bracel's look is adapted from "Bento Cat" by mikewirsch (CC BY 4.0). Keep the credit wherever the
  art appears (guidelines §10).
- Match the style of the surrounding code. `reference/cat.js` mixes the drawing code's longhand style with Bracely's
  denser one-liners; keep each part in its own style.

## Bracel in one page

- **Drawing:** one small `<canvas>` that follows the cat, sized to the screen's real resolution (device pixel ratio
  × pinch zoom), so it stays sharp when zoomed.
- **Body:** a bean-shaped torso (rump and chest circles), a head, four two-bone tapered legs, and a tail chain. Every
  number in `sim.pose` eases towards the current activity's target pose each frame (`computeTargetPose`), so movement
  is smooth, with no picture swaps.
- **Hanging:** the same standing pose is drawn turned a quarter (`p.hang`), with the head drawn upright below the bar.
- **Walking:** `stepToward` moves x at a steady speed and advances the gait phase by distance, so planted paws slide
  back exactly as fast as the body goes forward. A paw lifts only while it swings forward (`dy = min(0, cos(a) · lift)`).
  Getting this sign wrong makes the walk look inverted; it was fixed once already.
- **Behaviour:** one async activity at a time (`A.*`), picked by weight (`W8`) from the ones switched on, cancelled
  by a generation counter (`gen`) when something more important happens (stroking, clicks, the page changing).
- **Spots:** `surfaces()` lists where it can stand (`ledge`, `shelf`, `floor`) or hang (`bar`). In Bracely those are
  the panes, the status bars, the menu and the top bar. On arbitrary websites this is the main new work (see the roadmap).
- **Activities (22):** stand, sit, look around, sniff, groom, scratch ear, paw at screen, scratch wall, knead & purr,
  play (moth), play (yarn), yawn, stretch, nap, walk, jump to another spot, hang, hide behind an edge, leave & return,
  petted, annoyed, hunt & pounce. Internal moves: drop, room (step aside on a click), wake, flee.
- **Settings:** on/off, coat (Slate, Slate tuxedo, Accent blue, Amber, Cloud, each with a dark-page variant; **Cloud**
  is the default), size (0.14–0.45, **0.20** default), purr sound (**on** by default; browsers play nothing until the
  first click or tap), and a tick plus ▶ for each activity.

## Working on it

- Plain JavaScript, no framework, no bundler unless one becomes necessary. Manifest V3.
- `npm test` (lint + Playwright) before every PR; `npm run build` makes the store zip. Test against the saved pages in
  `test/pages/` and, with `npm run test:live`, a few live sites.
- Check every visual change at 1280 and 390 px, light and dark pages, and at 200% zoom.
