# Store listing (Chrome Web Store, Edge, Opera, Firefox)

The same text for every store. How to submit: `PUBLISHING.md`. The name and summary also live in `manifest.json`
(the Chrome Web Store takes them from there), so change both together.

| Asset | File | Where it goes |
| --- | --- | --- |
| Store icon 128×128 (96 px art, 16 px transparent padding) | `icons/icon128.png` | Store listing → Store icon |
| Screenshots 1280×800, captioned | `store/screenshot-1..5.png` (`node scripts/screenshots.mjs`) | Store listing → Screenshots, in order |
| Small promo tile 440×280 | `store/promo-440x280.png` (`npm run icons`) | Store listing → Small promo tile |
| Marquee 1400×560 (optional) | `store/marquee-1400x560.png` (`npm run icons`) | Store listing → Marquee promo tile |

Screenshots, in order, with the caption drawn on each: 1 news page with the popup (Actions folded), 2 dashboard with
Actions open, 3 hanging under a web app's top bar, 4 kneading on a dark site, 5 napping on a docs page.

## Search words (31 Oct 2026, from the SEO guide)

People search for what Bracel is, not for its name: **virtual pet**, **browser pet**, **desktop pet**, **virtual cat**,
**cat pet**, **screen pet**, **screen companion**, **study companion**. The name, summary and first paragraph carry the
main ones; the description uses the rest once each, in sentences. No keyword lists or repeats (stores demote them),
and no other products' trademarks.

## Name

Bracel – Virtual Cat & Screen Pet

## Summary (132 characters max)

A cute virtual cat and browser pet that walks, naps, and purrs along the edges of any website without getting in your way.

## Category

Lifestyle → Just for Fun (Chrome) · Entertainment (Edge, Opera) · Fun (Firefox)

## Single purpose (for the review form)

A cat that lives on the edges of the websites you visit.

## Description

Meet Bracel, a cozy virtual cat and browser pet that lives on the websites you visit.

Bracel is a small, round screen companion. It sits on the tops of boxes and pictures, walks along them, jumps from one
to the next, hangs under headers, and hides behind an edge to peek out while you read, study or work. Like a desktop
pet, but it lives in your browser.

Stroke it with your pointer and it purrs. Wiggle the pointer above it and it pounces. Click it three times and it gets
annoyed. Leave it be and it grooms, kneads, chases a moth or a ball of yarn, or takes a nap.

Never in the way:
• Takes no clicks, no focus and no keys: every click goes through to the page.
• Leaves when a dialog or menu opens, and keeps away from what you are typing in.
• Stops completely in background tabs, and sits still if you prefer reduced motion.

Make it yours:
• Five coats: Cloud, Slate, Slate tuxedo, Accent blue and Amber, each with a dark-page version.
• Any size from tiny to cozy, and a purr you can turn on or off.
• Pick which of its 22 actions it does on its own; each has a ▶ button to see it now.

You decide where it goes:
• Click the toolbar button (or press Alt+Shift+B) to bring Bracel to the tab you are on.
• Switch on "On this site" to have it come back by itself on that site.
• Switch on "On every site" to have it visit everywhere, and switch it off on sites where you'd rather not see it.

A calm companion for:
• Studying and coding: a gentle study companion for long sessions.
• Breaks: a small, cute pause while you read articles or browse.
• Everyday browsing: a little life on every page.

Private by design: Bracel collects nothing and sends nothing anywhere. No analytics, no tracking, no network requests
at all. Your settings stay in your browser.

Credit: Bracel's look is adapted from Bento Cat by mikewirsch (rive.app/marketplace/21131-39716-bento-cat), licensed
CC BY 4.0 (creativecommons.org/licenses/by/4.0). Redrawn and animated in code; walking, hanging, jumping, hiding,
spots, behaviour and coats are our own.

## Permission justifications (for the review form)

- **activeTab:** to put Bracel on the current tab when the user clicks the toolbar button or presses the shortcut.
- **scripting:** to inject Bracel's content script into that tab, and to register it for the sites the user switched on.
- **storage:** to keep the user's settings (coat, size, sound, activities) and per-site on/off choices.
- **Host permissions (optional, asked at run time):** only when the user switches on "On this site" (that one site) or
  "On every site", so Bracel can come back by itself. The extension reads page layout only, never content, and sends
  nothing.
- **Remote code:** none. All code is in the package.

## Privacy

- Privacy policy URL: https://bracel.saurabhpagrut.in/privacy (built from `PRIVACY.md` by `npm run site`).
- Homepage URL: https://bracel.saurabhpagrut.in · Support URL: https://github.com/SaurabhPagrut/BracelTheCat/issues
- Data use disclosures: collects no user data; certify all three statements.
