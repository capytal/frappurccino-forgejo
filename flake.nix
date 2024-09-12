{
  description = "My development environment";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = {
    self,
    nixpkgs,
    gitignore,
    ...
  }: let
    systems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];
    forAllSystems = f:
      nixpkgs.lib.genAttrs systems (system: let
        pkgs = import nixpkgs {inherit system;};
      in
        f system pkgs);
  in {
    packages = forAllSystems (system: pkgs: let
      app = pkgs.buildNpmPackage rec {
        pname = "frappurccino-forgejo";
        version = "0.1.1";
        src = gitignore.lib.gitignoreSource ./.;

        npmDepsHash = "sha256-4wArkv3O5rhuDlrUC05K1jIz2ZLdC8M48ILz+O+O7CU=";
        npmPackFlags = ["--ignore-scripts"];

        buildPhase = ''
          runHook preBuild

          npm run build

          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall

          mkdir -p $out
          cp -r dist $out/css

          runHook postInstall
        '';
      };
    in {
      default = app;
    });
    devShells = forAllSystems (system: pkgs: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          alejandra
          nodejs_22
          node2nix
          nodePackages_latest.prettier
        ];
      };
    });
  };
}
