{
  description = "Micrantha web development and CI toolchain";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

  outputs = { self, nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          nodejs = pkgs.nodejs_24;
          yarn = pkgs.yarn.override { inherit nodejs; };
          ciToolchain = pkgs.symlinkJoin {
            name = "micrantha-web-ci-toolchain";
            paths = [
              nodejs
              yarn
              pkgs.git
              pkgs.gnumake
              pkgs.pkg-config
              pkgs.python3
            ];
          };

          # The Yarn lock currently resolves @playwright/test to 1.60.0. The
          # nixos-25.11 pin carries older Playwright browsers, so keep the
          # browser artifact version explicit and fixed-output rather than
          # silently coupling incompatible Playwright revisions.
          playwrightVersion = "1.60.0";
          playwrightChromium = {
            revision = "1223";
            browserVersion = "148.0.7778.96";
          };
          playwrightFfmpegRevision = "1011";
          throwSystem = throw "Unsupported system: ${system}";

          # Browser rendering is part of the repository-owned CI runtime. Do
          # not rely on host/JIT runner fonts: isolated runners may otherwise
          # render text as zero-size/invisible while preserving DOM semantics.
          fontconfigFile = pkgs.makeFontsConf {
            fontDirectories = [ pkgs.dejavu_fonts ];
          };
          chromium = pkgs.callPackage ./nix/playwright/chromium.nix {
            inherit system throwSystem;
            inherit (playwrightChromium) revision browserVersion;
            fontconfig_file = fontconfigFile;
          };
          chromiumHeadlessShell = pkgs.callPackage ./nix/playwright/chromium-headless-shell.nix {
            inherit system throwSystem;
            inherit (playwrightChromium) revision browserVersion;
            fontconfig_file = fontconfigFile;
          };
          playwrightFfmpeg = pkgs.callPackage ./nix/playwright/ffmpeg.nix {
            inherit system throwSystem;
            revision = playwrightFfmpegRevision;
          };
          playwrightBrowsers = pkgs.linkFarm "micrantha-playwright-browsers-${playwrightVersion}" [
            {
              name = "chromium-${playwrightChromium.revision}";
              path = chromium;
            }
            {
              name = "chromium_headless_shell-${playwrightChromium.revision}";
              path = chromiumHeadlessShell;
            }
            {
              name = "ffmpeg-${playwrightFfmpegRevision}";
              path = playwrightFfmpeg;
            }
          ];
        in
        {
          ci-toolchain = ciToolchain;
          playwright-browsers = playwrightBrowsers;
          default = ciToolchain;
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.mkShell {
            packages = [ self.packages.${system}.ci-toolchain ];
          };
        }
      );

      checks = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          nodejs = pkgs.nodejs_24;
        in
        {
          toolchain = pkgs.runCommand "micrantha-web-toolchain-check" {
            nativeBuildInputs = [ self.packages.${system}.ci-toolchain ];
          } ''
            test "${nodejs.version}" = "$(node --version | sed 's/^v//')"
            test "$(yarn --version | cut -d. -f1)" = "1"
            touch "$out"
          '';
        }
      );
    };
}
