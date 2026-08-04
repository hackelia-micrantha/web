# Blog publication workflow

## Decision

The current Remix application uses a fail-closed publication model.

Only content that is publishable for the target build may appear in either of these routable locations:

- the runtime blog metadata registries consumed by `app/content/blog-provider.ts`;
- a static `app/routes/blog.<slug>/` MDX route directory.

Draft and future content must remain outside both locations. Hiding an entry only from the blog index or sitemap is not sufficient because a direct URL would still exist.

This preserves complete server rendering, JavaScript-disabled access, deterministic Cloudflare builds, and native Remix route splitting without request-time MDX compilation.

## Publication metadata

`app/content/blog-publication.js` is the transitional publication manifest while legacy TSX articles remain. It records the status of every routable registry slug.

The allowed statuses are:

- `published`
- `draft`

Every entry that remains in a runtime registry must have `published` status and a date on or before the publication cutoff. A draft manifest entry may exist without a runtime route, but a published manifest entry must have matching routable metadata.

The representative MDX article also declares `status: published` in frontmatter. Its static route verifies status and manifest parity before rendering. The build validator owns the target-date cutoff so the server and browser do not independently recompute wall-clock publication state during hydration. As the remaining articles move to MDX, status ownership should move into their canonical frontmatter and the transitional manifest can be generated or removed.

## Publication cutoff

Validation uses the current UTC calendar date by default.

`BLOG_PUBLICATION_DATE=YYYY-MM-DD` may be supplied explicitly to validate a scheduled publication build or preview. Production CI and normal deployment must leave this variable unset unless an intentional dated release is being exercised.

The cutoff is enforced by:

- `scripts/check-blog-content-boundaries.js` before CI and deployment builds;
- `scripts/generate-sitemap.js` before sitemap generation.

Static MDX route modules enforce published status and manifest parity without consulting the browser clock. This lets an explicitly dated preview hydrate deterministically while the build pipeline remains authoritative for whether the route may exist.

Future-dated content is therefore not silently indexed or deployed. It must stay non-routable until its publication build is intentional.

## Authoring a draft

1. Keep the draft outside `app/routes` and outside the runtime metadata registries.
2. Use `status: draft` in canonical MDX frontmatter when the draft content pipeline supports it.
3. Do not add the slug as a published entry in the publication manifest.
4. Preview through a non-production authoring workflow rather than creating a public route.

## Publishing an article

1. Confirm the article date is on or before the target publication cutoff.
2. Set canonical MDX frontmatter to `status: published`.
3. Add or generate the static route and runtime metadata projection.
4. Add the publication manifest entry while legacy registries remain.
5. Run:

   ```sh
   yarn test:unit
   yarn test:blog-mdx-validation
   yarn test:blog-content-boundaries
   node scripts/generate-sitemap.js
   yarn typecheck
   yarn build
   yarn cloudflare:functions:build
   yarn test:integration
   yarn test:e2e
   yarn test:e2e:cloudflare
   ```

6. Verify the article appears in the index, series navigation, related links, structured data, and sitemap.

## Test layers

- Unit tests exercise date parsing, cutoff behavior, manifest coverage, draft exclusion, future-date rejection, and MDX status rules.
- Integration tests exercise the direct Cloudflare Pages adapter and the source-isolated workerd artifact, including 404 behavior for unpublished URLs.
- End-to-end tests exercise published articles, client navigation, JavaScript-disabled rendering, and unpublished-route exclusion in Chromium.

## Follow-up

Issue #55 still needs to migrate the remaining TSX article bodies, make frontmatter the complete metadata authority, and verify browser-chunk isolation across the expanded MDX route set.
