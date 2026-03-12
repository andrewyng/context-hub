# Framework Integrations

## Table of Contents

- [LangChain](#langchain)
- [Pydantic AI](#pydantic-ai)
- [LlamaIndex](#llamaindex)
- [Agno](#agno)
- [OpenAI Function Calling](#openai-function-calling)
- [Anthropic Tool Calling](#anthropic-tool-calling)
- [Google ADK](#google-adk)
- [Vercel AI SDK](#vercel-ai-sdk)
- [CrewAI](#crewai)
- [No-Code Platforms](#no-code-platforms)

---

## LangChain

We recommend the official `langchain-tavily` package for LangChain integrations.

> Warning: `langchain_community.tools.tavily_search.tool` is deprecated. Migrate to `langchain-tavily` for actively maintained Search, Extract, Map, Crawl, and Research tools.

### Installation

```bash
pip install -U langchain-tavily
```

### Credentials

```python
import getpass
import os

if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")
```

### Tavily Search

**Available parameters**
- `max_results` (default: `5`)
- `topic` (`"general"`, `"news"`, `"finance"`)
- `include_answer`
- `include_raw_content`
- `include_images`
- `include_image_descriptions`
- `search_depth` (`"basic"` or `"advanced"`)
- `time_range` (`"day"`, `"week"`, `"month"`, `"year"`)
- `start_date` (`YYYY-MM-DD`)
- `end_date` (`YYYY-MM-DD`)
- `include_domains`
- `exclude_domains`
- `include_usage`

**Instantiation**

```python
from langchain_tavily import TavilySearch

tavily_search = TavilySearch(
    max_results=5,
    topic="general"
)
```

**Invoke directly with args**
- Required: `query`
- Can also be overridden at invocation: `include_images`, `search_depth`, `time_range`, `include_domains`, `exclude_domains`, `start_date`, `end_date`
- `include_answer` and `include_raw_content` should be set at instantiation time for predictable response sizes

```python
result = tavily_search.invoke({"query": "What happened at the last Wimbledon?"})
```

**Use with agent**

```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

agent = create_agent(
    model=ChatOpenAI(model="gpt-5"),
    tools=[tavily_search],
    system_prompt="You are a helpful research assistant. Use web search to find accurate, up-to-date information.",
)
response = agent.invoke({
    "messages": [{
        "role": "user",
        "content": "What is the most popular sport in the world? Include only Wikipedia sources.",
    }]
})
```

Tip: include today's date in the system prompt for time-aware queries.

### Tavily Extract

**Available parameters**
- `extract_depth` (`"basic"` or `"advanced"`)
- `include_images`

```python
from langchain_tavily import TavilyExtract

tavily_extract = TavilyExtract(
    extract_depth="basic",  # or "advanced"
    # include_images=False,
)

result = tavily_extract.invoke({
    "urls": ["https://en.wikipedia.org/wiki/Lionel_Messi"]
})
```

### Tavily Map/Crawl

```python
from langchain_tavily import TavilyMap

tavily_map = TavilyMap()

result = tavily_map.invoke({
    "url": "https://docs.example.com",
    "instructions": "Find all documentation and tutorial pages"
})
# Returns: {"base_url": ..., "results": [urls...], "response_time": ...}
```

```python
from langchain_tavily import TavilyCrawl

tavily_crawl = TavilyCrawl()

result = tavily_crawl.invoke({
    "url": "https://docs.example.com",
    "instructions": "Extract API documentation and code examples"
})
# Returns: {"base_url": ..., "results": [{url, raw_content}...], "response_time": ...}
```

### Tavily Research

**Available parameters**
- `input` (required)
- `model` (`"mini"`, `"pro"`, `"auto"`)
- `output_schema`
- `stream`
- `citation_format` (`"numbered"`, `"mla"`, `"apa"`, `"chicago"`)

```python
from langchain_tavily import TavilyResearch

tavily_research = TavilyResearch()

result = tavily_research.invoke({
    "input": "Research the latest developments in AI and summarize key trends.",
    "model": "mini",
    "citation_format": "apa"
})
```

### Tavily Get Research

```python
from langchain_tavily import TavilyGetResearch

tavily_get_research = TavilyGetResearch()
final = tavily_get_research.invoke({"request_id": result["request_id"]})
```

---

## Pydantic AI

Tavily is available for integration through Pydantic AI.

### Introduction

Integrate Tavily with Pydantic AI to enhance your AI agents with powerful web search capabilities. Pydantic AI provides a framework for building AI agents with tools, making it easy to incorporate real-time web search and data extraction into your applications.

### Step-by-Step Integration Guide

#### Step 1: Install Required Packages

Install the necessary Python packages:

```bash
pip install "pydantic-ai-slim[tavily]"
```

#### Step 2: Set Up API Keys

- Tavily API Key: [Get your Tavily API key](https://app.tavily.com/home)

Set this as an environment variable:

```bash
export TAVILY_API_KEY=your_tavily_api_key
```

#### Step 3: Initialize Pydantic AI Agent with Tavily Tools

```python
import os
from pydantic_ai.agent import Agent
from pydantic_ai.common_tools.tavily import tavily_search_tool

# Get API key from environment
api_key = os.getenv("TAVILY_API_KEY")
assert api_key is not None

# Initialize the agent with Tavily tools
agent = Agent(
    "openai:o3-mini",
    tools=[tavily_search_tool(api_key)],
    system_prompt="Search Tavily for the given query and return the results.",
)
```

#### Step 4: Example Use Cases

```python
# Example 1: Basic search for news
result = agent.run_sync("Tell me the top news in the GenAI world, give me links.")
print(result.output)
```

---

## LlamaIndex

```python
from llama_index.tools.tavily_research import TavilyToolSpec

# Initialize tools
tavily_tool = TavilyToolSpec(api_key="tvly-YOUR_API_KEY")
tools = tavily_tool.to_tool_list()

# Use with agent
from llama_index.agent.openai import OpenAIAgent

agent = OpenAIAgent.from_tools(tools)
response = agent.chat("What are the latest AI developments?")
```

---

## Agno

Tavily is available for integration through Agno, a lightweight framework for building agents with tools, memory, and reasoning.

### Introduction

Integrate Tavily with Agno to enhance your AI agents with powerful web search capabilities. Agno makes it easy to incorporate real-time web search and data extraction into your AI applications.

### Step-by-Step Integration Guide

#### Step 1: Install Required Packages

```bash
pip install agno tavily-python
```

#### Step 2: Set Up API Keys

- Tavily API Key: [Get your Tavily API key](https://app.tavily.com/home)
- OpenAI API Key: [Get your OpenAI API key](https://platform.openai.com/api-keys)

Set these as environment variables:

```bash
export TAVILY_API_KEY=your_tavily_api_key
export OPENAI_API_KEY=your_openai_api_key
```

#### Step 3: Initialize Agno Agent with Tavily Tools

```python
from agno.agent import Agent
from agno.tools.tavily import TavilyTools

# Initialize the agent with Tavily tools
agent = Agent(
    tools=[
        TavilyTools(
            search=True,             # Enable search functionality
            max_tokens=8000,         # Increase max tokens for detailed results
            search_depth="advanced", # Use advanced search for comprehensive results
            format="markdown",       # Format results as markdown
        )
    ],
    show_tool_calls=True,
)
```

#### Step 4: Example Use Cases

```python
# Example 1: Basic search with default parameters
agent.print_response("Latest developments in quantum computing", markdown=True)

# Example 2: Market research with multiple parameters
agent.print_response(
    "Analyze the competitive landscape of AI-powered customer service solutions in 2026, "
    "focusing on market leaders and emerging trends",
    markdown=True,
)

# Example 3: Technical documentation search
agent.print_response(
    "Find the latest documentation and tutorials about Python async programming, "
    "focusing on asyncio and FastAPI",
    markdown=True,
)

# Example 4: News aggregation
agent.print_response(
    "Gather the latest news about artificial intelligence from tech news websites "
    "published in the last week",
    markdown=True,
)
```

### Additional Use Cases

- Content curation: Gather and organize information from multiple sources
- Real-time data integration: Keep your AI agents up to date with the latest information
- Technical documentation: Search and analyze technical documentation
- Market analysis: Conduct comprehensive market research and analysis

---

## OpenAI Function Calling

Define Tavily as an OpenAI function:

```python
from openai import OpenAI
from tavily import TavilyClient
import json

openai_client = OpenAI()
tavily_client = TavilyClient()

tools = [{
    "type": "function",
    "function": {
        "name": "web_search",
        "description": "Search the web for current information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query"
                }
            },
            "required": ["query"]
        }
    }
}]

def handle_tool_call(tool_call):
    if tool_call.function.name == "web_search":
        args = json.loads(tool_call.function.arguments)
        return tavily_client.search(args["query"])

# Chat completion with tools
response = openai_client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "What are the latest AI trends?"}],
    tools=tools
)

if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    search_results = handle_tool_call(tool_call)

    # Continue conversation with results
    messages = [
        {"role": "user", "content": "What are the latest AI trends?"},
        response.choices[0].message,
        {"role": "tool", "tool_call_id": tool_call.id, "content": json.dumps(search_results)}
    ]
    final = openai_client.chat.completions.create(
        model="gpt-4.1",
        messages=messages
    )
```

---

## Anthropic Tool Calling

Integrate Tavily with Anthropic Claude to add real-time web search in tool-calling workflows.

### Installation

```bash
pip install anthropic tavily-python
```

### Setup

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

### Using Tavily With Anthropic Tool Calling

```python
import json
import os
from anthropic import Anthropic
from tavily import TavilyClient

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
MODEL_NAME = "claude-sonnet"
```

### Implementation

#### System prompt

```python
SYSTEM_PROMPT = (
    "You are a research assistant. Use the tavily_search tool when needed. "
    "After tools run and tool results are provided back to you, produce a concise, "
    "well-structured summary with key bullets and a Sources section listing URLs."
)
```

#### Tool schema

```python
tools = [
    {
        "name": "tavily_search",
        "description": "Search the web using Tavily and return relevant links and summaries.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query string."},
                "max_results": {"type": "integer", "default": 5},
                "search_depth": {
                    "type": "string",
                    "enum": ["basic", "advanced"],
                    "default": "basic",
                },
            },
            "required": ["query"],
        },
    }
]
```

#### Tool execution

```python
def tavily_search(**kwargs):
    return tavily_client.search(**kwargs)

def process_tool_call(name, args):
    if name == "tavily_search":
        return tavily_search(**args)
    raise ValueError(f"Unknown tool: {name}")
```

#### Main chat function

```python
def chat_with_claude(user_message: str):
    # Call 1: allow tool use
    initial_response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": [{"type": "text", "text": user_message}]}],
        tools=tools,
    )

    # If Claude answers without tools, return text directly
    if initial_response.stop_reason != "tool_use":
        return "".join(
            block.text for block in initial_response.content
            if getattr(block, "type", None) == "text"
        )

    # Execute all requested tools
    tool_result_blocks = []
    for block in initial_response.content:
        if getattr(block, "type", None) == "tool_use":
            result = process_tool_call(block.name, block.input)
            tool_result_blocks.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                }
            )

    # Call 2: send tool results and ask Claude for final synthesis
    final_response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": [{"type": "text", "text": user_message}]},
            {"role": "assistant", "content": initial_response.content},
            {"role": "user", "content": tool_result_blocks},
            {
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": "Please synthesize the final answer now based on the tool results above. Include 3-7 bullets and a Sources section with URLs.",
                }],
            },
        ],
    )

    return "".join(
        block.text for block in final_response.content
        if getattr(block, "type", None) == "text"
    )
```

### Usage example

```python
chat_with_claude("What is trending now in the agents space in 2026?")
```

Reference: https://docs.tavily.com/documentation/integrations/anthropic

---

## Google ADK

Google ADK can connect to Tavily through Tavily's remote MCP server, giving your Gemini-based agent live search, extraction, and site exploration capabilities.

### Prerequisites

- Python 3.9+
- Tavily API key: https://app.tavily.com/home
- Gemini API key: https://aistudio.google.com/app/apikey

### Installation

```bash
pip install google-adk mcp
```

### Agent Setup

```python
import os
from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPServerParams
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset

tavily_api_key = os.getenv("TAVILY_API_KEY")

root_agent = Agent(
    model="gemini-2.5-pro",
    name="tavily_agent",
    instruction=(
        "You are a helpful assistant that uses Tavily to search the web, "
        "extract content, and explore websites. Use Tavily tools to provide "
        "up-to-date information."
    ),
    tools=[
        MCPToolset(
            connection_params=StreamableHTTPServerParams(
                url="https://mcp.tavily.com/mcp/",
                headers={"Authorization": f"Bearer {tavily_api_key}"},
            )
        )
    ],
)
```

### Environment Variables

```bash
export GOOGLE_API_KEY="your_gemini_api_key_here"
export TAVILY_API_KEY="your_tavily_api_key_here"
```

### Run

```bash
adk create my_agent
adk run my_agent
# Optional web UI:
adk web --port 8000
```

### Available Tavily MCP tools

- `tavily-search`
- `tavily-extract`
- `tavily-map`
- `tavily-crawl`

Reference: https://docs.tavily.com/documentation/integrations/google-adk

---

## Vercel AI SDK

The `@tavily/ai-sdk` package provides pre-built tools for Vercel AI SDK v5.

### Installation

```bash
npm install ai @ai-sdk/openai @tavily/ai-sdk
```

### Usage

```typescript
import { tavilySearch, tavilyCrawl } from "@tavily/ai-sdk";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Search
const result = await generateText({
  model: openai("gpt-4.1"),
  prompt: "What are the latest AI developments?",
  tools: {
    tavilySearch: tavilySearch({
      maxResults: 5,
      searchDepth: "advanced",
    }),
  },
});

// Crawl
const crawlResult = await generateText({
  model: openai("gpt-4.1"),
  prompt: "Crawl tavily.com and summarize their features",
  tools: {
    tavilyCrawl: tavilyCrawl({
      maxDepth: 2,
      limit: 50,
    }),
  },
});
```

**Available tools:** `tavilySearch`, `tavilyExtract`, `tavilyCrawl`, `tavilyMap`

---

## CrewAI

CrewAI provides built-in Tavily tools for multi-agent workflows.

### Installation

```bash
pip install 'crewai[tools]'
```

### Usage

```python
import os
from crewai import Agent, Task, Crew
from crewai_tools import TavilySearchTool, TavilyExtractTool

os.environ["TAVILY_API_KEY"] = "your-api-key"

# Search tool
search_tool = TavilySearchTool()

# Create agent with Tavily
researcher = Agent(
    role="Research Analyst",
    goal="Find and analyze information on given topics",
    tools=[search_tool],
    backstory="Expert at finding relevant information online"
)

task = Task(
    description="Research the latest developments in quantum computing",
    expected_output="A comprehensive summary with sources",
    agent=researcher
)

crew = Crew(agents=[researcher], tasks=[task])
result = crew.kickoff()
```

---

## No-Code Platforms

Tavily integrates with popular no-code automation platforms:

| Platform | Features | Best For |
|----------|----------|----------|
| **Zapier** | Search, Extract | CRM enrichment, automated research |
| **Make** | Search, Extract | Complex workflows, multi-step automations |
| **n8n** | Search, Extract, AI Agent tool | Self-hosted, AI agent workflows |
| **Dify** | Search, Extract | No-code AI apps, chatflows |
| **FlowiseAI** | Search | Visual LLM builders, RAG systems |
| **Langflow** | Search, Extract | Visual agent building |

---

## Additional Integrations
See the [full integrations documentation](https://docs.tavily.com/documentation/integrations) for complete guides.
