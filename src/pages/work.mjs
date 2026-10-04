import { esc, text, attr, plain, hasContent, paragraphs } from "../lib/html.mjs";
import { picture } from "../lib/images.mjs";
import { icon } from "../lib/icons.mjs";
import { frame, embedUrl } from "../lib/frames.mjs";
import { VERTICALS } from "../lib/content.mjs";
import { closingCta } from "../layout.mjs";

export function renderWork({ work, projects }) {
  const present = VERTICALS.filter((v) => projects.some((p) => p.vertical === v));
  // Filter bar ships hidden; site.js reveals it. Without JavaScript the grid shows everything.
  const filters = present.length > 1
    ? `<div class="filters" role="group" aria-label="Filter by vertical" data-filters hidden>
          <button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>
          ${present.map((v) => `<button class="chip" type="button" data-filter="${v.toLowerCase()}" aria-pressed="false">${v}</button>`).join("\n          ")}
        </div>`
    : "";

  return `
    <div class="wrap work-body">
      <header class="page-head">
        <h1>${text(work.heading)}</h1>
        <p>${text(work.intro)}</p>
      </header>
      ${filters}
      ${projects.length
        ? `<ul class="frames frames-3" role="list" data-grid>
          ${projects.map((p) => frame(p, { sizes: "(min-width: 1440px) 450px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw", headingLevel: 2 })).join("\n")}
        </ul>
        <p class="empty-note" data-empty hidden aria-live="polite">${text(work.empty)}</p>`
        : `<p class="empty-note">${text(work.none)}</p>`}
    </div>`;
}

function lightboxDialog() {
  return `
  <dialog class="lightbox" id="lightbox" aria-label="Image viewer">
    <div class="lightbox-inner">
      <div class="lightbox-bar">
        <span class="slate" data-lightbox-count aria-live="polite"></span>
        <button class="icon-btn" type="button" data-lightbox-close>${icon("close")}<span>Close</span></button>
      </div>
      <div class="lightbox-stage" data-lightbox-stage>
        <img src="" alt="" data-lightbox-img>
      </div>
      <div class="lightbox-nav">
        <button class="icon-btn" type="button" data-lightbox-prev>${icon("prev")}<span>Previous</span></button>
        <button class="icon-btn" type="button" data-lightbox-next>${icon("next")}<span>Next</span></button>
      </div>
    </div>
  </dialog>`;
}

export function renderProject({ site, project: p, prev, next, labels }) {
  const facts = [
    ["Vertical", p.vertical],
    ["Category", p.category],
    ["Year", p.year],
    ["Client", p.client],
  ].filter(([, v]) => hasContent(v));

  let heroMedia;
  if (p.videoUrl) {
    const embed = embedUrl(p.videoUrl);
    heroMedia = embed
      ? `<iframe src="${esc(embed.replace("autoplay=1", "autoplay=0"))}" title="${attr(p.title)} film" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
      : `<video controls playsinline preload="metadata" poster="${p.coverImg?.src || ""}"><source src="${esc(p.videoUrl)}"></video>`;
  } else {
    heroMedia = picture(p.coverImg, { alt: p.coverAlt || `${plain(p.title)}, ${plain(p.category)}`, eager: true, sizes: "(min-width: 1440px) 1392px, 100vw" });
  }

  const rows = [
    [labels.overview, paragraphs(p.overview)],
    [labels.approach, paragraphs(p.approach)],
    [labels.deliverables, p.deliverables.filter(hasContent).length ? `<ul class="deliverables" role="list">${p.deliverables.filter(hasContent).map((d) => `<li>${text(d)}</li>`).join("")}</ul>` : ""],
    [labels.result, paragraphs(p.result)],
  ].filter(([, html]) => html);

  const gallery = p.galleryImgs.length
    ? `
      <section aria-labelledby="gallery-title">
        <h2 class="visually-hidden" id="gallery-title">Gallery</h2>
        <div class="gallery" data-gallery>
          ${p.galleryImgs.map((img, i) => {
            const alt = `${plain(p.title)}, image ${i + 1} of ${p.galleryImgs.length}`;
            return `<figure class="gallery-item"><button type="button" data-lightbox-index="${i}" data-full="${img.largest}" data-alt="${esc(alt)}" aria-label="Open image ${i + 1} of ${p.galleryImgs.length} larger">${picture(img, { alt, sizes: "(min-width: 1440px) 690px, (min-width: 700px) 48vw, 100vw" })}</button></figure>`;
          }).join("\n          ")}
        </div>
      </section>`
    : "";

  const pager = prev && next && prev !== p
    ? `<nav class="pager" aria-label="More projects">
        <a class="prev" href="/work/${prev.slug}"><span class="slate">Previous project</span><span class="pager-title">${text(prev.title)}</span></a>
        <a class="all" href="/work">${text(labels.back)}</a>
        <a class="next" href="/work/${next.slug}"><span class="slate">Next project</span><span class="pager-title">${text(next.title)}</span></a>
      </nav>`
    : `<nav class="pager" aria-label="More projects"><span></span><a class="all" href="/work">${text(labels.back)}</a><span></span></nav>`;

  return {
    main: `
    <article>
      <div class="wrap project-hero"><div class="media">${heroMedia}</div></div>
      <div class="wrap">
        <header class="project-title">
          <h1>${text(p.title)}</h1>
          <dl class="facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${text(v)}</dd>`).join("")}</dl>
        </header>
        <div class="rows">
          ${rows.map(([label, html]) => `<section class="row"><h2>${text(label)}</h2><div class="prose">${html}</div></section>`).join("\n          ")}
        </div>
        ${gallery}
        ${pager}
      </div>
    </article>
    ${closingCta({ heading: labels.ctaHeading, button: site.briefLabel })}`,
    extra: p.galleryImgs.length ? lightboxDialog() : "",
  };
}
