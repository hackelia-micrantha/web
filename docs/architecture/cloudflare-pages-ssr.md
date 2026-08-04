# Cloudflare Pages SSR Architecture

- **Status:** Accepted and implemented baseline
- **Date:** 2026-08-03
- **Issue:** #56
- **Decision scope:** Production runtime, deployment artifacts, compatibility boundaries, and validation responsibilities

## Context

Micrantha Web is a server-rendered Remix 2 application deployed to Cloudflare Pages. The repository also supports local Node serving through `remix-serve`, a Docker image, and Makefile wrappers. Those paths are useful for development and portability, but they do not execute the same adapter or runtime used by production.

The production path is defined by:

- `wrangler.toml`, including `pages_build_output_dir`, compatibility date, and `nodejs_compat`;
- `functions/[[path]].js`, which creates the Remix request handler;
- `build/index.js`, produced by `remix build`;
- `public/`, containing static assets and the browser build;
- Cloudflare Pages Functions, which bundles the root `functions/` directory into a Worker.

Application-level browser tests start `remix-serve`. Separate configuration, bundle, adapter, and asset-first workerd contracts prove that the Pages Function can be built, staged, started, and exercised through the Workers runtime.

## Decision

Cloudflare Pages Functions is the authoritative production runtime.

The repository treats the following pipeline as the production contract:

```text
source
  -> locked dependency install
  -> checked-in Pages configuration contract
  -> Tailwind CSS build
  -> Remix browser and server build
  -> Pages Functions bundle
  -> raw and gzip Worker budgets
  -> source-isolated Workers Static Assets stage
  -> asset-first workerd startup
  -> HTTP runtime contract
  -> Cloudflare Pages deployment
```

A change is production-compatible only when it passes the Pages configuration, bundle budget, direct adapter, asset-first workerd, and browser contracts. Passing through `remix-serve`, the Remix development server, or Docker alone is insufficient.

## Source of truth

### Repository configuration

`wrangler.toml` is the deployment source of truth for:

- Pages project name;
- static output directory;
- Workers compatibility date;
- compatibility flags;
- source-map upload behavior.

`config/cloudflare-pages-contract.json` is a machine-readable projection of those values plus the documented binding inventory. `yarn test:cloudflare:config` rejects drift between the contract, `wrangler.toml`, the default deployment command, and the expected Function entry.

Dashboard-only values and post-deploy parity checks are documented in `docs/operations/cloudflare-pages-configuration.md`. Secrets are never committed or emitted in CI artifacts.

### Production entry point

`functions/[[path]].js` is the production request adapter. It imports the generated Remix server build and translates the Pages Function context into a Remix request.

`@remix-run/server-runtime` is a direct dependency because the repository intentionally owns that request-handler boundary. The adapter does not rely on transitive package hoisting.

### Build and runtime artifacts

The deployment consists of:

- `public/` for static assets and browser output;
- the bundled Pages Function generated from `functions/`;
- the generated Remix server build consumed during Function bundling.

The runtime contract creates `.cloudflare/runtime/` containing only:

- the static `public/` tree;
- the exact precompiled Pages Worker under `worker/index.js`;
- generated Worker route and build metadata;
- derived Wrangler configuration preserving the checked-in compatibility date and flags.

The stage manifest records each file's byte size and SHA-256 digest. It rejects `app/`, `build/`, `functions/`, `scripts/`, `node_modules/`, `package.json`, and `yarn.lock`. Source `.tsx`, `.md`, and `.mdx` files are build inputs, not runtime dependencies.

## Asset-first runtime boundary

The local harness uses Workers Static Assets:

```toml
main = "./worker/index.js"

[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = false
```

Matching assets are served before the Worker. Unknown paths execute the exact precompiled Pages Functions Worker for Remix SSR. This models the intent of the production Pages asset-routing boundary more accurately than giving a catch-all advanced-mode Worker control of every request.

The Worker is executed with pinned Wrangler and `--no-bundle`, proving that the staged precompiled artifact is sufficient without repository source or dependencies.

## Runtime compatibility boundary

`nodejs_compat` is permitted only for APIs required by the current Remix server build or adapter. New Node-specific runtime dependencies require explicit review.

Application request handling should prefer Web Platform APIs:

- `Request` and `Response`;
- `Headers`;
- `URL`;
- Web Streams;
- Web Crypto.

Direct filesystem access, child processes, native addons, and assumptions about a writable local filesystem are prohibited in request handling.

The compatibility date is an operational API version. Updating it is a production change and must pass the complete Cloudflare contract before merge.

## Request and response contract

### Rendering

- direct requests return meaningful server-rendered HTML;
- normal browser requests may stream;
- bot requests may wait for the full stream according to `app/entry.server.tsx`;
- primary content remains usable without hydration unless a feature explicitly documents another contract.

### Status and routing

- successful routes preserve their intended status;
- unknown routes return 404;
- the legacy `/contact` URL permanently redirects to `/services` with status 301;
- unsupported `POST /services` requests return a controlled 405 error document;
- redirect and error behavior are exercised through both the direct adapter and workerd.

### Headers and metadata

- exact application `Cache-Control` policies survive the production adapter;
- CSP header nonces match nonced scripts in the document;
- security headers apply to successful and error documents;
- article canonical URLs and Article JSON-LD survive the direct adapter and workerd paths;
- content types remain correct.

### Assets

- generated Tailwind CSS resolves before Worker invocation;
- the web manifest and generated browser bundle resolve from the staged asset tree;
- unknown paths fall through to SSR;
- source maps are uploaded only through the documented deployment path.

## Cache ownership

Application code defines response cache policy. The direct adapter and workerd contracts assert:

- home: `public, max-age=60, s-maxage=300, stale-while-revalidate=900`;
- representative article: `public, max-age=60, s-maxage=300, stale-while-revalidate=600`.

Cloudflare dashboard cache rules must not silently override application semantics. Production CDN behavior is reviewed through the documented post-deploy smoke check because local workerd cannot reproduce the full Cloudflare edge cache.

Future authenticated, preview, draft, or user-specific routes default to non-shared caching until explicitly classified.

## Environment and analytics

Runtime configuration is resolved through the Pages Function context and request environment. Secrets and bindings are not committed.

`MICRANTHA_ANALYTICS_ID` is optional and non-sensitive. Missing analytics configuration must not prevent rendering. The runtime contract injects a test binding and verifies that it reaches the rendered document.

New runtime bindings require documentation of:

- owner;
- preview and production behavior;
- failure behavior;
- security and privacy implications;
- whether the binding is sensitive.

## Supported execution paths

### Cloudflare Pages Functions

**Role:** Authoritative production runtime and deployment contract.

Required CI builds with pinned Wrangler, enforces bundle budgets, stages an asset-first source-isolated Worker, and executes it under workerd.

### Direct adapter contract

**Role:** Fast request-adapter diagnostic.

It imports `functions/[[path]].js` against the generated Remix build and verifies representative SSR, binding, exact cache, metadata, status, redirect, error, nonce, and security-header behavior. It does not substitute for workerd.

### `remix-serve`

**Role:** Fast local production-build validation and existing Playwright web server.

It remains useful for application-level browser tests but is not proof of Cloudflare compatibility.

### Remix development server

**Role:** Local development and HMR.

Development-only CSP allowances and WebSocket behavior must not leak into production.

### Docker

**Role:** Local Node portability and optional deployment-parity experiment.

The image runs `remix-serve`; it is not the Cloudflare production artifact. Docker requires its own dependency and vulnerability policy if retained as an operational artifact.

### Makefile

**Role:** Convenience aliases only.

Package scripts and checked-in platform configuration remain authoritative. Make targets must not define a second deployment contract.

## Toolchain requirements

Wrangler is declared and lockfile-controlled. Production checks and deployment scripts do not fetch an unspecified Wrangler version through `npx`.

Required CI uses clean frozen installs rather than setup-node's Yarn cache because the Wrangler dependency graph produced approximately 1.9 GB cache archives. The lockfile remains the reproducibility control.

## CI contract

The required Quality job:

1. installs dependencies with the frozen lockfile;
2. validates formatting, lint, and types;
3. verifies the checked-in Pages configuration contract;
4. builds CSS and Remix production artifacts;
5. verifies the pinned Wrangler version;
6. bundles the Pages Function;
7. enforces raw and gzip Worker budgets;
8. uploads bundle metadata and budget evidence;
9. runs the direct adapter contract;
10. stages the source-isolated asset-first runtime;
11. starts workerd with the exact precompiled Worker;
12. enforces the local readiness budget;
13. runs HTTP contracts against workerd;
14. uploads the runtime manifest and startup report.

The baseline suite covers:

- `/` SSR;
- a representative nested article;
- a bot request;
- exact home and article cache policies;
- article canonical metadata and JSON-LD;
- a 404;
- controlled 405 behavior;
- the `/contact` redirect;
- CSP nonce/header pairing;
- security headers;
- static CSS, web manifest, and browser asset resolution;
- Pages binding propagation;
- source-isolated execution.

Issue #55 extends this harness with MDX-specific and JavaScript-disabled article tests without reopening the production topology.

## Bundle and startup budgets

`config/cloudflare-bundle-budget.json` records the Wrangler version, measured baseline, Workers Free platform envelope, and enforced repository raw and gzip budgets.

| Measurement |    Baseline | Repository budget | Platform envelope |
| ----------- | ----------: | ----------------: | ----------------: |
| Raw Worker  | 2,356,613 B |       3,000,000 B |      64,000,000 B |
| Gzip Worker |   466,338 B |       2,500,000 B |       3,000,000 B |

The generated `.cloudflare/functions/bundle-budget.json` records actual sizes and baseline deltas.

`config/cloudflare-runtime-budget.json` sets a 10,000 ms local workerd readiness budget from starting pinned Wrangler to the first successful SSR response. This is a CI regression signal, not a claim about Cloudflare production CPU startup time. The generated `.cloudflare/runtime/runtime-report.json` records the measurement and headroom.

## Security considerations

The production adapter is part of the trust boundary. Review includes:

- declared dependency provenance;
- compatibility flags;
- environment and binding exposure;
- CSP nonce preservation;
- error-path header behavior;
- source-map handling;
- accidental inclusion of source content or build-time tooling;
- cache behavior for future non-public routes;
- bundle growth that could force an unplanned platform change.

Detailed CSP and cross-origin hardening remains owned by #57, while the baseline contract proves that current headers survive production execution.

## Consequences

### Positive

- Cloudflare compatibility is measured rather than assumed.
- MDX and framework migrations have a stable production acceptance boundary.
- Asset-first routing is represented in the local runtime contract.
- Runtime-only and build-only dependencies are distinguishable.
- Worker size and startup regressions are visible.
- Redirect, error, cache, canonical, and JSON-LD behavior cannot silently diverge between Node and workerd.
- Dashboard-only configuration has an explicit parity and post-deploy review process.

### Costs

- CI maintains an additional runtime path beyond browser tests.
- Wrangler is a repository-managed dependency.
- Node-oriented dependencies may require replacement or explicit compatibility justification.
- Local startup measurement is environment-sensitive and therefore uses a conservative regression budget.
- Maintaining both Docker and Cloudflare paths requires clear scope to prevent false parity claims.

## Extension rules

Future work from #55, #57, #58, or framework modernization may extend the contract, but must not:

- make `remix-serve` the production authority;
- bypass configuration or bundle budgets;
- remove source-isolation or asset-first guarantees;
- introduce unpinned runtime tooling;
- weaken no-JavaScript content, cache, metadata, or security-header coverage.
