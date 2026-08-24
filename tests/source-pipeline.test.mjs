import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { readGitBlob } from "../scripts/lib/git-source.mjs";

const manifest = JSON.parse(await readFile(new URL("../sources/excerpts.manifest.json", import.meta.url), "utf8"));
const excerpts = JSON.parse(await readFile(new URL("../src/generated/excerpts.json", import.meta.url), "utf8"));
const references = JSON.parse(await readFile(new URL("../sources/references.manifest.json", import.meta.url), "utf8"));
const lock = JSON.parse(await readFile(new URL("../sources/t3code.lock.json", import.meta.url), "utf8"));

test("the source lock identifies one immutable upstream revision and inventory", () => {
  assert.match(lock.repository, /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/);
  assert.match(lock.commit, /^[0-9a-f]{40}$/);
  assert.match(lock.shortCommit, /^[0-9a-f]{7,12}$/);
  assert.ok(lock.commit.startsWith(lock.shortCommit));
  assert.ok(Number.isFinite(Date.parse(lock.capturedAt)));
  for (const key of ["inventoryRulesVersion", "productionFiles", "productionLines", "testFiles", "testLines"]) {
    assert.ok(Number.isInteger(lock[key]) && lock[key] > 0, key);
  }
});

test("every source manifest entry has one checksum-verified generated excerpt", () => {
  assert.equal(Object.keys(excerpts).length, manifest.length);
  for (const item of manifest) {
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(item.path && !item.path.startsWith("/") && !item.path.split("/").includes(".."));
    assert.ok(Number.isInteger(item.start) && Number.isInteger(item.end));
    assert.ok(item.start >= 1 && item.end >= item.start);
    assert.ok(item.language && item.label);
    const excerpt = excerpts[item.id];
    assert.ok(excerpt, item.id);
    assert.deepEqual(
      Object.fromEntries(["id", "path", "start", "end", "language", "label"].map((key) => [key, excerpt[key]])),
      Object.fromEntries(["id", "path", "start", "end", "language", "label"].map((key) => [key, item[key]])),
    );
    assert.equal(excerpt.code.split("\n").length, item.end - item.start + 1);
    assert.equal(createHash("sha256").update(excerpt.code).digest("hex"), excerpt.checksum);
  }
});

test("every narrative source reference has a unique safe path and valid range shape", () => {
  const ids = new Set(manifest.map((item) => item.id));
  for (const item of references) {
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(item.id), item.id);
    ids.add(item.id);
    assert.ok(item.path && !item.path.startsWith("/") && !item.path.split("/").includes(".."));
    assert.ok(item.label);
    assert.ok(item.kind === "file" || item.kind === "directory");
    if (item.kind === "directory") {
      assert.equal(item.start, undefined);
      assert.equal(item.end, undefined);
    } else if (item.start !== undefined || item.end !== undefined) {
      assert.ok(Number.isInteger(item.start) && Number.isInteger(item.end));
      assert.ok(item.start >= 1 && item.end >= item.start);
    }
  }
});

test("locked excerpts read committed Git objects rather than dirty working-tree files", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "t3decoded-git-source-"));
  context.after(() => rm(repository, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q", repository]);
  execFileSync("git", ["-C", repository, "config", "user.name", "Source Pipeline Test"]);
  execFileSync("git", ["-C", repository, "config", "user.email", "source-pipeline@example.invalid"]);
  await writeFile(path.join(repository, "source.ts"), "export const value = 'committed';\n");
  execFileSync("git", ["-C", repository, "add", "source.ts"]);
  execFileSync("git", ["-C", repository, "commit", "-qm", "test: add source"]);
  const commit = execFileSync("git", ["-C", repository, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  await writeFile(path.join(repository, "source.ts"), "export const value = 'dirty';\n");

  assert.equal(readGitBlob(repository, commit, "source.ts"), "export const value = 'committed';\n");
});
