import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const bookDirectory = new URL("../src/content/book/", import.meta.url);
const bookFiles = (await readdir(bookDirectory)).filter((name) => name.endsWith(".mdx"));
const allBookSources = await Promise.all(bookFiles.map((name) => readFile(new URL(name, bookDirectory), "utf8")));
const contents = await readFile(new URL("../src/content/book/02-contents.mdx", import.meta.url), "utf8");
const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
const bookPlan = await readFile(new URL("../BOOK_PLAN.md", import.meta.url), "utf8");

test("the public contents end at the shipping and observability chapters", () => {
  const numbers = [...contents.matchAll(/^\s*(\d+)\.\s+/gm)].map((match) => Number(match[1]));
  assert.deepEqual(numbers, Array.from({ length: 53 }, (_, index) => index + 1));
  const actualChapterNumbers = allBookSources
    .map((source) => Number(source.match(/^number:\s*[\"']?(\d+)[\"']?$/m)?.[1]))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  assert.equal(allBookSources.length, 58, "the public book contains 53 chapters and five front-matter entries");
  assert.deepEqual(actualChapterNumbers, Array.from({ length: 53 }, (_, index) => index + 1));
  assert.match(contents, /^## Part VIII · Reach and ship$/m);
  assert.match(contents, /^\s*53\.\s+/m);
  assert.doesNotMatch(contents, /Part IX|transfer to Easy Code|meta-harness reference architecture/i);
});

test("the public tree contains no transfer or synthesis payload", () => {
  for (const source of allBookSources) {
    assert.doesNotMatch(source, /Part IX|Synthesis and transfer|transfer to Easy Code|meta-harness reference architecture/i);
    assert.doesNotMatch(source, /^status:\s+draft$/m, "the public edition cannot retain draft entries");
  }
  assert.doesNotMatch(readme, /Part IX|transfer to Easy Code|meta-harness/i);
  assert.doesNotMatch(bookPlan, /Part IX|transfer to Easy Code|meta-harness/i);
  assert.ok(!bookFiles.some((name) => /(?:390|400|410)-/.test(name)), "internal synthesis routes must not remain in the public book");
});

test("the publication guide still describes the protected workflow", () => {
  assert.match(readme, /public Pages site is deployed from protected `main`/i);
  assert.match(readme, /No authored work is pushed directly to\s+`main`/i);
  assert.match(bookPlan, /publishes the validated static Astro build through GitHub Pages/i);
});
