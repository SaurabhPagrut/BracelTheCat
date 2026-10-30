# Bracel privacy policy

*Last updated: 30 October 2026*

Bracel is a browser extension that draws a small cat on the websites you visit. **It collects nothing and sends
nothing anywhere.**

## What Bracel stores

- **Your settings** (coat, size, purr sound, which activities are switched on), in your browser's synced extension
  storage (`chrome.storage.sync`), so they follow you if you use browser sync.
- **Your per-site choices** (sites where Bracel is switched on or off), in the browser's local extension storage
  (`chrome.storage.local`).

That is all. Bracel never stores or reads the pages' content, your history, form data, cookies or the sites' own storage.

## What Bracel sends

Nothing. Bracel makes no network requests: no analytics, no error reports, no remote configuration, no fonts or images
from elsewhere. Everything it needs is inside the extension.

## Permissions, and why

| Permission | Why |
| --- | --- |
| `activeTab` | When you click the toolbar button or press the shortcut, Bracel may visit the tab you are on, until it navigates away. |
| `scripting` | To put Bracel on that tab, and to bring it back by itself on the sites you switched on. |
| `storage` | To remember your settings and per-site choices. |
| Access to a site (asked when you switch on "On this site") | So Bracel comes back by itself on that site. |
| Access to all sites (asked when you switch on "On every site", optional) | So Bracel can come by itself on every site. It still reads nothing and sends nothing. |

On a page, Bracel only looks at the layout (where boxes, images and headers are, and whether a dialog is open) to find
places to sit. It does not read text, and nothing it sees leaves the page.

## Contact

Questions: open an issue at https://github.com/SaurabhPagrut/bracel/issues.
