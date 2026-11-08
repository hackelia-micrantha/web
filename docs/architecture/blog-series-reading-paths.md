# Blog series: audience framing and reading paths

## Editorial decision (2026-11-07)

Keep the two published series distinct, with their existing URLs and
frontmatter order. **Architecture Control Boundaries** addresses integration,
modernization, identity, recovery, and replaceable adapters for delivery
teams and prime/subcontractor architecture reviewers. **The Assurance
Stack** (stable slug: `governance-native-engineering`) extends those
boundaries to AI-assisted software delivery, exact-change evidence,
approvals, scoped authority, and replayability.

The narrative hinge is **AI Pipelines Need Control Boundaries**: AI reasoning
is an uncertain step inside an integration workflow, not a replacement for
its contracts or its operator-owned write boundary. **The Missing Layer in
Agentic Development: Precise Governance** carries that constraint into
code, CI, dependency, and deployment effects. Anthesis is a research
effort; published articles must not describe a proposed enforcement
boundary as production-qualified.

## Curated reading paths

The blog index offers two static editorial sequences:

- Integration / modernization: Secure Platform Integration Is Not Plumbing
  -> AI Pipelines Need Control Boundaries -> The Missing Layer in Agentic
  Development -> Replayability Is a Governance Problem.
- AI-assisted engineering: The Missing Layer in Agentic Development ->
  Replayability Is a Governance Problem -> Recursive Governance and Agent
  Workflows -> AI Pipelines Need Control Boundaries.

Paths are recommendations, **not additional series memberships**. Link
labels resolve from the published post manifest, and any missing/unpublished
path target must fail rather than silently become an invalid public link.
Only canonical MDX frontmatter defines series membership and order;
`app/content/blog-series.ts` defines titles/descriptions and derives
navigation. Do not reintroduce manual membership arrays.

## Bridge article disposition

A separate **AI Workflows Are Integration Workflows** article was evaluated
and rejected as redundant with the existing AI Pipelines article plus its
cross-link to The Missing Layer. Reconsider only if a genuinely new
technical case study, implementation evidence, or architecture contract
warrants a standalone article.

## Maintenance gates

When updating a post or series, verify the current published source,
frontmatter, generated metadata, sitemap, previous/next order, accessible
series links, the two curated reading paths, and the rendered destination.
Cross-post candidates from `ryjen/blog` still require the independent
editorial and publication approval described in
[blog-curation-policy.md](blog-curation-policy.md). None are promoted by
this reading-path decision.
