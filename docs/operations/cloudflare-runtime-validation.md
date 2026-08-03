# Cloudflare Runtime Validation

## Purpose

The production contract is validated in three layers:

1. `yarn build` produces the Remix browser and server artifacts.
2. `yarn cloudflare:functions:build` uses the lockfile-pinned Wrangler version to compile the Pages Functions source into a Worker.
3. `yarn test:cloudflare:runtime` stages and executes only the deployable runtime artifact through `wrangler pages dev` and workerd.

The existing adapter test remains useful for fast request-handler diagnostics, but the staged runtime contract is the authoritative local compatibility gate.

## Clean runtime artifact

The staging command creates `.cloudflare/runtime/` with only:

```text
.cloudflare/runtime/
  wrangler.toml
  public/
    _worker.js
    index.js.map
    build/
    icon/
    tailwind.css
    ...static assets
```

The compiled Worker from `.cloudflare/functions/index.js` is copied to `public/_worker.js`. Wrangler treats this as Pages advanced mode. The generated Worker already contains the Pages Functions route dispatcher and forwards unmatched requests to the `ASSETS` binding.

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

The runtime test starts the staged artifact with the checked-in Wrangler configuration and `--no-bundle`. It verifies:

- complete SSR for `/`;
- Pages environment-binding propagation;
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
