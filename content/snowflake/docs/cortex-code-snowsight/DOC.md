---
name: cortex-code-snowsight
description: "Cortex Code in Snowsight — Snowflake's agentic AI assistant embedded in the web UI for SQL authoring, code review, data exploration, and account administration"
metadata:
  languages: "sql"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,cortex,snowsight,ai,coding-assistant,sql,workspaces,code-review"
---

# Cortex Code in Snowsight

Cortex Code is an agentic AI assistant embedded directly in Snowsight (Snowflake's web UI). It translates natural language instructions into executable actions across SQL development, data exploration, and account administration — all without leaving the browser.

## Access

1. Sign in to Snowsight.
2. Select the **Cortex Code** icon in the lower-right corner.
3. Type a natural language prompt and press Enter.

If the response includes SQL, you can execute it directly or copy to clipboard.

## Access Control

| Database Role | Notes |
|---------------|-------|
| `SNOWFLAKE.COPILOT_USER` | Required for all users |
| `SNOWFLAKE.CORTEX_USER` or `SNOWFLAKE.CORTEX_AGENT_USER` | At least one required; `CORTEX_AGENT_USER` enables agentic workflows |

```sql
-- Grant access (run as ACCOUNTADMIN)
GRANT DATABASE ROLE SNOWFLAKE.COPILOT_USER TO ROLE my_role;
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_AGENT_USER TO ROLE my_role;
```

## Key Capabilities

### Agentic Coding in Workspaces

- **Code generation**: Generate SQL queries, create files, build data pipeline logic
- **Code modification**: Refine SQL, identify errors, suggest performance optimizations
- **Change review**: Preview AI changes using a diff view before applying
- **Code explanation**: Request explanations of existing SQL for understanding or collaboration
- **Follow-up questions**: Continue conversations for clarifying or deeper analysis
- **Inline catalog context**: Type `@` in the message box to search for and add catalog objects (tables, schemas, views) as context
- **Quick actions**: Highlight SQL text to access Quick Edit, Format, Add to Chat, and Explain
- **Fix SQL errors**: Use the Fix button in the results grid when a SQL statement fails

### AI Code Suggestions (Preview)

Context-aware inline SQL suggestions displayed as gray text at cursor position. Cortex Code uses query history, workspace content, table schemas, and recent executed queries.

- **Accept**: `Shift + Enter`
- **Dismiss**: `Esc`, `Delete`, `Backspace`, or keep typing
- **Disable**: Workspaces → SQL file → Settings → User preferences → AI code suggestions toggle

### Data and Catalog Discovery

- **Natural language schema search**: Find database objects using plain language
- **Integrated Q&A**: Get answers about Snowflake features and SQL syntax from official docs
- **Marketplace discovery**: Search and return listings from Snowflake Marketplace
- **Tag, masking policy, and lineage context** included when available

### Account Administration

- **Governance & security**: User and role access, data ownership, PII identification
- **Cost management**: Credit consumption, high-cost warehouses and queries

## Example Prompts

### SQL Development

| Use Case | Prompt |
|----------|--------|
| Logic explanation | "What does this SQL script do?" |
| Generation | "Write a query for top 10 customers by revenue and a 7-day moving average." |
| Query refinement | "Update the top performers query to show the top 100." |
| Performance optimization | "Explain why this query is slow and optimize it." |
| Data synthesis | "Generate synthetic data for 30 days of sales for an e-commerce site in the SAMPLEDATA.SALES table." |

### Data Discovery and Governance

| Use Case | Prompt |
|----------|--------|
| Access discovery | "What databases do I have access to?" |
| Security auditing | "Find all tables that have PII in them." |
| Tag discovery | "List every table tagged PII = TRUE in ANALYTICS_DB." |
| Lineage and tagging | "Show the lineage from RAW_DB.ORDERS to downstream dashboards." |
| Metadata search | "Where can I find tables related to customer churn and subscription status?" |

### Notebooks and ML

| Use Case | Prompt |
|----------|--------|
| EDA & ML | "Build me a notebook for customer churn prediction using pandas, matplotlib, seaborn, and scikit-learn." |
| Deep learning | "Create a new notebook and build a CNN for the MNIST dataset." |
| Pipeline engineering | "Create a dbt project to transform raw sales data." |

### Semantic Models

| Use Case | Prompt |
|----------|--------|
| Semantic queries | "Use the @models/revenue.yaml semantic model to answer 'What was revenue last month?'" |
| Model debugging | "Identify errors in my semantic model at @models/revenue.yaml" |

### Administration

| Use Case | Prompt |
|----------|--------|
| Resource monitoring | "Which 5 service types are using the most credits? Show me a visualization and how to reduce costs." |

## Supported Models

- **Claude Opus 4.6** (`claude-opus-4-6`) — recommended
- Claude Opus 4.5 (`claude-opus-4-5`)
- Claude Sonnet 4.5 (`claude-sonnet-4-5`)
- Claude Sonnet 4.0 (`claude-4-sonnet`)

## Cross-Region Inference

Cortex Code works in any region when cross-region inference is enabled:

```sql
-- Run as ACCOUNTADMIN
ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'AWS_US';
```

Replace `AWS_US` with: `AWS_EU`, `AWS_APJ`, or `ANY_REGION`.

## Web Search

An ACCOUNTADMIN can enable web search for Cortex Code:

1. Navigate to **AI/ML → Agents**
2. Select **Settings**
3. Toggle **Web search** to enable

## Cortex Code vs Snowflake Intelligence vs Copilot (Legacy)

| Feature | Cortex Code | Snowflake Intelligence | Copilot (Legacy) |
|---------|-------------|----------------------|------------------|
| Use case | SQL authoring, data exploration, admin tasks | Natural language data analysis and insights | Basic SQL assistance (deprecated) |
| Integration | Snowsight Workspaces | Intelligence UI, Cortex Agents API | Separate copilot panel |
| Key capabilities | Code gen/modify, diff review, code explanation | Data analysis, summaries, NL interactions | Contextual SQL suggestions |

## Prerequisites

- Snowflake account (Commercial — not Gov, VPS, or Sovereign)
- Required database roles: `SNOWFLAKE.COPILOT_USER` + `SNOWFLAKE.CORTEX_USER` or `SNOWFLAKE.CORTEX_AGENT_USER`
- Cross-region inference enabled if your model is not available in your region
