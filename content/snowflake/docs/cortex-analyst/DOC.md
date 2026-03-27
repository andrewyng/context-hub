---
name: cortex-analyst
description: "Snowflake Cortex Analyst — natural language to SQL engine powered by semantic views for self-serve analytics, REST API integration, and multi-turn conversations"
metadata:
  languages: "sql,python"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,cortex,analyst,natural-language,sql,semantic-model,analytics,rest-api"
---

# Cortex Analyst

Cortex Analyst is a fully managed Snowflake Cortex feature that converts natural language questions into accurate SQL queries against your structured data. Business users ask questions in plain English and get direct answers — no SQL required.

## How It Works

1. User asks a question in natural language
2. Cortex Analyst uses a **semantic model** (or **semantic view**) to understand your data's business context
3. It generates and executes a SQL query against Snowflake
4. Results are returned to the user

## Access Control

```sql
-- Required: one of these database roles (run as ACCOUNTADMIN)
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE my_role;
-- OR for Analyst-only access:
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_ANALYST_USER TO ROLE my_role;
```

Additional requirements:
- `READ` or `WRITE` on the stage containing the semantic model YAML (if stage-based)
- `USAGE` on any Cortex Search services referenced in the model
- `SELECT` on tables referenced in the model

## Semantic Views (Recommended)

Semantic Views are schema-level objects that define business concepts over your data. They are the recommended approach for Cortex Analyst.

### What Semantic Views Define

- **Logical tables**: Business entities (customers, orders, products)
- **Dimensions**: Categorical context (customer name, product category, order date)
- **Facts**: Row-level quantitative data (sale amounts, quantities)
- **Metrics**: Aggregated KPIs (total revenue, average order value)
- **Relationships**: How tables join together

### Why Use Semantic Views

- **Rich metadata**: Descriptions, synonyms, and data types help the LLM understand your data
- **Business logic**: Metrics capture correct aggregation formulas
- **Predefined joins**: Relationship paths ensure correct multi-table queries
- **Verified examples**: Sample questions and SQL answers guide generation
- **Native Snowflake integration**: Full RBAC, privileges, governance, and sharing
- **Derived metrics**: Combine data from multiple tables
- **Access modifiers**: Mark facts/metrics as public or private

### Creating a Semantic View

```sql
CREATE OR REPLACE SEMANTIC VIEW revenue_analytics
  COMMENT = 'Revenue analytics for sales team'
  AS
  TABLES (
    orders_table AS (
      SELECT * FROM analytics.public.orders
    )
      PRIMARY KEY (order_id)
      WITH DIMENSIONS (
        order_id COMMENT 'Unique order identifier',
        customer_name COMMENT 'Customer full name',
        order_date COMMENT 'Date the order was placed'
      )
      WITH FACTS (
        amount COMMENT 'Order total in USD',
        quantity COMMENT 'Number of items'
      )
      WITH METRICS (
        total_revenue AS SUM(amount) COMMENT 'Total revenue in USD',
        avg_order_value AS AVG(amount) COMMENT 'Average order value'
      )
  );
```

## Legacy Semantic Model (YAML)

Stage-based YAML files are still supported for backward compatibility. Upload a YAML file defining tables, dimensions, time dimensions, measures, and sample queries to a Snowflake stage.

## REST API

Cortex Analyst is accessed via REST API for integration into any application.

### Endpoint

```
POST https://<account>.snowflakecomputing.com/api/v2/cortex/analyst/message
```

### Request Body

```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What was total revenue last month?"}
      ]
    }
  ],
  "semantic_model_file": "@my_stage/revenue_model.yaml"
}
```

Or with a semantic view:

```json
{
  "messages": [...],
  "semantic_view": "my_db.my_schema.revenue_analytics"
}
```

### Response

The response contains either:
- A SQL query (type `sql`) that answers the question
- A text explanation (type `text`) if the question cannot be answered with SQL
- A suggestion list if the question is ambiguous

### Multi-Turn Conversations

Pass conversation history in the `messages` array to enable follow-up questions:

```json
{
  "messages": [
    {"role": "user", "content": [{"type": "text", "text": "What is revenue by region for 2024?"}]},
    {"role": "analyst", "content": [{"type": "sql", "statement": "SELECT ..."}]},
    {"role": "user", "content": [{"type": "text", "text": "What about just North America?"}]}
  ]
}
```

## Python Integration (Streamlit Example)

```python
import streamlit as st
from snowflake.snowpark.context import get_active_session
import json

session = get_active_session()

def query_analyst(question, messages):
    messages.append({"role": "user", "content": [{"type": "text", "text": question}]})
    response = session.sql(f"""
        SELECT SNOWFLAKE.CORTEX.ANALYST(
            '{json.dumps({"messages": messages, "semantic_view": "MY_DB.ANALYTICS.REVENUE"})}'
        )
    """).collect()
    return response

st.title("Revenue Analytics")
question = st.text_input("Ask a question about revenue:")
if question:
    result = query_analyst(question, st.session_state.get("messages", []))
    st.write(result)
```

## Using Cortex Analyst from Cortex Code

In Cortex Code (CLI or Snowsight), you can query semantic models directly:

```
Use the @models/revenue.yaml semantic model to answer "What was revenue last month?"
```

```bash
# CLI
cortex analyst query "Top customers by spend" --view=ANALYTICS.CORE.REVENUE_METRICS
```

## Key Features

- **Automatic model selection**: If multiple semantic models exist, Cortex Analyst picks the right one
- **Security**: No data leaves Snowflake's governance boundary; full RBAC enforcement
- **No model training**: Cortex Analyst does not train on customer data
- **Powered by frontier LLMs**: Uses Snowflake-hosted models from Mistral, Meta, and others

## Limiting Access

```sql
-- Revoke broad access and grant to specific roles
REVOKE DATABASE ROLE SNOWFLAKE.CORTEX_USER FROM ROLE PUBLIC;

CREATE ROLE cortex_analyst_role;
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_ANALYST_USER TO ROLE cortex_analyst_role;
GRANT ROLE cortex_analyst_role TO USER analyst_user;
```

## Prerequisites

- Snowflake account with `CORTEX_USER` or `CORTEX_ANALYST_USER` database role
- A semantic view or semantic model YAML file defining your data
- SELECT privileges on underlying tables
- Cross-region inference enabled if needed
