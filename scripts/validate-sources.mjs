import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(await readFile(path.join(root, "sources/t3code.lock.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(root, "sources/excerpts.manifest.json"), "utf8"));
const references = JSON.parse(await readFile(path.join(root, "sources/references.manifest.json"), "utf8"));
const generated = JSON.parse(await readFile(path.join(root, "src/generated/excerpts.json"), "utf8"));
const ids = new Set();
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const commitPattern = /^[0-9a-f]{40}$/;
const shortCommitPattern = /^[0-9a-f]{7,12}$/;

const isSafeSourcePath = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  !path.isAbsolute(value) &&
  !value.split(/[\\/]/).includes("..") &&
  !value.includes("\\") &&
  !/[\0\r\n]/.test(value);

const validateRange = (item, kind = "excerpt") => {
  if (!Number.isInteger(item.start) || !Number.isInteger(item.end) || item.start < 1 || item.end < item.start) {
    throw new Error(`Invalid source ${kind} range: ${item.id}`);
  }
};

if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(lock.repository)) {
  throw new Error(`Invalid source repository URL: ${lock.repository}`);
}
if (!commitPattern.test(lock.commit)) throw new Error(`Invalid locked source commit: ${lock.commit}`);
if (!shortCommitPattern.test(lock.shortCommit) || !lock.commit.startsWith(lock.shortCommit)) {
  throw new Error(`shortCommit does not match the locked source commit: ${lock.shortCommit}`);
}
if (typeof lock.branch !== "string" || !lock.branch.trim() || /[\0\r\n]/.test(lock.branch)) {
  throw new Error("Invalid locked source branch");
}
if (typeof lock.capturedAt !== "string" || !Number.isFinite(Date.parse(lock.capturedAt))) {
  throw new Error(`Invalid source capture timestamp: ${lock.capturedAt}`);
}
if (typeof lock.sourceDirHint !== "string" || !lock.sourceDirHint.trim() || path.isAbsolute(lock.sourceDirHint) || /[\0\r\n]/.test(lock.sourceDirHint)) {
  throw new Error("Invalid local source directory hint");
}
for (const key of ["inventoryRulesVersion", "productionFiles", "productionLines", "testFiles", "testLines"]) {
  if (!Number.isInteger(lock[key]) || lock[key] < 1) throw new Error(`Invalid source lock count: ${key}`);
}
if (typeof lock.notes !== "string" || !lock.notes.trim()) throw new Error("Source lock notes must explain the inventory boundary");

if (!Array.isArray(manifest)) throw new Error("Excerpt manifest must be an array");
if (!Array.isArray(references)) throw new Error("Reference manifest must be an array");
if (!generated || Array.isArray(generated) || typeof generated !== "object") {
  throw new Error("Generated excerpts must be an object keyed by source id");
}

for (const item of manifest) {
  if (!idPattern.test(item.id)) throw new Error(`Invalid source excerpt id: ${item.id}`);
  if (ids.has(item.id)) throw new Error(`Duplicate source id: ${item.id}`);
  ids.add(item.id);
  if (!isSafeSourcePath(item.path)) throw new Error(`Unsafe source path: ${item.path}`);
  validateRange(item);
  if (typeof item.language !== "string" || !item.language.trim() || typeof item.label !== "string" || !item.label.trim()) {
    throw new Error(`Invalid source excerpt metadata: ${item.id}`);
  }
  const record = generated[item.id];
  if (!record) throw new Error(`Missing generated excerpt: ${item.id}`);
  for (const key of ["id", "path", "start", "end", "language", "label"]) {
    if (record[key] !== item[key]) throw new Error(`Generated metadata drift for ${item.id}.${key}`);
  }
  if (typeof record.code !== "string" || !/^[0-9a-f]{64}$/.test(record.checksum)) {
    throw new Error(`Invalid generated excerpt payload: ${item.id}`);
  }
  const checksum = createHash("sha256").update(record.code).digest("hex");
  if (checksum !== record.checksum) throw new Error(`Checksum mismatch for ${item.id}`);
  const lineCount = record.code.split("\n").length;
  if (lineCount !== item.end - item.start + 1) throw new Error(`Line count mismatch for ${item.id}`);
}

const extras = Object.keys(generated).filter((id) => !ids.has(id));
if (extras.length) throw new Error(`Generated excerpts not in manifest: ${extras.join(", ")}`);

for (const item of references) {
  if (ids.has(item.id)) throw new Error(`Duplicate source id across manifests: ${item.id}`);
  ids.add(item.id);
  if (!idPattern.test(item.id)) throw new Error(`Invalid source reference id: ${item.id}`);
  if (!isSafeSourcePath(item.path)) throw new Error(`Unsafe source path: ${item.path}`);
  if (typeof item.label !== "string" || !item.label.trim() || !["file", "directory"].includes(item.kind)) {
    throw new Error(`Invalid source reference metadata: ${item.id}`);
  }
  if (item.kind === "directory" && (item.start !== undefined || item.end !== undefined)) {
    throw new Error(`Directory reference has line numbers: ${item.id}`);
  }
  if (item.kind === "file" && (item.start !== undefined || item.end !== undefined)) {
    validateRange(item, "reference");
  }
}

process.stdout.write(
  `Validated source lock ${lock.shortCommit}, ${manifest.length} excerpts, and ${references.length} pinned source references.\n`,
);
