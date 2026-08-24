const conventionalHeader = /^(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([a-z0-9][a-z0-9._/-]*\))?!?: \S(?:.*\S)?$/;

export const validateConventionalHeader = (header, label = "change") => {
  if (typeof header !== "string" || !conventionalHeader.test(header)) {
    return `${label} must use '<type>(<scope>): <description>' Conventional Commits syntax`;
  }
  if (header.length > 100) return `${label} must be at most 100 characters`;
  return undefined;
};

const requiredSections = ["Outcome", "Scope", "Evidence", "Validation", "Review focus"];

export const validatePullRequestBody = (body) => {
  if (typeof body !== "string" || !body.trim()) return ["pull request body is required"];

  const withoutComments = body.replace(/<!--[\s\S]*?-->/g, "");
  const failures = [];
  for (const section of requiredSections) {
    const heading = new RegExp(`^## ${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
    const match = heading.exec(withoutComments);
    if (!match) {
      failures.push(`pull request body is missing '## ${section}'`);
      continue;
    }
    const contentStart = match.index + match[0].length;
    const nextHeading = withoutComments.slice(contentStart).search(/^##\s+/m);
    const content = withoutComments
      .slice(contentStart, nextHeading === -1 ? undefined : contentStart + nextHeading)
      .replace(/^#{3,6}\s+.*$/gm, "")
      .trim();
    if (!content) failures.push(`pull request section '## ${section}' needs a concrete entry`);
  }
  return failures;
};
