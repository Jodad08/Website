# josiahjardine.com

Personal site. Static HTML, CSS and a little JS, with no framework and no build step,
served from Cloudflare (Workers static assets or Pages).

## Run it locally

```bash
npm install
npm run dev          # wrangler dev on http://localhost:8787, with _headers and the 404 page applied
```

Any static server works too (`python3 -m http.server -d public`), minus the headers.

## Deploy

**Workers (recommended):**

```bash
npx wrangler login   # once
npm run deploy       # publishes ./public as the "josiahjardine" Worker
```

Then in the Cloudflare dashboard: Workers & Pages → josiahjardine → Settings → Domains & Routes →
add `josiahjardine.com` and `www.josiahjardine.com`.

**Pages (Git integration):** connect this repo, leave the build command empty, set the
build output directory to `public`. Or deploy by hand with `npm run deploy:pages`.

Both paths use the same `public/_headers` (security headers + caching) and `public/404.html`.

## Layout

| Path | What it is |
|---|---|
| `public/index.html` | The whole page. All copy lives here. |
| `public/styles.css` | Tokens at the top (light + dark), then one block per section. |
| `public/main.js` | Theme toggle, scroll reveals, footer year. |
| `public/icons.svg` | Phosphor icon sprite (MIT). |
| `public/fonts/` | Archivo (variable weight + width) and Geist Mono, both OFL, self-hosted. |
| `public/img/` | Screenshots of Hermie, Wardrobe and the campground checker. |
| `public/og.png` | 1200x630 social preview. |
| `public/_headers` | CSP, HSTS, caching. |
| `scripts/localize-images.mjs` | Moves the Framer-hosted photos into the repo (see below). |

## Photos from the old site

The hero, BMW, writing, photography and reading-list images are the originals from the
Framer build of the old site, still served from `framerusercontent.com`. If that Framer
project ever goes away, they break. To own them:

```bash
npm run images:localize
```

That downloads every Framer image the HTML references into `public/img/framer/` and rewrites
the URLs. Afterwards, drop `https://framerusercontent.com` from `img-src` in `public/_headers`.

## Editing notes

- **Inline script hash.** The theme script in `<head>` (in both HTML files) is allowed by a
  `sha256-...` hash in the CSP. If you change that script, recompute the hash or it will be
  blocked:
  `node -e "const s=require('fs').readFileSync('public/index.html','utf8').match(/<script>(.*?)<\/script>/s)[1];console.log(require('crypto').createHash('sha256').update(s).digest('base64'))"`
- **External images or scripts** need their host added to the CSP in `_headers`, or the
  browser blocks them silently.
- **Analytics.** The CSP already allows Cloudflare Web Analytics. Turn it on in the dashboard
  (Workers & Pages → project → Metrics / Web Analytics) and nothing in the repo needs to change.
- **Writing links** point at the old site's blog (`old.josiahjardine.com/blog`). Swap in
  per-post URLs if the posts move.
