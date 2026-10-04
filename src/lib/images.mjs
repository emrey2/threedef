import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { attr } from "./html.mjs";

const WIDTHS = [480, 800, 1200, 1600, 2000];

function fresh(out, src) {
  return fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;
}

// Resize one source image into WebP + JPEG variants.
// outDir is an absolute folder inside dist, urlBase the matching public URL.
export async function processImage(src, outDir, urlBase, { widths = WIDTHS, name } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const meta = await sharp(src).rotate().metadata();
  const srcWidth = meta.autoOrient?.width ?? meta.width;
  const srcHeight = meta.autoOrient?.height ?? meta.height;
  const base = name || path.parse(src).name;
  const use = widths.filter((w) => w < srcWidth);
  if (!use.length || use[use.length - 1] < srcWidth) use.push(Math.min(srcWidth, widths[widths.length - 1]));

  const webp = [];
  const jpg = [];
  for (const w of [...new Set(use)]) {
    const webpOut = path.join(outDir, `${base}-${w}.webp`);
    const jpgOut = path.join(outDir, `${base}-${w}.jpg`);
    if (!fresh(webpOut, src)) await sharp(src).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(webpOut);
    if (!fresh(jpgOut, src)) await sharp(src).rotate().resize({ width: w }).jpeg({ quality: 80, mozjpeg: true }).toFile(jpgOut);
    webp.push(`${urlBase}/${base}-${w}.webp ${w}w`);
    jpg.push(`${urlBase}/${base}-${w}.jpg ${w}w`);
  }
  const fallbackWidth = use.find((w) => w >= 1200) || use[use.length - 1];
  return {
    width: srcWidth,
    height: srcHeight,
    webp: webp.join(", "),
    jpg: jpg.join(", "),
    src: `${urlBase}/${base}-${fallbackWidth}.jpg`,
    largest: `${urlBase}/${base}-${use[use.length - 1]}.jpg`,
  };
}

// <picture> with WebP and JPEG sources. width/height reserve the aspect ratio.
export function picture(img, { alt = "", sizes = "100vw", eager = false, className = "" } = {}) {
  if (!img) return "";
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<picture${className ? ` class="${className}"` : ""}><source type="image/webp" srcset="${img.webp}" sizes="${sizes}"><img src="${img.src}" srcset="${img.jpg}" sizes="${sizes}" width="${img.width}" height="${img.height}" alt="${attr(alt)}" ${loading}></picture>`;
}

export function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fresh(dest, src)) fs.copyFileSync(src, dest);
}

// Logo derivatives and icons, generated from the files in public/brand.
export async function buildBrandAssets(brandDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const jobs = [];
  const logo = (file, base) => {
    const src = path.join(brandDir, file);
    for (const w of [320, 640]) {
      const out = path.join(outDir, `${base}-${w}.webp`);
      if (!fresh(out, src)) jobs.push(sharp(src).resize({ width: w }).webp({ quality: 90, alphaQuality: 100 }).toFile(out));
    }
  };
  logo("3def-logo-cream.webp", "logo-cream");
  logo("3def-logo-white.webp", "logo-white");
  const blackSrc = path.join(brandDir, "3def-logo-black.webp");
  const blackOut = path.join(outDir, "logo-black-640.png");
  if (!fresh(blackOut, blackSrc)) jobs.push(sharp(blackSrc).resize({ width: 640 }).png().toFile(blackOut));

  // Icon: cropped from the navy square logo (icon area only, with its own navy padding).
  const square = path.join(brandDir, "3def-logo-navy-square.webp");
  const iconCrop = { left: 304, top: 849, width: 300, height: 300 };
  for (const [name, size] of [["favicon-32.png", 32], ["favicon-192.png", 192], ["favicon-512.png", 512], ["apple-touch-icon.png", 180]]) {
    const out = path.join(outDir, name);
    if (!fresh(out, square)) jobs.push(sharp(square).extract(iconCrop).resize(size, size).png().toFile(out));
  }
  // Default share image: centre band of the navy square logo, 1200 x 630.
  const og = path.join(outDir, "share-default.jpg");
  if (!fresh(og, square)) jobs.push(sharp(square).extract({ left: 0, top: 475, width: 2000, height: 1050 }).resize(1200, 630).jpeg({ quality: 88 }).toFile(og));
  await Promise.all(jobs);
}
