# Architecture

Rook uses DSH for agent execution and adds shared memory, agent identity and communication, and the product interface. See [Product](product.md) for the intended user experience and the [README](../README.md) for setup.

The runtime, memory, and collaboration sections describe the planned system. Only the Web app scaffold, health API, shared contracts, and local Oxigraph service exist today; see [Current implementation](#current-implementation).

## Current implementation

Use Bun workspaces with `apps/app` for Expo Web and `apps/api` for the persistent Node server. Bun is the package manager only. Node runs Expo/Metro and the API. Ultracite owns lint and format. Vite+ runs workspace tasks and git hooks. Metro remains the app bundler. Shared API schemas live in `packages/contracts` and are validated on both sides of the connection. A Nix flake provides the local toolchain.

The UI uses React Native Reusables with Uniwind and Tailwind 4, following the [installation](https://reactnativereusables.com/docs/installation) Uniwind path and the upstream `minimal-uniwind` template at commit `ecdc14b50fa9ad4d905085dc394cf783d48ad66d`. Copied components follow that template; the app SDK is Expo 57 (React Native 0.86). Expo's `expo install --fix` determines React Native and Expo module versions. Dependencies are resolved in `bun.lock`.

The API runs TypeScript through Node's type stripping (`noEmit`). Workspace packages export `.ts` sources, so there is no API `dist`. That matches [Node's TypeScript guidance](https://nodejs.org/api/typescript.html) for executing `*.ts` files. The official Hono Node starter uses `tsx` plus `tsc` emit; this repo skips both because Node 24 already runs the workspace graph.

The API provides liveness only. A successful `/health` response means the HTTP process works, not that an agent or memory integration is ready. The shared contract explicitly reports the unconfigured runtime. Expected browser origins are configured for local development; CORS is not an authentication mechanism.

Oxigraph runs locally with either the Nix package or a persistent Docker volume. It is not yet accessed by the API. There is no additional database. No graph ontology, user/account system, agent orchestration, event stream, or production deployment is implemented here.

### Integration work

Before connecting DSH, verify its upstream package, supported headless API, Node compatibility, session/workflow persistence, and restart recovery. Keep agent loops, tools, skills, subagents, and workflows owned by DSH. The adapter package currently reports only `not-configured`; it does not simulate agents.

Connect memory through Oxigraph once the minimal ontology and provenance contract are defined. Add HTTP/SSE behavior when the real runtime event contract is known. Native mobile and desktop packaging are outside this initial Web scaffold.

## Implementation references

- [React Native Reusables Uniwind template](https://github.com/founded-labs/react-native-reusables-templates/tree/ecdc14b50fa9ad4d905085dc394cf783d48ad66d/minimal-uniwind)
- [React Native Reusables installation](https://reactnativereusables.com/docs/installation)
- [Uniwind](https://docs.uniwind.dev/quickstart)
- [Ultracite](https://www.ultracite.ai/docs)
- [Vite+ workspace task execution](https://viteplus.dev/guide/run)
- [Oxigraph](https://github.com/oxigraph/oxigraph)

## Runtime and responsibility boundaries

Rook does not fork DSH to build a new agent runtime. It uses **DSH as a headless agent kernel** and implements a thin Gateway / product UX layer on top.

The basic responsibility split is:

| Layer | Responsibility |
| --- | --- |
| DSH | Agent loop, model routing, session, tool, Skill, MCP, planning, goal, workflow, DSH subagents |
| Agent Plugins v1 | Extra capability format. Loaded natively through the DSH adapter |
| Skill | Knowledge, procedures, behavior, reusable procedures |
| Computer | Persistent execution environment the agent uses continuously |
| Sandbox | Optional isolation for dangerous or temporary work |
| Memory | Inspectable structured knowledge, centered on a graph / ontology |
| Subagent | Temporary or long-lived child agent under a main agent |
| Agent Network | Discovery, requests, and communication between independent agents with no parent/child relationship |
| A2A | One transport the Agent Network can use |
| Gateway / Client | Always-on agent UX: Web, PWA, CLI, notifications |

Original work is concentrated on Memory, agent identity / Agent Network, and Gateway / product UX. Do not reimplement loops, tools, skills, subagents, workflows, or sandboxes that DSH already owns.

## Computer-first policy

For this product, a **persistent computer** beats disposable jobs.

- There is one Computer at this stage.
- Candidates include a local user PC, a persistent VM, or a persistent container.
- Prefer continuity of browser profiles, filesystem, Git checkouts, build caches, shell environment, installed apps, and OS / desktop state.
- Do not build multi-computer or Computer Profile UX for MVP. Extend only after the need is confirmed.
- A Sandbox is not the Computer. It is an optional place to isolate unknown repos, untrusted packages, arbitrary code, dependency conflicts, or heavy work.
- Do not start DSH inside the sandbox on every run. Keep the agent runtime separate from disposable code execution.

```text
Persistent Computer
        │
        └─ optional: Disposable Sandbox
             └─ dangerous / temporary work only
```

If Computer is abstracted as a plugin, the first implementation can still be a single instance. Keep a thin boundary for a future provider swap.

## Account, Group, Agent, and Session scope

Do not give Computer, Memory, and Skill separate ownership models. Put them on the same four-layer scope:

| Scope | Typical contents |
| --- | --- |
| Account | Long-lived user information, shared projects, people, preferences, Account skills |
| Group | Shared project context, architecture decisions, conventions, repos, deployments, incidents, Group skills |
| Agent | Agent-specific history, private memory, private state, Agent skills |
| Session | Current work, short-lived state, a conversation or operation episode |

**A Group is not a bot list.** It is a shared context boundary that agents co-own. Memory, skills, and when needed computer access or secret scope can attach to a Group.

```text
Account
├─ shared memory / skills
├─ Group: Engineering
│  ├─ Coding Agent
│  ├─ Reviewer Agent
│  ├─ DevOps Agent
│  ├─ group memory / skills
│  └─ shared computer access
├─ Group: Personal
│  ├─ Personal Agent
│  └─ group memory / skills
└─ Agent private memory / state
   └─ Session working context
```

Before saving knowledge, decide whether it belongs on a private Agent, a Group, or the Account. Repo-specific coding conventions go on the Group. Progress on a single issue stays on the Agent. Output-format preferences belong on the Account.

## Memory

Memory is a graph / ontology knowledge layer that users and agents can inspect for knowledge, evidence, and the effect of corrections.

### Units of knowledge

Memory combines Claims that have sources, validity windows, and confirmation state with Episodes that can be traced as evidence. An Entity is "what this is about", a Claim is "what is being said", and an Episode is "which event produced it". Decision, Preference, and State start as kinds of Claim.

For example, the claim "Rook uses Oxigraph" should carry its scope, a pointer to the source message, the agent and session that captured it, a validity window, recorded time, confirmation state, and the claim it replaces. If the user changes the store, the current decision updates while the old decision and its evidence stay reachable.

Users should be able to see what is remembered, why, and what a correction changes. The validity window of an event or fact is distinct from the time the system recorded it.

### Source text

Do not store full conversations in the graph. Keep raw text in DSH storage or files. The graph holds meaningful Episodes and Claims, with pointers back to the original session or message range. When several agents contribute, the originating agent, session, and source text remain traceable.

```text
Conversation / Action
        ↓
Raw source → Episode → Claim → Oxigraph Knowledge Graph
```

### Writes and confirming shared knowledge

Separate observation from confirmation. Extract candidate Claims from source text and Episodes, compare them with existing Claims, then confirm them or keep them as candidates / conflicts according to source authority and evidence.

- Auto-save widely inside permitted scopes.
- Explicit decisions and observations can land automatically when evidence and authority allow.
- Speculation, unresolved conflicts, and expansions of share scope stay candidates.
- Novelty alone does not overwrite a confirmed decision.
- An agent's suggestion does not retire a user-approved decision. A legitimate change keeps history and the replacement relation.
- Several agents citing the same source do not count as independent corroboration.

### Reads

Reads combine a small always-on context, search when needed, and tracing back to evidence. Always-on context includes relevant user settings, important Group decisions, and a summary of current work. Search uses terms, meaning, and entity relations inside the allowed scope, returning to Episodes or source text as needed.

The graph is the source of truth. Search indexes and summaries are regenerable derived data. Results include source, validity window, and whether a conflict exists. Scope limits apply to search, graph walk, and summaries.

Episode search alone would force rereading current decisions every time. Claim search alone can lose context at extraction time. Use explicit Claims plus a path back to the source.

### Success conditions

Beyond ordinary Q&A, the following must hold:

- Current and past decisions can be answered separately.
- Agent speculation does not overwrite a user decision.
- Duplicate citations of the same source are not independent evidence.
- Private memory does not leak into shared search or summaries without permission.
- The system can withhold an answer when evidence is insufficient.
- Corrections and deletions propagate to derived indexes and summaries.

### Research references

These are design references, not a ranking of products under different evaluation conditions. Rook's authority and confirmation rules exist to manage shared knowledge across agents.

- [MemGPT](https://arxiv.org/abs/2310.08560): memory hierarchy inside and outside context.
- [Mem0](https://arxiv.org/abs/2504.19413): extraction, consolidation, and retrieval.
- [Zep](https://arxiv.org/html/2501.13956v1): time, relation history, knowledge updates.
- [A-MEM](https://arxiv.org/abs/2502.12110): dynamic linking and organization of memory.
- [LongMemEval](https://arxiv.org/html/2410.10813v2): extraction, cross-session reasoning, temporal reasoning, updates, abstention.

## Promoting Memory to Skill / Document

Do not dump everything into Memory and make it a black box. Mature knowledge leaves Memory as Skills or Documents.

```text
Sessions / Actions
        ↓
Episodes
        ↓
Claims ────────────→ Memory Graph
Procedures / Patterns
        ↓
Skill Candidate
        ↓ validate / dry-run / evaluate
Skill

Durable explanation / design / research
        ↓
Document
```

- Repeatable procedures generalize into Skills.
- Explanations, designs, research, and long-form knowledge become Documents.
- Low-maturity observations and one-off state stay in Memory / Episode.
- Repetition count alone does not promote a production Skill. Candidates go through generalization, validation, and approval or configured auto-promotion.
- Human-authored and agent-learned Skills use the same Skill system at runtime.

This path lets users inspect and reuse accumulated knowledge.

## Subagents vs Agent Network

### DSH subagent

Child agents a main agent calls for work use DSH subagents. Temporary or long-lived researchers, coders, reviewers, and similar agents stay under the parent and the same job.

### Agent Network

Communication between independent agents is a separate Agent Network plugin, not a DSH subagent. It covers the user's other agents, other people's agents, and organization agents, with capabilities such as:

```text
agent.list()
agent.send(agentId, message)
agent.request(agentId, task)
agent.subscribe(agentId)
agent.getProfile(agentId)
```

Do not equate the Agent Network with a protocol. Keep a transport boundary inside it. A2A is the primary transport candidate.

```text
Agent Network
├─ A2A transport
├─ local transport
└─ HTTP / custom transport
```

**Agent Network ≠ A2A.** A2A is a backend / transport for the Agent Network plugin.

## Knowledge Curator

Do not rely only on reflection inside a single agent. Put a Knowledge Curator across agents, Groups, and Sessions.

```text
Coding Agent ─────┐
Reviewer Agent ───┤
DevOps Agent ─────┼─→ Knowledge Curator
Research Agent ──┤
Personal Agent ──┘
```

The Curator reads permitted Agents, Groups, Sessions, Memory, and Documents. It deduplicates Claims, links related items, sorts candidates and conflicts, writes shared Memory, proposes Skill candidates, and drafts Documents. Memory confirmation rules still apply. Being the Curator does not grant extra scope or the right to overwrite decisions.

Implement this as a **normal agent plus system hooks**, not a hidden pipeline.

```text
session completed
memory changed
skill used
document changed
        ↓
Learning Queue / trigger
        ↓
Knowledge Curator Agent
        ↓
shared Memory / Skill proposal / Document
```

The Curator is visible as an ordinary agent, so users can inspect and change its permissions and behavior. Official presets, if any, sit on the same agent model.

## Datastore policy

The source of truth for Knowledge / Memory is **Oxigraph**. Entities, Claims, Episodes, relations, and provenance are stored as RDF and queried with SPARQL. That matches a graph / ontology approach and a single persistent Computer.

Design the ontology explicitly. Start with a small vocabulary and application- layer types and constraints. Adopting RDF is separate from introducing a reasoner. Consider OWL or SHACL only after the need is confirmed.

```text
Application Ontology
        ↓ defines / validates
Oxigraph RDF Graph / SPARQL
```

**Do not require an auxiliary database in the initial setup.** Prefer DSH's existing session / workflow storage. Confirm what DSH persists and recovers across restarts before adding anything.

| Data | Initial store |
| --- | --- |
| Entity, Claim, Episode, relations, provenance | Oxigraph |
| Rook-specific agent settings | Config files |
| Skill, Document | Files |
| Conversation text, session / workflow state | Prefer DSH; keep extra source text in files if needed |

Consider SQLite only when DSH cannot persist notifications, Curator jobs, or dedupe state that must survive restart.

## Initial app and API

The first release is **Web only**: Expo Web in `apps/app`, backend in `apps/api`, one monorepo. The same Expo app can later ship to iOS / Android. Desktop can wrap the Expo Web output with Tauri; that is out of the initial build.

| Area | Choice |
| --- | --- |
| Language | TypeScript |
| Frontend (`apps/app`) | Expo Web + Expo Router |
| UI | React Native Reusables + Uniwind + Tailwind 4 |
| Data fetching / cache | TanStack Query |
| Backend (`apps/api`) | Node + Hono + Effect |
| Package manager | Bun workspaces |
| API / event / config schemas | Effect Schema |
| Knowledge / Memory | Oxigraph. Auxiliary DB follows the datastore policy above |
| App dev / build | Expo / Metro |
| Lint / format | Ultracite (Oxlint + Oxfmt) |
| Workspace tasks / git hooks | Vite+ |

Ultracite formats and lints. Vite+ runs `vp run` workspace tasks and pre-commit hooks. Expo CLI / Metro own app development and builds. React Native Reusables components and theme live in `apps/app` first. Styling follows the Uniwind + Tailwind 4 path from React Native Reusables. See [Current implementation](#current-implementation) and `bun.lock` for resolved versions.

```text
rook/
├─ apps/
│  ├─ app/             # Expo Web frontend
│  └─ api/             # Node + Hono + Effect backend
├─ packages/
│  ├─ contracts/       # API / event schemas and types
│  └─ dsh-adapter/      # DSH integration
├─ presets/
└─ docs/
   ├─ product.md
   └─ architecture.md
```

Hono is the HTTP entrypoint and response / event delivery. Effect owns Rook-side dependencies, failures, resources, and the lifetime of subscriptions and background work. Agent loops, sessions, subagents, and workflows stay in DSH. Keep the client lifetime separate from the always-on server so closing the UI does not stop agents.

Initial transport is HTTP + SSE. Streaming reconnect on mobile, and how desktop talks to a bundled local server, are verified when those surfaces are built.

Verify DSH's connection API and Node compatibility at implementation time.

## Minimal composition

```text
Rook
│
├─ DSH headless agent kernel
│  ├─ Standard mode
│  ├─ Agent Plugins v1 adapter
│  ├─ Skills / MCP / tools
│  └─ DSH subagents
│
├─ Persistent Computer (initially one)
├─ optional disposable Sandbox
├─ Memory Plugin → Oxigraph + application Ontology
├─ Agent identity / Agent Network Plugin → A2A transport
├─ Knowledge Curator Agent + system hooks
└─ Gateway / UX / notifications
```

Do not build a custom agent loop, tool framework, Skill engine, subagent runtime, workflow engine, sandbox runtime, MCP implementation, or large control plane.

## Open questions

- DSH Agent Plugins v1 API and adapter details
- How much of DSH session / workflow state survives restart, and whether Rook needs its own management state
- Performance of representative Oxigraph queries (in-scope search, provenance, excluding contradicted or expired Claims) on real data
- Initial Persistent Computer provider, and priority among local PC, VM, and container
- Sandbox provider, and the boundary that keeps persistent files and credentials in
- Group permission inheritance, concrete conflict resolution for Memory confirmation, and the Curator approval flow
- Initial ontology and strict types for Claim / Entity / Episode
- Agent Network identity, authn, authz, visibility, and A2A profile
- Evaluation criteria and automation for promoting Memory to Skill / Document
- Where raw episodes live, retention, deletion, and provenance pointer format
- Memory permission matrix, conflict / approval UI, index strategy, search budget, and evaluation
- When to add Gateway channels besides Web, and the scope of proactive notifications
- DSH compatibility on Node
