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

Browser tests start `remix-serve` for fast application-level coverage. Separate adapter and workerd contracts prove that the Pages Function bundles, starts, preserves headers, and behaves correctly under the Workers runtime.

## Decision

Cloudflare Pages Functions is the authoritative production runtime.

The repository treats the following pipeline as the production contract:

```text
source
  -> locked dependency install
  -> Tailwind CSS build
  -> Remix browser and server build
  -> Pages Functions bundle
  -> compressed and raw Worker budget
  -> source-isolated advanced-mode Pages stage
  -> pinned Wrangler compatibility-aware final bundle
  -> workerd runtime contract
  -> public static assets plus Worker artifact
  -> Cloudflare Pages request
  -> functions/[[path]].js
  -> Remix request handler
  -> streamed response
```

A change is production-compatible only when it passes the Pages Functions build, bundle budget, adapter contract, and workerd runtime contract. Passing through `remix-serve`, the Remix development server, or Docker alone is insufficient.

## Source of truth

### Repository configuration

`wrangler.toml` is the repository source of truth for:

- the Pages project name used by local and scripted operations;
- the static output directory;
- the Workers compatibility date;
- compatibility flags;
- source-map upload behavior.

Cloudflare dashboard configuration must not silently diverge from the checked-in file. Operational documentation must identify any dashboard-only bindings or secrets and describe how parity is reviewed.

### Production entry point

`functions/[[path]].js` is the production request adapter. It imports the generated Remix server build and translates the Pages Function context into a Remix request.

The adapter depends only on declared packages and generated deployment artifacts. It must not rely on transitive dependency hoisting, TypeScript source, content source files, or compiler packages at request time.

### Build and runtime artifacts

The production deployment consists of:

- `public/` for static assets and browser output;
- the bundled Pages Function generated from `functions/`;
- the generated Remix server build consumed by that Function during bundling.

The runtime contract stages only:

- the static `public/` tree;
- the generated Worker as advanced-mode `public/_worker.js`;
- generated Worker route and build metadata;
- `wrangler.toml`.

The stage manifest records the byte size and SHA-256 digest of every file. It rejects `app/`, `build/`, `functions/`, and `node_modules/` paths. Source `.tsx`, `.md`, and `.mdx` files are build inputs, not runtime dependencies.

## Runtime compatibility boundary

`nodejs_compat` is permitted only for APIs required by the current Remix server build or adapter. New Node-specific runtime dependencies require explicit review.

The generated intermediate Worker preserves Node built-in imports such as `crypto`, `stream`, `util`, and `string_decoder`. Therefore, pinned Wrangler performs a final compatibility-aware bundle before workerd starts. `--no-bundle` is not a valid runtime path for this artifact.

The application should prefer Web Platform APIs available in both Workers and modern Node runtimes:

- `Request` and `Response`;
- `Headers`;
- `URL`;
- Web Streams;
- Web Crypto.

Direct filesystem access, child processes, native addons, and assumptions about a writable local filesystem are prohibited in request handling.

The compatibility date is an operational API version. Updating it is a production change and must pass the complete Pages contract before merge.

## Request and response contract

The Pages runtime preserves the following externally observable behavior:

### Rendering

- direct requests return meaningful server-rendered HTML;
- normal browser requests may stream;
- bot requests may wait for the full stream according to `app/entry.server.tsx`;
- primary content does not require hydration unless a feature explicitly documents that trade-off.

### Status and routing

- successful routes preserve their intended status;
- unknown routes return 404;
- the legacy `/contact` path permanently redirects to `/services` with its `Location` preserved;
- unsupported mutation requests return a controlled 405 error document;
- redirect and error behavior are validated through both the direct adapter and workerd.

### Headers

- document cache policy is preserved through the adapter;
- CSP nonces in headers and HTML remain paired;
- security headers apply to successful and error documents;
- content type and canonical metadata remain correct.

### Assets

- generated Tailwind CSS resolves from `public/`;
- browser bundles, icons, images, sitemap, and manifest assets resolve through Pages;
- source maps are uploaded only through the documented deployment path.

## Cache ownership

Application code defines response cache policy. Cloudflare may enforce or transform caching only through documented platform configuration.

The adapter suite verifies representative `Cache-Control` behavior. Future authenticated, preview, draft, or user-specific routes must default to non-shared caching until explicitly classified.

Per-response CSP nonces require the HTML document and CSP header to remain one cache object. Tests detect policy loss and header/body nonce mismatches.

## Environment and analytics

Runtime configuration is resolved through the Pages Function context and request environment. Secrets and bindings are not committed.

The analytics identifier is optional. Missing analytics configuration must not prevent rendering. The runtime contract injects a test identifier and verifies that the Pages binding reaches the rendered response.

Adding a new runtime binding requires documentation of:

- its owner;
- preview and production behavior;
- failure behavior;
- security and privacy implications.

## Supported execution paths

### Cloudflare Pages Functions

**Role:** Authoritative production runtime and deployment contract.

Required CI uses pinned Wrangler to build the Pages Function, enforce its budget, stage an advanced-mode Worker, and execute it under workerd.

### Direct adapter contract

**Role:** Fast request-adapter diagnostic.

It imports `functions/[[path]].js` against the generated Remix build and verifies representative route, binding, status, header, redirect, and method-error behavior. It does not substitute for workerd.

### `remix-serve`

**Role:** Fast local production-build validation and existing Playwright web server.

It remains useful for application-level browser tests but is not proof of Cloudflare compatibility.

### Remix development server

**Role:** Local development and HMR.

Development-only CSP allowances and WebSocket behavior must not leak into production.

### Docker

**Role:** Local Node portability and optional deployment-parity experiment.

The current image runs `remix-serve`; it is not the Cloudflare production artifact. Docker documentation states that distinction. If the image is retained as an operational artifact, it requires its own dependency and vulnerability policy.

### Makefile

**Role:** Convenience aliases only.

Package scripts and checked-in platform configuration remain authoritative. Make targets must not define a second deployment contract.

## Toolchain requirements

Wrangler is declared and lockfile-controlled. Production compatibility checks and deployment scripts must not fetch an unspecified Wrangler version through `npx`.

`@remix-run/server-runtime` is a direct dependency because the Pages Function adapter owns that request-handler boundary. Relying on transitive dependency hoisting is prohibited.

## CI contract

The required Quality job:

1. installs dependencies with the frozen lockfile;
2. validates repository formatting, lint, and types;
3. builds CSS and Remix production artifacts;
4. verifies the pinned Wrangler version;
5. bundles Pages Functions with checked-in configuration;
6. enforces compressed and raw Worker budgets;
7. uploads Worker bundle metadata and the size report;
8. runs the direct adapter contract;
9. stages the source-isolated Pages runtime;
10. starts workerd through pinned Wrangler;
11. runs HTTP contracts against that runtime;
12. uploads the deterministic runtime manifest.

The baseline suite covers:

- `/`;
- a representative nested article route;
- a bot request;
- the `/contact` redirect;
- a 404;
- a controlled 405 method error;
- CSP nonce/header pairing;
- cache and security headers;
- environment binding propagation;
- static CSS and generated browser asset resolution;
- canonical metadata and JSON-LD through existing route/browser contracts.

Issue #55 may extend this established harness with MDX-specific and JavaScript-disabled article tests without redefining the production topology.

## Bundle budget

The bundle gate measures the generated `.cloudflare/functions/index.js` artifact before deployment:

- raw bytes;
- deterministic gzip level-9 bytes;
- platform limits for the selected plan;
- internal budgets;
- remaining headroom.

The default plan is `free`. `CLOUDFLARE_WORKERS_PLAN=paid` is an explicit opt-in for deployments backed by a paid Workers plan.

Both plans reserve 20% internal headroom:

| Plan | Platform gzip limit | Enforced gzip budget |
| ---- | ------------------: | -------------------: |
| Free |         3,000,000 B |          2,400,000 B |
| Paid |        10,000,000 B |          8,000,000 B |

The platform's 64,000,000-byte uncompressed limit is enforced at an internal budget of 51,200,000 bytes.

The generated `.cloudflare/functions/size-report.json` is uploaded with CI artifacts. Subsequent architectural changes must expose their size effect through the report. Browser route splitting does not imply equivalent Worker splitting, so server bundle growth is measured independently.

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
- Worker size growth that could force an unsafe or unplanned platform change.

Detailed CSP and cross-origin policy hardening remains owned by #57, but the baseline adapter and workerd tests prove that current headers survive production execution.

## Consequences

### Positive

- Cloudflare compatibility is measurable rather than assumed.
- MDX and framework migrations have a stable production acceptance boundary.
- Runtime-only and build-only dependencies are distinguishable.
- Deployment documentation, scripts, and CI converge on one topology.
- Worker growth and compatibility-date changes are reviewable.
- Redirect and error behavior cannot silently diverge between Node and workerd.

### Costs

- CI maintains an additional runtime path beyond browser tests.
- Wrangler is a repository-managed dependency.
- Node-oriented dependencies may require replacement or explicit compatibility justification.
- Maintaining both Docker and Cloudflare paths requires clear scope to prevent false parity claims.
- The current Yarn cache is large and should be optimized separately without weakening the production contract.

## Extension rules

Future work from #55, #57, #58, or framework modernization may extend the established contract, but must not:

- make `remix-serve` the production authority;
- bypass the bundle budget;
- remove source-isolation guarantees;
- introduce unpinned runtime tooling;
- weaken no-JavaScript content or current security-header coverage.
