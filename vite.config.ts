import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: { ignorePatterns: ["**/dist/**", "**/.expo/**"] },
  fmt: { ignorePatterns: ["**/dist/**", "**/.expo/**", "bun.lock"] },
});
