import { esc, text, attr, plain } from "./html.mjs";
import { picture } from "./images.mjs";

// One work tile: cover frame plus a slate line (title, vertical).
export function frame(project, { sizes, headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  const preview = project.previewUrl
    ? `<video muted loop playsinline preload="none" aria-hidden="true" data-preview src="${esc(project.previewUrl)}"></video>`
    : "";
  return `<li data-vertical="${attr(project.vertical).toLowerCase()}">
          <a class="frame" href="/work/${project.slug}">
            <div class="frame-media">
              ${picture(project.coverImg, { alt: project.coverAlt || `${plain(project.title)}, ${plain(project.category)}`, sizes })}
              ${preview}
            </div>
            <div class="frame-slate">
              <${h} class="frame-title">${text(project.title)}</${h}>
              <span class="slate">${text(project.vertical)}</span>
            </div>
          </a>
        </li>`;
}

// Turn a Vimeo / YouTube page URL into an embeddable player URL. Returns null for anything else.
export function embedUrl(url) {
  const u = plain(url);
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`;
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1${m[2] ? `&h=${m[2]}` : ""}`;
  return null;
}

export function mediaUrl(value) {
  const v = plain(value);
  if (!v) return "";
  return /^https?:\/\//.test(v) ? v : "/" + v.replace(/^\/+/, "");
}
