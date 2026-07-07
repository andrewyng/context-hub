# Keenable framework integrations

Keenable ships first-party packages for common agent frameworks. Prefer these over calling the HTTP API by hand: they select the keyless vs keyed endpoint automatically and tag traffic for attribution. All are keyless by default; set `KEENABLE_API_KEY` to lift the rate limit.

## Python

**LangChain** (`langchain-keenable`, PyPI):

```python
from langchain_keenable import KeenableSearch, KeenableFetch

results = KeenableSearch().invoke({"query": "typescript best practices"})
page = KeenableFetch().invoke({"url": results[0]["url"]})
```

**LlamaIndex** (`llama-index-tools-keenable`, PyPI):

```python
from llama_index.tools.keenable import KeenableToolSpec

spec = KeenableToolSpec()               # or KeenableToolSpec(api_key="keen_...")
docs = spec.search("typescript best practices")
page = spec.fetch(docs[0].metadata["url"])
```

**Haystack** (`keenable-haystack`, PyPI):

```python
from haystack_integrations.components.websearch.keenable import KeenableWebSearch
from haystack_integrations.components.fetchers.keenable import KeenableFetcher

hits = KeenableWebSearch(top_k=5).run(query="latest AI agents")
pages = KeenableFetcher().run(urls=hits["links"][:2])
```

**Langflow** (`lfx-keenable`, PyPI): install and restart Langflow; the Keenable components appear in the palette under the **keenable** group.

## JavaScript / TypeScript

**Mastra** (`@keenable/mastra`, npm):

```typescript
import { createKeenableTools } from "@keenable/mastra";

const tools = createKeenableTools(); // keyless; or { apiKey: "keen_..." }
```

**Pi (pi.dev)** (`@keenable/pi-search`, npm): `pi install npm:@keenable/pi-search`. Tools auto-register.

**OpenClaw** (`@keenable/openclaw-search`, npm + ClawHub): `openclaw plugins install @keenable/openclaw-search`, then pick Keenable as the web-search provider.

## MCP (any client)

Hosted MCP server over Streamable HTTP: `https://api.keenable.ai/mcp`. Tools: `search_web_pages` and `fetch_page_content`. Local stdio bridge: `npx -y @keenable/mcp`. Works in Claude Desktop, VS Code / GitHub MCP Registry, Cursor, Cline, and other MCP clients.

## Also built in

Keenable is a built-in web-search option in several platforms, including Dify (Marketplace plugin) and RAGFlow (built-in agent tool). Select "Keenable" in the platform's web-search settings; leave the key empty for keyless.
