# Akbope — three creative worlds

The local homepage is now a dim, text-free Three.js entrance with a plain charcoal wall and floor. Three soft ceiling downlights reveal the door relief, hardware and floor shadows. The previous bright hall, columns, lamps, headings, labels, footer and language controls have been removed. Doors are modelled from the supplied references in `src/doorModels.js`: an ivory rococo double door for graphic design, a pink Art Nouveau stained-glass door for vibe coding, and a three-panel wood door for visual/motion. Joinery, relief, glass leading and hardware are meshes; both ivory leaves open independently. The first click opens the selected door without moving the camera; the second click on its open leaf or glowing opening starts a 1.45-second glide at constant eye height. Choosing another door closes the previous one. Opaque pale lavender, pink and yellow portals hide the destinations until entry. Keyboard users can tab to the three named door controls.

- **Graphic design:** a classical 3D gallery with columns, ceiling coffers, chandeliers, artwork frames and captions. Drag to look around, use WASD/arrows to walk, or use the numbered artwork shortcuts. The collection view also exposes the work without navigating the 3D room.
- **Vibe coding:** the existing fantasy meadow and all project case studies. The opening door is filled with opaque pale pink light; the destination appears only after entering. A selectable return portal remains behind the arrival point; “Артқа қарау · портал” turns the view toward it.
- **Visual / Motion:** an unfinished experimental room entered with a second click, through pale yellow light. The collection supports videos, images and downloadable files.

## Preserved portfolio

`archive/vibecoding-2026-11-06/` contains the complete pre-redesign working snapshot: source, public assets, evidence, PDFs, builders, tests, manifests and the original README. No existing project evidence or PDF was removed. Dependencies, generated builds and temporary captures are excluded.

## Lobby decor

`src/lobbyDecor.js` adds an upright 3D skateboard, three taped paper posters, a half-rolled floor poster and five stacked books. Original owner-supplied `igor.png`, `lana.png`, `91.png` and `blond.png` are copied unchanged to `public/decor/` and mapped in `src/lobbyDecorAssets.js`. The curled paper uses continuous UVs and an unprinted reverse side. Poster loading triggers a fresh render of the otherwise still lobby.

Run `node --test scripts/lobbyDecor.test.mjs` to check original asset preservation, upright skateboard geometry, the paper curl and doorway clearance.

## Add work

Put graphic-design assets in `public/graphic-design/` and register them in `src/collections.js` (`graphicWorks`). Empty frames are explicitly labelled as awaiting real work. Put motion assets in `public/motion/` and register them in `motionWorks` with `type: 'video'`, `'image'` or `'file'`. The current room is a sketch awaiting the owner's art direction and files.

## Preview

```sh
npm run dev
```

Room URLs: `/?room=lobby`, `/?room=gallery`, `/?room=world`, `/?room=motion`. Browser Back/Forward and existing language URLs are preserved; language selectors are removed. New scene code is in `src/Portfolio.jsx`, `src/portfolioScene.js`, `src/doorModels.js` and `src/portfolio.css`.

Validation: production build passes. Existing tests: 10 pass; `studio.test.mjs` has a pre-existing statue-anchor coordinate mismatch, reproduced against the archived snapshot. A local geometry smoke check also verifies all three room scenes, camera bounds, door raycasting and transition completion. The redesigned entrance has been visually checked in desktop Chrome. Full mobile browser QA remains outstanding. `node --test scripts/doorModels.test.mjs` checks selectable door geometry, hinge directions and the absence of decorative lights.

---

# Akbope - product design and full-stack portfolio

[Live portfolio](https://akiboupie.vercel.app/) · [Download CV](https://akiboupie.vercel.app/akbope-detailed-cv.pdf)

![Akbope portfolio social card](public/og-image.png)

A fullscreen, interactive 3D fantasy meadow, built with Three.js. The landscape combines a painted sky, textured hills, woodland and a decorative village. All geometry is authored locally, with textures served from `public/world/`. The chest and portfolio objects remain interactive. The initial view frames the project cottage, winged statue and front-facing chest at a similar depth. Selecting the statue’s violet stone opens the About biography as a purple hologram, with its beam anchored to the stone; the About shortcut opens the same projection.

The meadow includes: large colorful flower beds, butterflies, grass, distant trees, a winding stone path, and an ornamental сандық at the center. Opening the chest moves the camera into an overhead inspection view; the letter and envelope rest inside its lined interior and can be selected directly. Flower beds are sparse, with roughly 70% fewer blooms. The countryside includes six distinct flower forms, ferns, reeds, wheat, mushrooms, a pond, a stone arch, a cart, full-size two-storey cottages, distant towers and a windmill. Textured hills carry surface-aligned woodland, shrubs, boulders and winding trails; tree roots and grass follow the actual hill height rather than being buried inside it. The nearest cottage is a project studio, reached by a stepping-stone path from the chest clearing. Its sign and open journal launch the project gallery; the statue projects the biography, and the chest holds the letter, contact details and keepsakes. Projects, About and Contact shortcuts remain visible on desktop and mobile. Other village buildings remain decorative.

## Selected work

The journal includes nine projects. Three working products have detailed engineering evidence:

1. **Focus10** - full-stack productivity product with a guest workspace, PostgreSQL integrity constraints, RFC 4180 export and 127 automated tests.
2. **Agylshyn** - bilingual learning system covering 13 books, 937 units or test sections and 21,562 tracked questions.
3. **Mountain** - private multi-format reader with contextual Kazakh translation, vocabulary review, full-text search and device linking.

The journal includes Akanki, JORYQ Travel, MammaMia! Studio and BAGYT Academy, with screenshots, live links and case studies matching the updated PDFs. Travel demos and fictional businesses are labelled explicitly.

DOS Optics is clearly labelled as an independent concept and AIELTS as an experimental responsible-AI product.

## Portfolio structure

```text
src/main.jsx       routing, lazy meadow entry and case-study components
src/projects.js    project evidence, metrics, links and offer definitions
src/additionalProjects.js  newer project case studies from the updated PDFs
src/styles.css     base responsive layouts
src/Meadow.jsx     meadow controls, paper letter, project journal and contact
src/meadowScene.js Three.js scenery, chest, movement, picking and animation
src/genshinWorld.js landscape, terrain, woodland and texture loading
src/genshinVillage.js decorative village buildings and props
src/meadowFlowers.js instanced flowers, picking and pooled dust particles
src/meadowDetails.js chest details and interactive keepsakes
src/meadow.css     responsive meadow and portfolio controls
src/TreasureBook.jsx project holograms with keyboard/swipe navigation
src/hologram.css   project hologram styling
src/treasures.css  paper artifacts and opening animations
public/textures/  locally authored paper surface
src/studio.css     shared case-study styling
public/projects/   primary project covers
public/evidence/   authentic product screens used in case studies
scripts/           reproducible portfolio and CV PDF builders
output/pdf/        generated PDF deliverables
```

Each case study follows the same evidence-oriented sequence: challenge, responsibility, constraints, key decisions, annotated screens, system flow, validation, outcome and reflection. Claims are limited to shipped capabilities, audited content and documented tests; the site does not invent customer metrics or testimonials.

## Local setup

```bash
npm ci
npm run dev
```

Production checks:

```bash
npm run check
npm test
npm run build
```

Vercel uses `npm run build`, publishes `dist`, and applies the client-side route rewrite in `vercel.json`.

The meadow UI and Three.js scene load on demand, so case-study pages skip the meadow JavaScript. Shared styles remain in their original order to keep typography consistent. Temporary captures belong in ignored `tmp/`; Python bytecode, dependencies and production builds are also ignored. Keep the final PDFs in `output/pdf/` and published downloads in `public/`.

## Content and asset updates

- Edit case-study copy, evidence and links in `src/projects.js`.
- Keep authentic screenshots in `public/evidence/` and include explicit dimensions in markup.
- Update both `public/og-image.svg` and its 1200x630 rendered `public/og-image.png` when positioning changes.
- Rebuild `output/pdf/akbope-portfolio.pdf` with `scripts/build_portfolio_pdf.py` after material portfolio edits.
- The same builder writes the landscape `akbope-product-fullstack-portfolio.pdf` and one-page `akbope-resume.pdf`; verified project screens live in `public/evidence/`.
- Keep working products, independent concepts and experimental products explicitly labelled.

## Remaining owner-supplied items

- Add a confirmed professional email to the contact section and structured data.
- Add real testimonials only after receiving permission from a client or collaborator.
- Add 45-60 second walkthrough videos for Focus10 and Agylshyn when recordings are available.

No analytics, secrets, fabricated testimonials or unverified business results are included.

## Font credit

MedievalSharp by Wojciech Kalinowski is self-hosted from the [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/medievalsharp) under the SIL Open Font License. The license is included at `public/fonts/MedievalSharp-OFL.txt`.

## Languages and typography

The website defaults to Kazakh and supports English via the KK / EN control, including portfolio case studies, accessible controls and text drawn in the 3D scenes. Language is saved under `akbope-language`; `?lang=kk` and `?lang=en` override it for shareable links. Changing language reloads the scene and preserves the open panel; portfolio content stays accessible in either language. Project screenshots and downloaded CV files retain their source language. System sans-serif fonts support Kazakh and Latin without remote font requests.

Run `node --test scripts/i18n.test.mjs` for locale, project-coverage and persistence checks.

The meadow flowers use six sculpted bloom styles with stems and rounded leaves. Click or tap a flower head to release dust in its petal color. Flower picking respects nearer interactive objects, uses a fixed 384-particle pool, and reduces the burst to a stationary fade when reduced motion is enabled. Run `node --test scripts/meadowFlowers.test.mjs` to check picking, color matching, particle limits and fading.
