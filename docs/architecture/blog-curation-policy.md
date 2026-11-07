# Personal-blog curation into Micrantha Architecture Notes

## Editorial authority

`ryjen/blog` is a source of candidate writing, **not a publication feed**.
Curate an article only when it strengthens Micrantha's intended technical
audiences and adds independently defensible information. Selection, adaptation,
series membership, and publication are distinct review decisions.

The original author's [source-side policy](https://github.com/ryjen/blog/blob/main/docs/micrantha-curation.md)
also applies. For the mechanical publishing process see
[Blog publication workflow](blog-publication-workflow.md).

## Curation acceptance

A candidate review must document:

1. **Fit and distinctiveness.** Identify the relevant reader and why the
   article adds useful evidence, implementation detail, or a defensible mental
   model beyond existing Architecture Notes. Do not publish purely to increase
   article count or to imply commercial work that has not occurred.
2. **Provenance.** Pin the original repository path and source revision, author,
   canonical source URL (or clearly state it is unpublished), and corrections
   that must be reconciled. Read the entire source, not only excerpts.
3. **Claims and rights.** Check technical precision, currency of named
   technology and standards, client/privacy constraints, quotations, image/code
   licensing and attribution. Preserve observed/estimated/inferred/planned
   distinctions, especially Anthesis and other research projects.
4. **Editing.** The Micrantha edition may use tighter architecture framing and
   an organizational introduction; preserve the original argument. Explicitly
   review any materially new claim rather than attributing it to the author by
   default.
5. **Search attribution.** For a derivative cross-post, keep the published
   personal source as the canonical search URL and provide a visible source
   attribution link. Ensure the destination's HTML canonical, OpenGraph,
   Article JSON-LD author/image, and publisher metadata agree. Do not
   canonicalize to a non-public source.
6. **Discovery and series.** Decide deliberately whether the piece belongs in
   `The Assurance Stack`, `Architecture Control Boundaries`, neither, or a
   new separately approved series. Series membership is not inferred from
   source tags, previous personal-blog taxonomy, or adjacent articles.
   Use validated `series.slug` and contiguous `series.order`, reviewing
   changed previous/next, index and series landing navigation. Preserve
   existing series URLs.
7. **Maintenance owner.** Record who will review future material source
   revisions; compare substantive drift before updating the derivative.

## Fail-closed publication states

| Personal source                                   | Micrantha candidate | Permitted outcome                                       |
| ------------------------------------------------- | ------------------- | ------------------------------------------------------- |
| `draft: true`, unmerged, or not publicly verified | Adaptation reviewed | Private `editorial/staged/blog.<slug>/` only            |
| Public, source corrections pending                | Adaptation reviewed | Private staging; reconcile corrections first            |
| Public and source reviewed                        | Adaptation accepted | Separate publication PR **eligible**, not authorized    |
| Publication PR explicitly approved and validated  | `status: published` | Promote to routable path and deploy; verify live output |

A staged item must keep `status: draft`, `route.tsx.template` inert,
and its cover outside `public/`. Existing staging validation checks
non-public routing, generated metadata, sitemap and cover boundaries.
An open/merged PR, passing CI, or Cloudflare preview is **not** publication
authorization. An old immutable preview may remain reachable and must be
addressed as a separate privacy/deployment issue.

## Promotion checklist

- [ ] Canonical personal source resolves publicly, content matches reviewed
      source SHA, and outstanding upstream corrections are accepted.
- [ ] Editorial rationale, author, source URL, reuse permissions, and claim
      review are recorded in a Micrantha PR.
- [ ] Series/no-series placement and reading order are reviewed; related-post
      links and cross-series transitions make sense.
- [ ] Destination adaptation has visible attribution and correct canonical,
      SEO, JSON-LD, cover and alt text.
- [ ] No nonpublic material, secrets, unverified performance claims, or
      unsupported deployment claims are published.
- [ ] Only after explicit release approval, move MDX/route and cover to their
      public locations, update `status`, regenerate blog projection and sitemap.
- [ ] Run the full exact-head tests described in the publication workflow,
      including route/chunk isolation, SSR/no-JS, security, and desktop/mobile
      visual checks.
- [ ] Verify the actual Micrantha deployment and source-site canonical URL
      independently. Log deployment evidence, and maintain update/retirement
      responsibility.

No automated source-repository sync or default bulk promotion is authorized.
