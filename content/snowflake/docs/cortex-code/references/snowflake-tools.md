# Snowflake-Native Tools Reference

Cortex Code integrates directly with Snowflake for SQL execution, object discovery, semantic analysis, and artifact management.

## #TABLE Context Injection

Type `#` followed by a fully-qualified 3-part table name to auto-inject metadata into your prompt:

```
Analyze the data in #MY_DB.PUBLIC.USERS
```

This fetches and injects:
- Column metadata (name, type, nullable, default, comment)
- Primary keys
- Approximate row count
- Up to 3 sample rows

Autocomplete is available after typing `#`. Names are case-insensitive.

## SQL Execution

### /sql Slash Command

```
/sql SELECT COUNT(*) FROM my_table
```

Runs SQL inline. Use `/table` or `Ctrl+T` for a fullscreen table view of results.

### Agent SQL Execution

The agent executes SQL autonomously when needed via the `snowflake_sql_execute` tool:
- Runs on the active Snowflake connection
- Handles large result sets with truncation
- Auto-refreshes expired tokens
- Supports `only_compile` mode for validation without execution

## Object Search

Search for Snowflake objects using semantic (natural language) search:

```bash
cortex search object "user activity tables"
cortex search object "revenue" --types=table,view
```

Searches across databases, schemas, tables, views, semantic views, and functions.

## Cortex Analyst

Convert natural language questions to SQL using semantic models or semantic views:

```bash
# Using a local YAML semantic model
cortex analyst query "What were total sales last quarter?" --model=sales_model.yaml

# Using a semantic view
cortex analyst query "Top customers by spend" --view=ANALYTICS.CORE.REVENUE_METRICS

# Validate a semantic model file
cortex reflect revenue.yaml
cortex reflect revenue.yaml --target-schema DB.SCHEMA
```

Returns generated SQL, explanation, and suggested follow-up questions.

## Semantic Views

Semantic views are curated data models with business-friendly definitions built on top of raw tables.

```bash
cortex semantic-views discover              # Find all semantic views in account
cortex semantic-views list [--limit=N]      # List views
cortex semantic-views describe <view>       # Show dimensions, facts, metrics
cortex semantic-views search "revenue"      # Search by keyword
cortex semantic-views ddl <view>            # Show SQL DDL definition
cortex semantic-views query <view>          # Execute query against view
```

**Best practice:** Before writing complex SQL for business analytics, check if a semantic view exists. Semantic views provide verified business definitions more reliable than raw SQL.

## Cortex Agent Discovery

Cortex Agents contain curated instructions about which data sources to use:

```bash
cortex agents discover                      # Find all agents in account
cortex agents list [--database DB]          # List agents in scope
cortex agents describe <agent>              # Show instructions, tools, data sources
cortex agents search "revenue"              # Search by domain
```

## Product Docs Search

```bash
cortex search docs "how to create a stored procedure"
cortex search docs "dynamic tables target lag"
```

Searches Snowflake product documentation and returns relevant results.

## Artifact Creation

Upload files to Snowflake Workspace:

```bash
cortex artifact create notebook my_analysis ./analysis.ipynb
cortex artifact create file my_report ./report.csv
```

Supports notebooks (`.ipynb`) and generic files. Default workspace: `USER$.PUBLIC.DEFAULT$`.

## Connection Management

### CLI

```bash
cortex connections list             # List configured connections
cortex connections set <name>       # Switch active connection
cortex --connection <name>          # Start with specific connection
```

### /connections

Opens an interactive fullscreen connection manager.

### connections.toml

Connections are defined in `~/.snowflake/connections.toml`:

```toml
[default]
account = "myaccount"
user = "myuser"
authenticator = "externalbrowser"
database = "MYDB"
schema = "PUBLIC"
warehouse = "COMPUTE_WH"
role = "DEVELOPER"

[prod]
account = "myaccount"
user = "myuser"
authenticator = "snowflake_jwt"
private_key_path = "~/.snowflake/rsa_key.p8"
database = "PROD_DB"
schema = "PUBLIC"
warehouse = "PROD_WH"
role = "ANALYST"
```

### Authentication Methods

| Method | Value |
|--------|-------|
| Browser SSO | `externalbrowser` |
| Key-pair | `snowflake_jwt` |
| Password | `snowflake` |
| OAuth | `oauth` |
| Programmatic access token | `PROGRAMMATIC_ACCESS_TOKEN` |

## Source Command

Run a command with Snowflake credentials injected as environment variables:

```bash
cortex source <connection> --map account=SF_ACCOUNT --map user=SF_USER -- python myscript.py
cortex source myconn --map password=SNOWFLAKE_PASS -- dbt run
```

Available fields: `account`, `user`, `password`, `authenticator`, `warehouse`, `database`, `schema`, `role`, `host`, `token`.
