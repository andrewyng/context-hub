
# LangChain Python SDK (v1.x)

## Golden Rule

Always import from the correct sub-packages. The monolithic `langchain` package
no longer exports model classes directly — use `langchain_openai`, `langchain_anthropic`,
`langchain_google_genai`, etc. Agents built on `langchain.agents` run on top of LangGraph.

## Install

```bash
pip install langchain langchain-openai langchain-anthropic  # add whichever provider you need
```

##  Wrong imports that agents hallucinate

```python
# WRONG — these no longer exist in v1.x
from langchain.chat_models import ChatOpenAI
from langchain.llms import OpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.schema import HumanMessage
```

##  Correct imports (v1.x)

```python
# Models — always from provider-specific packages
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Core message types
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

# Agents
from langchain.agents import create_tool_calling_agent, AgentExecutor

# Prompts
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Tools
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
```

## Chat Models

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)

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
    return f"Weather in {city}: 72°F, sunny"

@tool
def calculate(expression: str) -> float:
    """Evaluate a math expression. Input must be a valid Python expression."""
    return eval(expression)

# Tools expose: name, description, args_schema (auto-generated from signature + docstring)
print(get_weather.name)         # "get_weather"
print(get_weather.description)  # used by the LLM to decide when to call it
```

## Tool Calling Agent (recommended pattern)

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor

llm = ChatOpenAI(model="gpt-4o", temperature=0)

@tool
def search(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

tools = [search]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder("chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),  # required — holds tool call/result turns
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = agent_executor.invoke({"input": "What is the capital of France?"})
print(result["output"])
```

## Multi-turn Conversation with Memory

```python
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

agent_with_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

# First turn
agent_with_history.invoke(
    {"input": "My name is Naren"},
    config={"configurable": {"session_id": "session-1"}},
)

# Second turn — agent remembers previous context
agent_with_history.invoke(
    {"input": "What's my name?"},
    config={"configurable": {"session_id": "session-1"}},
)
```

## LCEL Chains (LangChain Expression Language)

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Summarize this text: {text}")
chain = prompt | llm | StrOutputParser()

result = chain.invoke({"text": "LangChain is a framework for building LLM apps."})

# Batch
results = chain.batch([{"text": "First doc"}, {"text": "Second doc"}])

# Stream
for chunk in chain.stream({"text": "Long article..."}):
    print(chunk, end="")
```

## Structured Output

```python
from pydantic import BaseModel
from langchain_openai import ChatOpenAI

class ExtractedData(BaseModel):
    name: str
    age: int
    occupation: str

llm = ChatOpenAI(model="gpt-4o")
structured_llm = llm.with_structured_output(ExtractedData)

result = structured_llm.invoke("John is a 30-year-old software engineer.")
print(result.name)        # "John"
print(result.age)         # 30
print(result.occupation)  # "software engineer"
```

## Retrieval-Augmented Generation (RAG)

```python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_texts(
    ["LangGraph is a graph-based agent framework", "LangChain builds on LangGraph"],
    embedding=embeddings,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

prompt = ChatPromptTemplate.from_template(
    "Answer using only this context:\n{context}\n\nQuestion: {question}"
)

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | ChatOpenAI(model="gpt-4o")
    | StrOutputParser()
)

answer = rag_chain.invoke("What is LangGraph?")
```

## Common Gotchas

- `MessagesPlaceholder("agent_scratchpad")` is **required** in the prompt for tool-calling agents — omitting it causes silent failures
- `AgentExecutor` wraps the agent and handles the tool call → tool result → LLM loop automatically
- Use `verbose=True` on `AgentExecutor` during development to see each step
- `with_structured_output()` uses function calling under the hood — model must support tool use
- `RunnableWithMessageHistory` needs `input_messages_key` and `history_messages_key` to match prompt variable names exactly
