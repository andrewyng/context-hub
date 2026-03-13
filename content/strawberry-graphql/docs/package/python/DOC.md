---
name: package
description: "Strawberry package guide for Python GraphQL schemas, resolvers, mutations, and ASGI or FastAPI integration"
metadata:
  languages: "python"
  versions: "0.311.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "strawberry,graphql,python,asgi,fastapi,api"
---

# Strawberry Python Package Guide

## What It Is

Strawberry is a Python GraphQL library that builds a schema from Python type hints and decorators. Use it when you want a code-first GraphQL API with explicit object types, input types, sync or async resolvers, and framework integrations such as ASGI and FastAPI.

## Install

Install the core package and an ASGI server:

```bash
python -m venv .venv
source .venv/bin/activate
pip install "strawberry-graphql==0.311.1" "uvicorn[standard]"
```

If you are mounting Strawberry inside FastAPI, install the FastAPI extra as well:

```bash
pip install "strawberry-graphql[fastapi]==0.311.1" fastapi
```

Strawberry does not require a package-specific API key or environment variable. Keep app settings such as host, port, debug mode, and auth secrets in your framework config or `.env` file.

Example local environment:

```bash
export HOST=127.0.0.1
export PORT=8000
export RELOAD=true
```

## Minimal ASGI App

This is the smallest useful Strawberry app: define a query type, build a schema, and expose it as an ASGI application.

```python
import os

import strawberry
from strawberry.asgi import GraphQL


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, world!"


schema = strawberry.Schema(query=Query)
graphql_app = GraphQL(schema)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:graphql_app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "").lower() == "true",
    )
```

You can also run the same app from the shell:

```bash
uvicorn app:graphql_app --host "$HOST" --port "$PORT" --reload
```

Send a GraphQL request with a normal HTTP POST:

```python
import os

import requests


response = requests.post(
    f"http://{os.getenv('HOST', '127.0.0.1')}:{os.getenv('PORT', '8000')}",
    json={"query": "{ hello }"},
    timeout=30,
)

print(response.json())
```

## Define Types And Fields

Strawberry uses decorators plus type hints to generate the GraphQL schema. Use `@strawberry.type` for output objects and `@strawberry.field` for resolver-backed fields.

```python
import strawberry
from strawberry.types import Info


@strawberry.type
class User:
    id: strawberry.ID
    name: str


USERS = {
    "1": User(id="1", name="Ada"),
    "2": User(id="2", name="Linus"),
}


@strawberry.type
class Query:
    @strawberry.field
    def user(self, info: Info, id: strawberry.ID) -> User | None:
        return USERS.get(str(id))


schema = strawberry.Schema(query=Query)
```

Example query:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
  }
}
```

Variables:

```json
{
  "id": "1"
}
```

## Mutations And Input Types

Use `@strawberry.input` for GraphQL input objects and `@strawberry.mutation` for write operations.

```python
import strawberry


@strawberry.type
class User:
    id: strawberry.ID
    name: str


@strawberry.input
class CreateUserInput:
    name: str


USERS: dict[str, User] = {}


@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> list[User]:
        return list(USERS.values())


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, input: CreateUserInput) -> User:
        user_id = str(len(USERS) + 1)
        user = User(id=user_id, name=input.name)
        USERS[user_id] = user
        return user


schema = strawberry.Schema(query=Query, mutation=Mutation)
```

Example mutation:

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Grace"
  }
}
```

## Async Resolvers

Resolvers can be synchronous or asynchronous. Use `async def` when the resolver awaits database or network work.

```python
from datetime import datetime, timezone

import strawberry


@strawberry.type
class Query:
    @strawberry.field
    async def server_time(self) -> str:
        return datetime.now(timezone.utc).isoformat()


schema = strawberry.Schema(query=Query)
```

Keep blocking I/O out of async resolvers. If your database client or SDK is synchronous, either keep the resolver synchronous too or move the blocking call behind an executor or framework-specific background strategy.

## FastAPI Integration And Request Context

Use `GraphQLRouter` when Strawberry lives inside a FastAPI app. Put request-scoped auth and other per-request values into the GraphQL context instead of module globals.

```python
from fastapi import FastAPI, Request
import strawberry
from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info


@strawberry.type
class Query:
    @strawberry.field
    def viewer(self, info: Info) -> str:
        return info.context["user_id"] or "anonymous"


async def get_context(request: Request) -> dict[str, object]:
    auth_header = request.headers.get("authorization")
    user_id = None

    if auth_header and auth_header.startswith("Bearer "):
        user_id = auth_header.removeprefix("Bearer ").strip()

    return {
        "request": request,
        "user_id": user_id,
    }


schema = strawberry.Schema(query=Query)
graphql_router = GraphQLRouter(schema, context_getter=get_context)

app = FastAPI()
app.include_router(graphql_router, prefix="/graphql")
```

Call the mounted FastAPI endpoint with the same GraphQL JSON body format:

```python
import requests


response = requests.post(
    "http://127.0.0.1:8000/graphql",
    headers={"Authorization": "Bearer user-123"},
    json={"query": "{ viewer }"},
    timeout=30,
)

print(response.json())
```

## Common Pitfalls

- Install the matching integration extra before importing framework adapters such as `strawberry.fastapi`.
- Use `@strawberry.input` for mutation inputs. `@strawberry.type` defines output object types.
- Keep request data in `info.context` rather than using module-level globals for auth or tenant state.
- Treat Python type hints as part of the public GraphQL contract. Changing a field type changes the schema your clients see.
- Mount paths matter. If you include the router at `/graphql`, clients must post to `/graphql`, not `/`.
- Mix sync and async resolvers deliberately. Do not block the event loop inside `async def` resolvers.

## When To Reach For More Docs

The official Strawberry docs also cover subscriptions, schema configuration, framework-specific integrations, Django support, and testing patterns. Use those sections when you need features beyond a basic query or mutation API.
