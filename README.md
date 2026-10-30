# Direct share

Private peer-to-peer file transfer between two browsers that runs as a static website. No backend, no accounts, no database, no uploads, no stored files.

One person creates a channel and shares the ID, the other joins with it, and their browsers connect directly to each other over WebRTC.

Live site: https://directshare.site

I built this site for my own personal use.
If you find it useful, feel free to use it too.

## How it works

1. One person clicks **Create a channel** and gets a random ID (`XXXX-XXXX`).
2. The other person clicks **Join a channel** and enters that ID, or opens the invite link / scans the QR code.
   The receiver can save files one by one, with **Download all**, or as one **ZIP** built in the browser (no compression, nothing uploaded).
3. Both browsers hash the ID (SHA-256, first 32 hex characters) to get the room name. The ID itself never leaves your browser.
4. [Trystero](https://github.com/dmotz/trystero) uses public Nostr relays for signaling, encrypted with the ID as password.
5. A direct, encrypted WebRTC connection opens and files go browser to browser.
6. If either person leaves, loses connection, or 60 minutes pass, the channel closes for both. Close the tab and everything is gone.

More detail, including who can see what, is in `how-it-works.html`.

## Run it

It is a few static files, no build step. Upload everything except `README.md` and `LICENSE` (optional) to any static host (shared hosting, GitHub Pages, Cloudflare Pages, Netlify), keeping them in the same folder: `index.html`, `how-it-works.html`, `trystero.js`, `qr.js`, `sw.js`, `manifest.json` and the four `*.png` icons. HTTPS is required, WebRTC and the service worker do not work without it.

To try it locally:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in two browser windows. `localhost` counts as a secure context.

## Install as an app (PWA)

It has a web app manifest and a small service worker, so it can be installed from the browser (Install app button, or Share > Add to Home Screen on iPhone/iPad). The service worker only keeps the app's own files so the page opens offline. It never touches your files or the connection, and online it always fetches fresh files first.

To ship an update, change `VERSION` in `sw.js`.

## Third-party code

`qr.js` is [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT, Kazuhiko Arase) bundled with esbuild; it draws the QR code in the browser, nothing is sent anywhere.

`trystero.js` is [Trystero](https://github.com/dmotz/trystero) 0.21.5 (MIT) bundled with esbuild, together with `@noble/secp256k1` (MIT). It is served from this site, so no CDN is involved. To rebuild it: `npm i trystero@0.21.5 esbuild`, then `npx esbuild node_modules/trystero/src/index.js --bundle --minify --format=esm --outfile=trystero.js`.

## Limits

- The ID is the only lock. Whoever enters it first takes the one free place, so share it over a channel you trust.
- "Exactly two users" and the 60-minute limit are enforced by the browsers, not by a server.
- Each person can see the other's IP address.
- No TURN server, so some strict networks can block connections.
- Files are held in memory while they arrive: 1 GB limit per file.
- Both people must be online at the same time, and both pages must stay open until a transfer finishes. If either closes the tab or loses connection, the transfer stops (it is not resumed). A device that is only away for a while (choosing photos, another app in front) is waited for, but phones may drop the connection after a long time in the background, especially iPhone.
- Depends on public Nostr relays being reachable.

## License

MIT. Take it, change it, host your own copy. See `LICENSE`.
