// Builds the static site into dist/.
//   npm run build          build, and warn about any [TODO markers left
//   npm run build:strict   same, but fail if any [TODO markers remain
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { readJSON, loadProjects } from "../src/lib/content.mjs";
import { processImage, copyFile, buildBrandAssets } from "../src/lib/images.mjs";
import { plain, esc, TODO_PATTERN } from "../src/lib/html.mjs";
import { mediaUrl } from "../src/lib/frames.mjs";
import { layout, absUrl } from "../src/layout.mjs";
import { renderHome, reelDialog } from "../src/pages/home.mjs";
import { renderWork, renderProject } from "../src/pages/work.mjs";
import { renderAbout } from "../src/pages/about.mjs";
import { renderContact, renderNotFound } from "../src/pages/contact.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");
const strict = process.argv.includes("--strict");
const started = Date.now();

// 1. Clean dist, keeping generated image folders so unchanged images aren't re-encoded.
const KEEP = new Set(["media", "brand"]);
fs.mkdirSync(DIST, { recursive: true });
for (const entry of fs.readdirSync(DIST)) {
  if (!KEEP.has(entry)) fs.rmSync(path.join(DIST, entry), { recursive: true, force: true });
}

// 2. Copy public/ as-is.
function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else copyFile(src, dest);
  }
}
copyDir(PUBLIC, DIST);

// 3. Logo derivatives, favicons and default share image from public/brand.
await buildBrandAssets(path.join(PUBLIC, "brand"), path.join(DIST, "brand", "generated"));

// 4. Content.
const site = readJSON(path.join(CONTENT, "site.json"));
const home = readJSON(path.join(CONTENT, "home.json"));
const about = readJSON(path.join(CONTENT, "about.json"));
const work = readJSON(path.join(CONTENT, "work.json"));
const contact = readJSON(path.join(CONTENT, "contact.json"));
const proof = readJSON(path.join(CONTENT, "proof.json"));
const { projects, warnings } = loadProjects(path.join(CONTENT, "projects"));

// 5. Images.
const IMG_OUT = path.join(DIST, "media", "img");
const media = {
  poster: await processImage(path.join(PUBLIC, plain(site.showreel.poster)), path.join(IMG_OUT, "site"), "/media/img/site", { name: "showreel-poster", widths: [640, 1280, 1920, 2560] }),
  portrait: await processImage(path.join(PUBLIC, plain(site.owner.portrait)), path.join(IMG_OUT, "site"), "/media/img/site", { name: "portrait", widths: [400, 720, 1000] }),
};
for (const p of projects) {
  const outDir = path.join(IMG_OUT, "projects", p.slug);
  const urlBase = `/media/img/projects/${p.slug}`;
  p.coverImg = p.cover ? await processImage(p.cover, outDir, urlBase, { name: "cover", widths: [480, 800, 1200, 1600] }) : null;
  p.galleryImgs = [];
  for (const g of p.gallery) p.galleryImgs.push(await processImage(g, outDir, urlBase));
  // Videos inside the project folder are copied next to the images; URLs are used as-is.
  const localVideo = (v) => {
    if (!v || /^https?:\/\//.test(v)) return v;
    const src = path.join(p.folder, v);
    if (!fs.existsSync(src)) { warnings.push(`content/projects/${p.slug}: video file "${v}" not found`); return ""; }
    copyFile(src, path.join(DIST, "media", "projects", p.slug, v));
    return `/media/projects/${p.slug}/${v}`;
  };
  p.videoUrl = localVideo(plain(p.video));
  p.previewUrl = localVideo(plain(p.preview));
}

// 6. CSS and JS with a content hash for long-term caching.
function hashed(srcRel, outName) {
  const src = fs.readFileSync(path.join(ROOT, srcRel));
  const hash = crypto.createHash("sha256").update(src).digest("hex").slice(0, 10);
  const [base, ext] = outName.split(".");
  const file = `${base}.${hash}.${ext}`;
  fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });
  fs.writeFileSync(path.join(DIST, "assets", file), src);
  return `/assets/${file}`;
}
const assets = { css: hashed("src/assets/styles.css", "styles.css"), js: hashed("src/assets/site.js", "site.js") };

// 7. Pages.
const pages = [];
function writePage(urlPath, file, html) {
  const out = path.join(DIST, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  if (urlPath) pages.push(urlPath);
}

const posterPreload = `<link rel="preload" as="image" type="image/webp" imagesrcset="${media.poster.webp}" imagesizes="100vw" fetchpriority="high">`;
writePage("/", "index.html", layout({
  site, assets,
  page: { path: "/", title: home.title, description: home.description, overVideo: true, preload: posterPreload },
  main: renderHome({ site, home, proof, projects, media }),
  extra: reelDialog(site),
}));

writePage("/work", "work.html", layout({
  site, assets,
  page: { path: "/work", title: work.title, description: work.description },
  main: renderWork({ work, projects }),
}));

projects.forEach((p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const { main, extra } = renderProject({ site, project: p, prev, next, labels: work.project });
  const summary = plain(p.summary) || plain(p.overview[0] || "");
  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: plain(p.title),
    genre: plain(p.vertical),
    about: plain(p.category),
    ...(plain(p.year) ? { dateCreated: plain(p.year) } : {}),
    image: p.coverImg ? absUrl(site, p.coverImg.src) : undefined,
    url: absUrl(site, `/work/${p.slug}`),
    creator: { "@type": "Organization", name: plain(site.name), url: absUrl(site, "/") },
  }).replace(/</g, "\\u003c");
  writePage(`/work/${p.slug}`, `work/${p.slug}.html`, layout({
    site, assets,
    page: {
      path: `/work/${p.slug}`,
      nav: "/work",
      title: `${plain(p.title)}, ${plain(p.vertical).toLowerCase()} product animation | ${plain(site.name)}`,
      description: summary || plain(site.description),
      image: p.coverImg?.src,
      imageAlt: p.coverAlt || plain(p.title),
      ogType: "article",
      jsonld,
    },
    main, extra,
  }));
});

writePage("/about", "about.html", layout({
  site, assets,
  page: { path: "/about", title: about.title, description: about.description },
  main: renderAbout({ site, about, media }),
}));

writePage("/contact", "contact.html", layout({
  site, assets,
  page: { path: "/contact", title: contact.title, description: contact.description },
  main: renderContact({ site, contact }),
}));

writePage(null, "404.html", layout({
  site, assets,
  page: { path: "/404", title: `Page not found | ${plain(site.name)}`, description: "This page doesn't exist.", noindex: true },
  main: renderNotFound(),
}));

// 8. SEO and hosting files.
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${esc(absUrl(site, p))}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${absUrl(site, "/sitemap.xml")}\n`);
fs.writeFileSync(path.join(DIST, "site.webmanifest"), JSON.stringify({
  name: plain(site.name),
  short_name: "3Def",
  icons: [
    { src: "/brand/generated/favicon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/brand/generated/favicon-512.png", sizes: "512x512", type: "image/png" },
  ],
  theme_color: "#0f212d",
  background_color: "#0f212d",
  display: "browser",
}, null, 2));
// Cache headers (Netlify and Cloudflare Pages read _headers).
fs.writeFileSync(path.join(DIST, "_headers"), `/assets/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/media/*
  Cache-Control: public, max-age=2592000
/brand/*
  Cache-Control: public, max-age=2592000
`);

// 9. Report: content warnings, then the TODO check.
for (const w of warnings) console.warn(`warning: ${w}`);

const todos = new Map(); // marker -> set of locations
function collect(file, label) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(TODO_PATTERN)) {
    if (!todos.has(m[0])) todos.set(m[0], new Set());
    todos.get(m[0]).add(label);
  }
}
function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!e.name.startsWith("_")) walk(p, fn); }
    else fn(p);
  }
}
walk(CONTENT, (f) => { if (/\.(json|md)$/.test(f)) collect(f, path.relative(ROOT, f)); });
walk(DIST, (f) => { if (f.endsWith(".html")) collect(f, path.relative(ROOT, f)); });

console.log(`Built ${pages.length} pages and 404.html into dist/ in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
if (todos.size) {
  const production = strict || process.env.CONTEXT === "production" || process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production" || process.env.CF_PAGES_BRANCH === "main";
  console.warn(`\n${production ? "WARNING (production build)" : "Note"}: ${todos.size} placeholder [TODO] markers remain. See TODO.md.`);
  for (const [marker, where] of todos) {
    const files = [...where].filter((w) => w.startsWith("content")).concat([...where].filter((w) => !w.startsWith("content")).slice(0, 1));
    console.warn(`  ${marker}  (${files.join(", ")}${where.size > files.length ? ", ..." : ""})`);
  }
  if (strict) {
    console.error("\nbuild:strict failed because placeholders remain.");
    process.exit(1);
  }
}
