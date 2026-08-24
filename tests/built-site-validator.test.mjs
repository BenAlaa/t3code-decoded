import assert from "node:assert/strict";
import test from "node:test";
import { collectHtmlIds, findDuplicateHtmlIds } from "../scripts/lib/html-document.mjs";

test("built-page validation preserves unique ids", () => {
  const html = '<main id="content"><h1 id="chapter">Chapter</h1></main>';

  assert.deepEqual(collectHtmlIds(html), ["content", "chapter"]);
  assert.deepEqual(findDuplicateHtmlIds(html), []);
});

test("built-page validation reports every repeated id once", () => {
  const html = [
    '<main id="content">',
    '<h1 id="chapter">Chapter</h1>',
    '<aside id="content"><a id="chapter"></a><a id="chapter"></a></aside>',
    "</main>",
  ].join("");

  assert.deepEqual(findDuplicateHtmlIds(html), ["chapter", "content"]);
});
