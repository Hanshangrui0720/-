# Personal website deployment

Primary hosting: the existing Netlify project `hanshangrui-080720`.
Custom domain: `hanshangrui.xyz` (DNS and HTTPS must be active before sharing).

Build with `npm ci` then `npm run build`, and publish the **contents** of `dist`
to that same Netlify project. The root of the upload must contain `index.html`,
`_headers`, and `assets/`. Keep the complete assets directory.

The desktop hero remains the original 2560×1440 `hero-video-web.mp4`.
Portrait phones use `hero-mobile-portrait-v2.mp4`, a 720×1280 H.264 Main,
24 fps, silent, fast-start derivative of the same footage. Landscape phones
use the original landscape video. The first-frame JPEG posters keep the hero
visible while buffering. iOS playback uses explicit muted/inline attributes,
gesture and visibility retries, with a play button if autoplay is denied.

The 10 certificates, service backgrounds, and portrait use local WebP copies;
original PNG/JPEG files remain available as error fallbacks. Fonts are bundled.
The desktop-only 3D badge is loaded after playback begins, never on phone layouts.

GitHub Pages remains a secondary deployment; its workflow uses `/-/` for app
paths and the custom domain for media. No service-worker cache is installed.

Verification: `node --experimental-vm-modules scripts/check-media.mjs` after
building checks device selection, asset paths, all certificates, MP4 fast-start
metadata, and byte-for-byte preservation of the desktop video against HEAD.
Browser layout tests do not substitute for an actual iPhone WeChat test.
