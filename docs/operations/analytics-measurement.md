# Analytics measurement contract

## Scope

This document defines the repository-owned product/usage measurement contract
for `micrantha.com`.

It layers on the Micrantha observability standard/profile merged through
`hackelia-micrantha/.github#148` at
`704fa3da3c35dc0dd80ebed6524f6f9eb696cb68`.

Product/usage analytics is separate from operational observability, security
evidence, and application authority.

## Current implementation

The site has one optional analytics integration:

- component: `app/components/analytics.tsx`;
- script origin: `https://analytics.micrantha.com/umami.js`;
- repository-supplied analytics data: website ID only;
- enabled only when `MICRANTHA_ANALYTICS_ID` or the compatible
  `ANALYTICS_ID` binding is present;
- absent binding means no analytics script is rendered.

Repository search currently finds no:

- custom analytics events;
- `umami.identify` or equivalent user identity calls;
- session replay;
- fingerprinting library;
- application cookie API;
- `localStorage`/`sessionStorage` analytics identity.

These are source-code facts. They are not claims about reverse proxies,
Cloudflare, the deployed Umami version/configuration, or database retention.

## Measurement questions

The current pageview-only integration exists to answer two bounded questions:

1. **Which public pages receive enough use to justify continued maintenance and
   prominence?**
2. **Do major navigation/content changes materially change which public pages
   are reached?**

No additional measurement is justified by this contract.

If a future decision requires another question, define the question first and
review the minimum new event/property set before instrumenting it.

## Minimum measurement

The application intentionally emits no custom event payload.

The maximum repository-owned collection surface is therefore:

```text
page rendered
  -> optional provider script
  -> automatic pageview behavior of the verified deployed provider
```

The application does not add:

- account/user identity;
- email/contact identity;
- arbitrary click payloads;
- form contents;
- prompt/content bodies;
- session replay;
- custom device fingerprinting;
- unrestricted application state.

Provider-default pageview fields must be verified against the deployed
`analytics.micrantha.com` version/configuration before being described as
current production behavior.

## Identity and aggregation

The application has no account/user analytics identity.

Any provider-derived session identity, IP processing, user-agent processing,
referrer handling, path/title capture, screen/language metadata, or
generalization/aggregation is a deployment concern and must be documented from
the actual deployed provider configuration.

Do not add application-level identity merely to improve analytics continuity.

## Disablement and failure semantics

### Operator disablement

Omit `MICRANTHA_ANALYTICS_ID` / `ANALYTICS_ID`, then allow existing
browser/edge cache entries to expire or explicitly invalidate the affected
cached HTML before treating the deployment as analytics-disabled.

Verify the post-invalidation/expiry deployment by requesting representative
public pages and confirming:

- no analytics script element is present;
- no request to the analytics script origin occurs from this integration;
- rendering, navigation, SEO, accessibility, and content remain functional.

The repository's cache policy can retain previously rendered HTML after a
binding change, so removing the binding is the configuration step, not by
itself proof that already-cached documents have stopped referencing analytics.

Analytics is therefore optional deployment configuration, not application
authority.

### Provider/export failure

Failure to load or deliver analytics must not change:

- route rendering;
- navigation;
- security policy decisions;
- user-facing content correctness;
- deployment success criteria unrelated to analytics.

No retry queue, offline analytics store, or custom delivery protocol is owned by
this repository.

## End-user/browser opt-out

The repository currently provides no analytics-specific end-user toggle.

That is an explicit unresolved product/privacy decision, not an accidental
contract.

Before adding one, verify the deployed provider's supported opt-out/DNT
semantics and decide whether:

- browser DNT should be honored by the integration;
- a site-local preference is required;
- operator-level disablement is sufficient for the intended deployment/privacy
  posture.

Do not invent a custom consent/identity store solely for analytics.

## Retention and deletion

The repository does not own or currently encode analytics database retention.

Before privacy copy makes a concrete retention/deletion claim, deployment
evidence must identify:

- deployed Umami version;
- data store/operator;
- retention window;
- deletion mechanism;
- backup retention interaction;
- proxy/IP handling;
- data residency if material.

The absence of a repository retention value must not be represented as a
retention guarantee.

## Privacy-page relationship

`app/routes/privacy.tsx` must describe deployed behavior, not provider defaults
or generic privacy-policy boilerplate.

Do not update provider-specific cookie, identity, IP, retention, or deletion
claims from this document alone. First attach deployment evidence to
`hackelia-micrantha/web#166`.

## Change control

Any change that introduces one of the following requires an explicit measurement
question and privacy review:

- custom events/properties;
- user/account identity;
- persistent browser identifiers;
- session replay;
- fingerprinting;
- form/content capture;
- new analytics provider;
- remote export destination change;
- retention expansion.

Prefer the existing provider/configuration when it can satisfy the declared
question. Do not build a Micrantha analytics backend merely for conformance.
