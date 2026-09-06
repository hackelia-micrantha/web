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
        in
        {
          ci-toolchain = ciToolchain;
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
