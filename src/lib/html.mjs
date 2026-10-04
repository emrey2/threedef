// HTML helpers.
//
// Content strings may contain placeholder markers like "[TODO: confirm reply time]".
// In visible text they become HTML comments (invisible to visitors, but still in the
// built HTML so the TODO check finds them). In attributes they are stripped.

const TODO_RE = /\[TODO:[^\]]*\]/g;

export function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Visible text: escape, and turn TODO markers into comments.
export function text(value = "") {
  const parts = String(value).split(TODO_RE);
  const markers = String(value).match(TODO_RE) || [];
  let out = "";
  parts.forEach((part, i) => {
    out += esc(part);
    if (markers[i]) out += `<!-- ${esc(markers[i])} -->`;
  });
  return out.replace(/\s+(<!--)/g, " $1").trim();
}

// Text with a minimal inline syntax: [label](https://url) links. Used for paragraphs.
export function rich(value = "") {
  return text(value).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*|mailto:[^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:/.test(href);
    return `<a href="${href}"${external ? ' rel="noopener" target="_blank"' : ""}>${label}</a>`;
  });
}

// Attribute value: strip markers, collapse whitespace, escape.
export function attr(value = "") {
  return esc(plain(value));
}

// Plain string without markers (for JSON-LD, comparisons, emptiness checks).
export function plain(value = "") {
  return String(value).replace(TODO_RE, "").replace(/\s+/g, " ").trim();
}

export function hasContent(value) {
  if (Array.isArray(value)) return value.some(hasContent);
  return typeof value === "string" ? plain(value) !== "" : value != null;
}

export function paragraphs(list = []) {
  const items = Array.isArray(list) ? list : String(list).split(/\n\s*\n/);
  return items.filter(hasContent).map((p) => `<p>${rich(p)}</p>`).join("\n");
}

export const TODO_PATTERN = TODO_RE;
