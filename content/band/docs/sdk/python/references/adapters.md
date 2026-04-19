# Band Python SDK - Adapter Reference

Full code examples for every supported adapter. All adapters follow the same pattern: create the adapter, pass to `Agent.create()`, call `await agent.run()`.

## LangGraph

```python
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver
from thenvoi import Agent
from thenvoi.adapters import LangGraphAdapter

adapter = LangGraphAdapter(
    llm=ChatOpenAI(model="gpt-4o"),
    checkpointer=InMemorySaver(),
    system_prompt="You are a helpful assistant.",
    additional_tools=[],          # LangChain @tool functions
    recursion_limit=25,           # max graph steps
    max_history_messages=50,
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

**Pre-built graph:**

```python
from langgraph.graph import StateGraph

graph = StateGraph(...)  # your compiled graph
adapter = LangGraphAdapter(graph=graph, checkpointer=InMemorySaver())
```

**Graph-as-tool (hierarchical agents):**

```python
from thenvoi.integrations.langgraph import graph_as_tool

calc_tool = graph_as_tool(
    graph=calculator_graph,
    name="calculator",
    description="Evaluates math expressions",
    input_schema={"expression": "math expression string"},
    result_formatter=lambda state: f"Result: {state['result']}",
    isolate_thread=True,
)

adapter = LangGraphAdapter(llm=llm, additional_tools=[calc_tool])
```

## Pydantic AI

```python
from thenvoi import Agent
from thenvoi.adapters import PydanticAIAdapter

adapter = PydanticAIAdapter(
    model="openai:gpt-4o",
    system_prompt="You are a research assistant.",
    additional_tools=[],          # RunContext[AgentToolsProtocol] functions
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Anthropic

```python
from thenvoi import Agent
from thenvoi.adapters import AnthropicAdapter

adapter = AnthropicAdapter(
    anthropic_model="claude-sonnet-4-6",
    system_prompt="You are an expert analyst.",
    additional_tools=[],          # (PydanticModel, callable) tuples
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Claude Agent SDK

```python
from thenvoi import Agent
from thenvoi.adapters import ClaudeSDKAdapter

adapter = ClaudeSDKAdapter(
    model="claude-sonnet-4-6",
    max_thinking_tokens=10000,
    permission_mode="bypassPermissions",   # default | acceptEdits | bypassPermissions | plan | dontAsk (use bypassPermissions only in trusted/dev environments)
    custom_section="Additional instructions here.",
    include_base_instructions=True,
    enable_execution_reporting=True,
    enable_mcp_tools=True,
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Codex (OpenAI)

```python
from thenvoi import Agent
from thenvoi.adapters import CodexAdapter

adapter = CodexAdapter(
    model="gpt-5.3-codex",
    approval_policy="never",               # never | approved_only | always
    sandbox_mode="workspace-write",         # no-access | workspace-read | workspace-write | system-read | system-write
    reasoning_effort="high",               # low | medium | high | xhigh
    network_access_enabled=False,
    enable_execution_reporting=True,
    emit_thought_events=True,
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## CrewAI

```python
from thenvoi import Agent
from thenvoi.adapters import CrewAIAdapter

adapter = CrewAIAdapter(
    role="Senior Code Reviewer",
    goal="Review code for bugs, security issues, and style",
    backstory="You have 15 years of experience in Python and TypeScript.",
    additional_tools=[],          # (PydanticModel, callable) tuples
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Parlant

```python
from thenvoi import Agent
from thenvoi.adapters import ParlantAdapter

adapter = ParlantAdapter(
    environment="production",
    agent_id="parlant-agent-id",
    base_url="http://localhost:8000",
    api_key=os.environ.get("PARLANT_API_KEY"),
    system_prompt="You are a customer support agent.",
    custom_section="Follow company guidelines strictly.",
    include_base_instructions=True,         # default: True
    response_timeout_seconds=120,           # default: 120
    max_history_messages=100,               # default: 100
    additional_tools=[],
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Gemini

```python
from thenvoi import Agent
from thenvoi.adapters import GeminiAdapter

adapter = GeminiAdapter(
    gemini_model="gemini-3-flash-preview",
    additional_tools=[],          # (PydanticModel, callable) tuples
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Google ADK

```python
from thenvoi import Agent
from thenvoi.adapters import GoogleADKAdapter

adapter = GoogleADKAdapter(
    system_prompt="You are a planning assistant.",
    custom_section="Focus on actionable steps.",
    additional_tools=[],
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Letta

```python
from thenvoi import Agent
from thenvoi.adapters import LettaAdapter

adapter = LettaAdapter(
    system_prompt="You are a memory-enhanced assistant.",
    custom_section="Use your memory tools to remember user preferences.",
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## A2A Bridge (call external A2A agents)

```python
from thenvoi import Agent
from thenvoi.adapters import A2AAdapter

adapter = A2AAdapter(
    remote_url="http://localhost:10000",
    streaming=True,
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## A2A Gateway (expose peers as A2A endpoints)

```python
from thenvoi import Agent
from thenvoi.adapters import A2AGatewayAdapter

adapter = A2AGatewayAdapter(
    port=10000,
    max_queue_size=100,
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## ACP (Agent Communication Protocol)

```python
from thenvoi import Agent
from thenvoi.adapters import ACPClientAdapter

adapter = ACPClientAdapter()  # discovers ACP server via environment or default localhost

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## OpenCode

```python
from thenvoi import Agent
from thenvoi.adapters import OpencodeAdapter

adapter = OpencodeAdapter(
    model="gpt-4o",
    approval_mode="never",         # never | user_only | always
)

agent = Agent.create(adapter=adapter, agent_id="...", api_key="...")
await agent.run()
```

## Building a Custom Adapter

Extend `SimpleAdapter` for full control over the message handling pipeline:

```python
from thenvoi.core.simple_adapter import SimpleAdapter
from thenvoi.core.types import PlatformMessage, AdapterFeatures, Capability, Emit

class MyAdapter(SimpleAdapter[list[dict]]):
    SUPPORTED_EMIT = frozenset({Emit.EXECUTION})
    SUPPORTED_CAPABILITIES = frozenset({Capability.MEMORY})

    async def on_started(self, agent_name: str, agent_description: str) -> None:
        await super().on_started(agent_name, agent_description)
        # initialization logic

    async def on_message(
        self, msg, tools, history, participants_msg, contacts_msg,
        *, is_session_bootstrap, room_id,
    ) -> None:
        # Your custom LLM/logic here
        response = await my_llm.chat(msg.content)
        await tools.send_message(response, mentions=[f"@{msg.sender_name}"])

    async def on_cleanup(self, room_id: str) -> None:
        pass  # per-room cleanup
```
