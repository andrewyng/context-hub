---
name: document-extraction
description: "Parses, extracts, and classifies documents using LandingAI's Agentic Document Extraction (ADE). Covers the v2 APIs powered by DPT-3 (Parse and Extract, sync and async jobs with service tiers, hierarchical block structure, Markdown ranges, normalized bounding boxes) and the v1 APIs (page classification with Classify, table of contents generation with Section, schema generation with Build Extract Schema, document splitting with Split, plus v1 Parse and Extract for Office formats and password-protected files). Use when parsing documents into structured Markdown, extracting fields with a JSON Schema or Pydantic model, classifying pages or splitting mixed document batches, generating a table of contents, processing large files asynchronously, migrating from ADE v1 to v2, or when the user mentions blocks, chunks, grounding, bounding boxes, ranges, spans, or highlighting where data appears in a document."
---

# Document Extraction (ADE)

## Overview

LandingAI's Agentic Document Extraction (ADE) is a document processing SaaS that parses, extracts, and classifies documents without requiring templates or training. The `landingai-ade` Python library is the recommended approach; it wraps the REST APIs and handles authentication and response parsing.

ADE has two API generations. The **v2 APIs** (powered by DPT-3) are the current generation for parsing and extraction. Several capabilities exist only as **v1 APIs** and remain fully supported.

| API | Version | Python Method | What It Does |
|-----|---------|--------------|--------------|
| **Parse** | v2 | `client.v2.parse()` | Converts a PDF or image into Markdown, a hierarchical block structure, and grounding. |
| **Parse Jobs** | v2 | `client.v2.parse_jobs.*` | Async parsing for large files (up to 1 GiB / 6,000 pages), with service tiers. |
| **Extract** | v2 | `client.v2.extract()` | Pulls schema-defined fields from Markdown, with range grounding per field. |
| **Extract Jobs** | v2 | `client.v2.extract_jobs.*` | Async extraction for long documents or large schemas, with service tiers. |
| **Classify** | v1 | `client.classify()` | Assigns a class to each page of a raw document. Works alongside either Parse version. |
| **Section** | v1 | `client.section()` | Generates a table of contents from **v1** Parse output. Not compatible with v2 Parse output. |
| **Build Extract Schema** | v1 | `client.extract_build_schema()` | Generates or refines a JSON extraction schema from sample Markdown. |
| **Split** | v1 | `client.split()` | Classifies and separates multi-document batches, from **v1** Parse output. |
| **Parse / Extract** | v1 | `client.parse()` / `client.extract()` | Previous generation. See [Which API Version](#which-api-version) for when it is still required. |

## Which API Version? {#which-api-version}

**Use the v2 APIs (`client.v2.*`) by default.** Route to v1 only when one of these applies:

- The user has existing code calling `client.parse()` / `client.extract()` or `/v1/ade/*` endpoints and has not asked to migrate.
- The document is not a PDF or an image (Word, PowerPoint, spreadsheets, and other formats need v1 Parse).
- The file is password-protected (v2 rejects it with HTTP 422).
- The pipeline needs confidence scores, custom figure prompts, or v1-style page splits (`split="page"`).
- The pipeline feeds Parse output into the v1 Section or v1 Split APIs, which require the v1 Parse response shape.

If any apply, read [references/v1-parse-extract.md](references/v1-parse-extract.md). To move an existing v1 pipeline to v2, read [references/migration-v1-to-v2.md](references/migration-v1-to-v2.md).

**Do not mix versions within one pipeline**, except as this matrix allows:

| Markdown produced by | v2 Extract | v1 Extract | v1 Section | v1 Split |
|---|---|---|---|---|
| Parse v2 | Yes (preferred; reads the embedded `doc_id`) | **No** | **No** | No (use v1 Parse for Split pipelines) |
| Parse v1 | Yes (works, but no `doc_id` link) | Yes | Yes | Yes |

The v1 Classify API takes the raw document, not Parse output, so it composes with either version.

## API Drift: Your Prior Knowledge May Be Stale

If you have seen ADE code before, it was probably v1. These v1 idioms do not exist in v2:

| Stale (v1) pattern | Current (v2) |
|---|---|
| `response.chunks` | `response.structure` tree; slice `response.markdown` with each block's `grounding.range`, or set `options={"inline_markdown": True}` |
| 0-indexed page numbers | Pages are **1-indexed** in v2: `grounding.page`, `metadata.failed_pages`, `options.pages` |
| Box keys `left/top/right/bottom` | Renamed `xmin/ymin/xmax/ymax` (still normalized 0 to 1) |
| `pydantic_to_json_schema(Model)` before extract | Pass the Pydantic class, dict, or JSON string directly to `schema=` |
| Hand-rolled job polling loops | `client.v2.parse_jobs.wait(job_id)` / `client.v2.extract_jobs.wait(job_id)` |
| `split="page"`, `custom_prompts`, `password` parse params | Removed; use `options` (page selection via `options={"pages": [...]}`) |
| `<a id='...'></a>` anchors and `<::Caption::>` tags in Markdown | Clean Markdown: `<figure type="CHART">` elements, bracketed labels like `[STAMPED][SIGNED]`, `<!-- PAGE BREAK -->`, trailing `<!-- doc_id=... -->` |
| `model="dpt-2-latest"` | `model="dpt-3-pro-latest"` (pin `dpt-3-pro-20260710` in production) |
| `confidence`, `low_confidence_spans` | Removed in v2 |

## Quick Start

### 1. Installation

Never install packages globally without user approval. Always check for a local Python environment first.

```
1. .venv/bin/python       : uv-managed (this project)
2. venv/bin/python        : standard Python venv
3. uv run python          : if pyproject.toml exists
4. poetry run python      : if poetry.lock exists
5. python3                : system fallback; warn the user
```

Use the local environment to install: `landingai-ade` (v1.13.0 or later for `client.v2`), `python-dotenv`.

### 2. API Key Setup

The user may already have a `.env` file in the same directory as the `document-extraction` skill with the API key. Check that path first (`ls -la .*/skills/document-extraction/.env`), and also check the directory containing this SKILL.md.

If not found, the script below searches common locations and loads it:

```bash
.venv/bin/python - << 'EOF'
import os
from pathlib import Path
from dotenv import load_dotenv

# Load API key: prefer existing env var, then .env file lookup
if os.environ.get("VISION_AGENT_API_KEY"):
    print("API key found in existing environment variable")
else:
    def _find_env():
        for d in [Path.cwd().resolve(), *Path.cwd().resolve().parents]:
            for candidate in [
                d / '.env',
                d / 'document-extraction/.env',
                d / 'skills/document-extraction/.env',
            ]:
                if candidate.is_file():
                    return candidate
        return None
    env = _find_env()
    if env:
        load_dotenv(env)
        print(f"API key loaded from: {env}")
    else:
        print("Warning: VISION_AGENT_API_KEY not set and no .env found")
EOF
```

If no key is found, instruct the user to get one from [https://va.landing.ai/settings/api-key](https://va.landing.ai/settings/api-key), copy `.env-sample` to `.env`, and set `VISION_AGENT_API_KEY=<key>`. The `.env` file is gitignored. The same key and client work for v1 and v2; the library routes v2 calls to the v2 host automatically.

**EU endpoint:** initialize with `LandingAIADE(environment="eu")`. API keys are region-specific.

### 3. Basic Parse (v2)

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

response = client.v2.parse(
    document=Path("document.pdf"),
    model="dpt-3-pro-latest",
)

print(f"Pages: {response.metadata.page_count}")
print(response.markdown[:500])

# Save the Markdown for a later extract step
Path("output.md").write_text(response.markdown, encoding="utf-8")
```

### 4. Basic Extract (v2)

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from pydantic import BaseModel, Field
from landingai_ade import LandingAIADE

class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    invoice_date: str = Field(description="Invoice date as YYYY-MM-DD")
    total_amount: float = Field(description="Total amount in USD")
    vendor_name: str = Field(description="Vendor name")

client = LandingAIADE()

response = client.v2.extract(
    markdown=Path("output.md").read_text(encoding="utf-8"),
    schema=Invoice,  # Pydantic class, dict, or JSON string all work
    model="extract-latest",
)

print(response.extraction)
# {'invoice_number': 'INV-12345', 'invoice_date': '2024-01-15', ...}
```

In v2 there is no need to convert Pydantic models with `pydantic_to_json_schema()`; pass the class itself.

## Document Parsing (v2)

### Parse Parameters

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

response = client.v2.parse(
    document=Path("document.pdf"),   # or document_url="https://..."
    model="dpt-3-pro-latest",        # optional; defaults to latest DPT-3 Pro
    options={
        "pages": [1, 3],                              # 1-indexed page selection
        "blocks": {"table": {"format": "markdown"}},  # tables as pipe syntax (default: html)
        "atomic_grounding": False,                    # omit line-level grounding
        "inline_markdown": True,                      # each block carries its own markdown slice
    },
    save_to="output/",               # optional; writes the full response JSON
)
```

All `options` fields are optional. Other options: `blocks.<type>.markdown` (bool, default true) suppresses a block type's content from the Markdown while keeping it in `structure`.

**Input limits (sync):** PDFs and images only, 50 MiB, 100 pages per PDF. Larger files: use [Parse Jobs](#parse-large-files-async-parse-jobs-v2). Other file formats and password-protected files: use the [v1 Parse API](references/v1-parse-extract.md).

**Models:** `dpt-3-pro-latest` (default), `dpt-3-pro` (alias), or a dated snapshot such as `dpt-3-pro-20260710`. Pin the dated snapshot in production for reproducibility.

### Understanding the Parse Response

`client.v2.parse()` returns a `V2ParseResponse` with three top-level fields:

- **`markdown`**: the whole document as one Markdown string, in reading order. Every `range` in the response points into this string using Unicode code point offsets.
- **`structure`**: a `document` node whose `children` are pages; each page's `children` are the blocks on that page. Tables nest their cells as `children`.
- **`metadata`**: `job_id`, `model_version`, `page_count`, `output_markdown_chars`, `range_units`, `failed_pages` (1-indexed), `duration_ms`, and `billing` (`service_tier`, `total_credits`).

Every node below the root carries an inline `grounding` object; there is no separate top-level grounding map:

- `grounding.page`: 1-indexed page number.
- `grounding.range`: `{start, end}` offsets into `markdown` (`start` inclusive, `end` exclusive).
- `grounding.box`: normalized bounding box with `xmin`, `ymin`, `xmax`, `ymax`, each 0 to 1 as a fraction of page width or height.

**Block types:** `text`, `table`, `table_cell`, `figure`, `marginalia`, `attestation`, `logo`, `card`, `scan_code`. Block ids are semantic and unique per response: `<type>-<index>` in reading order (`text-0`, `figure-0`, `table_cell-3`). Ids are not stable across re-parses.

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()
response = client.v2.parse(document=Path("document.pdf"), model="dpt-3-pro-latest")

# Walk the structure tree; SDK objects use attribute access
for page in response.structure.children:
    print(f"Page {page.grounding.page}: status={page.status}")
    for block in page.children:
        r = block.grounding.range
        text = response.markdown[r.start:r.end]      # slice by range to get block text
        box = block.grounding.box
        print(f"  {block.id} ({block.type}) at x={box.xmin:.2f} y={box.ymin:.2f}: {text[:60]!r}")
        if block.type == "table":
            for cell in block.children:
                print(f"    cell row={cell.row} col={cell.col} span={cell.rowspan}x{cell.colspan}")
```

**Table cells:** every cell is type `table_cell` (no separate header type) with 0-indexed `row`/`col` and `rowspan`/`colspan`. Cell positions are 0-indexed even though pages are 1-indexed.

**Line-level grounding:** leaf blocks carry `atomic_grounding`, a list of `{page, range, box}` objects, one per visual line for `text` and `marginalia`. Use it to highlight at line level. Set `options={"atomic_grounding": False}` to shrink the response.

**Convert a box to pixels** by multiplying by the dimensions of whatever page rendering you draw on:

```python
left = box.xmin * image_width
top = box.ymin * image_height
right = box.xmax * image_width
bottom = box.ymax * image_height
```

### The v2 Markdown Format

- Page contents are separated by `<!-- PAGE BREAK -->` (absent in single-page documents).
- The final line is `<!-- doc_id=<job_id> -->`; the v2 Extract API reads it to link an extraction back to its parse job. Keep it when saving Markdown for extraction.
- Figures render as `<figure type="CHART">...<description>...</description></figure>` (types: `CHART`, `FLOWCHART`, `DIAGRAM`, `ILLUSTRATION`, `PHOTOGRAPH`, fallback `FIGURE`). A `CHART` also transcribes its data as an HTML table.
- Attestations render as bracketed labels on a header line (`[STAMPED][SIGNED]`) followed by transcribed content; `[ILLEGIBLE_SIGNATURE]` and `[ILLEGIBLE_TEXT]` are fixed literals.
- Scan codes render as a bracketed type plus the decoded value (for example `[BARCODE]` then the digits).
- Tables are HTML by default (preserves merged cells); `options={"blocks": {"table": {"format": "markdown"}}}` switches to pipe syntax.
- Math is LaTeX in `$...$` / `$$...$$`.

There are no embedded anchor tags or chunk ids in v2 Markdown; blocks link to the Markdown through ranges.

### Saving Responses

`save_to` on `client.v2.parse()` and `client.v2.extract()` writes the full response JSON after the call. Pass a directory for an auto-generated name (`{input_filename}_{method}_output.json`) or a path ending in `.json` for an exact location; parent directories are created. The async job `create` methods do not accept `save_to`. To save just the Markdown, write `response.markdown` yourself.

### Parse Large Files (Async, Parse Jobs v2)

For files up to 1 GiB (PDFs; 50 MiB for images) or 6,000 pages, or to run at the cheaper `standard` tier:

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE
from landingai_ade.lib.v2_errors import JobFailedError, JobWaitTimeoutError

client = LandingAIADE()

job = client.v2.parse_jobs.create(
    document=Path("large_document.pdf"),
    model="dpt-3-pro-latest",
    service_tier="standard",   # optional: "standard" (default, half credits) or "priority"
)

try:
    done = client.v2.parse_jobs.wait(job.job_id, timeout=600, raise_on_failure=True)
    print(done.result.markdown[:500])   # result is the full V2ParseResponse
except JobFailedError as error:
    print(f"Job failed: {error}")
except JobWaitTimeoutError:
    print("Not finished yet; poll again with client.v2.parse_jobs.get(job_id)")
```

- `wait()` polls `get()` with backoff until the job is terminal and returns the finished job; without `raise_on_failure=True`, check `job.status` yourself.
- **Job fields:** `job_id`, `status` (`pending`, `processing`, `completed`, `failed`), `created_at`, `completed_at`, `progress` (0 to 1), `result`, `error` (`code`, `message`).
- **List jobs:** `client.v2.parse_jobs.list(page=0, page_size=10, status="completed")` returns newest first with `has_more`.
- **`output_save_url`** (optional, on `create`): a presigned URL (S3, Azure SAS, GCS signed URL) with write access; the output is delivered there and the poll reports `output_url` with `result` set to null. Recommended with ZDR; v2 Parse Jobs does not require it.

## Structured Data Extraction (v2)

### Schema Definition

`client.v2.extract()` accepts the schema in three forms: a Pydantic `BaseModel` class, a plain dict, or a JSON string.

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from pydantic import BaseModel, Field
from landingai_ade import LandingAIADE

class Address(BaseModel):
    street: str = Field(description="Street address")
    city: str = Field(description="City")

class LineItem(BaseModel):
    description: str = Field(description="Line item description")
    amount: float = Field(description="Line item amount in USD")

class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    billing_address: Address                  # nested object
    line_items: list[LineItem]                # array of objects
    notes: str | None = Field(default=None, description="Optional notes")

client = LandingAIADE()
parse_response = client.v2.parse(document=Path("invoice.pdf"), model="dpt-3-pro-latest")

extract_response = client.v2.extract(
    markdown=parse_response.markdown,   # or markdown_url=...; exactly one source
    schema=Invoice,
    model="extract-latest",
)
print(extract_response.extraction)
```

For schema design rules and dict/JSON Schema examples, see [references/extraction-schemas.md](references/extraction-schemas.md).

**Markdown input:** exactly one of `markdown` (string) or `markdown_url`. The Markdown can come from any source, but v2 Parse output gives the best results and carries the `doc_id` link. There is no input size cap; rate limiting is based on Markdown size.

**Models:** `extract-latest` (default), `extract` (alias), or a dated snapshot such as `extract-20260710`. Note: the v1 Extract API has its own `extract-latest` that resolves to a different (v1) snapshot; the two APIs' model namespaces are separate.

**`strict`:** default `False` (fields the model cannot extract are skipped and unsupported schema keywords are ignored). With `strict=True`, either case returns HTTP 422.

### Reading Extraction Results

The `V2ExtractResult` has:

- **`extraction`**: dict of extracted values matching the schema. Missing values are `null`.
- **`extraction_metadata`**: mirrors `extraction`, with each leaf replaced by `{"value": ..., "ranges": [...]}`. Each range is `{"start": n, "end": n}` into the input Markdown (Unicode code points). A value found in several places has several ranges; a synthesized value has `value` and `ranges` of `null`.
- **`markdown`**: your input Markdown echoed back; all ranges index into it.
- **`metadata`**: `job_id`, `model_version`, `duration_ms`, `doc_id` (the originating parse job, when the input carried a `doc_id` comment), `input_markdown_chars`, `output_extraction_chars`, `billing`.
- **`schema_violation_error`** / **`warnings`**: set on partial extractions; a sync request then returns HTTP 206 (data is still returned and credits are consumed).

```python
# extraction and extraction_metadata are plain dicts: use dict access, not attributes
meta = extract_response.extraction_metadata["invoice_number"]
if meta["ranges"]:
    for r in meta["ranges"]:
        source_text = extract_response.markdown[r["start"]:r["end"]]
        print(f"invoice_number came from: {source_text!r}")
```

For bounding boxes on the page, map a field's range back to the parse response: find the block whose `grounding.range` contains the field's range, then use that block's `grounding.box`.

### Extract Large Documents (Async, Extract Jobs v2)

Same request fields as sync extract, plus `service_tier` and `output_save_url`. Submissions always return 202 and are paced internally; there is no input size cap.

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

job = client.v2.extract_jobs.create(
    markdown=Path("parse-output.md").read_text(encoding="utf-8"),
    schema={
        "type": "object",
        "properties": {
            "revenue": {"type": "string", "description": "Q1 2024 revenue"}
        },
    },
    service_tier="priority",   # optional: "standard" (default) or "priority"
)

done = client.v2.extract_jobs.wait(job.job_id, timeout=600)
if done.status == "completed":
    print(done.result.extraction)
else:
    print(f"Job {done.status}: {done.error.message if done.error else 'unknown'}")
```

`get()` and `list()` work the same as Parse Jobs. An Extract Jobs poll always returns HTTP 200; partial-extraction signals (`schema_violation_error`, `warnings`) appear inside `result`.

### Service Tiers (Jobs APIs)

| Tier | Behavior |
|------|----------|
| `standard` | Default. Half the credits of `priority`, slower turnaround. Best for batch and non-urgent work. |
| `priority` | Full credit rate (same as synchronous), faster turnaround. |

Synchronous requests always run (and bill) at `priority`. The tier affects turnaround and credits only, not rate limits.

## v1 APIs Without a v2 Equivalent

These are current, fully supported APIs on the top-level client. Classify works with any pipeline; Section and Split require **v1** Parse output.

### Page Classification (Classify API)

Assigns a class to each page of a raw document (not Parse output), so it composes with v2 pipelines: classify first, then route pages to parsing. All Parse-supported formats except CSV and XLSX; maximum 200 MB.

```python
import json
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

classes = [
    {"class": "invoice", "description": "Commercial bill with line items and totals"},
    {"class": "bank_statement", "description": "Monthly summary of account transactions"},
    {"class": "pay_stub"},
]

response = client.classify(
    document=Path("batch.pdf"),
    classes=json.dumps(classes),
    model="classify-latest",
)

for page_result in response.classification:
    print(f"Page {page_result.page}: {page_result.class_}")   # class_ : Python reserved word
    if page_result.class_ == "unknown":
        print(f"  Suggested: {page_result.suggested_class}")
```

Classify page numbers are 0-indexed (v1 convention). `suggested_class` names the nearest class when a page is `unknown`.

### Document Sectioning (Section API)

Generates a hierarchical table of contents. **Requires v1 Parse output**: it depends on the `<a id="..."></a>` anchors that only v1 Parse emits. Do not feed it v2 Markdown.

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

parse_response = client.parse(document=Path("contract.pdf"), model="dpt-2-latest")  # v1 Parse

section_response = client.section(
    markdown=parse_response.markdown,
    model="section-latest",
)

for entry in section_response.table_of_contents:
    indent = "  " * (entry.level - 1)
    print(f"{indent}{entry.section_number}. {entry.title}")
print(section_response.table_of_contents_md)   # ready-to-use Markdown TOC
```

Optional `guidelines` parameter steers the hierarchy (for example, "Treat each numbered article as a top-level section"). Each entry has `title`, `level`, `section_number`, and `start_reference` (the v1 chunk id where the section begins).

### Build Extract Schema

Generates or refines a JSON extraction schema from sample Markdown and/or a prompt. Useful for automating schema creation or detecting schema drift.

```python
import json
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE

client = LandingAIADE()

with open("sample_invoice.md", "rb") as f:
    response = client.extract_build_schema(
        markdowns=[f],
        prompt="Extract invoice number, date, vendor name, and line items with quantities and amounts",
    )

schema = json.loads(response.extraction_schema)
```

Also accepts `markdown_urls`, an existing `schema` string to refine, or `prompt` alone. The returned `extraction_schema` is a JSON string; pass it directly to either Extract API's `schema=` parameter.

### Document Splitting (Split API)

Classifies and separates a multi-document file (for example, a scanned packet of invoices and receipts). **Split pipelines run on v1 Parse output**; for the details and a full example, see [references/v1-parse-extract.md](references/v1-parse-extract.md#split).

A next-generation **Split v2 API is in Preview** (select partners, not for production, REST only). If the user has Preview access, refer them to [https://docs.landing.ai/splitv2/splitv2](https://docs.landing.ai/splitv2/splitv2); it accepts Markdown from either Parse version.

## Error Handling

- **Sync timeout (HTTP 504):** `client.v2.parse()` / `client.v2.extract()` raise `V2SyncTimeoutError` (`from landingai_ade.lib.v2_errors import V2SyncTimeoutError`). Switch to the jobs APIs.
- **Partial parse (HTTP 206):** some pages failed; the response is still returned. Check `response.metadata.failed_pages` (1-indexed) and each page node's `status` / `reason`.
- **Partial extraction (HTTP 206):** check `response.schema_violation_error` and `response.warnings`; extracted data is still returned and credits are consumed.
- **Job failures:** `wait(..., raise_on_failure=True)` raises `JobFailedError`; `JobWaitTimeoutError` means the job is still running (poll `get()` later). Without the flag, inspect `job.status` and `job.error`.
- **HTTP 422:** invalid input, for example a password-protected file, `options.pages` values below 1, or `strict=True` with an unsupported schema.

For per-endpoint error codes and exact messages, see [references/troubleshooting.md](references/troubleshooting.md).

## Best Practices

- **Pin model snapshots in production** (`dpt-3-pro-20260710`, `extract-20260710`); use `-latest` aliases in development. Superseded snapshot names still resolve; `metadata.model_version` reports what actually ran.
- **Schema design:** descriptive field names, descriptions with format hints ("in USD", "as YYYY-MM-DD"), start small. See [references/extraction-schemas.md](references/extraction-schemas.md).
- **Batch or large workloads:** use the jobs APIs at the `standard` tier for half-price credits.
- **Cache parse output:** save Markdown (and the response JSON via `save_to`) so repeat extractions skip re-parsing. Keep the trailing `doc_id` comment intact.
- **Traceability:** keep `metadata.job_id` with your stored results; `extract` responses echo the parse job in `metadata.doc_id`.

## Reference Files

- [v1 Parse and Extract](references/v1-parse-extract.md): the previous-generation APIs, still required for Office formats, password-protected files, confidence scores, and Section/Split pipelines.
- [Migration Guide: v1 to v2](references/migration-v1-to-v2.md): request and response mapping for moving existing pipelines.
- [Extraction Schema Patterns](references/extraction-schemas.md): schema design in Pydantic, dict, and JSON Schema forms.
- [Chunk Types (v1)](references/chunk-types.md): v1 chunk type reference; v2 block types are documented above.
- [File Formats](references/file-formats.md): supported formats per API version.
- [Use Cases](references/use-cases.md): worked examples (invoices, forms, tables, figure cropping).
- [Troubleshooting](references/troubleshooting.md): error codes and fixes per endpoint.

## Links

- [ADE Documentation (v2 / DPT-3)](https://docs.landing.ai/dpt3/overview)
- [Parse v2](https://docs.landing.ai/dpt3/parse) | [Extract v2](https://docs.landing.ai/dpt3/extract) | [Parse Jobs](https://docs.landing.ai/dpt3/parse-async) | [Extract Jobs](https://docs.landing.ai/dpt3/extract-async)
- [Migration Guide](https://docs.landing.ai/dpt3/migration-guide) | [Rate Limits](https://docs.landing.ai/dpt3/rate-limits) | [Credit Consumption](https://docs.landing.ai/dpt3/credit-consumption)
- [v1 API Documentation](https://docs.landing.ai/ade/ade-overview)
- [Python Library (GitHub)](https://github.com/landing-ai/ade-python)
- [Get an API Key](https://va.landing.ai/settings/api-key)
