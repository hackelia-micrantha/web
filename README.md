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
- Cloudflare Pages Functions as the authoritative production runtime

## Stack

| Area          | Tools                      |
| ------------- | -------------------------- |
| App framework | Remix 2                    |
| UI            | React 18                   |
| Language      | TypeScript                 |
| Styling       | Tailwind CSS 4 via CLI     |
| Quality       | ESLint + Prettier          |
| Testing       | Playwright                 |
| Deployment    | Cloudflare Pages Functions |

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

| Command                           | Purpose                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| `yarn dev`                        | Run Remix and Tailwind in watch mode                       |
| `yarn build`                      | Build CSS and Remix for production                         |
| `yarn cloudflare:functions:build` | Bundle the Pages Function with pinned Wrangler             |
| `yarn start`                      | Serve the production build locally through `remix-serve`   |
| `yarn lint`                       | Run ESLint                                                 |
| `yarn lint:fix`                   | Auto-fix lint issues                                       |
| `yarn typecheck`                  | Run the TypeScript build check                             |
| `yarn test:cloudflare:adapter`    | Exercise the built Pages Function entry directly           |
| `yarn test:cloudflare:bundle-budget` | Enforce raw and gzip Worker size budgets                |
| `yarn test:cloudflare:runtime`    | Exercise a clean staged artifact through workerd            |
| `yarn test:e2e`                   | Run the full Playwright suite                              |
| `yarn test:e2e:mobile`            | Run the mobile Playwright project only                     |
| `yarn test:e2e:headed`            | Run Playwright in headed mode                              |
| `yarn deploy:cloudflare`          | Validate, bundle, and deploy to Cloudflare Pages           |

## Testing

This repo uses Playwright for:

- Route smoke coverage
- Accessibility checks on key pages
- Visual regression snapshots for stable sections

Run the full suite:

```sh
yarn test:e2e
```

Run the direct Pages Function adapter contract after a production build:

```sh
yarn build
yarn test:cloudflare:adapter
```

This imports the checked-in Pages Function entry against the generated Remix server build and provides a fast diagnostic check for representative SSR, binding, status, CSP nonce, cache, and security-header behavior.

Bundle and validate the deployable Pages runtime:

```sh
yarn build
yarn cloudflare:functions:build
yarn test:cloudflare:bundle-budget
yarn test:cloudflare:runtime
```

The runtime contract stages only static assets, the compiled Worker as `_worker.js`, and copied Wrangler configuration. It executes that clean artifact through `wrangler pages dev` and workerd with bundling disabled. Source TSX, the unbundled server build, Functions source, package metadata, and `node_modules` are absent from the request-time staging directory.

The generated bundle, config, reports, and build metadata are written under the ignored `.cloudflare/` directory. Required CI uploads the Pages Function output for inspection. Local workerd readiness is diagnostic only and is not treated as Cloudflare's production startup measurement.

See [Cloudflare Runtime Validation](docs/operations/cloudflare-runtime-validation.md) for the clean-artifact contract, budget policy, and remaining deployment-level checks.

Run a specific spec:

```sh
yarn test:e2e e2e/visual.spec.ts
```

Notes:

- Playwright uses `http://127.0.0.1:3000` by default.
- The browser suite starts the app with `yarn build && PORT=3000 yarn start`.
- This validates the production Remix build through `remix-serve`; it does not by itself prove Cloudflare Pages Functions compatibility.
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

Cloudflare Pages Functions is the authoritative production runtime. The request adapter in `functions/[[path]].js` consumes the generated Remix server build, while `public/` supplies static assets and browser output.

See [Cloudflare Pages SSR Architecture](docs/architecture/cloudflare-pages-ssr.md) for the production topology, compatibility boundary, artifact contract, and role of local Node and Docker paths.

Checked-in config:

- `wrangler.toml`
- `functions/[[path]].js`
- `package.json` deploy, bundle, and runtime-contract scripts
- `config/cloudflare-bundle-budget.json`
- lockfile-pinned Wrangler dependency

Expected environment variables:

- `CLOUDFLARE_API_TOKEN` or a compatible Pages token
- `CLOUDFLARE_PAGES_PROJECT` to override the default project name
- `CLOUDFLARE_PAGES_BRANCH` to override the branch name

Deploy manually:

```sh
yarn deploy:cloudflare
```

The deployment command runs typechecking, the application build, and the Pages Function bundle gate before invoking the pinned Wrangler binary.

## Docker

The Docker image runs the Remix production build through `remix-serve`. It is useful for local Node portability, but it is not the Cloudflare Pages production artifact or a substitute for the Pages Functions runtime contract.

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
config/       Enforced runtime and bundle policy

docs/         Architecture and operational decisions
e2e/          Playwright specs and visual baselines
public/       Static assets and browser build output
build/        Remix server build produced by yarn build
functions/    Cloudflare Pages Functions request adapter
scripts/      Validation and artifact-staging commands
```

## Development Notes

- Tailwind is compiled from `app/styles/app.css` into `public/tailwind.css`.
- The philosophy triangle diagram is served as SVG for sharper rendering.
- This repository is mirrored from GitLab.
