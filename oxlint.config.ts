import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack],
  ignorePatterns: [
    ...core.ignorePatterns,
    "**/dist/**",
    "**/.expo/**",
    "**/uniwind-types.d.ts",
  ],
  rules: {
    // Effect Schema: `export const X` + `export type X = typeof X.Type`
    "no-redeclare": "off",
    // React Native has no HTML button; Pressable uses role="button".
    "jsx-a11y/prefer-tag-over-role": "off",
    // QueryClient is intentionally created once via useState without a setter.
    "react/hook-use-state": "off",
  },
  overrides: [
    {
      files: ["apps/app/metro.config.js", "apps/app/babel.config.js"],
      rules: {
        "unicorn/prefer-module": "off",
        "unicorn/no-anonymous-default-export": "off",
      },
    },
  ],
});
