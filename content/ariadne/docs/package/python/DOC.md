---
name: package
description: "Ariadne package guide for Python GraphQL servers using SDL schemas, resolvers, and ASGI or WSGI apps"
metadata:
  languages: "python"
  versions: "0.29.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "ariadne,graphql,python,asgi,wsgi,starlette"
---

# Ariadne Python Package Guide

## Golden Rule

Use Ariadne as a schema-first GraphQL server library: define your schema in GraphQL SDL, bind resolvers with `QueryType` and `MutationType`, build the schema with `make_executable_schema`, then expose it through Ariadne's ASGI or WSGI `GraphQL` app.

## Install

Pin the package version your project expects. These examples target `ariadne==0.29.0`.

```bash
python -m pip install "ariadne==0.29.0"
python -m pip install "uvicorn[standard]"
```

If you are mounting Ariadne inside an existing framework app, also install that framework normally, for example:

```bash
python -m pip install fastapi
python -m pip install starlette
```

## Minimal ASGI Server

Example application config:

```bash
export ARIADNE_DEBUG=1
export PORT=8000
```

Create `app.py`:

```python
import os

from ariadne import MutationType, QueryType, gql, make_executable_schema
from ariadne.asgi import GraphQL

type_defs = gql(
    """
    type Query {
        hello(name: String): String!
        viewer: String!
    }

    type Mutation {
        createMessage(text: String!): Message!
    }

    type Message {
        id: ID!
        text: String!
    }
    """
)

query = QueryType()
mutation = MutationType()
messages = []


@query.field("hello")
def resolve_hello(_, info, name=None):
    return f"Hello, {name or 'world'}!"


@query.field("viewer")
def resolve_viewer(_, info):
    return info.context.get("user_id") or "anonymous"


@mutation.field("createMessage")
def resolve_create_message(_, info, text):
    message = {"id": str(len(messages) + 1), "text": text}
    messages.append(message)
    return message


async def context_value(request, data):
    return {
        "request": request,
        "user_id": request.headers.get("x-user-id"),
    }


schema = make_executable_schema(type_defs, query, mutation)

app = GraphQL(
    schema,
    context_value=context_value,
    debug=os.getenv("ARIADNE_DEBUG", "") == "1",
)
```

Run it with Uvicorn:

```bash
uvicorn app:app --host 127.0.0.1 --port "${PORT:-8000}" --reload
```

Send a query:

```bash
curl "http://127.0.0.1:${PORT:-8000}/" \
  -H "content-type: application/json" \
  -H "x-user-id: user-123" \
  --data '{"query":"query($name: String){ hello(name: $name) viewer }","variables":{"name":"Ada"}}'
```

Send a mutation:

```bash
curl "http://127.0.0.1:${PORT:-8000}/" \
  -H "content-type: application/json" \
  -H "x-user-id: user-123" \
  --data '{"query":"mutation { createMessage(text: \"ship docs\") { id text } }"}'
```

## Mount Ariadne Inside An Existing ASGI App

If your project already uses FastAPI or Starlette, mount Ariadne under a subpath instead of serving it at `/`.

FastAPI:

```python
from fastapi import FastAPI

from ariadne.asgi import GraphQL

app = FastAPI()
app.mount("/graphql", GraphQL(schema, context_value=context_value, debug=False))
```

Starlette:

```python
from starlette.applications import Starlette
from starlette.routing import Mount

from ariadne.asgi import GraphQL

app = Starlette(routes=[
    Mount("/graphql", GraphQL(schema, context_value=context_value, debug=False)),
])
```

After mounting, post GraphQL requests to `/graphql`, not `/`.

## WSGI App

For synchronous WSGI stacks, Ariadne also exposes a WSGI `GraphQL` app:

```python
from ariadne.wsgi import GraphQL

app = GraphQL(schema, debug=False)
```

Use the ASGI app for modern async frameworks and the WSGI app only when the rest of your deployment stack is WSGI.

## Context, Auth, And Request Data

Ariadne does not provide built-in authentication or secret management. Do auth in your framework layer, then pass request-scoped data through `context_value` and read it from `info.context` in resolvers.

Example pattern:

```python
from graphql import GraphQLError


@query.field("viewer")
def resolve_viewer(_, info):
    user_id = info.context.get("user_id")
    if not user_id:
        raise GraphQLError("Unauthorized")
    return user_id
```

Keep secrets such as database credentials, JWT keys, and third-party API keys in your app config or secret manager. Ariadne only receives the context object you pass in.

## Execute Queries In Tests Or Scripts

For unit tests and one-off scripts, execute GraphQL documents directly without starting an HTTP server:

```python
from ariadne import graphql_sync

success, result = graphql_sync(
    schema,
    {
        "query": "query($name: String){ hello(name: $name) viewer }",
        "variables": {"name": "Ada"},
    },
    context_value={"user_id": "test-user"},
    debug=True,
)

assert success is True
assert result["data"] == {
    "hello": "Hello, Ada!",
    "viewer": "test-user",
}
```

This is the easiest way to test resolver behavior and GraphQL result shapes without involving routing, middleware, or a live server.

## Common Pitfalls

- Resolver signatures start with `obj` and `info`, followed by GraphQL field arguments. Do not write a resolver that only accepts the field arguments.
- `debug=True` is a development setting. Turn it off in production so exception details are not exposed in GraphQL responses.
- Mount paths matter. A standalone `GraphQL(schema, ...)` app serves requests at its own root, while a mounted app serves requests under the mount path.
- Ariadne does not create database sessions, authenticate users, or load environment variables for you. Put those responsibilities in your framework or application layer.
- Keep your schema and resolver names aligned. When in doubt, bind resolvers explicitly instead of assuming name conversion between GraphQL fields and Python attributes.
