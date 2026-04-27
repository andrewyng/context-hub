# Context Hub CLI

Install the CLI and give your AI agent access to curated, versioned documentation.

## Install

```bash
npm install -g @aisuite/chub
```

## Use as an Agent Skill

The npm package ships a `get-api-docs` skill that teaches agents to run
`chub help`, search current docs, fetch the selected entry, and leave feedback
instead of guessing from training data. Install the packaged skill manually into
your agent tool of choice:

### Claude Code

Copy the skill into your project:

```bash
mkdir -p .claude/skills
cp $(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md .claude/skills/get-api-docs.md
```

Or install it globally (applies to all projects):

```bash
mkdir -p ~/.claude/skills
cp $(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md ~/.claude/skills/get-api-docs.md
```

### Cursor

Copy the skill into your project's rules directory:

```bash
mkdir -p .cursor/rules
cp $(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md .cursor/rules/get-api-docs.md
```

### Other Agent Tools

The skill is packaged with `@aisuite/chub`. For a global npm install, copy `$(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md` to wherever your agent tool reads custom instructions from.

## Runtime Bootstrap

Once chub is installed, start here:

```bash
chub help
```

`chub help` fetches the bootstrap instructions for the installed CLI version
from the network. That exact-version remote help can be revised over time to
tune prompting for the same binary, and chub falls back to the bundled local
help if the exact remote document is unavailable.

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
