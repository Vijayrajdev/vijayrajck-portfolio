<div align="center">

<img src="public/logo.svg" width="88" alt="VJ logo" />

# VIJAY RAJ C K — PORTFOLIO

**`// INCOMING TRANSMISSION — CHENNAI, INDIA`**

*A space-themed 3D portfolio for a Senior Data Engineer — built like a data platform.
Query the résumé in SQL, trace skill lineage, watch live GitHub telemetry, and play a data game.*

[![Live](https://img.shields.io/badge/LIVE-vijayrajck.vercel.app-22d3ee?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0b0620)](https://vijayrajck.vercel.app)
[![Play](https://img.shields.io/badge/PLAY-Schema_Storm-ec4899?style=for-the-badge&labelColor=0b0620)](https://vijayrajck.vercel.app/play)

![React](https://img.shields.io/badge/React_19-0b0620?style=flat-square&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-0b0620?style=flat-square&logo=threedotjs&logoColor=a78bfa)
![R3F](https://img.shields.io/badge/@react--three/fiber-0b0620?style=flat-square&logo=react&logoColor=ec4899)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-0b0620?style=flat-square&logo=tailwindcss&logoColor=38bdf8)
![Vite](https://img.shields.io/badge/Vite-0b0620?style=flat-square&logo=vite&logoColor=FFD43B)
![PWA](https://img.shields.io/badge/PWA-installable-0b0620?style=flat-square&logo=pwa&logoColor=8b5cf6)

<img src="docs/hero.png" alt="Hero — live 3D GCP pipeline render, count-up stats and the HUD readout" width="100%" />

</div>

---

## `// CHAPTER 01 — WHAT IS THIS`

A portfolio that tells a story in chapters — **Origin → Craft → Missions → Query
Console → Flight Log → Awards → Transmission** — floating as glass panels over a
living deep-space scene: a particle pipeline network, starfield, comets, and real
product logos (BigQuery, Vertex AI, Terraform, Google Cloud, Python, Composer)
extruded into 3D. Plus a side mission at [`/play`](https://vijayrajck.vercel.app/play).

The hero is a **live 3D render of a GCP data pipeline**, built from the actual
product marks, with event particles flowing through glowing tubes:

```
              ╭──────────╮
SOURCES ══▶ PUB/SUB ══▶ COMPOSER ══▶ BIGQUERY ⇄ DBT
                                        ║
                                        ╚══▶ LOOKER
```

Drag it to orbit. It snaps home when released.

## `// CHAPTER 02 — INTERACTIVE SYSTEMS`

Everything here is something a visitor *does*, and every one of them is a data
engineering idea in disguise.

### ⇢ Skill lineage

<img src="docs/lineage.png" alt="Skill lineage graph — dbt traced to Pipewright, Sentinel-Forge and Nexus" width="100%" />

The skills section flips between a filterable **grid** and a **lineage graph** in
the style of dbt docs: every skill feeds the projects and roles it actually
shipped in. Hover or tap a node to light its edges, with data flowing along them.
The edges aren't hand-drawn — they're derived by matching each skill's aliases
against project and role text ([`lineage.js`](src/data/lineage.js)), so the graph
redraws itself when the content changes.

<img src="docs/skills.png" alt="Skills grid with category filters and 'shipped in' counts" width="100%" />

### ⌘ Query Console — SQL or plain English

<img src="docs/console.png" alt="Query Console — a question in English translated to SQL and run" width="100%" />

The résumé is a dataset. Visitors query `projects`, `skills`, `experience` and
`awards` with a syntax-highlighted editor, schema explorer and preset queries —
or switch to **Ask in English** and type *"Which projects use Terraform?"*.

- **[`miniSql.js`](src/utils/miniSql.js)** — a dependency-free SQL engine:
  `WHERE`, `LIKE`, `IN`, `IS NULL`, `AND/OR/NOT`, `GROUP BY` + `COUNT(*)`,
  `ORDER BY`, `LIMIT`, `DISTINCT`, `SHOW TABLES`, `DESCRIBE`, with friendly errors
  (`DROP TABLE` gets *"this warehouse is read-only"*).
- **[`textToSql.js`](src/utils/textToSql.js)** — rule-based text-to-SQL. No model,
  no network: it picks the table, filters, years, ordering and counts from the
  question, writes the SQL into the editor so you can see the translation, and runs it.

### `>_` The terminal — now with voice

<img src="docs/terminal.png" alt="VJ-OS terminal — whoami and an English question answered with a result table" width="100%" />

`⌘K` / `Ctrl K` / <code>`</code> opens **VJ-OS**: `help`, `whoami`, `projects`,
`open <name>`, `goto <section>`, `sql <query>`, `ask <question>`, `resume`,
`theme`, `play` — with tab completion, history, tap-to-run chips on phones, and a
few easter eggs. In Chrome, Edge and Safari the **🎙 mic** takes spoken commands
(*"go to projects"*, *"which projects use dbt"*) via the Web Speech API.

### ◉ Live telemetry & contribution map

<img src="docs/telemetry.png" alt="Live GitHub telemetry stream and contribution heatmap" width="100%" />

Public GitHub activity replayed as a **Pub/Sub-style message stream** — each event
"acked" as it arrives — with repo, star and language stats, and live
`language · ★ stars · pushed 5d ago` badges on every project card. Below it, the
**contribution map**: a year of commits as a heatmap (coloured by quartile, like
GitHub's own), with streak stats — or as a rotating **3D skyline**, one instanced
tower per day.

<img src="docs/skyline.png" alt="Contribution map as a 3D skyline" width="100%" />

### ▶ Schema Storm — the data game (`/play`)

<img src="docs/game.png" alt="Schema Storm — rows on a conveyor, active contracts, dedupe ledger" width="100%" />

Rows stream down a conveyor toward the warehouse. **Load** the clean ones,
**quarantine** the rest to the dead-letter queue — before they hit the gate. Every
level adds a data contract, and sometimes a column (schema drift): `id IS NOT
NULL`, `email LIKE '%@%'`, `amount >= 0`, `country IN (…)`, duplicate ids against
a dedupe ledger, and late events past a watermark. Streaks multiply the score;
three mistakes halt the pipeline. Keyboard (← / →, A / D), touch buttons, and a
vertical belt on phones.

The rules live in a React-free module ([`schemaStorm.js`](src/game/schemaStorm.js))
and are property-tested: across 21,000 generated rows, every broken row fails
exactly the one contract it was built to break, and a bot reading only what's on
screen plays it at 100% — so every call is fair.

### 🏆 Mission badges & the 2060 layer

- **11 badges** for exploring — open the terminal, run your own SQL, ask in
  English, trace lineage, catch the telemetry, use your voice, visit every
  chapter, find the secret command, score 500+ in Schema Storm… with unlock toasts
  and a progress panel in the nav.
- **Boot sequence** on first visit (skippable, once per session, never for
  reduced-motion users), a **HUD** running up the left edge (fps, Chennai time,
  uplink, scroll depth), a **targeting reticle** that locks onto controls, a
  **scroll-progress bar** and active-section nav, pointer-tracked **spotlight and
  3D tilt** on cards, and count-up hero stats.

<div align="center">
<img src="docs/projects.png" alt="Missions — draggable 3D project artifacts with live repo badges" width="100%" />
</div>

## `// CHAPTER 03 — FLIGHT SYSTEMS`

| System | What it does |
| --- | --- |
| **Two WebGL contexts, total** | One background canvas + one shared overlay canvas rendering the pipeline, every project stage and the contribution skyline as scissored drei `<View>`s — immune to browser context-loss |
| **FrostGL** | macOS-grade glassmorphism on every OS: where `backdrop-filter` can't be trusted (most Windows/Linux GPU configs), the background scene is gaussian-blurred in WebGL and composited back under each glass panel's rounded rect, tracked live from the DOM (fixed nav first, unrevealed panels skipped) |
| **Capability ladder** | Real GPU → native blur or FrostGL · software GPU → CSS frost plate · no WebGL at all → CSS starfield + designed DOM fallbacks. Nobody sees an empty box |
| **Live data, politely** | GitHub REST + a public contributions API, one request each per session (cached in `sessionStorage`), with offline/rate-limit states instead of blank panels |
| **Motion with manners** | Every animation — boot, reticle, tilt, flowing edges, belts, toasts — respects `prefers-reduced-motion`; tilt and reticle only on precise pointers |
| **Route-split** | `/play` is lazy-loaded, so the game costs the portfolio nothing until someone opens it |
| **PWA** | Installable, offline-capable, custom VJ monogram as app icon, self-hosted fonts |

## `// CHAPTER 04 — LAUNCH SEQUENCE`

```bash
npm install      # fuel
npm run dev      # ignition — local dev server (http://localhost:5173, game at /play)
npm run lint     # pre-flight checks (oxlint)
npm run build    # orbit — production build → dist/
npm run preview  # test the production build locally
```

**Debug switches:** `?frostgl=1` / `?frostgl=0` force the WebGL frost on/off ·
`?boot` replays the boot sequence. The console prints
`[vj-portfolio] webgl=… frostgl=… backdrop=…` on every load.

## `// CHAPTER 05 — MISSION CONTROL`

All content is data, not markup. Edit these and the site rebuilds itself:

| File | Controls |
| --- | --- |
| [`src/data/portfolio.js`](src/data/portfolio.js) | Profile, hero stats, story, experience, projects, awards |
| [`src/data/skills.js`](src/data/skills.js) | Skill tiles, brand logos, and the aliases that drive lineage |
| [`src/data/lineage.js`](src/data/lineage.js) | Skill → project/role edges (derived — no hand edits) |
| [`src/data/tables.js`](src/data/tables.js) | Query Console tables (derived) + preset queries |
| [`src/game/schemaStorm.js`](src/game/schemaStorm.js) | Schema Storm contracts, levels and pacing |
| [`src/utils/achievements.js`](src/utils/achievements.js) | Mission badges |
| [`src/data/logos3d.js`](src/data/logos3d.js) | The floating 3D logo pool |
| [`src/data/socials.js`](src/data/socials.js) | Contact / social marks |

## `// CHAPTER 06 — DEPLOYMENT`

Static output in `dist/` — deploys anywhere. On Vercel: preset **Vite**,
build `npm run build`, output `dist`. Every push to `master` auto-deploys.
[`vercel.json`](vercel.json) rewrites `/play` to the app so the game URL works on
a direct visit or refresh; on other hosts, add the same SPA fallback.

---

<div align="center">

**`// END OF TRANSMISSION`**

Built with React, Three.js & Tailwind CSS ·
Made with ❤️ by [Vijay](https://www.linkedin.com/in/vijay-raj-02)

Code is [MIT licensed](LICENSE) — fork it as a template for your own portfolio.
Personal photos, resume, and the VJ mark are excluded (see LICENSE).

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjUgMHoiLz48L3N2Zz4=)](https://www.linkedin.com/in/vijay-raj-02)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Vijayrajdev)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:vijayrajck2@gmail.com)

</div>
