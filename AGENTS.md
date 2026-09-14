# Rook

Expo Web + Node API monorepo. Human docs: [README.md](README.md), [docs/product.md](docs/product.md), [docs/architecture.md](docs/architecture.md).

```
apps/app               Expo Router, React Native Reusables, Uniwind, Tailwind 4, TanStack Query
apps/api               Node, Hono, Effect — `/health` only
packages/contracts     Shared Effect Schema
packages/dsh-adapter   Reports `not-configured`
presets/               Empty until the preset contract is known
compose.yaml           Oxigraph 0.5.11 on 127.0.0.1:7878 — unused by the API
flake.nix              Dev shell: Bun, Node 24, Oxigraph
```

Early scaffold: agent runtime, memory, groups, and curator are not connected. Do not implement an agent kernel here. `/health` 200 is process liveness; `runtime` stays `not-configured` until a real connection exists.

## Dev environment tips

- Bun is the package manager (`packageManager` in `package.json`). Node (`.node-version`) runs Expo/Metro and the API. Enter the toolchain with `nix develop` or `direnv allow`. Flake tool versions follow `flake.lock` and may differ from CI by a patch.
- Workspace names live in each package's `package.json` (`@rook/app`, `@rook/api`, `@rook/contracts`, `@rook/dsh-adapter`).
- Install: `bun install --frozen-lockfile`
- Start Oxigraph: `bun run services:oxigraph` (Nix) or `bun run services:up` (Docker)
- Start app + API: `bun run dev` — app `http://localhost:8081`, API `http://localhost:3001/health`
- One process: `bun run dev:app` or `bun run dev:api`
- Ultracite owns lint/format. Vite+ runs workspace tasks and git hooks. Expo/Metro own app dev and build. Do not add ESLint or Jest.
- Defaults work without env files. If you change ports, keep `APP_ORIGIN` and `EXPO_PUBLIC_API_URL` in sync and restart the app after public env changes.
- Do not `docker compose down -v` unless you intend to delete the Oxigraph volume.

## Testing instructions

- CI is [`.github/workflows/ci.yml`](.github/workflows/ci.yml): `bun run check` then `bun run build`.
- `bun run check` runs Ultracite, typecheck, and tests. Fix failures before finishing.
- Tests use `node:test` next to source as `*.test.ts` (see `apps/api/src/app.test.ts`).
- Add or update tests for code you change.
- UI changes: exercise the flow at http://localhost:8081.

## Code style

- TypeScript `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`. Formatting, quotes, width, and imports are Ultracite. Do not restate formatter rules here.
- Put shared schemas in `packages/contracts` and decode on both sides with Effect Schema. Parse env the same way (`PORT` in the API).
- Hono is the HTTP entrypoint. Effect owns dependencies, failure, and lifetimes.
- App routes: `apps/app/app/`. UI: `apps/app/components/ui/`. Alias: `@/`. Styles: Uniwind `className`.
- Export `createApp` for tests. Keep `@hono/node-server` in `apps/api/src/index.ts`. Bind `127.0.0.1`.

## Security considerations

- Never put secrets in `EXPO_PUBLIC_*` — Expo embeds them in the browser bundle.
- CORS is not authentication. Dev servers bind loopback; do not expose them.
- No auth or remote access is configured.

## PR instructions

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`.
- Pre-commit runs Ultracite on staged files. CI runs the full check.
- If product or architecture intent changes, update `docs/` in the same change.
