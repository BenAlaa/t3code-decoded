import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(await readFile(path.join(root, "sources/t3code.lock.json"), "utf8"));
const sourceRoot = path.resolve(process.env.T3CODE_SOURCE_DIR || path.join(root, lock.sourceDirHint));
const commit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (commit !== lock.commit) throw new Error(`T3 Code source mismatch: expected ${lock.commit}, found ${commit}`);

const extensions = new Set([
  ".astro", ".bash", ".c", ".cc", ".cjs", ".cpp", ".css", ".cts", ".h", ".hpp",
  ".java", ".js", ".jsx", ".kt", ".kts", ".m", ".mjs", ".mm", ".mts", ".ps1",
  ".rs", ".scss", ".sh", ".sql", ".swift", ".ts", ".tsx", ".zsh",
]);
const excludedPrefixes = [".repos/", "assets/"];
const testPattern = /(?:^|\/)(?:__mocks__|__tests__|fixtures|test|tests)(?:\/|$)|(?:\.|_)(?:spec|test)\.[^.]+$|Tests?\.swift$/i;
const tracked = execFileSync("git", ["-C", sourceRoot, "ls-tree", "-r", "--name-only", "-z", lock.commit], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
}).split("\0").filter(Boolean);
const sourceFiles = tracked.filter((file) => !excludedPrefixes.some((prefix) => file.startsWith(prefix)) && extensions.has(path.extname(file)));
const testFiles = sourceFiles.filter((file) => testPattern.test(file));
const productionFiles = sourceFiles.filter((file) => !testPattern.test(file));

const countLines = (files) => {
  let count = 0;
  for (let index = 0; index < files.length; index += 100) {
    const chunk = files.slice(index, index + 100);
    let output = "";
    try {
      output = execFileSync("git", ["-C", sourceRoot, "grep", "-I", "-c", "-e", "^", lock.commit, "--", ...chunk], {
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      });
    } catch (error) {
      if (error.status !== 1) throw error;
      output = error.stdout?.toString() ?? "";
    }
    for (const line of output.trim().split("\n").filter(Boolean)) {
      const separator = line.lastIndexOf(":");
      count += Number(line.slice(separator + 1));
    }
  }
  return count;
};

const report = {
  inventoryRulesVersion: 1,
  productionFiles: productionFiles.length,
  productionLines: countLines(productionFiles),
  testFiles: testFiles.length,
  testLines: countLines(testFiles),
};

if (process.argv.includes("--check")) {
  for (const [key, value] of Object.entries(report)) {
    if (lock[key] !== value) throw new Error(`Source inventory drift for ${key}: lock=${lock[key]}, actual=${value}`);
  }
  process.stdout.write(`Verified ${report.productionFiles} production and ${report.testFiles} test source files.\n`);
} else {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
