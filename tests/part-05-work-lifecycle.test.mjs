import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const chapter = (name) => readFile(new URL(`../src/content/book/${name}.mdx`, import.meta.url), "utf8");
const component = (name) => readFile(new URL(`../src/components/${name}.astro`, import.meta.url), "utf8");

const chapterNames = [
  "210-project-discovery",
  "220-worktree-topology",
  "230-turn-lifecycle",
  "240-permissions-input",
  "250-work-items",
  "260-context-memory",
  "270-checkpoints-revert",
  "280-workbench-services",
];
const labNames = [
  "ProjectDiscoveryLab",
  "WorktreeTopologyLab",
  "TurnLifecycleLab",
  "PermissionFlowLab",
  "WorkLogLab",
  "ContextOwnershipLab",
  "CheckpointGraphLab",
  "WorkbenchCapabilityLab",
];

const [chapters, labs, manifest, references] = await Promise.all([
  Promise.all(chapterNames.map(chapter)),
  Promise.all(labNames.map(component)),
  readFile(new URL("../sources/excerpts.manifest.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../sources/references.manifest.json", import.meta.url), "utf8").then(JSON.parse),
]);

test("Part V chapters form an ordered, source-ledgered work-lifecycle sequence", () => {
  assert.deepEqual(chapters.map((source) => Number(source.match(/^order: (\d+)$/m)?.[1])), [210, 220, 230, 240, 250, 260, 270, 280]);
  assert.deepEqual(chapters.map((source) => source.match(/^number: [\"']?([^\"'\n]+)[\"']?$/m)?.[1]), ["21", "22", "23", "24", "25", "26", "27", "28"]);
  for (const source of chapters) {
    assert.match(source, /^part: Part V · The work lifecycle$/m);
    assert.match(source, /^partOrder: 5$/m);
    assert.match(source, /^status: source-checked$/m);
    assert.match(source, /<SourceList\s+ids=\{/);
    assert.doesNotMatch(source, /provisional source ledger/i);
  }

  const sourceIds = new Set([...manifest, ...references].map((entry) => entry.id));
  for (const source of chapters) {
    const ids = [
      ...[...source.matchAll(/<SourceExcerpt\s+id="([^"]+)"/g)].map((match) => match[1]),
      ...[...source.matchAll(/(?:refs|sources)=\{\[([^\]]+)\]\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])),
      ...[...source.matchAll(/<SourceList\s+ids=\{\[([\s\S]*?)\]\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])),
    ];
    for (const id of ids) assert.ok(sourceIds.has(id), `${source.match(/^slug: (.+)$/m)?.[1]} references missing source ${id}`);
  }
});

test("Part V diagrams keep figure numbering and high-value architecture anchors", () => {
  for (const [source, expectedFigure, anchors] of [
    [chapters[0], "21.2", ["t3.json", "project.create", "repository identity"]],
    [chapters[1], "22.1", ["linked Git worktree", "origin", "cleanup"]],
    [chapters[2], "23.1", ["durably accepted command", "provider runtime", "compaction"]],
    [chapters[3], "24.1", ["approval", "structured input", "response intent"]],
    [chapters[4], "25.1", ["provider task", "subagent", "snooze"]],
    [chapters[5], "26.1", ["provider-native session", "resume cursor", "context-compaction"]],
    [chapters[6], "27.1", ["hidden ref", "working-tree", "revert"]],
    [chapters[7], "28.1", ["signed HTTP", "MCP", "pull-request"]],
  ]) {
    assert.match(source, new RegExp(`<Figure number="${expectedFigure.replace(".", "\\.")}"`));
    for (const anchor of anchors) assert.match(source, new RegExp(anchor, "i"));
  }
});

test("each Part V lab has a usable interactive path and a static accessible fallback", () => {
  for (const source of labs) {
    assert.match(source, /interface Props \{ id: string;? \}/);
    assert.match(source, /aria-labelledby=/);
    assert.match(source, /aria-live="polite"/);
    assert.equal([...source.matchAll(/aria-live="polite"/g)].length, 1, "dynamic labs should use one concise live region");
    assert.match(source, /<noscript>/);
    assert.match(source, /<details[\s\S]*<summary>/);
    assert.match(source, /prefers-reduced-motion:\s*reduce/);
    assert.match(source, /@media print/);
    assert.doesNotMatch(source, /setInterval\s*\(/, "labs should not autonomously animate");
    assert.doesNotMatch(source, /var\(--(?:accent|border|surface|muted)(?:,|\))/);
  }
});

test("Part V lab-specific contracts preserve the intended teaching boundaries", () => {
  assert.match(labs[0], /t3\.json/);
  assert.match(labs[1], /no new worktree/i);
  assert.match(labs[1], /Thread deletion is not a worktree deletion/);
  assert.match(labs[2], /server's complete legality matrix/);
  assert.match(labs[3], /Provider permission mode matrix/);
  assert.match(labs[4], /spawn-batch CTAs/);
  assert.match(labs[5], /Provider behavior controls the fallback/);
  assert.match(labs[6], /refs\/t3\/checkpoints/);
  assert.match(labs[7], /scoped bearer HTTP|signed HTTP/);
});

test("stateful Part V controls are readiness-gated and initial render stays still", () => {
  assert.match(labs[1], /paint\(0, false\)/);
  assert.match(labs[4], /\.work-log-controls, \.work-log-projector, \.work-log-state \{ display: none; \}/);
  assert.match(labs[4], /\.work-log-lab\[data-ready="true"\] \.work-log-controls \{ display: flex; \}/);
  assert.match(labs[3], /\.permission-controls \{ display: none;/);
  assert.match(labs[3], /\.permission-flow-lab\[data-ready="true"\] \.permission-controls \{ display: grid; \}/);
  assert.match(labs[5], /data-context-ownership-ready="initializing"/);
  assert.match(labs[5], /\.ownership-tabs, \.ownership-panel \{ display: none; \}/);
  assert.match(labs[6], /render\(0, false\)/);
});

test("checkpoint graph keeps upper labels outside the checkpoint rail", () => {
  assert.match(labs[6], /\.commit-node span \{ top:-1\.65rem; \}/);
  assert.match(labs[6], /\.workspace-node span \{ top:-2\.15rem; \}/);
});
