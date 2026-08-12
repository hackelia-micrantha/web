# Cloudflare Pages SSR Architecture

- **Status:** Accepted baseline
- **Date:** 2026-08-03
- **Issue:** #56
- **Decision scope:** Production runtime, deployment artifacts, compatibility boundaries, and validation responsibilities

## Context

Micrantha Web is a server-rendered Remix 2 application deployed to Cloudflare Pages. The repository also supports local Node serving through `remix-serve`, a Docker image, and mise task wrappers. Those paths are useful for development and portability, but they do not execute the same adapter or runtime used by production.

The production path is currently defined by:

- `wrangler.toml`, including `pages_build_output_dir`, compatibility date, and `nodejs_compat`;
- `functions/[[path]].js`, which creates the Remix request handler;
- `build/index.js`, produced by `remix build`;
- `public/`, containing static assets and the browser build;
- Cloudflare Pages Functions, which bundles the root `functions/` directory into a Worker.

Current browser tests start `remix-serve`. That validates the Remix application and production build, but it does not prove that the Pages Function bundles, starts, preserves headers, or behaves correctly under the Workers runtime.

## Decision

Cloudflare Pages Functions is the authoritative production runtime.

The repository must treat the following pipeline as the production contract:

```text
source
  -> locked dependency install
  -> Tailwind CSS build
  -> Remix browser and server build
  -> Pages Functions bundle
  -> public static assets plus Worker artifact
  -> Cloudflare Pages request
  -> functions/[[path]].js
  -> Remix request handler
  -> streamed response
```

A change is production-compatible only when it passes the Pages Functions build and runtime contract. Passing through `remix-serve`, the Remix development server, or Docker alone is insufficient.

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

The adapter must depend only on declared packages and generated deployment artifacts. It must not rely on transitive dependency hoisting, TypeScript source, content source files, or compiler packages at request time.

### Build artifacts

The production deployment consists of:

- `public/` for static assets and browser output;
- the bundled Pages Function generated from `functions/`;
- the generated Remix server build consumed by that Function during bundling.

Source `.tsx`, `.md`, and `.mdx` files are build inputs, not runtime dependencies.

## Runtime compatibility boundary

`nodejs_compat` is permitted only for APIs required by the current Remix server build or adapter. New Node-specific runtime dependencies require explicit review.

The application should prefer Web Platform APIs available in both Workers and modern Node runtimes:

- `Request` and `Response`;
- `Headers`;
- `URL`;
- Web Streams;
- Web Crypto.

Direct filesystem access, child processes, native addons, and assumptions about a writable local filesystem are prohibited in request handling.

The compatibility date is an operational API version. Updating it is a production change and must pass the Pages adapter suite before merge.

## Request and response contract

The Pages runtime must preserve the following externally observable behavior:

### Rendering

- direct requests return meaningful server-rendered HTML;
- normal browser requests may stream;
- bot requests may wait for the full stream according to `app/entry.server.tsx`;
- primary content must not require hydration unless a feature explicitly documents that trade-off.

### Status and routing

- successful routes preserve their intended status;
- unknown routes return 404;
- redirects preserve status and `Location`;
- controlled server failures return the intended error document and status.

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

The adapter suite must verify representative `Cache-Control` behavior. Future authenticated, preview, draft, or user-specific routes must default to non-shared caching until explicitly classified.

Per-response CSP nonces require the HTML document and CSP header to remain one cache object. Tests must detect header/body recombination or policy loss.

## Environment and analytics

Runtime configuration is resolved through the Pages Function context and request environment. Secrets and bindings are not committed.

The analytics identifier is optional. Missing analytics configuration must not prevent rendering. Adding a new runtime binding requires documentation of:

- its owner;
- preview and production behavior;
- failure behavior;
- security and privacy implications.

## Supported execution paths

### Cloudflare Pages Functions

**Role:** Authoritative production runtime and deployment contract.

Must be exercised by CI through a pinned Wrangler build and local Pages runtime harness.

### `remix-serve`

**Role:** Fast local production-build validation and existing Playwright web server.

It remains useful for application-level browser tests but is not proof of Cloudflare compatibility.

### Remix development server

**Role:** Local development and HMR.

Development-only CSP allowances and WebSocket behavior must not leak into production.

### Docker

**Role:** Local Node portability and optional deployment-parity experiment.

The current image runs `remix-serve`; it is not the Cloudflare production artifact. Docker documentation must state that distinction. If the image is retained as an operational artifact, it requires its own dependency and vulnerability policy.

### mise

**Role:** Convenience tasks only.

Package scripts and checked-in platform configuration remain authoritative. mise tasks must not define a second deployment contract.

## Toolchain requirements

Wrangler must be declared and lockfile-controlled. Production compatibility checks and deployment scripts must not fetch an unspecified Wrangler version through `npx`.

The Pages Function adapter must use a direct, intentional dependency. The implementation must decide whether to:

1. declare `@remix-run/server-runtime` directly; or
2. use a public Cloudflare/Remix adapter package that owns the request-handler boundary.

Relying on a transitive package being hoisted is not acceptable.

## CI contract

The required Pages adapter job will:

1. install dependencies with the frozen lockfile;
2. build CSS and Remix production artifacts;
3. bundle Pages Functions with the pinned Wrangler version and checked-in configuration;
4. record Worker bundle metadata and size;
5. start the bundled application with `wrangler pages dev` or an equivalent Workers-runtime harness;
6. run HTTP contract tests against that runtime;
7. fail on unresolved imports, unsupported runtime APIs, missing assets, incorrect statuses, or header regressions.

The baseline suite must cover:

- `/`;
- one representative nested route;
- a bot request;
- a 404;
- a controlled error route or test fixture;
- a redirect;
- CSP nonce/header pairing;
- cache headers;
- static CSS and asset resolution;
- canonical metadata and JSON-LD.

The harness should run from a staged deployment context where practical, proving that source files and build-only packages are unnecessary at request time.

Issue #55 will extend this established harness with MDX-specific and JavaScript-disabled article tests. Those extension tests are not part of the baseline closure criteria for #56.

## Bundle budget

The first implementation slice must record the current compressed and uncompressed Worker size. The enforced limit should preserve explicit headroom below the applicable Cloudflare plan limit.

Subsequent architectural changes must report their delta. Browser route splitting does not guarantee equivalent Worker splitting, so server bundle growth must be measured independently.

## Security considerations

The production adapter is part of the trust boundary. Review must include:

- declared dependency provenance;
- compatibility flags;
- environment and binding exposure;
- CSP nonce preservation;
- error-path header behavior;
- source-map handling;
- accidental inclusion of source content or build-time tooling;
- cache behavior for any future non-public route.

Detailed CSP and cross-origin policy hardening remains owned by #57, but the baseline adapter tests must prove that current headers survive production execution.

## Consequences

### Positive

- Cloudflare compatibility becomes measurable rather than assumed.
- MDX and framework migrations gain a stable production acceptance boundary.
- Runtime-only and build-only dependencies become distinguishable.
- deployment documentation, scripts, and CI converge on one topology.
- Worker growth and compatibility-date changes become reviewable.

### Costs

- CI gains another build/runtime path in addition to browser tests.
- Wrangler becomes a repository-managed dependency.
- some Node-oriented dependencies may require replacement or explicit compatibility justification.
- maintaining both Docker and Cloudflare paths requires clear scope to prevent false parity claims.

## Follow-up implementation

1. Pin Wrangler and replace unpinned invocations.
2. resolve the direct Remix runtime dependency decision;
3. add Pages Function bundle and runtime scripts;
4. record the Worker bundle baseline and budget;
5. add the Cloudflare adapter CI job and HTTP contract suite;
6. align README, Docker, mise, and package script descriptions;
7. extend the harness from #55, #57, and #58 without redefining the production topology.
