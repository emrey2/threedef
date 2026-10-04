import { text, plain, paragraphs } from "../lib/html.mjs";
import { picture } from "../lib/images.mjs";
import { VERTICALS } from "../lib/content.mjs";
import { closingCta } from "../layout.mjs";

export function renderAbout({ site, about, media }) {
  const city = site.location.city;
  const cityName = plain(city);
  // "{city}, Turkey" becomes "Istanbul, Turkey", or just "Turkey" until a city is set.
  const locationText = about.location.text.replace("{city}, Turkey", cityName ? `${cityName}, Turkey` : "Turkey");
  const cityMarker = (String(city).match(/\[TODO:[^\]]*\]/) || [""])[0];

  const row = (id, heading, body) => `
        <section class="row" aria-labelledby="${id}">
          <h2 id="${id}">${text(heading)}</h2>
          <div class="prose">${body}</div>
        </section>`;

  return `
    <div class="wrap">
      <header class="page-head about-head">
        <h1>${text(about.heading)}</h1>
      </header>
      <div class="rows">
        ${row("story-title", about.story.heading, `
          <div class="story">
            <div class="prose">${paragraphs(about.story.paragraphs)}</div>
            <figure>
              <div class="portrait">${picture(media.portrait, { alt: plain(site.owner.portraitAlt), sizes: "(min-width: 1024px) 288px, 280px" })}</div>
              <figcaption class="slate"><strong>${text(site.owner.name)}</strong>${text(site.owner.role)}</figcaption>
            </figure>
          </div>`)}
        ${row("focus-title", about.focus.heading, paragraphs(about.focus.paragraphs))}
        ${row("make-title", about.offerings.heading, `
          <ul class="offer-list" role="list">
            ${about.offerings.items.map((o) => `<li><h3>${text(o.title)}</h3><p>${text(o.text)}</p><p class="slate">Typical use: ${text(o.use)}</p></li>`).join("\n            ")}
          </ul>`)}
        ${row("work-title", about.principles.heading, `
          <ul class="principles" role="list">
            ${about.principles.items.map((p) => `<li><h3>${text(p.title)}</h3><p>${text(p.text)}</p></li>`).join("\n            ")}
          </ul>`)}
        ${row("clients-title", about.clients.heading, `
          ${paragraphs(about.clients.paragraphs)}
          <ul class="verticals" role="list" aria-label="Verticals">${VERTICALS.map((v) => `<li>${v}</li>`).join("")}</ul>`)}
        ${row("where-title", about.location.heading, `<p>${text(locationText + cityMarker)}</p>`)}
      </div>
    </div>
    ${closingCta({ heading: about.cta.heading, text: about.cta.text, button: site.briefLabel })}`;
}
