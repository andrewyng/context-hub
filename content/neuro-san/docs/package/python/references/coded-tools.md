# Coded Tools Development Guide

## What Are Coded Tools?

Coded Tools are Python classes that execute deterministic logic within a neuro-san agent network. Use them when an agent needs to call APIs, query databases, perform calculations, or handle any task that should not be left to LLM interpretation.

## Interface

Implement the `CodedTool` class from `neuro_san.interfaces.coded_tool`:

```python
from typing import Any, Dict
from neuro_san.interfaces.coded_tool import CodedTool

class MyTool(CodedTool):

    async def async_invoke(self, args: Dict[str, Any], sly_data: Dict[str, Any]) -> Any:
        """
        :param args: Read-only dict of arguments populated by the calling LLM
                     based on the function.parameters schema in HOCON.
        :param sly_data: Private data dict kept out of LLM chat streams.
                         Largely read-only. Can add new keys as a bulletin board.
        :return: Value that goes into the chat stream as the tool's response.
        """
        result = args.get("query", "")
        return f"Processed: {result}"
```

Requirements:

- No-args constructor (the framework instantiates your class).
- Override `async_invoke()` (preferred) or `invoke()` (synchronous fallback).
- Return a value (string, dict, list) that goes back into the chat stream.

## Synchronous vs Asynchronous

**Always prefer `async_invoke()`** in production. The synchronous `invoke()` blocks the event loop and prevents concurrent request handling.

If your code must call blocking I/O, wrap it with `asyncio.to_thread()`:

```python
import asyncio
from neuro_san.interfaces.coded_tool import CodedTool

class BlockingApiTool(CodedTool):

    def _call_api(self, url):
        import requests
        return requests.get(url).json()

    async def async_invoke(self, args, sly_data):
        url = args.get("url")
        result = await asyncio.to_thread(self._call_api, url)
        return str(result)
```

## File Placement

Place coded tool files under the `AGENT_TOOL_PATH` directory (default: `coded_tools/`).

Directory structure:

```
coded_tools/
├── my_network/
│   ├── my_tool.py          # Contains MyTool class
│   └── another_tool.py     # Contains AnotherTool class
├── shared_tool.py           # Shared across networks (fallback lookup)
```

Resolution order for `"class": "my_tool.MyTool"` on agent named `my_network`:

1. `AGENT_TOOL_PATH/my_network/my_tool.py` → `MyTool`
2. `AGENT_TOOL_PATH/my_tool.py` → `MyTool` (shared fallback)

Or use a fully-qualified class name to bypass resolution:

```hocon
"class": "my_package.tools.my_tool.MyTool"
```

## HOCON Configuration

```hocon
{
    "name": "order_lookup",
    "function": {
        "description": "Looks up order status in the database.",
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "The order ID to look up"
                }
            },
            "required": ["order_id"]
        }
    },
    "class": "order_lookup.OrderLookup"
}
```

## Working with sly_data

Sly data is a private channel for sensitive information (credentials, tokens, intermediate results). It is never sent to LLMs.

Reading sly_data:

```python
async def async_invoke(self, args, sly_data):
    api_key = sly_data.get("api_key")
    user_id = sly_data.get("user_id")
    # Use for authenticated API calls
```

Writing to sly_data (adding new keys only):

```python
async def async_invoke(self, args, sly_data):
    result = await self._fetch_data(args)
    # Add new key for downstream agents
    sly_data["fetched_data_id"] = result["id"]
    return f"Found data: {result['summary']}"
```

Rules:

- Treat existing keys as read-only.
- Only add new keys that do not already exist.
- Ensure only one CodedTool writes a given key to avoid race conditions.

## Using args from HOCON

The `args` key in HOCON passes static configuration to your tool. The framework **merges these HOCON args into the same `args` dict passed to `async_invoke()`**, alongside the LLM-provided arguments:

```hocon
{
    "name": "weather_tool",
    "function": {
        "description": "Gets weather for a city.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
        }
    },
    "class": "weather.WeatherTool",
    "args": {
        "api_endpoint": "https://api.weather.example.com",
        "units": "metric"
    }
}
```

Inside `WeatherTool.async_invoke(args, sly_data)`, `args["city"]` is LLM-provided while `args["api_endpoint"]` and `args["units"]` come from HOCON. This lets a single CodedTool implementation be reused by multiple agents with different static config.

The same mechanism can also override arguments of LangChain tools referenced via `toolbox`.

## Example: Complete Coded Tool

HOCON (`registries/math_guy.hocon` excerpt):

```hocon
{
    "name": "calculator",
    "function": {
        "description": "Does arithmetic. Supports add, subtract, multiply, divide.",
        "parameters": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "description": "One of: add, subtract, multiply, divide"
                },
                "operand_a": {
                    "type": "float",
                    "description": "First operand"
                },
                "operand_b": {
                    "type": "float",
                    "description": "Second operand"
                }
            },
            "required": ["operation", "operand_a", "operand_b"]
        }
    },
    "class": "calculator.Calculator"
}
```

Python (`coded_tools/math_guy/calculator.py`):

```python
from typing import Any, Dict
from neuro_san.interfaces.coded_tool import CodedTool

class Calculator(CodedTool):

    async def async_invoke(self, args: Dict[str, Any], sly_data: Dict[str, Any]) -> Any:
        operation = args.get("operation", "")
        a = float(args.get("operand_a", 0))
        b = float(args.get("operand_b", 0))

        ops = {
            "add": a + b,
            "subtract": a - b,
            "multiply": a * b,
            "divide": a / b if b != 0 else "Error: division by zero",
        }

        result = ops.get(operation, f"Unknown operation: {operation}")
        return str(result)
```

## Calling Other Agents from a Coded Tool (BranchActivation)

A CodedTool that also subclasses `BranchActivation` can programmatically invoke other agents via its inherited `use_tool()` method. To keep these calls visible to validation and to the `Connectivity()` API, declare the callable agents under `args.tools` in HOCON. The keys are arbitrary role names your code uses to pick which agent to call; the values are agent name references.

HOCON (from the neuro-san-studio [`mdap_decomposer`](https://github.com/cognizant-ai-lab/neuro-san-studio/blob/main/registries/experimental/mdap_decomposer.hocon) example):

```hocon
{
    "name": "decomposition_solver",
    "class": "decomposition_solver.DecompositionSolver",
    "args": {
        "tools": {
            "decomposer": "decomposer",
            "solution_discriminator": "solution_discriminator",
            "problem_solver": "problem_solver",
            "composition_discriminator": "composition_discriminator"
        }
    }
}
```

Python:

```python
from neuro_san.interfaces.coded_tool import CodedTool
from neuro_san.internals.graph.activations.branch_activation import BranchActivation

class DecompositionSolver(BranchActivation, CodedTool):

    async def async_invoke(self, args, sly_data):
        tools = args.get("tools", {})
        # tools["decomposer"] resolves to the agent name "decomposer"
        # Call it via BranchActivation.use_tool(), or wrap it in a caller
        # (see neuro-san-studio's CodedToolAgentCaller for one pattern).
        ...
```

For the full implementation pattern, see neuro-san-studio's [`decomposition_solver.py`](https://github.com/cognizant-ai-lab/neuro-san-studio/blob/main/coded_tools/experimental/mdap_decomposer/decomposition_solver.py).

## Common Pitfalls

- Do not use `invoke()` for production. It blocks the async event loop. Use `async_invoke()`.
- Do not modify existing sly_data keys. Only add new ones.
- Do not forget the no-args constructor. The framework instantiates your class with no arguments (unless it subclasses `BranchActivation`).
- Do not assume args will always have all keys. Use `.get()` with defaults.
- Do not put a `class` key on the Front Man agent. Front Man cannot be a CodedTool.
- Do not perform heavy computation synchronously. Use `asyncio.to_thread()` for blocking operations.
- Do not use global state or singletons to work around the no-args constructor. CodedTools run in a multi-threaded async environment; share request-scoped state via `sly_data` instead.
