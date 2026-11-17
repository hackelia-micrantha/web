# Staged cross-post: Your AI Chat Is Not a Database

**State:** Editorial draft, intentionally **not routable, not indexed, and not
eligible for publication** on `micrantha.com`.

**Canonical source:** `ryjen/blog`, `content/posts/ai-chat-not-a-database.md`,
merged in PR [#146](https://github.com/ryjen/blog/pull/146) at
`9710c214c744daed3e59a3e428372ae687ee0774`. The original retains
`draft: true` and must be published separately before the canonical URL
becomes publicly available.

The files in this directory are a prepared Micrantha MDX edition:

- `content.mdx` — strict-MDX-compatible text, with `status: draft`.
- `route.tsx.template` — eventual Remix route, **not compiled or routable**.
- `cover.webp` — original cover, stored outside the site's public assets.

The MDX `<Figure>` path anticipates a _future_ asset at
`/img/blog/ai-chat-not-a-database.webp`; it is deliberately absent from the
current public asset tree.

## Independent publication transition

Publication requires a separate, explicitly approved PR that:

1. Confirms the personal canonical article is publicly available and correct.
2. Moves `content.mdx` and `route.tsx.template` to
   `app/routes/blog.ai-chat-not-a-database/{content.mdx,route.tsx}`.
3. Moves `cover.webp` to `public/img/blog/ai-chat-not-a-database.webp`.
4. Updates the MDX status from `draft` to `published`.
5. Regenerates `app/content/blog.generated.ts` and `public/sitemap.xml`.
6. Updates blog chunk-isolation and structured-data E2E tests and runs the
   complete exact-head build, browser, security, and publication checks.
7. Reconciles with Micrantha PRs #182 and #183 if either has merged.

Do not merge a change that moves these files into routable/public locations
without explicit publication authorization.

**Exposure note:** Earlier head `3e7e7b2` may have been served by an
automatically generated Cloudflare Pages preview. Removing a routable page
from the branch does not necessarily delete an immutable earlier preview URL.
