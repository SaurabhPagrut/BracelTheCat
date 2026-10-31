# YouTube: the intro and demo video

Made by `npm run video` (with `npm run serve` running): `dist/video/bracel-demo.webm` (2560×1440, 60 fps, VP9, about
24 Mbps, 78 s, no sound) and `dist/video/thumbnail.jpg` (1280×720), copied to `store/bracel-demo.webm` (kept out of
git: too big, rebuilt by the script) and `store/youtube-thumbnail.jpg`. YouTube takes the WebM as it is. It's 1440p on
purpose: YouTube gives 1440p uploads its better codecs (VP9/AV1) at every quality, including 1080p, so Bracel's thin
lines and the page text stay sharp; 1080p uploads often get the blurrier H.264 one.

Scenes: title card, news page (walks, jumps), dashboard (grooms, kneads, yarn, naps), web app (hangs, drops), docs
(stroked, pounces; the camera closes in 1.15×, 0:34–0:41), a dialog opening (it leaves), dark page (the five coats,
growing; closes in 1.15×, 0:50–0:58), the popup (Show brings it), privacy card, end card. The Bento Cat credit is on
every card.

The video has no sound track and no voiceover. In YouTube Studio → the video → **Editor** → **Audio**, add a calm
track from the YouTube Audio Library (free to use on YouTube). Keep it quiet; the captions carry the story. (Studio
has one volume for the whole track, so there's no ducking to set up; if a voiceover is ever added, mix the music
in an editor: about −22 dB under the voice, −14 dB on the title and end cards.)

## Title (100 characters max)

Bracel – A Cute Virtual Cat for Every Website | Chrome Extension Demo

## Description

Bring a cozy feline companion to your browser! 🐾

🔗 Add Bracel to Chrome (free): https://chromewebstore.google.com/detail/bracel-a-cat-for-every-we/diiopbiepmlejbbibggfhhdmnaeiehjf
🌐 Website: https://bracel.saurabhpagrut.in

✨ Features:
• Naturally explores headers, boxes and pictures on any page: walks, jumps, hangs, grooms, kneads and naps
• Interactive: stroke it with your pointer to make it purr, or wiggle the pointer above it and it pounces
• Never in the way: clicks pass through, and it steps aside when a dialog opens
• 5 coats (Cloud, Slate, Slate tuxedo, Accent blue, Amber) with dark-page variants, and any size you like
• 100% private by design: no account, no analytics, no external servers
• Bring it to any tab with one click or Alt+Shift+B

🔒 Privacy: https://bracel.saurabhpagrut.in/privacy
💻 Source: https://github.com/SaurabhPagrut/BracelTheCat

Credit: Bracel's look is adapted from "Bento Cat" by mikewirsch
(https://rive.app/marketplace/21131-39716-bento-cat), licensed CC BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Redrawn and animated in code.

#ChromeExtension #VirtualPet #IndieDev #Productivity

(YouTube shows the first three hashtags above the title.)

## Tags

virtual pet, browser pet, desktop pet, virtual cat, cat extension, chrome extension, cute cat, screen pet,
study companion, browser extension, Bracel

## Settings

- Category: Science & Technology (or Pets & Animals).
- Audience: not made for kids (it's a software demo; "made for kids" turns off comments and other features).
- Thumbnail: `dist/video/thumbnail.jpg`.
- Add the video to the website and the store listings later: the Chrome Web Store has a "YouTube video" field
  under Store listing.
