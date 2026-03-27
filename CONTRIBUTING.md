# Contributing to Context Hub

Thank you for your interest in contributing to Context Hub! This guide covers both code contributions and documentation/skill contributions.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm (comes with Node.js)

### Getting Started

```bash
git clone https://github.com/andrewyng/context-hub.git
cd context-hub
npm install
```

### Running the CLI locally

```bash
node cli/bin/chub --help
node cli/bin/chub build content/ --validate-only
```

### Running Tests

```bash
cd cli
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

## Code Contributions

### Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Ensure all tests pass: `cd cli && npm test`
5. Validate the build: `node cli/bin/chub build content/ --validate-only`
6. Submit a pull request

### Code Style

- ES modules (`import`/`export`, not `require`)
- No build step — native Node.js ES modules
- Minimal dependencies — prefer Node.js built-ins
- Dual-mode output: every command supports `--json` for machine-readable output

### Project Structure

```
cli/
  bin/chub              # Executable entry point
  src/
    index.js            # CLI setup (Commander)
    commands/           # Command implementations
    lib/                # Core utilities
  tests/                # Vitest tests
content/                # Public content registry source
docs/                   # Design docs
```

## Content Contributions

Context Hub is only as useful as its content. Contributing curated documentation or skills is one of the most impactful ways to help.

### Contributing a Doc

1. Create a directory under `<author>/docs/<name>/`
2. Add a `DOC.md` with YAML frontmatter:

```yaml
---
name: my-api
description: Short description of what this doc covers
metadata:
  languages: "python,javascript"
  versions: "1.0.0"
  source: community
  tags: "api,rest"
  updated-on: "2026-02-22"
---
# Content here...
```

3. Add reference files in a `references/` subdirectory if needed
4. Validate: `chub build <content-dir> --validate-only`

### Contributing a Skill

1. Create a directory under `<author>/skills/<name>/`
2. Add a `SKILL.md` with YAML frontmatter:

```yaml
---
name: my-skill
description: What this skill teaches agents to do
metadata:
  source: community
  tags: "automation,testing"
  updated-on: "2026-02-22"
---
# Skill content here...
```

### Content Quality Guidelines

- Write for LLMs: clear structure, code examples, explicit parameter names
- Use progressive disclosure: entry point (DOC.md/SKILL.md) should be < 500 lines
- Put detailed references in companion files with relative links
- Keep content up to date with the latest API versions
- Include practical code examples, not just API signatures

## Reporting Issues

- **Bugs**: Use the [bug report template](https://github.com/andrewyng/context-hub/issues/new?template=bug_report.md)
- **Features**: Use the [feature request template](https://github.com/andrewyng/context-hub/issues/new?template=feature_request.md)
- **Security**: See [SECURITY.md](SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
