import { esc, text, attr, plain, hasContent } from "../lib/html.mjs";
import { picture } from "../lib/images.mjs";
import { icon } from "../lib/icons.mjs";
import { frame, embedUrl, mediaUrl } from "../lib/frames.mjs";
import { closingCta } from "../layout.mjs";

export function reelDialog(site) {
  const url = plain(site.showreel.fullReelUrl);
  if (!url) return "";
  const embed = embedUrl(url);
  const player = embed
    ? `<iframe data-src="${esc(embed)}" title="${attr(site.name)} showreel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
    : `<video data-src="${esc(mediaUrl(url))}" controls playsinline preload="none"></video>`;
  return `
  <dialog class="reel" id="reel" aria-label="Showreel">
    <div class="reel-inner">
      <div class="lightbox-bar">
        <span class="slate">Showreel</span>
        <button class="icon-btn" type="button" data-reel-close>${icon("close")}<span>Close</span></button>
      </div>
      <div class="reel-stage"><div class="reel-frame">${player}</div></div>
    </div>
  </dialog>`;
}

export function renderHome({ site, home, proof, projects, media }) {
  const reel = site.showreel;
  const loopMp4 = mediaUrl(reel.loopMp4);
  const loopWebm = mediaUrl(reel.loopWebm);
  const hasVideo = Boolean(loopMp4 || loopWebm);
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const clients = (proof.clients || []).filter((c) => hasContent(c.name));
  const testimonial = (proof.testimonials || []).find((t) => hasContent(t.quote) && hasContent(t.name));

  const hero = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-media">
        ${picture(media.poster, { alt: plain(reel.posterAlt), eager: true, sizes: "100vw" })}
        ${hasVideo ? `<video muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1" poster="${media.poster.src}" data-hero-video>
          ${loopWebm ? `<source src="${esc(loopWebm)}" type="video/webm">` : ""}
          ${loopMp4 ? `<source src="${esc(loopMp4)}" type="video/mp4">` : ""}
        </video>` : ""}
      </div>
      <div class="hero-copy-wrap">
        <div class="wrap">
          <div class="hero-copy">
            <h1 id="hero-title">${text(home.hero.headline)}</h1>
            <p class="hero-sub">${text(home.hero.subline)}</p>
            <div class="hero-actions">
              <a class="btn btn-action" href="/work">${text(home.hero.primary)}</a>
              <a class="btn btn-quiet" href="/contact">${text(site.briefLabel)}</a>
              ${plain(reel.fullReelUrl) ? `<button class="text-btn" type="button" data-reel-open aria-controls="reel">${icon("play")}${text(home.hero.reelLabel)}</button>` : ""}
            </div>
          </div>
        </div>
      </div>
    </section>`;

  const work = featured.length
    ? `
    <section class="section" aria-labelledby="work-title">
      <div class="wrap">
        <div class="section-head">
          <h2 class="h2" id="work-title">${text(home.work.heading)}</h2>
          <a href="/work">${text(home.work.link)}</a>
        </div>
        <ul class="frames" role="list">
          ${featured.map((p) => frame(p, { sizes: "(min-width: 1440px) 680px, (min-width: 640px) 48vw, 100vw" })).join("\n")}
        </ul>
      </div>
    </section>`
    : "";

  const offerings = `
    <section class="section" aria-labelledby="offer-title">
      <div class="wrap">
        <div class="section-head"><h2 class="h2" id="offer-title">${text(home.offerings.heading)}</h2></div>
        <ul class="offerings" role="list">
          ${home.offerings.items.map((o) => `<li><h3>${text(o.title)}</h3><p>${text(o.text)}</p></li>`).join("\n")}
        </ul>
        <p class="focus-line">${text(home.offerings.focusLine)}</p>
      </div>
    </section>`;

  // Proof: rendered only when real entries exist.
  const proofSection = clients.length || testimonial
    ? `
    <section class="section" aria-labelledby="proof-title">
      <div class="wrap">
        ${clients.length ? `<h2 class="h3" id="proof-title">${text(home.proof.clientsHeading)}</h2>
        <ul class="clients" role="list">
          ${clients.map((c) => {
            const img = c.logo ? `<img src="${esc(mediaUrl(c.logo))}" alt="${attr(c.name)}" height="36" loading="lazy">` : `<span>${text(c.name)}</span>`;
            return `<li>${c.url ? `<a href="${esc(plain(c.url))}" rel="noopener" target="_blank">${img}</a>` : img}</li>`;
          }).join("")}
        </ul>` : `<h2 class="visually-hidden" id="proof-title">What clients say</h2>`}
        ${testimonial ? `<figure class="testimonial">
          <blockquote><p>“${text(testimonial.quote)}”</p></blockquote>
          <figcaption class="slate">${text(testimonial.name)}${hasContent(testimonial.role) ? `, ${text(testimonial.role)}` : ""}${hasContent(testimonial.company) ? `, ${text(testimonial.company)}` : ""}</figcaption>
        </figure>` : ""}
      </div>
    </section>`
    : "";

  const process = `
    <section class="section" aria-labelledby="process-title">
      <div class="wrap">
        <div class="section-head"><h2 class="h2" id="process-title">${text(home.process.heading)}</h2></div>
        <ol class="process" role="list">
          ${home.process.steps.map((s) => `<li><span class="slate">${text(s.time)}</span><h3>${text(s.title)}</h3><p>${text(s.text)}</p></li>`).join("\n")}
        </ol>
      </div>
    </section>`;

  const about = `
    <section class="section" aria-labelledby="teaser-title">
      <div class="wrap teaser">
        <div class="portrait">${picture(media.portrait, { alt: plain(site.owner.portraitAlt), sizes: "(min-width: 760px) 360px, 280px" })}</div>
        <div class="stack">
          <h2 class="h3" id="teaser-title">${text(home.about.heading)}</h2>
          <p class="teaser-text">${text(home.about.text)}</p>
          <p class="slate">${text(site.owner.name)}, ${text(site.owner.role)}</p>
          <p><a href="/about">${text(home.about.link)}</a></p>
        </div>
      </div>
    </section>`;

  return hero + work + offerings + proofSection + process + about +
    closingCta({ heading: home.cta.heading, text: home.cta.text, button: site.briefLabel });
}
