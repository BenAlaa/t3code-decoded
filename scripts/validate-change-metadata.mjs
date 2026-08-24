import { execFileSync } from "node:child_process";
import { validateConventionalHeader, validatePullRequestBody } from "./lib/change-metadata.mjs";

const { PR_TITLE, PR_BODY, BASE_SHA, HEAD_SHA } = process.env;
const failures = [];

if (!BASE_SHA || !HEAD_SHA || !/^[0-9a-f]{40}$/i.test(BASE_SHA) || !/^[0-9a-f]{40}$/i.test(HEAD_SHA)) {
  failures.push("pull request base and head revisions must be available");
} else {
  const subjects = execFileSync("git", ["log", "--format=%s", `${BASE_SHA}..${HEAD_SHA}`], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  if (!subjects.length) failures.push("pull request must contain at least one commit");
  for (const subject of subjects) {
    const failure = validateConventionalHeader(subject, `commit '${subject}'`);
    if (failure) failures.push(failure);
  }
}

const titleFailure = validateConventionalHeader(PR_TITLE, "pull request title");
if (titleFailure) failures.push(titleFailure);
failures.push(...validatePullRequestBody(PR_BODY));

if (failures.length) throw new Error(`Change-metadata validation failed:\n- ${[...new Set(failures)].join("\n- ")}`);
process.stdout.write("Validated the pull request title, body, and commit subjects.\n");
