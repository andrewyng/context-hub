---
name: package
description: "langgraph package guide for Python graphs, persistence, streaming, and local agent development"
metadata:
  languages: "python"
  versions: "1.2.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "langgraph,langchain,agents,graphs,workflow,streaming,persistence"
---

# langgraph Python Package Guide

## What It Is

`langgraph` is LangChain's low-level orchestration library for long-running, stateful agent and workflow graphs. Use it when you need explicit control over graph state, node routing, checkpointing, streaming, interrupts, and multi-step execution.

If you only need a higher-level agent abstraction, the LangChain docs recommend starting with `langchain`'s `create_agent` and dropping to LangGraph when you need custom orchestration.

## Install

Base package:

```bash
pip install -U langgraph
```

LangGraph examples in the official docs often also install LangChain and a model provider integration:

```bash
pip install -U langchain
pip install -U langchain-openai
```

Local Agent Server and Studio development use the separate CLI package:

```bash
pip install -U "langgraph-cli[inmem]"
```

Python requirements from official sources:

- `langgraph`: Python `>=3.10`
- `langgraph-cli[inmem]`: Python `>=3.11`

## Core Imports

Most graph code starts from these imports:

```python
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
```

For chat-style state, use `MessagesState`:

```python
from langgraph.graph import MessagesState
```

## Minimal Graph

Use `StateGraph` to define a typed state schema, add nodes, wire edges, then compile before invoking:

```python
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    text: str

def node_a(state: State) -> dict:
    return {"text": state["text"] + "a"}

def node_b(state: State) -> dict:
    return {"text": state["text"] + "b"}

builder = StateGraph(State)
builder.add_node("node_a", node_a)
builder.add_node("node_b", node_b)
builder.add_edge(START, "node_a")
builder.add_edge("node_a", "node_b")
builder.add_edge("node_b", END)

graph = builder.compile()
result = graph.invoke({"text": ""})
print(result)  # {"text": "ab"}
```

Rules that matter:

- Nodes take `State` and return a partial state update as `dict`.
- `StateGraph` is a builder only. You must call `.compile()` before `invoke()`, `ainvoke()`, `stream()`, or `astream()`.
- Use reducers on state keys when multiple nodes may update the same key in one step.

## Chat / Agent-Style Graph

For message-oriented workflows, define state around messages and call a model inside a node:

```python
import operator
from typing import Annotated
from typing_extensions import TypedDict
from langchain.chat_models import init_chat_model
from langchain_core.messages import AnyMessage, SystemMessage
from langgraph.graph import StateGraph, START, END

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    llm_calls: int

model = init_chat_model("openai:gpt-4.1", temperature=0)

def llm_call(state: AgentState) -> dict:
    response = model.invoke(
        [SystemMessage(content="You are a concise assistant.")] + state["messages"]
    )
    return {
        "messages": [response],
        "llm_calls": state.get("llm_calls", 0) + 1,
    }

builder = StateGraph(AgentState)
builder.add_node("llm_call", llm_call)
builder.add_edge(START, "llm_call")
builder.add_edge("llm_call", END)

graph = builder.compile()
```

Official quickstarts also show tool-calling flows built on the same pattern: define tools, bind them to the model, then route between an LLM node and a tool-execution node.

## Persistence And Threaded Execution

Checkpointing is the main LangGraph primitive for resumability, memory, interrupts, and fault tolerance.

Development example:

```python
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()
graph = builder.compile(checkpointer=checkpointer)

result = graph.invoke(
    {"messages": [{"role": "user", "content": "hi"}]},
    {"configurable": {"thread_id": "thread-1"}},
)
```

Important behavior:

- With a checkpointer, LangGraph saves a checkpoint at each super-step.
- Checkpoints are grouped by `thread_id`.
- If you want conversation continuity, reuse the same `thread_id`.
- If you forget `thread_id`, persistent chat and resume behavior will not work as expected.

Production guidance from official docs:

- `InMemorySaver` is for debugging and testing.
- For local persistent experiments, install a real backend such as SQLite.
- For production, use a persistent backend such as Postgres-based checkpointing or LangSmith-managed infrastructure.

## Long-Term Store

Use a store for data that must survive across threads, such as user memory or shared application state:

```python
from dataclasses import dataclass
from langgraph.runtime import Runtime
from langgraph.store.memory import InMemoryStore
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, MessagesState

@dataclass
class Context:
    user_id: str

store = InMemoryStore()
checkpointer = InMemorySaver()

async def read_or_write_memory(state: MessagesState, runtime: Runtime[Context]):
    namespace = (runtime.context.user_id, "memories")
    memories = await runtime.store.asearch(namespace, query="recent preferences", limit=3)
    return {}

builder = StateGraph(MessagesState, context_schema=Context)
builder.add_node("memory", read_or_write_memory)
graph = builder.compile(checkpointer=checkpointer, store=store)
```

Use this split consistently:

- Checkpointer: thread-level state across steps in one conversation or run lineage
- Store: cross-thread, user-level, or app-level memory

## Streaming

Compiled graphs support `stream()` and `astream()`. Official stream modes include:

- `"values"`: full graph state after each step
- `"updates"`: only node/task updates
- `"messages"`: token/message streaming from LLM calls
- `"custom"`: your own events from inside nodes
- `"checkpoints"` / `"tasks"` / `"debug"`: deeper runtime visibility

Example:

```python
for chunk in graph.stream(
    {"messages": [{"role": "user", "content": "summarize this"}]},
    {"configurable": {"thread_id": "thread-1"}},
    stream_mode="updates",
):
    print(chunk)
```

Custom stream events from inside a node:

```python
from langgraph.config import get_stream_writer

def my_node(state):
    writer = get_stream_writer()
    writer({"stage": "starting"})
    return {}
```

`get_stream_writer()` relies on context variables. Official reference notes this is not supported for async LangGraph execution on Python `<3.11`.

## Config And Auth

`langgraph` itself does not define a single auth scheme. In practice you usually configure:

- Model provider credentials such as `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Optional LangSmith tracing settings such as `LANGSMITH_API_KEY` and `LANGSMITH_TRACING=true`
- Optional `LANGGRAPH_AES_KEY` if you enable encrypted checkpoint serialization

Typical setup:

```bash
export OPENAI_API_KEY="..."
export LANGSMITH_API_KEY="..."
export LANGSMITH_TRACING="true"
```

For local Agent Server / Studio workflows, the official LangGraph docs list `LANGSMITH_API_KEY` as a prerequisite.

## Local Agent Server

Use the CLI when you want a local API server, Studio integration, or a production-like deployment path:

```bash
pip install -U "langgraph-cli[inmem]"
langgraph new my-agent --template new-langgraph-project-python
cd my-agent
pip install -e .
langgraph dev
```

What this gives you:

- local Agent Server on `http://127.0.0.1:2024`
- Studio URL backed by your local server
- generated API docs at `/docs`

Use `langgraph dev` for fast local development. Official platform docs describe `langgraph up` as the more production-like Docker-backed path.

## Common Pitfalls

- Do not call methods on the builder. Compile first, then use the compiled graph.
- Do not use `InMemorySaver` or `InMemoryStore` as your production persistence layer.
- Do not expect checkpointing to work without passing `thread_id` in `configurable`.
- Do not assume LangGraph ships every LLM integration. Install model-provider packages separately.
- Do not treat LangGraph as a prompt framework. It orchestrates state and execution; prompt/model setup usually comes from LangChain or your own code.
- If multiple nodes update the same state key in one step, define a reducer or you can get invalid concurrent update errors.
- If you need cross-thread memory, a checkpointer alone is not enough; add a store.

## Version-Sensitive Notes

- The target version for this session is `1.2.2`.
- PyPI lists `1.2.2` as the current `langgraph` release on 2026-05-29.
- The official docs site is now rooted at `docs.langchain.com`, and the API reference is at `reference.langchain.com`; the previous `langchain-ai.github.io` URL is an older docs location.
- Official reference pages still display per-module package labels on some modules. Treat the docs as a floating v1.x reference and verify your installed package version when debugging behavior differences.
- The official v1 release notes state that LangGraph's `create_react_agent` prebuilt is deprecated in favor of LangChain's `create_agent`.
- If you copy pre-v1 examples from blogs or archived docs, re-check imports and prebuilt APIs against the current reference before using them unchanged.

## Official Sources

- Docs overview: https://docs.langchain.com/oss/python/langgraph/
- Install: https://docs.langchain.com/oss/python/langgraph/install
- Quickstart: https://docs.langchain.com/oss/python/langgraph/quickstart
- Graph API guide: https://docs.langchain.com/oss/python/langgraph/use-graph-api
- Persistence: https://docs.langchain.com/oss/python/langgraph/persistence
- Memory: https://docs.langchain.com/oss/python/langgraph/add-memory
- Local server: https://docs.langchain.com/oss/python/langgraph/local-server
- CLI reference: https://docs.langchain.com/langgraph-platform/cli
- API reference root: https://reference.langchain.com/python/langgraph/
- PyPI: https://pypi.org/project/langgraph/
- Source repository: https://github.com/langchain-ai/langgraph
