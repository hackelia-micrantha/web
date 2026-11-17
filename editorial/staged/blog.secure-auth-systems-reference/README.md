# Staged cross-post: secure-auth-systems-reference

**Editorial draft only; no route or public cover.**

Canonical personal source: ryjen/blog, content/posts/secure-auth-systems-reference.md
at https://ryanjennin.gs/posts/secure-auth-systems-reference/.

This folder holds a full reviewed MDX adaptation, a future route template,
and the original converted cover. The MDX frontmatter is status: draft.
The figure and route-template paths anticipate future public assets and a
future route but are not part of any current Micrantha site build.

## Publication and reconciliation

A separate publication PR must confirm the canonical source is live and
consistent with the cross-post. The authentication article also depends on
the canonical ryjen/blog PR #145 corrections being accepted.

After explicit authorization, move content.mdx and route.tsx.template
to app/routes/blog.secure-auth-systems-reference/, move cover.webp to
public/img/blog/secure-auth-systems-reference.webp, set status: published, copy the shared
blog-crosspost-route.tsx.template to app/content/blog-crosspost-route.tsx,
regenerate metadata/sitemap, update route and E2E tests, and verify
exact-head CI and desktop/mobile visuals. Reconcile with other cross-post PRs.

Earlier preview builds on old commits may still be accessible and require
separate Cloudflare cleanup.
