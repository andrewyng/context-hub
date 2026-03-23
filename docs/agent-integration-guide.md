# Agent Integration Guide

How to integrate Context Hub into your coding agent workflow.

## Quick Integration

### 1. Install chub
```bash
npm install -g @aisuite/chub
```

### 2. Add to Agent Prompt
```
When you need API documentation, use the chub CLI:
- Search: chub search "topic"
- Fetch: chub get <id> --lang py|js
- Annotate gaps: chub annotate <id> "note"
```

### 3. Test It
```bash
chub search stripe
chub get stripe/api --lang js
```

## Framework-Specific Integrations

### Claude Code

Create skill directory:
```bash
mkdir -p ~/.claude/skills/get-api-docs
```

Copy `cli/skills/get-api-docs/SKILL.md` there. Claude will auto-discover it.

### OpenClaw

Add to `~/.openclaw/skills/`:
```bash
mkdir -p ~/.openclaw/skills/chub
# Copy SKILL.md and configure
```

### LangChain

```python
from langchain.tools import Tool

chub_tool = Tool(
    name="chub",
    description="Fetch curated API docs. Usage: chub get <id> --lang py",
    func=lambda q: subprocess.run(
        ["chub"] + q.split(), capture_output=True, text=True
    ).stdout
)
```

### AutoGPT

Add to `plugins/`:
```python
class ChubPlugin:
    def _run(self, query: str) -> str:
        result = subprocess.run(["chub", "search", query], ...)
        return result.stdout
```

## Agent Workflow Patterns

### Pattern 1: Search Before Coding
```
Agent task: "Integrate Stripe payments"
1. chub search stripe payments
2. chub get stripe/api --lang js
3. Read docs, write code
4. If issue found: chub annotate stripe/api "note"
```

### Pattern 2: Version-Specific Docs
```
chub get openai/chat --lang py  # Python SDK docs
chub get openai/chat --lang js  # JS SDK docs
# Language-specific examples included
```

### Pattern 3: Incremental Fetch
```
chub get stripe/api              # Main doc only
chub get stripe/api --file webhooks  # Specific reference
chub get stripe/api --full       # Everything (costs tokens)
```

## Best Practices

### For Agent Developers

1. **Prompt agents to search first**
   - "Before coding, check if docs exist: chub search [topic]"
   - Reduces hallucination, improves accuracy

2. **Teach annotation habit**
   - "If docs are missing something, annotate it"
   - Agent learns across sessions

3. **Use --json for parsing**
   ```bash
   chub search stripe --json | jq '.results[0].id'
   ```

4. **Cache common docs**
   - Fetch once per session
   - Store in agent working memory
   - Re-fetch only if version changes

### For Agent Users

1. **Seed initial annotations**
   ```bash
   chub get myapi/docs
   chub annotate myapi/docs "Auth token goes in X-API-Key header"
   ```

2. **Review agent feedback**
   ```bash
   chub feedback myapi/docs down --label "missing-examples"
   ```

3. **Check what agent learned**
   ```bash
   chub annotate --list
   ```

## Common Issues

### "Command not found: chub"
```bash
# Check install
npm list -g @aisuite/chub

# Reinstall if needed
npm install -g @aisuite/chub
```

### Agent not using chub
- Check prompt includes chub instructions
- Verify skill file is in agent's skill directory
- Test manually: `chub search test`

### Annotations not persisting
```bash
# Check storage location
chub config --show

# Annotations stored in ~/.chub/annotations.json
```

## Advanced Usage

### Custom Content
```bash
# Point to private content
chub build ./my-private-docs/ --validate-only
chub get my-org/internal-api
```

See [Private Content Guide](private-content.md) for details.

### Piping and Automation
```bash
# Search and auto-fetch first result
chub search openai --json | jq -r '.results[0].id' | xargs -I {} chub get {}

# Batch annotate
for id in $(chub search api --json | jq -r '.results[].id'); do
  chub annotate $id "Reviewed on $(date +%Y-%m-%d)"
done
```

### Agent Feedback Loop
```
1. Agent uses doc → hits issue → annotates
2. You review annotations → vote feedback
3. Maintainer sees feedback → updates doc
4. Agent gets better doc next time
```

## Examples

### Real Task: Add Stripe Payments

**Without chub:**
```
Agent: *searches web, finds outdated tutorial*
Agent: *writes code with deprecated API*
You: "This doesn't work"
Agent: *tries again, different hallucination*
```

**With chub:**
```
Agent: chub search stripe payments
Agent: chub get stripe/api --lang js
Agent: *writes code using current API from curated docs*
You: "Works first try"
Agent: chub feedback stripe/api up
```

### Real Task: Fix Webhook Verification

**First session:**
```
Agent: chub get stripe/api
Agent: *writes webhook handler*
You: "Signature verification failing"
Agent: chub annotate stripe/api "Need raw body for webhook verification"
```

**Next session (days later):**
```
Agent: chub get stripe/api
# Annotation appears automatically
Agent: *writes handler with raw body parsing*
You: "Works perfectly"
```

## Contributing

Found a gap? Contribute docs:
1. Create `content/<your-name>/docs/<api-name>/DOC.md`
2. Add frontmatter + content
3. Submit PR

See [CONTRIBUTING.md](../CONTRIBUTING.md) for format.
