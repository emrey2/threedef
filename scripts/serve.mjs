// Tiny local server for dist/ with the same clean URLs the hosts use:
// /about -> about.html, /work/slug -> work/slug.html, unknown paths -> 404.html
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".txt": "text/plain",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm",
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") || "/";
  const candidates = clean === "/" ? ["index.html"] : [clean.slice(1), `${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`];
  for (const c of candidates) {
    const file = path.join(DIST, c);
    if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) return { file, status: 200 };
  }
  return { file: path.join(DIST, "404.html"), status: 404 };
}

http.createServer((req, res) => {
  const { file, status } = resolve(req.url);
  const stat = fs.statSync(file);
  const type = TYPES[path.extname(file)] || "application/octet-stream";
  const range = req.headers.range;
  if (range && type.startsWith("video/")) {
    const [s, e] = range.replace("bytes=", "").split("-");
    const start = Number(s), end = e ? Number(e) : stat.size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(status, { "Content-Type": type, "Content-Length": stat.size });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`));
