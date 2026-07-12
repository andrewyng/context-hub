---
name: use-traceback
description: "Warm-start coding agents via the traceback MCP server — search_with_fallback, scoped grep, and promote_pattern memory loop"
metadata:
  revision: 1
  updated-on: "2026-07-12"
  source: maintainer
  tags: "mcp,traceback,debugging,semantic-search,cursor,claude,warm-start"
---

# Traceback host skill

Use the **traceback** MCP server (`@yavdaanalytics/traceback`) for semantic recall over past coding-agent sessions and scoped git/grep.

Fetch the companion doc first when unsure about install or tool ids:

```bash
chub get yavdaanalytics/traceback --lang javascript
```

## When to use

Apply on turns involving code, debugging, regressions, history, or locating definitions/usages.
Skip only greetings, thanks, mode switches, or clearly non-code topics.

## Mandatory first MCP call

1. Call `search_with_fallback` with:
   - `query` = the user's full message
   - `repo_path` = workspace git root
2. Do **not** Grep/Glob/explore the whole repo before that returns.

### MCP server id

| Install | server id |
|---------|-----------|
| Cursor global | `user-traceback` |
| Project / plugin | `traceback` |

If missing, call `get_connection_info` and retry with `call_server_id`.

## After warm-start

1. If `relevant_patterns` is present, apply that guidance **before** setup steps or edits.
2. Narrow using `session_matches`, `git_scope`, `grep_result`.
3. Sessions = where/why code changed. Promoted patterns = machine/tenant gotchas not in git.

## Annotation memory loop

After resolving a non-obvious local trap (env, permission flag, unlisted prerequisite):

1. Propose short `title` + `trigger_text` + `guidance` to the user.
2. Only after explicit yes → `promote_pattern`.
3. Later blank chats: matching `relevant_patterns` from `search_with_fallback` prevent the same mistake.

Pair with `submit_feedback(verdict="reject")` when a recalled *session* was wrong.

## Related

- Doc: `chub get yavdaanalytics/traceback --lang javascript`
- Skill id: `yavdaanalytics/use-traceback`
- Upstream skill: https://github.com/yavdaanalytics/traceback/blob/main/SKILL.md
- Setup: https://github.com/yavdaanalytics/traceback/blob/main/SETUP.md
