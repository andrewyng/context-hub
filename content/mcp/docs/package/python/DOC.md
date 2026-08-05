---
name: package
description: "mcp package guide for Python MCP servers and clients with FastMCP, stdio, and Streamable HTTP"
metadata:
  languages: "python"
  versions: "1.27.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "mcp,model-context-protocol,python,fastmcp,server,client,stdio,streamable-http,oauth"
---

# mcp Python Package Guide

## What It Is

`mcp` is the official Python SDK for the Model Context Protocol. It supports both sides of the protocol:

- building MCP servers with the higher-level `FastMCP` API
- building MCP clients with `ClientSession`
- using local `stdio` transport or networked Streamable HTTP transport
- adding OAuth-based authorization for remote servers when needed

For most server work, start with `FastMCP`. Drop down to the low-level server APIs only if you need custom lifecycle control or nonstandard transports.

## Installation

Install the exact version covered here:

```bash
pip install mcp==1.27.2
```

Common package-manager equivalents:

```bash
uv add mcp==1.27.2
poetry add mcp==1.27.2
```

If you are writing both server and client code in the same project, the base package is usually enough. Add web-framework or auth dependencies separately only when your server integration needs them.

## Choose The Right Abstraction

### FastMCP for most servers

Use `FastMCP` when you want to expose tools, resources, and prompts without handling the protocol framing yourself.

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("demo")

@mcp.tool()
def add(a: int, b: int) -> int:
    return a + b

@mcp.resource("config://app")
def app_config() -> str:
    return '{"mode":"demo"}'

if __name__ == "__main__":
    mcp.run()
```

This is the default path for local tool servers launched by an MCP host over `stdio`.

### Low-level server/client APIs for advanced control

Use the lower-level SDK only if you need behavior that `FastMCP` does not cover cleanly, such as custom transport handling or tight control over request/session flow.

## Core Server Usage

### Local server over stdio

The simplest production shape for a local MCP server is:

1. define a `FastMCP` app
2. register tools/resources/prompts with decorators
3. call `mcp.run()` in `__main__`

That gives you a server that MCP hosts can spawn as a subprocess and communicate with over standard input/output.

### Remote server over Streamable HTTP

For network-accessible servers, run FastMCP with the current HTTP transport:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "demo-http",
    host="0.0.0.0",
    port=8000,
    path="/mcp",
)

@mcp.tool()
def add(a: int, b: int) -> int:
    return a + b

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

Use the exact path your server exposes. If the server runs on `http://localhost:8000/mcp`, the client must connect to that full URL, not just the host root.

### Tools, resources, and prompts

The FastMCP model is:

- `@mcp.tool()` for executable functions
- `@mcp.resource(...)` for named content endpoints
- `@mcp.prompt()` for reusable prompt templates

Keep tool functions small and deterministic when possible. MCP hosts often surface tool descriptions and signatures directly to models, so precise names, docstrings, and parameter types matter.

## Core Client Usage

### Connect to a local stdio server

The standard local client flow is:

```python
import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
    command="python",
    args=["server.py"],
)

async def main() -> None:
    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

            tools = await session.list_tools()
            print([tool.name for tool in tools.tools])

            result = await session.call_tool("add", {"a": 2, "b": 3})
            print(result)

asyncio.run(main())
```

Critical step: always call `await session.initialize()` before trying to list tools, read resources, or call prompts/tools.

### Connect to a remote HTTP server

For remote servers, use the matching Streamable HTTP client transport from the SDK rather than trying to hand-roll protocol requests. Keep the transport context manager and `ClientSession` lifetime aligned so streams are closed cleanly.

### Sync client support

The SDK also provides sync-client support. Prefer the async APIs unless you have a hard requirement to stay synchronous, because most MCP integrations are transport- and session-oriented already.

## Configuration And Auth

### Local stdio servers

Local subprocess servers usually do not need protocol-level auth. Focus on:

- the correct executable in `command`
- the correct script/module path in `args`
- any environment variables the child process needs

If your server depends on secrets or configuration, pass them through the process environment instead of hardcoding them into the tool logic.

### Remote HTTP servers

For remote deployments, the SDK supports authorization flows for Streamable HTTP servers and clients. The maintainer docs describe:

- server-side auth integration for FastMCP
- token verification helpers
- OAuth provider support on the client side
- bearer-token based auth for simpler cases

### Request timeout

For long-running server requests, the Python SDK documents an `MCP_SERVER_REQUEST_TIMEOUT` environment variable. If you have tools that legitimately run longer than the default, set this explicitly in the server environment rather than leaving timeouts implicit.

## Common Patterns

### Expose a tool

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("math")

@mcp.tool()
def multiply(a: int, b: int) -> int:
    """Multiply two integers."""
    return a * b
```

### Expose a prompt

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("prompts")

@mcp.prompt()
def summarize_topic(topic: str) -> str:
    return f"Summarize {topic} in five bullet points."
```

### Launch a server process from a client

```python
from mcp import StdioServerParameters

server_params = StdioServerParameters(
    command="python",
    args=["server.py"],
)
```

This is the canonical pattern for testing a local server from Python without involving a separate MCP host application.

## Common Pitfalls

- Do not skip `session.initialize()`. The session is not ready until initialization completes.
- Do not use `FastMCP` and low-level server wiring in the same path unless you have a concrete reason. Pick one abstraction level.
- Do not point an HTTP client at the wrong path. If the server is mounted at `/mcp`, use that full URL.
- Do not copy older HTTP+SSE examples blindly. The current MCP transport guidance prefers Streamable HTTP.
- Do not leave tool signatures vague. Typed parameters and clear docstrings improve host-side tool discovery.
- Do not leak long-running work past session or transport shutdown. Keep async context managers scoped tightly.
- Do not assume local stdio and remote HTTP share the same operational concerns. Stdio is process-launch/config oriented; HTTP adds auth, routing, proxies, and deployment timeouts.

## Version-Sensitive Notes For 1.27.2

- PyPI is the authoritative source for the covered package version: `1.27.2`.
- PyPI metadata for `1.27.2` requires Python `>=3.10`.
- The `1.27.x` line adds streamable HTTP idle timeouts, RFC 8707 resource validation in the OAuth client, and binds transport sessions to authenticated principals. `AccessToken` now carries subject and claims.
- The docs and spec emphasize Streamable HTTP as the current HTTP transport. Older SSE-era examples are the most likely source of stale guidance when copying from blogs, gists, or older issue threads.
- The official docs root is not version-pinned to `1.27.2`. When a docs example and the package version appear to drift, trust PyPI for the released version and prefer the Python SDK repository examples over third-party material.

## Official Sources

- MCP docs root: https://modelcontextprotocol.io/docs/
- MCP authorization docs: https://modelcontextprotocol.io/docs/concepts/authorization
- MCP transport docs: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- Python SDK repository: https://github.com/modelcontextprotocol/python-sdk
- PyPI project page: https://pypi.org/project/mcp/
- PyPI release metadata for `1.27.2`: https://pypi.org/pypi/mcp/1.27.2/json
