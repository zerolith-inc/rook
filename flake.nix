{
  description = "Rook development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            # ponytail: bun/node follow nixpkgs. Bump packageManager and .node-version when flake.lock moves a minor.
            packages = [
              pkgs.bun
              pkgs.nodejs_24
            ]
            ++ pkgs.lib.optionals (
              builtins.elem system [
                "x86_64-linux"
                "aarch64-linux"
                "aarch64-darwin"
              ]
            ) [ pkgs.oxigraph ];
          };
        }
      );
    };
}
