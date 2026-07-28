# RAG Pipeline Patterns

End-to-end patterns for preparing ADE-parsed documents for Retrieval
Augmented Generation (RAG) systems. Covers embedding computation,
chunking strategies, vector DB ingestion, and query pipelines.

All patterns use the v2 Parse API (`client.v2.parse()`). A v2 parse
response has one top-level `markdown` string plus a `structure` tree
(document > pages > blocks). Each block carries inline `grounding` with
a 1-indexed `page`, a `range` (`{start, end}` offsets into `markdown`),
and a normalized `box` (`xmin`, `ymin`, `xmax`, `ymax`). A block's text
is the Markdown slice `markdown[range.start:range.end]`; there are no
anchor tags to strip. To skip slicing, pass
`options={"inline_markdown": True}` and read `block.markdown` instead.

---

## 1. Blocks to CSV: RAG-Ready Dataset

Extract all blocks from parsed documents into a structured CSV with 18
columns including bounding boxes, sequence info, and metadata. This CSV
can feed any vector DB or search index.

> **Grounding-aware records:** Every record includes `page`, `box_xmin`,
> `box_ymin`, `box_xmax`, `box_ymax` from the block's grounding.
> Preserve these columns when ingesting into a vector DB: they let you
> trace retrieval results back to exact document locations for
> highlighting or citation.

```python
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd

import landingai_ade


def iter_blocks(parse_result: Any):
    """Yield (block, text) pairs from a v2 parse response in reading order."""
    md = parse_result.markdown
    for page in parse_result.structure.children:
        for block in page.children:
            r = block.grounding.range
            yield block, md[r.start:r.end]


def blocks_to_records(
    parse_result: Any,
    document_name: str,
) -> List[Dict[str, Any]]:
    """Convert v2 parse response blocks to flat dicts.

    Each dict has 18 columns suitable for CSV / DataFrame:
    DOCUMENT_NAME, block_id, block_sequence_number,
    block_type, block_content, block_text_length,
    block_word_count, page,
    box_xmin, box_ymin, box_xmax, box_ymax,
    prev_block_id, next_block_id, block_image_path,
    processed_at, ade_version, model_version
    """
    now = datetime.now(timezone.utc).isoformat()
    pairs = list(iter_blocks(parse_result))
    records: List[Dict[str, Any]] = []

    for idx, (block, text) in enumerate(pairs):
        text = text.strip()
        box = block.grounding.box
        records.append({
            "DOCUMENT_NAME": document_name,
            "block_id": block.id,
            "block_sequence_number": idx,
            "block_type": block.type,
            "block_content": text,
            "block_text_length": len(text),
            "block_word_count": len(text.split()) if text else 0,
            "page": block.grounding.page,   # 1-indexed
            "box_xmin": box.xmin,
            "box_ymin": box.ymin,
            "box_xmax": box.xmax,
            "box_ymax": box.ymax,
            "prev_block_id": pairs[idx - 1][0].id if idx > 0 else None,
            "next_block_id": (
                pairs[idx + 1][0].id
                if idx < len(pairs) - 1
                else None
            ),
            "block_image_path": None,
            "processed_at": now,
            "ade_version": landingai_ade.__version__,
            "model_version": parse_result.metadata.model_version,
        })
    return records


def batch_blocks_to_csv(
    results: List[Dict[str, Any]],
    output_path: Path,
) -> pd.DataFrame:
    """Combine block records from multiple documents into one CSV.

    Args:
        results: list of dicts with keys 'name' and 'parse_result'
        output_path: CSV file path
    """
    all_records: List[Dict[str, Any]] = []
    for r in results:
        all_records.extend(
            blocks_to_records(r["parse_result"], r["name"])
        )
    df = pd.DataFrame(all_records)
    df.to_csv(output_path, index=False)
    return df
```

### Usage

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
results = []
for fp in Path("docs/").glob("*.pdf"):
    pr = client.v2.parse(document=fp, model="dpt-3-pro-latest")
    results.append({"name": fp.name, "parse_result": pr})

df = batch_blocks_to_csv(results, Path("all_blocks.csv"))
print(f"{len(df)} blocks from {df['DOCUMENT_NAME'].nunique()} docs")
```

---

## 2. Vector DB Ingestion: ChromaDB

Local persistent vector store using OpenAI embeddings. Good for
prototyping and small-to-medium corpora.

```python
from typing import Any, List

import chromadb
from openai import OpenAI


def ade_blocks_to_chromadb(
    parse_results: List[dict],
    collection_name: str = "ade_documents",
    persist_dir: str = "./chroma_db",
    embedding_model: str = "text-embedding-3-small",
) -> chromadb.Collection:
    """Ingest v2 parse blocks into a persistent ChromaDB collection.

    Args:
        parse_results: list of dicts with 'name' (str) and
                       'parse_result' (V2ParseResponse)
        collection_name: ChromaDB collection name
        persist_dir: directory for persistent storage
        embedding_model: OpenAI embedding model name

    Returns:
        The ChromaDB collection with all blocks ingested.
    """
    openai_client = OpenAI()
    chroma_client = chromadb.PersistentClient(path=persist_dir)
    collection = chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )

    for doc in parse_results:
        name = doc["name"]
        pr = doc["parse_result"]
        md = pr.markdown

        texts, ids, metadatas = [], [], []
        for page in pr.structure.children:
            for block in page.children:
                r = block.grounding.range
                text = md[r.start:r.end].strip()
                if not text:
                    continue
                texts.append(text)
                # Block ids are unique within one response only
                ids.append(f"{name}:{block.id}")
                metadatas.append({
                    "document": name,
                    "block_type": block.type,
                    "page": block.grounding.page,   # 1-indexed
                })

        if not texts:
            continue

        # Generate embeddings in batches of 100
        all_embeddings: List[List[float]] = []
        for i in range(0, len(texts), 100):
            batch = texts[i : i + 100]
            resp = openai_client.embeddings.create(
                input=batch, model=embedding_model
            )
            all_embeddings.extend(
                [e.embedding for e in resp.data]
            )

        collection.add(
            ids=ids,
            documents=texts,
            embeddings=all_embeddings,
            metadatas=metadatas,
        )

    return collection
```

### Query ChromaDB

```python
import chromadb
from openai import OpenAI


def query_chromadb(
    collection: chromadb.Collection,
    question: str,
    n_results: int = 5,
    embedding_model: str = "text-embedding-3-small",
) -> dict:
    """Query the collection and return matching blocks."""
    openai_client = OpenAI()
    resp = openai_client.embeddings.create(
        input=[question], model=embedding_model
    )
    query_embedding = resp.data[0].embedding
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )
```

---

## 3. Vector DB Ingestion: FAISS + LangChain

For LangChain-based RAG pipelines. Uses FAISS for in-memory vector
search.

```python
from typing import List

from langchain.docstore.document import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings


def ade_to_langchain_docs(
    parse_results: List[dict],
) -> List[Document]:
    """Convert v2 parse results to LangChain Documents.

    Each block becomes one Document with metadata including
    source document name, block type, and page number.
    """
    docs: List[Document] = []
    for item in parse_results:
        name = item["name"]
        pr = item["parse_result"]
        md = pr.markdown
        for page in pr.structure.children:
            for block in page.children:
                r = block.grounding.range
                text = md[r.start:r.end].strip()
                if not text:
                    continue
                docs.append(Document(
                    page_content=text,
                    metadata={
                        "source": name,
                        "block_type": block.type,
                        "block_id": block.id,
                        "page": block.grounding.page,
                    },
                ))
    return docs


def build_faiss_index(
    documents: List[Document],
    embedding_model: str = "text-embedding-3-small",
) -> FAISS:
    """Build a FAISS vector store from LangChain Documents."""
    embeddings = OpenAIEmbeddings(model=embedding_model)
    return FAISS.from_documents(documents, embeddings)
```

### RAG Query with LangChain

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI


def build_rag_chain(
    vectorstore,
    model: str = "gpt-4o-mini",
    k: int = 5,
) -> RetrievalQA:
    """Build a RetrievalQA chain from a FAISS index."""
    retriever = vectorstore.as_retriever(
        search_kwargs={"k": k}
    )
    return RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model=model, temperature=0),
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )


# Usage
chain = build_rag_chain(vectorstore)
answer = chain.invoke({"query": "What is the total revenue?"})
print(answer["result"])
for doc in answer["source_documents"]:
    print(f"  - {doc.metadata['source']} p{doc.metadata['page']}")
```

---

## 4. Full RAG Pipeline: End to End

Combines parsing, block extraction, vector DB, and querying in one flow.

```python
from pathlib import Path

from langchain.chains import RetrievalQA
from langchain.docstore.document import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from landingai_ade import LandingAIADE


def build_rag_from_folder(
    input_dir: Path,
    embedding_model: str = "text-embedding-3-small",
    llm_model: str = "gpt-4o-mini",
) -> RetrievalQA:
    """One-shot: parse all docs in a folder and build a
    RAG chain ready for querying.

    Returns a LangChain RetrievalQA chain.
    """
    client = LandingAIADE()
    exts = {".pdf", ".png", ".jpg", ".jpeg"}
    files = [
        p for p in input_dir.glob("*")
        if p.suffix.lower() in exts
    ]

    # Parse all documents (v2)
    docs: list[Document] = []
    for fp in files:
        pr = client.v2.parse(document=fp, model="dpt-3-pro-latest")
        md = pr.markdown
        for page in pr.structure.children:
            for block in page.children:
                r = block.grounding.range
                text = md[r.start:r.end].strip()
                if not text:
                    continue
                docs.append(Document(
                    page_content=text,
                    metadata={
                        "source": fp.name,
                        "block_type": block.type,
                        "page": block.grounding.page,
                    },
                ))

    # Build vector store
    embeddings = OpenAIEmbeddings(model=embedding_model)
    vectorstore = FAISS.from_documents(docs, embeddings)

    # Build chain
    return RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model=llm_model, temperature=0),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(
            search_kwargs={"k": 5}
        ),
        return_source_documents=True,
    )
```

### Usage

```python
chain = build_rag_from_folder(Path("10k_filings/"))
result = chain.invoke(
    {"query": "What were the main risk factors?"}
)
print(result["result"])
```

---

## 5. Embedding Computation

Two approaches for computing embeddings from ADE blocks: **local**
(free, offline, fast) and **API-based** (higher quality, paid). Choose
based on your cost/quality tradeoff.

### Local Embeddings with FastEmbed

Uses [FastEmbed](https://github.com/qdrant/fastembed) to run embedding
models locally. No API key needed, no per-token cost, works offline.

```python
from fastembed import TextEmbedding


def compute_embeddings_local(
    texts: list[str],
    model: str = "BAAI/bge-small-en-v1.5",
) -> list[list[float]]:
    """Embed texts locally with FastEmbed (batched).

    Default model: BAAI/bge-small-en-v1.5 (384 dims, ~33M params).
    Other options:
      - BAAI/bge-base-en-v1.5  (768 dims, ~110M params)
      - sentence-transformers/all-MiniLM-L6-v2  (384 dims)
    """
    embedder = TextEmbedding(model_name=model)
    return [v.tolist() for v in embedder.embed(texts)]
```

### API Embeddings with OpenAI

Higher quality, especially for domain-specific content. Requires
`OPENAI_API_KEY` and incurs per-token cost.

```python
from openai import OpenAI


def compute_embeddings_openai(
    texts: list[str],
    model: str = "text-embedding-3-small",
    batch_size: int = 100,
) -> list[list[float]]:
    """Embed texts via OpenAI API in batches."""
    client = OpenAI()
    all_vecs: list[list[float]] = []
    for i in range(0, len(texts), batch_size):
        resp = client.embeddings.create(
            input=texts[i : i + batch_size], model=model,
        )
        all_vecs.extend(e.embedding for e in resp.data)
    return all_vecs
```

### Embedding Best Practices

| Practice | Why | Example |
|----------|-----|---------|
| **Prepend title/heading** | Gives the embedding semantic context about what the block is about | `f"{title}\n\n{body}"` |
| **Batch all texts in one call** | Faster than embedding one-by-one; both FastEmbed and OpenAI support batching | `embedder.embed(all_texts)` |
| **Store model metadata** | Consumers need to know which model produced the vectors to query correctly | `{"model": "bge-small-en-v1.5", "dims": 384}` |
| **Carry grounding refs** | Enables source attribution: trace retrieval hits back to page + bounding box | `{"page": 2, "box": {"xmin": 0.1, ...}}` |
| **Strip whitespace, skip empty blocks** | Suppressed or empty blocks have zero-length ranges and add noise | `if not text.strip(): continue` |

### Self-Describing Embedding Output

Always store the embedding model name and dimensions alongside the
vector so downstream consumers can interpret it correctly:

```python
def make_embedding_record(
    text: str,
    vector: list[float],
    model: str,
    metadata: dict | None = None,
) -> dict:
    """Wrap a vector with its model info and metadata."""
    return {
        "text": text,
        "embedding": {
            "model": model,
            "dimensions": len(vector),
            "vector": vector,
        },
        "metadata": metadata or {},
    }
```

### Model Selection Guide

| Model | Dims | Cost | Quality | Best for |
|-------|------|------|---------|----------|
| `BAAI/bge-small-en-v1.5` | 384 | Free (local) | Good | Prototyping, cost-sensitive, offline |
| `BAAI/bge-base-en-v1.5` | 768 | Free (local) | Better | Local with higher quality needs |
| `text-embedding-3-small` | 1536 | ~$0.02/1M tokens | High | Production, mixed-domain content |
| `text-embedding-3-large` | 3072 | ~$0.13/1M tokens | Highest | Maximum retrieval accuracy |

---

## 6. Multi-Granularity Embedding Strategy

ADE blocks are the finest-grained unit, but they are not always the
right unit for embedding. Choose the granularity that matches your
retrieval needs.

### Granularity Levels

| Level | Unit | How to build | Best for |
|-------|------|-------------|----------|
| **Block** | Raw ADE block | Walk `structure.children` pages and their `children` | Tables, figures, forms with independent fields |
| **Page** | All blocks on one page | Each `page` node's `grounding.range` covers the whole page | Slide decks, page-oriented documents |
| **Hierarchical** | Group of consecutive blocks | Group by boundary detection (see below) | Narrative docs where answers span paragraphs |
| **Document** | Full markdown or summary | `parse_result.markdown` or a v2 extract summary | Classification, routing, coarse-grained search |

### Block-Level (default)

Each ADE block gets its own embedding. This is what Sections 2 to 4
above use. Fine-grained but may split semantic units across multiple
vectors.

```python
RAG_BLOCK_TYPES = {"text", "table", "card"}

md = parse_result.markdown
texts = []
for page in parse_result.structure.children:
    for block in page.children:
        if block.type not in RAG_BLOCK_TYPES:
            continue
        r = block.grounding.range
        text = md[r.start:r.end].strip()
        if text:
            texts.append(text)
```

### Page-Level

In v2 the structure tree makes page grouping trivial: each `page` node's
own `grounding.range` covers everything on that page.

```python
md = parse_result.markdown
page_texts = []
for page in parse_result.structure.children:
    r = page.grounding.range
    text = md[r.start:r.end].strip()
    if text:
        page_texts.append((page.grounding.page, text))
```

### Hierarchical Chunking

Group consecutive ADE blocks into higher-level semantic units before
embedding. The grouping boundary is **document-specific**: the pattern
is always the same but the boundary detection varies.

- **Heading detection** (regex on block text, or the Section API on a v1 pipeline) for papers and reports
- **Clause boundaries** (regex or a v2 extract call) for contracts
- **Page boundaries**: use the page-level pattern above
- **Fixed-size sliding windows**: N consecutive blocks with overlap

The abstract pattern:

```python
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class BlockGroup:
    """A group of consecutive ADE blocks forming a semantic unit."""
    label: str
    texts: list[str] = field(default_factory=list)
    grounding_refs: list[dict] = field(default_factory=list)

    @property
    def text(self) -> str:
        return "\n".join(t for t in self.texts if t.strip())

    @property
    def embedding_input(self) -> str:
        """Prepend label for better embedding quality."""
        return f"{self.label}\n\n{self.text}"


def group_blocks(
    parse_result: Any,
    is_boundary: Callable[[str, Any], str | None],
) -> list[BlockGroup]:
    """Group v2 parse blocks by a boundary detection function.

    Args:
        parse_result: a V2ParseResponse
        is_boundary: function of (block_text, block) that returns
            a group label (str) if the block starts a new group,
            or None if it continues the current group.

    Returns:
        List of BlockGroup with grounding refs preserved.
    """
    md = parse_result.markdown
    groups: list[BlockGroup] = []
    current: BlockGroup | None = None
    for page in parse_result.structure.children:
        for block in page.children:
            r = block.grounding.range
            text = md[r.start:r.end]
            label = is_boundary(text, block)
            if label is not None:
                current = BlockGroup(label=label)
                groups.append(current)
            if current is None:
                current = BlockGroup(label="(preamble)")
                groups.append(current)
            current.texts.append(text)
            b = block.grounding.box
            current.grounding_refs.append({
                "page": block.grounding.page,
                "box": {
                    "xmin": b.xmin, "ymin": b.ymin,
                    "xmax": b.xmax, "ymax": b.ymax,
                },
            })
    return groups
```

**Example boundary detector** (new group on ATX or numbered headings):

```python
import re


def by_heading(text: str, block) -> str | None:
    first_line = text.strip().split("\n")[0].strip()
    if re.match(r"^#{1,6}\s+", first_line):
        return re.sub(r"^#{1,6}\s+", "", first_line)
    if re.match(r"^\d+(?:\.\d+)*\.?\s+[A-Z]", first_line):
        return first_line
    return None
```

**Using groups for embedding:**

```python
groups = group_blocks(parse_result, by_heading)
texts = [g.embedding_input for g in groups if g.text.strip()]
vectors = compute_embeddings_local(texts)

# Each group carries grounding_refs for source attribution
for g, vec in zip(groups, vectors):
    print(f"{g.label}: {len(g.grounding_refs)} block refs, "
          f"{len(vec)} dims")
```

### Document-Level

Embed the full document markdown or a summary. Useful for routing
queries to the right document before doing fine-grained search.

```python
from pydantic import BaseModel, Field
from landingai_ade import LandingAIADE

client = LandingAIADE()

# Full markdown (may be long: consider truncation)
doc_text = parse_result.markdown[:8000]
doc_vec = compute_embeddings_local([doc_text])[0]


# Or use v2 extract to get a summary first
class DocSummary(BaseModel):
    summary: str = Field(
        description="A 2-3 sentence summary of the document."
    )

er = client.v2.extract(
    markdown=parse_result.markdown,
    schema=DocSummary,   # v2 accepts the Pydantic class directly
)
summary_vec = compute_embeddings_local(
    [er.extraction["summary"]]
)[0]
```

### Decision Matrix

| Document Type | Recommended | Rationale |
|--------------|-------------|-----------|
| Academic papers, reports | Hierarchical (by heading) | Answers span paragraphs within sections |
| Invoices, forms | Block-level | Each field is independent |
| Mixed document batches | Document-level + block-level | Route first, then search within |
| Contracts, legal docs | Hierarchical (by clause) | Clauses are the natural retrieval unit |
| Slide decks | Page-level | Each slide is self-contained |
| Long narratives (books) | Hierarchical (sliding window) | Fixed-size windows with overlap |

---

## Block Filtering Tips

Not all blocks are useful for RAG. Filter by type to improve relevance:

```python
# Keep only text, table, and card blocks (skip logos, scan codes)
RAG_BLOCK_TYPES = {"text", "table", "card"}

md = parse_result.markdown
kept = []
for page in parse_result.structure.children:
    for block in page.children:
        if block.type not in RAG_BLOCK_TYPES:
            continue
        r = block.grounding.range
        text = md[r.start:r.end].strip()
        if text:
            kept.append((block, text))
```

---

## Dependencies

```
# Blocks to CSV only
pip install landingai-ade pandas

# Local embeddings (free, offline)
pip install landingai-ade fastembed

# ChromaDB pipeline (API embeddings)
pip install landingai-ade chromadb openai

# FAISS + LangChain pipeline (API embeddings)
pip install landingai-ade langchain langchain-openai langchain-community faiss-cpu

# Local embeddings + ChromaDB
pip install landingai-ade fastembed chromadb

# Full pipeline (all options)
pip install landingai-ade pandas fastembed chromadb openai langchain langchain-openai langchain-community faiss-cpu
```
