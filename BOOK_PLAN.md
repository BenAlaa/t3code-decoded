# T3 Code Decoded — editorial and implementation plan

This plan is pinned to T3 Code commit
`fa219001dc2f14cfd9c7774c2c03c153359144be` (2026-08-23). It is both an
editorial contract and a build checklist: every chapter must explain one coherent
slice of the system, show the relevant runtime boundaries, and let the reader jump
to the exact source revision that supports the explanation.

## 1. Outcome

The finished book should let a technical reader answer five questions without
reading the monorepo in repository order:

1. What does T3 Code own, and what remains owned by Codex, Claude, Cursor, Grok,
   OpenCode, Git, the shell, or the operating system?
2. How does one user intent travel from a client, through authorization and the
   durable domain kernel, into a provider process, then return as ordered UI state?
3. How do local web, hosted web, desktop, and mobile share semantics while keeping
   different process, storage, rendering, and native-integration designs?
4. How do pairing, remote access, updates, packaging, telemetry, and release
   channels work beyond the happy path?
5. Which behaviors are guaranteed, best effort, latent, transitional, or explicit
   future work, and where do the important failure and retention seams remain?

The book is explanatory, not a replacement for the upstream user guide. It covers
implementation, invariants, failure handling, and design consequences. It does not
invent a product roadmap or present repository clues as commitments.

## 2. Source and claim contract

### 2.1 Four claim classes

Every non-trivial claim belongs to exactly one class:

| Label | Meaning | Required evidence |
| --- | --- | --- |
| **Verified behavior** | Executable behavior at the pinned revision | Code, test, schema, migration, or workflow |
| **Documented intent** | A maintainer's explanation or operating rule | Pinned internal/user/operations document |
| **Inference** | A design consequence derived from several sources | All inputs cited; inference named explicitly |
| **Future / proposed** | An explicit unshipped idea or limitation | Pinned future-work text or issue; never phrased as shipped |

Release notes and the public docs may establish product wording, but code wins when
describing current mechanics. A discrepancy is shown, not silently reconciled.

### 2.2 Source lock

- Canonical checkout: the path in `T3CODE_SOURCE_DIR`, or the sibling `../t3code`
- Full source SHA: stored in `sources/t3code.lock.json`
- Exact excerpts: declared in `sources/excerpts.manifest.json`
- Generated excerpt text, line numbers, checksums, and permalinks:
  `src/generated/excerpts.json`
- Refresh: `npm run source:sync`
- Drift check: `npm run source:check`

No prose author copies a source block by hand. The synchronizer extracts it from the
pinned checkout; the validator rejects unknown IDs, changed checksums, invalid
ranges, and a checkout whose SHA no longer matches the lock.

### 2.3 Status vocabulary

- `draft`: narrative or visual is incomplete.
- `source-checked`: material claims have a pinned source trail and exact excerpts
  have passed validation.
- `verified`: source checks, production build, interaction checks, links, and an
  editorial review all pass.

### 2.4 Roadmap vocabulary

The book keeps these categories separate:

- **Shipped at the source lock** — present in executable code.
- **Latent capability** — builder or contract supports it, but current distribution
  or UI does not ship it.
- **Transition / compatibility path** — old and new behavior coexist.
- **Explicit future work** — upstream docs say it is planned or desired.
- **Community idea** — discussed externally but not committed by maintainers.

There is no milestone-derived roadmap in the pinned repository. The known explicit
future items in `docs/internals/remote.md` are handled as future work, while the
implemented OAuth callback path is called out as a stale-document discrepancy.

## 3. Reader routes

The canonical route follows runtime causality:

```text
ownership → vocabulary → boot/auth → command/event kernel → provider boundary
→ work lifecycle → client projection → remote path → distribution/operations
```

Alternative routes are surfaced in the reading guide:

- **System designer:** 1, 4, 7, 9–15, 20, 26, 29, 34, 36, 40.
- **Provider integrator:** 1, 7, 9–20, 23–27, 39.
- **Client engineer:** 2, 7–8, 11, 23–24, 29–36, 39.
- **Release/operator:** 4–8, 13, 34–40.
- **Architecture auditor:** 1, 3, 9–15, 20, 23–26, 29, 36, 39–40.

The front matter includes a complete spatial architecture map and a step-through
request trace, so readers have both a map and a causal story before Chapter 1.

## 4. Chapter specification

Each chapter entry below specifies the question it must settle, its primary source
anchors, and the visual or interactive artifact that makes the mechanism testable.
All paths are relative to the pinned T3 Code checkout.

### Start here

#### Cover

- **Purpose:** establish the edition, source revision, and independent, public,
  source-locked nature.
- **Artifact:** responsive use of the supplied cover, with an accessible text
  alternative and no derivative asset generation.

#### How to read a changing system

- **Question:** how can a reader distinguish a fact, an interpretation, and a plan?
- **Sources:** source-lock and generated-excerpt pipeline in this repository.
- **Visual:** evidence ladder and freshness model.

#### Contents and learning route

- **Question:** why is the book ordered by causality instead of folders?
- **Artifact:** part roadmap plus role-specific routes.

#### The complete system map

- **Question:** where do clients, trust, domain logic, work services, adapters, and
  provider processes live?
- **Sources:** `docs/internals/overview.md`, `apps/server/src/server.ts`,
  `packages/contracts/src/rpc.ts`, `packages/client-runtime/src/connection`.
- **Visual:** interactive ownership bands and intent/state flow.

#### One request, every boundary

- **Question:** what happens between pressing Send and seeing a settled answer?
- **Sources:** orchestration contracts, normalizer, engine, reactors, provider
  service, projectors, client thread reducer, checkpoint settlement.
- **Artifacts:** an interactive phase lab and a full sequence diagram.

### Part I — Boundaries and vocabulary

#### 1. Control surface, not agent brain

- **Settles:** T3 Code owns orchestration, durable product state, work surfaces, and
  transport; each provider still owns its native reasoning/context engine.
- **Sources:** `docs/internals/overview.md:5-28`, `ProviderAdapter.ts`, provider
  drivers, orchestration contracts.
- **Visual:** responsibility matrix for T3, provider, OS, Git, and client.

#### 2. Environment, project, thread, turn, session

- **Settles:** the vocabulary and cardinalities that later chapters assume.
- **Sources:** `packages/contracts/src/environment.ts`, `project.ts`,
  `orchestration.ts`, server projection schemas.
- **Visual/lab:** clickable entity relationship map; lifecycle vocabulary quiz.

#### 3. Repository and dependency atlas

- **Settles:** what each app/package/infra/native directory builds and which edges
  are runtime, build-time, protocol, generated, or deployment-only.
- **Sources:** root/package manifests, workspace graph, Vite/Electron/Expo/Astro
  configurations, native crates and packages.
- **Visual:** filterable monorepo graph and a reproducible production/test inventory by area.

#### 4. Runtime topologies and technology placement

- **Settles:** the five delivery shapes: local CLI web, hosted web, Electron,
  React Native, and marketing; why Effect, SQLite, React, Expo, Astro, Electron,
  native Ghostty, and typed contracts appear where they do. Unrecorded rationale is
  labeled as inference; code proves placement and consequences, not author intent.
- **Sources:** each app entrypoint/config, server composition, runtime manifests.
- **Visual:** topology switcher showing process and trust boundaries per surface.

### Part II — Boot and connect

#### 5. The `npx t3` bootstrap path

- **Settles:** CLI argument/config resolution, server startup, address selection,
  browser/local client behavior, and bundled web assets.
- **Sources:** `apps/server/src/bin.ts`, `apps/server/src/cli/config.ts`,
  `apps/server/src/cli/server.ts`, `apps/server/src/config.ts`,
  `apps/server/vite.config.ts`, and `apps/server/package.json`.
- **Visual:** CLI bootstrap swimlane; package-content exploder.

#### 6. Server composition and execution boundary

- **Settles:** how Effect layers assemble HTTP, RPC, auth, orchestration,
  providers, VCS, terminal, files, assets, usage, relay, and telemetry services.
- **Sources:** `apps/server/src/server.ts`, runtime-startup files, layer constructors.
- **Visual:** layer-construction DAG with startup and shutdown ownership.

#### 7. Effect RPC, subscriptions, and wire contracts

- **Settles:** request/response versus subscription semantics, schemas,
  serialization, errors, capabilities, snapshots, and cursors.
- **Sources:** `packages/contracts/src/rpc.ts`, domain contract files,
  server WebSocket router, `packages/client-runtime/src/rpc`.
- **Lab:** inspect a command, acknowledgement, snapshot, and event frame.

#### 8. Pairing, scopes, credentials, and WebSocket upgrade

- **Settles:** environment auth policy, browser/bearer/DPoP credentials, pairing
  grants, session/ticket lifetimes, per-method scopes, secret handling, and the
  authenticated WebSocket upgrade. Target resolution and reconnect stay in Chapter 29.
- **Sources:** `docs/internals/environment-auth.md`, server auth/session/pairing/
  secret-store layers, HTTP credential exchange, and RPC scope enforcement.
- **Lab:** credential, scope, TTL, one-use, persistence, and replay-resistance ladder.

### Part III — Transactional domain core and post-commit delivery

#### 9. Commands and invariants

- **Settles:** external/internal commands, normalization, authorization, the
  decider's persistence- and provider-I/O-free boundary despite clock/UUID Effect
  dependencies, aggregate validation, the atomic event batch for an existing turn,
  and multi-step bootstrap with compensating cleanup outside that transaction.
- **Sources:** orchestration contracts, `Normalizer.ts`, deciders, aggregate tests.
- **Lab:** choose valid/invalid command transitions and inspect emitted events.

#### 10. Events, receipts, and idempotency

- **Settles:** event envelope, command receipt, retry behavior, event publication,
  and why acknowledgement does not mean provider work is complete.
- **Sources:** `OrchestrationEngine.ts`, persistence schemas, command receipt tests.
- **Visual:** transaction boundary and duplicate-command timeline.

#### 11. Projection tables and read models

- **Settles:** how events update shell/thread/activity/plan/checkpoint/runtime views,
  then become HTTP snapshots and live subscriptions.
- **Sources:** projector registry/implementations, read stores, snapshot handlers.
- **Lab:** fold the same event stream into several projections.

#### 12. Post-commit reactors: serialized handling without durable delivery

- **Settles:** intent events trigger side effects only after commit, internal results
  re-enter the command queue, workers serialize handling, scopes interrupt work on
  shutdown, and the hot stream does not durably replay pending side effects.
- **Sources:** reactor layers, drainable worker utilities, engine dispatch tests.
- **Visual:** commit/publish/react/ingest timing diagram with crash points; contrast
  the non-durable server bridge with mobile's durable client outbox.

#### 13. SQLite, files, settings, secrets, migrations, and recovery

- **Settles:** SQLite schema/WAL/migrations, settings JSON, secret files,
  attachments/logs/terminal history, hidden Git refs, tombstones/retention, and
  startup reconstruction. Provider adoption semantics wait for Chapter 15.
- **Sources:** persistence package, migrations, recovery services and tests.
- **Lab:** crash at selected phases and show the recoverable state.

### Part IV — Five harnesses, one product model

#### 14. The `ProviderAdapter` contract

- **Settles:** discovery, sessions, turns, steer/interrupt, approval/input, modes,
  canonical event streams, errors, and capabilities.
- **Sources:** `ProviderAdapter.ts`, provider contracts, adapter conformance tests.
- **Visual:** normalized boundary with required and optional capability lanes.

#### 15. Drivers, instances, registries, and multi-instance routing

- **Settles:** provider identity versus binary/driver/instance/native account/session,
  discovery and health, registry lookup, managed processes, and recovery.
- **Includes:** legacy provider settings merged into explicit opaque instance configs
  (explicit wins), secret-backed/redacted environment values, live child-scope
  replacement, unavailable shadow entries, and the plaintext OpenCode password exception.
- **Sources:** provider registry/instance layers, driver discovery, ProviderService.
- **Lab:** route several threads across installed providers and accounts.

#### 16. Codex through app-server JSON-RPC

- **Settles:** app-server process lifecycle, initialize/account/model/config,
  thread resume, turn calls, approvals, streaming notifications, and normalization.
- **Sources:** Codex driver and `packages/effect-codex-app-server`.
- **Visual:** native JSON-RPC to canonical event mapping.

#### 17. Claude through the Agent SDK

- **Settles:** SDK session lifecycle, permissions, models/modes, skills/commands,
  resume metadata, tool events, and result handling.
- **Sources:** Claude driver, Claude skills scanner, adapter tests.
- **Visual:** Claude SDK event-to-product mapping and skill precedence.

#### 18. Cursor and Grok through ACP

- **Settles:** shared ACP client/transport, provider-specific launch/configuration,
  session calls, capabilities, request forwarding, and notification mapping.
- **Sources:** Cursor/Grok drivers and `packages/effect-acp`.
- **Visual:** shared ACP spine with provider-specific forks.

#### 19. OpenCode and the normalization matrix

- **Settles:** OpenCode transport/session path and a five-provider comparison of
  resume, models, plans, approvals, input, commands, skills, subagents, usage, and
  failure semantics.
- **Sources:** OpenCode driver plus all adapter conformance fixtures.
- **Lab:** capability matrix that explains UI enablement and fallback.

#### 20. Two usage systems: live context telemetry and transcript accounting

- **Settles two separate pipelines:** (1) live per-thread token/context-window
  telemetry normalized from provider runtime events; and (2) the historical Usage
  page, which scans provider-owned transcript files independently of T3's
  orchestration projections. The chapter never treats one as the source of the other.
- **Provider coverage:** the historical scanner supports Codex and Claude at this
  revision; Cursor, Grok, and OpenCode contribute no Usage-page transcript source.
  Live context telemetry is likewise emitted only by the Codex and Claude adapters
  at this revision; the generic runtime event contract can represent it for a future
  adapter, but Cursor, Grok, and OpenCode do not currently emit it. The five-adapter
  matrix from Chapter 19 makes that implementation gap explicit.
- **Scanner pipeline:** provider home resolution → transcript discovery with mtime
  window slack → provider-specific parse → within-file and cross-file de-duplication
  → canonical timestamped records → `(day, hour?, provider, model)` aggregate
  buckets → session counts and source diagnostics → persisted
  `(path, size, mtime, provider)` scan cache. The contract can represent partial and
  failed scans, while the current implementation predominantly reports `ok` or
  `missing` and leaves malformed-record accounting at zero.
- **Accounting rules:** IANA-time-zone day buckets and an exact rolling 24-hour mode;
  cached input and cache creation remain disjoint from uncached input; reasoning is a
  subset of output and is never added twice; cost is provider-reported, LiteLLM
  model-priced, or explicitly unpriced; cache savings are estimated alongside cost;
  API-equivalent cost is not subscription billing.
- **Cross-environment composition:** raw transcripts never cross the wire. Each
  environment returns typed aggregate buckets and a physical-source fingerprint.
  Web and mobile use the shared merge to claim duplicate transcript directories once,
  exclude incompatible contract versions, count distinct sessions without summing
  per-bucket duplicates, and expose partial/failed coverage honestly.
- **Sources:** `packages/contracts/src/usage.ts`, `apps/server/src/usage/UsageService.ts`,
  `usageTranscriptReader.ts`, `usageTranscripts.ts`, `usageAggregation.ts`,
  `usagePricing.ts`, `usageScanCache.ts`, `packages/shared/src/usageMerge.ts`, the
  usage RPC, web/mobile usage state and presentation, and their tests.
- **Third usage path:** Codex and Claude can also report per-task/subagent usage for
  the Agents surface. It is neither the context meter nor historical cost input and
  is deferred to Chapter 25 with provider tasks.
- **Visual:** two-lane topology separating live thread telemetry from transcript
  accounting all the way through their distinct product presentations; there is no
  joining or summation arrow.
- **Lab:** usage-accounting workbench. Choose provider records, duplicates, session
  boundaries, cache categories, model-rate availability, time zone, and two
  environments that may share a source fingerprint; step through parse, normalize,
  deduplicate, bucket, price, summarize, and merge while every total shows its formula.

### Part V — The work lifecycle

#### 21. Project discovery and `t3.json`

- **Settles:** roots, discovery, project identity, configuration precedence,
  explicit registration entry points, checked-in-script import boundaries, setup
  commands, environment labels, and project projection.
- **Sources:** project contracts/services, config loader, discovery tests and docs.
- **Visual:** filesystem decision lab, checked-in-action import flow, and project
  identity projection.

#### 22. Current checkout versus isolated worktrees

- **Settles:** workspace kinds, branch/base selection, creation/setup/cleanup,
  Git invariants, normal thread-deletion versus optional worktree cleanup, and
  failure recovery.
- **Sources:** workspace/worktree services, VCS contracts, orchestration decider.
- **Lab:** choose a task topology and inspect checkout/branch consequences.

#### 23. Start, stream, steer, interrupt, settle

- **Settles:** complete thread/turn state machine and provider runtime states,
  including buffering, steering, interruption, retries, compaction, and completion.
- **Sources:** orchestration contract/decider/reactors, ProviderService, reducers.
- **Lab:** event timeline with illustrative teaching controls at each state; it is
  explicitly not presented as the server's complete legality matrix.

#### 24. Permission modes, approvals, and structured input

- **Settles:** approval-required, auto-accept-edits, auto, full-access; how provider
  prompts become canonical pending requests and how clients resolve them.
- **Sources:** runtime mode contracts, provider adapters, approval/input reactors,
  web/mobile components.
- **Visual:** security-responsibility matrix and multi-provider mapping.

#### 25. Threads, provider tasks, plans, skills, and subagents

- **Settles:** threads as durable work items; provider-emitted tasks/subagents as
  normalized durable activity; ephemeral liveness and live plan progress; lifecycle/
  pin/snooze overlays; per-task token/tool/duration rollups currently normalized by
  Codex and Claude; and why this is not a durable cross-provider scheduler. Task
  usage is not fed into either live context telemetry or Chapter 20's historical
  transcript accounting.
- **Sources:** orchestration/settings contracts, provider skills, work-log logic.
- **Lab:** quiet work-log projector for web, Agents surface, and mobile.

#### 26. Who owns context, compaction, and memory

- **Settles:** provider-owned prompt context and compaction versus T3-owned thread
  history, resume cursor, and context-window telemetry, with client drafts/outbox
  deferred to Chapter 33. It explicitly documents that no universal T3 long-term
  memory subsystem exists at this revision and cross-links the separate historical
  accounting pipeline in Chapter 20 instead of conflating usage with memory.
- **Sources:** provider sessions, runtime context-window events, thread state/reducer,
  provider compaction paths, and client cache ownership.
- **Lab:** ownership and restart ledger covering provider context, T3 projections,
  live telemetry, client cache, drafts, and provider-session recovery.

#### 27. Hidden-ref checkpoints, diffs, and revert

- **Settles:** before/after turn checkpoints, hidden Git refs, changed-file summary,
  turn/branch/working-tree diffs, destructive restore semantics, `ready`/`missing`/
  `error`, provider-specific rollback, and partial failure. Client history-epoch
  implementation is deferred to Chapter 29.
- **Sources:** checkpoint service/reactor/contracts, diff state, web/mobile review.
- **Lab:** Git graph before a turn, after a turn, and after revert.

#### 28. Terminals, files, previews, MCP, VCS, and pull requests

- **Settles:** the workbench services surrounding chat, their authorization and
  streaming models, signed assets, desktop-only preview, and surface parity.
- **Sources:** terminal/files/assets/MCP/VCS/PR contracts and services; Ghostty
  implementations; desktop preview APIs.
- **Visual:** capability matrix plus terminal and signed-asset data paths.

### Part VI — Client architectures: shared semantics, platform edges

#### 29. The shared client runtime

- **Settles:** Primary/Bearer/Relay/SSH target taxonomy, connection registry/resolver/
  supervisor/one-attempt session, Effect Atom registry,
  shell/thread factories, snapshot/cursor algorithms, cache ownership, and retry.
- **Sources:** `packages/client-runtime/README.md` and `src/connection`, `src/rpc`,
  `src/state`.
- **Lab:** snapshot, duplicate, gap, reconnect, revert, and older-page races.

#### 30. Web routes, state, and rendering performance

- **Settles:** hosted/local/Electron runtime choice, router history, providers,
  atoms, virtualization, row-local updates, trace export, and browser terminal.
- **Sources:** `apps/web/src/main.tsx`, `AppRoot.tsx`, route tree, atom registry,
  `MessagesTimeline.tsx`, `ChatView.tsx`.
- **Visual:** React composition and hot-path rendering diagram.

#### 31. Composer, work log, review, and sidebar lifecycle

- **Settles:** message composition/attachments/commands/skills, optimistic states,
  quiet timeline and Agents surface, review modes, thread ordering and pinning.
- **Sources:** web composer, session logic, diff panel, thread sort/sidebar.
- **Lab:** same canonical thread projected into focused product surfaces.

#### 32. Desktop: Electron, IPC, server ownership, browser, and SSH

- **Settles:** main/preload/renderer boundary, the host-local primary, Windows
  WSL-only versus dual-instance modes, backend-pool ownership, fd 3/4/5 bootstrap
  and telemetry, exposure, the separate SSH gateway, preview webviews, menus, and
  updates.
- **Sources:** desktop main/app/preload/backend/preview/SSH/update modules.
- **Visual/lab:** mutually exclusive primary choices, optional WSL secondary,
  separate SSH authority, and the boot/readiness/shutdown lifecycle.

#### 33. Mobile: persistence, outbox, sharing, and native systems

- **Settles:** Expo app composition, native navigation/feed choices, durable drafts
  and intent outbox, share reservation, native terminal/diff/keyboards/widgets,
  iOS notification capability, and OTA coordination.
- **Sources:** app config, connection runtime, outbox, ThreadFeed, native modules,
  awareness, updates.
- **Lab:** offline command-outbox state machine and guarded foreground/background
  OTA update handoff.

### Part VII — Reach and ship

#### 34. Primary, paired bearer, Tailscale endpoints, and SSH access

- **Settles:** launch transport versus access transport, bind/exposure policy,
  one-time pairing, bearer registration, Tailscale endpoint provisioning, and
  desktop SSH gateway behavior.
- **Sources:** remote/environment-auth docs, Tailscale/SSH packages, resolver,
  desktop exposure and gateway code.
- **Visual:** primary/direct, paired bearer over LAN or Tailscale, and desktop-managed
  SSH sequences. Tailscale is an endpoint provider, not a connection target kind.

#### 35. T3 Connect: OAuth, DPoP, relay, and tunnel

- **Settles:** Clerk session, device key, DPoP, environment registration, relay
  broker, tunnel provisioning, OAuth callback path, and what traffic does *not*
  traverse the relay.
- **Sources:** `docs/internals/t3-connect.md`, relay infra, hosted routes, remote auth.
- **Visual/lab:** credential ladder and launch/data-plane toggle.

#### 36. Reconnect, multi-environment state, notifications, and version skew

- **Settles:** environment catalog, generation leases, shell/thread reconciliation,
  background demand, multi-environment merge, awareness relay/APNs, and capability/
  exact-version recovery.
- **Sources:** client supervisor/state, background contracts/policy, relay awareness,
  client version skew and self-update state.
- **Labs:** connection supervisor and notification throttling/fallback.

#### 37. Distribution artifacts: CLI, hosted app, desktop, mobile, marketing, and AUR

- **Settles:** npm CLI plus copied web build, hosted static web, Electron artifact
  matrix/signing/native staging, mobile stores, marketing, AUR, and the difference
  between builder support and artifacts actually shipped.
- **Sources:** build configs/scripts, package manifests, release workflow, marketing
  download resolver, AUR scripts.
- **Visual:** artifact factory from source tree to installable products.

#### 38. Release graph, three update systems, and observability/privacy

- **Settles in three explicit acts:** (1) release DAG, two version domains, and the
  npm-before-clients invariant; (2) Electron updater, managed-server exact-version
  preflight, and EAS fingerprint/OTA as three independent state machines; (3)
  PostHog product analytics, local/OTLP tracing, browser trace ingestion, and local
  desktop resource telemetry with precise identities, destinations, and controls.
- **Sources:** release/mobile workflows, updater state machines, self-update,
  analytics/observability/resource telemetry.
- **Labs:** release-channel resolver, OTA eligibility grid, update handshake.

### Part VIII — Synthesis

#### 39. Six complete traces

- **Traces:** local first turn; relay-connected mobile turn; approval round-trip;
  offline mobile task drain; checkpoint diff/revert; stable release and exact-version
  update.
- **Artifact:** synchronized swimlanes whose steps link back to the owning chapters
  and exact sources.

#### 40. Decisions, trade-offs, limitations, and an honest roadmap

- **Settles:** why server authority, the transactional event core, hot post-commit
  reactors, snapshot + cursor, adapters, one reconnect owner, durable mobile intent,
  exact-version updates, and scope-driven background work are valuable—and what
  complexity each choice creates.
- **Includes:** verified discrepancies, platform asymmetries, latent artifact targets,
  transitional plan UI, no universal memory layer, and explicitly documented future
  remote work. It also covers tombstone deletion/selected cleanup, retained event/
  binding/worktree/checkpoint state, attachment cleanup outside the projection
  transaction, the replay-marker retention inference, and the server reactor crash window.
- **Visual:** decision ledger with pressure, choice, benefit, cost, alternative, and
  reversal trigger.

## 5. Visual system

Visuals use a consistent grammar rather than decorative diagrams:

- navy = client/product surface;
- blue = typed transport or contract;
- amber = durable intent/state;
- green = post-commit side effect or external execution;
- violet = provider-native protocol;
- red = failure, trust, or destructive boundary;
- dashed edge = asynchronous, retryable, or eventual;
- solid edge = synchronous call or transactional relation.

Every figure has a title, numbered caption, text equivalent, source trail, keyboard
operation where interactive, and a static print state. Mermaid is reserved for
sequences/flows whose source is clearer as text. Bespoke Astro components handle
state machines, comparisons, timelines, and simulations.

## 6. Interaction inventory

The final book contains, at minimum:

1. ownership layer map;
2. end-to-end request trace;
3. entity/cardinality explorer;
4. monorepo graph filters;
5. runtime topology switcher;
6. connection supervisor state machine;
7. RPC frame inspector;
8. command/decider lab;
9. projection fold lab;
10. crash/recovery lab;
11. provider capability matrix;
12. work lifecycle controller;
13. quiet work-log projector;
14. usage accounting and cross-environment de-duplication workbench;
15. context/compaction/memory ownership ledger;
16. checkpoint Git graph;
17. cursor/reconnect race lab;
18. mobile outbox lab;
19. notification delivery lab;
20. artifact/release explorer;
21. OTA/update eligibility lab;
22. synchronized six-trace ownership and failure-boundary stepper;
23. decision ledger;
24. background demand/power-policy lab;
25. three-updater failure comparison;
26. telemetry identity/destination/privacy flow.

An interaction is included only when changing an input reveals a state transition,
invariant, or trade-off that static prose would obscure.

## 7. Book engine

The old `codex-decoded` engine supplied the useful visual precedent: source cards,
architecture diagrams, and linear chapter navigation. This edition replaces its
eager Vite/hash/HTML-string architecture with:

- Astro static routes and typed MDX content;
- one content collection as the navigation/search/metadata authority;
- build-time excerpt extraction and source-lock validation;
- Pagefind full-text search with development metadata fallback;
- lazy Mermaid and no framework runtime for ordinary pages;
- accessible sidebar, keyboard search, theme, heading navigation, previous/next,
  reduced motion, and print styles;
- responsive source cards with real line numbers, checksums, copy, and immutable
  GitHub permalinks;
- `BASE_PATH` support for repository-scoped GitHub Pages without changing links.

The target is a content-first static site: JavaScript is paid only for search,
diagrams, and genuine simulations.

## 8. Authoring waves and review gates

### Wave A — mental model and kernel

- Front matter and Chapters 1–15.
- Gate: one request can be traced from RPC to committed event, reactor, provider,
  runtime ingestion, projection, and client cursor with no unexplained jump.

### Wave B — providers, usage, and work lifecycle

- Chapters 16–28.
- Gate: every provider is compared against the actual adapter contract; context,
  memory, task, plan, live token telemetry, historical usage accounting, and
  checkpoint ownership are not conflated.

### Wave C — clients and remote access

- Chapters 29–36.
- Gate: every surface difference is explicit; shared runtime algorithms and
  presentation-specific algorithms are both explained.

### Wave D — distribution and synthesis

- Chapters 37–40 and six end-to-end traces.
- Gate: current stable, nightly, builder-only, mobile, and managed-server paths are
  distinct; roadmap statements are evidence-classified.

### Review loop for every wave

1. Source audit against the pinned checkout.
2. Claim/excerpt/source-trail validation.
3. Cross-chapter vocabulary and forward-reference review.
4. Diagram and simulator invariant review.
5. Production build, search index, internal links, and responsive static checks.
6. Editorial pass for causal order, repetition, and unstated assumptions.
7. Local commit. Merge authored waves through pull requests once the public remote
   and branch protection are active.

## 9. Automated quality gates

Required local commands:

```sh
npm run source:check
npm test
npm run build
```

The validation suite will grow to enforce:

- unique slugs and chapter order;
- a complete 1–40 chapter table of contents;
- valid excerpt IDs and source-lock SHA;
- no source-checked chapter without a source trail;
- no broken internal route/heading/source permalink;
- alt text and accessible names for visual/interactive components;
- all simulations usable by keyboard and meaningful in print;
- Pagefind indexing every non-cover chapter;
- bounded client bundles, with Mermaid and labs split by route;
- zero external analytics or network dependency in the local book.

## 10. Definition of done

The project is complete when all 40 chapters and front matter are present, all are
`source-checked` or `verified`, every planned flow has either a figure or lab, exact
source references resolve at the pinned revision, the six synthesis traces agree
with their detailed chapters, the static build and validation suite pass, and a
fresh reader can progress from ownership to deployment without requiring knowledge
that appears later in the book.

## 11. Public repository and GitHub Pages

The publication target is a public GitHub repository named `t3code-decoded` with
GitHub Pages serving the validated static build. It is owned by the personal
`BenAlaa` account, not an EasyGenerator organization.

- Default branch: `main` (no parallel `master` branch).
- Pages source: GitHub Actions artifact from `npm ci`, source validation, tests,
  and `npm run build`.
- Pull requests: required before any authored book commit reaches `main`; the only
  bootstrap exception is GitHub's generated placeholder commit used to create the
  base branch before protection is enabled.
- Reviews: at least one approving review; stale approvals dismissed when new
  commits are pushed; latest-push approval and conversation resolution required.
  The owner account `BenAlaa` receives **pull-request-only** bypass so a solo-owned
  PR can merge without self-approval while still leaving a PR and bypass audit
  trail. It receives no routine direct-push exemption.
- Checks: `Validate and build` and `Conventional changes` must pass; the latter
  enforces the PR title/body and every fine-grained commit subject. Force pushes
  and branch deletion are disabled, and history stays linear through rebase merges.
- Community files: detailed `README.md`, `CONTRIBUTING.md`, code of conduct,
  security policy, issue forms, pull-request template, and `CODEOWNERS`.
- Licensing/attribution: distinguish original book prose/site code from short
  MIT-licensed T3 Code excerpts, and state clearly that this is an independent,
  unofficial study guide.

The public repository and Pages pipeline are active. The complete source-validated
edition is published from protected `main`. New work remains on local or topic
branches until it is pushed and opened as a pull request, then merges only after
the required checks and review policy are satisfied. No authored project work is
pushed directly to `main`; every change keeps its pull-request audit trail.

Commits inside a part remain fine-grained: shared engine capability, individual
chapter or tightly coupled chapter pair, source manifest change, lab/figure, and
review correction are separate when they can be understood and reverted alone.
Pull-request bodies use the repository template and explain outcome, non-goals,
evidence, interactions, validation, and the review's riskiest assumptions.
