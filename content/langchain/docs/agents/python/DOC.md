---
name: agents
description: "LangChain Python SDK v1.x guidance for building agents with create_agent on top of LangGraph, with correct sub-package imports for langchain_openai, langchain_anthropic, and other providers"
metadata:
  languages: "python"
  versions: "1.3.2"
  revision: 2
  updated-on: "2026-05-29"
  source: community
  tags: "langchain,langgraph,python,agents,llm,ai,openai,anthropic"
---

# LangChain Python SDK Agents (v1.x)

## Golden Rule

Always import from the correct sub-packages. The monolithic `langchain` package
no longer exports model classes directly — use `langchain_openai`, `langchain_anthropic`,
`langchain_google_genai`, etc. In v1.x the recommended agent API is
`langchain.agents.create_agent`, which runs on top of LangGraph. The legacy
`AgentExecutor` / `create_tool_calling_agent` / `initialize_agent` flow has
moved to `langchain-classic`.

## Install

```bash
pip install langchain langchain-openai langchain-anthropic  # add whichever provider you need
```

## Wrong imports that agents hallucinate

```python
# WRONG — these no longer exist in v1.x langchain
from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.schema import HumanMessage
```

## Correct imports (v1.x)

```python
# Models — always from provider-specific packages
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Or use the universal initializer
from langchain.chat_models import init_chat_model

# Core message types
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

# Agents (v1 API)
from langchain.agents import create_agent

# Prompts
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Tools
from langchain_core.tools import tool
```

## Chat Models

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)

# Invoke
response = llm.invoke([HumanMessage(content="Hello")])
print(response.content)

# Stream
for chunk in llm.stream([HumanMessage(content="Tell me a joke")]):
    print(chunk.content, end="", flush=True)

# Async
response = await llm.ainvoke([HumanMessage(content="Hello")])
```

## Defining Tools

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 72F, sunny"

@tool
def calculate(expression: str) -> float:
    """Evaluate a math expression. Input must be a valid Python expression."""
    return eval(expression)

# Tools expose: name, description, args_schema (auto-generated from signature + docstring)
print(get_weather.name)         # "get_weather"
print(get_weather.description)  # used by the LLM to decide when to call it
```

## Create An Agent (v1 recommended pattern)

`create_agent` builds a tool-using agent compiled as a LangGraph runnable. It
handles the model -> tool call -> tool result -> model loop for you.

```python
from langchain.agents import create_agent
from langchain_core.tools import tool

@tool
def search(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[search],
    system_prompt="You are a helpful assistant. Be concise.",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "What is the capital of France?"}]}
)

# The final answer is the last message in the returned state.
print(result["messages"][-1].content)
```

Key things to know:

- `model` accepts either a provider-qualified string such as `"openai:gpt-4.1-mini"`
  or a pre-built chat model instance from `init_chat_model(...)` or
  `ChatOpenAI(...)`.
- Agent input is a dict shaped like `{"messages": [...]}` where each entry is
  either a LangChain message object or an OpenAI-style `{"role", "content"}`
  dict.
- Agent output is the full message-list state. The model's final reply is
  `result["messages"][-1]`.

## Streaming Agent Steps

```python
for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "Search for python 3.13 features"}]},
    stream_mode="updates",
):
    print(chunk)
```

Stream modes inherited from LangGraph include `"updates"` (per-node updates),
`"values"` (full state after each step), and `"messages"` (token-level chat
streaming).

## Multi-turn Conversation With Checkpointing

Because `create_agent` returns a compiled LangGraph, conversation memory is
handled by a checkpointer + `thread_id`, not `RunnableWithMessageHistory`.

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[],
    checkpointer=checkpointer,
)

config = {"configurable": {"thread_id": "session-1"}}

agent.invoke({"messages": [{"role": "user", "content": "My name is Naren."}]}, config)
result = agent.invoke({"messages": [{"role": "user", "content": "What is my name?"}]}, config)
print(result["messages"][-1].content)
```

Use a persistent checkpointer (`langgraph-checkpoint-postgres`,
`langgraph-checkpoint-sqlite`) in production. `InMemorySaver` is debug-only.

## Structured Output From An Agent

`create_agent` accepts a Pydantic `response_format` that constrains the final
answer to a validated schema:

```python
from pydantic import BaseModel
from langchain.agents import create_agent

class WeatherReport(BaseModel):
    city: str
    temperature_f: int
    summary: str

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[],
    response_format=WeatherReport,
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "Make up a weather report for Paris."}]}
)
print(result["structured_response"])  # WeatherReport(...)
```

## Structured Output From A Bare Model

For non-agent extraction, `with_structured_output` on a chat model is the
canonical helper:

```python
from pydantic import BaseModel
from langchain_openai import ChatOpenAI

class ExtractedData(BaseModel):
    name: str
    age: int
    occupation: str

llm = ChatOpenAI(model="gpt-4.1-mini")
structured_llm = llm.with_structured_output(ExtractedData)

result = structured_llm.invoke("John is a 30-year-old software engineer.")
print(result.name, result.age, result.occupation)
```

## LCEL Chains (Composition)

Plain runnable composition still works for non-agent pipelines:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4.1-mini")
prompt = ChatPromptTemplate.from_template("Summarize this text: {text}")
chain = prompt | llm | StrOutputParser()

result = chain.invoke({"text": "LangChain is a framework for building LLM apps."})

# Batch
results = chain.batch([{"text": "First doc"}, {"text": "Second doc"}])

# Stream
for chunk in chain.stream({"text": "Long article..."}):
    print(chunk, end="")
```

## Common Gotchas

- The v1 agent API is `create_agent`, not `create_tool_calling_agent` +
  `AgentExecutor`. The latter pair was removed from `langchain` and now lives
  in `langchain-classic` for migration only.
- Agent input must be a dict with a `messages` list. Passing a bare string or
  the wrong key produces schema errors before the model is ever called.
- Conversation memory in v1 uses a LangGraph checkpointer plus
  `configurable.thread_id`, not `RunnableWithMessageHistory`.
- `response_format=` returns the typed object on `result["structured_response"]`,
  separately from the message list.
- `with_structured_output()` uses tool/function calling under the hood — the
  model must support tool use.
- Provider model classes live in their own packages
  (`langchain_openai`, `langchain_anthropic`, ...). They are not re-exported
  from `langchain`.
