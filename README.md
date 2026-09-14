# Rook

**a team of agents**

Rook is an open-source product for working with a team of agents that retain
context, share knowledge within explicit boundaries, and keep working on a
persistent computer. Its intended experience combines agent collaboration with
memory users can inspect and correct, and turns useful experience into reusable
skills and documents. DSH is the runtime underneath that experience, not the
product's core promise.

Start with the [product overview](docs/product.md) and
[architecture](docs/architecture.md).

## Current status

Rook is in early development. The scaffold includes an Expo Web app,
a Bun/Hono API, shared Effect schemas, and a local Oxigraph service.
The agent runtime is not connected yet; the status screen reports this explicitly.

## Get started

Requires Bun 1.3.13, Node.js 24.16.0, and Docker with Compose v2 for Oxigraph.
Node runs Expo/Metro and the shared tooling; Bun manages workspaces and runs the API.

```sh
bun install --frozen-lockfile
bun run services:up
bun run dev
```

Open <http://localhost:8081>. The API runs at <http://localhost:3001/health>;
Oxigraph is available at <http://localhost:7878>.
The app and API work without Oxigraph for this initial connection check.

Both development servers and Oxigraph bind to loopback. This is a local development
setup; authentication and remote access are not configured.

Defaults work without environment files. To override them, copy
`apps/app/.env.example` to `apps/app/.env.local` and/or
`apps/api/.env.example` to `apps/api/.env`. When changing the web port, update
`APP_ORIGIN`; when changing the API port, update `EXPO_PUBLIC_API_URL`.
Restart the app after changing public environment variables.
Never place secrets in `EXPO_PUBLIC_*` variables: Expo embeds them in the browser bundle.

## Commands

| Command                               | Purpose                                            |
| ------------------------------------- | -------------------------------------------------- |
| `bun run dev`                         | Start the Expo Web app and Bun API together        |
| `bun run dev:app` / `bun run dev:api` | Start one process                                  |
| `bun run check`                       | Formatting, lint, workspace type checks, API tests |
| `bun run format`                      | Format source and configuration with Vite+         |
| `bun run build`                       | Export Expo Web and bundle the Bun API             |
| `bun run services:up`                 | Start the persistent local Oxigraph service        |
| `bun run services:down`               | Stop Oxigraph, retaining its data volume           |

Web output is in `apps/app/dist`; API output is in `apps/api/dist`.
Run the built API with `bun run --filter @rook/api start`.
Vite+ runs common tasks and lint/format; Expo/Metro owns web development and builds.
CI runs the same checks and builds on pushes to `main` and pull requests.

Check Oxigraph with:

```sh
curl --fail --get http://localhost:7878/query \
  --data-urlencode 'query=ASK {}' \
  -H 'Accept: application/sparql-results+json'
```

The named `rook_oxigraph-data` volume survives container restarts and
`services:down`. Avoid `docker compose down -v` unless you intend to delete that data.

## Layout

```text
apps/app               Expo Router, React Native Reusables, NativeWind, TanStack Query
apps/api               Bun, Hono, Effect
packages/contracts     Shared Effect Schema contracts
packages/dsh-adapter   DSH integration placeholder
presets                Future agent presets
```

See [Architecture](docs/architecture.md) for the current implementation,
planned system, and integration work.

## Third-party code

The app's reusable components, theme, and styling configuration are adapted from
[React Native Reusables](https://github.com/founded-labs/react-native-reusables-templates)
under the MIT license; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES).
No license for Rook's original code has been selected yet.
