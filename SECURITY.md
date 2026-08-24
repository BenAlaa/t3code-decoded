# Security policy

## Supported version

The current `main` branch and deployed GitHub Pages edition are supported. Older
source-lock editions are historical snapshots and do not receive security fixes.

## Reporting a vulnerability

Use [GitHub's private vulnerability reporting
form](https://github.com/BenAlaa/t3code-decoded/security/advisories/new) for this
repository. If the form is unavailable, contact Ahmed Alaa privately through the
contact information on [`@BenAlaa`'s GitHub profile](https://github.com/BenAlaa).

Please include:

- the affected page, component, workflow, or dependency;
- reproduction steps and realistic impact;
- whether the issue affects local development, contributors, or public readers;
- any suggested mitigation;
- whether and when disclosure has occurred elsewhere.

Do not open a public issue for a vulnerability before the maintainer has had a
reasonable chance to investigate.

## Scope

In scope:

- script injection or unsafe rendering in book content, diagrams, or search;
- dependency or GitHub Actions compromise affecting contributors or deployment;
- source-extraction path traversal or unsafe file handling;
- accidental publication of credentials or private material;
- a deployed-site configuration that creates a meaningful security risk.

Out of scope:

- vulnerabilities in T3 Code itself—report those to `pingdotgg/t3code`;
- missing security headers that have no practical impact on this static site;
- automated scanner output without a reproducible attack;
- social engineering, denial of service, or attacks on GitHub infrastructure.

The book is an independent architecture study and is not a security advisory for
the upstream project. Findings about upstream code are presented as source-grounded
design analysis, not exploit claims.
