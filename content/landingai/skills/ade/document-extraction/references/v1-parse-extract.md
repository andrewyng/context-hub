# v1 Parse and Extract APIs

The previous-generation ADE Parse and Extract APIs. They are fully supported and not deprecated, but **new work should use the v2 APIs** (`client.v2.*`) documented in [SKILL.md](../SKILL.md). Use the v1 APIs described here when:

- The user has an existing v1 pipeline they are not ready to migrate.
- The document is not a PDF or an image (Word, PowerPoint, spreadsheets, and other formats).
- The file is password-protected.
- The pipeline needs confidence scores, custom figure prompts, or v1 page splits (`split="page"`).
- The pipeline feeds Parse output into the v1 Section or Split APIs, which require the v1 response shape.

To move a pipeline from v1 to v2, see [migration-v1-to-v2.md](migration-v1-to-v2.md).

## Table of Contents

- [Basic Parse and Extract](#basic-parse-and-extract)
- [Document Parsing](#document-parsing)
  - [Parse Parameters](#parse-parameters)
  - [Parse Spreadsheets](#parse-spreadsheets)
  - [Model Selection](#model-selection)
  - [Parse Large Files (Parse Jobs)](#parse-large-files-parse-jobs)
  - [Understanding Parse Outputs](#understanding-parse-outputs)
  - [Grounding and Traceability](#grounding-and-traceability)
  - [Confidence Scores](#confidence-scores)
  - [Password-Protected Files](#password-protected-files)
  - [Custom Prompts for Figure Descriptions](#custom-prompts-for-figure-descriptions)
  - [Saving Responses](#saving-responses)
- [Structured Data Extraction](#structured-data-extraction)
  - [Extraction Workflow](#extraction-workflow)
  - [Extract Large Documents (Extract Jobs, REST)](#extract-large-documents-extract-jobs-rest)
- [Document Splitting (Split API)](#split)
- [Handling Partial Results (HTTP 206)](#handling-partial-results-http-206)
- [v1 Best Practices](#v1-best-practices)

## Basic Parse and Extract

The v1 methods live on the top-level client and use v1 model names. Unlike v2, `client.extract()` requires the schema as a JSON **string**; convert Pydantic models with `pydantic_to_json_schema()`.

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from pydantic import BaseModel, Field
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema

class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    total_amount: float = Field(description="Total amount in USD")

client = LandingAIADE()

# Step 1: Parse (v1)
parse_response = client.parse(
    document=Path("invoice.pdf"),
    model="dpt-2-latest",
)

# Step 2: Extract (v1); schema must be a JSON string
extract_response = client.extract(
    schema=pydantic_to_json_schema(Invoice),
    markdown=parse_response.markdown,
    model="extract-latest",
)

print(extract_response.extraction)

# Traceability: which chunks provided each field
for field, metadata in extract_response.extraction_metadata.items():
    print(f"{field}: from chunks {metadata.chunk_ids}")
```

When defining a schema as a Python dict, convert it with `json.dumps()` before passing it to `client.extract(schema=...)`.

## Document Parsing

### Parse Parameters

```python
import json
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

response = client.parse(
    document=Path("document.pdf"),   # or document_url="https://..."
    model="dpt-2-latest",
    split="page",                                          # optional: organize chunks by page
    password="secret",                                     # optional: decrypt protected files (ZDR only)
    custom_prompts=json.dumps({"figure": "YOUR_PROMPT"}),  # optional: customize figure captions
    save_to="output/",                                     # optional: auto-save response JSON
)
```

### Parse Spreadsheets

Spreadsheets (CSV, XLSX) return a **different response type** than documents:

| Field | Documents (`ParseResponse`) | Spreadsheets (`SpreadsheetParseResponse`) |
|---|---|---|
| `metadata.page_count` | Present | Absent (uses `sheet_count`, `total_rows`, `total_cells`, `total_chunks`, `total_images`) |
| `splits[].pages` | Present | Absent (uses `sheets`: array of sheet indices) |
| `grounding` (top-level) | Present | Absent |
| Chunk grounding | Always present | Optional (null for table chunks, present for embedded image chunks) |

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

response = client.parse(document=Path("data.xlsx"), model="dpt-2-latest")

print(f"Sheets: {response.metadata.sheet_count}")
print(f"Total rows: {response.metadata.total_rows}")

for split in response.splits:
    print(f"Sheet indices: {split.sheets}")
    print(f"Markdown: {split.markdown[:200]}...")
```

### Model Selection

- **dpt-2-latest** (or `dpt-2`): the latest DPT-2 snapshot. Pin a dated snapshot such as `dpt-2-20260410` in production.
- **dpt-1**: deprecated; migrate to dpt-2.

The v1 Extract API defaults to the latest v1 extraction snapshot (currently `extract-20260314`). Its `extract-latest` alias is separate from the v2 Extract model namespace.

### Parse Large Files (Parse Jobs)

For files up to 1 GB or 6,000 pages, use v1 Parse Jobs:

```python
import time
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

job = client.parse_jobs.create(
    document=Path("large_document.pdf"),
    model="dpt-2-latest",
)
job_id = job.job_id

# Poll for completion (v1 has no wait() helper)
while True:
    response = client.parse_jobs.get(job_id)
    if response.status == "completed":
        break
    if response.status in ("failed", "cancelled"):
        print(f"Job {response.status}: {response.failure_reason}")
        break
    print(f"Progress: {response.progress * 100:.0f}%")
    time.sleep(5)

if response.data:
    print(f"Chunks: {len(response.data.chunks)}")
elif response.output_url:
    print(f"Download results from: {response.output_url}")   # results > 1MB
```

**Job status fields:** `job_id`, `status` (`pending`, `processing`, `completed`, `failed`, `cancelled`), `progress` (0 to 1), `data` (the `ParseResponse` when complete and result under 1 MB), `output_url` (presigned URL when larger or when `output_save_url` was used; expires after 1 hour, regenerated on each GET), `metadata`, `failure_reason`.

**List jobs:** `client.parse_jobs.list(page=0, page_size=10, status="completed")` returns `jobs` and `has_more`.

**Zero Data Retention (ZDR):** if ZDR is enabled for the organization, provide an `output_save_url` (a presigned URL with write access); results are saved there instead of being returned in the response.

```python
job = client.parse_jobs.create(
    document=Path("sensitive_document.pdf"),
    model="dpt-2-latest",
    output_save_url="https://your-bucket.s3.amazonaws.com/output.json",
)
```

### Understanding Parse Outputs

v1 Parse returns a `ParseResponse` with:

- **`markdown`**: complete document in Markdown with HTML anchor tags.
- **`chunks`**: flat array of extracted elements, each with a unique id, type, its own `markdown`, and per-chunk grounding.
- **`grounding`**: top-level dictionary mapping element ids to detailed location data (page, box, grounding type, table cell position).
- **`metadata`**: `filename`, `org_id`, `page_count`, `duration_ms`, `credit_usage` (float), `job_id`, `version`, `failed_pages`.
- **`splits`**: array of split objects grouping chunks. Always present (a single `"full"` split by default, or per-page splits with `split="page"`). Parse splits use a `class` field (`"full"` or `"page"`), which is different from the Split API's `classification` field.

**Common chunk types:** `text`, `table`, `figure`, `logo`, `card`, `attestation`, `scan_code`, `marginalia`. See [chunk-types.md](chunk-types.md) for the full reference.

**Anchor tag prefix in `chunk.markdown`:** every chunk's `markdown` starts with an HTML anchor embedding the chunk UUID: `<a id='abc123...'></a>\n\nActual content`. Strip it before string matching, display, or RAG indexing:

```python
import re
_ANCHOR_RE = re.compile(r"<a[^>]*></a>\s*", re.IGNORECASE)

def chunk_text(ch) -> str:
    """Return clean chunk markdown without the anchor prefix."""
    return _ANCHOR_RE.sub("", ch.markdown or "").strip()
```

### Grounding and Traceability

The top-level `grounding` dictionary is keyed by element id (UUID for chunks, `{page}-{base62}` for tables and table cells). Each entry contains `box` (normalized 0 to 1 coordinates with `left`, `top`, `right`, `bottom`), `page` (**zero-indexed** in v1), and `type`:

| Grounding Type | Chunk Type | Description |
|---|---|---|
| `chunkText` | `text` | Text content |
| `chunkTable` | `table` | Table chunk (overall location) |
| `chunkFigure` | `figure` | Figures and images |
| `chunkMarginalia` | `marginalia` | Headers, footers, page numbers |
| `chunkLogo` | `logo` | Company logos |
| `chunkCard` | `card` | ID cards, licenses |
| `chunkAttestation` | `attestation` | Signatures, stamps |
| `chunkScanCode` | `scan_code` | QR codes, barcodes |
| `table` | (grounding only) | HTML `<table>` element within a table chunk |
| `tableCell` | (grounding only) | Individual cell (includes a `position` object: `row`, `col`, `rowspan`, `colspan`, `chunk_id`) |

Per-chunk grounding (on each chunk object) contains only `box` and `page`; the top-level dictionary adds `type` and, for table cells, `position`.

```python
# Per-chunk grounding (basic location)
for chunk in response.chunks:
    bbox = chunk.grounding.box
    print(f"Chunk {chunk.id} page {chunk.grounding.page}: "
          f"({bbox.left}, {bbox.top}) to ({bbox.right}, {bbox.bottom})")

# Top-level grounding (detailed)
# NOTE: values are Pydantic models; use attribute access, not dict access
for elem_id, info in response.grounding.items():
    print(f"{elem_id}: type={info.type}, page={info.page}")
    if info.type == "tableCell" and info.position:
        print(f"  Cell at row={info.position.row}, col={info.position.col}")
```

> **Important:** `response.grounding` is a `Dict[str, Grounding]` (the container is a dict, so `.items()` works), but each **value** is a Pydantic model. Use attribute access (`info.type`, `info.box.left`), not `info["type"]`.

**Extract metadata fields (v1):**
- **`schema_violation_error`**: `null` when extraction matches the schema; an error message when it does not fully conform (HTTP 206). Partial data is still returned and credits are consumed.
- **`fallback_model_version`**: `null` normally; the model version actually used if the requested version failed and a fallback applied.

### Confidence Scores

v1-only (removed in v2). Top-level grounding entries may include:

- **`confidence`** (`float | None`): overall transcription confidence (0.0 to 1.0) for the chunk.
- **`low_confidence_spans`** (`list | None`): spans with low confidence, each with `confidence`, `text`, and `span` position markers.

```python
for elem_id, info in response.grounding.items():
    if info.confidence is not None:
        print(f"{elem_id}: confidence={info.confidence:.2f}")
    for span in info.low_confidence_spans or []:
        print(f"  Low confidence ({span.confidence:.2f}): '{span.text}'")
```

Confidence is only present in top-level grounding (not per-chunk), and not on all entry types. Use it to flag chunks for human review.

### Password-Protected Files

Organizations with [Zero Data Retention (ZDR)](https://docs.landing.ai/ade/zdr) enabled can parse password-protected files by passing `password` (supported formats: PDF, DOC, DOCX, ODT, PPT, PPTX, XLSX). Works on `client.parse()` and `client.parse_jobs.create()`.

Without ZDR the API returns HTTP 422; a wrong password also returns HTTP 422 with a decryption error. The parameter is ignored for unencrypted documents. The v2 Parse API does not support password-protected files at all.

### Custom Prompts for Figure Descriptions

v1-only (removed in v2). Controls how ADE describes figures during parsing:

```python
import json

response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest",
    custom_prompts=json.dumps({"figure": "Describe axis labels in detail."}),
)
```

Constraints: only the `figure` key is supported; maximum 512 characters; must be a JSON string via `json.dumps` (not a plain dict).

### Saving Responses

`save_to` works the same as in v2: available on `parse()`, `extract()`, and `split()` (sync and async clients). Directory mode auto-names the file `{input_filename}_{method}_output.json`; a path ending in `.json` saves exactly there. Directory mode requires `landingai-ade` v1.4.0+; full-path mode and async `save_to` require v1.13.0+.

## Structured Data Extraction

### Extraction Workflow

`client.extract()` requires `schema` as a JSON string. Use `pydantic_to_json_schema()` for Pydantic models or `json.dumps()` for dicts.

```python
import json
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

schema = json.dumps({
    "type": "object",
    "properties": {
        "account_holder": {"type": "string", "description": "Account holder name"},
        "account_number": {"type": "string", "description": "Account number"},
    },
})

parse_response = client.parse(document=Path("bank_statement.pdf"), model="dpt-2-latest")

extract_response = client.extract(
    schema=schema,
    markdown=parse_response.markdown,   # or markdown_url="https://..."
    model="extract-latest",
)

print(extract_response.extraction)          # plain dict
print(extract_response.extraction_metadata) # per-field chunk references
```

Schema keyword support for the current v1 model (`extract-20260314`): `type`, `description`, `properties` (objects), `items` (arrays), `enum`, `format`, and `x-alternativeNames`. See [extraction-schemas.md](extraction-schemas.md).

### Extract Large Documents (Extract Jobs, REST)

v1 Extract Jobs has **no SDK method**; call the REST API directly. Run v1 Parse first to produce the Markdown.

```python
import os
import json
import time
import requests
from dotenv import load_dotenv
load_dotenv()

base_url = "https://api.va.landing.ai/v1/ade/extract/jobs"
headers = {"Authorization": f"Bearer {os.environ['VISION_AGENT_API_KEY']}"}

schema = json.dumps({
    "type": "object",
    "properties": {
        "exam_date": {"type": "string", "description": "Date the procedure was performed."},
    },
})

# Create the job (202 Accepted)
create = requests.post(
    base_url,
    files={"markdown": open("document.md", "rb")},
    data={"schema": schema, "model": "extract-latest"},
    headers=headers,
)
create.raise_for_status()
job_id = create.json()["job_id"]

# Poll until terminal; add a timeout and backoff in production
while True:
    job = requests.get(f"{base_url}/{job_id}", headers=headers)
    job.raise_for_status()
    result = job.json()
    if result["status"] == "completed":
        if result.get("data"):
            print(result["data"]["extraction"])   # inline result (<= 1 MB)
        elif result.get("output_url"):
            print(f"Download from: {result['output_url']}")   # expires 1 hour after GET
        break
    if result["status"] in ("failed", "cancelled"):
        print(f"Job {result['status']}: {result.get('failure_reason')}")
        break
    time.sleep(5)
```

**Create parameters** (multipart form data): `schema` (required), `markdown` or `markdown_url` (one required; use `markdown_url` with ZDR), `model`, `strict` (default false), `output_save_url` (required with ZDR).

**List jobs:** `GET /v1/ade/extract/jobs` with `page`, `pageSize`, `status` query parameters; returns `jobs` and `has_more`.

**Rate limit:** v1 Extract Jobs has its own per-hour limit; each job counts as one page-equivalent regardless of Markdown size.

## Document Splitting (Split API) {#split}

Use Split when a single file contains multiple document types that need to be classified and separated. Split consumes **v1** Parse output.

```python
from dotenv import load_dotenv
load_dotenv()

from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

# Step 1: Parse the multi-document PDF (v1)
parse_response = client.parse(document=Path("batch.pdf"), model="dpt-2-latest")

# Step 2: Define split classes (maximum 19 per request)
split_classes = [
    {
        "name": "Invoice",
        "description": "Commercial invoices with itemized charges",
        "identifier": "Invoice Number",   # one split per unique invoice number
    },
    {
        "name": "Receipt",
        "description": "Payment receipts showing transaction details",
    },
]

# Step 3: Split
split_response = client.split(
    markdown=parse_response.markdown,   # or markdown_url="https://..."
    split_class=split_classes,
)

# Step 4: Process each split
for split in split_response.splits:
    print(f"Type: {split.classification}")
    print(f"Identifier: {split.identifier}")
    print(f"Pages: {split.pages}")
    print(f"Content: {split.markdowns[0][:200]}...")
```

**Split class fields:** `name` (required), `description` (optional; more detail improves accuracy), `identifier` (optional; creates a separate split per unique value). Maximum 19 split classes per request.

A **Split v2 API is in Preview** (select partners, REST only); it accepts Markdown from either Parse version. See [https://docs.landing.ai/splitv2/splitv2](https://docs.landing.ai/splitv2/splitv2).

## Handling Partial Results (HTTP 206)

**Parse 206:** some pages failed. Check `response.metadata.failed_pages` (zero-indexed in v1); the remaining pages parsed successfully.

**Extract 206:** extraction completed but does not fully match the schema. Check `response.metadata.schema_violation_error`; partial data is returned and credits are consumed.

## v1 Best Practices

- **Pin versions in production** (for example `dpt-2-20260410`); use `dpt-2-latest` in development.
- **Do not use dpt-1**: deprecated; migrate to dpt-2.
- **Large files:** use Parse Jobs for files over 50 pages or 10 MB.
- **Prefer PDF** for native documents; use 300+ DPI images for scans.
- **Cache parse results** (Markdown plus `save_to` JSON) to avoid re-parsing for repeat extractions.
