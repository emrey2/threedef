# 3Def Creative: design plan

## Stage and color

The site is a dark navy stage, taken straight from the logo. Product renders (glossy beauty packaging, RGB gaming peripherals, fabric, glass) read best against a deep, low-saturation backdrop, the same way they would on a dark seamless in a studio. The navy also continues the showreel hero without a hard jump to white. There is one theme, deliberately: the stage doesn't change.

| Token | Hex | Source | Role |
| --- | --- | --- | --- |
| `--stage` | `#0F212D` | logo navy | Page background |
| `--stage-raised` | `#152B39` | navy, lifted | Inputs, image frames before load, modal backdrop |
| `--ink` | `#EBE7D8` | logo wordmark cream | Headings and body text (13.3:1 on stage) |
| `--ink-muted` | `#A8B1B4` | neutral from navy + cream | Secondary text, metadata (7.5:1) |
| `--line` | `#2A4152` | navy, lifted | Hairlines between groups (decorative only) |
| `--action` | `#FFF5CF` | logo icon yellow | Buttons, focus ring, current page marker. Used only on things you can act on |

Form borders use `#5F7383` (3:1 non-text contrast). Errors use `#FF9B8A` (8:1).

## Type

- **Montserrat** (variable): headings, navigation, buttons and body. It is the logo's typeface, so the wordmark and the site speak with one voice. Body set at 17px / 1.65, measure capped at 68ch.
- **Geist Mono**: production facts only (vertical, product category, year, duration, format, step timeframes). This is the "slate": it labels the work like a clapperboard does, and never decorates.

Scale (1.25 ratio, fluid at the top end): 14 / 17 / 21 / 26 / 33 / 41 / 52 / 64 px.

No tracked all-caps labels above headings, no single accent-colored word in headlines, no arrows appended to links.

## Wireframes

Homepage

```
+--------------------------------------------------------------+
| [logo]                       Work  About Us  [Send a brief]  |  header floats over video
|                                                              |
|                    showreel video, full bleed                |
|                    (poster if no video / reduced motion)     |
|                                                              |
| .:::::::::::::::::::::::::.                                  |
| Products that move, sell.  :  soft gradient only behind      |
| 3Def Creative is a product :  the text block                 |
| animation studio in ...    :                                 |
| [See our work] [Send a brief]  ( ) Watch the full reel       |
+--------------------------------------------------------------+
| Selected work                                   View all work|
| +------------------------------+ +-------------------------+ |
| |        frame 16:10           | |       frame 16:10       | |
| +------------------------------+ +-------------------------+ |
| Title              Beauty        Title             Gaming    |  mono slate line
| (2-col contact sheet, 4 to 6 frames)                         |
+--------------------------------------------------------------+
| What we do                                                   |
| Hero visuals        | Short product spots | Launch films     |  three columns of text,
| two sentences       | two sentences       | two sentences    |  no boxes
| Products only. No VFX, no characters. That focus is why ...  |
+--------------------------------------------------------------+
| (Proof: client logos / one testimonial, only if data exists) |
+--------------------------------------------------------------+
| How it works                                                 |
| Brief ------ Concept ------ Animation ------ Delivery        |  one timeline rule
| 1-2 days     3-5 days       1-3 weeks        1-2 days        |  mono
| sentence     sentence       sentence         sentence        |
+--------------------------------------------------------------+
| [portrait]   Two or three sentences in the owner's voice.    |
|              About us                                        |
+--------------------------------------------------------------+
| Have a product to launch?                                    |
| Send us your brief and we'll reply within a working day.     |
| [Send a brief]                                               |
+--------------------------------------------------------------+
| [logo]  email  Instagram Behance LinkedIn                    |
| Based in Turkey. Working worldwide.        (c) 3Def Creative |
+--------------------------------------------------------------+
```

Work page

```
| Work                                                         |
| Product animation and CGI for gaming, beauty, wellness ...   |
| (All) (Gaming) (Beauty) (Wellness) (Fashion)   JS only       |
| +-----------+ +-----------+ +-----------+                    |
| |  frame    | |  frame    | |  frame    |  contact sheet:    |
| +-----------+ +-----------+ +-----------+  equal frames,     |
| Title  Beauty  Title Gaming  Title Fashion tight gutters,    |
| +-----------+ +-----------+ +-----------+  hover plays the   |
| |  frame    | |  frame    | |  frame    |  preview clip      |
```

Project page

```
| +----------------------------------------------------------+ |
| |            hero image or video, wide frame               | |
| +----------------------------------------------------------+ |
| Project title                        Vertical    Beauty      |
|                                      Category    Serum       |
|                                      Year        2026        |
|                                      Client      (if given)  |
| Overview      paragraph                                      |
| Our approach  paragraph                                      |
| Deliverables  1 x 15s 9:16 Reel, 6 stills                    |
| Result        (only if provided)                             |
| +---------+ +-------------------+ +---------+                |
| | gallery | |  mixed sizes,     | |         |  click: lightbox|
| +---------+ |  masonry columns  | +---------+                |
| <- Previous project   Back to all work   Next project ->     |
| Have a product like this? Send us a brief.  [Send a brief]   |
```

## What makes it this studio's site

1. **The product is the only color.** Navy stage, cream type, no gradients or decorative imagery. Every picture on the site is the work.
2. **Frames, not cards.** Work tiles are bare frames with a mono slate line under them, laid out like a contact sheet. No rounded boxes, no shadows. Corners are 2px everywhere.
3. **The slate.** Geist Mono carries production facts (vertical, year, format, timeframe), the way a clapperboard labels a take.
4. **One moving thing at a time.** The showreel is the only autoplaying motion. Everything else moves only when the visitor does something (hover preview, lightbox, accordion, menu).
5. **Yellow means act.** The logo's icon yellow appears only on buttons, focus rings and the current-page marker.

## Review against the brief

- Removed from my first draft: a "selected clients" strip (no real data), numbered section labels, and a bento grid on the homepage. All three read as template.
- Proof section, client name, result section, social links and the full-reel button render only when their data exists.
- Copy comes from the brief's copy bank. Nothing about clients, results or awards is invented.
