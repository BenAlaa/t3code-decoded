# T3 Code Decoded — editorial and implementation plan

This file is the editorial contract for the product guide and technical field guide.
The immutable upstream revision, capture date, and inventory live in
`sources/t3code.lock.json`.

## Outcome

The book serves two readers without splitting into separate sites.

The product reader should be able to install T3 Code, choose a client and connection
path, configure a provider, organize parallel work, give an agent useful context,
supervise it locally or remotely, inspect files and terminals, use previews and
devices, review changes, understand usage, update safely, and recover from common
failures.

The technical reader should be able to trace those behaviors through typed contracts,
the environment server, durable orchestration, provider adapters, work services,
client convergence, remote access, native integrations, packaging, and operations.

## Source and claim contract

Every non-trivial technical claim uses one of four labels:

| Label | Meaning | Evidence |
| --- | --- | --- |
| Verified behavior | Executable behavior in the source lock | Code, test, schema, migration, or workflow |
| Documented intent | A maintainer's explanation or operating rule | User, internal, or operations documentation |
| Inference | A design consequence derived from cited inputs | Every input cited; interpretation named |
| Future / proposed | Explicitly unshipped or recommended work | Clearly separated from supported behavior |

Exact excerpts are generated from the locked Git object. Authors edit ranges in
`sources/excerpts.manifest.json`, run `npm run source:sync`, and commit the generated
checksums in `src/generated/excerpts.json`. Broader evidence lives in
`sources/references.manifest.json`. Source validation rejects a checkout mismatch,
missing object, invalid range, stale generated excerpt, or unknown citation id.

Product chapters use plain language, task paths, decision guidance, and immutable
links to the applicable user documentation. They do not expose contributor tooling
or implementation detail unless it changes a user decision.

## Reading order

### Start here

- Cover and source synchronization
- Reading routes and evidence labels
- Complete contents

### Part I — Product guide

1. T3 Code as a product
2. Install and reach a useful first thread
3. Environments, clients, and connection paths
4. Organize projects, threads, and worktrees
5. Compose tasks with the right context
6. Choose providers, models, accounts, and permissions
7. The workbench: files, terminals, browser preview, and SnapShots
8. Source control: checkpoints, pull requests, reviews, and stacks
9. Remote environments and unattended work
10. Mobile: supervise agents from anywhere
11. Device lab: simulators, emulators, and agent-driven testing
12. Personalize, measure usage, update, and protect privacy
13. Complete recipes and troubleshooting

Each product chapter must answer four questions: what the capability does, how to
start, why it helps, and what is easy to misunderstand. The complete guide covers
web, desktop, iOS, Android, local and remote environments, six providers, parallel
work, rich context, review, recovery, and device verification.

### Part II — Architecture orientation and boundaries

14. The complete system map
15. One request, every boundary
16. Control surface, not agent brain
17. Environment, project, thread, turn, and session
18. Repository and dependency atlas
19. Runtime topologies and technology placement

This part establishes ownership before implementation detail. It includes provider
control services, agent-session import, device hosts and sessions, review graphs, and
all client surfaces.

### Part III — Boot and connect

20. The `npx t3` bootstrap path
21. Server composition, activation, and readiness
22. HTTP, WebSocket RPC, snapshots, and resume
23. Pairing, credentials, TTLs, and scopes

This part explains configuration, process ownership, Effect layers, typed methods,
subscriptions, cursors, version negotiation, pairing, bearer and DPoP credentials,
and method authorization.

### Part IV — Transactional domain core

24. Commands, invariants, and the boundary of atomicity
25. Events, receipts, idempotency, and the post-commit gap
26. Projection tables and read models
27. Post-commit reactors and the delivery gap
28. Persistence, reconstruction, and crash recovery

This part keeps the SQLite transaction boundary precise. It distinguishes accepted
intent from completed provider work, synchronous projections from hot reactors, and
durable records from files, Git refs, settings, secrets, or live processes.

### Part V — Six providers, one product model

29. The `ProviderAdapter` contract
30. Drivers, instances, registries, and multi-instance routing
31. Codex through app-server JSON-RPC
32. Claude through the Agent SDK
33. ACP transport, Cursor, and Grok
33A. Antigravity through ACP, managed auth, and account catalogs
34. OpenCode ownership, recovery, and six-provider normalization
35. Usage accounting and provider limits without a false ledger

Provider chapters preserve native differences in authentication, models, sessions,
steering, approvals, input, tasks, skills, attachments, compaction, usage, and rewind.
The usage chapter keeps live context, transcript history, custom prices, and pooled
subscription windows separate.

### Part VI — Work lifecycle and integrated tools

36. Project discovery, onboarding import, and `t3.json`
37. Current checkout versus isolated worktrees
38. Start, stream, steer, interrupt, settle
39. Permission modes, approvals, and structured input
40. Threads, provider tasks, plans, skills, and subagents
41. Context is provider-owned; history is T3-owned
42. Hidden-ref checkpoints, diffs, and revert
43. Terminals, files, previews, MCP, VCS, and review graphs
43A. Device hosts, targets, sessions, and agent control

This part follows a work item through discovery, workspace selection, provider work,
interaction, context, checkpointing, workbench tools, several linked reviews, GitHub
stacks, local or SSH device hosts, and agent device tools.

### Part VII — Client architectures

44. Shared runtime: connections, state, and convergence
45. One React renderer, three runtime edges
46. One thread, many deliberate projections
47. Electron desktop: one renderer, explicit native authority
48. Mobile: adaptive workspaces, persistence, and native systems

The client chapters explain shared settings, environment selection, load balancing,
snapshot and stream convergence, browser and desktop edges, adaptive mobile layouts,
offline drafts and uploads, native review and terminal surfaces, media, notifications,
voice input, and OTA compatibility.

### Part VIII — Reach and ship

49. Reachability is a route; authority is a separate proof
50. T3 Connect: OAuth, DPoP, relay, and tunnel
51. Reconnect, environments, notifications, and version skew
52. Distribution: artifacts, channels, and what actually ships
53. Release, update, and observability: three safety boundaries

This part separates endpoint reachability from authorization, covers direct, Tailscale,
T3 Connect, and SSH paths, then traces reconnection, packaging, stores, hosted surfaces,
nightlies, reversible server updates, analytics, tracing, and resource diagnostics.

## Visual and interaction contract

Every chapter must contain or point to a diagram, interactive lab, comparison, state
machine, or decision table that clarifies the mechanism. Motion is reader-triggered,
bounded, and disabled or simplified under `prefers-reduced-motion`. Every visual has
a text equivalent, works with keyboard input when interactive, remains meaningful in
print, and does not fetch data at runtime.

The site keeps one readable measure, persistent chapter navigation, full-text search,
light/dark/system themes, responsive tables, linkable headings, and previous/next
navigation. Product diagrams show tasks and choices; technical diagrams show ownership,
durability, data flow, and failure boundaries.

## Validation contract

Completion requires:

- unique slugs and display order;
- complete product and technical contents;
- valid source lock, excerpt ids, checksums, references, and immutable links;
- no draft chapters;
- accessible names and text equivalents for visuals;
- keyboard-safe interactions and reduced-motion behavior;
- all source, content, test, build, Pagefind, and built-site checks passing;
- no external runtime dependency for local reading; and
- a clean reading path from product task to implementation boundary.

## Publication

The repository publishes the validated static Astro build through GitHub Pages. The
public site follows protected `main`; local work can remain ahead until it is reviewed.
Commits remain focused and conventional, and pull requests explain the problem,
resulting behavior, evidence, interaction changes, and validation.
