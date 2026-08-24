import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const chapter = (name) => readFile(new URL(`../src/content/book/${name}.mdx`, import.meta.url), "utf8");
const component = (name) => readFile(new URL(`../src/components/${name}.astro`, import.meta.url), "utf8");

const chapterNames = [
  "290-shared-client-runtime",
  "300-web-runtime",
  "310-web-product-surfaces",
  "320-desktop-electron",
  "330-mobile-client",
];
const labNames = ["ClientConvergenceLab", "ThreadProjectionLab", "DesktopProcessLab", "MobileContinuityLab"];

const [chapters, labs, excerpts, references] = await Promise.all([
  Promise.all(chapterNames.map(chapter)),
  Promise.all(labNames.map(component)),
  readFile(new URL("../sources/excerpts.manifest.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../sources/references.manifest.json", import.meta.url), "utf8").then(JSON.parse),
]);

const sourceIds = new Set([...excerpts, ...references].map((entry) => entry.id));
const idsIn = (source) => [
  ...[...source.matchAll(/<SourceExcerpt\s+id="([^"]+)"/g)].map((match) => match[1]),
  ...[...source.matchAll(/(?:refs|sources)=\{\[([^\]]+)\]\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])),
  ...[...source.matchAll(/<SourceList\s+ids=\{\[([\s\S]*?)\]\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])),
];

test("Part VI chapters form the ordered, source-checked client-architectures sequence", () => {
  assert.deepEqual(chapters.map((source) => Number(source.match(/^order: (\d+)$/m)?.[1])), [290, 300, 310, 320, 330]);
  assert.deepEqual(chapters.map((source) => source.match(/^number: [\"']?([^\"'\n]+)[\"']?$/m)?.[1]), ["29", "30", "31", "32", "33"]);
  for (const source of chapters) {
    assert.match(source, /^part: ["']Part VI · Client architectures: shared semantics, platform edges["']$/m);
    assert.match(source, /^partOrder: 6$/m);
    assert.match(source, /^status: source-checked$/m);
    assert.match(source, /<SourceList\s+ids=\{/);
    assert.doesNotMatch(source, /provisional source ledger/i);
    for (const id of idsIn(source)) assert.ok(sourceIds.has(id), `${source.match(/^slug: (.+)$/m)?.[1]} references missing source ${id}`);
  }
});

test("Part VI figures and teaching anchors preserve platform authority boundaries", () => {
  for (const [source, figure, anchors] of [
    [chapters[0], "29.1", ["Prepared connection", "one-attempt RPC session", "history epoch"]],
    [chapters[1], "30.1", ["one React renderer", "hash history", "virtualized timeline"]],
    [chapters[2], "31.1", ["canonical thread", "projection", "optimistic"]],
    [chapters[3], "32.1", ["Electron main", "preload", "SSH"]],
    [chapters[4], "33.1", ["SQLite", "secure storage", "remote environment"]],
  ]) {
    assert.match(source, new RegExp(`<Figure number="${figure.replace(".", "\\.")}"`));
    for (const anchor of anchors) assert.match(source, new RegExp(anchor, "i"));
  }
});

test("Part VI labs expose one live status, labelled fallback content, and no autonomous timers", () => {
  for (const source of labs) {
    assert.match(source, /interface Props \{[\s\S]*id\??: string;[\s\S]*\}/);
    assert.match(source, /aria-labelledby=/);
    assert.match(source, /aria-live="polite"/);
    assert.equal([...source.matchAll(/aria-live="polite"/g)].length, 1, "each lab should use one concise live region");
    assert.match(source, /<noscript>/);
    assert.match(source, /<details[\s\S]*<summary>/);
    assert.match(source, /prefers-reduced-motion:\s*(?:reduce|no-preference)/);
    assert.match(source, /@media print/);
    assert.doesNotMatch(source, /setInterval\s*\(/, "labs should not autonomously animate");
    assert.doesNotMatch(source, /setTimeout\s*\(/, "labs should not schedule autonomous work");
    assert.doesNotMatch(source, /var\(--(?:accent|border|surface|muted)(?:,|\))/);
  }
});

test("Part VI interactive labs gate controls until ready and begin in a still state", () => {
  for (const source of labs) {
    assert.match(source, /data-(?:[a-z-]+-)?ready="(?:pending|initializing)"/);
    assert.match(source, /dataset\.(?:[a-zA-Z]+Ready|ready)\s*=\s*"true"/);
  }
  assert.match(labs[0], /paint\(\);[\s\S]*lab\.dataset\.ready\s*=\s*"true"/);
  assert.match(labs[1], /data-ready="pending"/);
  assert.match(labs[2], /data-ready="pending"/);
  assert.match(labs[3], /data-mobile-continuity-ready="initializing"/);
  assert.match(labs[3], /render\(false\)/);
});

test("define:vars labs contain browser-valid JavaScript rather than TypeScript syntax", () => {
  for (const source of [labs[1], labs[2]]) {
    const inlineScript = source.match(/<script define:vars=[^>]+>([\s\S]*?)<\/script>/)?.[1] ?? "";
    assert.ok(inlineScript, "expected an inline define:vars script");
    assert.doesNotMatch(inlineScript, /querySelector(?:All)?</);
    assert.doesNotMatch(inlineScript, /:\s*keyof typeof/);
    assert.doesNotMatch(inlineScript, /\bas (?:keyof typeof|Array<|ProjectionKey|ScenarioKey)/);
    assert.doesNotMatch(inlineScript, /\b(?:ProjectionKey|ScenarioKey)\b/);
    assert.doesNotMatch(inlineScript, /\w+\s*:\s*(?:string|boolean)\b/);
    assert.doesNotMatch(inlineScript, /\]\s*!/);
  }
});

test("Part VI lab-specific teaching boundaries remain explicit", () => {
  assert.match(labs[0], /snapshot|cursor|history epoch/i);
  assert.match(labs[1], /One canonical thread, six product surfaces/);
  assert.match(labs[1], /data-projection/);
  assert.match(labs[2], /WSL|SSH|preload/i);
  assert.match(labs[3], /Offline command outbox|OTA restart handoff/);
  assert.match(labs[3], /atomic JSON file|foreground-handoff|flush/i);
});
