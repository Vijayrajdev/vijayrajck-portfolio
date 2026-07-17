# Vijay Raj C K — Portfolio

Space-themed 3D portfolio for a Senior Data Engineer, built with React, Three.js
(@react-three/fiber + drei), and Tailwind CSS v4. Installable as a PWA.

**Live:** https://vijayrajck.vercel.app

## Highlights

- **Deep-space WebGL background** — instanced particle pipeline network, starfield,
  comets, and the actual BigQuery / Vertex AI / Terraform logos extruded into 3D
  (hover to swell + label, click for a shockwave burst with a sparkle sound).
- **Live 3D data pipeline** in the hero — Sources → Pub/Sub → Composer → BigQuery
  → Looker with a dbt loop, event particles flowing through glowing tubes.
  Drag to orbit.
- **Two WebGL contexts total** — one background canvas plus one shared overlay
  canvas that renders the pipeline and all project stages as scissored drei
  `<View>`s (avoids browser context-loss with many canvases).
- **Storytelling structure** — sections as chapters: Origin, The Craft, Missions,
  Flight Log, Awards & Honors, Transmission.
- **PWA** — manifest, service worker (network-first navigations, cache-first
  assets), custom VJ logo as favicon and install icon, self-hosted fonts.

## Stack

React 19 · Vite · Three.js · @react-three/fiber · @react-three/drei ·
Tailwind CSS 4 · simple-icons · Fontsource (Orbitron, Space Grotesk)

## Develop

```bash
npm install
npm run dev      # local dev server
npm run lint     # oxlint
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

## Content

All copy, experience, projects, skills, and awards live in
[`src/data/portfolio.js`](src/data/portfolio.js) and
[`src/data/skills.js`](src/data/skills.js) — edit those to update the site.

## Deploy

Static output in `dist/` — deploys as-is to Vercel, Netlify, or any static host.
For Vercel: framework preset **Vite**, build command `npm run build`, output
directory `dist`.
