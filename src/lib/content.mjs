import fs from "node:fs";
import path from "node:path";

export const VERTICALS = ["Gaming", "Beauty", "Wellness", "Fashion"];
const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

export function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`Could not read ${file}: ${err.message}`);
  }
}

// --- project.md -------------------------------------------------------------
// Frontmatter between --- lines (one "key: value" per line), then "## Section" blocks.

function parseValue(raw) {
  // Trailing "  # comment" is allowed (used in the template).
  const v = raw.replace(/\s+#\s.*$/, "").trim().replace(/^(["'])(.*)\1$/, "$2");
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

export function parseProjectFile(source, file) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing the --- frontmatter block at the top`);
  const data = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i === -1) throw new Error(`${file}: can't read the line "${line.trim()}" (expected "key: value")`);
    data[line.slice(0, i).trim().toLowerCase()] = parseValue(line.slice(i + 1));
  }

  const sections = {};
  let current = null;
  for (const line of match[2].split("\n")) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1].toLowerCase().replace(/[^a-z]+/g, "");
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }
  const block = (name) => (sections[name] || []).join("\n").trim();
  const toParagraphs = (s) => s.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  const toList = (s) => {
    const lines = s.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.every((l) => l.startsWith("- ")) ? lines.map((l) => l.slice(2).trim()) : toParagraphs(s);
  };

  return {
    ...data,
    overview: toParagraphs(block("overview")),
    approach: toParagraphs(block("approach") || block("ourapproach")),
    deliverables: toList(block("deliverables")),
    result: toParagraphs(block("result")),
  };
}

export function loadProjects(dir) {
  if (!fs.existsSync(dir)) return { projects: [], warnings: [] };
  const warnings = [];
  const projects = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
    .map((d) => {
      const folder = path.join(dir, d.name);
      const mdFile = path.join(folder, "project.md");
      if (!fs.existsSync(mdFile)) {
        warnings.push(`content/projects/${d.name}: no project.md, skipped`);
        return null;
      }
      const p = parseProjectFile(fs.readFileSync(mdFile, "utf8"), mdFile);
      const files = fs.readdirSync(folder);
      const cover = files.find((f) => /^cover\./i.test(f) && IMAGE_RE.test(f));
      const gallery = files
        .filter((f) => IMAGE_RE.test(f) && /^\d/.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.name)) warnings.push(`content/projects/${d.name}: folder names should be lowercase words joined by hyphens`);
      if (!p.title) warnings.push(`content/projects/${d.name}: missing title`);
      if (!VERTICALS.includes(p.vertical)) warnings.push(`content/projects/${d.name}: vertical "${p.vertical}" should be one of ${VERTICALS.join(", ")}`);
      if (!cover) warnings.push(`content/projects/${d.name}: no cover image (cover.jpg)`);

      return {
        slug: d.name,
        folder,
        title: String(p.title || d.name),
        vertical: String(p.vertical || ""),
        category: p.category != null ? String(p.category) : "",
        year: p.year != null ? String(p.year) : "",
        client: p.client != null ? String(p.client) : "",
        featured: p.featured === true,
        order: typeof p.order === "number" ? p.order : 999,
        summary: p.summary != null ? String(p.summary) : "",
        coverAlt: p.cover_alt ? String(p.cover_alt) : "",
        video: p.video ? String(p.video) : "",
        preview: p.preview ? String(p.preview) : "",
        overview: p.overview,
        approach: p.approach,
        deliverables: p.deliverables,
        result: p.result,
        cover: cover ? path.join(folder, cover) : null,
        gallery: gallery.map((f) => path.join(folder, f)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return { projects, warnings };
}
