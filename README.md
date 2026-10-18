# Akbope - product design and full-stack portfolio

[Live portfolio](https://akiboupie.vercel.app/) · [Download CV](https://akiboupie.vercel.app/akbope-detailed-cv.pdf)

![Akbope portfolio social card](public/og-image.png)

A fullscreen, text-free 3D алқап (meadow), built with Three.js: large colorful flower beds, butterflies, grass, distant trees, a winding stone path, and an ornamental сандық at the center. Opening the chest moves the camera into an overhead inspection view; the letter, journal, and envelope rest inside its lined interior and can be selected directly. Flower beds are sparse, with roughly 70% fewer blooms. The countryside includes six distinct flower forms, ferns, reeds, wheat, mushrooms, a pond, a stone arch, a cart, full-size two-storey cottages, distant towers and a windmill. Textured hills carry surface-aligned woodland, shrubs, boulders and winding trails; tree roots and grass follow the actual hill height rather than being buried inside it. A playable 3D garden lets visitors plant seeds, fill water at the well or pond, grow flowers, release winged seeds with the mill and catch them. Animated growth, watering, wind and harvest happen directly in the meadow. Garden progress persists locally. The meadow has no visible HUD, inventory bar, movement pad, or utility buttons. Clicking each of the four houses enters a full-screen Three.js room: sliding stone 2048, a six-pair alchemy memory game, a solvable nine-crystal lights puzzle, or a 12-level timing/stacking game. Play directly on the objects, swipe or use arrows for 2048, and tap/Space to stack leather-bound 3D books with gilded covers and layered page edges (20% faster movement). The room's physical door exits and its hourglass restarts (Escape/R also work); scores persist locally. Each room has its own geometry, palette and lighting: a stone forge with fire and tools for 2048; a purple alchemy lab with a bubbling cauldron, stained glass and potion shelves; a midnight observatory with constellations and a moving brass orrery; and a warm library with velvet curtains, a rug and bookcases. Playing surfaces, floors and in-world signs follow each theme, with no parchment panels or screen HUD. Each house has a full-height exit mounted in the rear wall, an interactive rolled biography on the desk, and a wall cabinet containing all nine real portfolio projects. Projects appear as cast metal seals in the forge, liquid-filled bottles in the lab, miniature planets in the observatory, and leather books in the library. Selecting one moves the camera to the actual shelf object and opens its real preview, role, capabilities and project/case-study links; closing restores the game view. Reading an artifact pauses game motion and pending memory reveals without resetting progress. The book tower stands on the left so even a completed tower leaves every portfolio object reachable. The remaining village utilities retain their local writing and timer data. The lantern, mill, bucket, pond and mushrooms retain their physical interactions. The chest adds hand-forged fittings, engraved corners, woven lining, scrolls, coins, an inkpot and feather, plus an interactive compass, key and potion. The overworld is free of overlaid controls; portfolio text appears only inside opened objects. Walk with arrow keys or WASD, drag with two fingers to walk on touchscreens, and drag with one finger or the mouse to look around. Click the chest, press Enter, or tap its wooden body to reveal a personal letter, a project journal, and a contact envelope. The chest uses brown woodgrain, aged brass, a curved parchment letter, a leather-bound book with layered page edges, and a folded wax-sealed envelope. The letter unfolds over the meadow. The book opens its cover and turns through 18 illustrated pages for all nine projects: a two-page spread on desktop, one leaf at a time on mobile, turned by clicking the paper itself or its folded corners, keyboard arrows, or a horizontal swipe. The paper bends as 22 connected 3D surfaces, with aligned printing on both sides and moving shadows; the underlying spread is revealed as it turns. Separate arrow controls are removed. The letter scrolls as one complete sheet, keeping its fold marks attached to the content. Full case-study and live-project links remain available. System reduced-motion settings are respected, and the portfolio remains accessible when WebGL is unavailable.

## Selected work

The journal includes nine projects. Three working products have detailed engineering evidence:

1. **Focus10** - full-stack productivity product with a guest workspace, PostgreSQL integrity constraints, RFC 4180 export and 127 automated tests.
2. **Agylshyn** - bilingual learning system covering 13 books, 937 units or test sections and 21,562 tracked questions.
3. **Mountain** - private multi-format reader with contextual Kazakh translation, vocabulary review, full-text search and device linking.

The journal includes Akanki, JORYQ Travel, MammaMia! Studio and BAGYT Academy, with screenshots, live links and case studies matching the updated PDFs. Travel demos and fictional businesses are labelled explicitly.

DOS Optics is clearly labelled as an independent concept and AIELTS as an experimental responsible-AI product.

## Portfolio structure

```text
src/main.jsx       routing, homepage sections and case-study components
src/projects.js    project evidence, metrics, links and offer definitions
src/additionalProjects.js  newer project case studies from the updated PDFs
src/styles.css     base responsive layouts
src/Meadow.jsx     meadow controls, paper letter, project journal and contact
src/meadowScene.js Three.js scenery, chest, movement, picking and animation
src/meadowDetails.js instanced plants, countryside props and interactive keepsakes
src/HouseGame.jsx  full-screen 3D house-game lifecycle and accessible controls
src/houseGameScene.js medieval room, object picking and four animated minigames
src/RoomArtifact.jsx rolled biography and themed project detail dialogs
src/houseArtifacts.js wall-mounted door, biography scroll and nine themed project objects
src/houseRooms.js  four distinct room designs, palettes, lighting and animated decor
src/houseGameRules.js pure 2048, crystal and tower rules
src/MeadowGarden.js persistent 3D planting, watering, growth, wind and harvesting game
src/meadow.css     responsive meadow and game controls
src/VillageTools.jsx useful village rooms and persistent session state
src/villageState.js validated local save data, local dates and focus deadlines
src/village.css    parchment room layouts and utility controls
src/TreasureBook.jsx illustrated book, keyboard/swipe navigation and page turns
src/treasures.css  parchment, leather binding, unfolding and turning animations
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
npm install
npm run dev
```

Production checks:

```bash
npm run check
npm run build
```

Vercel uses `npm run build`, publishes `dist`, and applies the client-side route rewrite in `vercel.json`.

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
