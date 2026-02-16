# Pages Browser

A Vue 3 landing page that lists all GitHub Pages-hosted apps for [klaushofrichter](https://github.com/klaushofrichter). The app fetches repository data via the GitHub CLI at build time and displays it as a responsive card grid.

Live at: https://klaushofrichter.github.io/klaushofrichter/

## Features

- User profile display with avatar, name, and app count
- Responsive card grid (1 column on mobile, 2 on tablet, 3 on desktop)
- Each card shows app name, summary extracted from README, version from `package.json`, relative update date, and links to the Pages site and GitHub repo
- Cards sorted by most recently updated
- Pre-build data fetching script using `gh` CLI
- Playwright E2E test suite
- Automated deployment to GitHub Pages via GitHub Actions

## Prerequisites

- Node.js 20+
- [GitHub CLI](https://cli.github.com/) (`gh`) authenticated

## Getting Started

```bash
npm install
npm run fetch-data
npm run dev
```

The app runs at `http://localhost:5173/klaushofrichter/`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run fetch-data` | Fetches user profile and repo data via `gh api`, writes `src/assets/apps.json` |
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Fetches data, type-checks, and builds for production |
| `npm run preview` | Serves the production build locally |
| `npm run test:e2e` | Runs Playwright E2E tests against the dev server |

## Project Structure

```
scripts/fetch-apps.mjs        # Data fetching script (gh CLI)
src/
  assets/apps.json             # Generated at build time
  components/
    AppHeader.vue              # User profile and page title
    AppList.vue                # Responsive grid container
    AppCard.vue                # Individual app card
  types/app.ts                 # TypeScript interfaces
  App.vue                      # Root component
  style.css                    # Global styles with CSS custom properties
e2e/apps.spec.ts               # Playwright E2E tests
.github/workflows/deploy.yml   # GitHub Actions Pages deployment
```

## Deployment

Pushes to the `develop` branch trigger the GitHub Actions workflow which fetches fresh data, builds the app, and deploys to GitHub Pages.

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Playwright
- GitHub Actions
