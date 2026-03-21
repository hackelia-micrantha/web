# Micrantha Web

Marketing site and web presence for [micrantha.com](https://micrantha.com). Built as
an isomorphic React app with Remix and a lean Tailwind 4 setup.

## Stack

- Remix (server + client rendering)
- React 18 + TypeScript
- Tailwind CSS via CLI pipeline
- ESLint + Prettier for linting/formatting

## Requirements

- Node.js >= 18
- Yarn (preferred, matches lockfile)

## Quick start

```sh
yarn install
yarn dev
```

Then visit `http://localhost:3000`.

## Scripts

- `yarn dev`: run Remix + Tailwind watch
- `yarn build`: production build
- `yarn start`: run built server
- `yarn lint`: lint all files
- `yarn lint:fix`: auto-fix lint issues
- `yarn test:e2e`: run Playwright end-to-end tests
- `yarn test:e2e:mobile`: run the mobile Playwright project
- `yarn typecheck`: TypeScript project check

## End-to-end tests

This repo uses Playwright for route-level smoke tests.

```sh
yarn test:e2e
```

Run only the mobile-emulated project:

```sh
yarn test:e2e:mobile
```

Notes:

- Tests expect the app on `http://127.0.0.1:3000` and will run `yarn build && PORT=3000 yarn start` automatically.
- Tests cover both desktop and mobile Chromium projects.
- The suite includes automated axe accessibility scans for core public routes.
- On this machine, the config will use `/usr/bin/chromium` if Playwright-managed browsers are not installed.
- Override with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium` if needed.

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

## Project structure

- `app/`: Remix routes, components, and styles
- `public/`: static assets
- `build/`: output after `yarn build`

## Notes

- Tailwind is compiled from `app/styles/app.css` into `public/tailwind.css`.
- This repo is mirrored from GitLab.
