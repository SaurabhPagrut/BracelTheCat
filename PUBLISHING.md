# Publishing Bracel

How to put the website live and the extension in the Chrome Web Store, Edge, Firefox, Opera and Safari, and how to ship
an update. The listing text
and the assets are in `store/LISTING.md`; the plan is in `ROADMAP.md`.

## 1. Before anything

1. Merge the open PRs into `main` (Phase 0, 1.0.0, release prep).
2. Make the repo public (GitHub → Settings → General → Danger zone → Change visibility), so reviewers and users can
   read the source the privacy policy points to. The store does not require it.
3. Check the package:
   ```sh
   npm ci && npx playwright install chromium
   npm test            # lint + all Playwright tests
   npm run build       # dist/<browser>/bracel-<browser>-<version>/ and .zip, plus dist/README.md (which goes where)
   npm run site        # dist/site/, the website
   ```
4. `chrome://extensions` → Developer mode → **Load unpacked** → `dist/chrome/bracel-chrome-<version>/`. On a website: click the
   toolbar icon (it opens the popup), switch on **Show Bracel on this tab**, change coat, size and sound, open
   **Actions** and press a ▶. Remove the unpacked copy afterwards so it doesn't clash with the store one.

## 2. The website on Cloudflare Pages

The site is `site/` plus the privacy policy made from `PRIVACY.md`. It must be live before the store submission,
because the store asks for the privacy policy URL.

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**. Authorise
   GitHub and pick `SaurabhPagrut/BracelTheCat` (it works while the repo is private, too).
2. Set up the build:

   | Setting | Value |
   | --- | --- |
   | Project name | `bracel` (gives https://bracel.pages.dev) |
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run site` |
   | Build output directory | `dist/site` |
   | Root directory | (empty) |
   | Environment variables | `NODE_VERSION` = `22`, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` = `1` |

3. **Save and Deploy**. Then open https://bracel.pages.dev and https://bracel.pages.dev/privacy. Bracel should walk
   onto the cards on the home page.
4. Custom domain: the project → **Custom domains** → **Set up a custom domain** → `bracel.saurabhpagrut.in`.
   - If `saurabhpagrut.in` is already a zone in this Cloudflare account, Cloudflare adds the DNS record itself.
   - If its DNS is elsewhere, add a record there: `CNAME`, name `bracel`, target `bracel.pages.dev`. Then wait for
     Cloudflare to show the domain as **Active** (SSL included).
   - Add the domain in the Pages project first: a CNAME alone, without this step, gives a 522 error.
5. Check https://bracel.saurabhpagrut.in/privacy loads over HTTPS. Every push to `main` redeploys; every other branch
   gets a preview at `<branch>.bracel.pages.dev`.

## 3. The Chrome Web Store

### The developer account (once)

1. https://chrome.google.com/webstore/devconsole → sign in with the Google account that will own Bracel.
2. Pay the one-time US$5 registration fee and accept the developer agreement.
3. Turn on 2-Step Verification for that Google account (required to publish).
4. **Account** tab: publisher name (e.g. Saurabh Pagrut), a contact email (verify it), and the trader / non-trader
   declaration (a free hobby extension is usually non-trader).

### The item

1. **Items → New item** → upload `dist/chrome/bracel-chrome-<version>.zip`.
2. **Store listing** tab (text from `store/LISTING.md`):
   - Description: the "Description" section. Category: Lifestyle → Just for Fun. Language: English.
   - Store icon: `icons/icon128.png`.
   - Screenshots: `store/screenshot-1.png` … `screenshot-5.png`, in that order.
   - Small promo tile: `store/promo-440x280.png`. Marquee (optional): `store/marquee-1400x560.png`.
   - Homepage URL: https://bracel.saurabhpagrut.in · Support URL:
     https://github.com/SaurabhPagrut/BracelTheCat/issues
   - Mature content: no.
3. **Privacy** tab:
   - Single purpose: "A cat that lives on the edges of the websites you visit."
   - Permission justifications: paste each one from "Permission justifications" in `store/LISTING.md` (`activeTab`,
     `scripting`, `storage`, host permissions).
   - Are you using remote code? **No.**
   - Data usage: tick none of the data types, then tick all three certifications.
   - Privacy policy URL: https://bracel.saurabhpagrut.in/privacy
4. **Distribution** tab: Free, **Public** (or **Unlisted** for a quiet first round), all regions.
5. **Test instructions** (if asked): "No login needed. Open any website, click the Bracel toolbar icon, switch on
   Show Bracel on this tab."
6. **Submit for review**. Leave "publish automatically after approval" on, or turn it off to press Publish yourself.
   Review usually takes a few days; the optional all-sites permission can make it longer. If it is rejected, the email
   names the policy: fix, bump the version, upload, resubmit.

### After approval

1. Copy the listing URL (`https://chromewebstore.google.com/detail/<name>/<id>`).
2. Put it in `site/index.html` (the `#store` link), open a PR, merge: Cloudflare redeploys. (Done for 1.0.0 on 31 Oct
   2026.)
3. Tick the Phase 6 items in `ROADMAP.md`.

## 4. Microsoft Edge (optional, same zip)

https://partner.microsoft.com/dashboard/microsoftedge → register (free) → **Create new extension** → upload
`dist/edge/bracel-edge-<version>.zip` (the same files as Chrome), the same listing, the same privacy URL. Category:
Entertainment.

## 5. Firefox Add-ons (AMO)

The Firefox package differs from Chrome's only in its manifest (made by `npm run build`): a background script instead
of a service worker, the add-on id `bracel@saurabhpagrut.in` (never change it: it is how updates find the add-on), and
the built-in data consent declaring that nothing is collected. It needs Firefox 140 or later (Firefox for Android 142, if it is ever offered there).

1. Check it: `npx web-ext lint -s dist/firefox/bracel-firefox-<version>` (0 errors, 0 warnings for 1.0.1), then try it in
   Firefox: `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → its `manifest.json`. Bring Bracel to
   a tab, switch on "On this site" (Firefox asks for the permission), reload: it comes back by itself.
2. https://addons.mozilla.org/developers/ → sign in with a Firefox account (free) → **Submit a New Add-on** → **On this
   site** → upload `dist/firefox/bracel-firefox-<version>.zip`. Platforms: Firefox (desktop) only for now.
3. Source code: answer **No** (nothing is minified or bundled; the package is the source).
4. Listing: the same name, summary and description as `store/LISTING.md`. Category: Fun. Support site: the GitHub
   issues URL. Privacy policy: paste the text of `PRIVACY.md`. Screenshots: the same five.
5. Review is often automatic within hours; a human review can come later.

## 6. Opera add-ons

https://addons.opera.com/developer/ → sign in → **Upload new extension** → `dist/opera/bracel-opera-<version>.zip` (the
same files as Chrome), the same listing, icon `store/icon-64x64.png`, promo image `store/promo-300x188.png`, licence MIT. Category: Fun. Opera's review can take weeks; meanwhile Opera users can
install from the Chrome Web Store.

## 7. Safari (later; needs a Mac with Xcode and the Apple Developer Program, US$99 a year)

`npm run build` leaves `dist/safari/bracel-safari-<version>/`. Turn it into a Mac app that carries the extension:

```sh
xcrun safari-web-extension-converter dist/safari/bracel-safari-<version> --app-name Bracel --bundle-identifier in.saurabhpagrut.bracel
```

Then in Xcode: set the team, run it to test (Safari → Settings → Advanced → Show features for web developers, then
Develop → Allow unsigned extensions), archive, and submit through App Store Connect with the same listing.

## Other browsers

Brave, Vivaldi, Arc, Yandex and Naver Whale install extensions from the Chrome Web Store, so the Chrome listing
already covers them. Firefox for Android and Samsung Internet (Galaxy Store) are possible later, after testing on a
phone.

## 8. Shipping an update

1. Branch, change, `npm test`.
2. Bump `version` in `manifest.json` **and** `package.json` (lint checks they match), and add a `CHANGELOG.md` entry.
3. Visible change? `node scripts/screenshots.mjs` (with `npm run serve` running) and `npm run icons` if the look changed.
4. PR, merge, then `npm run build`.
5. In each store, upload that browser's zip from `dist/<browser>/`. Chrome: developer dashboard → the item →
   **Package** → **Upload new package** → **Submit for review**. Edge, Firefox, Opera: the item → **Update** / **Upload
   new version**. Users get the update automatically after approval.
6. If `PRIVACY.md` changed, update its date; merging redeploys the website.
