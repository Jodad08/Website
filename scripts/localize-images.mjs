// Copies every framerusercontent.com image the site references into
// public/img/framer/ and rewrites the HTML to point at the local copies.
//
// The photos on this site came from the old Framer build (old.josiahjardine.com)
// and are still served from Framer's CDN. Run this once so the new site stops
// depending on the old one:
//
//   npm run images:localize
//
// Then remove https://framerusercontent.com from img-src in public/_headers.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const PUBLIC = new URL("../public/", import.meta.url).pathname;
const OUT_DIR = join(PUBLIC, "img", "framer");
const URL_RE = /https:\/\/framerusercontent\.com\/images\/([A-Za-z0-9]+)\.(jpe?g|png|webp|gif)(\?[^"\s,]*)?/g;

const htmlFiles = (await readdir(PUBLIC)).filter((f) => extname(f) === ".html");
await mkdir(OUT_DIR, { recursive: true });

const downloaded = new Map();

async function localize(url, id, ext, query) {
  if (downloaded.has(url)) return downloaded.get(url);
  const size = new URLSearchParams(query ? query.slice(1) : "").get("scale-down-to");
  const name = `${id}${size ? `-${size}` : ""}.${ext}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await writeFile(join(OUT_DIR, name), Buffer.from(await res.arrayBuffer()));
  const local = `/img/framer/${name}`;
  downloaded.set(url, local);
  console.log(`${url} -> ${local}`);
  return local;
}

for (const file of htmlFiles) {
  const path = join(PUBLIC, file);
  let html = await readFile(path, "utf8");
  // Longest URLs first, so a bare URL never rewrites the prefix of a sized one.
  const matches = [...new Map([...html.matchAll(URL_RE)].map((m) => [m[0], m])).values()]
    .sort((a, b) => b[0].length - a[0].length);
  for (const [url, id, ext, query] of matches) {
    html = html.replaceAll(url, await localize(url, id, ext, query));
  }
  if (matches.length) await writeFile(path, html);
}

console.log(`\n${downloaded.size} image(s) saved to public/img/framer/.`);
