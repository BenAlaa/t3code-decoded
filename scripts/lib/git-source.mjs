import { execFileSync } from "node:child_process";
import path from "node:path";

export const assertSafeGitPath = (value) => {
  if (!value || path.isAbsolute(value) || value.split(/[\\/]/).includes("..") || value.includes("\0")) {
    throw new Error(`Unsafe Git source path: ${value}`);
  }
  return value.replaceAll("\\", "/");
};

export const readGitBlob = (repository, commit, file) => {
  const safe = assertSafeGitPath(file);
  return execFileSync("git", ["-C", repository, "show", `${commit}:${safe}`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
};

export const gitObjectType = (repository, commit, sourcePath) => {
  const safe = assertSafeGitPath(sourcePath);
  return execFileSync("git", ["-C", repository, "cat-file", "-t", `${commit}:${safe}`], {
    encoding: "utf8",
  }).trim();
};
