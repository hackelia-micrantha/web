# Performance and cache budgets

## Scope

This contract makes deterministic web weight and server cache behavior visible before deployment. It complements the Cloudflare Worker bundle budget and source-isolated workerd contract; it does not claim to reproduce Cloudflare's production CDN cache, network, or cold-start behavior locally.

## Document cache classes

Public document responses are opt-in. Unknown routes, actions, Remix data requests, runtime fixtures, and error responses default to:

```text
private, no-store
```

The explicit public classes are:

| Class       | Routes                                                              | Cache-Control                                                    |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `home`      | `/`, `/contact` redirect path                                       | `public, max-age=60, s-maxage=300, stale-while-revalidate=900`   |
| `catalog`   | `/services`, `/solutions`, `/philosophy`, `/laboratory`, `/compost` | `public, max-age=60, s-maxage=600, stale-while-revalidate=1800`  |
| `reference` | `/privacy`, `/security`, `/support`                                 | `public, max-age=60, s-maxage=1800, stale-while-revalidate=3600` |
| `content`   | `/blog`, blog series, published article routes                      | `public, max-age=60, s-maxage=600, stale-while-revalidate=1800`  |

A newly added route is private until it is deliberately assigned. A dynamic blog path may enter the content class at the root loader, but an unpublished or unknown route becomes `private, no-store` when Remix produces its error response.

### Remix data and mutations

Requests containing the `_data` query parameter are private because they serialize loader state, including the per-response CSP nonce. Requests other than `GET` and `HEAD` are private regardless of pathname.

### CSP nonce pairing

Each rendered document receives a fresh nonce. The CSP header and every nonce-bearing element are generated in the same response. Adapter tests make two independent requests and prove:

- their nonces differ;
- each response body uses the nonce from its own CSP header;
- the root data response carries the same nonce in its body and `X-CSP-Nonce` header.

HTTP caches store a response's headers and body as one object. Production CDN validation must still confirm that the deployed Pages project does not override this repository policy or combine variants incorrectly.

## Enforced deterministic budgets

`config/performance-budgets.json` is the reviewed source of limits. `yarn test:performance-budgets` runs after the production Remix build and writes `.performance/build-budget.json`.

The checker measures:

- every generated browser JavaScript asset, raw and gzip-compressed;
- the largest browser JavaScript asset;
- the static shared-entry import graph;
- static initial JavaScript graphs for `/`, `/solutions`, `/laboratory`, `/blog`, and one Mermaid article;
- generated Tailwind and accessibility CSS, raw and gzip-compressed;
- total and largest image bytes under `public/img` and `public/icon`.

The limits preserve deliberate headroom above the current build rather than tracking exact hashes or byte counts. A budget increase requires a reviewed configuration change and a reason in the pull request.

## Browser runtime budgets

Playwright enforces document-body and external-request budgets for the representative routes above. The homepage is also measured in the pinned mobile project. The local contract permits no cross-origin requests because analytics is disabled without an explicit deployment binding.

Navigation timing values are attached as advisory JSON evidence:

- response start;
- DOM content loaded;
- load completion.

These values are not required checks because hosted-runner scheduling and shared infrastructure introduce noise. A later baseline may promote a stable metric only after repeated measurements establish useful variance bounds.

## Mermaid loading boundary

The shared client entry hydrates Remix only. Mermaid is dynamically imported by `MermaidDiagram` when a diagram component mounts. The browser suite proves a non-diagram page does not install the renderer and a Mermaid article still enhances after hydration while retaining its SSR source fallback.

## Tooling boundary

Tailwind runs through the lockfile-installed `tailwindcss` executable. Build and deployment do not use `npx` to download or select an unreviewed CLI version.

## CI evidence

Required CI publishes:

- `.performance/build-budget.json` for deterministic build measurements;
- Playwright performance advisory attachments for representative desktop and mobile navigations;
- `.cloudflare/runtime/performance-report.json` for advisory local workerd readiness;
- the existing Worker bundle report and staged runtime manifest.

## Remaining production validation

Local workerd and direct-adapter contracts cannot prove Cloudflare edge-cache behavior. Preview or production validation should capture:

- `CF-Cache-Status` across repeated document and data requests;
- cache-key and `Vary` behavior;
- nonce/header/body pairing after an edge hit;
- deployed response timing and Worker startup observability;
- dashboard configuration parity with checked-in `wrangler.toml`;
- alerting thresholds selected for the actual Pages plan and traffic profile.
