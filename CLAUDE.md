# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

A Vue 3 single-page app that serves as a landing page listing all GitHub Pages-hosted apps for the user `klaushofrichter`. At build time, a Node script fetches repository data via the GitHub CLI (`gh`) and writes it to `src/assets/apps.json`. The Vue app reads that static JSON and renders a responsive card grid. Live at https://klaushofrichter.github.io/klaushofrichter/.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run fetch-data` | Fetch user profile + repo data via `gh api` into `src/assets/apps.json` (requires authenticated `gh` CLI) |
| `npm run dev` | Start Vite dev server at `http://localhost:5173/klaushofrichter/` |
| `npm run build` | Full production build: fetch-data, type-check (`vue-tsc`), Vite build |
| `npm run test:e2e` | Run Playwright E2E tests (auto-starts dev server if not running) |
| `npm run deploy` | Fetch data, commit all changes, push to `develop` (triggers GitHub Actions deploy) |

## Architecture

**Build-time data pipeline:** `scripts/fetch-apps.mjs` uses `gh api` to enumerate all public repos with GitHub Pages, skips repos containing a `.nobrowse` file, extracts summaries from READMEs, versions from `package.json`, and writes everything to `src/assets/apps.json`. This JSON is imported statically by the Vue app — there are no runtime API calls.

**Vue component tree:**
- `App.vue` — root; manages dark mode and show-details toggles (persisted to localStorage), lightbox overlay for card detail view
- `AppHeader.vue` — user profile display with avatar, name, app count, and toggle controls
- `AppList.vue` — responsive CSS grid container
- `AppCard.vue` — individual card with name, summary, version badge, relative date, links to Pages site and repo

**Types:** `src/types/app.ts` defines `UserProfile`, `AppEntry`, and `AppsData` interfaces used across components.

**Styling:** `src/style.css` uses CSS custom properties for theming (light/dark via `.dark` class on `<html>`). Responsive grid breakpoints: 1 column mobile, 2 tablet, 3 desktop.

## Branching and Deployment

- `develop` is the working branch. Pushes to `develop` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`) which builds and deploys to GitHub Pages.
- `main` is the base branch for PRs.
- The Vite base path is `/klaushofrichter/` (configured in `vite.config.ts`).

## Key Details

- `src/assets/apps.json` is a generated file — never edit manually; regenerate with `npm run fetch-data`.
- The `.nobrowse` file in the repo root prevents *this* repo from appearing in its own app listing.
- Playwright tests (`e2e/apps.spec.ts`) import `apps.json` directly to validate rendered cards against expected data.
- No runtime dependencies beyond Vue 3. No router, no state management library.
