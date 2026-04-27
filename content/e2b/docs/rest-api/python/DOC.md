---
name: rest-api
description: "E2B - Code Execution Sandbox for AI Agents"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "e2b,sandbox,code-execution,ai-agents,cloud-sandbox,jupyter,api"
---

# E2B REST API Reference (Python / httpx)

E2B provides secure, isolated cloud sandboxes for running AI-generated code. The platform
exposes a REST API for sandbox lifecycle management and a gRPC protocol (envd) for runtime
operations inside sandboxes (file I/O, command execution). This document covers the REST API
surface using `httpx` as the HTTP client.

> **SDK vs REST:** E2B is SDK-primary. The recommended path for Python is `pip install e2b-code-interpreter`,
> which wraps both REST and gRPC protocols. Use the REST API directly only when you need
> low-level control or are in an environment where the SDK cannot be installed.

## Golden Rule

Always clean up sandboxes when done. Each sandbox is a running VM that consumes resources
and counts against your concurrent sandbox limit. Call `DELETE /sandboxes/{sandboxID}` or
use the SDK's `sandbox.kill()` to terminate sandboxes you no longer need.

## Installation

```bash
pip install httpx python-dotenv
# Or for the recommended SDK path:
pip install e2b-code-interpreter python-dotenv
```

## Base URL

```
https://api.e2b.app
```

Override via `E2B_API_URL` or `E2B_DOMAIN` environment variables for self-hosted deployments.

## Authentication

All REST API requests require the `X-API-Key` header. Get your key from the [E2B Dashboard](https://e2b.dev/dashboard).

```python
import os, httpx
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.e2b.app"
HEADERS = {"X-API-Key": os.environ["E2B_API_KEY"], "Content-Type": "application/json"}
```

### Two-Token Model

| Token | Header | Scope |
|-------|--------|-------|
| API Key | `X-API-Key` | REST API -- sandbox lifecycle, templates, team management |
| envd Access Token | `X-Access-Token` | gRPC (port 49983) -- file ops, command execution inside a sandbox |

The `envdAccessToken` is returned in the sandbox creation response.

## Rate Limiting

| Scope | Limit |
|-------|-------|
| Lifecycle & Management | 20,000 requests / 30 seconds |
| Sandbox Operations | 40,000 requests / 60 seconds per IP |
| Sandbox Creation (Hobby/Pro) | 1/sec or 5/sec |
| Concurrent Sandboxes (Hobby/Pro) | 20 or 100-1,100 |

HTTP `429 Too Many Requests` when rate-limited. Enterprise plans support custom limits.

## Methods

### Create Sandbox

```
POST /sandboxes
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateID` | string | No | Template to use (default: `base`) |
| `timeout` | integer | No | TTL in milliseconds (max: 3,600,000 Hobby / 86,400,000 Pro) |
| `metadata` | object | No | Key-value metadata |
| `envs` | object | No | Environment variables injected into the sandbox |

```python
async def create_sandbox(
    template_id: str = "base", timeout_ms: int = 300_000,
    metadata: dict | None = None, envs: dict | None = None,
) -> dict:
    payload = {"templateID": template_id, "timeout": timeout_ms}
    if metadata: payload["metadata"] = metadata
    if envs: payload["envs"] = envs
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS, timeout=60.0) as client:
        resp = await client.post("/sandboxes", json=payload)
        resp.raise_for_status()
        return resp.json()
    # Returns: {"sandboxID": "sb-abc123", "envdAccessToken": "...", "domain": "sb-abc123.e2b.app"}
```

### List Running Sandboxes

```python
async def list_sandboxes() -> list[dict]:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS, timeout=60.0) as client:
        resp = await client.get("/sandboxes")
        resp.raise_for_status()
        return resp.json()
```

### Kill (Delete) Sandbox

```python
async def kill_sandbox(sandbox_id: str) -> None:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS, timeout=60.0) as client:
        resp = await client.delete(f"/sandboxes/{sandbox_id}")
        resp.raise_for_status()
```

### Pause / Resume Sandbox

```python
async def pause_sandbox(sandbox_id: str) -> None:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS, timeout=60.0) as client:
        resp = await client.post(f"/sandboxes/{sandbox_id}/pause")
        resp.raise_for_status()

async def connect_sandbox(sandbox_id: str, timeout_ms: int = 300_000) -> dict:
    """Connect to (and resume if paused) a sandbox. Returns fresh envdAccessToken."""
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS, timeout=60.0) as client:
        resp = await client.post(f"/sandboxes/{sandbox_id}/connect", json={"timeout": timeout_ms})
        resp.raise_for_status()
        return resp.json()
```

Additional REST endpoints: `GET /sandboxes/{id}` (details), `POST /sandboxes/{id}/timeout` (set TTL),
`POST /sandboxes/{id}/refreshes` (keep-alive), `POST /sandboxes/{id}/snapshots`, `GET /templates`, `GET /snapshots`.

## Code Execution (SDK Recommended)

Runtime operations (executing code, file I/O, shell commands) use the gRPC/envd protocol and are best accessed through the SDK.

```python
from e2b_code_interpreter import Sandbox

sbx = Sandbox.create()
execution = sbx.run_code("print('Hello from E2B!')")
print(execution.logs)

sbx.files.write("/home/user/hello.txt", "Hello, World!")
result = sbx.commands.run("ls -la /home/user")
print(result.stdout)

sbx.kill()
```

### Async SDK Usage

```python
from e2b_code_interpreter import AsyncSandbox

async def run_code_example():
    sbx = await AsyncSandbox.create()
    try:
        execution = await sbx.run_code("import sys; print(sys.version)")
        print(execution.logs)
    finally:
        await sbx.kill()
```

## Error Handling

| Code | Meaning |
|------|---------|
| 200/201 | Success |
| 204 | No Content (successful delete) |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- invalid or missing API key |
| 404 | Not Found -- sandbox/template does not exist |
| 409 | Conflict -- resource state conflict |
| 429 | Too Many Requests -- rate limit exceeded |
| 500 | Internal Server Error |

All error responses return JSON with `code` (int) and `message` (string) fields.

```python
async def safe_create_sandbox(template_id: str = "base") -> dict | None:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=HEADERS, timeout=60.0) as client:
        try:
            resp = await client.post("/sandboxes", json={"templateID": template_id, "timeout": 300_000})
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            body = e.response.json() if "application/json" in e.response.headers.get("content-type", "") else {}
            msg = body.get("message", e.response.text)
            raise RuntimeError(f"E2B API error {e.response.status_code}: {msg}") from e
        except httpx.TimeoutException:
            raise RuntimeError("Request to E2B API timed out")
        except httpx.RequestError as e:
            raise RuntimeError(f"Network error contacting E2B: {e}") from e
```

## Common Pitfalls

1. **Forgetting to kill sandboxes.** Every sandbox is a running VM. Leaked sandboxes consume resources. Always use try/finally or context managers.
2. **Confusing REST and gRPC scope.** The REST API handles lifecycle only (create, pause, kill, list). Code execution and file ops go through gRPC/envd on port 49983.
3. **Using the wrong token.** `X-API-Key` authenticates REST requests. `envdAccessToken` authenticates gRPC connections. Do not mix them.
4. **Timeout units.** The REST API expects timeouts in **milliseconds**, not seconds. 5 minutes = `300000`.
5. **Hobby tier creation rate.** Hobby plans allow only 1 sandbox/sec. Use `asyncio.sleep(1)` between batch creation calls.
6. **Sandbox expiration.** Max TTL is 1 hour (Hobby) or 24 hours (Pro). Use refreshes or pause to preserve state.
7. **Not using the SDK for runtime ops.** The gRPC/envd protocol requires Protocol Buffer serialization. Use `e2b-code-interpreter` for code execution and file operations.
8. **Missing error body parsing.** Always parse the JSON body on errors for `code` and `message` fields rather than relying only on HTTP status.
