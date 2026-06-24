---
name: claude-code
description: "Claude Code — Anthropic's agentic coding CLI: install, .claude config, CLAUDE.md, settings, permission modes, hooks, subagents, MCP, skills"
metadata:
  languages: "bash"
  versions: "2.1.190"
  revision: 1
  updated-on: "2026-06-25"
  source: community
  tags: "anthropic,claude,cli,coding-agent,claude-code,hooks,mcp,subagents"
---

# Claude Code (CLI)

Anthropic's agentic coding tool. Runs in your terminal, reads/edits files, runs commands, and is extended via CLAUDE.md, settings, hooks, subagents, MCP servers, and skills.

## Install & start

```bash
curl -fsSL https://claude.ai/install.sh | bash   # macOS/Linux/WSL (auto-updates)
brew install --cask claude-code                   # Homebrew (no auto-update)
cd /path/to/project && claude                     # start interactive session
```

Essential commands:

| Command | Does |
| --- | --- |
| `claude` | interactive session |
| `claude "task"` | session with an initial prompt |
| `claude -p "query"` | one-shot, print result, exit (scriptable) |
| `claude -c` | continue most recent conversation |
| `claude -r [id\|name]` | resume a session |

Key flags: `--model sonnet\|opus\|haiku\|fable`, `--permission-mode <mode>`,
`--allowedTools "Bash(git *)" Read`, `--add-dir ../other`, `-w/--worktree <name>`,
`--mcp-config ./mcp.json`, `--append-system-prompt "..."`, `--max-turns N`,
`--output-format text\|json\|stream-json`, `--bare` (skip auto-discovery for fast scripts).

## Where configuration lives (the `.claude` directory)

```
~/.claude/                      # USER scope (you, all projects)
  CLAUDE.md                     # personal instructions
  settings.json                 # personal settings
  skills/<name>/SKILL.md        # personal skills
  commands/<name>.md            # personal slash commands
  agents/<name>.md              # personal subagents

<project>/.claude/              # PROJECT scope (committed, team-shared)
  CLAUDE.md                     # project instructions
  settings.json                 # team settings (permissions, hooks, MCP)
  settings.local.json           # LOCAL scope (gitignored, you only)
  skills/  commands/  agents/   # project skills/commands/subagents

<project>/.mcp.json             # project-scoped MCP servers (committed)
~/.claude.json                  # user-level config incl. user-scoped MCP servers
```

Settings precedence: **managed policy** (IT-deployed, always wins, can't be overridden) >
`.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json`.
CLI flags override everything for the session (except managed policy).

## CLAUDE.md (memory)

Plain markdown loaded at session start. Locations, broad → narrow:

- `~/.claude/CLAUDE.md` — you, all projects
- `./CLAUDE.md` or `./.claude/CLAUDE.md` — this project (shared via git)
- `CLAUDE.md` in parent dirs load at launch; in subdirs load on demand when Claude reads files there.

Run `/init` to auto-generate a starter CLAUDE.md from your codebase.
**Edits to CLAUDE.md do NOT apply mid-session** — restart, or it's read at launch.

## settings.json — permissions & hooks

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": ["Bash(npm test)", "Read(./.env)"],
    "ask":   ["Bash(npm publish)"],
    "deny":  ["Bash(rm -rf *)"],
    "additionalDirectories": ["../shared"]
  },
  "env": { "MY_VAR": "value" },
  "model": "opus"
}
```

Permission rule syntax: `Tool` or `Tool(specifier)` — e.g. `Bash(npm run *)`,
`Read(./.env)`, `WebFetch(domain:example.com)`, `mcp__servername__tool`.
Evaluation order: **deny → ask → allow**; first match wins.

## Permission modes

Cycle with `Shift+Tab`, or start with `--permission-mode <mode>`:

| Mode | Runs without asking |
| --- | --- |
| `default` | reads only (prompts on writes/commands) |
| `acceptEdits` | reads + file edits + common fs commands (`mkdir`, `mv`, `cp`…) |
| `plan` | reads only — research & propose, no edits |
| `auto` | everything, with a classifier doing background safety checks |
| `dontAsk` | only pre-approved tools (CI/locked-down) |
| `bypassPermissions` | everything (isolated containers/VMs ONLY) |

Writes to **protected paths** (`.git`, `.claude`, `.env`, `.mcp.json`, shell rc files, etc.)
are never auto-approved except in `bypassPermissions`.

## Hooks (automate on events)

Live in settings.json under `hooks`. Each event is a key; each entry has a `matcher`
and a list of `hooks` (type `command`):

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs prettier --write" }] }
    ],
    "Notification": [
      { "matcher": "",
        "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"Claude needs input\"'" }] }
    ]
  }
}
```

Common events: `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Notification`, `Stop`,
`SessionStart`, `SessionEnd`, `SubagentStart`, `PreCompact`. Inspect with `/hooks`;
debug what loaded with `/context`, `/doctor`, `/mcp`.

## Subagents

`~/.claude/agents/<name>.md` or `.claude/agents/<name>.md`. YAML frontmatter + prompt:

```yaml
---
name: code-reviewer
description: Reviews code changes for bugs and style. Use after edits.
tools: [Read, Grep, Glob]
model: sonnet
permissionMode: acceptEdits
---
You are a meticulous code reviewer. Read the diff and report…
```

Only `name` and `description` are required. Other fields: `tools`, `disallowedTools`,
`model` (`sonnet|opus|haiku|fable|inherit`), `maxTurns`, `mcpServers`, `hooks`, `skills`.

## MCP servers (external tools)

```bash
claude mcp add --transport stdio myserver -- npx -y some-mcp-server
claude mcp add --transport http  notion https://mcp.notion.com/mcp
claude mcp add-json myserver '{"command":"node","args":["srv.js"],"env":{"KEY":"..."}}'
claude mcp list      # see status (⏸ pending approval for project servers)
```

Or commit `<project>/.mcp.json`:

```json
{ "mcpServers": { "db": { "command": "npx", "args": ["-y", "db-mcp"], "env": { "URL": "..." } } } }
```

Scopes: `local` (default, you only), `user` (`~/.claude.json`, all projects), `project`
(`.mcp.json`, shared). Project servers need interactive approval on first use.

## Skills & slash commands

- Skill: `.claude/skills/<name>/SKILL.md` (or `~/.claude/skills/…`) — YAML frontmatter
  `description:` + markdown. Invoked as `/<name>`, or auto-triggered when relevant.
- Legacy command: `.claude/commands/<name>.md` still works and produces `/<name>`.
- Precedence: enterprise > personal (`~/.claude`) > project. Skills hot-reload within a
  session; creating a brand-new top-level skills dir needs a restart.

## Gotchas

- **CLAUDE.md changes need a restart** to take effect (loaded at session start).
- **`.claude/` writes are protected** — even with allow rules, you'll be prompted unless
  you accept the "let Claude edit its own settings this session" prompt.
- **`defaultMode: "auto"` is ignored from project/local settings** (v2.1.142+) — put it in
  `~/.claude/settings.json` so a repo can't grant itself auto mode.
- **Use `/doctor` and `/context`** when something (CLAUDE.md, hook, MCP, skill) isn't
  taking effect — they show what actually loaded.
- **`-p` (print/headless) mode** is how you script Claude Code; pair with
  `--output-format json`, `--allowedTools`, and `--permission-mode`.
