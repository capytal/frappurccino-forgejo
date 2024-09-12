{
  description = "My development environment";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };
  outputs = {
    self,
    nixpkgs,
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
    nixosModules = {
      dot013-environment = import ./configuration.nix;
      default = self.nixosModules.dot013-environment;
    };
    homeManagerModules = {
      dot013-environment = import ./home.nix;
      default = self.homeManagerModules.dot013-environment;
    };
    homeManagerModule = self.homeManagerModules.dot013-environment;
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
