import { esc, text, attr, plain, hasContent } from "./lib/html.mjs";
import { icon } from "./lib/icons.mjs";

// Logo files live in public/brand. The build derives these sizes from them:
//   /brand/generated/logo-cream-{320,640}.webp  default header, menu, footer
//   /brand/generated/logo-white-{320,640}.webp  header over the showreel (homepage)
//   /brand/generated/logo-black-640.png         print stylesheet
const LOGO_W = 320;
const LOGO_H = 82;

function logoImg(variant, className, alt) {
  return `<img class="${className}" src="/brand/generated/logo-${variant}-320.webp" srcset="/brand/generated/logo-${variant}-320.webp 320w, /brand/generated/logo-${variant}-640.webp 640w" sizes="160px" width="${LOGO_W}" height="${LOGO_H}" alt="${alt}">`;
}

export const SOCIAL_LABELS = { instagram: "Instagram", behance: "Behance", linkedin: "LinkedIn" };

export function socialLinks(site) {
  return Object.entries(SOCIAL_LABELS)
    .filter(([key]) => hasContent(site.social?.[key]))
    .map(([key, label]) => ({ label, href: plain(site.social[key]) }));
}

export function absUrl(site, path) {
  return plain(site.url).replace(/\/$/, "") + path;
}

function navItems(site, current) {
  const links = site.nav
    .map((item) => `<li><a href="${item.href}"${current === item.href ? ' aria-current="page"' : ""}>${text(item.label)}</a></li>`)
    .join("");
  const brief = `<li><a class="btn btn-action" href="/contact"${current === "/contact" ? ' aria-current="page"' : ""}>${text(site.briefLabel)}</a></li>`;
  return links + brief;
}

function organizationLd(site) {
  const city = plain(site.location.city);
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: plain(site.name),
    url: absUrl(site, "/"),
    logo: absUrl(site, "/brand/generated/favicon-512.png"),
    description: plain(site.description),
    email: plain(site.email),
    address: { "@type": "PostalAddress", addressCountry: "TR", ...(city ? { addressLocality: city } : {}) },
    areaServed: "Worldwide",
    knowsAbout: ["Product animation", "CGI product visuals", "3D product rendering"],
  };
  const sameAs = socialLinks(site).map((s) => s.href);
  if (sameAs.length) data.sameAs = sameAs;
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function layout({ site, page, main, assets, extra = "" }) {
  const current = page.nav ?? page.path;
  const title = plain(page.title);
  const description = plain(page.description);
  const canonical = absUrl(site, page.path);
  const shareImage = page.image ? absUrl(site, page.image) : absUrl(site, "/brand/generated/share-default.jpg");
  const shareAlt = plain(page.imageAlt || `${plain(site.name)} logo`);
  const socials = socialLinks(site);
  const year = new Date().getFullYear();

  const header = `
  <header class="site-header${page.overVideo ? " over-video" : ""}" data-header>
    <div class="wrap header-inner">
      <a class="logo" href="/"${page.path === "/" ? ' aria-current="page"' : ""}>
        ${logoImg("cream", "logo-default", `${esc(plain(site.name))}, home`)}
        ${page.overVideo ? logoImg("white", "logo-over-video", `${esc(plain(site.name))}, home`) : ""}
        <img class="logo-print" src="/brand/generated/logo-black-640.png" width="640" height="164" alt="">
      </a>
      <nav aria-label="Main">
        <ul class="nav-links" role="list">${navItems(site, current)}</ul>
      </nav>
      <button class="menu-toggle" type="button" aria-haspopup="dialog" aria-controls="site-menu" data-menu-open>
        ${icon("menu")}<span>Menu</span>
      </button>
    </div>
  </header>

  <dialog class="menu" id="site-menu" aria-label="Menu">
    <div class="wrap menu-inner">
      <div class="menu-top">
        <a class="logo" href="/">${logoImg("cream", "logo-default", `${esc(plain(site.name))}, home`)}</a>
        <button class="icon-btn" type="button" data-menu-close>${icon("close")}<span>Close</span></button>
      </div>
      <nav aria-label="Main (mobile)">
        <ul class="menu-links" role="list">${navItems(site, current)}</ul>
      </nav>
      <div class="menu-foot">
        <a class="footer-email" href="mailto:${attr(site.email)}">${text(site.email)}</a>
        <p class="muted">${text(site.location.footerLine)}</p>
      </div>
    </div>
  </dialog>`;

  const footer = `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="logo footer-logo" href="/">${logoImg("cream", "", `${esc(plain(site.name))}, home`).replace('sizes="160px"', 'sizes="210px"')}</a>
        </div>
        <div>
          <a class="footer-email" href="mailto:${attr(site.email)}">${text(site.email)}</a>
          <p class="muted">${text(site.location.footerLine)}</p>
        </div>
        ${socials.length ? `<ul class="link-list" role="list" aria-label="Social">${socials.map((s) => `<li><a href="${esc(s.href)}" rel="noopener" target="_blank">${s.label}</a></li>`).join("")}</ul>` : "<div></div>"}
      </div>
      <div class="footer-base">
        <span>&copy; ${year} ${text(site.name)}. All rights reserved.</span>
        <a href="/contact">${text(site.briefLabel)}</a>
      </div>
    </div>
  </footer>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  ${page.noindex ? '<meta name="robots" content="noindex">' : ""}
  <meta name="theme-color" content="#0f212d">
  <meta property="og:type" content="${page.ogType || "website"}">
  <meta property="og:site_name" content="${attr(site.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${shareImage}">
  <meta property="og:image:alt" content="${esc(shareAlt)}">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${shareImage}">
  <link rel="icon" href="/brand/generated/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/brand/generated/favicon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/brand/generated/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  ${page.preload || ""}
  <link rel="stylesheet" href="${assets.css}">
  <script>document.documentElement.classList.add("js")</script>
  <script type="application/ld+json">${organizationLd(site)}</script>
  ${page.jsonld ? `<script type="application/ld+json">${page.jsonld}</script>` : ""}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${header}
  <main id="main"${page.overVideo ? "" : ' tabindex="-1"'}>
${main}
  </main>
${footer}
${extra}
  <script src="${assets.js}" defer></script>
</body>
</html>
`;
}

// Closing call to action, shared by several pages.
export function closingCta({ heading, text: body, button, headingTag = "h2" }) {
  return `
    <section class="section closing" aria-labelledby="closing-title">
      <div class="wrap">
        <${headingTag} id="closing-title">${text(heading)}</${headingTag}>
        ${hasContent(body) ? `<p>${text(body)}</p>` : ""}
        <a class="btn btn-action" href="/contact">${text(button)}</a>
      </div>
    </section>`;
}
