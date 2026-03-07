# RAG Pipeline Patterns

End-to-end patterns for preparing ADE-parsed documents for Retrieval
Augmented Generation (RAG) systems. Covers embedding computation,
chunking strategies, vector DB ingestion, and query pipelines.

---

## 1. Chunks to CSV — RAG-Ready Dataset

Extract all chunks from parsed documents into a structured CSV with 19
columns including bounding boxes, sequence info, and metadata. This CSV
can feed any vector DB or search index.

> **Grounding-aware records:** Every record includes `page`, `box_l`,
> `box_t`, `box_r`, `box_b` from ADE's grounding data. Preserve these
> columns when ingesting into a vector DB — they let you trace retrieval
> results back to exact document locations for highlighting or citation.

```python
import re
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd


def clean_chunk_text(text: str) -> str:
    """Remove anchor tags and strip whitespace."""
    cleaned = re.sub(r"<a id='[^']*'>\s*</a>", "", text)
    return cleaned.strip()


def chunks_to_records(
    parse_result: Any,
    document_name: str,
    model_version: str = "unknown",
) -> List[Dict[str, Any]]:
    """Convert parse result chunks to flat dicts.

    Each dict has 19 columns suitable for CSV / DataFrame:
    DOCUMENT_NAME, chunk_id, chunk_sequence_number,
    chunk_type, chunk_content_raw, chunk_content,
    chunk_text_length, chunk_word_count, page,
    box_l, box_t, box_r, box_b,
    prev_chunk_id, next_chunk_id, chunk_image_path,
    processed_at, ade_version, model_version
    """
    from datetime import datetime, timezone

    import landingai_ade

    chunks = parse_result.chunks or []
    now = datetime.now(timezone.utc).isoformat()
    records: List[Dict[str, Any]] = []

    for idx, ch in enumerate(chunks):
        raw = ch.markdown if hasattr(ch, "markdown") else ""
        clean = clean_chunk_text(raw)
        box = (
            ch.grounding.box
            if hasattr(ch, "grounding")
            and hasattr(ch.grounding, "box")
            else None
        )
        page = (
            ch.grounding.page
            if hasattr(ch, "grounding")
            else None
        )
        records.append({
            "DOCUMENT_NAME": document_name,
            "chunk_id": getattr(ch, "id", None),
            "chunk_sequence_number": idx,
            "chunk_type": getattr(ch, "type", None),
            "chunk_content_raw": raw,
            "chunk_content": clean,
            "chunk_text_length": len(clean),
            "chunk_word_count": len(clean.split()) if clean else 0,
            "page": page,
            "box_l": box.left if box else None,
            "box_t": box.top if box else None,
            "box_r": box.right if box else None,
            "box_b": box.bottom if box else None,
            "prev_chunk_id": (
                chunks[idx - 1].id if idx > 0 else None
            ),
            "next_chunk_id": (
                chunks[idx + 1].id
                if idx < len(chunks) - 1
                else None
            ),
            "chunk_image_path": None,
            "processed_at": now,
            "ade_version": landingai_ade.__version__,
            "model_version": model_version,
        })
    return records


def batch_chunks_to_csv(
    results: List[Dict[str, Any]],
    output_path: Path,
) -> pd.DataFrame:
    """Combine chunk records from multiple documents into
    one CSV.

    Args:
        results: list of dicts with keys 'name' and
                 'parse_result'
        output_path: CSV file path
    """
    all_records: List[Dict[str, Any]] = []
    for r in results:
        all_records.extend(
            chunks_to_records(r["parse_result"], r["name"])
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
    pr = client.parse(document=fp)
    results.append({"name": fp.name, "parse_result": pr})

df = batch_chunks_to_csv(results, Path("all_chunks.csv"))
print(f"{len(df)} chunks from {df['DOCUMENT_NAME'].nunique()} docs")
```

---

## 2. Vector DB Ingestion — ChromaDB

Local persistent vector store using OpenAI embeddings. Good for
prototyping and small-to-medium corpora.

```python
from pathlib import Path
from typing import Any, List

import chromadb
from chromadb.config import Settings
from openai import OpenAI


def ade_chunks_to_chromadb(
    parse_results: List[dict],
    collection_name: str = "ade_documents",
    persist_dir: str = "./chroma_db",
    embedding_model: str = "text-embedding-3-small",
) -> chromadb.Collection:
    """Ingest ADE chunks into a persistent ChromaDB collection.

    Args:
        parse_results: list of dicts with 'name' (str) and
                       'parse_result' (ParseResponse)
        collection_name: ChromaDB collection name
        persist_dir: directory for persistent storage
        embedding_model: OpenAI embedding model name

    Returns:
        The ChromaDB collection with all chunks ingested.
    """
    openai_client = OpenAI()
    chroma_client = chromadb.PersistentClient(
        path=persist_dir
    )
    collection = chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )

    for doc in parse_results:
        name = doc["name"]
        chunks = doc["parse_result"].chunks or []

        texts, ids, metadatas = [], [], []
        for ch in chunks:
            text = ch.markdown if hasattr(ch, "markdown") else ""
            if not text.strip():
                continue
            chunk_id = f"{name}:{ch.id}"
            texts.append(text)
            ids.append(chunk_id)
            metadatas.append({
                "document": name,
                "chunk_type": getattr(ch, "type", "unknown"),
                "page": (
                    ch.grounding.page
                    if hasattr(ch, "grounding")
                    else -1
                ),
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
def query_chromadb(
    collection: chromadb.Collection,
    question: str,
    n_results: int = 5,
    embedding_model: str = "text-embedding-3-small",
) -> dict:
    """Query the collection and return matching chunks."""
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

## 3. Vector DB Ingestion — FAISS + LangChain

For LangChain-based RAG pipelines. Uses FAISS for in-memory vector
search.

```python
from typing import Any, List

from langchain.docstore.document import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings


def ade_to_langchain_docs(
    parse_results: List[dict],
) -> List[Document]:
    """Convert ADE parse results to LangChain Documents.

    Each chunk becomes one Document with metadata including
    source document name, chunk type, and page number.
    """
    docs: List[Document] = []
    for item in parse_results:
        name = item["name"]
        chunks = item["parse_result"].chunks or []
        for ch in chunks:
            text = ch.markdown if hasattr(ch, "markdown") else ""
            if not text.strip():
                continue
            docs.append(Document(
                page_content=text,
                metadata={
                    "source": name,
                    "chunk_type": getattr(ch, "type", "unknown"),
                    "chunk_id": getattr(ch, "id", ""),
                    "page": (
                        ch.grounding.page
                        if hasattr(ch, "grounding")
                        else -1
                    ),
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
    vectorstore: FAISS,
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

## 4. Full RAG Pipeline — End to End

Combines parsing, chunking, vector DB, and querying into one flow.

```python
import asyncio
from pathlib import Path

from langchain.chains import RetrievalQA
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

    # Parse all documents
    parse_results = []
    for fp in files:
        pr = client.parse(document=fp)
        parse_results.append({"name": fp.name, "parse_result": pr})

    # Convert to LangChain docs
    docs = ade_to_langchain_docs(parse_results)

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

Two approaches for computing embeddings from ADE chunks: **local**
(free, offline, fast) and **API-based** (higher quality, paid). Choose
based on your cost/quality tradeoff.

### Local Embeddings with FastEmbed

Uses [FastEmbed](https://github.com/qdrant/fastembed) to run embedding
models locally. No API key needed, no per-token cost, works offline.

```python
from typing import Any

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
| **Prepend title/heading** | Gives the embedding semantic context about what the chunk is about | `f"{title}\n\n{body}"` |
| **Batch all texts in one call** | Faster than embedding one-by-one; both FastEmbed and OpenAI support batching | `embedder.embed(all_texts)` |
| **Store model metadata** | Consumers need to know which model produced the vectors to query correctly | `{"model": "bge-small-en-v1.5", "dims": 384}` |
| **Carry grounding refs** | Enables source attribution — trace retrieval hits back to page + bounding box | `{"page": 2, "box": {...}}` |
| **Clean anchor tags first** | ADE chunks contain `<a id='...'>` tags that add noise to embeddings | `re.sub(r"<a id='[^']*'>\s*</a>", "", text)` |

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

ADE chunks are the finest-grained unit, but they're not always the
right unit for embedding. Choose the granularity that matches your
retrieval needs.

### Granularity Levels

| Level | Unit | How to build | Best for |
|-------|------|-------------|----------|
| **Chunk** | Raw ADE chunk | Direct from `parse_result.chunks` | Tables, figures, forms with independent fields |
| **Hierarchical** | Group of consecutive chunks | Group by boundary detection (see below) | Narrative docs where answers span paragraphs |
| **Document** | Full markdown or summary | `parse_result.markdown` or ADE extract summary | Classification, routing, coarse-grained search |

### Chunk-Level (default)

Each ADE chunk gets its own embedding. This is what Sections 2–4 above
use. Fine-grained but may split semantic units across multiple vectors.

```python
# Already shown in Sections 2-4 — each chunk → one embedding
texts = [
    clean_chunk_text(ch.markdown)
    for ch in parse_result.chunks
    if ch.markdown.strip()
    and getattr(ch, "type", "") in {"text", "table", "card"}
]
```

### Hierarchical Chunking

Group consecutive ADE chunks into higher-level semantic units before
embedding. The grouping boundary is **document-specific** — the pattern
is always the same but the boundary detection varies:

- **Heading detection** (regex or ADE extract) — for papers, reports
- **Clause boundaries** (ADE split API or extract) — for contracts
- **Page boundaries** — simple, works for any document
- **Fixed-size sliding windows** — N consecutive chunks with overlap

The abstract pattern:

```python
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class ChunkGroup:
    """A group of consecutive ADE chunks forming a semantic unit."""
    label: str
    chunks: list[Any] = field(default_factory=list)
    grounding_refs: list[dict] = field(default_factory=list)

    @property
    def text(self) -> str:
        return "\n".join(
            clean_chunk_text(ch.markdown)
            for ch in self.chunks if ch.markdown.strip()
        )

    @property
    def embedding_input(self) -> str:
        """Prepend label for better embedding quality."""
        return f"{self.label}\n\n{self.text}"


def group_chunks(
    chunks: list[Any],
    is_boundary: Callable[[Any], str | None],
) -> list[ChunkGroup]:
    """Group ADE chunks by a boundary detection function.

    Args:
        chunks: ADE parse_result.chunks
        is_boundary: function that returns a group label
            (str) if the chunk starts a new group, or
            None if it continues the current group.

    Returns:
        List of ChunkGroup with grounding refs preserved.
    """
    groups: list[ChunkGroup] = []
    current: ChunkGroup | None = None
    for ch in chunks:
        label = is_boundary(ch)
        if label is not None:
            current = ChunkGroup(label=label)
            groups.append(current)
        if current is None:
            current = ChunkGroup(label="(preamble)")
            groups.append(current)
        current.chunks.append(ch)
        if hasattr(ch, "grounding"):
            b = ch.grounding.box
            current.grounding_refs.append({
                "page": ch.grounding.page,
                "box": {
                    "left": b.left, "top": b.top,
                    "right": b.right, "bottom": b.bottom,
                },
            })
    return groups
```

**Example boundary detectors:**

```python
import re

# Page-based: new group every page
def by_page(ch: Any) -> str | None:
    page = ch.grounding.page if hasattr(ch, "grounding") else -1
    return f"Page {page + 1}" if not hasattr(by_page, "_last") or by_page._last != page else None
    # (simplified — use a closure or class for production)

# Heading-based: new group on ATX or numbered headings
def by_heading(ch: Any) -> str | None:
    text = re.sub(r"<a id='[^']*'></a>\s*", "", ch.markdown or "").strip()
    first_line = text.split("\n")[0].strip()
    if re.match(r"^#{1,6}\s+", first_line):
        return re.sub(r"^#{1,6}\s+", "", first_line)
    if re.match(r"^\d+(?:\.\d+)*\.?\s+[A-Z]", first_line):
        return first_line
    return None
```

**Using groups for embedding:**

```python
groups = group_chunks(parse_result.chunks, by_heading)
texts = [g.embedding_input for g in groups if g.text.strip()]
vectors = compute_embeddings_local(texts)

# Each group carries grounding_refs for source attribution
for g, vec in zip(groups, vectors):
    print(f"{g.label}: {len(g.grounding_refs)} chunk refs, "
          f"{len(vec)} dims")
```

### Document-Level

Embed the full document markdown or a summary. Useful for routing
queries to the right document before doing fine-grained search.

```python
# Full markdown (may be long — consider truncation)
doc_text = parse_result.markdown[:8000]
doc_vec = compute_embeddings_local([doc_text])[0]

# Or use ADE extract to get a summary first
from landingai_ade.lib import pydantic_to_json_schema
from pydantic import BaseModel, Field

class DocSummary(BaseModel):
    summary: str = Field(
        description="A 2-3 sentence summary of the document."
    )

er = client.extract(
    schema=pydantic_to_json_schema(DocSummary),
    markdown=parse_result.markdown,
)
summary_vec = compute_embeddings_local(
    [er.extraction["summary"]]
)[0]
```

### Decision Matrix

| Document Type | Recommended | Rationale |
|--------------|-------------|-----------|
| Academic papers, reports | Hierarchical (by heading) | Answers span paragraphs within sections |
| Invoices, forms | Chunk-level | Each field is independent |
| Mixed document batches | Document-level + chunk-level | Route first, then search within |
| Contracts, legal docs | Hierarchical (by clause) | Clauses are the natural retrieval unit |
| Slide decks | Chunk-level (by page) | Each slide is self-contained |
| Long narratives (books) | Hierarchical (sliding window) | Fixed-size windows with overlap |

---

## Chunk Filtering Tips

Not all chunks are useful for RAG. Filter by type to improve relevance:

```python
# Keep only text and table chunks (skip logos, scan codes)
RAG_CHUNK_TYPES = {"text", "table", "card"}

docs = [
    Document(page_content=ch.markdown, metadata={...})
    for ch in parse_result.chunks
    if getattr(ch, "type", "") in RAG_CHUNK_TYPES
    and ch.markdown.strip()
]
```

---

## Dependencies

```
# Chunks to CSV only
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
