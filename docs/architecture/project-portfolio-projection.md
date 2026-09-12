# Public portfolio projection

`hackelia-micrantha/web` presents Micrantha projects, but it does not own canonical project identity or portfolio tier.

Canonical project metadata is maintained in the private ecosystem registry:

- repository: `hackelia-micrantha/hackelia-micrantha`
- registry: `registry/projects.yaml`
- exclusion inventory: `registry/inventory.md`

The public site consumes a reviewed, checked-in snapshot rather than fetching the private registry at runtime. The snapshot validator pins these source locations so a refresh cannot silently substitute another project authority.

## Boundary

The projection is deliberately narrow:

```text
private canonical registry
  id / name / portfolio / classification / role / lifecycle
                    |
                    | reviewed public-safe snapshot
                    v
app/data/project-registry.snapshot.json
                    |
                    +---- app/data/project-presentation.json
                    |       summary / URLs / architecture copy / display intent
                    v
app/data/project-catalog.ts
                    |
                    v
solutions / laboratory / homepage presentation
```

The snapshot must not contain canonical repository locations, relationships, private summaries, private implementation details, or release evidence. Its `source.commit` pins the exact canonical registry revision used for the projection.

`project-presentation.json` may own:

- marketing summary;
- public URL and optional public source/community URL;
- architecture-role display copy;
- presentation slug;
- explicit `shown` / `hidden` disposition and target surfaces.

It must not override canonical:

- project name;
- portfolio tier;
- classification;
- architectural role;
- lifecycle.

Presentation-only entries are allowed for useful public surfaces that are not canonical registered projects, but they must be explicitly marked `presentation-only`. They do not acquire portfolio membership by appearing on the website.

## Portfolio dispositions

Every canonical `featured` or `supporting` project must have one explicit web disposition.

`shown` means the project is intentionally present in the public project catalogue. Its surfaces must therefore include `catalog`; `homepage` is an optional additional surface. A shown canonical entry must already have a canonical `solution` or `laboratory` classification because those are the two catalogue collections.

`hidden` requires a rationale and must not have a canonical presentation entry. This prevents a project from being declared hidden while still leaking into the catalogue through presentation configuration. A hidden disposition does not change canonical portfolio membership.

Homepage selection is a presentation choice over canonical featured projects. A project can appear on the homepage only when:

1. the canonical snapshot marks it `portfolio: featured`;
2. its web disposition explicitly includes `catalog` and `homepage`;
3. it has a canonical `solution` or `laboratory` classification compatible with the current homepage information architecture.

The broader Work information architecture remains tracked separately. Portfolio tier is not inferred from homepage presence.

## Excluded repository families

The snapshot records reviewed portfolio-family exclusions from the canonical inventory. Garden and Scouter must not be reintroduced as web projects merely because their repositories or historical assets still exist.

Repository retention, health monitoring, archival, or historical references remain separate concerns from portfolio membership.

## Validation

Run:

```sh
yarn test:project-registry-projection
```

The validator fails on:

- stale or missing canonical IDs;
- duplicate IDs or slugs;
- missing featured/supporting dispositions;
- attempts to override canonical fields in web presentation metadata;
- hidden portfolio projects with catalogue presentation entries;
- canonical presentation entries without a solution/laboratory classification;
- homepage selections that are not canonical featured projects;
- shown portfolio projects that omit the catalogue surface;
- presentation-only entries that attempt to declare canonical status;
- reintroduction of explicitly excluded portfolio families;
- private or otherwise unapproved fields in the canonical snapshot;
- source provenance that does not point at the canonical Micrantha registry/inventory or a pinned commit.

The test also verifies normalization is deterministic regardless of input array order.

CI runs this validation independently of browser tests so projection drift fails early.

## Refresh procedure

When canonical project metadata changes:

1. review the current `registry/projects.yaml` and `registry/inventory.md`;
2. update only the public-safe fields in `project-registry.snapshot.json`;
3. update `source.commit` to the exact reviewed canonical commit;
4. reconcile `project-presentation.json` dispositions and presentation metadata;
5. run `yarn test:project-registry-projection`, typecheck, build, and project-catalog/browser tests;
6. review the diff for accidental disclosure of private repository paths, summaries, relationships, or implementation details.

The web application never needs a standing credential to the private registry, and deployment must not fetch the private registry at runtime.
