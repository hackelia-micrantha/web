# Playwright browser packaging

This directory carries the fixed-output browser derivations needed by the self-hosted `runner-web` CI path.

## Authority

The JavaScript test client remains owned by `yarn.lock`. At the time this browser slice was introduced, `@playwright/test` resolves to **1.60.0**, which expects:

- Chromium / Chrome for Testing `148.0.7778.96`, Playwright revision `1223`;
- Chromium headless shell revision `1223`;
- FFmpeg revision `1011`.

The Nix derivations and fixed-output hashes are adapted from NixOS/nixpkgs commit `9e87430ac7e25a6ba9f5a593c300f4e114a00f57` (`playwright: 1.59.1 -> 1.60.0`), under nixpkgs' MIT license. They are intentionally kept separate from the repository's main `nixos-25.11` input because that branch currently packages an older Playwright browser revision.

Upstream source paths:

- `pkgs/development/web/playwright/browser-downloads.nix`
- `pkgs/development/web/playwright/chromium.nix`
- `pkgs/development/web/playwright/chromium-headless-shell.nix`
- `pkgs/development/web/playwright/ffmpeg.nix`

## Invariant

Do not update Playwright in `yarn.lock` independently of this browser package. The CI contract test deliberately fails if the Yarn-resolved Playwright version and the browser revision diverge.

When updating Playwright:

1. identify the matching nixpkgs Playwright update commit;
2. refresh these fixed-output derivations and hashes from that commit;
3. update the explicit version/revisions in `flake.nix`;
4. run the complete Quality and End-to-end jobs on the exact PR head before merging.

The self-hosted CI path must not restore `playwright install --with-deps`, `apt`, `sudo`, or another privileged browser bootstrap.
