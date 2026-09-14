# Architecture

Rook uses DSH for agent execution and adds shared memory, agent identity and
communication, and the product interface. See [Product](product.md) for the
intended user experience and the [README](../README.md) for setup.

The runtime, memory, and collaboration sections describe the planned system.
Only the Web app scaffold, health API, shared contracts, and local Oxigraph
service exist today; see [Current implementation](#current-implementation).

## Current implementation

Use Bun workspaces with `apps/app` for Expo Web and `apps/api` for the persistent
Bun server. Vite+ handles lint, format, and common tasks. Metro remains the app
bundler. Shared API schemas live in `packages/contracts` and are validated on
both sides of the connection.

The UI uses React Native Reusables with NativeWind 4 and Tailwind 3, based on the
upstream minimal template at commit `ecdc14b50fa9ad4d905085dc394cf783d48ad66d`.
Expo 56 is the upstream template baseline; Expo's compatibility check determines
the React Native dependency versions. Dependencies are resolved in `bun.lock`.

The API provides liveness only. A successful `/health` response means the HTTP
process works, not that an agent or memory integration is ready. The shared
contract explicitly reports the unconfigured runtime. Expected browser origins
are configured for local development; CORS is not an authentication mechanism.

Oxigraph runs locally with a persistent Docker volume. It is not yet accessed by
the API. There is no additional database. No graph ontology, user/account system,
agent orchestration, event stream, or production deployment is implemented here.

### Integration work

Before connecting DSH, verify its upstream package, supported headless API, Bun
compatibility, session/workflow persistence, and restart recovery. Keep agent
loops, tools, skills, subagents, and workflows owned by DSH. The adapter package
currently reports only `not-configured`; it does not simulate agents.

Connect memory through Oxigraph once the minimal ontology and provenance contract
are defined. Add HTTP/SSE behavior when the real runtime event contract is known.
Native mobile and desktop packaging are outside this initial Web scaffold.

## Implementation references

- [React Native Reusables template](https://github.com/founded-labs/react-native-reusables-templates/tree/ecdc14b50fa9ad4d905085dc394cf783d48ad66d/minimal)
- [React Native Reusables installation](https://reactnativereusables.com/docs/installation/manual)
- [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)
- [Vite+ workspace task execution](https://viteplus.dev/guide/run)
- [Oxigraph](https://github.com/oxigraph/oxigraph)

## Runtime and responsibility boundaries

Rookは、DSHをフォークして新しいAgent Runtimeを作るのではなく、**DSHをheadless agent kernelとして利用し、その上に薄い Gateway / product UX 層を実装する**。

基本の責務境界は次の通りとする。

| 層               | 責務                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| DSH              | Agent loop、model routing、session、tool、Skill、MCP、planning、goal、workflow、DSH subagent等のAgent Runtime |
| Agent Plugins v1 | 外部能力の追加形式。DSH adapterを介してnativeに読み込む                                                       |
| Skill            | 知識、手順、振る舞い、再利用可能なprocedure                                                                   |
| Computer         | Agentが常時使う永続的な実行・操作環境                                                                         |
| Sandbox          | 危険または一時的な処理だけを逃がす任意の隔離先                                                                |
| Memory           | Graph / Ontology中心のinspectableな構造化Knowledge                                                            |
| Subagent         | Main Agent配下の一時的または継続的なchild agent                                                               |
| Agent Network    | 親子関係を持たない独立Agent間の発見・依頼・通信                                                               |
| A2A              | Agent Networkが利用するtransportの一つ                                                                        |
| Gateway / Client | Web、PWA、CLI、通知等の常駐Agent UX                                                                           |

独自実装の中心は、Memory、Agent identity / Agent Network、Gateway / product UXに絞る。DSHが既に持つloop、tool、skill、subagent、workflow、sandbox等を再実装しない。

## Computer-firstの方針

この用途では、使い捨てjobよりも、ユーザーの環境と状態を保つ**Persistent Computer-first**を優先する。

- Computerは現時点では1つに固定する。
- ローカルの実ユーザーPC、永続VM、永続container等を候補とする。
- Browser profile、filesystem、Git checkout、build cache、shell環境、インストール済みアプリ、OS・desktop状態を継続利用できることを重視する。
- 複数ComputerやComputer ProfileをMVPのUXとして作らない。必要性が確認できた場合に拡張する。
- SandboxはComputerそのものではなく、未知のrepo、怪しいpackage、arbitrary code、依存衝突、大量処理などを一時的に隔離する任意の実行先とする。
- Sandbox内で毎回DSHを起動する構成にはせず、Agent Runtimeと一時コード実行環境を分離する。

```text
Persistent Computer
        │
        └─ optional: Disposable Sandbox
             └─ dangerous / temporary work only
```

ComputerをPluginとして抽象化する場合も、初期の実体は一つでよい。将来のprovider差し替えに備えた薄い境界だけを持つ。

## Account、Group、Agent、SessionのScope

Computer、Memory、Skillを別々の所有モデルで管理せず、同じScopeモデルに載せる。Scopeは次の4層とする。

| Scope   | 主な内容                                                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------- |
| Account | ユーザー全体の長期情報、共通Project、人物、preference、Account Skill                                     |
| Group   | 複数Agentが共同で扱うProject、architecture decision、convention、repo、deployment、incident、Group Skill |
| Agent   | Agent固有の作業履歴、private memory、private state、Agent Skill                                          |
| Session | 現在の作業、短期状態、会話・操作のepisode                                                                |

**Groupは単なるBot一覧ではなく、Agentたちが共同所有する共有コンテキスト境界**とする。Memory、Skill、必要に応じてComputer利用権限やsecret scopeをGroupに結び付けられるようにする。

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

知識を保存する前に、private Agent、Group、Accountのどこへ還元するかを分類する。例えば、repo固有のcoding conventionはGroup、個別Issueの進捗はAgent、ユーザーの出力形式の好みはAccountに置く。

## Memory

Memoryは、ユーザーとAgentが知識・根拠・訂正の影響を確認できるGraph / Ontology中心のKnowledge Layerとする。

### 知識単位

Memoryは、出典・有効期間・確定状態を持つClaimと、根拠となるEpisodeへの遡及を組み合わせる。Entityは「何について」、Claimは「何が言われているか」、Episodeは「どの出来事で得たか」を表す。Decision、Preference、Stateは初期にはClaimの種別として扱う。

例えば「RookはOxigraphを使う」というClaimには、適用Scope、決定の根拠となるメッセージへの出典、取得したAgentとSession、有効期間、記録日時、確定状態、置き換える旧Claimを関連付ける。ユーザーが採用技術を変更した場合、現在の決定を更新しつつ過去の決定と根拠を辿れるようにする。

ユーザーは、何を覚えているか、なぜそう判断したか、訂正によって何が変わるかを確認できる。出来事・知識の有効期間と、システムが記録した時刻は区別する。

### 原文と出典

会話全文はGraphに直接保存せず、DSHの保存先またはファイルに保持する。Graphには意味のあるEpisodeとClaimを保存し、元のSessionやMessage範囲への出典を持たせる。複数Agentが知識を統合しても、取得元のAgent、Session、原文を辿れるようにする。

```text
Conversation / Action
        ↓
Raw source → Episode → Claim → Oxigraph Knowledge Graph
```

### 書き込みと共有知識への確定

観測の保存と知識としての確定を分ける。原文とEpisodeを根拠としてClaim候補を抽出し、既存Claimと照合したうえで、情報源の権限と根拠に応じて確定するか、候補・競合として保持する。

- 自動保存は許可されたScope内で広く認める。
- 明示的な決定や観測結果は、根拠と権限に応じて許可された範囲で自動反映する。
- 推測、未解決の競合、共有範囲の拡大は候補に留める。
- 発言が新しいという理由だけでは、既存の確定した決定を上書きしない。
- Agentの提案は、ユーザーが承認した決定を失効させない。正当な変更決定では、旧Claimの履歴と置換関係を残す。
- 同じ出典を複数Agentが引用しても、独立した裏付けとして数えない。

### 読み出し

読み出しは、少量の常時コンテキスト、必要時の検索、根拠への遡及を組み合わせる。常時コンテキストには関連するユーザー設定、Groupの重要な決定、現在の作業概要を含める。検索では許可されたScope内の語句・意味・Entityの関係を利用し、必要に応じてEpisodeや原文へ戻る。

Graphを正本とし、検索用索引や要約は再生成可能な派生データとして扱う。検索結果には出典、有効期間、競合の有無を含める。Scope制約は検索、関係の探索、要約にも適用する。

Episode検索だけでは現在の決定を毎回読み解く必要があり、Claim検索だけでは抽出時に文脈を失う可能性がある。このため、明示的なClaimと原文への遡及を組み合わせる方式を採用する。

### 成立条件

通常の質問応答に加え、次の振る舞いを成立条件とする。

- 現在と過去の決定を答え分けられる。
- Agentの推測がユーザーの決定を上書きしない。
- 同じ出典の重複引用を独立した証拠として扱わない。
- private memoryが許可なく共有側の検索・要約へ漏れない。
- 根拠不足なら回答を保留できる。
- 訂正・削除が検索用索引や要約などの派生データにも反映される。

### 調査上の参照

以下は設計上の参考文献であり、各論文の異なる評価条件から製品間の優劣を確定したものではない。Rookの権限・確定ルールは、複数Agentによる共有知識の管理を目的とする。

- [MemGPT](https://arxiv.org/abs/2310.08560): コンテキスト内外のメモリ階層管理。
- [Mem0](https://arxiv.org/abs/2504.19413): 重要情報の抽出・統合・検索。
- [Zep](https://arxiv.org/html/2501.13956v1): 時間情報、関係の履歴、知識更新。
- [A-MEM](https://arxiv.org/abs/2502.12110): 動的な関連付けと記憶の整理。
- [LongMemEval](https://arxiv.org/html/2410.10813v2): 抽出、セッション横断推論、時間推論、更新、回答保留の評価。

## MemoryからSkill / Documentへ昇格

Memoryにすべてを押し込んでブラックボックス化しない。Memory上のepisodeとpatternから、成熟した知識を外へ出す。

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

- 繰り返し実行できる手順はSkillへ一般化する。
- 説明、設計、調査結果、長い知識はDocumentへ整理する。
- 低成熟度の観測や個別状態はMemory / Episodeに留める。
- 反復回数だけで直ちにproduction Skillへ昇格せず、候補生成、一般化、検証、承認または設定による自動昇格を経る。
- 人間が作ったSkillとAgentが学習したSkillは、実行時には同じSkill体系で扱う。

このMemory → Skill / Documentの経路により、蓄積した知識をユーザーが確認・再利用できる形で取り出せる。

## SubagentとAgent Networkの分離

### DSH Subagent

Main Agentが作業のために呼び出すchild agentはDSH subagentを利用する。researcher、coder、reviewer等の一時的または継続的な配下Agentが対象で、親子関係と同じ作業の制御下にある。

### Agent Network

独立したAgent同士の通信は、DSH subagentとは別のAgent Network Pluginにする。自分の別Agent、他人のAgent、組織のAgent等を対象に、次のような能力を提供する。

```text
agent.list()
agent.send(agentId, message)
agent.request(agentId, task)
agent.subscribe(agentId)
agent.getProfile(agentId)
```

Agent Networkとprotocolを同一視しない。内部にはtransport境界を置き、A2Aを主要なtransport候補として利用する。

```text
Agent Network
├─ A2A transport
├─ local transport
└─ HTTP / custom transport
```

したがって、**Agent Network ≠ A2A**であり、A2AはAgent Network Pluginのbackend / transportである。

## Knowledge Curator

単一Agent内のreflectionだけに依存せず、複数Agent・Group・Sessionを横断するKnowledge Curatorを置く。

```text
Coding Agent ─────┐
Reviewer Agent ───┤
DevOps Agent ─────┼─→ Knowledge Curator
Research Agent ──┤
Personal Agent ──┘
```

Curatorは、許可された範囲でAgent、Group、Session、Memory、Documentを読み、Claimの重複整理、関連付け、候補・競合の整理、共有Memoryへの書き込み、Skill候補の提案、Documentの作成を行う。Memoryの確定ルールに従い、Curatorであること自体はScope越境や決定の上書き権限を与えない。

実装は特殊な隠しpipelineではなく、**通常Agent + system hooks**を基本とする。

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

Knowledge Curatorは通常のAgentとして見えるため、ユーザーが権限や挙動を確認・変更できる。公式presetとして提供する場合も、通常Agentモデルの上に置く。

## データストア方針

Knowledge / Memoryの正本は**Oxigraph**とする。Entity、Claim、Episodeとその関係・出典をRDFで保存し、SPARQLで探索する。Graph / Ontology中心の方針を維持し、単一のPersistent Computerで始める構成に合わせる。

Ontologyは明示的に設計し、初期は小さな語彙とアプリケーション層の型・制約による検証を使う。RDFの採用と推論基盤の導入は分け、OWL reasonerやSHACLは必要性が確認できた場合に検討する。

```text
Application Ontology
        ↓ defines / validates
Oxigraph RDF Graph / SPARQL
```

**補助DBは初期の必須構成に含めない。** Sessionやworkflow等は、まずDSHの既存機能・保存先を利用し、独自の永続化を重複実装しない。DSHが提供する永続化と再起動時の復旧範囲は、実装前に確認する。

| データ                             | 初期の保存先                                            |
| ---------------------------------- | ------------------------------------------------------- |
| Entity、Claim、Episode、関係、出典 | Oxigraph                                                |
| 独自のAgent設定・構成              | 設定ファイル                                            |
| Skill、Document                    | ファイル                                                |
| 会話原文、session / workflowの状態 | DSHの既存保存先を優先し、不足する原文はファイル等で保持 |

再起動後も確実に処理する通知・Curatorのジョブ管理や重複実行防止など、DSHで不足する永続的な管理状態を自前で持つ必要が生じた場合だけSQLiteを検討する。

## 初期App・API構成

初期リリースは**Webのみ**とし、Expo Webのフロントエンドを`apps/app`、バックエンドを`apps/api`に置く単一monorepoで始める。将来は同じExpo appからiOS / Androidへ展開する。DesktopはExpo Webの出力をTauriで包む方向とし、初期構築には含めない。

| 領域                          | 採用する技術・構成                                       |
| ----------------------------- | -------------------------------------------------------- |
| 言語                          | TypeScript                                               |
| フロントエンド（`apps/app`）  | Expo Web + Expo Router                                   |
| UI                            | React Native Reusables                                   |
| データ取得・キャッシュ        | TanStack Query                                           |
| バックエンド（`apps/api`）    | Bun + Hono + Effect                                      |
| API・イベント・設定のスキーマ | Effect Schema                                            |
| Knowledge / Memory            | Oxigraph。補助DBの条件はこの文書のデータストア方針に従う |
| monorepo・依存管理            | Bun workspaces                                           |
| appの開発・build              | Expo / Metro                                             |
| 共通開発ツール                | Vite+                                                    |

Vite+はlint・format・共通タスク実行等に使い、Expo appの開発・buildはExpo CLI / Metroへ委譲する。React Native ReusablesのUI部品とテーマはまず`apps/app`内に配置する。初期構築ではNativeWind 4とTailwind 3を採用した。実装済みの構成は[Current implementation](#current-implementation)、解決済みの依存バージョンは`bun.lock`を参照する。

```text
rook/
├─ apps/
│  ├─ app/             # Expo Web frontend
│  └─ api/             # Bun + Hono + Effect backend
├─ packages/
│  ├─ contracts/       # API / event schemas and types
│  └─ dsh-adapter/     # DSH integration
├─ presets/
└─ docs/
   ├─ product.md
   └─ architecture.md
```

HonoがHTTPの入口とレスポンス・イベント配信を担当し、EffectがRook側の依存関係、失敗、リソース、購読・バックグラウンド処理の寿命を管理する。DSHが所有するAgent loop、session、subagent、workflowの実行はDSHに委ねる。UIを閉じてもAgentが動き続けるよう、クライアントと常駐serverの寿命を分離する。

初期通信はHTTP + SSEを基本案とする。モバイル展開時のストリーミング接続・再接続、DesktopのOS連携やローカルserver同梱方法は、その対応時に検証する。

DSH接続方式とBun上での互換性は実装時に検証する。

## 最小構成

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

初期に作らないものは、独自Agent loop、独自tool framework、独自Skill engine、独自subagent runtime、独自workflow engine、独自sandbox runtime、独自MCP implementation、巨大なcontrol planeである。

## 未決事項

- DSHのAgent Plugins v1 APIとadapterの詳細
- DSHのsession / workflow等の永続化・再起動時の復旧範囲と、独自管理状態の必要性
- Oxigraphの代表クエリ（Scope内検索、出典追跡、矛盾・失効したClaimの除外）の実データでの性能
- Persistent Computerの初期providerと、ローカルPC・VM・containerの優先順位
- Sandbox providerと、persistent filesystemやcredentialを越境させない境界
- Groupの権限継承、Memory確定ルールに基づく具体的な競合解決操作とCuratorの承認フロー
- Claim / Entity / Episodeの役割に基づく初期Ontologyと厳密な型
- Agent Networkのidentity、認証、認可、公開範囲、A2A profile
- MemoryからSkill / Documentへ昇格する評価基準と自動化範囲
- raw episodeの保持場所、保存期間、削除範囲、provenance pointerの形式
- Memoryの権限判定表、競合解決・承認画面、索引方式、検索予算、評価の実装
- Web以外のGateway channelの追加時期とproactive notificationの範囲
- DSHとのBun互換性
