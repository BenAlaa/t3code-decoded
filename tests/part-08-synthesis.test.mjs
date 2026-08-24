import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const chapter = (name) => readFile(new URL(`../src/content/book/${name}.mdx`, import.meta.url), "utf8");
const component = (name) => readFile(new URL(`../src/components/${name}.astro`, import.meta.url), "utf8");

const chapterNames = [
  "390-six-complete-traces",
  "400-decisions-limitations-roadmap",
];
const labNames = ["SynchronizedTraceLab", "DecisionLedgerLab"];
const bookDirectory = new URL("../src/content/book/", import.meta.url);
const bookFiles = (await readdir(bookDirectory)).filter((name) => name.endsWith(".mdx"));

const [chapters, labs, excerpts, references, contents, readme, bookPlan, allBookSources] = await Promise.all([
  Promise.all(chapterNames.map(chapter)),
  Promise.all(labNames.map(component)),
  readFile(new URL("../sources/excerpts.manifest.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../sources/references.manifest.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../src/content/book/02-contents.mdx", import.meta.url), "utf8"),
  readFile(new URL("../README.md", import.meta.url), "utf8"),
  readFile(new URL("../BOOK_PLAN.md", import.meta.url), "utf8"),
  Promise.all(bookFiles.map((name) => readFile(new URL(name, bookDirectory), "utf8"))),
]);

const sourceIds = new Set([...excerpts, ...references].map((entry) => entry.id));
const idsIn = (source) => [
  ...[...source.matchAll(/<SourceExcerpt\s+id="([^"]+)"/g)].map((match) => match[1]),
  ...[...source.matchAll(/(?:refs|sources)=\{\[([\s\S]*?)\]\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])),
  ...[...source.matchAll(/<SourceList\s+ids=\{\[([\s\S]*?)\]\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])),
];

test("Part VIII chapters are ordered, source-checked, and reference resolvable", () => {
  assert.deepEqual(chapters.map((source) => Number(source.match(/^order: (\d+)$/m)?.[1])), [390, 400]);
  assert.deepEqual(chapters.map((source) => source.match(/^number: [\"']?([^\"'\n]+)[\"']?$/m)?.[1]), ["39", "40"]);
  for (const source of chapters) {
    assert.match(source, /^part: [\"']Part VIII · Synthesis[\"']$/m);
    assert.match(source, /^partOrder: 8$/m);
    assert.match(source, /^status: source-checked$/m);
    assert.match(source, /<SourceList\b[^>]*\sids=\{/);
    for (const id of idsIn(source)) assert.ok(sourceIds.has(id), `${source.match(/^slug: (.+)$/m)?.[1]} references missing source ${id}`);
    assert.doesNotMatch(source, /\]\(\/(?!\/)/, "internal chapter links must remain relative for GitHub Pages");
  }
});

test("the contents route covers all forty chapters in order", () => {
  const numbers = [...contents.matchAll(/^\s*(\d+)\.\s+/gm)].map((match) => Number(match[1]));
  assert.deepEqual(numbers, Array.from({ length: 40 }, (_, index) => index + 1));
  const actualChapterNumbers = allBookSources
    .map((source) => Number(source.match(/^number:\s*["']?(\d+)["']?$/m)?.[1]))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  assert.equal(allBookSources.length, 45, "the complete edition should contain 40 chapters and five front-matter entries");
  assert.deepEqual(actualChapterNumbers, Array.from({ length: 40 }, (_, index) => index + 1));
  for (const source of allBookSources) assert.doesNotMatch(source, /^status:\s+draft$/m, "the complete edition cannot retain draft entries");
  assert.match(contents, /^## Part VIII · Synthesis$/m);
  assert.match(contents, /^\s*39\.\s+/m);
  assert.match(contents, /^\s*40\.\s+/m);
  assert.doesNotMatch(contents, /^\s*41\.\s+/m);
});

test("the public edition ends at Chapter 40", () => {
  assert.ok(!bookFiles.some((name) => /^4[1-9]0-/.test(name)), "no chapter route may follow Chapter 40");
  for (const source of allBookSources) {
    const number = Number(source.match(/^number:\s*["']?(\d+)["']?$/m)?.[1]);
    if (Number.isFinite(number)) assert.ok(number <= 40, `unexpected chapter number ${number}`);
  }
});

test("Chapter 39 names six traces and preserves their honest failure boundaries", () => {
  const traceHeadings = [...chapters[0].matchAll(/^## Trace (\d+) — .+$/gm)].map((match) => Number(match[1]));
  assert.deepEqual(traceHeadings, [1, 2, 3, 4, 5, 6]);
  for (const anchor of [
    /exactly-once/i,
    /hot reactor/i,
    /(?:crash|replay|no replay)[\s\S]{0,180}(?:reactor|send|delivery)/i,
    /relay[\s\S]{0,180}(?:not|outside).{0,60}(?:data|API|WebSocket)/i,
    /approval[\s\S]{0,220}(?:accepted|completion|callback)/i,
    /live shell[\s\S]{0,220}(?:evidence|guard|wait)/i,
    /partial state|partial-failure|partial failure/i,
    /exact(?:-version| version)[\s\S]{0,220}(?:launcher|trial|rollback)/i,
  ]) assert.match(chapters[0], anchor);
  assert.match(chapters[0], /six traces[\s\S]{0,180}(?:not|do not).{0,80}(?:combine|universal)/i);
});

test("Chapter 40 exposes nine decision cards and a typed limitation taxonomy", () => {
  assert.equal((labs[1].match(/classification:\s*["']/g) ?? []).length, 9, "the decision ledger must contain nine cards");
  assert.match(labs[1], /\.decision-ledger__list button\[hidden\]\s*\{\s*display:\s*none;/, "category filtering must visually hide non-matching decision cards");
  for (const field of ["Pressure", "Choice", "Benefit", "Cost", "Alternative", "Reversal trigger"]) {
    assert.match(chapters[1], new RegExp(`\\b${field}\\b`, "i"));
  }
  for (const classification of ["Shipped", "Latent", "Transition", "Inference", "Future"]) {
    assert.match(chapters[1], new RegExp(`\\b${classification}\\b`, "i"));
  }
  for (const anchor of [/Limitations are part of the architecture contract/i, /Retention and cleanup/i, /roadmap claims/i, /replay-marker retention/i]) {
    assert.match(chapters[1], anchor);
  }
});

test("Part VIII labs have accessible, static, browser-safe interaction contracts", () => {
  for (const source of labs) {
    assert.match(source, /data-[a-z-]+(?:-ready)?="(?:pending|initializing)"/);
    assert.equal((source.match(/aria-live="(?:polite|assertive)"/g) ?? []).length, 1, "each lab should expose exactly one live region");
    assert.match(source, /<noscript>[\s\S]*?<\/noscript>/);
    assert.match(source, /<details[\s\S]*?<summary>/);
    assert.match(source, /@media\s+\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(source, /@media\s+print/);
    assert.match(source, /<button\b[\s\S]*?type=[\"']button[\"']/);
    assert.match(source, /addEventListener\([\"']keydown[\"']/);
    assert.match(source, /Arrow(?:Left|Right|Up|Down)|Home|End/);
    assert.doesNotMatch(source, /setInterval\s*\(|setTimeout\s*\(/, "labs must not autonomously schedule work");
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/, "labs must not perform network actions");
    assert.match(source, /(?:requestAnimationFrame|\.animate\s*\(|data-moving|is-moving|data-motion)/, "each lab should make a reader-triggered transition visible");

    const scripts = [...source.matchAll(/<script\s+define:vars=[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    for (const script of scripts) {
      assert.doesNotThrow(() => new Function(script), "define:vars code must parse as browser JavaScript");
      assert.doesNotMatch(script, /\b(?:interface|type)\s+[A-Za-z_$]/, "define:vars code cannot contain TypeScript declarations");
      assert.doesNotMatch(script, /querySelector(?:All)?\s*<[^>]+>/, "define:vars code cannot contain TypeScript generics");
      assert.doesNotMatch(script, /:\s*(?:string|number|boolean|HTMLElement|HTML[A-Za-z]+|TraceKey)\b/, "define:vars code cannot contain TypeScript annotations");
      assert.doesNotMatch(script, /\bas\s+(?:TraceKey|[A-Z][A-Za-z]+Key|HTMLElement|HTML[A-Za-z]+)/, "define:vars code cannot contain TypeScript assertions");
    }
  }
});

test("the project guide describes the active protected publication workflow", () => {
  assert.match(readme, /public Pages site is deployed from protected `main`/i);
  assert.match(readme, /topic branches remain local or unmerged/i);
  assert.match(readme, /No authored work is pushed directly to\s+`main`/i);
  assert.doesNotMatch(readme, /Publication is being prepared|after the initial-edition pull request/i);
  assert.match(bookPlan, /public repository and Pages pipeline are active/i);
  assert.match(bookPlan, /complete source-validated\s+edition is published/i);
  assert.match(bookPlan, /pushed and opened as a pull request/i);
});
