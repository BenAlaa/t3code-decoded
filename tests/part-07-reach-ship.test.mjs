// Public-branch reconstruction of the validated guide.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const chapter = (name) => readFile(new URL(`../src/content/book/${name}.mdx`, import.meta.url), "utf8");
const component = (name) => readFile(new URL(`../src/components/${name}.astro`, import.meta.url), "utf8");

const chapterNames = [
  "340-access-transports",
  "350-t3-connect",
  "360-reconnect-environments",
  "370-distribution-artifacts",
  "380-release-updates-observability",
];
const labNames = [
  "AccessTransportLab",
  "ConnectPlaneLab",
  "ReachabilityRecoveryLab",
  "ArtifactFactoryLab",
  "ReleaseOperationsLab",
];

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

test("Part VIII chapters form the ordered, source-checked reach-and-ship sequence", () => {
  assert.deepEqual(chapters.map((source) => Number(source.match(/^order: (\d+)$/m)?.[1])), [490, 500, 510, 520, 530]);
  assert.deepEqual(chapters.map((source) => source.match(/^number: [\"']?([^\"'\n]+)[\"']?$/m)?.[1]), ["49", "50", "51", "52", "53"]);
  for (const source of chapters) {
    assert.match(source, /^part: ["']Part VIII · Reach and ship["']$/m);
    assert.match(source, /^partOrder: 8$/m);
    assert.match(source, /^status: source-checked$/m);
    assert.match(source, /<SourceList\s+ids=\{/);
    assert.doesNotMatch(source, /provisional source ledger/i);
    for (const id of idsIn(source)) assert.ok(sourceIds.has(id), `${source.match(/^slug: (.+)$/m)?.[1]} references missing source ${id}`);
  }
});

test("Part VIII chapters retain their route, relay, and recovery teaching anchors", () => {
  for (const [source, figure, anchors] of [
    [chapters[0], "49.1", ["launch and access", "Primary", "Bearer", "Tailscale", "SSH"]],
    [chapters[1], "50.1", ["direct environment session", "DPoP", "relay", "Cloudflare tunnel"]],
    [chapters[2], "51.1", ["environment boundary", "one reconnect owner", "notification", "version"]],
    [chapters[3], "52.1", ["artifact contracts", "npm", "AppImage", "Windows arm64"]],
    [chapters[4], "53.1", ["exact server runtime", "desktop", "mobile", "observability"]],
  ]) {
    assert.match(source, new RegExp(`<Figure number="${figure.replace(".", "\\.")}"`));
    for (const anchor of anchors) assert.match(source, new RegExp(anchor, "i"));
  }
});

test("Part VIII internal chapter links stay base-path safe", () => {
  for (const source of chapters) {
    assert.doesNotMatch(source, /\]\(\/(?!\/)/, "internal links must remain relative for GitHub Pages deployment");
  }
});

test("Part VIII labs provide a static fallback and one concise live status", () => {
  for (const source of labs) {
    assert.match(source, /data-ready="pending"/);
    assert.match(source, /<noscript>[\s\S]*?<\/noscript>/);
    assert.match(source, /@media print/);
    assert.match(source, /prefers-reduced-motion:\s*reduce/);
    assert.equal([...source.matchAll(/aria-live="polite"/g)].length, 1, "each lab should expose one concise live region");
    assert.doesNotMatch(source, /setInterval\s*\(/);
    assert.doesNotMatch(source, /setTimeout\s*\(/);
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/, "teaching labs should not perform network actions");
  }
  assert.match(labs[0], /route-static[\s\S]*?Static access route comparison/);
  for (const source of labs.slice(1)) assert.match(source, /<details[\s\S]*?<summary>/);
});

test("Part VIII labs gate enhanced controls and retain native keyboard controls", () => {
  for (const source of labs) {
    assert.match(source, /dataset\.ready\s*=\s*"true"/);
  }
  assert.match(labs[0], /role="radiogroup"/);
  assert.match(labs[0], /type="radio"/);
  assert.match(labs[1], /<select\b/);
  assert.match(labs[1], /<button\b[\s\S]*type="button"/);
  assert.match(labs[1], /data-previous/);
  assert.match(labs[1], /data-next/);
  assert.match(labs[2], /role="tablist"/);
  assert.match(labs[2], /role="tab"/);
  assert.match(labs[2], /ArrowLeft|ArrowRight/);
  assert.match(labs[3], /role="radiogroup"/);
  assert.match(labs[3], /role="radio"/);
  assert.match(labs[3], /ArrowLeft|ArrowRight/);
  assert.match(labs[3], /label\.textContent\s*=\s*gate\[0\]/, "artifact lane changes must refresh the visible gate labels");
  assert.match(labs[4], /role="tablist"/);
  assert.match(labs[4], /<select\b/);
  assert.match(labs[4], /data-previous/);
  assert.match(labs[4], /data-next/);
});

test("Part VIII labs move only in response to a reader action", () => {
  for (const source of labs) {
    assert.match(source, /requestAnimationFrame|\.animate\s*\(|is-(?:changing|moving)|data-motion/, "each lab should make its selected transition visible");
  }
  const inlineScripts = labs.flatMap((source) => [...source.matchAll(/<script\s+define:vars=[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]));
  for (const script of inlineScripts) {
    assert.doesNotMatch(script, /^\s*(?:type|interface)\s+/m, "define:vars scripts execute as browser JavaScript and cannot contain TypeScript declarations");
    assert.doesNotMatch(script, /querySelector(?:All)?<[^>]+>/, "define:vars scripts cannot contain TypeScript generics");
  }
});

test("Part VIII preserves the architecture's semantic boundaries", () => {
  const [access, connect, recovery, distribution, release] = chapters;
  assert.match(access, /launch transport[\s\S]*access transport/i);
  assert.match(access, /Tailscale[\s\S]*not a (?:fifth|new) target/i);
  assert.match(access, /SSH[\s\S]*loopback forward/i);
  assert.match(connect, /not a relay data hop/i);
  assert.match(connect, /normal API and WebSocket traffic goes directly between client and\s+selected environment/i);
  assert.match(recovery, /one reconnect owner per environment/i);
  assert.match(recovery, /notification is not a state update/i);
  assert.match(recovery, /exact[\s-]*version|version mismatch/i);
  assert.match(distribution, /four desktop lanes|four currently active installer lanes/i);
  assert.match(distribution, /Windows arm64[\s\S]{0,180}(?:commented out|not shipped)/i);
  assert.match(distribution, /AUR[\s\S]{0,220}(?:published Linux AppImage|release asset)/i);
  assert.match(release, /publish(?:es)? an exact CLI runtime|exact `t3@<version>` runtime/i);
  assert.match(release, /check automatically[\s\S]{0,180}(?:user action|does not silently download)/i);
  assert.match(release, /SQLite snapshot/i);
  assert.match(release, /fingerprint runtime version/i);
  assert.match(release, /PostHog[\s\S]{0,240}(?:opt-out|disabled)/i);
  assert.match(release, /local file trace sink[\s\S]{0,220}OTLP/i);
  assert.match(release, /bounded in-memory history[\s\S]{0,180}independent limits/i);
});
