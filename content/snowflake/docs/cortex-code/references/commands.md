# Commands Reference

Full reference for Cortex Code CLI commands, slash commands, and flags.

## CLI Entry Points

```bash
cortex                              # Start interactive REPL
cortex -p "query"                   # Non-interactive print mode
cortex resume                       # Interactive session picker
cortex -r last                      # Resume last session
cortex -r <session_id>              # Resume specific session
```

## CLI Subcommands

| Command | Description |
|---------|-------------|
| `cortex mcp list\|add\|remove\|show` | Manage MCP servers |
| `cortex skill list\|add\|remove` | Manage skills |
| `cortex resume [id]` | Resume session |
| `cortex update` | Update CLI |
| `cortex versions` | List available versions |
| `cortex worktree list\|create\|switch\|delete` | Git worktrees |
| `cortex completion install\|generate` | Shell tab-completion (bash/zsh/fish) |
| `cortex connections list\|set` | Snowflake connections |
| `cortex env detect` | Detect Python environment |
| `cortex source <conn> -- <cmd>` | Run command with Snowflake credentials as env vars |
| `cortex ctx` | Long-term AI memory and task management |
| `cortex browser` | Browser automation (Playwright MCP) |
| `cortex search object "<query>"` | Search Snowflake objects |
| `cortex search docs "<query>"` | Search Snowflake product docs |
| `cortex reflect <file.yaml>` | Validate semantic model YAML |
| `cortex semantic-views list\|discover\|describe\|search\|ddl\|query` | Semantic view operations |
| `cortex analyst query "<question>"` | Query via Cortex Analyst |
| `cortex artifact create notebook\|file <name> <path>` | Upload to Snowflake Workspace |
| `cortex agents discover\|list\|describe\|search` | Cortex Agent operations |

## CLI Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--resume <id\|last>` | `-r` | Resume session |
| `--print <query>` | `-p` | Non-interactive mode |
| `--workdir <dir>` | `-w` | Working directory |
| `--worktree <name>` | | Git worktree |
| `--connection <name>` | `-c` | Snowflake connection |
| `--model <name>` | `-m` | Model override |
| `--plan` | | Start in plan mode |
| `--bypass` | | Start in bypass mode |
| `--config <path>` | | Custom settings.json |
| `--no-mcp` | | Disable MCP servers |
| `--version` | `-V` | Show version |

## Slash Commands — Session

| Command | Description |
|---------|-------------|
| `/quit`, `/q` | Exit |
| `/clear` | Clear screen |
| `/new` | New session |
| `/fork [name]` | Fork conversation from a chosen point |
| `/resume` | Session picker |
| `/rename <name>` | Rename session |
| `/rewind [N]` | Rewind N user messages (or interactive) |
| `/compact [instructions]` | Summarize context and clear history |

## Slash Commands — Information

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/status` | Session status |
| `/commands` | List all commands |

## Slash Commands — Modes

| Command | Description |
|---------|-------------|
| `/plan` | Enable plan mode |
| `/plan-off` | Disable plan mode |
| `/bypass` | Enable bypass mode |
| `/bypass-off` | Disable bypass mode |
| `/model <name>` | Switch model |

## Slash Commands — Configuration

| Command | Description |
|---------|-------------|
| `/settings` | Interactive settings editor |
| `/mcp` | MCP server manager |
| `/skill` | Skill manager |
| `/hooks` | Hook manager |
| `/theme` | Theme selector |
| `/connections` | Connection manager |

## Slash Commands — Development

| Command | Description |
|---------|-------------|
| `/add-dir <path>` | Add working directory |
| `/sh <cmd>` | Execute shell command |
| `/sql <query>` | Execute SQL |
| `/table` | Fullscreen SQL results view |
| `/diff` | Fullscreen git diff viewer |
| `/tasks` | Active background tasks |
| `/worktree` | Worktree manager |
| `/sandbox` | Sandbox settings |

## Slash Commands — Utilities

| Command | Description |
|---------|-------------|
| `/fdbt` | dbt operations |
| `/lineage <model>` | Model lineage |
| `/agents` | Subagent manager |
| `/setup-jupyter` | Setup Jupyter |
| `/feedback` | Submit feedback |
| `/clear-cache` | Clear caches |
| `/doctor` | Diagnose environment issues |
| `/update` | Update Cortex Code CLI |

## Custom Slash Commands

Define custom commands as Markdown files. Loaded in priority order:

1. **Project** — `.cortex/commands/`, `.claude/commands/`
2. **Global** — `~/.snowflake/cortex/commands/`
3. **User** — `~/.claude/commands/`

Each `.md` file becomes a `/command` named after the file.
