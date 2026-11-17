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

## Release readiness snapshot (not approval)

The release-readiness.json file binds the current canonical repository source
revision and the exact staged MDX, cover, and future route template digests.
It also records a November 6, 2026 HTTP 200 / canonical / index-follow check
of the original public article. The repository offline validation verifies
the local byte bindings, not remote source authenticity or current HTTP
availability. Recheck the canonical content at actual publication.

Status: qualified for editorial release review only. Nothing in this
directory is deployed as a Micrantha article. The candidate has no release
authorization, and activation requires a separately approved publication PR.

## Approved masculine-pastel cover revision

The previously staged cover has been replaced by the reviewed 1200 × 675
WebP illustration. Its muted slate, sage and warm-neutral palette avoids
large generated title text. Visible engineers are middle-aged, with natural
crown thinning or balding. The cover and article description are now
accurate to this illustration.

Source image was generated and approved in the editorial conversation;
the optimized artifact is pinned by the SHA-256 release-readiness manifest.
This is an editorial asset update only and **does not** publish the article.
The canonical personal-blog cover remains unchanged.
