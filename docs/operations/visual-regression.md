# Visual regression workflow

Visual regression checks are intentionally separate from required functional browser
coverage. The dedicated CI job runs only after Quality and End-to-end succeed so stale
or intentionally changing screenshots do not consume runner capacity ahead of required
correctness checks.

## Deterministic inputs

The visual suite uses the repository-owned Nix/Playwright toolchain and fixes these
browser inputs in `e2e/visual.spec.ts`:

- desktop Chromium only;
- 1440 × 1600 viewport;
- device scale factor 1;
- `en-CA` locale;
- `America/Vancouver` timezone;
- light color scheme;
- reduced motion;
- disabled screenshot animations and hidden caret.

The CI runner must continue to obtain Chromium and its runtime dependencies through the
repository-owned setup/flake path. Do not restore a privileged browser bootstrap.

## Reviewing a change

Run the visual suite in the repository toolchain:

```sh
yarn playwright test e2e/visual.spec.ts --project=desktop-chromium
```

On a difference, inspect the expected baseline, actual image, diff image, Playwright
report, trace/video when produced, and workflow log before accepting a new baseline.
A changed project card, name, lifecycle, or ordering must be checked against the
canonical public project projection rather than accepted because it appears in a new
screenshot.

After the visual difference is understood and intentionally approved, update snapshots
in the same pinned environment:

```sh
yarn playwright test e2e/visual.spec.ts --project=desktop-chromium --update-snapshots
```

Commit only reviewed snapshot changes. Do not use snapshot regeneration to mask font,
viewport, browser, animation, or runtime instability.

## Advisory-to-required criteria

Keep the Visual regression job advisory while #53 is active. Consider making it
required only after:

1. all current baselines have been intentionally reviewed after the homepage/project
   information architecture settles;
2. repeated CI runs on unchanged source produce no snapshot drift in the pinned
   environment;
3. reruns of the same commit remain identical;
4. expected/actual/diff and diagnostic evidence is sufficient to explain failures;
5. the visual job no longer creates routine false positives from runner/runtime
   differences.

Functional End-to-end remains independently required even if visual enforcement later
becomes required.
