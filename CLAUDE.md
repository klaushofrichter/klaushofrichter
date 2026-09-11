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
| `npx vue-tsc -b` | Type-check only — no network, no data fetch. Use this while iterating |
| `npm run test:e2e` | Run Playwright E2E tests (auto-starts dev server if not running) |
| `npx playwright test -g "all apps rendered"` | Run a single test by title |
| `npx playwright test --headed --debug` | Debug a test interactively |
| `npm run deploy` | Refresh `apps.json` and open a PR against `develop` (`scripts/deploy-pr.sh`) — merging that PR is what deploys |
| `gh workflow run deploy.yml` | Redeploy the live site immediately without a commit (the workflow fetches its own data) |

There is no linter or formatter. The strict `tsconfig` flags (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, …) are the only static checks, and they run through `vue-tsc`.

## Architecture

**Build-time data pipeline:** `scripts/fetch-apps.mjs` uses `gh api` to enumerate all public repos with GitHub Pages, skips repos containing a `.nobrowse` file, extracts summaries from READMEs (first prose paragraph, markdown stripped, capped at 50 words), versions from `package.json`, sorts by `pushed_at` descending, and writes everything to `src/assets/apps.json`. This JSON is imported statically by the Vue app — there are no runtime API calls.

**Vue component tree:**
- `App.vue` — root; manages dark mode and show-details toggles (persisted to localStorage), lightbox overlay for card detail view
- `AppHeader.vue` — user profile display with avatar, name, app count, and toggle controls
- `AppList.vue` — responsive CSS grid container
- `AppCard.vue` — individual card with name, summary, version badge, relative date, links to Pages site and repo

**Types:** `src/types/app.ts` defines `UserProfile`, `AppEntry`, and `AppsData` interfaces used across components.

**Styling:** `src/style.css` uses CSS custom properties for theming (light/dark via `.dark` class on `<html>`). Responsive grid breakpoints: 1 column mobile, 2 tablet, 3 desktop.

## Branching and Deployment

**`develop` is protected — it cannot be pushed to directly.** Protection mirrors `../art`'s `production` branch: strict required status checks (`build` and `e2e` from `ci.yml`, and "strict" means a PR must be up to date with `develop` before it can merge), enforced on admins too, with force-pushes and deletions blocked. There are no required reviews, same as art. Every change to `develop` therefore arrives as a pull request that CI has passed.

- `develop` is the deploy branch and GitHub's default branch. A merge to it triggers `.github/workflows/deploy.yml`, which re-fetches data, builds, and deploys to GitHub Pages. That workflow also runs on a daily `0 6 * * *` cron and on `workflow_dispatch`, so the live site refreshes with no commits at all.
- Work happens on a feature branch and lands via PR into `develop`. `main` is a second acceptable PR base for hand-written work. Dependabot (npm + github-actions) opens against `develop`.
- `npm run deploy` no longer pushes — it branches off `origin/develop`, regenerates `apps.json`, and opens a PR (`scripts/deploy-pr.sh`). It refuses to run on a dirty tree and exits quietly when the data is unchanged. The point of committing the refreshed data is the e2e suite, which asserts against it; the live site does not depend on it.
- `.github/workflows/ci.yml` runs on PRs to either branch: a type-check/build job and a Chromium-only e2e job. It deliberately does **not** run `fetch-data` — PRs are validated against the committed `apps.json` so the result doesn't depend on live GitHub state. Keep it that way when editing the workflow; the job names `build` and `e2e` are also the required check contexts, so **renaming a job silently un-gates the branch**.
- The Vite base path is `/klaushofrichter/` (configured in `vite.config.ts` and mirrored in `playwright.config.ts`'s `baseURL`).

## Key Details

- `src/assets/apps.json` is a generated file — never edit manually; regenerate with `npm run fetch-data`. It **is** committed, because the e2e suite and PR CI read it.
- Running `fetch-data` locally can change test expectations (repo count, ordering, versions), so a green suite before the fetch says nothing about after it. Re-run `npm run test:e2e` and commit the JSON together with any related change.
- `e2e/apps.spec.ts` imports `apps.json` directly and asserts on CSS class selectors (`.app-card`, `.summary`, `.version-badge`, `.repo-link`, `.app-list`, `h2 a`) plus `data-testid="date"`. Renaming any of those classes breaks the tests even though nothing visual changed.
- `e2e/` is type-checked by nothing — `tsconfig.app.json` includes only `src/`, `tsconfig.node.json` only `vite.config.ts`, and Playwright strips types without checking them. Type errors in tests surface only as runtime failures.
- Playwright declares no `projects`, so the suite only ever runs in Chromium.
- `relativeDate()` is duplicated in `App.vue` and `AppCard.vue` — change both or neither.
- The `.nobrowse` file in the repo root prevents *this* repo from appearing in its own app listing.
- No runtime dependencies beyond Vue 3. No router, no state management library.
