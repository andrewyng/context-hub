# Context Hub CLI

Install the CLI and give your AI agent access to curated, versioned documentation.

## Install

```bash
npm install -g @aisuite/chub
```

## Use as an Agent Skill

The CLI ships with a skill that teaches agents to fetch docs automatically instead of guessing from training data. Install it with:

```bash
chub --install-skills
```

This auto-detects your AI coding agent (Claude Code, Cursor, Codex, Gemini CLI, Augment, Amp) and installs the skill to the right directory. To target a specific agent:

```bash
chub --install-skills --runtime claude
```

## Commands

```bash
chub search "stripe"                 # find docs
chub get stripe/api                  # fetch a doc
chub get stripe/api --lang js        # specific language
chub get stripe/api --version 19.1.0 # specific version
chub annotate stripe/api "note"      # local annotation
chub feedback stripe/api up          # rate a doc
```

For the full command reference, see [CLI Reference](../docs/cli-reference.md).
