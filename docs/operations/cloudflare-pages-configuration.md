# Cloudflare Pages Configuration Parity

## Authority

`wrangler.toml` and `config/cloudflare-pages-contract.json` are the repository source of truth for the deployable Pages configuration.

Required CI runs `yarn test:cloudflare:config` to reject drift between:

- Pages project name;
- static output directory;
- compatibility date;
- compatibility flags;
- source-map behavior;
- the default project and output arguments in `deploy:cloudflare`;
- the expected Pages Function entry.

## Contracted values

| Setting                | Required value          |
| ---------------------- | ----------------------- |
| Pages project          | `micrantha-web`         |
| Build output directory | `./public`              |
| Compatibility date     | `2026-03-21`            |
| Compatibility flags    | `nodejs_compat`         |
| Upload source maps     | enabled                 |
| Pages Function entry   | `functions/[[path]].js` |

## Dashboard-only configuration

The Cloudflare API token and any sensitive bindings remain outside the repository.

`MICRANTHA_ANALYTICS_ID` is an optional, non-sensitive runtime binding. Missing analytics configuration must not block rendering.

Any new dashboard-only value must be added to `config/cloudflare-pages-contract.json` with:

- its binding name;
- whether it is required;
- whether it is sensitive;
- its preview and production ownership;
- its expected failure behavior.

Secrets must never be committed or emitted in CI artifacts.

## Parity review

Review dashboard parity when:

- `wrangler.toml` changes;
- Wrangler is upgraded;
- a binding is added, removed, or renamed;
- the Pages project or branch strategy changes;
- a production deployment behaves differently from the asset-first workerd harness.

The reviewer must compare the Cloudflare Pages project settings with the contracted values above and confirm:

1. the production project is `micrantha-web`;
2. the compatibility date is `2026-03-21`;
3. `nodejs_compat` is enabled;
4. the build output directory is `public`;
5. source-map upload policy matches `wrangler.toml`;
6. documented bindings exist in the intended preview and production environments;
7. no undocumented dashboard transform, redirect, or cache rule changes application semantics.

Record intentional dashboard-only differences in this document before deployment.

## Post-deploy smoke check

After a configuration, Wrangler, adapter, or compatibility-date change, verify the production deployment:

```sh
curl -sS -D - https://micrantha.com/ -o /tmp/micrantha-home.html
curl -sS -D - https://micrantha.com/contact -o /dev/null
curl -sS -D - -X POST https://micrantha.com/services -o /tmp/micrantha-405.html
curl -sS -D - https://micrantha.com/blog/ai-pipelines-need-control-boundaries \
  -o /tmp/micrantha-article.html
```

Confirm:

- `/` returns 200 with the expected CSP, cache, and security headers;
- `/contact` returns 301 with `Location: /services`;
- `POST /services` returns 405;
- the article returns 200 with its canonical URL and Article JSON-LD;
- generated CSS and browser assets return 200;
- the deployed Worker remains within the recorded bundle budget.

The post-deploy check validates CDN and dashboard behavior that a local workerd harness cannot reproduce. It does not replace required CI.
