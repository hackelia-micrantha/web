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
