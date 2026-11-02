# Changelog

## 1.0.2 (not yet uploaded)

- A small "bracel.saurabhpagrut.in · ☕ Buy me a coffee" line at the bottom of the popup. Both are plain links that open
  in a new tab; Bracel sends nothing when they're shown.
- Website: a "Buy me a coffee" button in the navbar, in Buy Me a Coffee's colours (plain CSS, not their widget).
- The privacy policy has a paragraph on the coffee link.

## 1.0.1 (submitted to the Chrome Web Store on 31 Oct 2026)

- Store name and summary say what Bracel is, for people searching the stores: "Bracel – Virtual Cat & Screen Pet",
  "A cute virtual cat and browser pet…". New description and captioned screenshots (`store/`).
- Builds for every store: `npm run build` makes `dist/chrome/`, `dist/edge/`, `dist/opera/`, `dist/firefox/` and
  `dist/safari/`, with `dist/README.md` saying which goes where.
- Runs in Firefox 140+: a background script there instead of the service worker, and `chrome.*` calls go to Firefox's
  `browser.*`.
- Website: search title and description, and the "Add to Chrome" button points at the Chrome Web Store listing.

## 1.0.0 (31 Oct 2026, Chrome Web Store)

First version of Bracel for every website.

- Bracel, from Bracely's cat (Bracely #103): 22 activities, hanging, jumping, hiding, five coats with dark-page
  variants, the purr sound.
- Finds places on any website: the tops of boxes and images, the floors of boxes, the bottom of the window, under
  headers; keeps away from open dialogs and menus, fields you type in, video players and frames, and sticky headers.
- Click the toolbar button or press Alt+Shift+B to bring it to a tab; "On this site" and "On every site" ask for the
  permission when you switch them on. Sites can be switched off.
- Popup (a toolbar popup, not a side panel): a Show switch for this tab, "On this site", "On every site", coat, size,
  purr sound, and a folded Actions list with a tick and ▶ for each activity; a link to the privacy policy and the
  Bento Cat credit.
- Website at bracel.saurabhpagrut.in (Cloudflare Pages): a landing page where Bracel lives, and the privacy policy.
- No network requests; closed Shadow DOM; no clicks, focus or keys taken.
- Fixes from Bracely's `cat.js`: a size set before the cat first appeared left its canvas unsized; `hiddenAt` leaked
  as a global.
