<div align="center">

<img src="public/logo.svg" width="88" alt="VJ logo" />

# VIJAY RAJ C K — PORTFOLIO

**`// INCOMING TRANSMISSION — CHENNAI, INDIA`**

*A space-themed 3D portfolio for a Senior Data Engineer.
Data platforms that build themselves — and a website that behaves like one.*

[![Live](https://img.shields.io/badge/LIVE-vijayrajck.vercel.app-22d3ee?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0b0620)](https://vijayrajck.vercel.app)

![React](https://img.shields.io/badge/React_19-0b0620?style=flat-square&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-0b0620?style=flat-square&logo=threedotjs&logoColor=a78bfa)
![R3F](https://img.shields.io/badge/@react--three/fiber-0b0620?style=flat-square&logo=react&logoColor=ec4899)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-0b0620?style=flat-square&logo=tailwindcss&logoColor=38bdf8)
![Vite](https://img.shields.io/badge/Vite-0b0620?style=flat-square&logo=vite&logoColor=FFD43B)
![PWA](https://img.shields.io/badge/PWA-installable-0b0620?style=flat-square&logo=pwa&logoColor=8b5cf6)

<img src="docs/hero.png" alt="Hero — live 3D GCP pipeline render in deep space" width="100%" />

</div>

---

## `// CHAPTER 01 — WHAT IS THIS`

A portfolio that tells a story in chapters — **Origin → Craft → Missions →
Flight Log → Awards → Transmission** — floating as glass panels over a living
deep-space scene: a particle pipeline network, starfield, comets, and real
product logos (BigQuery, Vertex AI, Terraform, Google Cloud, Python, Composer)
extruded into 3D. Three of the six logos are drawn at random on every visit.

The hero is a **live 3D render of a GCP data pipeline**, built from the actual
product marks, with event particles flowing through glowing tubes:

```
              ╭──────────╮
SOURCES ══▶ PUB/SUB ══▶ COMPOSER ══▶ BIGQUERY ⇄ DBT
                                        ║
                                        ╚══▶ LOOKER
```

Drag it to orbit. It snaps home when released.

<div align="center">
<img src="docs/projects.png" alt="Missions — draggable 3D project artifacts" width="100%" />
</div>

## `// CHAPTER 02 — FLIGHT SYSTEMS`

| System | What it does |
| --- | --- |
| **Two WebGL contexts, total** | One background canvas + one shared overlay canvas rendering the pipeline and all project stages as scissored drei `<View>`s — immune to browser context-loss |
| **FrostGL** | macOS-grade glassmorphism on every OS: where `backdrop-filter` can't be trusted (most Windows/Linux GPU configs), the background scene is gaussian-blurred in WebGL and composited back under each glass panel's rounded rect, tracked live from the DOM |
| **Capability ladder** | Real GPU → native blur or FrostGL · software GPU → CSS frost plate · no WebGL at all → CSS starfield + designed DOM fallbacks. Nobody sees an empty box |
| **Interactive everything** | Hover the floating logos for holo-labels, click them for a shockwave burst + a synthesized space-sparkle (Web Audio, zero files) |
| **PWA** | Installable, offline-capable, custom VJ monogram as app icon, self-hosted fonts |

<div align="center">
<img src="docs/skills.png" alt="Skills & Tools — brand-logo tiles" width="100%" />
</div>

## `// CHAPTER 03 — LAUNCH SEQUENCE`

```bash
npm install      # fuel
npm run dev      # ignition — local dev server
npm run lint     # pre-flight checks (oxlint)
npm run build    # orbit — production build → dist/
npm run preview  # test the production build locally
```

**Debug switches:** `?frostgl=1` / `?frostgl=0` force the WebGL frost on/off.
The console prints `[vj-portfolio] webgl=… frostgl=… backdrop=…` on every load.

## `// CHAPTER 04 — MISSION CONTROL`

All content is data, not markup. Edit these and the site rebuilds itself:

| File | Controls |
| --- | --- |
| [`src/data/portfolio.js`](src/data/portfolio.js) | Profile, story, experience, projects, awards |
| [`src/data/skills.js`](src/data/skills.js) | Skill tiles + brand logos |
| [`src/data/logos3d.js`](src/data/logos3d.js) | The floating 3D logo pool |
| [`src/data/socials.js`](src/data/socials.js) | Contact / social marks |

## `// CHAPTER 05 — DEPLOYMENT`

Static output in `dist/` — deploys anywhere. On Vercel: preset **Vite**,
build `npm run build`, output `dist`. Every push to `master` auto-deploys.

---

<div align="center">

**`// END OF TRANSMISSION`**

Built with React, Three.js & Tailwind CSS ·
Made with ❤️ by [Vijay](https://www.linkedin.com/in/vijay-raj-02)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjUgMHoiLz48L3N2Zz4=)](https://www.linkedin.com/in/vijay-raj-02)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Vijayrajdev)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:vijayrajck2@gmail.com)

</div>
