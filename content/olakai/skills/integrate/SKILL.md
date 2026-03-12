---
name: integrate
description: "Add Olakai monitoring to existing AI code — wrap your LLM client, configure custom KPIs, and validate the integration end-to-end"
metadata:
  revision: 1
  updated-on: "2026-03-10"
  source: maintainer
  tags: "olakai,integration,monitoring,sdk,kpi,governance"
---

# Integrate Olakai into Existing AI Code

This skill guides you through adding Olakai monitoring to an existing AI agent or LLM-powered application with minimal code changes.

For full SDK documentation, see: https://app.olakai.ai/llms.txt

## Prerequisites

- Existing working AI agent/application using OpenAI, Anthropic, or other LLM
- Olakai CLI installed and authenticated (`npm install -g olakai-cli && olakai login`)
- Olakai API key for your agent (get via CLI: `olakai agents get AGENT_ID --json | jq '.apiKey'`)
- Node.js 18+ (for TypeScript) or Python 3.7+ (for Python)

> **Note:** Each agent can have its own API key. Create one with `olakai agents create --name "Name" --with-api-key`

## Why Custom KPIs Are Essential

Adding monitoring is only the first step. **The real value of Olakai comes from tracking custom KPIs specific to your agent's business purpose.**

**Without KPIs configured:**
- Only basic token counts and request data
- No aggregated business KPIs on dashboard
- No alerting capabilities
- No ROI tracking

**With KPIs configured:**
- Custom KPIs (items processed, success rates, quality scores)
- Trend analysis and performance dashboards
- Threshold-based alerting
- Business value calculations

> **Plan to configure at least 2-4 KPIs** that answer: "How do I know this agent is performing well?"

> **KPIs are unique per agent.** If adding monitoring to an agent that needs the same KPIs as another already-configured agent, you must still create new KPI definitions for this agent. KPIs cannot be shared or reused across agents.

## Understanding the customData to KPI Pipeline

Before adding monitoring, understand how custom data flows through Olakai:

```
SDK customData → CustomDataConfig (Schema) → Context Variable → KPI Formula → kpiData
```

### Critical Rules

| Rule | Consequence |
|------|-------------|
| Only CustomDataConfig fields become variables | Unregistered customData fields are NOT usable in KPIs |
| Formula evaluation is case-insensitive | `stepCount`, `STEPCOUNT`, `StepCount` all work in formulas |
| NUMBER configs need numeric values | Don't send `"5"` (string), send `5` (number) |

> **IMPORTANT**: The SDK accepts any JSON in `customData`, but **only fields registered as CustomDataConfigs are processed**. Unregistered fields are stored but cannot be used in KPIs.

## Quick Start (5-Minute Integration)

### For TypeScript/JavaScript

**1. Install the SDK:**
```bash
npm install @olakai/sdk
```

**2. Add tracking after your LLM call:**

Before:
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: userMessage }],
});
```

After:
```typescript
import OpenAI from "openai";
import { olakaiConfig, olakai } from "@olakai/sdk";

olakaiConfig({ apiKey: process.env.OLAKAI_API_KEY });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: userMessage }],
});

// Track the interaction (fire-and-forget)
olakai("event", "ai_activity", {
  prompt: userMessage,
  response: response.choices[0].message.content,
  tokens: response.usage?.total_tokens,
  userEmail: user.email,
  task: "Customer Experience",
});
```

### For Python

**1. Install the SDK:**
```bash
pip install olakai-sdk
```

**2. Add tracking after your LLM call:**

Before:
```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": user_message}],
)
```

After:
```python
from openai import OpenAI
from olakaisdk import olakai_config, olakai, OlakaiEventParams

olakai_config(os.getenv("OLAKAI_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": user_message}],
)

# Track the interaction
olakai("event", "ai_activity", OlakaiEventParams(
    prompt=user_message,
    response=response.choices[0].message.content,
    tokens=response.usage.total_tokens,
    userEmail=user.email,
    task="Customer Experience",
))
```

---

## Detailed Integration Guide

### Step 1: Identify Your Integration Pattern

**Pattern A: Single LLM Client**
You have one OpenAI/Anthropic client used throughout your app.
Use the fire-and-forget `olakai()` call after each completion.

**Pattern B: Multiple LLM Calls per Request**
Your agent makes several LLM calls to complete one task.
Use manual event tracking to aggregate calls into a single event.

**Pattern C: Streaming Responses**
You stream LLM responses to users.
Track after the stream completes with the full accumulated response.

**Pattern D: Third-Party LLM (not OpenAI/Anthropic)**
You use Perplexity, Groq, local models, etc.
Use manual event tracking via `olakai()` or `olakai_event()`.

### Step 2: Install and Configure

#### TypeScript Setup

```typescript
// lib/olakai.ts - Initialize once at app startup
import { olakaiConfig } from "@olakai/sdk";

olakaiConfig({
  apiKey: process.env.OLAKAI_API_KEY!,
  debug: process.env.NODE_ENV === "development",
});
```

#### Python Setup

```python
# lib/olakai.py - Initialize once at app startup
import os
from olakaisdk import olakai_config

olakai_config(
    api_key=os.getenv("OLAKAI_API_KEY"),
    debug=os.getenv("DEBUG") == "true"
)
```

### Step 3: Add Context to Calls

#### Adding User Information

TypeScript:
```typescript
olakai("event", "ai_activity", {
  prompt: userMessage,
  response: aiResponse,
  userEmail: user.email,
  task: "Customer Experience",
});
```

Python:
```python
olakai("event", "ai_activity", OlakaiEventParams(
    prompt=user_message,
    response=ai_response,
    userEmail=user.email,
    task="Customer Experience",
))
```

#### Grouping Events by Conversation (chatId)

For assistive AI (chatbots/copilots), use `chatId` to group multiple turns of a conversation together. This is required for CHAT-scoped KPIs that analyze the full conversation.

```typescript
olakai("event", "ai_activity", {
  prompt: userMessage,
  response: aiResponse,
  chatId: conversationId,  // groups turns in the same conversation
  userEmail: user.email,
});
```

> **When to use `chatId`:** If your agent handles multi-turn conversations and you want KPIs that evaluate the entire conversation (e.g., sentiment scoring, satisfaction), pass a consistent `chatId` across all turns.

#### Adding Custom Data

> **IMPORTANT**: Only send fields you've registered as CustomDataConfigs (Step 5.3). Unregistered fields are stored but **cannot be used in KPIs**.

> **Only send data you'll use in KPIs or for filtering.** Don't duplicate fields already tracked by the platform (session ID, agent ID, user email, timestamps, token count, model, provider — all tracked automatically).

TypeScript:
```typescript
olakai("event", "ai_activity", {
  prompt: userMessage,
  response: aiResponse,
  userEmail: user.email,
  customData: {
    // Only include fields registered as CustomDataConfigs
    Department: user.department,
    ProjectId: currentProject.id,
    Priority: ticket.priority,
  },
});
```

### Step 4: Handle Agentic Workflows

If your agent makes multiple LLM calls per task, aggregate them into a single event.

> **`taskExecutionId` — Critical for multi-agent workflows.** If multiple agents collaborate on the same task, the orchestrator must generate ONE `taskExecutionId` and pass it to all agents. This is how Olakai correlates cross-agent work as a single logical task.

```typescript
async function processDocument(doc: Document): Promise<string> {
  const startTime = Date.now();
  let totalTokens = 0;

  // Step 1: Extract
  const extraction = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: `Extract from: ${doc.content}` }],
  });
  totalTokens += extraction.usage?.total_tokens ?? 0;

  // Step 2: Analyze
  const analysis = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: `Analyze: ${extraction.choices[0].message.content}` }],
  });
  totalTokens += analysis.usage?.total_tokens ?? 0;

  const result = analysis.choices[0].message.content ?? "";

  // Track the complete workflow as ONE event
  olakai("event", "ai_activity", {
    prompt: `Process document: ${doc.title}`,
    response: result,
    tokens: totalTokens,
    requestTime: Date.now() - startTime,
    taskExecutionId: crypto.randomUUID(),
    task: "Data Processing & Analysis",
    customData: {
      DocumentType: doc.type,
      StepCount: 2,
      Success: 1,
    },
  });

  return result;
}
```

### Step 5: Configure Custom KPIs (Essential for Value)

> **This step is required to get real value from Olakai.** Without KPIs, you're only tracking events — not gaining actionable insights.

#### 5.1 Install CLI (if not already)
```bash
npm install -g olakai-cli
olakai login
```

#### 5.2 Register Your Agent
```bash
olakai agents create \
  --name "Document Processor" \
  --description "Processes and summarizes documents" \
  --workflow WORKFLOW_ID \
  --with-api-key
```

#### 5.2.1 Ensure Agent Has a Workflow

> **Every agent MUST belong to a workflow**, even if it's the only agent.

```bash
# Check if agent has a workflow
olakai agents get YOUR_AGENT_ID --json | jq '.workflowId'

# If null, create a workflow and associate:
olakai workflows create --name "Your Workflow Name" --json
olakai agents update YOUR_AGENT_ID --workflow WORKFLOW_ID
```

#### 5.3 Create Custom Data Configs FIRST

> **IMPORTANT**: Create configs for ALL fields you send in `customData`. Only registered fields can be used in KPIs. CustomDataConfigs are agent-scoped.

```bash
olakai custom-data create --agent-id YOUR_AGENT_ID --name "DocumentType" --type STRING
olakai custom-data create --agent-id YOUR_AGENT_ID --name "StepCount" --type NUMBER
olakai custom-data create --agent-id YOUR_AGENT_ID --name "Success" --type NUMBER

# Verify all configs exist for this agent
olakai custom-data list --agent-id YOUR_AGENT_ID
```

#### 5.4 Create KPIs

```bash
olakai kpis create \
  --name "Documents Processed" \
  --agent-id YOUR_AGENT_ID \
  --calculator-id formula \
  --formula "IF(Success = 1, 1, 0)" \
  --aggregation SUM

olakai kpis create \
  --name "Avg Steps per Document" \
  --agent-id YOUR_AGENT_ID \
  --calculator-id formula \
  --formula "StepCount" \
  --aggregation AVERAGE
```

#### 5.5 Update SDK Code to Match

After creating configs, ensure your SDK code sends **exactly those field names**:

```typescript
customData: {
  DocumentType: doc.type,     // Matches CustomDataConfig "DocumentType"
  StepCount: 2,               // Matches CustomDataConfig "StepCount"
  Success: true ? 1 : 0,      // Matches CustomDataConfig "Success"
}
```

## Framework-Specific Integrations

### Next.js API Routes

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { olakai } from "@olakai/sdk";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: message }],
  });

  olakai("event", "ai_activity", {
    prompt: message,
    response: response.choices[0].message.content,
    userEmail: session.user.email!,
    task: "Customer Experience",
  });

  return NextResponse.json({ reply: response.choices[0].message.content });
}
```

### FastAPI (Python)

```python
from fastapi import FastAPI, Depends
from olakaisdk import olakai_config, olakai, OlakaiEventParams

app = FastAPI()

@app.on_event("startup")
async def startup():
    olakai_config(os.getenv("OLAKAI_API_KEY"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/chat")
async def chat(message: str, user: User = Depends(get_current_user)):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": message}]
    )

    olakai("event", "ai_activity", OlakaiEventParams(
        prompt=message,
        response=response.choices[0].message.content,
        userEmail=user.email,
        task="Customer Experience",
    ))

    return {"reply": response.choices[0].message.content}
```

## Handling Edge Cases

### Streaming Responses

Track after the stream completes with the full response:

```typescript
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: userMessage }],
  stream: true,
});

let fullResponse = "";
for await (const chunk of stream) {
  fullResponse += chunk.choices[0]?.delta?.content ?? "";
  res.write(chunk.choices[0]?.delta?.content ?? "");
}

// Track after stream completes
olakai("event", "ai_activity", {
  prompt: userMessage,
  response: fullResponse,
  userEmail: user.email,
});
```

### Error Handling

```typescript
try {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
  });
  return response.choices[0].message.content;
} catch (error) {
  // Track the failed attempt
  olakai("event", "ai_activity", {
    prompt: messages[messages.length - 1].content,
    response: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
    task: "Software Development",
    customData: { Success: 0 },
  });
  throw error;
}
```

### Non-OpenAI Providers

For Anthropic, Perplexity, or other providers, use manual tracking:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callClaude(prompt: string): Promise<string> {
  const startTime = Date.now();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  olakai("event", "ai_activity", {
    prompt,
    response: content,
    tokens: response.usage.input_tokens + response.usage.output_tokens,
    requestTime: Date.now() - startTime,
    task: "Content Development",
  });

  return content;
}
```

## Test-Validate-Iterate Cycle

**Never assume your integration is working. Always validate by generating a test event and inspecting the actual data.**

### Step 1: Generate a Test Event

Run your application to trigger at least one LLM call.

### Step 2: Fetch and Inspect the Event

```bash
olakai activity list --limit 1 --json
olakai activity get EVENT_ID --json
```

### Step 3: Validate Each Component

**Check customData is present:**
```bash
olakai activity get EVENT_ID --json | jq '.customData'
```

**Check KPIs are numeric (not strings or null):**
```bash
olakai activity get EVENT_ID --json | jq '.kpiData'
```

**CORRECT:**
```json
{ "My KPI": 42 }
```

**WRONG (formula stored as string):**
```json
{ "My KPI": "MyVariable" }
```
Fix: `olakai kpis update KPI_ID --formula "MyVariable"`

**WRONG (null value):**
```json
{ "My KPI": null }
```
Fix by ensuring:
1. CustomDataConfig exists: `olakai custom-data create --agent-id ID --name "MyVariable" --type NUMBER`
2. Field name case matches exactly (case-sensitive)
3. SDK actually sends the field in customData

### Validation Flow

```
1. Trigger LLM call (generate event)
           ↓
2. Fetch: olakai activity get ID --json
           ↓
3. Event exists? NO → Check API key, SDK init, debug mode
           ↓
4. customData correct? NO → Fix SDK customData parameter
           ↓
5. kpiData numeric? NO → olakai kpis update ID --formula "X"
           ↓
6. kpiData not null? NO → Create CustomDataConfig, check field name case
           ↓
✅ Integration validated
```

## KPI Formula Reference

### Supported Operators

| Category | Operators |
|----------|-----------|
| Arithmetic | `+`, `-`, `*`, `/` |
| Comparison | `<`, `<=`, `=`, `<>`, `>=`, `>` |
| Logical | `AND`, `OR`, `NOT` |
| Conditional | `IF(condition, true_val, false_val)` |
| Null handling | `ISNA(value)`, `ISDEFINED(value)` |

### Common Formula Patterns

```bash
--formula "StepCount"                          # passthrough
--formula "SuccessRate * 100"                  # percentage conversion
--formula "IF(Success = 1, 1, 0)"              # conditional counting
--formula "IF(PII detected, 1, 0)"             # built-in variable
--formula "IF(ISDEFINED(MyField), MyField, 0)" # null-safe
```

### Aggregation Types

| Aggregation | Use For |
|-------------|---------|
| `SUM` | Totals, counts |
| `AVERAGE` | Rates, percentages |

## Quick Reference

```typescript
// TypeScript — initialize once
import { olakaiConfig, olakai } from "@olakai/sdk";
olakaiConfig({ apiKey: process.env.OLAKAI_API_KEY });

// Track any interaction
olakai("event", "ai_activity", {
  prompt: "input",
  response: "output",
  tokens: 1500,
  requestTime: 5000,
  userEmail: "user@example.com",
  chatId: "conversation-id",
  taskExecutionId: "uuid-shared-across-agents",
  task: "Data Processing & Analysis",
  customData: { StepCount: 3, Success: 1 },
});
```

```python
# Python — initialize once
from olakaisdk import olakai_config, olakai, OlakaiEventParams
olakai_config(os.getenv("OLAKAI_API_KEY"))

# Track any interaction
olakai("event", "ai_activity", OlakaiEventParams(
    prompt="input",
    response="output",
    tokens=1500,
    requestTime=5000,
    userEmail="user@example.com",
    chatId="conversation-id",
    taskExecutionId="uuid-shared-across-agents",
    task="Data Processing & Analysis",
    customData={"StepCount": 3, "Success": 1},
))
```
