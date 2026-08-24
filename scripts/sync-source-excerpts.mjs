import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gitObjectType, readGitBlob } from "./lib/git-source.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(await readFile(path.join(root, "sources/t3code.lock.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(root, "sources/excerpts.manifest.json"), "utf8"));
const references = JSON.parse(await readFile(path.join(root, "sources/references.manifest.json"), "utf8"));
const sourceRoot = path.resolve(process.env.T3CODE_SOURCE_DIR || path.join(root, lock.sourceDirHint));
const destination = path.join(root, "src/generated/excerpts.json");

const actualCommit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (actualCommit !== lock.commit) {
  throw new Error(`T3 Code source mismatch: expected ${lock.commit}, found ${actualCommit} at ${sourceRoot}`);
}

const output = {};
for (const item of manifest) {
  if (output[item.id]) throw new Error(`Duplicate excerpt id: ${item.id}`);
  const raw = readGitBlob(sourceRoot, lock.commit, item.path);
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  if (!Number.isInteger(item.start) || !Number.isInteger(item.end) || item.start < 1 || item.end < item.start || item.end > lines.length) {
    throw new Error(`Invalid range for ${item.id}: ${item.path}:${item.start}-${item.end} (file has ${lines.length} lines)`);
  }
  const code = lines.slice(item.start - 1, item.end).join("\n");
  output[item.id] = {
    ...item,
    code,
    checksum: createHash("sha256").update(code).digest("hex"),
  };
}

const referenceIds = new Set(Object.keys(output));
for (const item of references) {
  if (referenceIds.has(item.id)) throw new Error(`Duplicate source reference id: ${item.id}`);
  referenceIds.add(item.id);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) throw new Error(`Invalid source reference id: ${item.id}`);
  const objectType = gitObjectType(sourceRoot, lock.commit, item.path);
  if (item.kind === "directory") {
    if (objectType !== "tree") throw new Error(`Expected source directory: ${item.path}`);
    if (item.start || item.end) throw new Error(`Directory reference cannot have line numbers: ${item.id}`);
    continue;
  }
  if (item.kind !== "file" || objectType !== "blob") throw new Error(`Expected source file: ${item.path}`);
  if (item.start !== undefined || item.end !== undefined) {
    const lines = readGitBlob(sourceRoot, lock.commit, item.path).replace(/\r\n/g, "\n").split("\n");
    if (!Number.isInteger(item.start) || !Number.isInteger(item.end) || item.start < 1 || item.end < item.start || item.end > lines.length) {
      throw new Error(`Invalid reference range for ${item.id}: ${item.path}:${item.start}-${item.end}`);
    }
  }
}

const serialized = `${JSON.stringify(output, null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = await readFile(destination, "utf8").catch(() => "");
  if (current !== serialized) throw new Error("Generated excerpts are stale. Run npm run source:sync.");
  process.stdout.write(`Verified ${manifest.length} excerpts and ${references.length} references against ${lock.shortCommit}.\n`);
} else {
  await writeFile(destination, serialized);
  process.stdout.write(`Wrote ${manifest.length} excerpts and verified ${references.length} references from ${lock.shortCommit}.\n`);
}
