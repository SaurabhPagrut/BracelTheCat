# What reference/cat.js borrows from Bracely

`cat.js` was written to run inside Bracely's single page. To run on any website it has to stop relying on these.

| In cat.js | What it is in Bracely | In the extension |
| --- | --- | --- |
| `store.get(k, d)` / `store.set(k, v)` | JSON in `localStorage` (`head_new.js`) | `chrome.storage.sync` (settings follow the user), read once at start, then cached; the page's own `localStorage` must never be touched |
| `ACTIONS.push(...)` | Bracely's Ctrl+K action list | Drop it. The toolbar popup and a keyboard shortcut (`commands`) take its place |
| `window.__bracely.cat = CAT` | test hook | A test hook only in test builds |
| `.appbar` | Bracely's top bar, a `bar` to hang from | A detected site header (see the guidelines) |
| `.pane`, `.pane .status` | tool panes and their status bars, `ledge` / `shelf` / `floor` | Detected boxes, cards, images and the window's bottom |
| `#rail`, `#toolList .grp`, `.foot`, `html.rail-off` | the left menu, its groups and footer; the rail's edge is a wall | Detected sidebars and their edges |
| `.modal`, `.pal`, `.drop` (open) | dialogs, the search palette, the drop overlay | Detected overlays: `dialog[open]`, `[aria-modal=true]`, fixed full-screen layers with a high z-index |
| `.app` MutationObserver | re-checks the spot when the app changes | Observe `document.body`, throttled; re-check on scroll and resize |
| `getComputedStyle(...).getPropertyValue("--accent")` etc. | Bracely's theme tokens for the small coloured touches | Fixed Bracel colours; light or dark picked from the page's background colour |
| `.bcat` CSS (`style_new.css`) | `position:fixed; pointer-events:none; contain:strict; z-index:9` | The same, inside a closed Shadow DOM, z-index 2147483646 |
| `html.rail-open .bcat{visibility:hidden}` | hides it while the phone menu is open | Hide while any detected overlay is open |
| Settings › Bracel (`catSettings()` in `ui.js`) | coat, size, sound, activity ticks and ▶ | The toolbar popup, with a per-site on/off |

## The parts that move over unchanged

- Coats and `paletteFor()`, the purr and chirp synth (`initAudio`, `playPurrGrain`, `playSoftChirp`).
- `computeTargetPose`, `newStates`, `gait`, `sitLegs` and all drawing functions (`renderCat`, legs, torso, head, ears,
  eyes, props and particles).
- The activity functions `A.*`, `pick()`, `life()`, `interrupt()`, the pointer handling (stroking, clicks, hunting).
- `stepToward`, `fly`, `jumpTo`, `hangOn`, `drop`, `peek`, which only need `surfaces()`, `bounds()` and `wallFor()`.

So the engine splits cleanly into: **engine** (poses, drawing, behaviour; host-independent) + **host** (storage, spots,
overlays, theme, settings UI). Bracely is one host; the extension is another.
