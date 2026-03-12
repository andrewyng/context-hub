---
name: cli
description: "Olakai CLI for managing agents, workflows, KPIs, and custom data — the configuration layer for AI analytics and governance"
metadata:
  languages: "javascript"
  versions: "0.1.13"
  revision: 1
  updated-on: "2026-03-10"
  source: maintainer
  tags: "olakai,cli,agents,workflows,kpis,configuration"
---

# Olakai CLI

The Olakai CLI manages the configuration layer for AI analytics and governance: agents, workflows, KPIs, and custom data fields. It is separate from the SDKs, which handle event tracking at runtime.

> **v0.1.13** | Node.js 20+ | `npm install -g olakai-cli`

## Installation & Auth

```bash
npm install -g olakai-cli
olakai login     # opens browser for OAuth 2.0 Device Flow
olakai whoami    # verify your session
```

## Environment Selection

```bash
olakai --env staging agents list     # use staging environment
olakai --env local agents list       # use localhost:3000

# Or set via environment variable
export OLAKAI_ENV=staging            # production | staging | local
```

## Agents

Agents represent individual AI services or components being monitored.

```bash
# List all agents
olakai agents list [--json] [--include-kpis]

# Get agent details (includes API key)
olakai agents get <id> [--json]

# Create an agent with an API key for SDK use
olakai agents create \
  --name "Document Processor" \
  --description "Extracts and summarizes documents" \
  --workflow <workflow-id> \
  --with-api-key \
  --json

# Update an agent
olakai agents update <id> \
  --name "New Name" \
  --workflow <workflow-id> \
  --role WORKER|COORDINATOR

# Delete an agent
olakai agents delete <id> --force
```

### Retrieve an Agent's API Key

```bash
olakai agents get <id> --json | jq '.apiKey'
```

Use this key as `OLAKAI_API_KEY` in your SDK configuration.

## Workflows

Workflows group agents into logical units. Every agent should belong to a workflow, even if it's the only one.

```bash
# List workflows
olakai workflows list [--json] [--include-agents] [--include-inactive]

# Get workflow details
olakai workflows get <id> [--json]

# Create a workflow
olakai workflows create --name "Customer Support Pipeline" [--description "..."] [--json]

# Update a workflow
olakai workflows update <id> --name "New Name" [--active|--inactive] [--json]

# Delete a workflow
olakai workflows delete <id> --force
```

### Agent-Workflow Hierarchy

```
Workflow: "Customer Support Pipeline"
├── Agent: "Ticket Classifier"
├── Agent: "Response Generator"
└── Agent: "Quality Checker"

Workflow: "Document Processing"
└── Agent: "Document Summarizer"  ← single-agent workflows are valid
```

## KPIs

KPIs define business-specific calculations that run against event data from the SDKs.

### Create KPIs

```bash
# Formula-based KPI (uses custom data fields as variables)
olakai kpis create \
  --name "Documents Processed" \
  --agent-id <agent-id> \
  --calculator-id formula \
  --formula "IF(Success = 1, 1, 0)" \
  --unit "count" \
  --aggregation SUM

# Classifier KPI (AI-evaluated from conversation content)
olakai kpis create \
  --name "User Satisfaction" \
  --agent-id <agent-id> \
  --calculator-id classifier \
  --template-id sentiment_scorer \
  --scope CHAT
```

### Manage KPIs

```bash
# List KPIs
olakai kpis list [--agent-id <id>] [--include-inactive] [--json]

# Get KPI details
olakai kpis get <id> [--json]

# Update a KPI
olakai kpis update <id> --formula "NewVariable * 100" [--active|--inactive]

# Delete a KPI
olakai kpis delete <id> --force
```

### Validate Formulas

```bash
# Check a formula before creating a KPI
olakai kpis validate --formula "IF(SuccessRate < 1, 1, 0)" --agent-id <id>

# List available context variables for formulas
olakai kpis context-variables [--agent-id <id>] [--json]
```

### Formula Reference

| Category | Operators |
|----------|-----------|
| Arithmetic | `+`, `-`, `*`, `/` |
| Comparison | `<`, `<=`, `=`, `<>`, `>=`, `>` |
| Logical | `AND`, `OR`, `NOT` |
| Conditional | `IF(condition, true_val, false_val)` |
| Null handling | `ISNA(value)`, `ISDEFINED(value)` |

Common patterns:

```bash
--formula "StepCount"                          # passthrough
--formula "SuccessRate * 100"                  # percentage
--formula "IF(Success = 1, 1, 0)"              # conditional count
--formula "IF(ISDEFINED(MyField), MyField, 0)" # null-safe
```

### Aggregation Types

| Type | Use For |
|------|---------|
| `SUM` | Totals, counts |
| `AVERAGE` | Rates, percentages |
| `COUNT` | Event counts |
| `MIN` / `MAX` | Extremes |
| `LATEST` | Most recent value |

## Custom Data

Custom data configs define which fields from SDK `customData` become available as KPI formula variables. Only registered fields can power KPIs.

```bash
# Create a numeric field (usable in KPI formulas)
olakai custom-data create \
  --agent-id <agent-id> \
  --name "StepCount" \
  --type NUMBER \
  --description "Number of workflow steps"

# Create a string field (for filtering, not calculations)
olakai custom-data create \
  --agent-id <agent-id> \
  --name "ExecutionId" \
  --type STRING

# List all configs for an agent
olakai custom-data list --agent-id <agent-id>
```

### Data Pipeline

```
SDK customData → CustomDataConfig (schema) → Context Variable → KPI Formula → kpiData
```

Register configs **before** sending data from the SDK. Unregistered fields are stored but cannot be used in KPI formulas.

## Activity

View events sent by the SDKs.

```bash
# List recent activity
olakai activity list [--agent-id <id>] [--limit 10] [--json]

# Get full event details (includes customData and kpiData)
olakai activity get <event-id> [--json]

# View session groupings
olakai activity sessions [--agent-id <id>] [--json]
```

### Validating SDK Integration

After setting up the SDK, verify data flows correctly:

```bash
# 1. Trigger a test event from your application

# 2. Fetch the latest event
olakai activity list --agent-id <id> --limit 1 --json

# 3. Inspect customData and kpiData
olakai activity get <event-id> --json | jq '{customData, kpiData}'
```

**Check kpiData values are numeric** (not strings or null):
- Strings mean the formula is stored incorrectly — fix with `olakai kpis update <id> --formula "Variable"`
- Null means the CustomDataConfig is missing or the field name doesn't match (case-sensitive)

## Typical Setup Flow

```bash
# 1. Authenticate
olakai login

# 2. Create workflow
olakai workflows create --name "My AI Workflow" --json
# → note the workflow ID

# 3. Create agent with API key
olakai agents create \
  --name "My Agent" \
  --workflow <workflow-id> \
  --with-api-key --json
# → note the agent ID and API key

# 4. Register custom data fields
olakai custom-data create --agent-id <id> --name "Success" --type NUMBER
olakai custom-data create --agent-id <id> --name "StepCount" --type NUMBER

# 5. Create KPIs
olakai kpis create --agent-id <id> --name "Success Rate" \
  --calculator-id formula --formula "Success * 100" --aggregation AVERAGE

# 6. Configure SDK with the API key, send events, then validate:
olakai activity list --agent-id <id> --limit 1 --json
```

## Links

- Full documentation: https://app.olakai.ai/llms.txt
- Dashboard: https://app.olakai.ai
- GitHub: https://github.com/ailocalnode/olakai-cli
