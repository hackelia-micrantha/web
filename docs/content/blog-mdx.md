# Blog MDX Authoring and Migration

## Status

The blog is migrating incrementally from TSX-backed article bodies to declarative MDX. The first representative route is:

```text
/blog/ai-pipelines-need-control-boundaries
```

The migration deliberately keeps legacy posts working while each article moves through the same validated vertical slice.

## File pattern

Each migrated article has two files:

```text
app/content/posts/<slug>.mdx
app/routes/blog.<slug>.tsx
```

The MDX file is the canonical article source. It owns frontmatter and body content.

The static route wrapper owns Remix behavior:

- loader data;
- SEO metadata;
- JSON-LD;
- frontmatter validation;
- related-post and series resolution;
- the shared article layout;
- the allow-listed MDX component map.

Do not put Remix loaders, actions, headers, environment access, or route exports in the MDX file.

## Frontmatter

Use this shape:

```yaml
---
slug: example-article
title: Example Article
description: A concise search and social description.
date: "2026-08-03"
excerpt: A short index-card summary.
tags:
  - architecture-notes
  - example
relatedSlugs:
  - another-article
series:
  slug: example-series
  title: Example Series
  order: 2
---
```

Rules enforced by `defineBlogMdxPost`:

- `slug`, `title`, `description`, `date`, and `excerpt` are non-empty strings;
- dates use quoted `YYYY-MM-DD` strings so YAML does not coerce them into `Date` objects;
- tags and related slugs are non-empty, unique string arrays;
- an article cannot relate to itself;
- series order is a positive integer;
- the frontmatter slug must match the static route slug.

During the incremental migration, the server-side compatibility layer also fails when migrated metadata or series placement diverges from the legacy catalog.

## Allowed article components

The current component map is intentionally small:

- `Callout` for a highlighted key point;
- `Figure` for an image, title, caption, and accessible alternative text;
- `PostLink` for an internal blog link by slug.

Example:

```mdx
<Callout>
  <p>A bounded statement.</p>
</Callout>

<Figure
  title="Control boundary"
  caption="A concise explanation."
  src="/img/blog/example.svg"
  alt="Accessible description of the diagram"
/>

See <PostLink slug="another-article">Another Article</PostLink>.
```

Prefer Markdown headings, paragraphs, lists, tables, emphasis, and links. Add a component to the shared map only when multiple articles need a stable semantic pattern. Do not create article-specific React components for ordinary prose.

## Server-only metadata assembly

Index, series, related-post, and transitional catalog resolution belong in `.server.ts` modules. Browser route modules receive serializable loader data only.

This boundary matters because the legacy catalog still contains TSX bodies. Importing it directly from an index or static article route can cause esbuild to share unrelated article bodies with that route's browser chunk.

The required `test:mdx:build` contract inspects the emitted Remix manifest and eager import closure. It verifies:

- the migrated body is present in its static article route;
- the migrated body is absent from the blog index route;
- a known unrelated legacy article body is absent from both closures.

## Validation

Run the complete local sequence:

```sh
yarn install --frozen-lockfile --non-interactive
yarn format:check
yarn lint
yarn typecheck
yarn build
yarn test:mdx:build
yarn test:e2e e2e/mdx.spec.ts
yarn cloudflare:functions:build
yarn test:cloudflare:bundle-budget
yarn test:cloudflare:adapter
yarn test:cloudflare:runtime
```

The JavaScript-disabled Playwright test proves that the article heading, prose, figure, and internal links are present in server-rendered HTML before hydration.

The source-isolated Cloudflare runtime contract proves that the compiled article runs from staged static assets and the prebuilt Worker without source MDX, TSX, `node_modules`, or compiler packages at request time.

## Migrating another article

1. Copy the existing published metadata and body without rewriting it.
2. Create `app/content/posts/<slug>.mdx` with quoted date frontmatter.
3. Replace legacy JSX-only patterns with Markdown or an existing allow-listed component.
4. Add a static `app/routes/blog.<slug>.tsx` wrapper using the shared article layout.
5. Add a `.server.ts` assembly module for frontmatter, related posts, series data, and transitional drift checks.
6. Replace the article's index and series metadata with validated frontmatter.
7. Extend JavaScript-disabled and workerd coverage to the new representative behavior when it adds a new content pattern.
8. Confirm `test:mdx:build` keeps the body out of unrelated route closures.
9. Remove the legacy TSX body only after all catalog, series, related-link, sitemap, and route consumers use the new metadata source.

## Remaining migration work

The first vertical slice intentionally retains the legacy TSX copy as a temporary drift detector. Follow-up slices must:

- migrate the remaining article bodies;
- generate the complete metadata catalog and route wrappers;
- remove duplicate TSX bodies and legacy content-component lookups;
- derive sitemap and related/series validation from the generated catalog;
- add stricter MDX source or AST policy enforcement before arbitrary contributors author content.
