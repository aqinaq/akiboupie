# akbope portfolio

An editorial portfolio for a product-minded full-stack developer and designer. Built with React and Vite, with reusable project data in `src/projects.js` and no UI framework.

## Local setup

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, then preview it with `npm run preview`.

## Content edits

- Edit all project and case-study copy in `src/projects.js`.
- Replace the profile-image placeholder in `src/main.jsx`.
- Add real résumé, GitHub and email links where marked.
- Replace `example.com` in `public/sitemap.xml` and `public/robots.txt` after choosing a production domain.
- Update the canonical/social URL and use a PNG social card if the deployment platform does not accept SVG previews.

## Deploying to Vercel

Import the repository, keep the detected Vite settings, and deploy. The build command is `npm run build`; output is `dist`. Configure a rewrite to `index.html` for the client-side case-study routes (Vercel uses `vercel.json` in this project).

## Pre-launch checklist

- [ ] Add confirmed GitHub, résumé and email URLs.
- [ ] Replace the profile placeholder with an owned image and useful alt text.
- [ ] Replace `example.com` in sitemap and robots files.
- [ ] Check every external URL in production.
- [ ] Test at 360 px, 768 px, 1024 px and a wide desktop viewport.
- [ ] Check keyboard order, mobile menu, focus states and theme control.
- [ ] Run Lighthouse accessibility and performance audits.
- [ ] Verify reduced-motion mode and dark/light color contrast.
- [ ] Confirm metadata and social sharing preview.
- [ ] Confirm DOS Optics remains labelled as an independent concept.
- [ ] Confirm AIELTS uses “estimated practice band.”
- [ ] Confirm OFF//RECORD remains labelled fictional.
- [ ] Replace code-native previews with owned product screenshots if desired.

No analytics, secrets, testimonials or unverified performance claims are included.
