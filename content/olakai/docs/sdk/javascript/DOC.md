---
name: sdk
description: "Olakai SDK for measuring AI ROI, governing risk, and controlling costs across agents and AI applications"
metadata:
  languages: "javascript"
  versions: "2.2.0"
  revision: 1
  updated-on: "2026-03-10"
  source: maintainer
  tags: "olakai,ai-analytics,governance,agents,kpi,roi,monitoring"
---

# Olakai TypeScript/JavaScript SDK

Olakai is a vendor-neutral platform that helps enterprises measure AI ROI, govern risk, and control costs across agents and AI applications. The SDK tracks AI interactions from your code and feeds data into KPIs, governance checks, and ROI dashboards.

> **v2.2.0** | Node.js 18+ | `npm install @olakai/sdk`

## Installation

```bash
npm install @olakai/sdk
# or
pnpm add @olakai/sdk
```

## Initialize

```typescript
import { olakaiConfig } from "@olakai/sdk";

olakaiConfig({
  apiKey: process.env.OLAKAI_API_KEY,
  endpoint: "https://app.olakai.ai", // default
  debug: false, // true for development logging
});
```

Each agent has its own API key. Create one via CLI: `olakai agents create --name "My Agent" --with-api-key`

## Fire-and-Forget Tracking

Track any AI interaction without awaiting the result. The call returns immediately and sends data in the background.

```typescript
import { olakai } from "@olakai/sdk";

// After your LLM call completes
olakai("event", "ai_activity", {
  prompt: "Summarize this quarterly report",
  response: "Revenue grew 15% quarter-over-quarter...",
  task: "Data Processing & Analysis",
  userEmail: "analyst@company.com",
  tokens: 1200,
  requestTime: 3500, // ms
  chatId: "session-abc123", // groups conversation turns
  customData: {
    DocumentType: "quarterly-report",
    PageCount: 12,
    Success: 1,
  },
});
```

## Awaitable Reporting

When you need confirmation that the event was recorded (e.g., for governance checks that may block content):

```typescript
import { olakaiReport } from "@olakai/sdk";

const result = await olakaiReport(
  "Draft an email to the client about project delays",
  "Dear Client, I wanted to update you on the current timeline...",
  {
    task: "Communication Strategy",
    userEmail: "pm@company.com",
    tokens: 450,
  }
);
```

## Function Monitoring

Wrap any function to automatically track its input/output:

```typescript
import { olakaiMonitor } from "@olakai/sdk";

const summarize = olakaiMonitor(
  async (text: string) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Summarize: ${text}` }],
    });
    return response.choices[0].message.content;
  },
  {
    task: "Content Refinement",
    userEmail: "editor@company.com",
  }
);

// Use normally — monitoring happens automatically
const summary = await summarize(longArticle);
```

## Content Governance (Blocking)

When governance policies detect sensitive content, the SDK throws `OlakaiBlockedError`:

```typescript
import { OlakaiBlockedError } from "@olakai/sdk";

try {
  const result = await monitoredFunction(userInput);
} catch (error) {
  if (error instanceof OlakaiBlockedError) {
    // error.details.detectedSensitivity: ["PII", "PHI", "CODE", "SECRET"]
    // error.details.isAllowedPersona: boolean
    if (error.details.detectedSensitivity.includes("PII")) {
      return "This request contains personal information and was blocked by policy.";
    }
  }
  throw error;
}
```

## Parameters Reference

All tracking functions accept these fields via `OlakaiEventParams`:

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | `string` | The input sent to the AI model |
| `response` | `string` | The AI model's output |
| `userEmail` | `string?` | User email for per-user analytics |
| `chatId` | `string?` | Groups related interactions into a session |
| `task` | `string?` | Task category (e.g., "Customer Experience") |
| `subTask` | `string?` | Specific sub-task within the category |
| `tokens` | `number?` | Total token count for the interaction |
| `requestTime` | `number?` | Request duration in milliseconds |
| `shouldScore` | `boolean?` | Whether to run quality scoring |
| `taskExecutionId` | `string?` | Correlates events across agents in a multi-agent task |
| `customData` | `object?` | Key-value pairs for KPI formulas (see below) |
| `customDimensions` | `object?` | String dimensions for categorization (`dim1`–`dim5`) |
| `customMetrics` | `object?` | Numeric values for analysis (`metric1`–`metric5`) |

## Custom Data Pipeline

Custom data flows through Olakai to power KPIs:

```
SDK customData → CustomDataConfig (schema) → Context Variable → KPI Formula → kpiData
```

### How It Works

1. You send `customData` fields with each event
2. Only fields registered as **CustomDataConfigs** on the platform become usable in KPI formulas
3. KPI formulas reference these fields as variables (e.g., `IF(Success = 1, 1, 0)`)
4. Computed KPI values appear on dashboards and in alerts

### Rules

| Rule | Detail |
|------|--------|
| Register fields first | Unregistered `customData` fields are stored but cannot power KPIs |
| NUMBER configs need numeric values | Send `5` (number), not `"5"` (string) |
| Formula variables are case-insensitive | `stepCount`, `STEPCOUNT`, `StepCount` all resolve the same |
| KPIs are per-agent | Each agent needs its own KPI definitions |

### Example

```typescript
// 1. Register via CLI:
//    olakai custom-data create --agent-id $ID --name "StepCount" --type NUMBER
//    olakai custom-data create --agent-id $ID --name "Success" --type NUMBER
//    olakai kpis create --agent-id $ID --name "Steps" --formula "StepCount" --aggregation SUM
//    olakai kpis create --agent-id $ID --name "Success Rate" --formula "Success * 100" --aggregation AVERAGE

// 2. Send matching fields in SDK:
olakai("event", "ai_activity", {
  prompt: taskInput,
  response: taskOutput,
  customData: {
    StepCount: 3,   // NUMBER — matches registered config
    Success: 1,     // NUMBER — 1/0 for boolean values
  },
});
```

## Agentic Workflows

For agents that make multiple LLM calls per task, aggregate them into one event:

```typescript
async function processDocument(doc: Document) {
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
    prompt: `Process: ${doc.title}`,
    response: result,
    tokens: totalTokens,
    requestTime: Date.now() - startTime,
    taskExecutionId: crypto.randomUUID(), // share across agents for cross-agent correlation
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

### Cross-Agent Task Correlation

When multiple agents collaborate on one task, generate a single `taskExecutionId` in the orchestrator and pass it to every agent. This links their events into one logical task for analytics.

```typescript
const taskId = crypto.randomUUID();

// Orchestrator passes taskId to each agent
await classifierAgent.run(input, { taskExecutionId: taskId });
await writerAgent.run(classified, { taskExecutionId: taskId });
await reviewerAgent.run(draft, { taskExecutionId: taskId });
```

## Framework Examples

### Next.js API Route

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { olakai } from "@olakai/sdk";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: message }],
  });

  const reply = response.choices[0].message.content;

  olakai("event", "ai_activity", {
    prompt: message,
    response: reply,
    tokens: response.usage?.total_tokens,
    task: "Customer Experience",
  });

  return NextResponse.json({ reply });
}
```

### Express.js

```typescript
import { olakaiConfig, olakai } from "@olakai/sdk";

olakaiConfig({ apiKey: process.env.OLAKAI_API_KEY });

app.post("/chat", async (req, res) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: req.body.message }],
  });

  olakai("event", "ai_activity", {
    prompt: req.body.message,
    response: response.choices[0].message.content,
    userEmail: req.user.email,
    task: "Customer Experience",
  });

  res.json({ reply: response.choices[0].message.content });
});
```

## Troubleshooting

**Events not appearing:** Verify `olakaiConfig()` was called before any tracking calls. Enable `debug: true` to see request/response logs.

**Content blocked unexpectedly:** Check your governance policies in the Olakai dashboard. The `OlakaiBlockedError.details` object shows which sensitivity was detected.

**KPIs showing null:** Ensure the field name in `customData` exactly matches the CustomDataConfig name (case-sensitive), and that NUMBER configs receive numeric values.

## Links

- Full documentation: https://app.olakai.ai/llms.txt
- Dashboard: https://app.olakai.ai
- GitHub: https://github.com/ailocalnode/olakai-sdk-typescript
