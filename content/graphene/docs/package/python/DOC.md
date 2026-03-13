---
name: package
description: "Graphene GraphQL framework for Python with schema types, queries, mutations, context passing, and subscriptions"
metadata:
  languages: "python"
  versions: "3.4.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "graphene,graphql,python,schema,mutation,subscription"
---

# Graphene for Python

`graphene` is a Python library for defining a GraphQL schema in Python and executing GraphQL operations against it. In Graphene 3, the core workflow is:

1. define `graphene.ObjectType` classes for your schema
2. create a `graphene.Schema`
3. execute queries or mutations with `schema.execute()` or `await schema.execute_async()`
4. expose that schema through your web framework or GraphQL server integration

Graphene itself is the schema and execution layer. It does not provide HTTP routing, authentication, or deployment primitives.

## Install

Install the package directly:

```bash
pip install graphene==3.4.3
```

Graphene installs its GraphQL runtime dependencies automatically.

If you need framework integrations, add those separately. The Graphene project documents companion packages such as `graphene-django` and `graphene-sqlalchemy`.

## Configuration and request context

Graphene does not require environment variables, API keys, or client initialization.

In a real app, you usually keep app-specific settings in your own environment and pass request-scoped values into Graphene through `context_value`.

Example application environment:

```bash
export DATABASE_URL="postgresql://app:secret@localhost:5432/app"
export APP_ENV="development"
```

Those values are for your app or framework, not for Graphene itself.

To make request state available to resolvers, use `graphene.Context` or pass any object as `context_value`:

```python
from graphene import Context

context = Context(
    request_id="req_123",
    current_user={"id": "u_1", "email": "ada@example.com"},
)
```

Resolvers can then read `info.context.request_id`, `info.context.current_user`, or any other attributes you put there.

## Define a schema

Use `graphene.ObjectType` classes for root query types and object types returned by fields.

```python
import graphene


class User(graphene.ObjectType):
    id = graphene.ID(required=True)
    email = graphene.String(required=True)


class Query(graphene.ObjectType):
    hello = graphene.String(name=graphene.String(default_value="world"))
    user = graphene.Field(User, id=graphene.ID(required=True))

    def resolve_hello(root, info, name):
        return f"Hello, {name}!"

    def resolve_user(root, info, id):
        if info.context.current_user["id"] != id:
            return None

        return {"id": id, "email": info.context.current_user["email"]}


schema = graphene.Schema(query=Query)
```

Important behavior:

- Define resolvers with the `resolve_<field_name>` naming pattern.
- Graphene maps Python `snake_case` field names to GraphQL `camelCase` by default.
- If you do not write a resolver, Graphene's default resolver reads matching attributes or dictionary keys from the returned object.

## Execute a query

`Schema.execute()` runs a GraphQL operation synchronously and returns an `ExecutionResult` with `.data` and `.errors`.

```python
from graphene import Context


query = """
query GetUser($id: ID!, $name: String!) {
  hello(name: $name)
  user(id: $id) {
    id
    email
  }
}
"""

result = schema.execute(
    query,
    variable_values={"id": "u_1", "name": "Ada"},
    context_value=Context(
        request_id="req_123",
        current_user={"id": "u_1", "email": "ada@example.com"},
    ),
)

if result.errors:
    raise RuntimeError(result.errors)

print(result.data)
```

Expected result shape:

```python
{
    "hello": "Hello, Ada!",
    "user": {
        "id": "u_1",
        "email": "ada@example.com",
    },
}
```

## Add mutations

Define mutations by subclassing `graphene.Mutation`, declaring an inner `Arguments` class, and mounting the mutation with `.Field()` on a root mutation type.

```python
import graphene


class User(graphene.ObjectType):
    id = graphene.ID(required=True)
    email = graphene.String(required=True)


class CreateUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)

    ok = graphene.Boolean(required=True)
    user = graphene.Field(User)

    def mutate(root, info, email):
        user = {"id": "u_2", "email": email}
        return CreateUser(ok=True, user=user)


class Query(graphene.ObjectType):
    health = graphene.String()

    def resolve_health(root, info):
        return "ok"


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)

result = schema.execute(
    """
    mutation CreateUser($email: String!) {
      createUser(email: $email) {
        ok
        user {
          id
          email
        }
      }
    }
    """,
    variable_values={"email": "new@example.com"},
)

if result.errors:
    raise RuntimeError(result.errors)

print(result.data["createUser"]["user"]["email"])
```

Two common patterns are supported:

- return fields directly from the mutation class, as shown above
- set `Output = SomeObjectType` if you want the mutation to return an existing Graphene object type directly

Every mutation class must define `mutate(...)`.

## Async execution

Use `await schema.execute_async(...)` when your integration is async or when resolvers depend on async work.

```python
import graphene


class Query(graphene.ObjectType):
    hello = graphene.String()

    async def resolve_hello(root, info):
        return "Hello from async Graphene"


schema = graphene.Schema(query=Query)

result = await schema.execute_async("{ hello }")

if result.errors:
    raise RuntimeError(result.errors)

print(result.data["hello"])
```

The async API is the same shape as `execute()`, but it uses GraphQL-core's async execution path.

## Subscriptions

Graphene 3 supports subscriptions through `Schema.subscribe(...)`. Define a root subscription type and add `subscribe_<field_name>` methods that yield values.

```python
import asyncio
import graphene


class Query(graphene.ObjectType):
    health = graphene.String()

    def resolve_health(root, info):
        return "ok"


class Subscription(graphene.ObjectType):
    count_upwards = graphene.Field(graphene.Int, limit=graphene.Int(required=True))

    async def subscribe_count_upwards(root, info, limit):
        for count in range(1, limit + 1):
            yield count
            await asyncio.sleep(0)


schema = graphene.Schema(query=Query, subscription=Subscription)

stream = await schema.subscribe(
    "subscription CountUpwards($limit: Int!) { countUpwards(limit: $limit) }",
    variable_values={"limit": 3},
)

if getattr(stream, "errors", None):
    raise RuntimeError(stream.errors)

async for item in stream:
    print(item.data["countUpwards"])
```

If the subscription query fails parsing or validation, `schema.subscribe()` returns an `ExecutionResult` with errors instead of a stream.

## Schema output and introspection

Graphene exposes a few useful schema-level helpers:

```python
print(schema)
introspection = schema.introspect()
user_type = schema.User
```

Use these when you need the generated SDL, introspection output, or access to a type already registered in the schema.

## Common pitfalls

- `query=` is not optional in practice. A schema without a query root cannot execute queries.
- Field names are camel-cased on the GraphQL side by default, so `create_user` becomes `createUser` and `count_upwards` becomes `countUpwards`.
- If you need to keep GraphQL names in `snake_case`, build the schema with `graphene.Schema(..., auto_camelcase=False)`.
- Graphene is not an HTTP server. Mount the schema inside Django, Starlette, Flask, or another integration layer yourself.
- Use `context_value` to pass request-scoped auth, dataloaders, and services to resolvers. Graphene does not implement auth for you.

## Minimal starting point

This is the smallest useful Graphene application shape for a Python service:

```python
import graphene
from graphene import Context


class Query(graphene.ObjectType):
    hello = graphene.String(name=graphene.String(default_value="world"))

    def resolve_hello(root, info, name):
        return f"Hello, {name}!"


schema = graphene.Schema(query=Query)

result = schema.execute(
    "query SayHello($name: String!) { hello(name: $name) }",
    variable_values={"name": "Ada"},
    context_value=Context(request_id="req_123"),
)

if result.errors:
    raise RuntimeError(result.errors)

print(result.data["hello"])
```

Once that works, add a mutation root, request context, and your framework-specific HTTP integration.
