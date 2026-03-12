---
name: deep-research
description: "Gemini Deep Research API via the Interactions endpoint for autonomous multi-step research with structured reports"
metadata:
  languages: "javascript"
  versions: "1.33.0"
  revision: 2
  updated-on: "2026-03-09"
  source: community
  tags: "gemini,google,deep-research,research,interactions,agent"
---

# Gemini Deep Research API (JavaScript/TypeScript)

The Deep Research API lets you run Google's autonomous research agent
programmatically. It performs multi-step web research and returns structured
markdown reports. This uses the **Interactions API** — the recommended way to
interact with Gemini models and agents.

## Official References

- [Interactions API Guide](https://ai.google.dev/gemini-api/docs/interactions)
- [Deep Research Agent Guide](https://ai.google.dev/gemini-api/docs/deep-research)

## Key Concepts

- **Interactions API**: Unified interface for Gemini models and agents, with server-side state management
- **Asynchronous**: Create a background interaction, then poll for completion (typically 5–15 minutes)
- **Agent model**: `deep-research-pro-preview-12-2025` (the only available agent as of March 2026)
- **SDK**: `@google/genai` >= 1.33.0 wraps the Interactions API natively
- **Output**: Markdown report with citations and structured sections

## Installation

```bash
npm install @google/genai
```

## Authentication

Set `GEMINI_API_KEY` environment variable — the SDK picks it up automatically.

```typescript
// Or pass directly
import { GoogleGenAI } from "@google/genai";
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

## Quick Start

```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

// Start background research
const initialInteraction = await client.interactions.create({
  agent: "deep-research-pro-preview-12-2025",
  input: "Research the current state of AI in disaster relief operations.",
  background: true,
});

// Poll for results
while (true) {
  const interaction = await client.interactions.get(initialInteraction.id);
  if (interaction.status === "completed") {
    console.log(interaction.outputs[interaction.outputs.length - 1].text);
    break;
  } else if (["failed", "cancelled"].includes(interaction.status)) {
    console.log(`Failed: ${interaction.status}`);
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
```

## Complete Example with Error Handling

```typescript
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";

const client = new GoogleGenAI({});

async function deepResearch(query: string, timeoutMinutes = 60): Promise<string> {
  // Start background research
  const initialInteraction = await client.interactions.create({
    agent: "deep-research-pro-preview-12-2025",
    input: query,
    background: true,
  });
  console.log(`Research started: ${initialInteraction.id}`);

  // Poll for completion
  const deadline = Date.now() + timeoutMinutes * 60 * 1000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 10_000));

    try {
      const interaction = await client.interactions.get(initialInteraction.id);

      if (interaction.status === "completed") {
        const outputs = interaction.outputs;
        if (outputs && outputs.length > 0) {
          return outputs[outputs.length - 1].text;
        }
        return "No content in response";
      }

      if (["failed", "cancelled"].includes(interaction.status)) {
        throw new Error(`Research ${interaction.status}`);
      }
    } catch (e: any) {
      // Retry on transient errors, throw on fatal
      if (e.message?.includes("Research failed") || e.message?.includes("Research cancelled")) {
        throw e;
      }
      console.warn(`Poll error (retrying): ${e.message}`);
    }
  }

  throw new Error(`Research timed out after ${timeoutMinutes} minutes`);
}

// Usage
const report = await deepResearch("Current state of AI in disaster relief operations");
await fs.writeFile("report.md", report);
console.log("Report saved.");
```

## Optional: Generate a Research Plan First

For higher quality results, generate a structured research plan before
sending to Deep Research:

```typescript
const planInteraction = await client.interactions.create({
  model: "gemini-2.5-pro",
  input: `Create a detailed research plan for: "${topic}". Break it into key areas and questions.`,
});
const plan = planInteraction.outputs[planInteraction.outputs.length - 1].text;

// Pass the refined plan to Deep Research
const report = await deepResearch(`Execute the following research plan:\n\n${plan}`);
```

## Stateful Conversations with Deep Research

The Interactions API supports server-side conversation state. You can
chain interactions using `previousInteractionId`:

```typescript
// First research task
const interaction1 = await client.interactions.create({
  agent: "deep-research-pro-preview-12-2025",
  input: "Research quantum computing breakthroughs in 2026.",
  background: true,
});
// ... poll until complete ...

// Follow-up referencing previous context
const interaction2 = await client.interactions.create({
  agent: "deep-research-pro-preview-12-2025",
  input: "Now compare these breakthroughs with classical computing limitations.",
  background: true,
  previousInteractionId: interaction1.id,
});
```

## Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input` | string | Yes | The research query or topic |
| `agent` | string | Yes | Must be `deep-research-pro-preview-12-2025` |
| `background` | boolean | Yes | Set to `true` for async execution |
| `previousInteractionId` | string | No | Chain to a previous interaction for context |

## Status Values

| Status | Meaning |
|--------|---------|
| `in_progress` | Agent is still researching |
| `completed` | Report is ready in `outputs[last].text` |
| `failed` | Research failed — check error |
| `cancelled` | Research was cancelled |

## Tips and Gotchas

- **Long-running**: Expect 5–15 minutes per research task. Max research time is 60 minutes.
- **No streaming**: Deep Research does not support streaming. You must poll via `client.interactions.get()`.
- **Rate limits**: The Interactions API has separate rate limits from `generateContent`. Expect lower throughput.
- **Report quality**: The agent performs real web searches. More specific queries produce better reports.
- **Plan first**: For best results, generate a research plan with a standard model first, then pass it to Deep Research.
- **Agent name**: As of March 2026, the only available agent is `deep-research-pro-preview-12-2025`.
- **Audio inputs not supported**: The Deep Research agent does not accept audio inputs.
- **Output is markdown**: Reports come back as structured markdown with headers, bullet points, and citations.
- **Google Search is built-in**: The agent uses Google Search by default. Grounding restrictions apply to results.

## Migration from Raw REST

If you previously used raw REST calls to `https://generativelanguage.googleapis.com/v1beta/interactions`,
the SDK is now the recommended approach. The `client.interactions.create()` and
`client.interactions.get()` methods handle authentication, serialization, and
error handling automatically.
