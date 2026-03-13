# Context Hub CLI

Install the CLI and give your AI agent access to curated, versioned documentation.

## Install

```bash
npm install -g @aisuite/chub
```

## Use as an Agent Skill

The CLI ships with a skill that teaches agents to fetch docs automatically instead of guessing from training data. Install it into your agent tool of choice:

### Claude Code

Copy the skill into Claude Code's global skill directory:

```bash
mkdir -p ~/.claude/skills/get-api-docs
cp "$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md" ~/.claude/skills/get-api-docs/SKILL.md
```

### Codex

Copy the same skill into Codex's skill directory:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills/get-api-docs"
cp "$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md" "${CODEX_HOME:-$HOME/.codex}/skills/get-api-docs/SKILL.md"
```

### Cursor

Copy the skill into your project's rules directory:

```bash
mkdir -p .cursor/rules
cp "$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md" .cursor/rules/get-api-docs.md
```

### Other Agent Tools

The skill is a standard markdown file at `skills/get-api-docs/SKILL.md`. Copy it to wherever your agent tool reads custom instructions from.

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
