# Staged cross-post: legacy-system-insights

**Editorial draft only; no route or public cover.**

Canonical personal source: ryjen/blog, content/posts/legacy-system-insights.md
at https://ryanjennin.gs/posts/legacy-system-insights/.

This folder holds a full reviewed MDX adaptation, a future route template,
and the original converted cover. The MDX frontmatter is status: draft.
The figure and route-template paths anticipate future public assets and a
future route but are not part of any current Micrantha site build.

## Publication and reconciliation

A separate publication PR must confirm the canonical source is live and
consistent with the cross-post. The authentication article also depends on
the canonical ryjen/blog PR #145 corrections being accepted.

After explicit authorization, move content.mdx and route.tsx.template
to app/routes/blog.legacy-system-insights/, move cover.webp to
public/img/blog/legacy-system-insights.webp, set status: published, copy the shared
blog-crosspost-route.tsx.template to app/content/blog-crosspost-route.tsx,
regenerate metadata/sitemap, update route and E2E tests, and verify
exact-head CI and desktop/mobile visuals. Reconcile with other cross-post PRs.

Earlier preview builds on old commits may still be accessible and require
separate Cloudflare cleanup.
