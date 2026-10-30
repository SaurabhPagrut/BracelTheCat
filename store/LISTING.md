# Store listing (Chrome Web Store and Edge Add-ons)

The same text for both stores. How to submit: `PUBLISHING.md`.

| Asset | File | Where it goes |
| --- | --- | --- |
| Store icon 128×128 (96 px art, 16 px transparent padding) | `icons/icon128.png` | Store listing → Store icon |
| Screenshots 1280×800 | `store/screenshot-1..5.png` (`node scripts/screenshots.mjs`) | Store listing → Screenshots, in order |
| Small promo tile 440×280 | `store/promo-440x280.png` (`npm run icons`) | Store listing → Small promo tile |
| Marquee 1400×560 (optional) | `store/marquee-1400x560.png` (`npm run icons`) | Store listing → Marquee promo tile |

Screenshots, in order: 1 news page with the popup (Actions folded), 2 dashboard with Actions open, 3 hanging under a
web app's top bar, 4 kneading on a dark site, 5 napping on a docs page.

## Name

Bracel: a cat for every website

## Summary (132 characters max)

A little cat that lives on the edges of the websites you visit. It naps, grooms and purrs, and never gets in the way.

## Category

Lifestyle → Just for Fun (Chrome) · Entertainment (Edge)

## Single purpose (for the review form)

A cat that lives on the edges of the websites you visit.

## Description

Bracel is a small, round cat that comes to live on the websites you visit.

It sits on the tops of boxes and pictures, walks along them, jumps from one to the next, hangs under headers, hides
behind an edge and peeks out, grooms, kneads and purrs, chases a moth or a ball of yarn, and naps when you are busy.
Stroke it with your pointer and it purrs. Click it three times and it gets annoyed. Wiggle the pointer above it and it
pounces.

It never gets in the way:
• It takes no clicks, no focus and no keys: everything goes through to the page.
• It leaves when a dialog or menu opens, and keeps away from what you are typing in.
• It stops completely in background tabs and sits still if you prefer reduced motion.

You decide where it goes:
• Click the toolbar button (or press Alt+Shift+B) to bring Bracel to the tab you are on.
• Switch on "On this site" to have it come back by itself on that site.
• Switch on "On every site" to have it visit everywhere, and switch it off on sites where you'd rather not see it.

Pick its coat (Cloud, Slate, Slate tuxedo, Accent blue, Amber), its size, whether it purrs out loud, and which
actions it does on its own (in the folded Actions list). Each action has a ▶ button to see it now.

Private by design: Bracel collects nothing and sends nothing anywhere. No analytics, no network requests at all.
Your settings stay in your browser.

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
