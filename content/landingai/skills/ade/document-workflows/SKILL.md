---
name: document-workflows
description: "Builds end-to-end document processing pipelines using LandingAI ADE. Covers batch and async processing, classify-then-extract workflows for mixed document types, RAG pipelines with vector DB ingestion, database integration (Snowflake, CSV, DataFrames), visualization (bounding box overlays, cropped chunk images, word-level annotation), and Streamlit UIs. Use when composing ADE parse/extract/split operations into multi-step pipelines, processing document batches in parallel, loading extraction results into databases, or visualizing/annotating extracted content. Complements the document-extraction skill (which covers single ADE SDK operations); use when those operations need to be chained into workflows or when word-level grounding, bounding box visualization, or annotation is required."
---

# Document Workflows: ADE Pipeline Patterns

## Overview

This skill provides **reusable building blocks** for composing LandingAI ADE
primitives (parse, extract, split) into production-ready document processing
pipelines. It complements the `document-extraction` skill:

| Concern | `document-extraction` | `document-workflows` |
|---------|----------------------|---------------------|
| Scope | ADE SDK API: parse, extract, split, grounding | End-to-end pipelines: batch, RAG, DB, classify-route |
| When | Need to call a single ADE operation | Need to compose operations into a workflow |
| Code | SDK method calls with parameters | Complete functions with error handling, parallelism |
| Deps | `landingai-ade` only | + workflow-specific libs (pandas, chromadb, etc.) |

**Philosophy:** Organize by *workflow pattern* (batch, RAG, DB insertion),
not by document type. The same pattern applies whether documents are invoices,
utility bills, or medical forms.

**API version:** pipelines here use the **v2 APIs** (`client.v2.parse`,
`client.v2.extract`) by default. Steps that only exist in v1 (Split, Section,
spreadsheet parsing, confidence scores) are labeled "(v1)" and run as v1
pipelines end to end. Do not mix versions within one pipeline; see the
version gate and compatibility matrix in the `document-extraction` skill.

---

## Step 0 (mandatory): Pre-Flight Document Exploration {#pre-flight}

**Run this before writing any pipeline code** whenever working with documents
whose internal structure has not already been inspected in this session.

> **Rule: never write section-detection, heading-matching, or text-search code
> without first running Tool 2 (diagnostic parse) on the sample document.
> Heading format is document-specific and cannot be inferred from the task
> description or document type alone: the only reliable way to know it is to
> look at the actual ADE output.**
>
> Common surprises: a paper's "Introduction" heading may appear as
> `1. Introduction` (plain text, no `#`), `## Introduction`, `INTRODUCTION`
> (all-caps), or embedded inside a text block with body copy. Getting this
> wrong means a silent failure (zero blocks matched) that requires a full
> re-parse to debug.

Run Tool 1 (visual render) and Tool 2 (diagnostic parse) on 1–3 representative
sample documents before writing any code. This takes under a minute and
prevents debugging iterations that a pre-flight would have avoided.

### Tool 1: Visual page render

Render 1–2 pages as PNG and read them as visual context. No ADE credits used,
but each PNG consumes context tokens. Use when layout is ambiguous or document
origin is unknown (handwriting? scan? form?).

```bash
.venv/bin/python - << 'EOF'
import pymupdf
from pathlib import Path
from PIL import Image

pdf = Path('path/to/sample.pdf')
out_dir = Path('/tmp/ade_preflight'); out_dir.mkdir(exist_ok=True)
doc = pymupdf.open(pdf)
for pg in range(min(2, len(doc))):   # first 2 pages only
    pix = doc[pg].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5))   # 108 DPI
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    out = out_dir / f"{pdf.stem}_page{pg + 1}.png"
    img.save(out)
    print(out)
doc.close()
EOF
```

Then read the saved PNGs. Immediately answers:
- Are headings **bold text** (→ ADE may output plain-text heading, not `# Heading`)
- Is the document handwritten or scanned? → Tesseract OCR needed, not PyMuPDF
- Single-column or two-column layout?
- Any noise: running headers, page numbers, watermarks, stamps?

### Tool 2: ADE diagnostic parse

Parses 1 sample and prints the markdown head plus a block inventory. Uses ADE
credits: keep to **1 to 3 samples only**, never the full corpus.

```bash
.venv/bin/python - << 'EOF'
import os
from pathlib import Path
from collections import Counter
from dotenv import load_dotenv

# Load API key: prefer existing env var, then .env file lookup
load_dotenv()  # Load API key from .env. Add a path to the .env if needed.

from landingai_ade import LandingAIADE
client = LandingAIADE()
pr = client.v2.parse(document=Path('path/to/sample.pdf'))

print("=== MARKDOWN (first 80 lines) ===")
for i, ln in enumerate(pr.markdown.splitlines()[:80], 1):
    print(f"{i:3}: {ln}")

print("\n=== BLOCKS ===")
blocks = [b for page in pr.structure.children for b in page.children]
for b in blocks:
    r = b.grounding.range
    txt = pr.markdown[r.start:r.end].replace('\n', ' ')[:70]
    box = b.grounding.box
    print(f"p{b.grounding.page} {b.type:12} {b.id:16} "
          f"x={box.xmin:.2f} y={box.ymin:.2f} X={box.xmax:.2f} Y={box.ymax:.2f} | {txt}")

print(f"\nPages: {pr.metadata.page_count}  "
      f"Blocks: {len(blocks)}  "
      f"Types: {dict(Counter(b.type for b in blocks))}")
EOF
```

> **Cost note:** Cache the parse result on the first run by passing
> `save_to="output/parsed.json"` to `client.v2.parse()`. Load that JSON in
> later development runs instead of re-parsing. Only re-parse when the
> document set changes.

### What to look for

| Observation | Implication |
|-------------|-------------|
| Heading is `1. Introduction` (plain text, no `#`) | ADE markdown won't use ATX header → use ADE extract, not regex |
| Heading format varies across docs (`# INTRO` in one, `1. Intro` in another) | Regex will break on some docs → use ADE extract for robustness |
| Markdown ends with `<!-- doc_id=... -->`, pages separated by `<!-- PAGE BREAK -->` | Keep the doc_id line when saving Markdown for extraction; split on the page marker for per-page text |
| Two-column: blocks on same page with `xmin=0.07` vs `xmin=0.50` | Text order is left column then right; sections may span both |
| Block text cut mid-word at page break | Section spans pages; collect blocks from multiple pages |
| `marginalia` blocks at `ymin<0.08` or `ymax>0.90` | Running headers / page numbers → exclude from content extraction |
| Scanned / handwritten content visible in page image | PyMuPDF text extraction won't work → use Tesseract OCR |

### Tool 3: Post-Crop Visual Verification (mandatory for bounding-box workflows) {#post-crop-verification}

After producing any bounding-box crop or overlay (figure extraction, chunk
cropping, table cell extraction, word-level grounding), **read back at least
one output PNG as an image** and describe what you see. Compare your
description against the user's request. This catches:

- **Wrong-page bugs**: v2 page numbers are 1-indexed (v1 used 0-indexed), so
  renderer indexing needs `page - 1`; an off-by-one error lands the crop on
  an adjacent page with completely different content
- **Wrong-region bugs**: coordinate system mismatches that crop blank space
  or an unrelated section

> **Rule: never declare a crop workflow complete without visually reading at
> least one output PNG and confirming its content matches the user's request.**

#### Verification steps

1. Save the first crop as PNG (the workflow already does this)
2. Read the PNG file as an image (use the `read_file` tool on the PNG path)
3. Describe what you see: what content, table, figure, or text appears?
4. Compare against the user's request:
   - User asked for "the Events table" → does the crop show an Events table?
   - User asked for "Figure 3" → does the crop show a chart/diagram?
   - User asked for "Introduction section" → does the crop show intro text?
5. If the description doesn't match → investigate page indexing and
   bounding-box coordinates before continuing
6. Only proceed with remaining crops after the first one is verified

#### Why LLM vision, not heuristics

A blank-check heuristic (e.g. "mean brightness > 250 → blank") catches only
the most obvious failures. The agent's own vision capability can semantically
verify: "this crop shows a bar chart" vs "the user asked for a data table."
This catches wrong-page errors even when the crop contains valid content from
the wrong section.

---

## Quick Reference: Building Blocks

| # | Block | Pattern | Reference |
|---|-------|---------|-----------|
| 0 | Pre-flight (mandatory) | Render pages + diagnostic parse before building | [Above](#pre-flight) |
| 1 | Parse + Save | Single doc → JSON + markdown | [Below](#core-workflow) |
| 2 | Parse + Extract + Save | Single doc → structured data | [Below](#core-workflow) |
| 3 | Batch (sync) | ThreadPoolExecutor + tqdm | [batch-processing.md](references/batch-processing.md) |
| 4 | Batch (async) | AsyncLandingAIADE + aiolimiter | [batch-processing.md](references/batch-processing.md) |
| 5 | Large files | Parse Jobs v2 (wait helper, service tiers) | [batch-processing.md](references/batch-processing.md) |
| 6 | Classify → Extract | Enum classification + schema routing | [Below](#classify-then-extract) |
| 7 | Results → DataFrame | Flatten nested extraction to tables | [database-integration.md](references/database-integration.md) |
| 8 | Results → CSV | Summary + per-document export | [database-integration.md](references/database-integration.md) |
| 9 | Results → Snowflake | 4 normalized tables + COPY upload | [database-integration.md](references/database-integration.md) |
| 10 | Chunks → RAG CSV | 19-column chunk dataset | [rag-pipelines.md](references/rag-pipelines.md) |
| 11 | Chunks → ChromaDB | OpenAI embeddings + persistent store | [rag-pipelines.md](references/rag-pipelines.md) |
| 12 | Chunks → FAISS | LangChain Documents + FAISS index | [rag-pipelines.md](references/rag-pipelines.md) |
| 13 | RAG query | RetrievalQA chain with sources | [rag-pipelines.md](references/rag-pipelines.md) |
| 14 | Chunk images | Crop chunks from pages as PNGs | [visualization.md](references/visualization.md) |
| 15 | Grounding overlay | Color-coded bounding boxes on pages | [visualization.md](references/visualization.md) |
| 16 | Word-level grounding | OCR + fuzzy match highlighting | [visualization.md](references/visualization.md) |
| 17 | Section extraction | Named section from markdown (regex or ADE extract) | [Below](#section-extraction) |
| 18 | Embedding computation | Local (FastEmbed) or API (OpenAI) with best practices | [rag-pipelines.md](references/rag-pipelines.md) |
| 19 | Hierarchical chunking | Group ADE chunks into semantic units for embedding | [rag-pipelines.md](references/rag-pipelines.md) |
| 20 | Multi-granularity RAG | Chunk vs hierarchical vs document-level strategy | [rag-pipelines.md](references/rag-pipelines.md) |
| 21 | Table stitching | Parse-only or parse+extract merge of multi-page tables | [table-stitching.md](references/table-stitching.md) |
| 22 | Page routing (Classify API) | Per-page class labels before parsing (Preview) | [Below](#classify-then-extract) |
| 23 | TOC generation (Section API) | Hierarchical TOC from v1 parsed markdown (Preview, v1 pipeline) | [Below](#section-extraction) |
| 24 | Large extractions (async) | Extract Jobs v2: create → wait (client.v2.extract_jobs) | [document-extraction SKILL.md](../document-extraction/SKILL.md) |
|: | Schema catalog | Ready-to-use Pydantic models | [schema-catalog.md](references/schema-catalog.md) |

---

## Core Workflow: Parse + Extract + Save

The fundamental two-step ADE pattern. Every other workflow builds on this.

```python
from pathlib import Path
from typing import Any, Tuple, Type

from landingai_ade import LandingAIADE


def parse_extract_save(
    doc_path: Path,
    client: LandingAIADE,
    schema_cls: Type[Any],
    output_dir: Path = Path("./ade_results"),
) -> Tuple[Any, Any]:
    """Parse a document, extract structured data, save both
    as JSON via save_to. Returns (parse_result, extract_result)."""
    stem = doc_path.stem
    parse_result = client.v2.parse(
        document=doc_path,
        save_to=output_dir,
    )
    extract_result = client.v2.extract(
        markdown=parse_result.markdown,
        schema=schema_cls,  # v2 accepts the Pydantic class directly
        save_to=output_dir / f"{stem}_extract_output.json",
    )
    return parse_result, extract_result
```

> **`save_to` parameter:** Available on `client.v2.parse()` and
> `client.v2.extract()` (both sync and async clients); the async job
> `create` methods do not accept it. Pass a directory to auto-name the
> file `{input_filename}_{method}_output.json`, or a path ending in
> `.json` to save to that exact location. Parent directories are created
> automatically. Requires `landingai-ade` v1.13.0+.

### Parse-Only (no extraction)

```python
def parse_and_save(
    doc_path: Path,
    client: LandingAIADE,
    output_dir: str = "./ade_results",
) -> Any:
    return client.v2.parse(
        document=doc_path, save_to=output_dir,
    )
```

> **Schemas:** See [schema-catalog.md](references/schema-catalog.md) for
> ready-to-use Pydantic models (invoice, utility bill, bank statement,
> pay stub, food label, CME certificate, document classifier).
> See the `document-extraction` skill for schema design rules.

---

## Classify-then-Extract

Process mixed document types by first classifying, then applying the
appropriate schema. Two approaches:

### Approach 1: Classification Extraction (any document mix)

```python
from typing import Literal
from pydantic import BaseModel, Field


class DocType(BaseModel):
    type: Literal[
        "invoice", "bank_statement", "pay_stub",
        "utility_bill",
    ] = Field(description="The type of the document.")


# Map types to schemas (from schema-catalog.md)
SCHEMA_MAP: dict[str, type] = {
    "invoice": InvoiceSchema,
    "bank_statement": BankStatementSchema,
    "pay_stub": PayStubSchema,
    "utility_bill": UtilityBillSchema,
}


def classify_and_extract(
    doc_path: Path,
    client: LandingAIADE,
) -> dict:
    """Classify a document then extract with the matching
    schema."""
    pr = client.v2.parse(document=doc_path)

    # Classify with a one-field extraction
    cls = client.v2.extract(
        markdown=pr.markdown,
        schema=DocType,
    )
    doc_type: str = cls.extraction["type"]

    # Extract with type-specific schema
    er = client.v2.extract(
        markdown=pr.markdown,
        schema=SCHEMA_MAP[doc_type],
    )
    return {
        "type": doc_type,
        "extraction": er.extraction,
        "parse_result": pr,
        "extract_result": er,
    }
```

### Approach 2: Split API (multi-document PDFs, v1 pipeline)

When a single PDF contains multiple document types (e.g., a packet with
invoices + receipts), use the Split API first. **Split requires v1 Parse
output, so this pipeline stays on the v1 APIs end to end** (v1 Extract
needs the schema as a JSON string via `pydantic_to_json_schema`):

```python
from landingai_ade.lib import pydantic_to_json_schema

def split_classify_extract(
    pdf_path: Path,
    client: LandingAIADE,
    split_classes: list[dict],
) -> list[dict]:
    """Split a multi-doc PDF, classify each split, extract. v1 pipeline."""
    pr = client.parse(document=pdf_path, split="page")

    # Split into sub-documents
    split_result = client.split(
        markdown=pr.markdown,
        split_class=split_classes,
    )

    results = []
    for split_doc in split_result.splits:
        # Classify
        cls = client.extract(
            schema=pydantic_to_json_schema(DocType),
            markdown=split_doc.markdowns[0],
        )
        doc_type = cls.extraction["type"]

        # Extract
        schema_cls = SCHEMA_MAP[doc_type]
        er = client.extract(
            schema=pydantic_to_json_schema(schema_cls),
            markdown=split_doc.markdowns[0],
        )
        results.append({
            "type": doc_type,
            "extraction": er.extraction,
            "pages": split_doc.pages,
        })
    return results
```

> **Split API parameters:** Use `split_class` (list of dicts with `name`, `description`, `identifier` keys).
> See the `document-extraction` skill for full Split API reference.

> **When to use Split vs Classification:**
> - **Split API**: One PDF contains multiple separate documents
> - **Classification extraction**: Each file is one document, but types vary

### Approach 3: Classify API (page-level routing, Preview)

Use `client.classify()` to assign a class to every page without parsing first. This is useful for pre-screening a document before committing to a full parse, or when you need page-level labels to route pages to different pipelines.

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

classify_response = client.classify(
    document=Path("batch.pdf"),
    classes=[
        {"class": "invoice", "description": "Commercial bill with line items"},
        {"class": "bank_statement", "description": "Monthly account summary"},
        {"class": "other"},
    ],
    model="classify-latest"
)

# Group pages by class
from collections import defaultdict
pages_by_class: dict[str, list[int]] = defaultdict(list)
for result in classify_response.classification:
    pages_by_class[result.class_].append(result.page)

# Route accordingly: parse only the invoice pages with v2 Parse.
# Classify pages are 0-indexed; v2 options.pages is 1-indexed, so add 1.
invoice_pages = [p + 1 for p in pages_by_class["invoice"]]
pr = client.v2.parse(
    document=Path("batch.pdf"),
    options={"pages": invoice_pages},
)
```

> Note: `result.class_` uses a trailing underscore because `class` is a Python reserved word.
> Classify is a v1 API but takes the raw document (not Parse output), so it composes
> with v2 pipelines. See the `document-extraction` skill for full Classify API reference.

---

## Section Extraction (v1 pipeline)

Use `client.section()` to generate a full hierarchical table of contents from parsed Markdown. The Section API maps the entire document structure and returns chunk references for each entry. Use for navigable TOC generation, section-aware RAG chunking, or scoping extraction queries to specific sections.

**Section requires v1 Parse output** (it depends on the anchor tags only v1 Parse emits), so this pipeline stays on the v1 APIs. Do not pass v2 Parse Markdown to Section.

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

parse_response = client.parse(
    document=Path("contract.pdf"),
    model="dpt-2-latest"
)

section_response = client.section(
    markdown=parse_response.markdown,
    model="section-latest"
)

# Flat reading-order list of all sections
for entry in section_response.table_of_contents:
    indent = "  " * (entry.level - 1)
    print(f"{indent}{entry.section_number}. {entry.title} (chunk: {entry.start_reference})")

# Use entry.start_reference to find the corresponding chunk in parse_response.chunks
chunk_index = {c.id: c for c in parse_response.chunks}
```

---

## Multi-Page Table Stitching {#table-stitching}

When a table spans multiple pages, ADE may emit it as separate table blocks
per page, and may emit some pages as plain text instead of table blocks.
This inconsistency can occur on **any** page, not just the last one.

Three approaches handle this, with different cost/accuracy/fragility
trade-offs:

| Approach | ADE Calls | Handles non-table chunks | Fragility |
|----------|-----------|--------------------------|-----------|
| **A: Parse + Extract** | 2 | ✓ LLM reads full markdown | Low: no custom parsing |
| **B: HTML table parsing** | 1 | ✓ with fallback regex | **High**: requires uniform row structure |
| **C: pandas read_html** | 1 | ✗ misses non-table chunks | Medium |

**Decision guide:**
- Use **Approach A** when accuracy is paramount and cost is secondary
- Use **Approach B** when rows are highly uniform, document structure is
  predictable, and cost savings justify the fragility of regex-based parsing
- Use **Approach C** for quick prototyping or when missing some rows is
  acceptable

### Pre-flight additions for table stitching

Before choosing an approach, run the diagnostic parse (Tool 2) and check:

| What to check | How | Why |
|---------------|-----|-----|
| Block types per page | Count `type == "table"` vs `"text"` blocks per page | Any page may have inconsistent types |
| Column count consistency | Compare column counts across table blocks | Inconsistent counts may indicate different tables |
| Header row presence | Check first row of each table block | Needed for detection and row filtering |
| Non-target tables | Look for summary/metadata tables with same column count | Must distinguish target from others |
| Row uniformity | Compare row structure across pages | Low uniformity makes Approach B fragile |

### Domain-specific semantic checks

After stitching, add validation checks that leverage domain knowledge:
- **Financial:** running balances, column totals = sum of rows
- **Inventory:** quantity conservation across rows
- **Time-series:** chronological ordering, no sequence gaps
- **Scientific:** consistent units, monotonic IDs

These checks serve as both **validation** (confirming correctness) and
**disambiguation** (resolving structural ambiguity in parsed output).

> **Full code** for all three approaches with reusable patterns:
> see [table-stitching.md](references/table-stitching.md).

---

## Batch Processing

Two patterns depending on scale. Both include per-document error handling.

### Quick: ThreadPoolExecutor (sync)

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm


def batch_process(
    files: list[Path],
    schema_cls: type,
    max_workers: int = 4,
) -> list[tuple[Path, Any, Any]]:
    client = LandingAIADE()
    results: list[tuple[Path, Any, Any]] = []
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {
            pool.submit(
                parse_extract_save, fp, client, schema_cls
            ): fp
            for fp in files
        }
        for fut in tqdm(
            as_completed(futures), total=len(futures)
        ):
            fp = futures[fut]
            try:
                results.append((fp, *fut.result()))
            except Exception as e:
                print(f"FAILED {fp.name}: {e}")
    return results
```

### Scalable: AsyncLandingAIADE (async)

```python
import asyncio
from aiolimiter import AsyncLimiter
from landingai_ade import AsyncLandingAIADE


async def batch_parse_async(
    files: list[Path],
    rate_limit: int = 30,
) -> list[dict]:
    client = AsyncLandingAIADE()
    limiter = AsyncLimiter(rate_limit, 60)

    async def _process(fp: Path) -> dict | None:
        try:
            async with limiter:
                return {
                    "path": fp,
                    "result": await client.v2.parse(document=fp),
                }
        except Exception as e:
            print(f"FAILED {fp.name}: {e}")
            return None

    raw = await asyncio.gather(*[_process(fp) for fp in files])
    return [r for r in raw if r]
```

> **Full code** with output directory organization, CSV export, and chunk
> image saving: see [batch-processing.md](references/batch-processing.md).

---

## Results to DataFrames and CSV

Flatten nested ADE extraction results into 4 normalized tables:

```python
import uuid
from datetime import datetime, timezone


def rows_from_doc(
    file_path: str,
    parse_result: Any,
    extract_result: Any,
    run_id: str = "",
) -> tuple[dict, list[dict], list[dict], dict]:
    """Returns (main_row, line_rows, block_rows, md_record).

    - main_row: flattened top-level fields (nested__field)
    - line_rows: one per list item (line items, transactions)
    - block_rows: one per parsed block with page numbers
    - md_record: full markdown for traceability
    """
    doc_uuid = str(uuid.uuid4())
    f = extract_result.extraction

    # Flatten top-level fields
    main_row = {"doc_uuid": doc_uuid, "document_name": Path(file_path).name}
    for k, v in f.items():
        if isinstance(v, dict):
            for sk, sv in v.items():
                main_row[f"{k}__{sk}"] = sv
        elif not isinstance(v, list):
            main_row[k] = v

    # Extract list fields as line rows
    line_rows = [
        {"doc_uuid": doc_uuid, "list_field": k, "line_index": i, **item}
        for k, v in f.items() if isinstance(v, list)
        for i, item in enumerate(v) if isinstance(item, dict)
    ]

    # Block rows from the v2 parse structure tree
    block_rows = [
        {
            "doc_uuid": doc_uuid,
            "block_id": block.id,
            "block_type": block.type,
            "page": block.grounding.page,   # 1-indexed in v2
        }
        for page in (parse_result.structure.children if parse_result.structure else [])
        for block in page.children
    ]

    md_record = {
        "doc_uuid": doc_uuid,
        "markdown": parse_result.markdown,
    }
    return main_row, line_rows, block_rows, md_record
```

> **Full code** with Snowflake upload, UUID traceability, and bounding box
> columns: see [database-integration.md](references/database-integration.md).

---

## RAG Preparation

Quick path from parsed documents to a queryable RAG system. Two
embedding options: **local** (free, offline) or **API** (higher quality).

### Option A: Local embeddings with FastEmbed (free)

```python
from fastembed import TextEmbedding


def ade_to_embeddings_local(
    parse_results: list[dict],
    model: str = "BAAI/bge-small-en-v1.5",
) -> list[dict]:
    """Embed ADE v2 blocks locally. Returns list of dicts with
    text, vector, and grounding metadata."""
    embedder = TextEmbedding(model_name=model)
    items: list[dict] = []
    for pr in parse_results:
        resp = pr["parse_result"]
        for page in resp.structure.children:
            for block in page.children:
                r = block.grounding.range
                text = resp.markdown[r.start:r.end].strip()
                if not text:
                    continue
                items.append({
                    "text": text,
                    "source": pr["name"],
                    "block_id": block.id,
                    "page": block.grounding.page,   # 1-indexed
                    "box": {
                        "xmin": block.grounding.box.xmin,
                        "ymin": block.grounding.box.ymin,
                        "xmax": block.grounding.box.xmax,
                        "ymax": block.grounding.box.ymax,
                    },
                })
    vecs = list(embedder.embed([i["text"] for i in items]))
    for item, vec in zip(items, vecs):
        item["vector"] = vec.tolist()
    return items
```

### Option B: API embeddings with OpenAI

```python
from langchain.docstore.document import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings


def ade_to_rag(
    parse_results: list[dict],
    embedding_model: str = "text-embedding-3-small",
) -> FAISS:
    """Convert ADE v2 parse results to a FAISS vector store.

    Args:
        parse_results: list of {"name": str, "parse_result": V2ParseResponse}
    """
    docs = []
    for item in parse_results:
        resp = item["parse_result"]
        for page in resp.structure.children:
            for block in page.children:
                r = block.grounding.range
                text = resp.markdown[r.start:r.end].strip()
                if not text:
                    continue
                docs.append(Document(
                    page_content=text,
                    metadata={
                        "source": item["name"],
                        "block_type": block.type,
                        "block_id": block.id,
                        "page": block.grounding.page,
                    },
                ))
    return FAISS.from_documents(
        docs, OpenAIEmbeddings(model=embedding_model)
    )
```

> **Full code** with embedding best practices, hierarchical chunking,
> multi-granularity strategies, ChromaDB, LangChain RetrievalQA, and
> CSV export: see [rag-pipelines.md](references/rag-pipelines.md).

**Advanced RAG patterns in [rag-pipelines.md](references/rag-pipelines.md):**

- **Embedding computation** (blocks 18–19): choosing between local (FastEmbed, free) and API (OpenAI, higher quality) embeddings, including batch sizing and rate limiting
- **Hierarchical chunking** (block 20): embed at multiple granularities (chunk, section, document) for hybrid retrieval
- **Multi-granularity RAG** (block 21): combine chunk-level precision with document-level context, routing queries to the right embedding level based on scope

---

## Visualization

Quick snippet for bounding box overlays on parsed pages:

```python
from PIL import Image, ImageDraw

BLOCK_COLORS = {
    "text": (40, 167, 69),
    "table": (0, 123, 255),
    "figure": (255, 0, 255),
    "marginalia": (111, 66, 193),
}

def annotate_page(
    img: Image.Image, blocks: list, page_number: int,
) -> Image.Image:
    """Draw block boxes for one page. page_number is 1-indexed (v2)."""
    annotated = img.copy()
    draw = ImageDraw.Draw(annotated)
    w, h = img.size
    for block in blocks:
        if block.grounding.page != page_number:
            continue
        box = block.grounding.box
        color = BLOCK_COLORS.get(block.type, (200, 200, 200))
        draw.rectangle(
            [int(box.xmin * w), int(box.ymin * h),
             int(box.xmax * w), int(box.ymax * h)],
            outline=color, width=3,
        )
    return annotated

# blocks = [b for page in response.structure.children for b in page.children]
```

> **Full code** with chunk image cropping, extraction-only overlays, and
> word-level OCR grounding: see [visualization.md](references/visualization.md).

---

## Streamlit UI Pattern

Quick Streamlit app for interactive document processing:

```python
import streamlit as st
from pathlib import Path
from landingai_ade import LandingAIADE

st.title("Document Processor")

uploaded = st.file_uploader(
    "Upload document", type=["pdf", "png", "jpg"]
)
if uploaded:
    # Save temp file
    tmp = Path(f"/tmp/{uploaded.name}")
    tmp.write_bytes(uploaded.read())

    client = LandingAIADE()

    with st.spinner("Parsing..."):
        pr = client.v2.parse(document=tmp)

    st.subheader("Markdown Preview")
    st.markdown(pr.markdown[:2000])

    st.subheader("Blocks")
    for page in pr.structure.children:
        for block in page.children:
            r = block.grounding.range
            with st.expander(
                f"{block.type} (page {block.grounding.page})"
            ):
                st.text(pr.markdown[r.start:r.end][:500])
```
<!-- Requires: pip install landingai-ade streamlit -->

> **Full Streamlit app** with batch upload, extraction display, and
> visualization tabs: adapt from the patterns in
> [batch-processing.md](references/batch-processing.md) and
> [visualization.md](references/visualization.md).

---

## Dependency Guide

| Workflow | Install |
|----------|---------|
| Core (parse + extract) | `pip install landingai-ade` |
| Batch sync | `pip install landingai-ade tqdm` |
| Batch async | `pip install landingai-ade aiolimiter` |
| DataFrames / CSV | `pip install landingai-ade pandas` |
| Snowflake | `pip install landingai-ade pandas snowflake-connector-python[pandas]` |
| RAG (local embeddings) | `pip install landingai-ade fastembed` |
| RAG (ChromaDB) | `pip install landingai-ade chromadb openai` |
| RAG (FAISS + LangChain) | `pip install landingai-ade langchain langchain-openai langchain-community faiss-cpu` |
| Visualization | `pip install landingai-ade Pillow pymupdf` |
| Word-level grounding | `pip install landingai-ade Pillow pymupdf pytesseract fuzzywuzzy` + `tesseract` binary |
| Streamlit UI | `pip install landingai-ade streamlit` |
| Schema conversion | v2: pass the Pydantic class directly to `schema=`. v1 only: `from landingai_ade.lib import pydantic_to_json_schema` (included in landingai-ade) |

---

## Reference Files

Read these for full implementations when building a specific workflow:

- **[schema-catalog.md](references/schema-catalog.md)**: Ready-to-use Pydantic schemas for invoice, utility bill, bank statement, pay stub, food label, CME certificate, and document classification
- **[batch-processing.md](references/batch-processing.md)**: ThreadPoolExecutor, AsyncLandingAIADE, and Parse Jobs API patterns with full error handling
- **[rag-pipelines.md](references/rag-pipelines.md)**: Chunks to CSV, ChromaDB ingestion, FAISS + LangChain, and RAG query chains
- **[database-integration.md](references/database-integration.md)**: DataFrame normalization, Snowflake upload, and CSV export patterns
- **[visualization.md](references/visualization.md)**: Chunk image cropping, bounding box overlays, and word-level OCR grounding
- **[table-stitching.md](references/table-stitching.md)**: Parse+Extract (robust), HTML parsing (fragile), and pandas approaches for merging multi-page tables into a single output
