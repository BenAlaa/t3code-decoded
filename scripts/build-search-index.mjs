import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const executable = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "pagefind.cmd" : "pagefind",
);

const result = spawnSync(executable, ["--site", "dist"], {
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
