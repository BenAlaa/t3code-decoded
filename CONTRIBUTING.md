# Contributing to T3 Code Decoded

Thank you for helping make the architecture easier to understand. This repository
values corrections and well-grounded explanations more than volume. A contribution
is successful when a reader can verify it at the pinned T3 Code revision and it
fits the causal learning path of the book.

## Before you start

Read:

1. [README.md](./README.md), especially the source-grounding model;
2. [BOOK_PLAN.md](./BOOK_PLAN.md), for chapter ownership and intended figures;
3. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

For a typo, broken link, small accessibility fix, or unambiguous source correction,
a pull request is enough. Open an issue first when proposing:

- a new chapter or major reorder;
- a new dependency or framework runtime;
- a source-lock update;
- a public claim about roadmap, security, privacy, or product behavior;
- a simulation that changes the visual grammar;
- a license or governance change.

## Development setup

```sh
npm ci
npm run dev
```

Run the complete local gate before requesting review:

```sh
npm test
npm run build
```

To verify generated excerpts against a T3 Code checkout:

```sh
T3CODE_SOURCE_DIR=/absolute/path/to/t3code npm run source:check
```

The checkout must be at the commit in `sources/t3code.lock.json`.

## Choose the right change boundary

Keep one concern per branch and pull request:

- `docs/...` for chapter prose or source corrections;
- `feat/...` for a new reader-facing component or lab;
- `fix/...` for engine, accessibility, or interaction defects;
- `test/...` for validators and regression coverage;
- `ci/...` for validation and deployment workflows;
- `chore/...` for tooling, dependencies, and repository maintenance.

A whole book part can be one review milestone when its chapters form a coherent
causal unit. Within that branch, keep each chapter, visual, or shared engine change
in a focused commit. Do not mix a provider chapter rewrite with unrelated CSS or
release automation.

## Conventional Commits

Every commit and pull-request title follows this form:

```text
<type>(<scope>): <imperative summary>
```

Allowed common types:

- `feat` — reader-facing engine, component, figure, or lab;
- `fix` — correction to behavior, layout, accessibility, or facts;
- `docs` — book prose, README, plan, or governance documentation;
- `test` — tests and validation assertions;
- `refactor` — internal restructuring with no reader-facing behavior change;
- `perf` — measurable build/runtime improvement;
- `build` — build-system or packaging changes;
- `ci` — continuous-integration and deployment changes;
- `style` — formatting-only changes with no semantic effect;
- `chore` — dependencies, workflows, and maintenance.

Useful scopes include `book`, `engine`, `sources`, `provider-codex`,
`provider-claude`, `clients`, `remote`, `release`, `pages`, and `repo`.

Good examples:

```text
docs(kernel): explain command receipts and crash windows
feat(checkpoints): add the hidden-ref restore simulator
fix(remote): separate relay provisioning from the data plane
test(sources): reject excerpts outside the locked checkout
chore(pages): publish the base-path-aware static artifact
```

Avoid vague summaries such as `updates`, `fix docs`, or `changes`.

Use the body to explain *why* when the diff cannot do so by itself. Add a footer for
breaking authoring/engine changes:

```text
BREAKING CHANGE: chapter frontmatter now requires an evidenceClass field.
```

## Writing and evidence rules

### Start with the question

Every chapter should settle one named architectural question. Its opening should
locate the mechanism in the end-to-end request, and its closing should state the
invariant or trade-off the reader should retain.

### Classify claims

Use the book's four evidence classes:

- verified behavior;
- documented intent;
- inference;
- future/proposed.

Do not turn a comment, test fixture, release artifact builder, issue, or external
post into a shipped-product claim without checking the executable path.

### Prefer exact source anchors

Use `SourceList` for a trail and `SourceExcerpt` only when the source shape itself
teaches something important. Keep excerpts short enough to annotate. Add a manifest
entry instead of hand-copying code:

```json
{
  "id": "descriptive-stable-id",
  "path": "apps/server/src/example.ts",
  "start": 10,
  "end": 28,
  "language": "typescript",
  "label": "What this excerpt demonstrates"
}
```

Then run `npm run source:sync`. Generated JSON is committed with the manifest and
chapter that uses it.

### Explain failure behavior

For commands, side effects, persistence, transport, updates, and cleanup, answer:

- What is atomic?
- What is merely ordered?
- What survives a crash or reconnect?
- Who retries?
- What is idempotent?
- What can partially succeed?
- Which provider or surface behaves differently?

### Respect source licensing

Quote only the minimum source required to explain the design. Do not copy upstream
documentation or substantial source files into the book. Preserve attribution and
immutable links. Never include credentials, local paths containing personal data,
private downstream implementation details, or unpublished repository content.

## Diagrams and interactive labs

Use a visual only when it makes structure, sequence, mapping, state, or a trade-off
materially clearer. Follow the grammar in `BOOK_PLAN.md` and provide:

- a title and numbered caption;
- a text equivalent in the surrounding prose;
- source references;
- keyboard operation and visible focus when interactive;
- a useful static/print state;
- reduced-motion behavior;
- no essential meaning encoded by color alone.

Simulations model real invariants. Their controls and transitions must be derived
from source and covered by a small unit test where practical. Do not add decorative
animation or a generic chart that repeats the prose.

## MDX chapter checklist

Each chapter needs valid collection frontmatter:

```yaml
slug: durable-command-core
order: 14
number: "9"
kind: chapter
part: Part III · The durable domain kernel
partOrder: 3
title: Commands and invariants
shortTitle: Commands
summary: A one-sentence promise to the reader.
status: draft
objectives:
  - A concrete question the chapter resolves.
keywords: [commands, decider, invariants]
sourceAreas: [packages/contracts/src/orchestration.ts, apps/server/src/orchestration]
visuals: [command microscope]
updatedAt: 2026-08-24
```

Keep the `order` unique and preserve causal order. Prefer short sections and local
forward links over repeating a concept before its chapter.

## Pull requests

Pull-request titles use the same Conventional Commit format as commits. Complete
the template with:

- reader outcome and explicit non-goals;
- source lock and material source anchors;
- evidence-class or discrepancy notes;
- figures/labs and accessibility implications;
- validation performed;
- review risks, open questions, and screenshots only when visual review benefits.

CI validates the pull-request title, required body sections, and every commit
subject. The protected `main` branch normally requires an approving review,
passing checks, and resolved conversations. New commits dismiss stale approval.
For owner-authored work, `BenAlaa` may use the ruleset's **pull-request-only**
bypass; this waives the impossible self-approval requirement but still requires a
PR and records the bypass. Direct pushes are not the maintenance workflow. Do not
force-push after review begins unless rewriting is necessary and reviewers are
warned.

## Review rubric

Reviewers evaluate, in this order:

1. factual correctness at the source lock;
2. claim classification and source sufficiency;
3. causal learning order and vocabulary consistency;
4. failure, security, platform, and provider nuances;
5. interaction/accessibility/print behavior;
6. maintainability, tests, and bundle impact;
7. prose clarity and visual polish.

A chapter should not reach `verified` merely because it builds.

## Updating the T3 Code source lock

Source refreshes are dedicated milestone pull requests. They must:

1. update the full commit and capture date;
2. regenerate every excerpt;
3. run the inventory and source-drift checks;
4. identify changed claims, capabilities, migrations, and distributions;
5. update discrepancies and roadmap classifications;
6. leave unrelated editorial rewrites for later pull requests.

## Getting help

Open a focused discussion or issue with the relevant source paths and the question
you are trying to settle. If evidence conflicts, show both paths rather than
guessing which one is authoritative.
