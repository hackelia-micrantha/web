# Cloudflare Runtime Validation

## Purpose

The production contract is validated in three layers:

1. `yarn build` produces the Remix browser and server artifacts.
2. `yarn cloudflare:functions:build` uses the lockfile-pinned Wrangler version to compile the Pages Functions source into a Worker.
3. `yarn test:cloudflare:runtime` stages and executes only the deployable runtime artifact through workerd.

The existing adapter test remains useful for fast request-handler diagnostics, but the staged runtime contract is the authoritative local compatibility gate.

## Clean runtime artifact

The staging command creates `.cloudflare/runtime/` with only:

```text
.cloudflare/runtime/
  wrangler.toml
  public/
    build/
    icon/
    tailwind.css
    ...static assets
  worker/
    index.js
    index.js.map
```

The compiled Worker from `.cloudflare/functions/index.js` is copied unchanged to `worker/index.js`. The source map remains adjacent to the generated script rather than becoming a public asset.

The staged Wrangler file is derived from the checked-in Pages configuration. It preserves the project compatibility date and compatibility flags, points `main` to the precompiled Worker, and configures Workers Static Assets with:

- `public/` as the asset directory;
- an `ASSETS` binding;
- asset-first routing through `run_worker_first = false`.

Asset-first routing is important because the generated Pages Functions Worker contains a catch-all route. Matching files must be served before invoking that Worker, while unknown paths must fall through to the Worker for Remix SSR.

The staged runtime intentionally excludes:

- `app/`;
- `build/`;
- `functions/`;
- `scripts/`;
- `node_modules/`;
- `package.json`;
- `yarn.lock`.

Request handling therefore cannot read source TSX, import the unbundled Remix server build, resolve application packages, or invoke build-time tools.

## Runtime contract

The runtime test starts the staged artifact with `wrangler dev --no-bundle`. This is the equivalent Workers-runtime harness permitted by the Pages SSR architecture contract. It executes the exact precompiled Pages Worker while Workers Static Assets reproduce the production asset-first boundary.

The contract verifies:

- complete SSR for `/`;
- runtime environment-variable propagation;
- a representative nested blog article;
- canonical and Article structured metadata;
- browser and bot responses;
- 404 status and baseline security headers;
- CSP nonce pairing on successful documents;
- generated Tailwind CSS;
- the web manifest;
- a generated browser asset.

A dynamically allocated loopback port prevents collisions with other local or CI processes.

## Bundle budgets

`config/cloudflare-bundle-budget.json` records the current baseline, repository budgets, and the selected platform-compatibility envelope.

`yarn test:cloudflare:bundle-budget` measures:

- raw compiled Worker bytes;
- gzip-compressed Worker bytes.

The repository budgets preserve explicit headroom below the recorded platform limits. Changes that exceed either budget fail required CI and produce `.cloudflare/functions/bundle-budget.json` for inspection.

Local Wrangler readiness time is logged only as diagnostic information. It is not equivalent to Cloudflare's platform startup measurement and is not enforced as a production startup budget.

## Commands

```sh
yarn build
yarn cloudflare:functions:build
yarn test:cloudflare:bundle-budget
yarn test:cloudflare:adapter
yarn test:cloudflare:runtime
```

## CI cache policy

The Cloudflare toolchain materially increased the setup-node Yarn cache archive while clean frozen installs remained acceptably bounded. Required jobs therefore avoid persisting the dependency cache. This prevents multi-gigabyte cache churn and quota pressure; the frozen lockfile remains the reproducibility control.

## Remaining production checks

The local runtime contract does not replace deployment-level validation. Follow-up work still owns:

- dashboard/configuration parity;
- production startup measurements;
- controlled-error and redirect fixtures;
- CDN cache behavior and nonce/header pairing;
- the JavaScript-disabled representative MDX route.
