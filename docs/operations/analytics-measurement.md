# Analytics measurement contract

## Scope and measurement questions

This is the repository-owned product/usage measurement contract for
`micrantha.com`, layered on the Micrantha observability standard adopted via
`hackelia-micrantha/.github#148`.

There are two accepted questions:

1. Which public pages receive enough use to justify maintenance and prominence?
2. Do major navigation/content changes change which public pages are reached?

Cloudflare-managed Web Analytics already reports aggregate page-load data.
Phenology v1 **does not** collect data or answer these questions on its own.
Do not add custom events, identity or a second provider without a concrete
unanswered question and separate privacy/operational review.

## Owned browser integration

The default client component is `app/components/analytics.tsx`. It references
the **Micrantha-owned Phenology contract**, not an Umami or other vendor SDK:

```text
https://analytics.micrantha.com/v1/sites/micrantha-web.js
```

The URL is a **future deployment boundary**, not a live integration guarantee.
Phenology currently owns source code only; it has no deployed Worker, custom
domain or approved consumer. Its reviewed v1 script defines `window.phenology`
with inert `page`, `track`, and `setConsent` methods and sends no data.

Web includes this script by default without provider-specific ID or an
enablement flag. Legacy `MICRANTHA_ANALYTICS_ID` / `ANALYTICS_ID` values are
ignored by the browser component. No `data-website-id` or `/umami.js` is
emitted in the page.

**Do not merge or release Web before the Phenology Worker owns the exact
hostname.** A premature release would request a JavaScript file from the
pre-existing DigitalOcean wildcard instead of reviewed Phenology code.

Application CSP admits the Phenology script origin with the document nonce.
`connect-src` remains same-origin only; the v1 adapter needs no cross-origin
data egress. CSP, provider and script-integrity changes need separate review.

## Independently managed Cloudflare Web Analytics

The Cloudflare zone has RUM/Web Analytics configured separately for automatic
beacon injection. Read-only Cloudflare GraphQL queries observed aggregate
page-load events for `micrantha.com` in November 2026. Those provider counts
are not event-level HAR evidence, unique-person counts or proof of a specific
injected script's successful execution after every release.

The Phenology client does **not** replace or disable Cloudflare measurement.
The public privacy page must maintain this separation. Current browser
response HTML, CSP/beacon execution and provider-specific retention still
require a real network/browser receipt under
`hackelia-micrantha/hackelia-micrantha#64`.

## Data, identity and privacy boundaries

Web adds no custom analytics events, user/account identity, form content,
session replay, fingerprinting, analytics cookies, or persistent local browser
analytics identifiers. Phenology v1 has no provider integration, event
collector, database, storage binding or exporter. Its `setConsent` API is
reserved and **not** an effective consent/withdrawal mechanism.

Cloudflare may separately process network information, aggregate pageviews or
security metadata. Vendor-specific identity, IP handling, cookies, retention,
deletion, proxy handling and residency require evidence from the deployed
configuration; this source contract does not assert them.

## Disablement and rollout gates

Phenology is a default browser dependency once approved, not an operator
toggle. Disabling it requires a reviewed source change and production release.
Previously cached HTML may remain until expiry or explicit invalidation;
validate the actual rendered HTML and CSP, not just repository state.

For any **future** activation:

1. Verify the exact Phenology Worker artifact, hostname, TLS/routing and
   rollback, including that the wildcard DigitalOcean origin is not receiving
   the intended browser script traffic.
2. Complete independent code/security review, Workerd/browser contract,
   script integrity/CSP, negative egress, consent and privacy acceptance.
3. Obtain separate authorization for Worker/domain activation and the Web
   production release; do not infer it from a merged PR or this document.
4. Verify uncached `/` and `/privacy` HTML, CSP, browser requests, console,
   caching and site operation with the Phenology client included by default.
5. Keep rendering, navigation, accessibility and SEO independent of analytics
   script availability. Do not add queues or client-side recovery machinery.

The repository currently has no end-user analytics toggle. If one is needed,
review Cloudflare's separate capabilities and actual provider behavior first
rather than implementing a new consent store speculatively.

## Historic Umami and other provider retention

Removing the legacy script and environment bindings does **not** establish that
the old DigitalOcean origin or its attached volume lack historical analytics
data. Before asserting deletion/retention completion or removing infrastructure,
inventory authorized service/container configuration, databases, volume
contents, snapshots, independent backups, expiry and applicable privacy duties.
These remain open under
`hackelia-micrantha/hackelia-micrantha#64`; do not destroy data from source
code evidence alone.

Any future provider integration, remote export destination, custom events,
identity or retention expansion requires a new measurement question, privacy
review, bounded security changes and explicit effect authority.
