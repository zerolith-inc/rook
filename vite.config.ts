import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,jsx,ts,tsx,json,jsonc,css,md}": "ultracite fix",
  },
});
