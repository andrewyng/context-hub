# AG2 Agent API Reference

## LLMConfig

Wraps model configuration for any supported provider. Always pass a dict:

```python
from autogen.llm_config import LLMConfig

# OpenAI
llm_config = LLMConfig({"api_type": "openai", "model": "gpt-4.1-mini", "api_key": "your-api-key"})

# Google
llm_config = LLMConfig({"api_type": "google", "model": "gemini-3.1-flash-lite-preview"})

# Anthropic
llm_config = LLMConfig({"api_type": "anthropic", "model": "claude-sonnet-4-20250514"})
```

| Key | Required | Description |
|---|---|---|
| `api_type` | Yes | Provider identifier: `"openai"`, `"google"`, `"anthropic"`, etc. |
| `model` | Yes | Model name as the provider expects it |
| `api_key` | No | API key; omit if set in environment variables |
| `base_url` | No | Custom endpoint URL (for proxies or self-hosted models) |
| `temperature` | No | Sampling temperature |
| `max_tokens` | No | Maximum tokens in response |

### Loading from JSON file

```python
llm_config = LLMConfig.from_json(
    path="OAI_CONFIG_LIST",
    file_location=".",
    filter_dict={"model": ["gpt-4.1-mini"]},
)
```

Use when a project stores multi-model credentials in an `OAI_CONFIG_LIST` file.

### Using as context manager

```python
with LLMConfig({"api_type": "openai", "model": "gpt-4.1-mini"}) as config:
    agent = ConversableAgent(name="assistant", llm_config=config)
```

Note: Each provider requires its corresponding extra to be installed (e.g., `autogen[openai]`, `autogen[google]`, `autogen[anthropic]`). Without the extra, model calls will fail at runtime.

## ConversableAgent

The base class for all AG2 agents. Every agent is a `ConversableAgent` or extends one.

### Constructor

```python
from autogen import ConversableAgent

agent = ConversableAgent(
    name="my_agent",
    system_message="You are a helpful assistant.",
    llm_config=llm_config,
    human_input_mode="NEVER",
    code_execution_config=False,
    functions=[my_tool_fn],
)
```

| Param | Type | Default | Description |
|---|---|---|---|
| `name` | `str` | required | Unique agent identifier |
| `system_message` | `str \| None` | `""` | Role/personality prompt sent to the LLM |
| `llm_config` | `LLMConfig \| dict \| False \| None` | `None` | LLM configuration; `False` disables LLM |
| `human_input_mode` | `"ALWAYS" \| "NEVER" \| "TERMINATE"` | `"TERMINATE"` | When to solicit human input |
| `code_execution_config` | `dict \| False` | `False` | Code executor settings; `False` disables |
| `functions` | `list[Callable]` | `None` | Tool functions the agent can call |
| `is_termination_msg` | `Callable[[dict], bool] \| None` | `None` | Predicate to end the conversation |
| `max_consecutive_auto_reply` | `int \| None` | `None` | Auto-reply limit before requesting human input |
| `description` | `str \| None` | `None` | Description used by group chat manager for speaker selection |

## UserProxyAgent

Pre-configured to represent a human or execute code on their behalf. Extends `ConversableAgent`.

```python
from autogen import UserProxyAgent

user_proxy = UserProxyAgent(
    name="user_proxy",
    code_execution_config={"executor": executor},
)
```

Key defaults that differ from `ConversableAgent`:
- `human_input_mode="ALWAYS"` — prompts for human input by default
- `llm_config=False` — no LLM backing
- `code_execution_config={}` — code execution enabled by default

Use when: you need a human-in-the-loop checkpoint, tool execution relay, or code execution sandbox.

## run()

The primary method for single-agent and two-agent conversations. For 3+ agents, use `run_group_chat()` (see `references/group-chat.md`). Non-blocking — runs the chat in a background thread and returns a `RunResponse` immediately.

```python
result = assistant.run(
    message="Write a function that groups strings by first letter.",
    max_turns=3,
)
result.process()  # execute and stream output to console

print(result.summary)
```

| Param | Type | Default | Description |
|---|---|---|---|
| `message` | `str \| dict \| Callable \| None` | `None` | Initial message to start the chat |
| `recipient` | `ConversableAgent \| None` | `None` | Target agent; `None` enables single-agent mode |
| `max_turns` | `int \| None` | `None` | Maximum conversation turns |
| `user_input` | `bool \| None` | `False` | Whether to allow user input during execution |
| `tools` | `Tool \| Iterable[Tool] \| None` | `None` | Tools available (single-agent mode only) |
| `clear_history` | `bool` | `True` | Clear chat history before starting |
| `silent` | `bool \| None` | `False` | Suppress console output |
| `summary_method` | `str \| Callable \| None` | `"last_msg"` | How to generate the summary (`"last_msg"`, `"reflection_with_llm"`, or callable) |
| `msg_to` | `str \| None` | `"agent"` | Direction of initial message: `"agent"` or `"user"` |

### Single-agent mode

When `recipient=None`, `run()` creates a temporary executor agent automatically:

```python
result = assistant.run(
    message="Explain Python decorators.",
    max_turns=1,
)
result.process()
```

### Two-agent mode

Pass a `recipient` to create a direct conversation between two agents:

```python
result = user_proxy.run(
    recipient=assistant,
    message="Summarize the advantages of asyncio.",
    max_turns=4,
)
result.process()
```

### RunResponse

`run()` returns a `RunResponse`. Call `.process()` to execute, then access results:

```python
result = assistant.run(message="Explain decorators.", max_turns=2)
result.process()

print(result.summary)        # conversation summary
print(result.cost)           # token usage and cost breakdown
print(result.last_speaker)   # name of the last agent that spoke
```

| Property | Type | Description |
|---|---|---|
| `.summary` | `str \| None` | Conversation summary (controlled by `summary_method`) |
| `.cost` | `Cost \| None` | Token usage and cost; `.cost.usage_including_cached_inference` and `.cost.usage_excluding_cached_inference` each have `.total_cost` |
| `.last_speaker` | `str \| None` | Name of the last agent that spoke |
| `.context_variables` | `ContextVariables \| None` | Shared context state |
| `.events` | `Iterable[BaseEvent]` | Stream of conversation events |
| `.messages` | `Iterable[Message]` | Chat messages exchanged |

Pass a custom `EventProcessorProtocol` to `.process(processor)` for custom event handling.

## run_iter()

Stepped execution — the background thread pauses after each event until you advance. Use for event-driven UIs, custom logging, or streaming integrations.

```python
from autogen.events import TextEvent, TerminationEvent

for event in assistant.run_iter(
    message="Write a haiku about Python.",
    yield_on=[TextEvent, TerminationEvent],
):
    if isinstance(event, TextEvent):
        print(f"[{event.source}]: {event.content}")
    elif isinstance(event, TerminationEvent):
        print("Done.")
```

| Param | Type | Default | Description |
|---|---|---|---|
| `yield_on` | `Sequence[type[BaseEvent]] \| None` | `None` | Event types to yield; `None` yields all |

All other params match `run()`. Common event types:

| Event | Description |
|---|---|
| `TextEvent` | Agent produced text output |
| `ToolCallEvent` | Agent invoked a tool |
| `TerminationEvent` | Conversation ended |
| `InputRequestEvent` | Agent is requesting user input |

## Tool Registration

Tool execution works differently depending on whether you use group chat or two-agent chat.

### Group chat: automatic tool execution

In `run_group_chat()`, tool execution is automatic. Register tools on the agent via `functions` and AG2 handles execution internally through a built-in `_Group_Tool_Executor` agent:

```python
from typing import Annotated

def search_web(query: Annotated[str, "The search query"]) -> str:
    """Search the web and return results."""
    return do_search(query)

researcher = ConversableAgent(
    name="researcher",
    llm_config=llm_config,
    functions=[search_web],
    description="Researches topics using web search.",
)
writer = ConversableAgent(name="writer", llm_config=llm_config,
    description="Writes content based on research.")
editor = ConversableAgent(name="editor", llm_config=llm_config,
    description="Edits and polishes written content.")

# In group chat, tool calls are executed automatically
result = run_group_chat(
    pattern=AutoPattern(
        initial_agent=researcher,
        agents=[researcher, writer, editor],
        group_manager_args={"llm_config": llm_config},
    ),
    messages="Research and write about AG2 documentation.",
)
result.process()
```

### Two-agent chat: split registration

With `run()` and two agents, you must explicitly split tool registration — one agent proposes the tool call (LLM), and the other executes it:

```python
from typing import Annotated
from autogen import ConversableAgent, UserProxyAgent

assistant = ConversableAgent(name="assistant", llm_config=llm_config)
user_proxy = UserProxyAgent(name="user_proxy", code_execution_config=False)

@user_proxy.register_for_execution()
@assistant.register_for_llm(description="Search the web")
def search_web(query: Annotated[str, "The search query"]) -> str:
    return do_search(query)

result = user_proxy.run(
    recipient=assistant,
    message="Search for AG2 documentation.",
)
result.process()
```

| Decorator | Purpose |
|---|---|
| `@agent.register_for_llm(description=...)` | Makes the tool available in the agent's LLM tool list (agent proposes the call) |
| `@agent.register_for_execution(name=...)` | Registers the function for actual execution by that agent (agent runs it) |

The LLM agent decides when to call the tool; the execution agent runs it and returns the result.

### Single-agent mode: inline tools

When using `run()` without a recipient, pass tools directly:

```python
from typing import Annotated

def search_web(query: Annotated[str, "The search query"]) -> str:
    """Search the web and return results."""
    return do_search(query)

assistant = ConversableAgent(name="assistant", llm_config=llm_config)

result = assistant.run(
    message="Search for AG2 documentation.",
    tools=[search_web],
)
result.process()
```

### Defining tool functions

Use `Annotated` types with descriptions on every parameter. The function docstring becomes the tool description the LLM sees:

```python
from typing import Annotated, Any

def check_payment(
    vendor: Annotated[str, "The vendor name"],
    amount: Annotated[float, "The transaction amount"],
) -> dict[str, Any]:
    """Check if a payment has been processed."""
    return {"status": "processed", "vendor": vendor}
```

### Tools with context variables

Name a parameter `context_variables: ContextVariables` and AG2 injects the shared context automatically:

```python
from autogen.agentchat.group.context_variables import ContextVariables

def get_user_name(context_variables: ContextVariables) -> str:
    """Get the current user's name from context."""
    return context_variables.get("user_name", "Unknown")
```

## initiate_chat() (legacy)

Blocking two-agent chat. Suitable for simple synchronous scripts:

```python
result = user_proxy.initiate_chat(
    assistant,
    message="Explain list comprehensions.",
    max_turns=3,
)
print(result.summary)
```

Returns a `ChatResult` with `.chat_history`, `.summary`, `.cost`, `.human_input`.

Note: Prefer `run()` + `.process()` for new code. `run()` supports single-agent mode, event streaming, and the `RunResponse` interface. `initiate_chat()` is retained for backward compatibility.
