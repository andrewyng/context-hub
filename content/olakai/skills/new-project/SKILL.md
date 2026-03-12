---
name: new-project
description: "Build a new AI agent with Olakai monitoring from scratch — project setup, SDK integration, KPI configuration, and end-to-end validation"
metadata:
  revision: 1
  updated-on: "2026-03-10"
  source: maintainer
  tags: "olakai,new-project,agent,monitoring,kpi,governance"
---

# Build a New AI Agent Project with Olakai

This skill guides you through creating a new AI agent that is fully integrated with Olakai for analytics, KPI tracking, and governance.

## Prerequisites

Before starting, ensure:
1. Olakai CLI installed: `npm install -g olakai-cli`
2. CLI authenticated: `olakai login`
3. API key for SDK (generated per-agent via CLI — see Step 2.2)

## Why Custom KPIs Are Essential

Olakai's core value is **tracking business-specific KPIs for your AI agents**. Without KPIs, you're tracking events without gaining actionable insights.

**What you can measure with KPIs:**
- Business outcomes (items processed, success rates, revenue impact)
- Operational data (step counts, retry rates, execution time)
- Quality indicators (error rates, user satisfaction signals)

**Without KPIs configured:**
- No dashboard KPIs beyond basic token counts
- No aggregated performance views
- No alerting thresholds
- No ROI calculations

> **Every agent should have 2-4 KPIs that answer: "How do I know this agent is performing well?"**

> **KPIs created here belong to this specific agent only.** If you later create additional agents, each one needs its own KPI definitions — KPIs cannot be shared or reused across agents.

## Understanding the customData to KPI Pipeline

Before diving into implementation, understand how data flows through Olakai:

```
SDK customData → CustomDataConfig (Schema) → Context Variable → KPI Formula → kpiData
```

### How It Works

1. **customData** (SDK): Raw JSON you send with each event
2. **CustomDataConfig** (Platform): Schema defining which fields are processed
3. **Context Variables**: CustomDataConfig fields become available for formulas
4. **KPI Formula**: Expression that computes a value (e.g., `SuccessRate * 100`)
5. **kpiData** (Response): Computed KPI values returned with each event

### Critical Rules

| Rule | Consequence |
|------|-------------|
| Only CustomDataConfig fields become variables | Unregistered customData fields are NOT usable in KPIs |
| Formula evaluation is case-insensitive | `stepCount`, `STEPCOUNT`, `StepCount` all work in formulas |
| NUMBER configs need numeric values | Don't send `"5"` (string), send `5` (number) |
| KPIs are unique per agent | Each KPI belongs to exactly one agent — create separately for each |

### Built-in Context Variables (Always Available)

| Variable | Type | Description |
|----------|------|-------------|
| `Prompt` | string | The prompt text sent to the LLM |
| `Response` | string | The LLM response text |
| `Documents count` | number | Number of attached documents |
| `PII detected` | boolean | Whether PII was detected |
| `PHI detected` | boolean | Whether PHI was detected |
| `CODE detected` | boolean | Whether code was detected |
| `SECRET detected` | boolean | Whether secrets were detected |

## Step 1: Design the Agent Architecture

### 1.1 Determine Agent Type

**Agentic AI** (Multi-step autonomous workflows):
- Research agents, document processors, data pipelines
- Track as SINGLE events aggregating all internal LLM calls
- Focus on workflow-level KPIs (total tokens, total time, success/failure)

**Assistive AI** (Interactive chatbots/copilots):
- Customer support agents, coding assistants, Q&A systems
- Track EACH interaction as separate events
- Focus on conversation-level KPIs (per-message tokens, response quality)

### 1.2 Design Your KPI Schema (CRITICAL)

**Design your KPIs BEFORE writing any SDK code.** This ensures only meaningful data is sent and tracked.

#### Step A: Identify Business Questions

What do stakeholders need to know about this agent?
- "How many items does it process per run?"
- "What's the success/failure rate?"
- "How efficient is each execution?"

#### Step B: Map Questions to Data Fields

| Business Question | Field Name | Type | KPI Formula | Aggregation |
|-------------------|------------|------|-------------|-------------|
| Throughput | ItemsProcessed | NUMBER | `ItemsProcessed` | SUM |
| Reliability | SuccessRate | NUMBER | `SuccessRate * 100` | AVERAGE |
| Error count | SuccessRate | NUMBER | `IF(SuccessRate < 1, 1, 0)` | SUM |
| Correlation | ExecutionId | STRING | (for filtering only) | - |

#### Step C: Plan Your customData Structure

```typescript
// ONLY include fields you'll register as CustomDataConfigs
customData: {
  // Business KPIs
  ItemsProcessed: number,  // Count of items handled
  SuccessRate: number,     // 0-1 success ratio

  // Performance KPIs
  StepCount: number,       // Number of workflow steps

  // Identification (for filtering, not KPIs)
  ExecutionId: string,     // Correlation ID
}
```

> **IMPORTANT**: Only include fields you will register as CustomDataConfigs. Unregistered fields are stored but **cannot be used in KPIs**.

### What NOT to Include in customData

The Olakai platform automatically tracks these — do NOT duplicate them:

| Already Tracked | Where | Don't Send As customData |
|-----------------|-------|--------------------------|
| Session ID | Main payload | `sessionId` |
| Agent ID | API key association | `agentId` |
| User email | `userEmail` parameter | `email`, `userEmail` |
| Timestamp | Event metadata | `timestamp`, `createdAt` |
| Request time | `requestTime` parameter | `duration`, `latency` |
| Token count | `tokens` parameter | `tokenCount` |
| Model | Auto-detected | `model`, `modelName` |
| Provider | Client config | `provider` |

**customData is ONLY for:**
1. **KPI variables** — Fields you'll use in formula calculations
2. **Tagging/filtering** — Fields you'll filter by in queries

## Step 2: Configure Olakai Platform

### 2.1 Create a Workflow (Required)

> **Every agent MUST belong to a workflow**, even if it's the only agent in that workflow.

```bash
olakai workflows create --name "Your Workflow Name" --json
# Output: { "id": "wfl_xxx...", "name": "Your Workflow Name" }
```

### 2.2 Create the Agent in Olakai

```bash
olakai agents create \
  --name "Your Agent Name" \
  --description "What this agent does" \
  --workflow WORKFLOW_ID \
  --with-api-key \
  --json

# Returns agent details including apiKey:
# {
#   "id": "cmkbteqn501kyjy4yu6p6xrrx",
#   "name": "Your Agent Name",
#   "workflowId": "wfl_xxx...",
#   "apiKey": "sk_agent_xxxxx..."   <-- Use this in your SDK
# }
```

**Agent-Workflow Hierarchy:**
```
Workflow: "Customer Support Pipeline"
├── Agent: "Ticket Classifier"
├── Agent: "Response Generator"
└── Agent: "Quality Checker"

Workflow: "Document Processing"
└── Agent: "Document Summarizer"  ← single-agent workflows are valid
```

### 2.3 Create Custom Data Configurations (BEFORE Writing SDK Code)

> **This step MUST be completed before Step 3 (SDK Integration).** Only fields registered here can be used in KPI formulas.

> **ONLY create configs for data you'll use in KPIs or for filtering.** Don't create configs for data already tracked automatically.

```bash
# For numeric fields (can be used in KPI calculations)
olakai custom-data create --agent-id YOUR_AGENT_ID --name "ItemsProcessed" --type NUMBER
olakai custom-data create --agent-id YOUR_AGENT_ID --name "SuccessRate" --type NUMBER
olakai custom-data create --agent-id YOUR_AGENT_ID --name "StepCount" --type NUMBER

# For string fields (for filtering/grouping, not calculations)
olakai custom-data create --agent-id YOUR_AGENT_ID --name "ExecutionId" --type STRING

# Verify all configs are created
olakai custom-data list --agent-id YOUR_AGENT_ID
```

### 2.4 Create KPI Definitions

#### Quick Start with Templates

Instead of writing formulas from scratch, use predefined classifier templates:

```bash
# List available templates
olakai kpis templates

# Create a classifier KPI from a template
olakai kpis create --name "User Satisfaction" \
  --calculator-id classifier --template-id sentiment_scorer \
  --scope CHAT --agent-id $AGENT_ID

# Create a time-saved estimator
olakai kpis create --name "Time Saved" \
  --calculator-id classifier --template-id time_saved_estimator \
  --scope CHAT --agent-id $AGENT_ID
```

#### Custom Formula KPIs

```bash
# Variable passthrough
olakai kpis create \
  --name "Items Processed" \
  --agent-id YOUR_AGENT_ID \
  --calculator-id formula \
  --formula "ItemsProcessed" \
  --unit "items" \
  --aggregation SUM

# Percentage calculation
olakai kpis create \
  --name "Success Rate" \
  --agent-id YOUR_AGENT_ID \
  --calculator-id formula \
  --formula "SuccessRate * 100" \
  --unit "%" \
  --aggregation AVERAGE

# Conditional counting
olakai kpis create \
  --name "Error Count" \
  --agent-id YOUR_AGENT_ID \
  --calculator-id formula \
  --formula "IF(SuccessRate < 1, 1, 0)" \
  --unit "errors" \
  --aggregation SUM

# Validate formulas before creating
olakai kpis validate --formula "ItemsProcessed" --agent-id YOUR_AGENT_ID
```

## Step 3: Implement SDK Integration

### 3.1 TypeScript Implementation

**Install dependencies:**
```bash
npm install @olakai/sdk openai
```

**Initialize and track:**
```typescript
import { olakaiConfig, olakai } from "@olakai/sdk";
import OpenAI from "openai";

// Initialize Olakai
olakaiConfig({
  apiKey: process.env.OLAKAI_API_KEY!,
  debug: process.env.NODE_ENV === "development",
});

// Create LLM client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use wrapped client — monitoring happens automatically
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: userPrompt }],
});
```

**Agentic workflow with manual event tracking:**

> **`taskExecutionId` — Cross-Agent Task Correlation.** Generate ONE `taskExecutionId` per task and share it across all agents in a multi-agent workflow. This links events from different agents into a single logical task for analytics.

```typescript
async function runAgent(input: string): Promise<string> {
  const startTime = Date.now();
  const executionId = crypto.randomUUID();
  const taskExecutionId = crypto.randomUUID();
  let totalTokens = 0;
  let stepCount = 0;
  let itemsProcessed = 0;

  try {
    // Step 1: Planning
    stepCount++;
    const plan = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Plan: ${input}` }],
    });
    totalTokens += plan.usage?.total_tokens ?? 0;

    // Step 2: Process items
    const items = parseItems(plan.choices[0].message.content);
    for (const item of items) {
      stepCount++;
      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: `Process: ${item}` }],
      });
      totalTokens += result.usage?.total_tokens ?? 0;
      itemsProcessed++;
    }

    // Step 3: Summarize
    stepCount++;
    const summary = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Summarize results" }],
    });
    totalTokens += summary.usage?.total_tokens ?? 0;

    const finalResponse = summary.choices[0].message.content ?? "";

    // Track the complete workflow as a single event
    // Only send fields that have CustomDataConfigs (from Step 2.3)
    olakai("event", "ai_activity", {
      prompt: input,
      response: finalResponse,
      tokens: totalTokens,
      requestTime: Date.now() - startTime,
      taskExecutionId,
      task: "Data Processing & Analysis",
      customData: {
        ExecutionId: executionId,
        StepCount: stepCount,
        ItemsProcessed: itemsProcessed,
        SuccessRate: 1.0,
      },
    });

    return finalResponse;
  } catch (error) {
    // Track failed execution — same fields, different values
    olakai("event", "ai_activity", {
      prompt: input,
      response: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
      tokens: totalTokens,
      requestTime: Date.now() - startTime,
      taskExecutionId,
      task: "Data Processing & Analysis",
      customData: {
        ExecutionId: executionId,
        StepCount: stepCount,
        ItemsProcessed: itemsProcessed,
        SuccessRate: 0,
      },
    });
    throw error;
  }
}
```

### 3.2 Python Implementation

**Install dependencies:**
```bash
pip install olakai-sdk openai
```

**Initialize and track:**
```python
import os
from olakaisdk import olakai_config, olakai, OlakaiEventParams
from openai import OpenAI

# Initialize Olakai
olakai_config(os.getenv("OLAKAI_API_KEY"))

# Create OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

**Agentic workflow:**
```python
import time
import uuid

def run_agent(input_text: str) -> str:
    start_time = time.time()
    execution_id = str(uuid.uuid4())
    task_execution_id = str(uuid.uuid4())
    total_tokens = 0
    step_count = 0
    items_processed = 0

    try:
        # Your workflow steps here...
        step_count += 1
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": input_text}]
        )
        total_tokens += response.usage.total_tokens
        final_response = response.choices[0].message.content

        # Track successful execution
        olakai("event", "ai_activity", OlakaiEventParams(
            prompt=input_text,
            response=final_response,
            tokens=total_tokens,
            requestTime=int((time.time() - start_time) * 1000),
            taskExecutionId=task_execution_id,
            task="Data Processing & Analysis",
            customData={
                "ExecutionId": execution_id,
                "StepCount": step_count,
                "ItemsProcessed": items_processed,
                "SuccessRate": 1.0,
            }
        ))

        return final_response

    except Exception as e:
        olakai("event", "ai_activity", OlakaiEventParams(
            prompt=input_text,
            response=f"Error: {str(e)}",
            tokens=total_tokens,
            requestTime=int((time.time() - start_time) * 1000),
            taskExecutionId=task_execution_id,
            task="Data Processing & Analysis",
            customData={
                "ExecutionId": execution_id,
                "StepCount": step_count,
                "ItemsProcessed": items_processed,
                "SuccessRate": 0,
            }
        ))
        raise
```

### 3.3 REST API Direct Integration

For other languages or custom integrations:

```bash
curl -X POST "https://app.olakai.ai/api/monitoring/prompt" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "prompt": "User input here",
    "response": "Agent response here",
    "app": "your-agent-name",
    "task": "Data Processing & Analysis",
    "tokens": 1500,
    "requestTime": 5000,
    "customData": {
      "ExecutionId": "abc-123",
      "StepCount": 5,
      "ItemsProcessed": 10,
      "SuccessRate": 1.0
    }
  }'
```

## Step 4: Test-Validate-Iterate Cycle

**Always validate your implementation by running a test and inspecting the actual event data.**

### 4.1 Run Your Agent

Execute your agent with test data to generate at least one event.

### 4.2 Fetch and Inspect the Event

```bash
olakai activity list --agent-id YOUR_AGENT_ID --limit 1 --json
olakai activity get EVENT_ID --json
```

### 4.3 Validate Each Component

**Check customData is present and correct:**
```bash
olakai activity get EVENT_ID --json | jq '.customData'
```

**Check KPIs are numeric (not strings):**
```bash
olakai activity get EVENT_ID --json | jq '.kpiData'
```

**CORRECT** — numeric values:
```json
{
  "Items Processed": 10,
  "Success Rate": 100
}
```

**WRONG** — string values (broken formula):
```json
{
  "Items Processed": "itemsProcessed"
}
```
Fix: `olakai kpis update KPI_ID --formula "YourVariable"`

**WRONG** — null values:
Fix by verifying:
1. CustomDataConfig exists: `olakai custom-data list --agent-id ID`
2. Field name case matches exactly (case-sensitive)
3. SDK actually sends the field in customData

### 4.4 Validation Flow

```
1. Run agent (generate event)
           ↓
2. Fetch event: olakai activity get ID --json
           ↓
3. Check customData present? NO → Fix SDK code
           ↓
4. Check kpiData numeric? NO → Fix formula
           ↓
5. Check kpiData not null? NO → Create CustomDataConfig or fix field name
           ↓
✅ All validations pass — implementation complete
```

## Step 5: Production Checklist

Before deploying to production:

- [ ] API key stored securely in environment variables
- [ ] Error handling wraps all LLM calls
- [ ] Failed executions still report events (with SuccessRate: 0)
- [ ] All custom data fields have corresponding CustomDataConfig entries
- [ ] KPI formulas validated and showing numeric values (not strings)
- [ ] SDK configured with appropriate retries and timeouts
- [ ] Sensitive data redaction enabled if needed

## KPI Formula Reference

### Supported Operators

| Category | Operators |
|----------|-----------|
| Arithmetic | `+`, `-`, `*`, `/` |
| Comparison | `<`, `<=`, `=`, `<>`, `>=`, `>` |
| Logical | `AND`, `OR`, `NOT` |
| Conditional | `IF(condition, true_val, false_val)`, `MAP(value, match1, out1, default)` |
| Math | `ABS`, `MAX`, `MIN`, `AVERAGE`, `TRUNC` |
| Null handling | `ISNA(value)`, `ISDEFINED(value)`, `NA()` |

### Common Formula Patterns

```bash
--formula "ItemsProcessed"                              # passthrough
--formula "SuccessRate * 100"                            # percentage (0-1 to 0-100)
--formula "IF(SuccessRate < 1, 1, 0)"                    # conditional counting
--formula "IF(PII detected, 1, 0)"                       # built-in variable
--formula "IF(ISDEFINED(MyField), MyField, 0)"           # null-safe
--formula "IF(AND(StepCount > 5, SuccessRate < 0.9), 1, 0)"  # compound conditions
```

### Aggregation Types

| Aggregation | Use For | Example |
|-------------|---------|---------|
| `SUM` | Totals, counts | Total items processed across all runs |
| `AVERAGE` | Rates, percentages | Average success rate |

## Task Categories Reference

Use these predefined task categories for the `task` field:

| Category | Example Use |
|----------|-------------|
| Research & Intelligence | Competitive intelligence, market research |
| Data Processing & Analysis | Data extraction, statistical analysis |
| Content Development | Blog writing, technical documentation |
| Content Refinement | Editing, proofreading |
| Customer Experience | Complaint resolution, ticket triage |
| Software Development | Code generation, code review, debugging |
| Strategic Planning | Roadmap development, scenario planning |

## Quick Reference

```bash
# CLI Commands
olakai login                                              # Authenticate
olakai workflows create --name "Name" --json              # Create workflow
olakai agents create --name "Name" --workflow ID --with-api-key  # Register agent
olakai custom-data create --agent-id ID --name X --type NUMBER   # Create custom field
olakai kpis create --formula "X" --agent-id ID            # Create KPI
olakai activity list --agent-id ID                        # View events
```

```typescript
// TypeScript SDK
import { olakaiConfig, olakai } from "@olakai/sdk";
olakaiConfig({ apiKey: process.env.OLAKAI_API_KEY });

olakai("event", "ai_activity", {
  prompt: "input",
  response: "output",
  tokens: 1500,
  task: "Data Processing & Analysis",
  customData: { StepCount: 3, Success: 1 },
});
```

```python
# Python SDK
from olakaisdk import olakai_config, olakai, OlakaiEventParams
olakai_config(os.getenv("OLAKAI_API_KEY"))

olakai("event", "ai_activity", OlakaiEventParams(
    prompt="input",
    response="output",
    tokens=1500,
    task="Data Processing & Analysis",
    customData={"StepCount": 3, "Success": 1},
))
```
