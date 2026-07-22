# Wiring SERPdive into an agent

Same engine behind every surface. Pick by where the agent already lives.

## REST

```bash
curl -X POST https://api.serpdive.com/v1/search \
  -H "Authorization: Bearer sd_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "what changed in the EU AI Act this month", "max_results": 5}'
```

## Python

```bash
pip install serpdive
```

```python
from serpdive import SerpDive

client = SerpDive()  # reads SERPDIVE_API_KEY

response = client.search("q3 2026 nvidia datacenter revenue", max_results=5)
for r in response.results:
    print(r.title, r.url)
    print(r.content)
```

Async, for agent loops that fan out:

```python
import asyncio
from serpdive import AsyncSerpDive

async def research(questions: list[str]):
    async with AsyncSerpDive() as client:
        return await asyncio.gather(*(client.search(q, max_results=3) for q in questions))
```

## TypeScript

```bash
npm install serpdive
```

```ts
import { SerpDive } from "serpdive";

const client = new SerpDive();
const { results } = await client.search("latest postgres 18 release notes", {
  maxResults: 5,
});
```

## LangChain

```bash
pip install langchain-serpdive
```

```python
from langchain_serpdive import SerpdiveSearch

tool = SerpdiveSearch(max_results=5)
agent = create_react_agent(model, [tool])
```

## LlamaIndex

```bash
pip install llama-index-tools-serpdive
```

```python
from llama_index.tools.serpdive import SerpdiveToolSpec

tools = SerpdiveToolSpec().to_tool_list()
```

The tool spec returns `Document` objects, so results drop straight into an
index or a query engine.

## Vercel AI SDK

```ts
import { tool } from "ai";
import { z } from "zod";
import { SerpDive } from "serpdive";

const client = new SerpDive();

export const webSearch = tool({
  description: "Search the live web and return extracted, answer-ready content.",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const { results } = await client.search(query, { maxResults: 5 });
    return results.map((r) => ({ url: r.url, title: r.title, content: r.content }));
  },
});
```

## MCP

Hosted, nothing to install. Works with Claude Code, Claude Desktop, Cursor and
any MCP client.

```bash
claude mcp add --transport http serpdive https://mcp.serpdive.com \
  --header "Authorization: Bearer sd_live_YOUR_KEY"
```

For clients that only accept a URL:

```json
{
  "mcpServers": {
    "serpdive": {
      "url": "https://mcp.serpdive.com/?key=sd_live_YOUR_KEY"
    }
  }
}
```

For stdio-only clients, the same tool runs locally:

```json
{
  "mcpServers": {
    "serpdive": {
      "command": "npx",
      "args": ["-y", "serpdive-mcp"],
      "env": { "SERPDIVE_API_KEY": "sd_live_YOUR_KEY" }
    }
  }
}
```

The server exposes one tool, `serpdive_search`, with the same parameters as
the API. Searches through MCP are billed exactly like API calls: same credits,
same rate limits.

## Agent-readable docs

For agents that prefer to read the contract themselves:

- https://serpdive.com/llms.txt
- https://serpdive.com/docs.md
- https://serpdive.com/openapi.json
