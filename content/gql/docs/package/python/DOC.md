---
name: package
description: "gql GraphQL client for Python with HTTP and websocket transports, schema introspection, and subscriptions"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "gql,graphql,python,http,websocket,subscriptions"
---

# gql for Python

`gql` is a Python GraphQL client built around two pieces:

- `gql(...)` parses a GraphQL document string.
- `Client(...)` executes that document through a transport such as HTTP or WebSocket.

Version `4.0.0` requires Python `>=3.8.1` and keeps transport dependencies optional, so install the extra that matches the transport you plan to use.

## Install

Install only the transport dependencies you need:

```bash
python -m pip install "gql[aiohttp]"
python -m pip install "gql[requests]"
python -m pip install "gql[httpx]"
python -m pip install "gql[websockets]"
```

Or install everything:

```bash
python -m pip install "gql[all]"
```

Typical environment variables:

```bash
export GRAPHQL_URL="https://api.example.com/graphql"
export GRAPHQL_WS_URL="wss://api.example.com/graphql"
export GRAPHQL_TOKEN="your-token"
```

## Async HTTP workflow

`AIOHTTPTransport` is the common choice in async applications. Pass auth and any custom headers directly to the transport.

```python
import asyncio
import os

from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport


async def main() -> None:
    transport = AIOHTTPTransport(
        url=os.environ["GRAPHQL_URL"],
        headers={"Authorization": f"Bearer {os.environ['GRAPHQL_TOKEN']}"},
    )

    client = Client(
        transport=transport,
        fetch_schema_from_transport=True,
    )

    query = gql(
        """
        query GetViewer {
          viewer {
            id
            login
          }
        }
        """
    )

    async with client as session:
        result = await session.execute(query)
        print(result["viewer"]["id"])
        print(result["viewer"]["login"])


asyncio.run(main())
```

Use `fetch_schema_from_transport=True` when the server allows introspection and you want local query validation. If your API disables introspection, leave it off and execute requests without schema fetching.

## Sync HTTP workflow

For normal synchronous scripts, use a sync transport such as `RequestsHTTPTransport` and keep the session open with `with client as session:` when sending multiple operations.

```python
import os

from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport


transport = RequestsHTTPTransport(
    url=os.environ["GRAPHQL_URL"],
    headers={"Authorization": f"Bearer {os.environ['GRAPHQL_TOKEN']}"},
    timeout=30,
    retries=3,
)

client = Client(
    transport=transport,
    fetch_schema_from_transport=True,
)

query = gql(
    """
    query GetViewer {
      viewer {
        id
        login
      }
    }
    """
)

with client as session:
    result = session.execute(query)
    print(result["viewer"]["login"])
```

`client.execute(query)` also exists as a convenience wrapper, but the explicit session form is easier to reuse across multiple requests.

## Read GraphQL errors and extensions

By default, `execute(...)` returns only the GraphQL `data` object. If the server returns GraphQL errors, `gql` raises `TransportQueryError`.

Use `get_execution_result=True` when you need the full `ExecutionResult`, including `extensions`:

```python
from gql.transport.exceptions import TransportQueryError


async with client as session:
    try:
        execution_result = await session.execute(
            query,
            get_execution_result=True,
        )
    except TransportQueryError as exc:
        print(exc.errors)
        print(exc.data)
    else:
        print(execution_result.data)
        print(execution_result.extensions)
```

This is the right pattern when your API uses GraphQL `extensions` for tracing, rate-limit metadata, or other out-of-band fields.

## Subscribe over WebSocket

Use `WebsocketsTransport` for GraphQL subscriptions. Some servers authenticate with HTTP headers, while others expect auth in the `connection_init` payload, exposed here as `init_payload`.

```python
import asyncio
import os

from gql import Client, gql
from gql.transport.websockets import WebsocketsTransport


async def main() -> None:
    transport = WebsocketsTransport(
        url=os.environ["GRAPHQL_WS_URL"],
        headers={"Authorization": f"Bearer {os.environ['GRAPHQL_TOKEN']}"},
        init_payload={"Authorization": f"Bearer {os.environ['GRAPHQL_TOKEN']}"},
    )

    client = Client(transport=transport)

    subscription = gql(
        """
        subscription OnMessageAdded {
          messageAdded {
            id
            body
          }
        }
        """
    )

    async with client as session:
        async for event in session.subscribe(subscription):
            print(event["messageAdded"]["id"])
            print(event["messageAdded"]["body"])


asyncio.run(main())
```

If your server only accepts one auth mechanism, remove the other. The package supports connection parameters such as `ack_timeout`, `keep_alive_timeout`, `ping_interval`, and `pong_timeout` when you need to tune long-lived subscriptions.

## Custom scalars and local parsing

If you have a schema available and need custom scalar or enum handling, enable variable serialization and result parsing on the client:

```python
client = Client(
    transport=transport,
    fetch_schema_from_transport=True,
    serialize_variables=True,
    parse_results=True,
)
```

These options are only useful when `gql` has schema information, either from `fetch_schema_from_transport=True`, a provided `schema=...`, or a provided `introspection=...`.

## Common pitfalls

- Install the right extra for your transport. `gql` itself does not vendor `aiohttp`, `requests`, `httpx`, or `websockets`.
- If an asyncio event loop is already running, do not call the sync convenience APIs such as `client.execute(...)` or `client.subscribe(...)`. Use `async with client as session:` and `await session.execute(...)` instead.
- `fetch_schema_from_transport=True` depends on GraphQL introspection. It will fail against servers that disable introspection.
- `execute(...)` returns `data` by default and raises `TransportQueryError` for GraphQL errors. Ask for `get_execution_result=True` when you need `extensions`.
- WebSocket auth is server-specific. Some APIs require headers, some require `init_payload`, and some require both.
- Reuse a client session for multiple operations instead of creating a new connection per request.
