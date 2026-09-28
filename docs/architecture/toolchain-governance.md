# Toolchain Governance

This repository uses a single authority chain so local development, CI, and production do not drift into competing build contracts.

## Authority model

1. `flake.nix` and `flake.lock` own the development and CI toolchain, including the Node major, Yarn, and the Playwright browser runtime used by required validation.
2. `package.json` defines supported package-manager and runtime expectations; `yarn.lock` owns JavaScript dependency resolution.
3. GitHub Actions is the required validation surface. Dubnium JIT runners are intentionally minimal; repository dependencies belong in the flake or the repository dependency graph, not the runner image.
4. Cloudflare Pages Functions and the checked-in Wrangler configuration own production runtime and deployment behavior.
5. GitLab is mirror-only. It must not define an independent CI image, browser version, container build, or release authority.
6. Docker is an optional Node portability path. It is useful for local validation but is not equivalent to the Cloudflare production artifact.

## Version policy

- Node is kept on major 24 until a deliberate toolchain migration updates the flake and compatible secondary paths together.
- Yarn classic is pinned to 1.22.22 where it must be installed outside the flake.
- Playwright browser artifacts are pinned in the flake and must match the lockfile-resolved Playwright package.
- Wrangler remains lockfile-pinned and is invoked from the repository dependency graph.
- TypeScript is exact-pinned in `package.json` and `yarn.lock`; other JavaScript packages resolve through `yarn.lock`, and manifest-range changes require normal dependency review.

Avoid manually maintained patch/minor version badges when they do not enforce anything.

## Install and build rules

- CI and portability paths use frozen-lockfile installs.
- Package scripts invoke Yarn-owned scripts directly rather than bouncing through `npm run` or ad-hoc `npx`.
- `npm-run-all` is retained for the small existing serial/parallel script compositions; it does not own dependency resolution or runtime selection.
- Required CI must not assume Playwright, Node, or other project dependencies are present in the Dubnium runner image.
- Changes to production topology must preserve the Cloudflare adapter/runtime contracts.

## Supply-chain follow-up

Issue #60 remains the tracking authority for controls not completed by this normalization slice, including dependency review, CodeQL or an equivalent static-analysis gate, immutable action pinning, secret-scanning posture, dependency-update grouping, and any artifact/SBOM policy justified by an operational release artifact.
