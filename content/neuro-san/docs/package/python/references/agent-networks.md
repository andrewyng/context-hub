# Agent Network HOCON Configuration Reference

## File Structure

Each agent network is a single `.hocon` file placed in the registries directory. HOCON is JSON with comments, multi-line strings, and syntactic sugar.

## Complete Agent Network Example

```hocon
{
    # Reusable values defined at the top of the file, referenced below
    # via standard HOCON substitutions (${var}).
    "default_llm_config": {
        "model_name": "gpt-5.2"
    },
    "support_instructions": """
You are the primary support agent for Acme Corp.
Route order issues to order_lookup and policy questions to policy_expert.
""",

    "metadata": {
        "description": "Customer support agent network",
        "tags": ["support", "customer"],
        "sample_queries": [
            "I need help with my order",
            "What is your return policy?"
        ]
    },

    "llm_config": ${default_llm_config},

    "tools": [
        # Front Man — entry point
        {
            "name": "support_agent",
            "function": {
                "description": "I help with customer support for Acme Corp."
            },
            "instructions": ${support_instructions},
            "tools": ["order_lookup", "policy_expert"]
        },

        # Branch agent — LLM-powered
        {
            "name": "policy_expert",
            "function": {
                "description": "Answers policy and FAQ questions.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "question": {
                            "type": "string",
                            "description": "The policy question to answer"
                        }
                    },
                    "required": ["question"]
                }
            },
            "instructions": "You are a policy expert for Acme Corp. Answer questions accurately.",
            "llm_config": {
                "model_name": "gpt-5.4-mini"
            }
        },

        # Coded Tool — Python implementation
        {
            "name": "order_lookup",
            "function": {
                "description": "Looks up order status by order ID.",
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
    ]
}
```

## Top-Level Keys

### llm_config

Default LLM settings for all agents in the network.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `model_name` | string | `"gpt-5.2"` | Model identifier |
| `temperature` | float | provider default | Randomness (0.0–1.0); many newer models ignore or reject it |
| `class` | string | — | Provider class or LangChain class path |
| `fallbacks` | list | — | Ordered list of fallback `llm_config` dicts |

Supported provider class values: `openai`, `anthropic`, `azure-openai`, `gemini`, `nvidia`, `ollama`, `openrouter`, `bedrock`, `anthropic-bedrock`. For Claude on AWS Bedrock prefer `anthropic-bedrock` (async, Anthropic SDK) over the legacy boto3-based `bedrock` class.

For custom providers, use the full LangChain class path:

```hocon
"class": "langchain_nvidia_ai_endpoints.chat_models.ChatNVIDIA"
```

### tools

Array of agent definitions. The first is always the Front Man.

### metadata

| Key | Type | Description |
|-----|------|-------------|
| `description` | string | Human-readable network description |
| `tags` | list | Grouping tags |
| `sample_queries` | list | Example queries for the network |

### Reusing Values (HOCON Substitutions)

To avoid repetition, prefer standard HOCON substitutions (`${var}`) — they are a built-in feature of the HOCON format (implemented in neuro-san by [pyhocon](https://github.com/chimpler/pyhocon)) and work for any value: scalars, dicts, lists.

Define reusable values at the top of the file and reference them as whole values elsewhere:

```hocon
{
    "default_llm_config": {
        "model_name": "gpt-5.2"
    },
    "query_params": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Input query"}
        },
        "required": ["query"]
    },

    "llm_config": ${default_llm_config},

    "tools": [
        {
            "name": "searcher",
            "function": {
                "description": "Search the web.",
                "parameters": ${query_params}
            },
            ...
        }
    ]
}
```

Other useful HOCON features for the same goal:

- **Environment variables** — `"api_endpoint": ${API_ENDPOINT}` reads from the process environment.
- **Optional substitution** — `"feature_flag": ${?ENABLE_FEATURE}` is silently dropped when the variable is missing instead of erroring.
- **`include`** — pull in shared HOCON files (e.g. `include "registries/shared_prompts.hocon"`) and reference their keys from any file that includes them. See the [neuro-san-studio user guide](https://github.com/cognizant-ai-lab/neuro-san-studio/blob/main/docs/user_guide.md) for the include + substitution pattern.

**Caveat:** HOCON substitutions are **not parsed inside quoted strings**. To interpolate within a string, concatenate with adjacent string literals: `"instructions": ${prefix} " main text " ${suffix}`. For most agent-network use cases, substituting the whole value (as in the example above) is cleaner.

A legacy `commondefs` block with `replacement_strings` / `replacement_values` keys is still recognized for backwards compatibility, but new networks should use HOCON substitutions.

### Other Top-Level Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `max_steps` | int | `10000` | LangGraph recursion-limit (super-step budget for the entire graph) |
| `max_iterations` | int | — | **Deprecated**. Use `max_steps`. |
| `max_execution_seconds` | int | `300` | Wall-clock timeout per agent (5 minutes) |
| `max_attempts` | int | `3` | Attempts for retryable LLM errors (rate limits, timeouts); non-retryable errors are not retried |
| `request_timeout_seconds` | int | `0` | Client request timeout (0 = none) |
| `verbose` | bool/string | `false` | Server logging (`true`, `false`, `"extra"`) |
| `error_formatter` | string | `"string"` | Error format: `"string"` or `"json"` |
| `error_fragments` | list | — | Strings that trigger error detection |
| `llm_info_file` | string | — | Path to custom LLM definitions |
| `toolbox_info_file` | string | — | Path to custom toolbox definitions |

## Single Agent Keys

### Required Keys

| Key | Description |
|-----|-------------|
| `name` | Unique identifier (alphanumeric, `-`, `_`) |
| `function.description` | What this agent does (used as prompt for Front Man) |

### instructions

System prompt for LLM-powered agents. Multi-line strings supported via `"""triple quotes"""`.

```hocon
"instructions": """
You are a research assistant.
Always cite your sources.
Never make up information.
"""
```

### function.parameters

JSON Schema describing input arguments. Required for branch agents; omitted for Front Man.

```hocon
"parameters": {
    "type": "object",
    "properties": {
        "query": {"type": "string", "description": "Search query"},
        "max_results": {"type": "int", "description": "Max results", "default": 5}
    },
    "required": ["query"]
}
```

### function.sly_data_schema

JSON Schema for private data the agent expects as **input**. Front Man only. Same format as `parameters`. Generic clients use this to prompt for required private inputs (e.g., user tokens, per-user API keys).

A reserved key `llm_config` inside `sly_data_schema` indicates the network accepts client-provided LLM API keys (e.g., `openai_api_key`, `anthropic_api_key`):

```hocon
"sly_data_schema": {
    "type": "object",
    "properties": {
        "llm_config": {"type": "object", "description": "Per-user LLM API keys"}
    }
}
```

### function.sly_data_output_schema

JSON Schema for private data the agent **produces** as output. Front Man only. Same format as `parameters`. Lets clients know which sly_data keys will come back in the final response.

### function.invocation

Front Man only. How the network is called: `"chatbot"` (default) makes the caller wait for the full response and abandons work if the caller disconnects; `"event"` returns a quick acknowledgment and keeps processing after the caller disconnects. `"event"` networks can also be triggered on a schedule via the manifest's `periodic` key (see below).

### tools (agent-level)

List of agents/tools this agent can call:

```hocon
"tools": [
    "local_agent_name",       // Agent in same network
    "/date_time",             // External agent on same server
    "http://host:8080/agent", // External agent on remote server
    "https://example.com/mcp" // MCP server tools
]
```

MCP with tool filtering:

```hocon
"tools": [
    {
        "url": "https://example.com/mcp",
        "tools": ["tool_1", "tool_2"]
    }
]
```

#### MCP Authentication

MCP servers may require authentication. Two options:

1. Per-request via `sly_data["http_headers"]`, a dict keyed by MCP URL:

   ```json
   "sly_data": {
       "http_headers": {
           "https://example.com/mcp": {"Authorization": "Bearer <token>"}
       }
   }
   ```

2. Server-side via the `MCP_SERVERS_INFO_FILE` environment variable pointing at a HOCON file:

   ```hocon
   {
       "https://example.com/mcp": {
           "http_headers": {"Authorization": "Bearer <token>"},
           "tools": ["tool_1", "tool_2"]
       }
   }
   ```

   `sly_data` overrides the configuration file for the same URL. Tool filtering from the file is used only when the agent's HOCON does not specify its own.

A Front Man can advertise which MCP URLs need headers by listing them in `function.sly_data_schema` under an `http_headers` property (with a `required` list). OAuth-capable clients (e.g. nsflow) use this to run the sign-in flow and inject bearer tokens into sly_data on the user's behalf.

### class

Python class implementing `CodedTool` interface. Mutually exclusive with LLM agent behavior.

```hocon
"class": "calculator.Calculator"
// Resolves to: AGENT_TOOL_PATH/<agent_name>/calculator.py -> Calculator class
```

Or fully qualified:

```hocon
"class": "my_package.tools.calculator.Calculator"
```

### toolbox

Reference to a pre-built tool from toolbox configuration:

```hocon
"toolbox": "tavily_search"
```

A toolbox agent executes code directly (LangChain `BaseTool` or `CodedTool`) and therefore **cannot have a `tools` field** — it cannot invoke other agents downstream.

### args

Extra key/value pairs passed to CodedTools or toolbox tools at invocation time:

```hocon
"args": {
    "api_endpoint": "https://api.example.com",
    "timeout": 30
}
```

### allow

Security policy for information flow to/from external agents.

```hocon
"allow": {
    "connectivity": true,
    "to_downstream": {
        "sly_data": {"user_token": true, "secret": false}
    },
    "from_downstream": {
        "sly_data": {"result_id": true},
        "messages": true
    },
    "to_upstream": {
        "sly_data": ["output_key_1", "output_key_2"]
    }
}
```

`sly_data` can be a dict (key → bool/string), a list of allowed keys, or omitted (blocks all).

String values in sly_data dicts translate keys: `{"my_session": "session_id"}` maps `my_session` to `session_id`.

`messages` controls whether downstream external agent messages are forwarded to client. Values: `true`/`false`, a single agent string, a list of agent strings, or a dict mapping agents to booleans.

`to_tracing` (Front Man only) controls what reaches tracing applications (Langfuse etc.). By default sly_data keys appear in traced messages with values `<redacted>`; enable specific values with the same dict/list spec as `to_downstream`:

```hocon
"allow": {
    "to_tracing": {
        "sly_data": {"user_id": true}
    }
}
```

### Other Agent Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `command` | string | — | Optional command to set agent in motion |
| `display_as` | string | auto | How agent appears in connectivity visualization (`external_agent`, `coded_tool`, `langchain_tool`, `llm_agent`) |
| `max_message_history` | int | None | Front Man only: limit chat history messages |
| `structure_formats` | list | — | Front Man only: parse formats from responses (`"json"`) |
| `verbose` | bool/string | inherited | Per-agent logging override |
| `max_steps` | int | inherited | Per-agent LangGraph recursion limit |
| `max_iterations` | int | — | **Deprecated**. Use `max_steps`. |
| `max_execution_seconds` | int | inherited | Per-agent timeout |
| `max_attempts` | int | inherited | Per-agent retry attempts for retryable LLM errors |
| `error_formatter` | string | inherited | Per-agent error format |
| `error_fragments` | list | inherited | Per-agent error detection strings |

### middleware

List of LangChain `AgentMiddleware` instances applied to the agent. Order matters.

```hocon
"middleware": [
    {
        "class": "my_package.middleware.LoggingMiddleware",
        "args": {
            "log_level": "DEBUG"
        }
    }
]
```

Middleware classes can implement any of the async hooks: `abefore_agent()`, `aafter_agent()`, `abefore_model()`, `aafter_model()`, `awrap_model_call()`, `awrap_tool_call()`. Only class-based middleware is supported (not annotation-based).

Special args automatically populated by the framework when present in both the dict and the constructor signature: `chat_history`, `origin`, `origin_str`, `progress_reporter`, `sly_data`.

## Agent Manifest (manifest.hocon)

Controls which networks the server loads and exposes:

```hocon
{
    // Simple: boolean — true serves and lists the agent, false hides it entirely
    "hello_world.hocon": true,

    // Detailed: dict with options
    "math_guy.hocon": {
        "serve": true,     // Whether to load and serve the network at all
        "public": true,    // Whether to list in the Concierge /list endpoint
        "mcp": true        // Expose as MCP tool (implicitly sets public=true)
    },

    // Subdirectory path — internal-only network callable as an external agent
    "deep/special_agent.hocon": {
        "serve": true,
        "public": false
    },

    // Cron-triggered network — front man must have "invocation": "event"
    "monitor.hocon": {
        "serve": true,
        "periodic": "*/5 * * * *"   // every 5 minutes; true = every minute
    }
}
```

The `periodic` value can be a boolean (`true` = every minute with the default text "Do your thing"), a cron string, or a dict with an `interactions` list for fine-grained control (`cron_schedule`, `text`, `sly_data`, `metadata` per interaction).

When `AGENT_MANIFEST_UPDATE_PERIOD_SECONDS > 0`, the server polls the manifest and referenced network files at that interval and hot-reloads added/removed/changed networks without a restart. Useful for dev and for shared read-only volume mounts in cluster deployments.
