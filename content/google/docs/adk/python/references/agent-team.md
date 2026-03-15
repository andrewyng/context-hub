# Agent Team (Multi-Agent Delegation)

Build a team of specialized agents where a root agent delegates to sub-agents.

## Core Pattern

Define sub-agents with focused `description` fields — the root agent uses them to decide delegation.
```python
from google.adk.agents import Agent

# Sub-agents
greeting_agent = Agent(
    name="greeting_agent",
    model="gemini-2.5-flash",
    description="Handles simple greetings and hellos using the 'say_hello' tool.",
    instruction="Your ONLY task is to greet the user using 'say_hello'. Do nothing else.",
    tools=[say_hello],
)

farewell_agent = Agent(
    name="farewell_agent",
    model="gemini-2.5-flash",
    description="Handles simple farewells and goodbyes using the 'say_goodbye' tool.",
    instruction="Your ONLY task is to say goodbye using 'say_goodbye'. Do nothing else.",
    tools=[say_goodbye],
)

# Root agent with delegation
root_agent = Agent(
    name="coordinator",
    model="gemini-2.5-flash",
    description="Coordinates weather, greetings, and farewells.",
    instruction="Delegate greetings to 'greeting_agent', farewells to 'farewell_agent'. Handle weather yourself.",
    tools=[get_weather],
    sub_agents=[greeting_agent, farewell_agent],
)
```

## Session State with ToolContext

Tools can read/write session state via `ToolContext`:
```python
from google.adk.tools.tool_context import ToolContext

def get_weather_stateful(city: str, tool_context: ToolContext) -> dict:
    """Returns weather formatted by user's preferred temperature unit."""
    unit = tool_context.state.get("user_preference_temperature_unit", "Celsius")
    # ... compute weather ...
    tool_context.state["last_city_checked"] = city  # Write to state
    return {"status": "success", "report": f"Weather in {city}: 25°{'C' if unit == 'Celsius' else 'F'}"}
```

Initialize state when creating a session:
```python
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
session = await session_service.create_session(
    app_name="my_app",
    user_id="user_1",
    session_id="session_001",
    state={"user_preference_temperature_unit": "Celsius"},
)
```

Use `output_key` to auto-save the agent's final response to state:
```python
root_agent = Agent(
    ...,
    output_key="last_weather_report",  # Saved to session.state["last_weather_report"]
)
```

## Safety Callbacks

### before_model_callback — Block input before LLM call
```python
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse
from google.genai import types
from typing import Optional

def block_keyword_guardrail(callback_context: CallbackContext, llm_request: LlmRequest) -> Optional[LlmResponse]:
    last_msg = ""
    for content in reversed(llm_request.contents):
        if content.role == "user" and content.parts:
            last_msg = content.parts[0].text or ""
            break
    if "BLOCK" in last_msg.upper():
        return LlmResponse(
            content=types.Content(role="model", parts=[types.Part(text="Request blocked.")])
        )
    return None  # Allow

root_agent = Agent(..., before_model_callback=block_keyword_guardrail)
```

### before_tool_callback — Block tool execution by argument
```python
from google.adk.tools.base_tool import BaseTool
from typing import Dict, Any

def block_city_tool_guardrail(tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext) -> Optional[Dict]:
    if tool.name == "get_weather_stateful" and args.get("city", "").lower() == "paris":
        return {"status": "error", "error_message": "Weather for Paris is currently disabled."}
    return None  # Allow

root_agent = Agent(..., before_tool_callback=block_city_tool_guardrail)
```

## Multi-Model Support via LiteLLM
```python
from google.adk.models.lite_llm import LiteLlm

agent_gpt = Agent(
    name="gpt_agent",
    model=LiteLlm(model="openai/gpt-4.1"),
    ...
)

agent_claude = Agent(
    name="claude_agent",
    model=LiteLlm(model="claude-sonnet-4-6"),
    ...
)
```

Set API keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.

## Runner Setup
```python
from google.adk.runners import Runner

runner = Runner(
    agent=root_agent,
    app_name="my_app",
    session_service=session_service,
)

# Interact asynchronously
from google.genai import types

async def call_agent(query: str):
    content = types.Content(role="user", parts=[types.Part(text=query)])
    async for event in runner.run_async(user_id="user_1", session_id="session_001", new_message=content):
        if event.is_final_response():
            print(event.content.parts[0].text)
            break
```

## Important Notes

- Sub-agent `description` must be precise — it's what the root agent uses for delegation decisions.
- `before_model_callback` on the root agent does NOT apply automatically to sub-agents.
- `before_tool_callback` returning a dict skips the tool entirely; returning `None` allows it.
- `output_key` saves the *last* response per turn — subsequent turns overwrite the value.

## Official Source URL

- `https://google.github.io/adk-docs/tutorials/agent-team/`