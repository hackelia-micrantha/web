# Cloudflare Runtime Validation

## Purpose

The production contract is validated in three layers:

1. `yarn build` produces the Remix browser and server artifacts.
2. `yarn cloudflare:functions:build` uses the lockfile-pinned Wrangler version to compile the Pages Functions source into a Worker.
3. `yarn test:cloudflare:runtime` stages and executes only the deployable runtime artifact through workerd.

The direct adapter test remains useful for fast request-handler diagnostics. The staged runtime contract is the authoritative local compatibility gate.

## Routing correction

Cloudflare Pages advanced mode gives `_worker.js` control of every request. A custom advanced-mode Worker must explicitly forward static asset requests to the `ASSETS` binding.

The Worker produced by `wrangler pages functions build` contains the generated Pages Functions dispatcher, including a catch-all route. Staging that generated Worker directly as `_worker.js` changes the asset boundary: the Worker receives asset paths before the platform can apply Pages asset-first routing.

The local contract therefore uses the equivalent Workers runtime permitted by the architecture decision:

- the exact precompiled Pages Functions Worker remains unchanged;
- Workers Static Assets serves matching files first;
- unknown paths execute the Worker;
- the `ASSETS` binding remains available to the generated dispatcher;
- workerd executes the staged runtime with bundling disabled.

This avoids the deprecated `wrangler pages dev --script-path` path and preserves the production request boundary more faithfully than advanced mode.

## Clean runtime artifact

The staging command creates `.cloudflare/runtime/` with only:

```text
.cloudflare/runtime/
  manifest.json
  wrangler.toml
  metadata/
    build-metadata.json
    functions-config.json
  public/
    build/
    icon/
    tailwind.css
    ...static assets
  worker/
    index.js
    index.js.map
```

The derived runtime configuration preserves the checked-in Pages compatibility date and compatibility flags and adds:

```toml
main = "./worker/index.js"

[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = false
```

The staged runtime intentionally excludes:

- `app/`;
- `build/`;
- `functions/`;
- `scripts/`;
- `node_modules/`;
- `package.json`;
- `yarn.lock`.

Request handling therefore cannot read source TSX, import the unbundled Remix server build, resolve application packages, or invoke build-time tools.

The manifest records every staged file's path, byte size, and SHA-256 digest together with the source compatibility configuration and routing policy.

## Runtime contract

The runtime test starts the staged artifact with `wrangler dev --no-bundle` on a dynamically allocated loopback port. It verifies:

- complete SSR for `/`;
- runtime configuration propagation;
- a representative nested blog article;
- canonical metadata and Article JSON-LD;
- browser and bot responses;
- 404 status and baseline security headers;
- CSP nonce pairing on successful documents;
- generated Tailwind CSS;
- the web manifest;
- a generated browser asset.

Local Wrangler readiness time is logged only as diagnostic information. It is not equivalent to Cloudflare's production startup measurement and is not enforced as a production startup budget.

## Bundle budgets

`config/cloudflare-bundle-budget.json` records the current baseline, repository budgets, and selected platform-compatibility envelope.

`yarn test:cloudflare:bundle-budget` measures:

- raw compiled Worker bytes;
- gzip-compressed Worker bytes.

The budget validator verifies:

- positive integer configuration values;
- the baseline fits within repository budgets;
- repository budgets preserve platform headroom;
- the current Worker remains within both budgets;
- raw and compressed deltas from the baseline.

The generated report is written to `.cloudflare/functions/bundle-budget.json` and included with the CI artifact.

## Commands

```sh
yarn build
yarn cloudflare:functions:build
yarn test:cloudflare:bundle-budget
yarn test:cloudflare:adapter
yarn test:cloudflare:runtime
```

## CI cache policy

The Cloudflare toolchain increased the setup-node Yarn cache archive to approximately 1.9 GB, while clean frozen installs remained acceptably bounded. Required jobs therefore avoid persisting that cache. This prevents repeated multi-gigabyte cache uploads and quota pressure; the frozen lockfile remains the reproducibility control.

## Remaining production checks

The local runtime contract does not replace deployment-level validation. Follow-up work still owns:

- dashboard and checked-in configuration parity;
- production startup measurements;
- explicit redirect and controlled-error fixtures;
- deeper CDN cache behavior and nonce/header pairing;
- the JavaScript-disabled representative MDX route.
