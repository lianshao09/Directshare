# Direct share

Private peer-to-peer file transfer between two browsers that runs as a static website. No backend, no accounts, no database, no uploads, no stored files.

One person creates a channel and shares the ID, the other joins with it, and their browsers connect directly to each other over WebRTC.

Live site: https://directshare.site

I built this site for my own personal use.
If you find it useful, feel free to use it too.

## How it works

1. One person clicks **Create a channel** and gets a random ID (`XXXX-XXXX`).
2. The other person clicks **Join a channel** and enters that ID.
3. Both browsers hash the ID (SHA-256, first 32 hex characters) to get the room name. The ID itself never leaves your browser.
4. [Trystero](https://github.com/dmotz/trystero) uses public Nostr relays for signaling, encrypted with the ID as password.
5. A direct, encrypted WebRTC connection opens and files go browser to browser.
6. If either person leaves, loses connection, or 60 minutes pass, the channel closes for both. Close the tab and everything is gone.

More detail, including who can see what, is in `how-it-works.html`.

## Run it

It is two static files. Upload `index.html` and `how-it-works.html` to any static host (shared hosting, GitHub Pages, Cloudflare Pages, Netlify). HTTPS is required, WebRTC does not work without it.

To try it locally:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in two browser windows. `localhost` counts as a secure context.

## Limits

- The ID is the only lock. Whoever enters it first takes the one free place, so share it over a channel you trust.
- "Exactly two users" and the 60-minute limit are enforced by the browsers, not by a server.
- Each person can see the other's IP address.
- No TURN server, so some strict networks can block connections.
- Files are held in memory while they arrive: 1 GB limit per file.
- Both people must be online at the same time.
- Depends on public Nostr relays and the jsDelivr CDN being reachable.

## License

MIT. Take it, change it, host your own copy. See `LICENSE`.
