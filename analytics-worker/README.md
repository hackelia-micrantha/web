# Lenticel (analytics adapter, v1)

A dormant, provider-neutral JavaScript loader incubated in the Micrantha Web
repository. It is a **separate Cloudflare Worker**, not part of the site's
Cloudflare Pages/Remix build. See
[hackelia-micrantha/hackelia-micrantha#64](https://github.com/hackelia-micrantha/hackelia-micrantha/issues/64)
for architecture, live-origin inventory and the release gates.

## Current contract

- Public route: `GET /v1/sites/micrantha-web.js`; `HEAD` supported.
- Health: `GET /healthz`. Everything else, including legacy
  `/count.js`, `/umami.js` and event-ingest paths, returns 404.
- The site manifest has `provider: "none"`. The script only exposes
  `window.lenticel.page(path?)`, `track(name, props?)`, and
  `setConsent("granted" | "denied")`. **No collection is activated.**
- For a future, separately approved GA4 site, `page` accepts only exact
  reviewed paths; `track` accepts only reviewed event names and enumerated
  properties. No URL query, fragments, free text, user IDs or arbitrary events.
- Only one provider can be configured for a site in v1. No storage, proxy,
  event endpoint, fallback service or provider fan-out.
- Disabled or unapproved use produces no vendor script or outbound event.
  Unknown sites/versions are not aliased to a default provider.
- Cache: mutable v1 URLs use five-minute browser revalidation. This is API
  versioning, **not immutable-content/SRI pinning**. For SRI, add a separately
  reviewed content-hashed URL and matching manifest before consumers adopt it.

## Verification

From the repository root:

```sh
yarn test:analytics-worker
yarn wrangler dev --config analytics-worker/wrangler.jsonc
```

The second command starts a **local** Worker development server; it is not
a production deployment. Tests use Node's built-in test runner and browser
VM fixtures without contacting vendors.

The Worker configuration has **no routes**, `workers_dev: false`, and
`preview_urls: false` to avoid accidental publication. It is not deployed
by the existing `micrantha-web` Pages release workflow. Attaching
`analytics.micrantha.com` is a distinct gated operation.

## Privacy and operational limits

The code uses an explicit deny-by-default client consent state, never fetches
remote configuration, and does not load any vendor when the manifest says
`none`. Scripts served cross-origin run with the consumer page's authority:
the Worker requires source review, exact artifact validation and a rollback
plan before public binding.

Cloudflare RUM/Web Analytics may already inject a beacon independently of this
Worker; **do not inject a second one**. The adapter is not an opt-out control
for that Cloudflare feature.

The included GA4 adapter is unselected and not production-qualified. In
particular, once a third-party SDK has been loaded, calling
`setConsent("denied")` only prevents **new adapter dispatches**. It cannot
unload the SDK, retract previously transmitted events, revoke its cookies or
guarantee that the provider itself sends no subsequent requests. A production
GA4 pilot needs an explicit consent/retention/privacy decision, approved CSP
egress, browser/network verification and provider-specific withdrawal behavior.

Keep the Micrantha website's current optional `/umami.js` integration
disabled and unchanged until an explicit consumer migration is approved.
