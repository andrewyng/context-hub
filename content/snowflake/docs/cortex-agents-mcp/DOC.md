---
name: cortex-agents-mcp
description: "Snowflake-managed MCP Server — expose Cortex Analyst, Cortex Search, Cortex Agents, SQL execution, and custom UDF/SP tools via the Model Context Protocol standard"
metadata:
  languages: "sql,python"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "snowflake,mcp,model-context-protocol,agents,cortex,tools,oauth,agentic-ai"
---

# Snowflake-Managed MCP Server

Snowflake hosts a managed MCP (Model Context Protocol) server that lets external AI agents discover and invoke Snowflake tools — Cortex Analyst, Cortex Search, Cortex Agents, SQL execution, and custom UDFs/SPs — over a standardized interface. No separate infrastructure to deploy.

Supports MCP revision 2025-06-18.

## What You Get

- **Standardized integration**: One interface for tool discovery and invocation across any MCP client
- **Built-in OAuth**: Snowflake's OAuth service handles auth for MCP connections
- **RBAC governance**: Separate permissions for the MCP server object and each individual tool

## Create an MCP Server

```sql
CREATE OR REPLACE MCP SERVER my_mcp_server
FROM SPECIFICATION $$
tools:
  - name: "product-search"
    type: "CORTEX_SEARCH_SERVICE_QUERY"
    identifier: "mydb.myschema.product_search_service"
    description: "Search product catalog"
    title: "Product Search"

  - name: "revenue-analyst"
    type: "CORTEX_ANALYST_MESSAGE"
    identifier: "mydb.myschema.revenue_semantic_view"
    description: "Revenue analytics via natural language"
    title: "Revenue Analyst"
$$;
```

## Tool Types

### Cortex Analyst

Generates SQL from natural language. Only supports semantic views (not semantic model YAML files).

```yaml
tools:
  - name: "revenue-analyst"
    type: "CORTEX_ANALYST_MESSAGE"
    identifier: "db.schema.semantic_view_name"
    description: "Revenue data queries"
    title: "Revenue Analyst"
```

### Cortex Search

Hybrid (vector + keyword) search over unstructured data.

```yaml
tools:
  - name: "product-search"
    type: "CORTEX_SEARCH_SERVICE_QUERY"
    identifier: "db.schema.search_service_name"
    description: "Search product catalog"
    title: "Product Search"
```

### SQL Execution

Run arbitrary SQL queries against Snowflake.

```yaml
tools:
  - name: "sql_exec_tool"
    type: "SYSTEM_EXECUTE_SQL"
    description: "Execute SQL queries against the connected Snowflake database"
    title: "SQL Execution Tool"
```

### Cortex Agent

Pass messages to an existing Cortex Agent object.

```yaml
tools:
  - name: "agent_1"
    type: "CORTEX_AGENT_RUN"
    identifier: "db.schema.my_agent"
    description: "Agent that answers data questions"
    title: "My Agent"
```

### Custom Tools (UDFs and Stored Procedures)

Invoke UDFs or stored procedures as MCP tools. Specify `type: "function"` for UDFs, `type: "procedure"` for SPs.

```yaml
tools:
  - name: "multiply_ten"
    type: "GENERIC"
    identifier: "mydb.myschema.MULTIPLY_BY_TEN"
    description: "Multiplies input by ten"
    title: "Multiply by Ten"
    config:
      type: "function"
      warehouse: "MY_WH"
      input_schema:
        type: "object"
        properties:
          x:
            type: "number"
            description: "Value to multiply"
        required:
          - "x"
```

For stored procedures, use `type: "procedure"` in the config block.

## Authentication

### OAuth (Recommended)

Set up a Snowflake security integration for OAuth:

```sql
CREATE OR REPLACE SECURITY INTEGRATION my_mcp_oauth
  TYPE = API_AUTHENTICATION
  AUTH_TYPE = OAUTH2
  ENABLED = TRUE
  OAUTH_CLIENT_ID = 'your-client-id'
  OAUTH_CLIENT_SECRET = 'your-secret'
  OAUTH_TOKEN_ENDPOINT = 'https://your-idp.com/oauth/token'
  OAUTH_ALLOWED_SCOPES = ('session:role:MY_ROLE');
```

### Programmatic Access Token (PAT)

Use least-privilege role to minimize risk if leaked.

## Permissions

Access to the MCP server does **not** grant access to tools. Grant separately:

```sql
-- Grant usage on the MCP server
GRANT USAGE ON MCP SERVER my_mcp_server TO ROLE analyst_role;

-- Grant usage on underlying objects (search service, semantic view, etc.)
GRANT USAGE ON CORTEX SEARCH SERVICE mydb.myschema.product_search_service TO ROLE analyst_role;
```

## Connecting MCP Clients

### Cortex Code CLI

```bash
cortex mcp add snowflake-mcp https://<account>.snowflakecomputing.com/api/v2/databases/<db>/schemas/<schema>/mcp-servers/<server>/sse --transport http
```

### Generic MCP Client Config

```json
{
  "mcpServers": {
    "snowflake": {
      "url": "https://<account>.snowflakecomputing.com/api/v2/databases/<db>/schemas/<schema>/mcp-servers/<server>/sse",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

## Manage MCP Servers

```sql
-- List
SHOW MCP SERVERS;

-- Describe
DESCRIBE MCP SERVER my_mcp_server;

-- Update (full replace)
CREATE OR REPLACE MCP SERVER my_mcp_server
FROM SPECIFICATION $$
tools:
  - name: "updated-tool"
    type: "SYSTEM_EXECUTE_SQL"
    description: "Updated SQL tool"
    title: "SQL Tool"
$$;

-- Drop
DROP MCP SERVER my_mcp_server;
```

## Security Recommendations

- Use hyphens (`-`) not underscores (`_`) in hostnames — underscores cause connection issues
- Verify all third-party MCP servers and their tools before connecting
- Prefer OAuth over hardcoded tokens
- For PATs, use the least-privileged role
- Grant tool-level permissions individually (MCP server access alone is not enough)
- Audit MCP server tools from untrusted sources to avoid tool poisoning or shadowing

## Lifecycle

MCP servers follow standard Snowflake object lifecycle: create, alter, describe, show, drop. They live in a database and schema, and are governed by RBAC like any other Snowflake object.
