import assert from "node:assert/strict";
import test from "node:test";
import { validateConventionalHeader, validatePullRequestBody } from "../scripts/lib/change-metadata.mjs";

test("conventional change headers accept scoped and breaking forms", () => {
  assert.equal(validateConventionalHeader("docs(book): explain usage accounting"), undefined);
  assert.equal(validateConventionalHeader("feat(engine)!: replace the renderer"), undefined);
});

test("conventional change headers reject generic and oversized subjects", () => {
  assert.match(validateConventionalHeader("Update documentation"), /Conventional Commits/);
  assert.match(validateConventionalHeader(`docs(book): ${"x".repeat(90)}`), /100 characters/);
});

test("pull request bodies require populated review sections", () => {
  const valid = [
    "## Outcome\nReaders can trace usage.",
    "## Scope\nChapter 20 and its source manifest.",
    "## Evidence\n- `apps/server/src/usage.ts:1-20`",
    "## Validation\n- [x] `npm test`",
    "## Review focus\nProvider aggregation boundaries.",
  ].join("\n\n");

  assert.deepEqual(validatePullRequestBody(valid), []);
  assert.deepEqual(validatePullRequestBody(valid.replace("Readers can trace usage.", "<!-- todo -->")), [
    "pull request section '## Outcome' needs a concrete entry",
  ]);
});
