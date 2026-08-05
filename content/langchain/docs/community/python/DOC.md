---
name: community
description: "langchain-community package guide for Python covering third-party integrations, loaders, vector stores, tools, and 0.4.2 version notes"
metadata:
  languages: "python"
  versions: "0.4.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "langchain-community,langchain,python,integrations,document-loaders,vectorstores,tools"
---

# langchain-community Python Package Guide

## What It Is

`langchain-community` is the catch-all Python package for community and third-party LangChain integrations. Use it when you need loaders, vector stores, tools, retrievers, utilities, or wrappers that implement LangChain interfaces but do not live in `langchain-core` and do not have a dedicated modern `langchain-*` provider package yet.

Prefer dedicated integration packages when they exist. LangChain's provider docs now center standalone packages such as `langchain-openai`, `langchain-anthropic`, `langchain-qdrant`, and similar provider-specific packages for cleaner versioning, dependency management, and testing.

## Version-Sensitive Notes

- This entry is pinned to the version used here `0.4.2`.
- PyPI lists `0.4.2` as the current package version covered here on 2026-05-29.
- LangChain's Python release policy explicitly says `langchain-community` does not follow the same strict semantic versioning guarantees as `langchain` and `langchain-core`. Pin exact versions when you need reproducible behavior.
- PyPI metadata for `0.4.2` requires Python `>=3.10,<4.0`.
- PyPI metadata for `0.4.2` also shows the package depends on the `1.x` lines of `langchain-core` and `langchain-classic`. Do not mix this package with pre-`1.0` LangChain dependencies.
- The current LangChain integration publishing guidance says new integrations should usually be standalone `langchain-*` packages instead of new additions to the monorepo. Treat `langchain-community` as the compatibility bucket for community or older shared integrations, not the first package to assume for every provider.
- The PyPI project description still contains stale wording that says `langchain-community` is on version `0.0.x`; use the actual PyPI release metadata and current reference docs instead of that older description text.

## Install

Pin the package if your project depends on a known set of community integrations:

```bash
python -m pip install "langchain-community==0.4.2"
```

Common alternatives:

```bash
uv add "langchain-community==0.4.2"
poetry add "langchain-community==0.4.2"
```

In practice you often install this package together with:

- `langchain` when you want the higher-level agent and application APIs
- `langchain-core` when you are composing lower-level runnables and prompts directly
- a dedicated provider package such as `langchain-openai`
- the backend library required by the specific integration, such as `faiss-cpu`, `duckduckgo-search`, `pypdf`, or `unstructured`

Example installs:

```bash
python -m pip install "langchain-community==0.4.2" "langchain-openai"
python -m pip install "langchain-community==0.4.2" "faiss-cpu"
python -m pip install "langchain-community==0.4.2" "duckduckgo-search"
```

## Setup And Configuration

`langchain-community` does not define one package-wide auth scheme. Configuration depends on the specific integration you use.

Practical setup rules:

1. Install the extra dependency required by the integration.
2. Set the provider-specific environment variables for that integration.
3. Keep tracing optional and separate from provider auth.

Typical environment setup when combining community integrations with an OpenAI embedding model and optional LangSmith tracing:

```bash
export OPENAI_API_KEY="sk-..."
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="lsv2_..."
```

Important boundary:

- credentials usually belong to the provider package or vendor SDK, not to `langchain-community` itself
- many integrations will import successfully only after you install their separate backend dependency

## Core Usage

### Load Documents From Local Files

`TextLoader` is a straightforward way to turn local text files into LangChain `Document` objects:

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("notes.txt")
docs = loader.load()

for doc in docs:
    print(doc.page_content[:80])
    print(doc.metadata)
```

For larger corpora, prefer loader APIs such as `lazy_load()` when available so you do not eagerly read everything into memory.

### Build A Local FAISS Vector Store

The official FAISS reference for `langchain-community` documents `FAISS` in this package and calls out the separate `faiss-cpu` dependency.

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

texts = [
    "LangChain Community contains third-party integrations.",
    "FAISS is useful for local similarity search.",
]

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = FAISS.from_texts(texts, embeddings)

results = vector_store.similarity_search("Which package contains third-party integrations?", k=1)

for doc in results:
    print(doc.page_content)
```

Common extension points:

- `similarity_search_with_score(...)` when you need scores
- `save_local(...)` and `load_local(...)` for persistence
- `as_retriever(...)` when you want retriever behavior instead of direct vector-store calls

### Turn A Vector Store Into A Retriever

`FAISS.as_retriever(...)` is the quickest bridge from a local index to retrieval-oriented chains or agents:

```python
retriever = vector_store.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 2, "fetch_k": 4, "lambda_mult": 0.5},
)

docs = retriever.invoke("third-party LangChain integrations")
for doc in docs:
    print(doc.page_content)
```

### Use A Community Tool Wrapper

Tool wrappers in this package follow the normal LangChain tool interface. For example, the DuckDuckGo integration requires the extra `duckduckgo-search` package:

```python
from langchain_community.tools import DuckDuckGoSearchRun

tool = DuckDuckGoSearchRun()
result = tool.invoke("latest LangChain release policy")
print(result)
```

Use these wrappers when you need a LangChain `BaseTool` implementation quickly, but check the LangChain integrations index first in case the provider now has a dedicated package that should be preferred.

## Common Pitfalls

- `langchain-community` is not the default answer for every integration anymore. Check the LangChain integrations index first for a dedicated `langchain-*` package.
- Installing only `langchain-community` is often insufficient. Many integrations need a second package such as `faiss-cpu`, `duckduckgo-search`, `pypdf`, `unstructured`, or a vendor SDK.
- The package has no universal API key. Environment variables are integration-specific.
- Older blog posts often show pre-`1.0` imports, or provider classes that have moved out of `langchain-community` into dedicated packages. Prefer current docs over older snippets.
- Do not assume `langchain-community` version numbers should match `langchain` or `langchain-core` version numbers. They are versioned separately.
- Because `langchain-community` may have breaking changes on minor releases, copying examples across `0.x` minors without pinning can break working code.
- Loader `.load()` methods are eager. For large inputs, use `lazy_load()` or another streaming-friendly path when the loader supports it.
- Some integrations in this package are effectively legacy. If the official provider page says the community path is outdated or points to a standalone package, follow the standalone package.

## What To Reach For First

- Use `langchain-community` for document loaders, vector stores, tools, utilities, and older shared integrations that still live here.
- Use `langchain-core` for prompts, runnables, tools, and shared abstractions.
- Use `langchain` for higher-level agent and application APIs.
- Use dedicated provider packages for models, embeddings, and provider-owned integrations whenever possible.

## Official Sources Used For This Entry

- PyPI package page: `https://pypi.org/project/langchain-community/`
- PyPI release history: `https://pypi.org/project/langchain-community/#history`
- Docs URL: `https://python.langchain.com/api_reference/community/`
- Canonical API reference root: `https://reference.langchain.com/python/langchain-community/`
- LangChain integrations overview: `https://docs.langchain.com/oss/python/integrations/providers/overview`
- LangChain install guide: `https://docs.langchain.com/oss/python/langchain/install`
- LangChain Python release policy: `https://docs.langchain.com/oss/python/release-policy`
- LangChain integration publishing guidance: `https://docs.langchain.com/oss/python/contributing/publish-langchain`
