# Firecrawl Integrations

Firecrawl is the web-data layer underneath most agent and RAG frameworks — you
rarely need to call the API by hand. If you are already building on one of these
stacks, use its native Firecrawl component instead of reinventing the plumbing.

## Agent & LLM frameworks

| Framework | Firecrawl component | Use it for |
|-----------|--------------------|-----------|
| **LangChain** | `FireCrawlLoader` (Document Loader) | Load scraped/crawled pages as LangChain `Document`s for RAG |
| **LlamaIndex** | `FireCrawlReader` | Ingest web pages/sites as LlamaIndex documents |
| **CrewAI** | Firecrawl tools | Give crews of agents scrape/crawl/search capabilities |
| **Camel AI** | Firecrawl toolkit | Web data for multi-agent workflows |

Docs: [LangChain](https://docs.firecrawl.dev/integrations/langchain) ·
[LlamaIndex](https://docs.firecrawl.dev/integrations/llamaindex) ·
[CrewAI](https://docs.firecrawl.dev/integrations/crewai) ·
[Camel AI](https://docs.firecrawl.dev/integrations/camelai)

## Visual / low-code builders

| Tool | Use it for |
|------|-----------|
| **Dify** | Extract structured data from web pages inside Dify apps |
| **Flowise** | Sync data directly from websites in a Flowise flow |
| **Langflow** | Design visual web-data pipelines |
| **SourceSync.ai** | Build RAG applications backed by web data |

Docs: [Dify](https://docs.firecrawl.dev/integrations/dify) ·
[Flowise](https://docs.firecrawl.dev/integrations/flowise) ·
[Langflow](https://docs.firecrawl.dev/integrations/langflow) ·
[SourceSync.ai](https://docs.firecrawl.dev/integrations/sourcesyncai)

## Platform

- **Vercel Marketplace** — add Firecrawl to a Vercel project with automatic API
  key setup. See [Vercel Marketplace](https://docs.firecrawl.dev/quickstarts/vercel-marketplace).
- **MCP** — any MCP-capable client (Claude Code, Cursor, Windsurf, n8n, …) can use
  Firecrawl with no SDK code. See [mcp.md](mcp.md).

## Picking an integration path

- **Building a RAG pipeline?** Use the LangChain `FireCrawlLoader` or LlamaIndex
  `FireCrawlReader` — they hand you framework-native documents directly.
- **Orchestrating agents?** Use the CrewAI / Camel AI tools, or [MCP](mcp.md) if
  your host speaks it.
- **Low-code / visual?** Dify, Flowise, or Langflow expose Firecrawl as a node.
- **Rolling your own service?** Call the [SDK](sdk.md) directly.

For the current, authoritative list see
[docs.firecrawl.dev/integrations](https://docs.firecrawl.dev/integrations).
