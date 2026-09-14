# Initial development environment

Status: implemented scaffold; runtime integration pending.

## Structure

Use Bun workspaces with `apps/app` for Expo Web and `apps/api` for the persistent
Bun server. Vite+ handles lint, format, and common tasks. Metro remains the app
bundler. Shared API schemas live in `packages/contracts` and are validated on
both sides of the connection.

The UI uses React Native Reusables with NativeWind 4 and Tailwind 3, based on the
upstream minimal template at commit `ecdc14b50fa9ad4d905085dc394cf783d48ad66d`.
Expo 56 is the upstream template baseline; Expo's compatibility check determines
the React Native dependency versions. Dependencies are resolved in `bun.lock`.
This avoids introducing a different styling setup during bootstrapping.

The API provides liveness only. A successful `/health` response means the HTTP
process works, not that an agent or memory integration is ready. The shared
contract explicitly reports the unconfigured runtime. Expected browser origins
are configured for local development; CORS is not an authentication mechanism.

Oxigraph runs locally with a persistent Docker volume. It is not yet accessed by
the API. There is no additional database. No graph ontology, user/account system,
agent orchestration, event stream, or production deployment is implemented here.

## Integration follow-up

Before connecting DSH, verify its upstream package, supported headless API, Bun
compatibility, session/workflow persistence, and restart recovery. Keep agent
loops, tools, skills, subagents, and workflows owned by DSH. The adapter package
currently reports only `not-configured`; it does not simulate agents.

Connect memory through Oxigraph once the minimal ontology and provenance contract
are defined. Add HTTP/SSE behavior when the real runtime event contract is known.
Native mobile and desktop packaging are outside this initial Web scaffold.

## References

- [React Native Reusables template](https://github.com/founded-labs/react-native-reusables-templates/tree/ecdc14b50fa9ad4d905085dc394cf783d48ad66d/minimal)
- [React Native Reusables installation](https://reactnativereusables.com/docs/installation/manual)
- [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)
- [Vite+ workspace task execution](https://viteplus.dev/guide/run)
- [Oxigraph](https://github.com/oxigraph/oxigraph)
