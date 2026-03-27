# Configuration Reference

Settings, environment variables, connections, skills, and hooks for Cortex Code.

## Directory Structure

```
~/.snowflake/cortex/
├── settings.json           # Main configuration
├── skills.json             # Skills configuration
├── permissions.json        # Permission history (auto-generated)
├── hooks.json              # Hook configurations
├── mcp.json                # MCP server configurations
├── skills/                 # Global skills
│   └── my-skill/
│       └── SKILL.md
├── agents/                 # Custom agent definitions
├── commands/               # Custom slash commands
└── conversations/          # Session history
```

## settings.json

Main configuration file at `~/.snowflake/cortex/settings.json`:

```json
{
  "env": {
    "CORTEX_AGENT_MODEL": "claude-sonnet-4-5",
    "CORTEX_AGENT_ENABLE_SUBAGENTS": true,
    "SNOVA_DEBUG": false,
    "CORTEX_CHANNEL": "stable"
  },
  "diffDisplayMode": "unified",
  "compactMode": false,
  "bashDefaultTimeoutMs": 180000,
  "theme": "dark"
}
```

| Key | Type | Description |
|-----|------|-------------|
| `diffDisplayMode` | `"unified"` \| `"side_by_side"` | Diff display style |
| `compactMode` | boolean | Start in compact UI mode |
| `bashDefaultTimeoutMs` | number | Default bash timeout (ms) |
| `theme` | `"dark"` \| `"light"` \| `"pro"` | UI color theme |

## Environment Variables

### Core

| Variable | Description |
|----------|-------------|
| `CORTEX_CODE_STREAMING` | Enable live streaming mode |
| `CORTEX_ENABLE_MEMORY` | Enable memory tool |
| `CORTEX_ENABLE_EXPERIMENTAL_SKILLS` | Enable experimental skills |
| `CORTEX_AGENT_ENABLE_SUBAGENTS` | Enable subagent spawning |

### Snowflake

| Variable | Description |
|----------|-------------|
| `SNOWFLAKE_CONNECTION` | Default connection name |
| `SNOWFLAKE_ACCOUNT` | Snowflake account |
| `SNOWFLAKE_USER` | Snowflake username |
| `SNOWFLAKE_WAREHOUSE` | Default warehouse |
| `SNOWFLAKE_DATABASE` | Default database |
| `SNOWFLAKE_SCHEMA` | Default schema |

### Priority Order

1. **CLI flags** (highest)
2. **Environment variables**
3. **settings.json**
4. **Built-in defaults** (lowest)

## Skills System

Skills are reusable instruction sets that guide the agent. Invoked with `$skill-name`.

### Skill Locations (Priority Order)

| Priority | Location |
|----------|----------|
| 1 | `.cortex/skills/`, `.claude/skills/` (project) |
| 2 | `~/.snowflake/cortex/skills/` (global) |
| 3 | Remote (cached from repositories) |
| 4 | Bundled (shipped with Cortex Code) |

### SKILL.md Format

```markdown
---
name: my-skill
description: "Purpose. Use when: situations. Triggers: keywords."
tools: ["bash", "edit"]
---

# My Skill

## Workflow
1. Step one
2. Step two
```

### Remote Skills

Configure in `~/.snowflake/cortex/skills.json`:

```json
{
  "paths": ["/path/to/additional/skills"],
  "remote": [
    {
      "source": "https://github.com/org/skills-repo",
      "ref": "main",
      "skills": [{ "name": "skill-name" }]
    }
  ]
}
```

### Managing Skills

```
/skill                              # Interactive skill manager
```

Press `a` to add, view conflicts, sync project skills to global, or delete.

## Hooks System

Hooks run custom code at specific points during execution.

### Hook Events

| Event | When | Use Case |
|-------|------|----------|
| `PreToolUse` | Before tool execution | Validate, block, modify tool calls |
| `PostToolUse` | After tool execution | Log, validate outputs |
| `UserPromptSubmit` | User submits prompt | Validate or transform input |
| `Stop` | Agent stops | Verify completion |
| `SessionStart` | Session begins | Initialize context |
| `SessionEnd` | Session ends | Cleanup |
| `PreCompact` | Before compaction | Inject context |

### Configuration

Hooks are configured in `~/.snowflake/cortex/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "/path/to/validator.sh", "timeout": 30 }
        ]
      }
    ]
  }
}
```

### Matchers

| Pattern | Matches |
|---------|---------|
| `Bash` | Exact tool name |
| `Bash\|Edit` | Bash or Edit |
| `.*` or `*` | All tools |
| `snowflake_.*` | All Snowflake tools |
| `mcp__github__.*` | All GitHub MCP tools |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success, continue |
| 2 | Block the operation (stderr sent to agent) |
| Other | Non-blocking error (shown to user) |

### Hook Input

Hooks receive JSON on stdin with fields: `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`. Tool events add `tool_name`, `tool_input`.

### Managing Hooks

```
/hooks                              # Interactive hook manager
```

## Theme Configuration

```
/theme                              # Interactive theme selector
/theme dark                         # Set dark theme
/theme light                        # Set light theme
```
