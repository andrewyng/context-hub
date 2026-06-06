

# LangGraph Python SDK (v1.x)

## Golden Rule

LangGraph models agent logic as a directed graph. `StateGraph` holds your state schema,
nodes are Python functions that read and update state, and edges control flow. Use it when
you need fine-grained control over execution,  multi-agent pipelines, interrupts, branching
logic, or durable/resumable workflows.

## Install

```bash
pip install langgraph langchain-openai  # langgraph-checkpoint-postgres for production persistence
```

##  Removed / deprecated in v1.0

```python
# WRONG — langgraph.prebuilt was deprecated in v1.0
from langgraph.prebuilt import ToolExecutor          # removed
from langgraph.prebuilt import ToolInvocation        # removed

# Use langchain.agents for high-level prebuilt patterns instead
from langchain.agents import create_react_agent      #  correct
```

##  Core imports (v1.x)

```python
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Interrupt, GraphOutput    # v1.1+ for type-safe output
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
```

## Minimal Agent Graph

```python
from typing import Annotated
from typing_extensions import TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode  # ToolNode is still available in v1.x

# 1. Define state
class State(TypedDict):
    messages: Annotated[list, add_messages]  # add_messages = append-only reducer

# 2. Define tools
@tool
def search(query: str) -> str:
    """Search for information."""
    return f"Result: {query}"

tools = [search]
tool_node = ToolNode(tools)

# 3. Define LLM with tools bound
llm = ChatOpenAI(model="gpt-4o").bind_tools(tools)

# 4. Node functions — return partial state updates
def call_llm(state: State) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: State) -> str:
    """Route: if last message has tool calls → tools, else → END."""
    last = state["messages"][-1]
    if last.tool_calls:
        return "tools"
    return END

# 5. Build graph
graph = StateGraph(State)
graph.add_node("llm", call_llm)
graph.add_node("tools", tool_node)

graph.add_edge(START, "llm")
graph.add_conditional_edges("llm", should_continue)
graph.add_edge("tools", "llm")  # loop back after tool execution

compiled = graph.compile()

# 6. Invoke
result = compiled.invoke({"messages": [HumanMessage(content="Search for LangGraph")]})
print(result["messages"][-1].content)
```

## State Schemas

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

# TypedDict (most common)
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # list reducer: appends new messages
    steps: int                               # last-write-wins by default
    context: str

# Pydantic model (v1.1+: coerced automatically when using version="v2")
from pydantic import BaseModel

class PydanticState(BaseModel):
    messages: Annotated[list, add_messages]
    step_count: int = 0
```

## Persistence (Checkpointing)

```python
from langgraph.checkpoint.memory import MemorySaver

# In-memory checkpointer (dev/testing)
memory = MemorySaver()
compiled = graph.compile(checkpointer=memory)

# thread_id scopes a conversation — same thread_id resumes from last checkpoint
config = {"configurable": {"thread_id": "user-123"}}

result = compiled.invoke(
    {"messages": [HumanMessage(content="Hello")]},
    config=config,
)

# Resume the same thread
result = compiled.invoke(
    {"messages": [HumanMessage(content="Remember what I said?")]},
    config=config,   # same thread_id — history is loaded automatically
)

# Production: use PostgreSQL checkpointer
# pip install langgraph-checkpoint-postgres
# from langgraph.checkpoint.postgres import PostgresSaver
# saver = PostgresSaver.from_conn_string("postgresql://...")
```

## Human-in-the-Loop (Interrupt)

```python
from langgraph.types import interrupt

def human_review_node(state: State) -> dict:
    """Pause execution and wait for human input."""
    decision = interrupt({
        "question": "Approve this action?",
        "proposed": state["messages"][-1].content,
    })
    # `decision` is whatever the human sends when resuming
    return {"messages": [HumanMessage(content=f"Human approved: {decision}")]}

compiled = graph.compile(checkpointer=MemorySaver())
config = {"configurable": {"thread_id": "review-1"}}

# First invoke — runs until interrupt
result = compiled.invoke({"messages": [HumanMessage("Do the thing")]}, config=config)
# result contains the interrupt data — surface this to the human

# Resume after human decision (pass None to continue, or pass a value)
from langgraph.types import Command
result = compiled.invoke(Command(resume="approved"), config=config)
```

## Type-safe Streaming (v1.1 — version="v2")

```python
# v1 (default) — yields raw dicts
for event in compiled.stream({"messages": [HumanMessage("Hello")]}, stream_mode="values"):
    print(event)  # plain dict

# v2 (opt-in, v1.1+) — yields typed StreamPart objects
from langgraph.types import GraphOutput

for part in compiled.stream(
    {"messages": [HumanMessage("Hello")]},
    version="v2",           # opt-in
    stream_mode="values",
):
    # part["type"] narrows to: "values", "updates", "messages", "checkpoint", etc.
    print(part["type"], part["data"])

# Type-safe invoke (v2)
result = compiled.invoke(
    {"messages": [HumanMessage("Hello")]},
    version="v2",
)
# result is GraphOutput, not a plain dict
assert isinstance(result, GraphOutput)
print(result.value)       # the output state
print(result.interrupts)  # tuple[Interrupt, ...] — empty if no interrupts
```

## Multi-Agent: Subgraphs

```python
# Build a subgraph
sub = StateGraph(State)
sub.add_node("worker", worker_node)
sub.add_edge(START, "worker")
sub.add_edge("worker", END)
sub_compiled = sub.compile()

# Add subgraph as a node in the parent graph
parent = StateGraph(State)
parent.add_node("supervisor", supervisor_node)
parent.add_node("worker_agent", sub_compiled)   # subgraph as node
parent.add_edge(START, "supervisor")
parent.add_edge("supervisor", "worker_agent")
parent.add_edge("worker_agent", END)
```

## Streaming Tokens (LLM output chunks)

```python
# stream_mode="messages" yields (message_chunk, metadata) tuples
for chunk, metadata in compiled.stream(
    {"messages": [HumanMessage("Tell me a story")]},
    stream_mode="messages",
):
    if hasattr(chunk, "content") and chunk.content:
        print(chunk.content, end="", flush=True)
```

## Inspect State Between Steps

```python
# Get full state at a checkpoint
snapshot = compiled.get_state(config)
print(snapshot.values)    # current state dict
print(snapshot.next)      # which nodes run next (empty = finished)

# Get state history (time travel)
for state_snapshot in compiled.get_state_history(config):
    print(state_snapshot.config)  # checkpoint config to restore from
```

## Common Questions

- `add_messages` reducer **appends** to the list — don't return the full list, return only new messages
- `ToolNode` is still available in `langgraph.prebuilt` in v1.x — only `ToolExecutor`/`ToolInvocation` were removed
- `thread_id` in config is **required** when using a checkpointer — missing it means no state is saved
- `version="v2"` in stream/invoke is **opt-in** — existing code using plain dict access still works
- `interrupt()` must be called inside a node function — the graph pauses at that node and resumes from it
- `Command(resume=value)` is used to resume after an interrupt — pass it as the input to `invoke()`
- Conditional edges return either a node name string or `END` — not the node function itself
