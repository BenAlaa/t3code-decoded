# Public repository launch runbook

This is the owner checklist for publishing T3 Code Decoded. It deliberately keeps
repository creation, policy activation, branch publication, and Pages deployment
as separate checkpoints. Completing one checkpoint does not authorize the next.

## Fixed decisions

- Owner: personal GitHub account [`BenAlaa`](https://github.com/BenAlaa), never the
  EasyGenerator organization.
- Visibility: public.
- Repository and Pages project name: `t3code-decoded`.
- Default branch: `main`; do not create or retain `master`.
- Authored changes: pull requests only. Never push project commits directly to
  `main`.
- Merge method: rebase merge, preserving the fine-grained Conventional Commits.
- Solo-owner escape hatch: `BenAlaa` may bypass rules **for pull requests only**.
  The bypass may merge an existing owner PR; it must not become a direct-push path.
- Pages source: a GitHub Actions artifact, never a committed `dist/` branch.

## 1. Local preflight

- [ ] `git status` contains only the intended milestone.
- [ ] `npm ci` succeeds from the lockfile.
- [ ] `npm run source:check` succeeds against the locked T3 Code checkout.
- [ ] `npm test` succeeds.
- [ ] `npm run build` succeeds with `/`.
- [ ] `BASE_PATH=/t3code-decoded/ SITE_URL=https://benalaa.github.io npm run build`
      succeeds.
- [ ] Every local commit that will be replayed follows Conventional Commits.
- [ ] The GitHub CLI or browser session is visibly authenticated as `BenAlaa`.

## 2. Create the inert public remote

Create `BenAlaa/t3code-decoded` as public with GitHub's generated README. That one
placeholder commit establishes remote `main`; do not initialize another license or
`.gitignore`, and do not push the local repository during creation.

- [ ] Confirm the owner is exactly `BenAlaa` and visibility is **Public**.
- [ ] Confirm the default branch is `main` and no `master` branch exists.
- [ ] Add the description, Pages URL, and topics such as `t3code`, `architecture`,
      `astro`, `effect`, `reverse-engineering`, and `interactive-book`.
- [ ] Add the remote locally and fetch the placeholder branch read-only.

## 3. Protect `main` before publishing authored work

In **Settings → Rules → Rulesets**, create an active branch ruleset named
`protected-main` targeting the default branch.

Bypass list:

- [ ] Add the `BenAlaa` user actor.
- [ ] Change its bypass mode from **Always allow** to **For pull requests only**.
- [ ] Do not grant the bypass to write/maintain roles or automation generally.

Rules:

- [ ] Restrict deletions.
- [ ] Require a pull request before merging.
- [ ] Require one approving review.
- [ ] Dismiss stale approvals when new commits are pushed.
- [ ] Require review from Code Owners.
- [ ] Require approval of the most recent reviewable push.
- [ ] Require all review conversations to be resolved.
- [ ] Require linear history.
- [ ] Block force pushes.

Repository merge settings:

- [ ] Enable **rebase merging**.
- [ ] Disable merge commits and squash merging so reviewed fine-grained commits
      survive on `main`.
- [ ] Automatically delete head branches after merge.

The first publication PR introduces the workflows, so the status-check contexts do
not exist when the initial ruleset is created. Open that PR, wait for both checks to
run, then edit the ruleset before merging:

- [ ] Require `Validate and build`.
- [ ] Require `Conventional changes`.
- [ ] Require branches to be up to date before merging.
- [ ] Verify the ruleset is **Active**, then inspect Rule Insights after the first
      owner bypass.

## 4. Replay the local milestones through PR branches

The local history and GitHub placeholder have unrelated roots. Do not merge those
roots and do not force the local branch onto remote `main`. For each publication
milestone, create a clean branch from the latest `origin/main`, then cherry-pick
the already-reviewed local commits in their original order.

Recommended PR sequence:

1. `bootstrap/initial-edition` — book engine, source pipeline, front matter,
   Chapters 1–4, and the public governance/CI foundation. The opening maps link
   into Part I, so this is the smallest complete milestone that passes the
   built-site link gate;
2. `docs/part-02-boot-connect` — Chapters 5–8 and their evidence;
3. one branch and PR per later coherent part or review milestone.

For every branch:

- [ ] Branch from the latest protected remote `main`.
- [ ] Replay only the intended fine-grained commits; resolve no unrelated changes.
- [ ] Run the full local preflight again.
- [ ] Push the named feature/docs/chore branch, never `main`.
- [ ] Use a Conventional Commit title for the PR and complete every template
      section with outcome, scope, evidence, validation, and review focus.
- [ ] Review the Files changed and commit list as `BenAlaa`.
- [ ] Resolve conversations and wait for required checks.
- [ ] For owner-authored PRs, choose the explicit ruleset bypass in the merge box;
      do not disable or edit protection merely to self-merge.
- [ ] Rebase-merge, verify `main`, and delete the remote head branch.

## 5. Configure GitHub Pages

After the CI foundation reaches `main`:

- [ ] In **Settings → Pages**, select **GitHub Actions** as the source.
- [ ] Keep the `github-pages` environment restricted to deployments from `main`.
- [ ] Confirm the Pages workflow build job has only `contents: read` and the deploy
      job alone has `pages: write` plus `id-token: write`.
- [ ] Confirm every external action is pinned to an immutable full commit SHA.
- [ ] Confirm Pages checks out the T3 revision read from
      `sources/t3code.lock.json` and runs `npm run source:check` before upload.
- [ ] Verify canonical URLs, assets, search, favicon, internal links, diagrams, and
      expanded zoom/pan at `https://benalaa.github.io/t3code-decoded/`.

## 6. Community and security settings

- [ ] Enable Issues and preserve the bug, source-correction, and proposal forms.
- [ ] Create labels `bug`, `proposal`, `source-correction`, `accessibility`,
      `documentation`, `engine`, and `dependencies`.
- [ ] Enable the dependency graph, Dependabot alerts, and Dependabot security
      updates.
- [ ] Enable private vulnerability reporting so the link in `SECURITY.md` works.
- [ ] Confirm `CODEOWNERS` resolves `@BenAlaa` and the PR template loads.
- [ ] Confirm the repository displays the mixed-license notice and upstream T3
      Code attribution.

## 7. Launch evidence

Record the final URLs or screenshots in the launch PR:

- [ ] public repository;
- [ ] active `protected-main` ruleset and pull-request-only bypass;
- [ ] required checks on a real PR;
- [ ] successful Pages deployment;
- [ ] live book route and search result;
- [ ] private vulnerability reporting enabled;
- [ ] no `master`, no published `dist/`, and no authored direct commit to `main`.
