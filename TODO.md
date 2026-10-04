# Before launch: placeholders and things to confirm

Every placeholder in the content files is marked `[TODO: ...]`. Search for `[TODO` to find them all. `npm run build` lists every marker that is left, and `npm run build:strict` fails until none remain.

Markers never show on the site itself. They become hidden HTML comments, or are stripped from attributes, so the visible text next to them is what visitors see until you replace it.

## Content you need to provide

| What | Where | Notes |
| --- | --- | --- |
| Showreel loop (MP4, plus WebM if possible) | `public/media/` and `showreel.loopMp4` / `loopWebm` in `content/site.json` | 10 to 20 s, muted, 1920 wide, about 4 to 8 MB. Until set, the hero shows the poster only. |
| Showreel poster frame | `public/media/showreel-poster.jpg` | Replace the placeholder with a real frame from the reel, 1920 x 1080 or larger. Update `posterAlt`. |
| Full reel link | `showreel.fullReelUrl` in `content/site.json` | Vimeo, YouTube or an `.mp4`. The "Watch the full reel" button appears only when this is set. |
| Real projects | `content/projects/` | Two placeholder projects (`sample-project-gaming`, `sample-project-beauty`) show the structure. Replace or delete them. See README, "Adding a project". |
| Owner name and role | `owner` in `content/site.json` | Shown on the homepage and About page. |
| Owner portrait | `public/media/portrait-placeholder.jpg` (or a new file, set `owner.portrait`) | Portrait, about 1000 x 1250. Update `portraitAlt`. |
| Our story | `story` in `content/about.json` | Placeholder written from the brief's copy bank. Rewrite in your own voice. |
| About teaser | `about.text` in `content/home.json` | Two or three sentences in your voice. |
| City | `location.city` in `content/site.json` | Used on the About page and in search data. Leave empty to say "Turkey" only. |
| Instagram, Behance, LinkedIn | `social` in `content/site.json` | Empty links are hidden everywhere. |
| Client logos and testimonials | `content/proof.json` | Only real, approved entries. The section stays hidden while both lists are empty. |

## Promises and assumptions to confirm

| Statement | Where it appears | File |
| --- | --- | --- |
| "We'll reply within a working day" | Homepage closing section, Contact intro, form success message | `content/home.json`, `content/contact.json` |
| Step timeframes: Brief 1 to 2 days, Concept 3 to 5 days, Animation 1 to 3 weeks, Delivery 1 to 2 days | Homepage, How it works | `content/home.json` |
| FAQ: project length (hero visuals 1 to 2 weeks, spots 2 to 4 weeks) | Contact FAQ | `content/contact.json` |
| FAQ: revision rounds and checkpoints | Contact FAQ, About "Set revision rounds" | `content/contact.json`, `content/about.json` |
| FAQ: who supplies the 3D model, and modelling included in the quote | Contact FAQ | `content/contact.json` |
| FAQ: delivery formats (MP4 H.264/H.265, ProRes, PNG/JPG, aspect ratios) | Contact FAQ | `content/contact.json` |
| FAQ: fixed quote per project based on scope | Contact FAQ | `content/contact.json` |
| What happens next (questions or a call, then quote with timeline) | Contact page | `content/contact.json` |
| Budget ranges and currency (EUR, four bands) | Contact form | `content/contact.json` |
| Privacy note under the form | Contact form | `content/contact.json` |
| Reviews on shared links, calls across time zones | About, Where we are | `content/about.json` |

## Setup to confirm

| Item | File | Notes |
| --- | --- | --- |
| Live domain (`https://3def.studio` assumed) | `url` in `content/site.json` | Used for canonical links, the sitemap, robots.txt and share images. |
| Business email (`hey@3def.studio` assumed) | `email` in `content/site.json` | Shown in the header menu, footer and Contact page. |
| Form endpoint | `form.endpoint` in `content/site.json` | Until set, "Send brief" opens the visitor's email app with the brief filled in. See README, "Connecting the form". |

## Logo note

Your logo files include the tagline "Elevating Brands with 3D Magic". At header size (40px tall) the tagline is too small to read. If you have a version without the tagline (icon plus "3Def Creative" only), add it to `public/brand/` and point the header at it (see README, "Logo files").
