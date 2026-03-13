---
name: package
description: "detect-secrets guide for baselines, audits, and pre-commit enforcement in Python projects"
metadata:
  languages: "python"
  versions: "1.5.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "detect-secrets,python,security,secrets,pre-commit,cli"
---

# detect-secrets Python Package Guide

`detect-secrets` is a repository scanning tool for catching committed credentials and other sensitive literals before they land in version control. The normal workflow is CLI-first: create a baseline, audit it, then enforce the check with `pre-commit` or CI.

There is no auth or client setup step:

- Environment variables: none
- Python imports: none for the standard workflow
- Client initialization: none

## Install

Pin the package version your repo expects:

```bash
python -m pip install "detect-secrets==1.5.0"
```

Common alternatives:

```bash
uv add --dev "detect-secrets==1.5.0"
poetry add --group dev "detect-secrets==1.5.0"
```

Confirm the installed CLI:

```bash
detect-secrets --version
```

If you use `pre-commit`, install that separately in the same developer workflow or CI image:

```bash
python -m pip install pre-commit
```

## Core Workflow

### Create a baseline

Run the scanner from the repository root and write the results to a tracked baseline file:

```bash
detect-secrets scan > .secrets.baseline
```

The baseline is the file your team reviews and keeps under version control. It lets future scans focus on newly introduced findings instead of flagging the full repository history every time.

### Audit existing findings

After generating the baseline, audit it so known false positives are marked before you wire the tool into commit hooks or CI:

```bash
detect-secrets audit .secrets.baseline
```

Treat this as part of the initial setup, not an optional cleanup step. A fresh baseline without an audit usually creates noise for the next developer who hits the hook.

### Enforce with pre-commit

The maintainer repo publishes a `pre-commit` hook. A minimal `.pre-commit-config.yaml` looks like this:

```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ["--baseline", ".secrets.baseline"]
```

Install the hooks:

```bash
pre-commit install
```

Run the hook across the repository before relying on it for normal commits:

```bash
pre-commit run detect-secrets --all-files
```

Pin the `pre-commit` hook revision to the same package line your repo expects. That keeps detector behavior consistent between local installs and hook runs.

### Use in CI

If your repository already uses `pre-commit` in CI, reuse the same hook definition there instead of inventing a second secret-scanning path:

```bash
pre-commit run detect-secrets --all-files
```

That keeps local commits and CI enforcement aligned around the same baseline file and hook arguments.

## Practical Setup Notes

### Repository files to commit

For a typical repo rollout, commit both of these files:

- `.secrets.baseline`
- `.pre-commit-config.yaml`

Without the baseline file in version control, other developers and CI jobs will not see the same allowlist and audit decisions.

### Narrow false positives carefully

If generated files, fixtures, or lockfiles produce repeated noise, keep the exclusion close to the hook or scan configuration instead of deleting findings by hand. For example, `pre-commit` supports a hook-level `exclude:` pattern:

```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ["--baseline", ".secrets.baseline"]
        exclude: package-lock\.json$
```

After changing exclusions, regenerate or re-audit the baseline so the committed state matches the policy you actually want to enforce.

## Common Pitfalls

- Creating `.secrets.baseline` once and never auditing it. Review noise early so future hook failures are actionable.
- Pinning `detect-secrets==1.5.0` locally but leaving a different `pre-commit` `rev` in the repo. Keep them aligned.
- Treating the baseline as an untracked local file. The baseline is part of the shared repository policy.
- Adding the hook before the initial baseline is committed. That usually blocks teammates with historical findings they did not introduce.
- Editing the baseline casually by hand instead of regenerating or re-auditing when policy changes.

## Version Notes For 1.5.0

This guide targets `detect-secrets` `1.5.0`. If your repository standardizes on this version, pin both the Python package and the `pre-commit` hook revision to the same release line before rolling it out broadly.

## Official Sources Used

- Maintainer repository: `https://github.com/Yelp/detect-secrets`
- PyPI package page: `https://pypi.org/project/detect-secrets/`
