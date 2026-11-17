# Staged cross-post: The Envelope

**Editorial draft; not routable, indexed, or publicly hosted through Micrantha's site build.**

Canonical source: `ryjen/blog` PR #143, personal essay
`content/posts/the-envelope-contract-based-agentic-ai.md`.
The canonical source currently has `draft: true` and needs independent
editorial/publication acceptance before this article can be published.

## Contents

- `content.mdx`: full adapted article, `status: draft`.
- `route.tsx.template`: future native route, intentionally not executable as a route.
- `cover.webp`: original cover stored outside `public/`.

**P2 review repair:** The route template overrides the Article JSON-LD `image`
with the article's cover (rather than Micrantha's logo). The publisher logo
remains unchanged, and it attributes the article to Ryan Jennings.

## Future separate publication PR

1. Publish and verify the canonical source article first.
2. Confirm the cover complies with the personal-blog editorial invariants.
3. Move `content.mdx` and `route.tsx.template` into
   `app/routes/blog.the-envelope-contract-based-agentic-ai/`.
4. Move `cover.webp` to
   `public/img/blog/the-envelope-contract-based-agentic-ai.webp`.
5. Change `status` to `published`, regenerate metadata and sitemap.
6. Reconcile any competing blog PRs, update bundle-isolation/E2E regression
   checks, verify canonical URL and structured image metadata.
7. Run exact-head CI, visual validation, and explicit publication approval.

Do not move these files into a routable or public location in this staging PR.
Prior preview URLs might remain accessible even after branch content is
removed; preview cleanup is an independent Cloudflare access decision.
