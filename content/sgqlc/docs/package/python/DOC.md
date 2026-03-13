---
name: package
description: "sgqlc GraphQL client for Python with typed operations, HTTP endpoints, schema introspection, and code generation"
metadata:
  languages: "python"
  versions: "18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "sgqlc,graphql,python,codegen,http,client"
---

# sgqlc for Python

`sgqlc` is a Python GraphQL client built around three core pieces:

- `sgqlc.endpoint.http.HTTPEndpoint` to send GraphQL requests over HTTP.
- `sgqlc.operation.Operation` to build GraphQL queries and mutations in Python.
- the introspection/codegen tools to generate Python types from a server schema.

For application code, the most maintainable setup is:

1. introspect the remote schema once
2. generate a Python schema module
3. build operations with `Operation(...)`
4. execute them through `HTTPEndpoint`

## Install

```bash
pip install sgqlc
```

Set the GraphQL endpoint and any auth token in environment variables:

```bash
export GRAPHQL_URL="https://api.github.com/graphql"
export GRAPHQL_TOKEN="your-token"
```

`sgqlc` does not manage auth for you. Pass the headers your API expects when you create the endpoint.

## Generate Python types from a GraphQL schema

If your API exposes GraphQL introspection, generate a local schema module first.

```bash
sgqlc-introspection \
  -H "Authorization: bearer ${GRAPHQL_TOKEN}" \
  "${GRAPHQL_URL}" \
  schema.json

sgqlc-codegen schema schema.json schema.py
```

This gives you a `schema.py` module with Python classes for your GraphQL types, including `Query`, `Mutation`, and any object types your server exposes.

Keep the generated file checked in if your app depends on a stable server schema. Regenerate it whenever the upstream GraphQL schema changes.

## Initialize an HTTP endpoint

Use `HTTPEndpoint` for normal HTTP-based GraphQL APIs:

```python
import os

from sgqlc.endpoint.http import HTTPEndpoint


GRAPHQL_URL = os.environ["GRAPHQL_URL"]
GRAPHQL_TOKEN = os.environ["GRAPHQL_TOKEN"]

endpoint = HTTPEndpoint(
    GRAPHQL_URL,
    {
        "Authorization": f"bearer {GRAPHQL_TOKEN}",
    },
)
```

The second argument is the default header mapping for every request sent through that endpoint.

## Build and execute a typed query

After generating `schema.py`, import it and build operations from the generated root types.

```python
import os

from sgqlc.endpoint.http import HTTPEndpoint
from sgqlc.operation import Operation

import schema


endpoint = HTTPEndpoint(
    os.environ["GRAPHQL_URL"],
    {"Authorization": f"bearer {os.environ['GRAPHQL_TOKEN']}"},
)

op = Operation(schema.Query)
repository = op.repository(owner="octocat", name="Hello-World")
repository.id()
repository.name()
repository.description()

owner = repository.owner()
owner.login()

issues = repository.issues(first=5)
nodes = issues.nodes()
nodes.number()
nodes.title()

data = endpoint(op)

if data.get("errors"):
    raise RuntimeError(data["errors"])

result = op + data

print(result.repository.name)
print(result.repository.owner.login)
for issue in result.repository.issues.nodes:
    print(issue.number, issue.title)
```

Key points:

- Only the fields you select are requested. If you do not call `repository.description()` or `owner.login()`, those values will not be present in the result.
- `endpoint(op)` returns the decoded GraphQL JSON payload.
- `op + data` maps that payload back into typed Python objects based on the selections in the operation.

## Execute a raw query string

If you do not want typed response objects yet, you can send a raw GraphQL document and work with the JSON response directly:

```python
import os

from sgqlc.endpoint.http import HTTPEndpoint


endpoint = HTTPEndpoint(
    os.environ["GRAPHQL_URL"],
    {"Authorization": f"bearer {os.environ['GRAPHQL_TOKEN']}"},
)

query = '''
query Repository($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    id
    name
    owner {
      login
    }
  }
}
'''

data = endpoint(
    query,
    variables={"owner": "octocat", "name": "Hello-World"},
)

if data.get("errors"):
    raise RuntimeError(data["errors"])

print(data["data"]["repository"]["name"])
print(data["data"]["repository"]["owner"]["login"])
```

This is useful for quick scripts, but you lose the typed-object mapping that makes `sgqlc` most valuable in larger codebases.

## Generate Python operations from `.gql` files

If you keep GraphQL documents in source control, generate Python wrappers for them instead of constructing every operation inline.

```bash
sgqlc-codegen operation schema schema.py repo_query.gql repo_query.py
```

That workflow is useful when:

- your team already keeps queries and fragments in `.gql` files
- you want code review on the exact GraphQL document text
- you want schema-aware generated Python code without rebuilding selections in application code

## Common workflow for a new API

```bash
pip install sgqlc

export GRAPHQL_URL="https://your-graphql-server.example/graphql"
export GRAPHQL_TOKEN="your-token"

sgqlc-introspection \
  -H "Authorization: bearer ${GRAPHQL_TOKEN}" \
  "${GRAPHQL_URL}" \
  schema.json

sgqlc-codegen schema schema.json schema.py
```

Then in application code:

```python
from sgqlc.endpoint.http import HTTPEndpoint
from sgqlc.operation import Operation

import os
import schema


endpoint = HTTPEndpoint(
    os.environ["GRAPHQL_URL"],
    {"Authorization": f"bearer {os.environ['GRAPHQL_TOKEN']}"},
)

op = Operation(schema.Query)
viewer = op.viewer()
viewer.login()

data = endpoint(op)

if data.get("errors"):
    raise RuntimeError(data["errors"])

result = op + data
print(result.viewer.login)
```

Adapt the root field names and arguments to your own schema.

## Pitfalls

- `sgqlc` is schema-driven. If the generated schema is stale, your selections can drift from the server and fail at runtime.
- GraphQL APIs often return HTTP 200 with an `errors` array. Check `data.get("errors")` before assuming the response succeeded.
- Auth is just HTTP headers. If your API requires bearer tokens, API keys, cookies, or custom headers, pass them explicitly in `HTTPEndpoint(...)`.
- Typed results only contain the fields you selected in the operation. Missing fields usually mean they were never requested.
- Regenerate `schema.py` after server-side schema changes, especially before adding new fields, arguments, or mutations.

## When to use inline operations vs generated operation modules

Use inline `Operation(...)` code when:

- the query is small and local to one call site
- you want normal Python control flow around field selection

Use generated operation modules when:

- queries are shared across modules
- you already keep GraphQL documents in `.gql` files
- you want application code to import a generated operation instead of rebuilding it
