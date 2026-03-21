# Micrantha Web

[![Remix](https://img.shields.io/badge/Remix-2.17-121212?logo=remix)](https://remix.run/)
[![React](https://img.shields.io/badge/React-18.3-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827.svg)](./LICENSE)

Marketing site and web presence for [micrantha.com](https://micrantha.com), built with Remix, React, TypeScript, and a lean Tailwind CSS pipeline.

## Overview

- Server-rendered Remix application with client-side enhancements
- Marketing pages for services, solutions, philosophy, support, and laboratory work
- Shared card palette and icon system for consistent presentation
- Playwright route, accessibility, and visual regression coverage
- Cloudflare Pages deployment path with checked-in Wrangler config

## Stack

| Area | Tools |
| --- | --- |
| App framework | Remix 2 |
| UI | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 via CLI |
| Quality | ESLint + Prettier |
| Testing | Playwright |
| Deployment | Cloudflare Pages |

## Requirements

- Node.js `>=18`
- Yarn

## Quick Start

```sh
yarn install
yarn dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn dev` | Run Remix and Tailwind in watch mode |
| `yarn build` | Build CSS and Remix for production |
| `yarn start` | Serve the production build |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Auto-fix lint issues |
| `yarn typecheck` | Run the TypeScript build check |
| `yarn test:e2e` | Run the full Playwright suite |
| `yarn test:e2e:mobile` | Run the mobile Playwright project only |
| `yarn test:e2e:headed` | Run Playwright in headed mode |
| `yarn deploy:cloudflare` | Typecheck, build, and deploy to Cloudflare Pages |

## Testing

This repo uses Playwright for:

- Route smoke coverage
- Accessibility checks on key pages
- Visual regression snapshots for stable sections

Run the full suite:

```sh
yarn test:e2e
```

Run a specific spec:

```sh
yarn test:e2e e2e/visual.spec.ts
```

Notes:

- Playwright uses `http://127.0.0.1:3000` by default.
- The test config starts the app automatically with `yarn build && PORT=3000 yarn start`.
- Desktop and mobile Chromium projects are configured.
- The suite includes automated axe accessibility scans for key public routes.
- On this machine, `/usr/bin/chromium` is used automatically when Playwright-managed browsers are unavailable.
- Override the browser path with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium` if needed.

## Visual Regression Baselines

Visual baselines live in `e2e/visual.spec.ts-snapshots/`.

To refresh them intentionally:

```sh
yarn test:e2e e2e/visual.spec.ts --update-snapshots
```

## Deployment

Cloudflare Pages is the primary deployment target.

Checked-in config:

- `wrangler.toml`
- `package.json` deploy script

Expected environment variables:

- `CLOUDFLARE_API_TOKEN` or a compatible Pages token
- `CLOUDFLARE_PAGES_PROJECT` to override the default project name
- `CLOUDFLARE_PAGES_BRANCH` to override the branch name

Deploy manually:

```sh
yarn deploy:cloudflare
```

## Docker

Build and run locally:

```sh
docker build -t micrantha/web .
docker run --rm -p 3000:3000 micrantha/web
```

Or use the Makefile helpers:

```sh
make image
make run
```

## Project Structure

```text
app/          Remix routes, components, services, and utilities
e2e/          Playwright specs and visual baselines
public/       Static assets
build/        Production output after yarn build
functions/    Edge or platform-specific function code
```

## Development Notes

- Tailwind is compiled from `app/styles/app.css` into `public/tailwind.css`.
- The philosophy triangle diagram is now served as SVG for sharper rendering.
- This repository is mirrored from GitLab.
