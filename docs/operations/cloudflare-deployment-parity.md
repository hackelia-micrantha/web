# Cloudflare Deployment Configuration Parity

## Purpose

The repository defines the application build, Pages Function, compatibility settings, routing policy, and deployment command. Cloudflare also stores project-level settings that cannot be committed, including the selected production branch, custom domains, secrets, and environment bindings.

This checklist prevents dashboard or API configuration from silently diverging from the tested repository contract.

## Repository source of truth

Verify the deployed Pages project against these committed inputs:

| Concern                       | Repository source                                      |
| ----------------------------- | ------------------------------------------------------ |
| Project name                  | `wrangler.toml` and the default in `deploy:cloudflare` |
| Static output                 | `pages_build_output_dir` in `wrangler.toml`            |
| Compatibility date            | `compatibility_date` in `wrangler.toml`                |
| Compatibility flags           | `compatibility_flags` in `wrangler.toml`               |
| Source-map policy             | `upload_source_maps` and the deploy command            |
| Pages Function entry          | `functions/[[path]].js`                                |
| Functions routing             | `public/_routes.json`                                  |
| Build and validation sequence | `package.json` scripts and required CI                 |
| Worker size policy            | `config/cloudflare-bundle-budget.json`                 |
| Runtime artifact contract     | `docs/operations/cloudflare-runtime-validation.md`     |

The current checked-in baseline expects:

- Pages project: `micrantha-web` unless deliberately overridden;
- production branch: `main` unless deliberately overridden;
- static output directory: `public`;
- compatibility date: `2026-03-21`;
- compatibility flag: `nodejs_compat`;
- source-map upload enabled;
- application deployment performed through the lockfile-pinned Wrangler command.

## Dashboard and API-owned settings

The following settings must be reviewed in Cloudflare because they are not fully represented by repository files:

- the Pages project connected to `micrantha.com`;
- production and preview branch selection;
- custom domains and redirect behavior;
- environment variables and bindings for production and preview;
- deployment access tokens and their least-privilege scope;
- dashboard build settings, when Git integration is enabled;
- any Functions, cache, redirect, header, or transform rules configured outside the repository;
- source-map and observability settings that affect uploaded artifacts;
- deployment retention and rollback expectations.

Do not copy secret values into issues, pull requests, logs, screenshots, or this repository. Record only the variable or binding names and whether each environment is configured.

## Verification procedure

Perform this review before the first production deployment, after changing compatibility settings or deployment topology, and whenever unexplained production drift is observed.

1. Run the complete repository validation sequence:

   ```sh
   yarn install --frozen-lockfile --non-interactive
   yarn typecheck
   yarn build
   yarn cloudflare:functions:build
   yarn test:cloudflare:bundle-budget
   yarn test:cloudflare:adapter
   yarn test:cloudflare:runtime
   ```

2. Open the intended Cloudflare Pages project or retrieve its configuration through an authenticated administrative API.
3. Compare the project name, production branch, output directory, compatibility date, compatibility flags, and source-map policy with the committed files.
4. Confirm production and preview have the required variable and binding names. Do not reveal their values.
5. Confirm no dashboard-only rule overrides repository-owned routing, headers, redirects, or cache behavior without an explicit issue and documentation update.
6. Deploy to a preview branch using the pinned repository command.
7. Exercise the same representative requests used by the local runtime contract: success, static asset, nested article, bot, redirect, controlled 405, and 404.
8. Record the verification evidence in the deployment issue or release record.

## Evidence record

Use this template without secret values:

```text
Verification date:
Operator:
Cloudflare account/project:
Repository commit:
Preview deployment:
Production branch:
Custom domains verified:
Compatibility date and flags match:
Required variable/binding names present:
Dashboard-only rules reviewed:
Preview smoke contract passed:
Known differences and linked issues:
```

A screenshot or exported configuration may be attached when access controls permit, but it must be reviewed for tokens, account identifiers, secret values, and unrelated private information first.

## Drift handling

When the dashboard and repository disagree:

1. stop the production deployment when the difference affects runtime, security, cache, routing, or artifact behavior;
2. identify which configuration is intentional;
3. update the repository or Cloudflare project through a reviewed change;
4. rerun the preview contract;
5. document the resolved difference and owner.

Do not normalize an unexplained dashboard difference by changing committed configuration solely to make the values match.

## Related work

- `docs/architecture/cloudflare-pages-ssr.md` defines the authoritative production topology.
- `docs/operations/cloudflare-runtime-validation.md` defines the local artifact and workerd contract.
- Issue #58 owns deployed CDN cache validation, performance budgets, and production response timing.
- Issue #57 owns deeper HTTP security-policy hardening.
- Issue #55 extends the runtime contract with the representative MDX and JavaScript-disabled route.

### Manual exact-head production release gate (#129 first slice)

The `.github/workflows/cloudflare-production.yml` workflow provides a **manual** production release entry point while automatic `main` promotion remains an open #129 follow-up. Creating or merging the workflow is not production publication authorization.

Before enabling production execution:

1. Configure the **protected** GitHub `production` environment with required reviewer approval and deployment branch restrictions (`main` only). Verify protections in GitHub; the workflow cannot create or attest them.
2. Configure narrowly scoped `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as protected environment secrets, not checked-in files. Configure environment variable `CLOUDFLARE_PRODUCTION_DEPLOY_ENABLED=true` **only after** the intended Cloudflare Pages project/domain/production-branch parity is independently reviewed.
3. The admission gate additionally performs an authenticated **read-only** Cloudflare Pages project lookup, requiring the expected `micrantha-web` project, production branch `main`, and associated custom domain `micrantha.com`. An unavailable or denied lookup stops publication. Run the `CI` workflow on `main` and record a successful push run for the exact proposed commit. The dispatch and workflow refs must both be `main`; the workflow checks out `main` rather than an arbitrary user-provided ref. Dispatch `Cloudflare Pages production release` with the full 40-character SHA of **current `main`**. It refuses any stale SHA, non-main checkout, non-main CI, PR-only CI or failed CI evidence.
4. The workflow uses the repository flake setup and frozen Yarn lockfile, runs the checked-in `deploy:cloudflare:verify` contract, checks tracked release contract integrity and main+CI again immediately before effect, then invokes pinned Wrangler with `deploy:cloudflare:publish`. Single-flight concurrency prevents overlapping releases but cannot atomically fence a new main push while a remote upload is already in progress; monitor the post-deploy head and do not interpret an older upload as latest.
5. Record the Cloudflare deployment ID, deployed SHA, verified custom-domain and Pages project identity, live SSR/cache/CSP checks, and rollback identity. A passing dispatch is not evidence of public-edge deployment until production is checked.

For local operators, `yarn deploy:cloudflare` remains a combined validate-and-publish command. The split `verify` and `publish` scripts exist solely to place an exact-head revalidation gate between the two CI steps. No workflow step should ever call `publish` before both the validation script and authorization gates pass.

## Read-only production blog probe (#58)

## Source-derived edge verification

The read-only blog probe resolves expectations from the **candidate repository revision** using the same validated canonical MDX frontmatter and blog series definitions used to build the site. It checks _every_ published article and series, their current titles, descriptions, canonical URLs and SSR navigation links. Adding, reordering or renaming published content automatically changes the expected public graph without editing a second list of routes or article titles.

Two intentionally stable structural assertions remain on the blog index: the labelled series discovery and reading-path sections, plus an ordered list linking to an article. These test that the release actually includes the navigational feature without pinning its editorial copy or the curated article sequence.

Canonical expectations are also resolved from checked-in article route implementations: attributed cross-posts retain approved external canonical URLs, rather than being forced to self-canonical URLs. Unparseable cross-post adapters fail closed.

The probe never derives acceptance expectations from the _live_ sitemap or HTML; that would allow an outdated deployment to validate itself. Run it from the exact source tree whose deployment is being qualified and record the source revision separately. A PASS proves observable parity with that tree, not deployment identity: authenticated Cloudflare deployment evidence is still required. The script performs GETs only to the fixed public hostname and cannot publish.

After an independently approved Pages production release, run:

```sh
node scripts/probe-production-blog.js
```

The probe uses **only** unauthenticated public HTTPS GETs to the fixed `https://micrantha.com` hostname, requests `/blog`, every current published article and series, and a deliberate unknown route. It checks HTTP status/content type, CSP and nonce pairing, `nosniff` / `DENY`, cache classification, public canonical links, source-derived titles/links and stable structural blog discovery/navigation assertions, and the failure route's private no-store policy. It emits a JSON record with response sizes, SHA-256 body hashes, selected _public_ headers, and explicit failures. No secrets, Cloudflare credentials, or deployment mutation are involved.

**Important:** The probe verifies _observable public behavior_, not the deployed Git commit or Cloudflare project identity. It must be paired with the authenticated project/deployment evidence and exact-source release gate. A FAIL may mean pending propagation or a genuine regression; it is not safe to mark the release complete without diagnosis. The probe follows published content automatically; intentional changes to the stable navigation structure or security policy require explicit contract changes.

This probe is deliberately **not invoked as an automatic main-branch deployment**. It can be used manually as a pre/post-release comparator. Post-deployment automation, retry policy, and rollback remain separate decisions after #129's manual release is exercised.
