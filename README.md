# Leonida Trophy Guide — GTA VI (PS5)
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rsuryatna/GTA6-Trophy-Guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rsuryatna/GTA6-Trophy-Guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An unofficial, offline trophy tracker and guide for Grand Theft Auto VI on
PlayStation 5: all 55 official trophies, a roadmap to the platinum, missable
warnings, and a "Next up" planner. Made for the make.fun bounty
`gta6-trophy-guide-01`.

## What it is

- **Checklist** — all 55 trophies with their official name, description, grade,
  kind, live earn rate, and a guide. Mark each one earned; progress is saved in
  the browser (localStorage) with export/import.
- **Roadmap** — the order to play in: story, strands, activities and
  collectibles, combat, then money and the grind.
- **Missables** — the 7 trophies that can be missed, why, and how to stay safe.
- **Next up** — a planner that suggests the next 5 trophies from your progress:
  the next story beat, the most urgent missable, then the easiest wins.
- **Spoiler setting** — hides story trophies until you earn them.
- **Two looks** — paper (light) and night (dark), one coral accent.

## Sources

Names, descriptions and grades are the official PlayStation 5 list (frozen
18 Nov 2026), as published on Exophase and cross-checked on PSNProfiles. Earn
rates are from Exophase, snapshot 20 Nov 2026 (44,161 players tracked). Guide
text is our own advice written from the official descriptions; anything not yet
checked in the game is marked as such in the guide itself — this guide never
presents an unverified specific as fact.

This is an unofficial fan-made guide, not affiliated with Rockstar Games. It
uses no Rockstar artwork or logos.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

No build step, no network: `app/` is plain static files (`index.html`, ES
modules, CSS, `data/trophies.json`).

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored make.fun
library (`vendor/makefun-frontend.ts`, copied unchanged from the kit):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

With no `MAKEFUN_OUTPUT_DIR` set it writes to `/output`.

## Screenshots

Four 1280×800 JPEGs under `screenshots/` (the first by name is the cover):
checklist with progress seeded, the guide pane, the roadmap, and the missables
page. See `shots.json` for which view each one shows.
