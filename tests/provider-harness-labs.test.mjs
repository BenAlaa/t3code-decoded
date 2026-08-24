import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = (name) => readFile(new URL(`../src/components/${name}.astro`, import.meta.url), "utf8");
const chapter = (name) => readFile(new URL(`../src/content/book/${name}.mdx`, import.meta.url), "utf8");

const [adapter, routing, codex, claude, acp, opencode, usage, adapterChapter, routingChapter, normalizationChapter, usageChapter] = await Promise.all([
  component("AdapterContractLab"),
  component("ProviderRoutingLab"),
  component("CodexRpcBoundaryLab"),
  component("ClaudeSdkStreamLab"),
  component("AcpForkLab"),
  component("OpenCodeRecoveryLab"),
  component("UsageAccountingLab"),
  chapter("140-provider-adapter-contract"),
  chapter("150-provider-instances-routing"),
  chapter("190-opencode-normalization"),
  chapter("200-usage-accounting"),
]);

test("provider contract and routing labs progressively enhance complete static ledgers", () => {
  assert.match(adapter, /interface Props \{ id: string; \}/);
  assert.match(adapter, /data-adapter-ready="initializing"/);
  assert.match(adapter, /\.adapter-contract-lab:not\(\[data-adapter-ready="true"\]\) \.contract-interactive \{ display: none; \}/);
  assert.match(adapter, /\.adapter-contract-lab\[data-adapter-ready="true"\] \.contract-fallback \{ display: none; \}/);
  assert.match(adapter, /@media print[\s\S]*\.contract-fallback \{ display: block !important; \}/);

  assert.match(routing, /interface Props \{ id: string; \}/);
  assert.match(routing, /data-routing-ready="initializing"/);
  assert.match(routing, /\.provider-routing-lab:not\(\[data-routing-ready="true"\]\) \.routing-interactive \{ display: none; \}/);
  assert.match(routing, /\.provider-routing-lab\[data-routing-ready="true"\] \.routing-fallback \{ display: none; \}/);
  assert.match(routing, /@media print[\s\S]*\.routing-fallback \{ display: block !important; \}/);
});

test("Codex boundary lab keeps inert controls out of no-JS mode and restores its ledger in print", () => {
  assert.match(codex, /interface Props \{ id: string; \}/);
  assert.match(codex, /data-codex-ready="initializing"/);
  assert.match(codex, /\.codex-rpc-lab:not\(\[data-codex-ready="true"\]\) \.codex-interactive \{ display: none; \}/);
  assert.match(codex, /\.codex-rpc-lab\[data-codex-ready="true"\] \.fallback \{ display: none; \}/);
  assert.match(codex, /lab\.dataset\.codexReady = "true"/);
  assert.match(codex, /<details class="fallback" open>/);
  assert.match(codex, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(codex, /@media print[\s\S]*\.fallback \{ display: block !important; \}/);
});

test("Claude and ACP tab labs expose complete tab-panel relationships and keyboard navigation", () => {
  for (const [source, prefix, ready] of [[claude, "claude", "claudeReady"], [acp, "acp", "acpReady"]]) {
    assert.match(source, /interface Props \{ id: string; \}/);
    assert.match(source, /aria-controls=\{`\$\{labId\}-panel`\}/);
    assert.match(source, /id=\{`\$\{labId\}-tab-\$\{index\}`\}/);
    assert.match(source, /role="tabpanel" aria-labelledby=/);
    assert.match(source, /event\.key === "ArrowRight" \|\| event\.key === "ArrowDown"|e\.key === "ArrowRight" \|\| e\.key === "ArrowDown"/);
    assert.match(source, /event\.key === "ArrowLeft" \|\| event\.key === "ArrowUp"|e\.key === "ArrowLeft" \|\| e\.key === "ArrowUp"/);
    assert.match(source, /event\.key === "Home"|e\.key === "Home"/);
    assert.match(source, /event\.key === "End"|e\.key === "End"/);
    assert.match(source, new RegExp(`lab\\.dataset\\.${ready} = "true"`));
    assert.match(source, new RegExp(`\\.${prefix === "claude" ? "claude-sdk" : "acp-fork"}-lab\\[data-${prefix}-ready="true"\\] \\.fallback \\{ display: none; \\}`));
    assert.match(source, /@media print[\s\S]*\.fallback \{ display:block !important; \}|@media print[\s\S]*\.fallback \{ display: block !important; \}/);
  }
});

test("OpenCode recovery lab uses instance-scoped labels and a hydration-safe fallback", () => {
  assert.match(opencode, /interface Props \{ id: string; \}/);
  assert.match(opencode, /label for=\{`\$\{labId\}-branch`\}/);
  assert.match(opencode, /select id=\{`\$\{labId\}-branch`\}/);
  assert.match(opencode, /data-opencode-ready="initializing"/);
  assert.match(opencode, /absent, malformed, or wrong-version cursor/);
  assert.match(opencode, /\.opencode-recovery-lab:not\(\[data-opencode-ready="true"\]\) \.opencode-interactive \{ display:none; \}/);
  assert.match(opencode, /\.opencode-recovery-lab\[data-opencode-ready="true"\] \.fallback \{ display:none; \}/);
  assert.match(opencode, /@media print[\s\S]*\.fallback \{ display:block !important; \}/);
});

test("usage accounting lab preserves two-lane semantics, accessible tables, and book-native tokens", () => {
  assert.match(usage, /interface Props \{ id: string; \}/);
  assert.match(usage, /data-usage-ready="initializing"/);
  assert.match(usage, /<th scope="col">File<\/th>/);
  assert.match(usage, /aria-controls=\{`\$\{labId\}-panel`\}/);
  assert.match(usage, /reasoning ⊆ output; do not add it a second time/);
  assert.match(usage, /none · parser-local suppression/);
  assert.doesNotMatch(usage, /Provider key|native delta/);
  assert.match(usage, /live <code>88,000 \/ 200,000<\/code> thread context snapshot/);
  assert.match(usage, /\.usage-accounting-lab:not\(\[data-usage-ready="true"\]\) \.usage-stage-tabs/);
  assert.match(usage, /\.usage-accounting-lab\[data-usage-ready="true"\] \.usage-static-walkthrough \{ display: none; \}/);
  assert.match(usage, /lab\.dataset\.usageReady = "true"/);
  assert.doesNotMatch(usage, /var\(--(?:accent|border|surface|muted)(?:,|\))/);
  assert.match(usage, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(usage, /@media print[\s\S]*\.usage-static-walkthrough \{ display: block !important; \}/);
});

test("five-provider matrix keeps discovery, runtime, and historical usage surfaces separate", () => {
  for (const row of [
    "transport",
    "resume",
    "mid-turn send",
    "approval/input",
    "plans, tasks, subagents",
    "commands and skills discovery",
    "live context telemetry",
    "historical Usage source",
    "rollbackThread",
    "in-session model switch",
    "failure projection",
  ]) assert.match(normalizationChapter, new RegExp(row));
  assert.match(normalizationChapter, /An absence cell means no implementation branch was found at this pinned revision/);
  assert.match(normalizationChapter, /absent\/malformed\/wrong-version cursor means no resume/);
  assert.match(normalizationChapter, /provider discovery \(skills\/commands\), live adapter normalization/);
  assert.match(normalizationChapter, /independent transcript scanner/);
});

test("provider reload and usage diagrams preserve their destructive and non-joining boundaries", () => {
  assert.match(adapterChapter, /events, synchronous projections, and accepted receipt become durable together inside each orchestration command transaction/);
  assert.doesNotMatch(adapterChapter, /events and projections become durable in separate transactions/);
  assert.match(routingChapter, /Q -->\|no\| C\[close prior child scope if present\][\s\S]*C --> X\{replacement still configured\?\}[\s\S]*X -->\|yes\| D\{driver \+ config valid\?\}/);
  assert.match(routingChapter, /M --> G\{entries, order, or shadows changed\?\}[\s\S]*G -->\|no\| N\[no change tick\][\s\S]*G -->\|yes\| T\[publish one registry change tick\]/);
  assert.doesNotMatch(routingChapter, /atomically replaces its in-memory live and shadow maps/);
  assert.match(routingChapter, /H -->\|yes\| A\[route to active live session\]/);
  assert.doesNotMatch(routingChapter, /H -->\|yes\| A\[adopt live session \+ refresh binding\]/);
  assert.match(usageChapter, /No edge is drawn between the lanes: neither lane settles the other/);
  assert.doesNotMatch(usageChapter, /E\s+-.+->\s+N/);
  assert.match(usageChapter, /A ~~~ F/);
  assert.match(usageChapter, /aria-label="Live token usage adapter coverage"/);
  assert.match(usageChapter, /<th scope="row">Codex<\/th>/);
});
