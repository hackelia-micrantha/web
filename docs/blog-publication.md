# Blog publication workflow

Blog publication is structural. Content is not hidden at runtime after being added to the public route graph; unpublished content stays outside that graph.

## Publication states

Every MDX article declares one of two frontmatter states:

- `draft`: work that is not available from the production application.
- `published`: content eligible for production once its `date` is today or earlier in UTC.

A `published` article with a future date is scheduled content. It remains structurally unpublished until its date arrives.

## Draft and scheduled content

Drafts and future-dated articles must remain outside `app/routes` and outside the published blog registries. A suitable private branch or a non-route working directory may hold work in progress, but production code must not import it.

Do not create any of these until publication:

- `app/routes/blog.<slug>/route.tsx`
- `app/routes/blog.<slug>/content.mdx`
- a published registry entry
- related-post references from published posts
- sitemap or series membership

Because the slug is absent from both the route graph and the published registry, a direct production request returns `404` through the existing dynamic blog route.

## Publishing an article

1. Set frontmatter `status` to `published`.
2. Confirm `date` is a valid `YYYY-MM-DD` calendar date and is today or earlier in UTC.
3. Create the static route folder `app/routes/blog.<slug>/`.
4. Add `content.mdx` and its route wrapper.
5. Add matching metadata to the published registry without a legacy TSX renderer.
6. Add only known related slugs and a valid series membership, if applicable.
7. Regenerate the sitemap when metadata changes.
8. Run `yarn test:blog-mdx-validation`, `yarn test:blog-mdx-publication`, and `yarn test:blog-content-boundaries`.

Required CI and `deploy:cloudflare` repeat these checks. A routable draft, a future-dated route, a future-dated published registry entry, malformed YAML, or an invalid calendar date blocks deployment.

## Production and preview behavior

Production has no unpublished-content override. Draft and scheduled routes are not deployed, and production requests for their slugs return `404`.

Local review should use a private branch and temporary local route changes. Those changes must not be merged while the article is draft or future-dated. The publication checks intentionally fail closed if such a route reaches CI.

## Time boundary

Publication eligibility uses the current UTC calendar date. Date-only metadata therefore has one stable interpretation across developer machines, GitHub Actions, and Cloudflare builds.
