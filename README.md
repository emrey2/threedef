# 3def studio website

Static, multi-page site for 3def studio. Plain HTML, CSS and JavaScript with no build step. Fonts, icons and three.js are stored in the repo, so the site doesn't load anything from third-party CDNs.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: live 3D hero, selected work, services, process, call to action |
| `work.html` | Portfolio grid with category filters |
| `services.html` | The four services in detail, plus FAQ |
| `about.html` | Studio statement, working principles, tools |
| `contact.html` | Project brief form (opens the visitor's email app, addressed to hey@3def.studio) |
| `404.html` | Not-found page |

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Use a local server rather than opening the files directly, because the 3D hero loads as an ES module.

## Before going live

1. **Replace the placeholder images.** Every `<img>` that points to `picsum.photos` is a stand-in. Put your renders in `assets/img/` and update the `src`, `width`, `height` and `alt` attributes.
2. **Replace the sample projects** in `work.html` and the four tiles under "Selected work" in `index.html` with real projects.
3. **Check the copy**, especially the FAQ in `services.html` and the about text, so it matches how you actually work.
4. Add social links in the footer of each page (search for `Add social links`).

## Editing

- Colors, spacing and fonts are CSS variables at the top of `assets/css/styles.css`. Change `--accent` to recolor the whole site (the 3D sphere picks it up too).
- The header and footer are repeated in each HTML file. If you change one, change them all.
- The hero scene is in `assets/js/hero3d.js`. If WebGL is unavailable, the scene doesn't load and the hero shows the fallback image instead. Motion stops when the visitor has reduced motion turned on.

## Deploying

Any static host works, for example:

- **GitHub Pages:** Settings → Pages → deploy from branch, root folder.
- **Netlify / Cloudflare Pages / Vercel:** connect the repo; no build command, publish directory is the repo root.

## Third-party assets

- [three.js](https://threejs.org) r169 (MIT): `assets/vendor/three/`
- [Phosphor Icons](https://phosphoricons.com) (MIT): `assets/vendor/phosphor/`
- [Geist](https://vercel.com/font) and Geist Mono (SIL OFL): `assets/fonts/`
