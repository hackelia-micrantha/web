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

The application has no browser analytics client, provider website identifier,
custom events, identity API, replay, fingerprinting, or analytics browser
storage. The obsolete Umami integration and its CSP permissions are removed;
the legacy `MICRANTHA_ANALYTICS_ID` and `ANALYTICS_ID` bindings have no effect.
The reserved Micrantha analytics hostname and Phenology product are not
activated by this change.

These are source-code facts, not proof of removal from previously deployed
or cached documents, edge-managed collection, or historical database retention.

## Separately managed Cloudflare Web Analytics

The Cloudflare `micrantha.com` zone has RUM enabled and its Web Analytics
site is configured for automatic injection. A read-only GraphQL query on
2026-11-14 recorded browser page-load events for `micrantha.com` during
November 7–14, 2026. This is observed aggregate collection, but not a
page-by-page injected-HTML, CSP, or browser-network verification.

Removing the application-owned integration does **not** disable Cloudflare's
independent edge-managed Web Analytics. The privacy route distinguishes
application behavior from provider configuration.

Live document/network verification, any historical provider/database and
backup inventory, and the final retention and disablement disposition
remain governed by `hackelia-micrantha/hackelia-micrantha#64`.

## Measurement questions

Use existing aggregate Cloudflare page-load data to answer two bounded
questions:

1. **Which public pages receive enough use to justify continued maintenance and
   prominence?**
2. **Do major navigation/content changes materially change which public pages
   are reached?**

No additional measurement is justified by this contract.

If a future decision requires another question, define the question first and
review the minimum new event/property set before instrumenting it.

## Minimum measurement

The application intentionally emits no custom event payload.

The application does not add:

- account/user identity;
- email/contact identity;
- arbitrary click payloads;
- form contents;
- prompt/content bodies;
- session replay;
- custom device fingerprinting;
- unrestricted application state.

Provider-default pageview fields must be verified against the actual
Cloudflare deployment before being described as current production behavior.

## Identity and aggregation

The application has no account/user analytics identity.

Any provider-derived session identity, IP processing, user-agent processing,
referrer handling, path/title capture, screen/language metadata, or
generalization/aggregation is a deployment concern and must be documented from
the actual deployed provider configuration.

Do not add application-level identity merely to improve analytics continuity.

## Disablement and failure semantics

### Operator disablement

Cloudflare collection is controlled through Cloudflare configuration.
Application source does not include an analytics switch. After an application
release, allow earlier cached documents to expire or be invalidated before
evaluating the current deployment.

Verify representative rendered pages, response headers and browser requests.
Distinguish provider-injected measurement from application-owned code and
confirm that rendering, navigation, SEO, accessibility and content remain
functional.

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

- active provider configuration and any historical Umami data;
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
`hackelia-micrantha/hackelia-micrantha#64`.

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
