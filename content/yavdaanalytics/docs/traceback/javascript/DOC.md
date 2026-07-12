---
name: traceback
description: "Semantic debugger MCP server — warm-starts grep/git with cosine recall over past coding-agent sessions (@yavdaanalytics/traceback)"
metadata:
  languages: "javascript"
  versions: "0.1.5"
  revision: 1
  updated-on: "2026-07-12"
  source: maintainer
  tags: "mcp,traceback,semantic-search,git,embeddings,cursor,claude,debugging"
---

# traceback (@yavdaanalytics/traceback)

Local MCP server that scopes code search using past agent sessions + git history before blind repo-wide grep.

- **npm:** `@yavdaanalytics/traceback`
- **Repo:** https://github.com/yavdaanalytics/traceback
- **Runtime:** Node.js >= 22.5.0
- **Storage:** per-repo SQLite + LanceDB under `data/` (no cloud DB)
- **Embeddings:** local `fastembed` (`all-MiniLM-L6-v2`) — no LLM API key required

## Install and setup

```bash
npm install -g @yavdaanalytics/traceback
traceback-setup
# or one-shot:
npx -y -p @yavdaanalytics/traceback traceback-setup
```

`traceback-setup` (global default) configures:

- MCP: `npx -y @yavdaanalytics/traceback` in `~/.cursor/mcp.json` and `~/.claude/.mcp.json`
- Global git post-commit hooks → per-repo ingest under that repo's `data/`
- Cursor/Claude skills + Cursor always-on rule
- Verify: `traceback-setup --doctor`

Per-repo only: `traceback-setup --repo-only` (from inside a git repo). Skills stay global — not installed per-repo.

Dev (absolute `dist/` paths): `TRACEBACK_DEV=1 traceback-setup`

Full install matrix: https://github.com/yavdaanalytics/traceback/blob/main/SETUP.md

## MCP server ids (Cursor)

| Install | `CallMcpTool` `server` |
|---------|-------------------------|
| Cursor global (`~/.cursor/mcp.json`) | `user-traceback` |
| Project / plugin | `traceback` |

If "server does not exist", call `get_connection_info` and retry with returned `call_server_id`.

## Mandatory agent contract

For coding / debug / history / locate-definition turns:

1. First MCP call: `search_with_fallback` with `query` = user message and `repo_path` = workspace git root.
2. Do **not** call Grep/Glob/explore Task before that returns.
3. If `relevant_patterns` is present, apply that guidance before edits/setup.
4. Narrow subsequent reads using `session_matches`, `git_scope`, `grep_result`.

Skip only greetings, thanks, mode switches, or clearly non-code prompts.

## Warm-start funnel (`search_with_fallback`)

```
Query → L1 session cosine (optional) → L2 git pickaxe + intent → L3 scoped grep (widens) → L4 refinements
```

| Layer | Tool(s) | Always runs? |
|-------|---------|--------------|
| L1 | `find_similar_sessions` | Attempted; may be empty on cold start |
| L2 | `git_history_scope` | Yes |
| L3 | `search_sessions_grep` / `grep_codebase` | Yes (widens to full repo if scoped empty) |
| L4 | `ast_symbol_search`, `diff_search`, `keyword_search` | Partial |

Entry tool args:

```json
{
  "query": "<user question>",
  "repo_path": "<git root>"
}
```

Optional: `pattern` for grep focus; `project_path` alias for repo path on some hosts.

## Core tools (quick map)

| Tool | Use when |
|------|----------|
| `search_with_fallback` | Default warm-start (always prefer this first) |
| `get_connection_info` | Wrong/missing MCP server id |
| `get_traceback_status` | Index empty? counts / availability |
| `find_similar_sessions` | Drill into L1 matches |
| `get_session_detail` | Full session digest / links |
| `git_history_scope` | Commits touching the concept |
| `blame_current` | Map historical hit → HEAD |
| `promote_pattern` | Persist a durable local warning (**user must confirm first**) |
| `list_patterns` | List active promoted patterns |
| `submit_feedback` | confirm/reject a recall (reject down-ranks session) |
| `get_efficiency_report` | Token/KPI telemetry |

Full tool list: https://github.com/yavdaanalytics/traceback/blob/main/docs/API.md

## Annotation memory loop (local patterns)

Blank models forget machine-specific traps. After resolving an env/prereq/permission gotcha:

1. Propose a short `title`, `trigger_text`, `guidance` to the user.
2. Only after explicit yes → `promote_pattern`.
3. Later sessions: `search_with_fallback` returns matching `relevant_patterns` — apply before repeating the mistake.

Use `submit_feedback(verdict="reject")` when a *session* match was wrong. Use `promote_pattern` when the *lesson* should stick.

This is separate from chub's `chub annotate` — traceback patterns live in the repo's SQLite; chub annotations live under `~/.chub`.

## Indexing model

- Global post-commit hook, **per-repo data** (`data/traceback.db`, `data/lancedb/`).
- Lazy backfill on first commit or `traceback-ingest --repo <path>`.
- Session adapters today: Claude Code, Cursor, Copilot.
- L2/L3 still work with zero indexed sessions (git-only cold start).

## Privacy

Local metrics always in `data/traceback.db`. Anonymous upload is **opt-in** (`traceback-setup` default OFF; `--plugin` default ON with disclosure). Never uploaded: queries, paths, commits, transcripts, PII.

## Common mistakes

- **Incorrect:** Grep the whole repo before `search_with_fallback`.
- **Incorrect:** Calling `promote_pattern` / `submit_feedback` without explicit user confirmation.
- **Incorrect:** Expecting cross-repo recall (not supported yet).
- **Incorrect:** Assuming L1 always has hits — use L2/L3 results on cold start.
- **Correct:** `user-traceback` (Cursor global) or `traceback` (project/plugin).
- **Correct:** Prefer `relevant_patterns` for local gotchas; session matches for code history.

## Useful links

- Setup: https://github.com/yavdaanalytics/traceback/blob/main/SETUP.md
- API: https://github.com/yavdaanalytics/traceback/blob/main/docs/API.md
- Architecture: https://github.com/yavdaanalytics/traceback/blob/main/docs/ARCHITECTURE.md
- Host skill (repo): https://github.com/yavdaanalytics/traceback/blob/main/SKILL.md
- Chub skill: `chub get yavdaanalytics/use-traceback`
- npm: https://www.npmjs.com/package/@yavdaanalytics/traceback