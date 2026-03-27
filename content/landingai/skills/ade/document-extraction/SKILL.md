---
name: document-extraction
description: Use this skill for intelligent document processing and content extraction using LandingAI's Agentic Document Extraction (ADE). Trigger when users need to (1) Parse documents (PDFs, images, spreadsheets, presentations) into structured Markdown with layout understanding, (2) Extract specific structured data from documents using schemas (invoice fields, form data, table data, etc.), (3) Classify and separate multi-document batches by type (invoices vs receipts, statements vs forms, etc.), (4) Process large documents asynchronously (up to 1GB/1000 pages), (5) Get visual grounding (bounding boxes, page numbers) for extracted content — use when users mention bounding boxes, word locations, grounding, highlighting extracted content, or showing where data appears in a document. Use this skill when the task involves understanding document content for a set of documents. In particular this skill can help you write code that run on sets of documents. This will increase speed, and reduce the cost of loading the documents on the Agent context window because you can use a single script to extract the information needed.
---

# Document Extraction (ADE)

## Overview

LandingAI's Agentic Document Extraction (ADE) is a document processing SaaS that parses, extracts, and classifies documents without requiring templates or training. It provides three main capabilities:

1. **Parse**: Convert documents into structured Markdown with hierarchical JSON representation
2. **Extract**: Pull specific structured data using JSON schemas or Pydantic models
3. **Split**: Classify and separate multi-document batches by type

**Key Benefits:**
- No ML training or templates required
- Layout-agnostic parsing (works with any document structure)
- Supports 20+ file formats (PDF, images, spreadsheets, presentations)
- Precise visual grounding (bounding boxes, page numbers)
- Multiple models optimized for different document types

## Quick Start

### 1. Installation

Never install packages globally without user approval. Always check for a local Python environment first.

```
1. .venv/bin/python       — uv-managed (this project)
2. venv/bin/python        — standard Python venv
3. uv run python          — if pyproject.toml exists
4. poetry run python      — if poetry.lock exists
5. python3                — system fallback; warn the user
```
Use the local environment to install: `landingai-ade`, `python-dotenv`

### 2. API Key Setup

The user may have already setup a `.env` file in the same directory as the `document-extraction` skill with the API key. You MUST check this path first (ls -la .*/skills/document-extraction/.env). Also try checking on the same directory as this SKILL.md file.

If not, provide instructions to create one. The script below will search for `.env` in common locations and load it.

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
                # ADD the directory where the document-extraction skill is located
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

If not key is found instruct the user to get an API key from [https://va.landing.ai/settings/api-key](https://va.landing.ai/settings/api-key)

Copy `.env-sample` to `.env` and add your API key:

```bash
cp .env-sample .env
```

Edit `.env` and add your key:
```
VISION_AGENT_API_KEY=your_actual_api_key_here
```

**Note:** The `.env` file is gitignored for security. Advanced users can also set the environment variable directly: `export VISION_AGENT_API_KEY=<your-key>`

**EU Endpoint:** If using the EU endpoint, set `environment="eu"` when initializing the client.

### 3. Basic Parse Example

```python
from dotenv import load_dotenv
load_dotenv()  # Load API key from .env

from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Parse a document
response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest"
)

# Access results
print(f"Pages: {response.metadata.page_count}")
print(f"Chunks: {len(response.chunks)}")
print("\nMarkdown output:")
print(response.markdown[:500])  # First 500 chars

# Save Markdown for extraction
with open("output.md", "w", encoding="utf-8") as f:
    f.write(response.markdown)
```

### 4. Basic Extract Example

```python
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema
from pydantic import BaseModel, Field
from pathlib import Path

# Define extraction schema using Pydantic
class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    invoice_date: str = Field(description="Invoice date")
    total_amount: float = Field(description="Total amount in USD")
    vendor_name: str = Field(description="Vendor name")

# Convert to JSON schema
schema = pydantic_to_json_schema(Invoice)

client = LandingAIADE()

# Extract from parsed markdown
response = client.extract(
    schema=schema,
    markdown=Path("output.md"),  # From parse step
    model="extract-latest"
)

# Access extracted data
print(response.extraction)
# Output: {'invoice_number': 'INV-12345', 'invoice_date': '2024-01-15', ...}

# Check extraction metadata (traceability)
print(response.extraction_metadata)
```

## Document Parsing

### Parse Local Files

```python
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

response = client.parse(
    document=Path("/path/to/document.pdf"),
    model="dpt-2-latest"
)

# Work with chunks
for chunk in response.chunks:
    print(f"Type: {chunk.type}, Page: {chunk.grounding.page}")
    print(f"Content: {chunk.markdown[:100]}...")
```

### Parse Remote URLs

```python
response = client.parse(
    document_url="https://example.com/document.pdf",
    model="dpt-2-latest"
)
```

### Parse Spreadsheets

Spreadsheets (CSV, XLSX) return a **different response type** than documents. Key differences:

| Field | Documents (`ParseResponse`) | Spreadsheets (`SpreadsheetParseResponse`) |
|---|---|---|
| `metadata.page_count` | ✓ | ✗ (uses `sheet_count`, `total_rows`, `total_cells`, `total_chunks`, `total_images`) |
| `splits[].pages` | ✓ | ✗ (uses `sheets` — array of sheet indices) |
| `grounding` (top-level) | ✓ | ✗ (not present for spreadsheets) |
| Chunk grounding | Always present | Optional (null for table chunks, present for embedded image chunks) |

```python
response = client.parse(
    document=Path("data.xlsx"),
    model="dpt-2-latest"
)

# Spreadsheet metadata
print(f"Sheets: {response.metadata.sheet_count}")
print(f"Total rows: {response.metadata.total_rows}")
print(f"Total cells: {response.metadata.total_cells}")

# Splits use 'sheets' instead of 'pages'
for split in response.splits:
    print(f"Sheet indices: {split.sheets}")
    print(f"Markdown: {split.markdown[:200]}...")
```

### Model Selection

Choose the right model for your documents:

| Model | Best For | Chunk Types |
|-------|----------|-------------|
| **dpt-2-latest** | Complex documents with logos, signatures, ID cards | text, table, figure, logo, card, attestation, scan_code, marginalia |
| **dpt-2-mini** | Simple, digitally-native documents (faster, cheaper) | text, table, figure, marginalia |
| **dpt-1** | ⚠️ **Deprecated March 31, 2026** — migrate to dpt-2 | text, table, figure, marginalia |

**Recommendation:** Use `dpt-2-latest` unless you have simple documents where cost/speed is critical.

**Version Pinning:** For production, use dated versions (e.g., `dpt-2-20260302`) for reproducibility.

### Parse Large Files (Async)

For files up to 1 GB or 6,000 pages, use Parse Jobs:

```python
import time
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Step 1: Create parse job
job = client.parse_jobs.create(
    document=Path("large_document.pdf"),
    model="dpt-2-latest"
)

job_id = job.job_id
print(f"Job {job_id} created")

# Step 2: Poll for completion
while True:
    response = client.parse_jobs.get(job_id)
    if response.status == "completed":
        print(f"Job {job_id} completed")
        break
    print(f"Progress: {response.progress * 100:.0f}%")
    time.sleep(5)

# Step 3: Access results
# Results are in response.data (or response.output_url for large results)
if response.data:
    print(f"Chunks: {len(response.data.chunks)}")
    with open("output.md", "w", encoding="utf-8") as f:
        f.write(response.data.markdown)
elif response.output_url:
    # Results > 1MB are returned as a presigned URL
    print(f"Download results from: {response.output_url}")
```

**Job Status Response Fields:**
- `job_id`, `status` (pending, processing, completed, failed, cancelled), `progress` (0-1)
- `data`: The `ParseResponse` (or `SpreadsheetParseResponse`) when complete and result < 1MB
- `output_url`: Presigned S3 URL when result > 1MB or when `output_save_url` was used. Expires after 1 hour; a new URL is generated on each GET.
- `metadata`: Same as sync parse (`filename`, `page_count`, `duration_ms`, etc.)
- `failure_reason`: Error message if job failed

### Zero Data Retention (ZDR)

If ZDR is enabled for your organization, you must provide an `output_save_url` where parsed results will be saved. The results will not be returned in the API response. ZDR is not enabled by default. Typically `output_save_url` is a presigned url with write permissions to your S3 bucket, but you can also use other storage solutions that support file uploads via HTTP PUT requests.

```python
job = client.parse_jobs.create(
    document=Path("sensitive_document.pdf"),
    model="dpt-2-latest",
    output_save_url="https://your-bucket.s3.amazonaws.com/output.json"
)
```

### List Parse Jobs

List all async parse jobs with optional pagination and status filtering:

```python
# List recent jobs
jobs_response = client.parse_jobs.list(page=0, page_size=10)
for job in jobs_response.jobs:
    print(f"{job.job_id}: {job.status} ({job.progress:.0%})")

# Filter by status
completed = client.parse_jobs.list(status="completed", page_size=5)
print(f"Completed jobs: {len(completed.jobs)}, more: {completed.has_more}")
```

**Available status filters:** `pending`, `processing`, `completed`, `failed`, `cancelled`

### Understanding Parse Outputs

Parse returns a `ParseResponse` with:

- **`markdown`**: Complete document in Markdown with HTML anchor tags
- **`chunks`**: Array of extracted elements (each with unique ID, type, content, and per-chunk grounding)
- **`grounding`**: Dictionary mapping element IDs to detailed location data (page, bounding box, grounding type, and table cell position). See [JSON Response](#json-response) for structure.
- **`metadata`**: Processing info — `filename`, `org_id`, `page_count`, `duration_ms`, `credit_usage` (float), `job_id`, `version`, `failed_pages`
- **`splits`**: Array of split objects grouping chunks. Always present — contains a single `"full"` split by default, or per-page splits if `split="page"` was used. **Note:** Parse splits use a `class` field (values: `"full"` or `"page"`), which is different from the Split API's `classification` field.

**Common chunk types**: `text`, `table`, `figure`, `logo`, `card`, `attestation`, `scan_code`, `marginalia`

For detailed chunk type reference, see [references/chunk-types.md](references/chunk-types.md)

> **Anchor tag prefix in `chunk.markdown`:** Every chunk's `markdown` field
> is prefixed with an HTML anchor tag embedding the chunk UUID:
> `<a id='abc123...'></a>\n\nActual content…`. This is how the full document
> markdown links back to individual chunks. Strip it before string matching,
> display, or RAG indexing:
>
> ```python
> import re
> _ANCHOR_RE = re.compile(r"<a[^>]*></a>\s*", re.IGNORECASE)
>
> def chunk_text(ch) -> str:
>     """Return clean chunk markdown without the anchor prefix."""
>     return _ANCHOR_RE.sub("", ch.markdown or "").strip()
>
> # Example: fingerprint match against a section of the full markdown
> intro_chunks = [ch for ch in response.chunks
>                 if chunk_text(ch)[:80] in intro_markdown]
> ```

### Saving Parse Responses

The SDK provides a built-in `save_to` parameter on `parse()`, `extract()`, and `split()` that automatically saves the JSON response to a folder:

```python
from pathlib import Path

# Parse and auto-save response JSON to output/ folder
response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest",
    save_to="output/"  # Creates output/document_parse_output.json
)

# Response is still returned normally for immediate use
print(response.markdown[:200])
```

The `save_to` parameter:
- Creates the folder if it doesn't exist
- Names the file `{input_filename}_{method}_output.json` (e.g., `document_parse_output.json`)
- Works on `client.parse()`, `client.extract()`, and `client.split()`
- Is a **client-side convenience** — it saves the full response locally after the API call

For manual serialization (e.g., custom filenames or selective saving), use `model_dump()`:

```python
import json

response_dict = response.model_dump()
with open("parse_response.json", "w", encoding="utf-8") as f:
    json.dump(response_dict, f, indent=2, ensure_ascii=False)

# Save markdown separately for extraction
with open("document_parsed.md", "w", encoding="utf-8") as f:
    f.write(response.markdown)
```

**Important:** Always use `model_dump()` to serialize the complete response. Do not manually construct dictionaries with selected fields, as you may miss important data like the `splits` array or complete grounding information.

### Parse Parameters

```python
response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest",
    split="page",       # Optional: organize chunks by page
    password="secret",   # Optional: decrypt protected files (ZDR only)
    save_to="output/",   # Optional: auto-save response JSON
)
```

### Parse Password-Protected Files

Organizations with [Zero Data Retention (ZDR)](https://docs.landing.ai/ade/zdr) enabled can parse password-protected files by passing the `password` parameter. Supported formats: PDF, DOC, DOCX, ODT, PPT, PPTX, XLSX.

```python
# Sync parse
response = client.parse(
    document=Path("encrypted.pdf"),
    password="document_password",
    model="dpt-2-latest"
)

# Async parse jobs
job = client.parse_jobs.create(
    document=Path("encrypted.pdf"),
    password="document_password",
    model="dpt-2-latest"
)
```

> **Note:** Without ZDR the API returns HTTP 422. If the password is wrong the API
> returns HTTP 422 with a decryption error. The parameter is ignored for unencrypted documents.

## Structured Data Extraction

### Schema Definition

Define what to extract using JSON Schema or Pydantic models.

**Pydantic approach (recommended for Python):**

```python
from pydantic import BaseModel, Field
from landingai_ade.lib import pydantic_to_json_schema

class BankStatement(BaseModel):
    account_holder: str = Field(description="Account holder name")
    account_number: str = Field(description="Account number")
    beginning_balance: float = Field(description="Beginning balance in USD")
    ending_balance: float = Field(description="Ending balance in USD")

schema = pydantic_to_json_schema(BankStatement)
```

**JSON Schema approach:**

```python
schema = {
    "type": "object",
    "properties": {
        "account_holder": {
            "type": "string",
            "description": "Account holder name"
        },
        "account_number": {
            "type": "string",
            "description": "Account number"
        },
        "beginning_balance": {
            "type": "number",
            "description": "Beginning balance in USD"
        },
        "ending_balance": {
            "type": "number",
            "description": "Ending balance in USD"
        }
    },
    "required": ["account_holder", "account_number"]
}
```

### Extraction Workflow

```python
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Step 1: Parse document
parse_response = client.parse(
    document=Path("bank_statement.pdf"),
    model="dpt-2-latest"
)

# Save markdown
with open("parsed.md", "w", encoding="utf-8") as f:
    f.write(parse_response.markdown)

# Step 2: Extract structured data
extract_response = client.extract(
    schema=schema,  # Your JSON schema
    markdown=Path("parsed.md"),
    model="extract-latest"
)

# Access extracted data
print(extract_response.extraction)

# Check traceability (which chunks provided each field)
for field, metadata in extract_response.extraction_metadata.items():
    print(f"{field}: from chunks {metadata.chunk_ids}")
```

### Extract from URL

You can extract from a remotely-hosted Markdown file using `markdown_url`:

```python
extract_response = client.extract(
    schema=schema,
    markdown_url="https://example.com/parsed_document.md",
    model="extract-latest"
)
```

### Common Schema Patterns

For detailed schema patterns, see [references/extraction-schemas.md](references/extraction-schemas.md)

**Nested objects:**
```python
class Address(BaseModel):
    street: str
    city: str
    zip_code: str

class Invoice(BaseModel):
    invoice_number: str
    billing_address: Address  # Nested object
```

**Arrays (lists):**
```python
class LineItem(BaseModel):
    description: str
    quantity: int
    amount: float

class Invoice(BaseModel):
    invoice_number: str
    line_items: list[LineItem]  # Array of objects
```

**Enums (restricted values):**
```python
class BankStatement(BaseModel):
    account_type: str = Field(
        description="Account type",
        enum=["Checking", "Savings"]  # Only these values allowed
    )
```

**Nullable fields:**
```python
class Patient(BaseModel):
    first_name: str
    middle_name: str | None = Field(default=None)  # Optional field
    last_name: str
```

### Document Classification

Classify documents before extracting type-specific fields:

```python
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE
from pydantic import BaseModel, Field
from landingai_ade.lib import pydantic_to_json_schema
from pathlib import Path

# Step 1: Define classification schema
class DocumentType(BaseModel):
    document_type: str = Field(
        description="Document classification",
        enum=["Invoice", "Receipt", "Bank Statement", "Other"]
    )

client = LandingAIADE()

# Step 2: Parse document
parse_response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest"
)

# Step 3: Classify document
classification_schema = pydantic_to_json_schema(DocumentType)
classification_response = client.extract(
    schema=classification_schema,
    markdown=parse_response.markdown,
    model="extract-latest"
)

doc_type = classification_response.extraction["document_type"]
print(f"Classified as: {doc_type}")

# Step 4: Extract based on type
if doc_type == "Invoice":
    schema = pydantic_to_json_schema(InvoiceSchema)
elif doc_type == "Receipt":
    schema = pydantic_to_json_schema(ReceiptSchema)
else:
    print("Unsupported document type")
    exit()

# Extract type-specific fields
extract_response = client.extract(
    schema=schema,
    markdown=parse_response.markdown,
    model="extract-latest"
)
```

## Document Classification & Splitting

### When to Use Split API

Use the Split API when you have multi-document batches on  single file that need to be separated:

- Financial services: Separate bank statements, utility bills, ID documents
- Healthcare: Split intake forms, medical reports, medication lists
- Accounting: Separate multiple invoices and receipts
- Academic: Separate article bodies from references

### Split Classification

Define how to classify and separate documents using `split_class`:

```python
from dotenv import load_dotenv
load_dotenv()

from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Step 1: Parse multi-document PDF
parse_response = client.parse(
    document=Path("batch.pdf"),
    model="dpt-2-latest"
)

# Step 2: Define split classes
split_classes = [
    {
        "name": "Invoice",
        "description": "Commercial invoices with itemized charges",
        "identifier": "Invoice Number"  # Separate by invoice number
    },
    {
        "name": "Receipt",
        "description": "Payment receipts showing transaction details",
        "identifier": "Receipt Date"
    },
    {
        "name": "Bank Statement",
        "description": "Monthly bank account statements"
    }
]

# Step 3: Split document
split_response = client.split(
    markdown=parse_response.markdown,
    split_class=split_classes
)

# Step 4: Process each split
for split in split_response.splits:
    print(f"Type: {split.classification}")
    print(f"Identifier: {split.identifier}")
    print(f"Pages: {split.pages}")
    print(f"Content: {split.markdowns[0][:200]}...")
```

**Split Class Components:**
- **name** (required): Document classification label (e.g., "Invoice")
- **description** (optional): Context for classification (more detail = better accuracy)
- **identifier** (optional): Field that makes each instance unique (creates separate split per unique value)
- **Limit:** Maximum 19 split classes per request

**Split from URL:** You can also split from a remotely-hosted Markdown file:

```python
split_response = client.split(
    markdown_url="https://example.com/parsed_document.md",
    split_class=split_classes
)
```

## Output Formats

### Markdown

ADE converts documents to structured Markdown:

```markdown
# Document Title

## Section 1

Paragraph text...

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

<::Caption: Bar chart showing quarterly revenue::>
```

**Features:**
- HTML anchor tags for traceability (link to chunk IDs)
- Special delimiters for visual elements: `<::Caption: description::>`
- HTML tables for spreadsheet data
- Preserved structure and hierarchy

### JSON Response

Parse returns structured JSON with five top-level fields:

```json
{
  "markdown": "# Document...",
  "chunks": [
    {
      "id": "7d58c5cf-e4f5-4a7e-ba34-0cd7bc6a6506",
      "type": "text",
      "markdown": "Content...",
      "grounding": {
        "page": 0,
        "box": { "left": 0.1, "top": 0.2, "right": 0.9, "bottom": 0.3 }
      }
    }
  ],
  "splits": [
    {
      "class": "full",
      "identifier": "full",
      "pages": [0],
      "markdown": "# Document...",
      "chunks": ["7d58c5cf-e4f5-4a7e-ba34-0cd7bc6a6506"]
    }
  ],
  "grounding": {
    "7d58c5cf-e4f5-4a7e-ba34-0cd7bc6a6506": {
      "box": { "left": 0.1, "top": 0.2, "right": 0.9, "bottom": 0.3 },
      "page": 0,
      "type": "chunkText",
      "confidence": 0.95,
      "low_confidence_spans": []
    },
    "0-1": {
      "box": { "left": 0.15, "top": 0.4, "right": 0.85, "bottom": 0.7 },
      "page": 0,
      "type": "table"
    },
    "0-2": {
      "box": { "left": 0.15, "top": 0.4, "right": 0.5, "bottom": 0.55 },
      "page": 0,
      "type": "tableCell",
      "position": { "row": 0, "col": 0, "rowspan": 1, "colspan": 1,
                     "chunk_id": "ef24b1ea-..." }
    }
  },
  "metadata": {
    "filename": "document.pdf",
    "org_id": "org-123",
    "page_count": 5,
    "duration_ms": 1500,
    "credit_usage": 2.0,
    "job_id": "abc-123",
    "version": "dpt-2-20260302",
    "failed_pages": []
  }
}
```

**Top-level `grounding`** is a dictionary keyed by element ID (UUID for chunks, `{page}-{base62}` for tables/cells). Each value contains `box`, `page`, `type`, and optionally `confidence` and `low_confidence_spans` (see [Confidence Scores](#confidence-scores)). Table cell entries also include a `position` field (see [Grounding and Traceability](#grounding-and-traceability)).

#### Grounding Type Mapping

Grounding types use a `chunk` prefix to distinguish them from chunk types. The `table` and `tableCell` types are grounding-only (no corresponding chunk type):

| Grounding Type | Chunk Type | Description |
|---|---|---|
| `chunkText` | `text` | Text content |
| `chunkTable` | `table` | Table chunk (overall location) |
| `chunkFigure` | `figure` | Figures and images |
| `chunkMarginalia` | `marginalia` | Headers, footers, page numbers |
| `chunkLogo` | `logo` | Company logos (DPT-2) |
| `chunkCard` | `card` | ID cards, licenses (DPT-2) |
| `chunkAttestation` | `attestation` | Signatures, stamps (DPT-2) |
| `chunkScanCode` | `scan_code` | QR codes, barcodes (DPT-2) |
| `table` | _(grounding only)_ | HTML `<table>` element within a table chunk |
| `tableCell` | _(grounding only)_ | Individual cell within a table |

Extract returns:

```json
{
  "extraction": {
    "invoice_number": "INV-12345",
    "total": 1250.00
  },
  "extraction_metadata": {
    "invoice_number": {
      "chunk_ids": ["chunk-uuid-1"]
    },
    "total": {
      "chunk_ids": ["chunk-uuid-2"],
      "cell_ids": ["2-a5"]
    }
  },
  "metadata": {
    "filename": "markdown.md",
    "org_id": "org-123",
    "duration_ms": 850,
    "credit_usage": 1.0,
    "job_id": "abc-456",
    "version": "extract-20251024",
    "schema_violation_error": null,
    "fallback_model_version": null
  }
}
```

**Extract Metadata Fields:**
- **`schema_violation_error`**: `null` when extraction matches schema. Contains a detailed error message when the extracted data doesn't fully conform (HTTP 206 response). Extraction still returns partial data and consumes credits.
- **`fallback_model_version`**: `null` normally. Contains the model version actually used when the initial extraction attempt failed with the requested version and a fallback was used.

### Grounding and Traceability

Every parsed element includes precise location information in the top-level `grounding` dictionary:

- **Page references**: Zero-indexed page numbers
- **Bounding boxes**: Normalized coordinates (0-1) for position
  - `left`, `top`, `right`, `bottom`
  - Convert to pixels: multiply by image dimensions
- **Element IDs**: UUID for chunks, `{page}-{base62}` for tables and table cells
  - Table/cell IDs use sequential base62 numbering per page: `0-1`, `0-2`, ..., `0-9`, `0-a`, ..., `0-z`, `0-A`, ..., `0-Z`, `0-10`, etc.
  - Numbering restarts on each page (e.g., first table on page 1 → `1-1`)
- **Grounding types**: Each entry has a `type` field using prefixed names (e.g., `chunkText`, `chunkTable`). See [Grounding Type Mapping](#grounding-type-mapping).
- **Table cell position**: `tableCell` entries include a `position` object with `row`, `col` (zero-indexed), `rowspan`, `colspan`, and `chunk_id` (the parent table chunk UUID)
- **Extraction metadata**: Shows which chunks/cells provided each field

**Per-chunk grounding** (on each chunk object) contains only `box` and `page`. The **top-level grounding dictionary** adds `type` and, for table cells, `position`.

**Example:**
```python
# Per-chunk grounding (basic location)
for chunk in response.chunks:
    print(f"Chunk {chunk.id} on page {chunk.grounding.page}")
    bbox = chunk.grounding.box
    print(f"Location: ({bbox.left}, {bbox.top}) to ({bbox.right}, {bbox.bottom})")

# Top-level grounding (detailed, with type and position)
# NOTE: grounding values are Pydantic models — use attribute access, not dict access
for elem_id, info in response.grounding.items():
    print(f"{elem_id}: type={info.type}, page={info.page}")
    if info.type == "tableCell" and info.position:
        print(f"  Cell at row={info.position.row}, col={info.position.col}")
```

> **Important:** `response.grounding` is a `Dict[str, Grounding]` — the outer container is a dict (so `.items()`, `.get()` work), but each **value** is a Pydantic model. Use **attribute access** (`info.type`, `info.box.left`) not dict access (`info["type"]`).

### Confidence Scores {#confidence-scores}

Top-level grounding entries may include confidence information:

- **`confidence`** (`float | None`): Overall confidence score (0.0–1.0) for the chunk's transcription
- **`low_confidence_spans`** (`list | None`): Specific text spans with low confidence, each containing:
  - `confidence` (`float`): Span-level confidence score
  - `text` (`str`): The low-confidence text
  - `span` (`list`): Position markers within the chunk

```python
# Access confidence scores from top-level grounding
for elem_id, info in response.grounding.items():
    if info.confidence is not None:
        print(f"{elem_id}: confidence={info.confidence:.2f}")
    for span in info.low_confidence_spans or []:
        print(f"  Low confidence ({span.confidence:.2f}): "
              f"'{span.text}'")
```

**Notes:**
- Confidence is only present in **top-level grounding** (not per-chunk grounding)
- Not all grounding entries will have confidence (e.g., `table`/`tableCell` types may not)
- Use confidence scores to flag chunks that may need human review

## Best Practices

### Model Selection

- **Use dpt-2-latest** for most documents (complex layouts, logos, signatures)
- **Use dpt-2-mini** for simple, digitally-native documents (faster, cheaper)
- **Pin versions in production** for reproducibility (e.g., `dpt-2-20260302`)
- **Use extract-latest** for extraction (automatically uses newest model)
- **Do NOT use dpt-1** — deprecated March 31, 2026; migrate to dpt-2

### Schema Design

- **Be specific**: Use descriptive field names (`invoice_number` not `number`)
- **Add descriptions**: Include format requirements ("in USD", "as YYYY-MM-DD")
- **Keep it simple**: Start with few fields, add more as needed
- **Limit complexity**: Under 30 properties for optimal performance
- **Match document structure**: Order fields as they appear in document

For detailed schema patterns, see [references/extraction-schemas.md](references/extraction-schemas.md)

### Error Handling

```python
try:
    response = client.parse(document=Path("doc.pdf"), model="dpt-2-latest")
except Exception as e:
    print(f"Parse error: {e}")
    # Handle error (check file format, file size, API key, etc.)

try:
    extract_response = client.extract(schema=schema, markdown=response.markdown)
except Exception as e:
    print(f"Extract error: {e}")
    # Handle error (check schema validity, markdown format, etc.)
```

### Handling Partial Results (HTTP 206)

Both Parse and Extract APIs can return HTTP 206 (Partial Content) when processing partially succeeds:

**Parse 206**: Some pages failed to parse. Check `metadata.failed_pages`:
```python
response = client.parse(document=Path("doc.pdf"), model="dpt-2-latest")
if response.metadata.failed_pages:
    print(f"Failed pages: {response.metadata.failed_pages}")
    # Remaining pages were parsed successfully
```

**Extract 206**: Extraction completed but data doesn't fully match schema. Check `metadata.schema_violation_error`:
```python
response = client.extract(schema=schema, markdown=markdown)
err = response.metadata.schema_violation_error
if err:
    print(f"Schema violation: {err}")
    # Extraction still returns partial data; credits are consumed
```

**Note:** 206 responses still consume credits. The API returns the best results it could produce.

### Performance

- **Large files**: Use Parse Jobs API (async) for files > 50 pages or > 10 MB
- **Batch processing**: Process documents in parallel when possible
- **Cache parse results**: Save markdown to avoid re-parsing for multiple extractions
- **Optimize parsing**: Use the `split="page"` parameter when you need page-level organization

### File Formats

- **Prefer PDF** for native documents (no conversion needed)
- **Use high-resolution images** (300+ DPI) for better OCR
- **Password-protected files**: Use the `password` parameter (requires ZDR). Without ZDR, remove password protection before parsing
- **Test conversion** for DOCX/PPTX files (layout may change)

For complete file format reference, see [references/file-formats.md](references/file-formats.md)

## Use Cases

See [references/use-cases.md](references/use-cases.md) for complete worked examples: invoice processing, form data extraction, multi-document classification, table extraction, and figure cropping with PyMuPDF.

## Troubleshooting

See [references/troubleshooting.md](references/troubleshooting.md) for HTTP error codes, parse failures, extraction accuracy issues, schema validation errors, and performance guidance.

## Links

### Official Documentation
- [LandingAI ADE Documentation](https://docs.landing.ai/ade/)
- [Parse API Reference](https://docs.landing.ai/api-reference/tools/ade-parse)
- [Extract API Reference](https://docs.landing.ai/api-reference/tools/ade-extract)
- [Split API Reference](https://docs.landing.ai/api-reference/tools/ade-split)
- [Python Library (GitHub)](https://github.com/landing-ai/ade-python)

### API Key
- [Get API Key](https://va.landing.ai/settings/api-key)

### Reference Files
- [Extraction Schema Patterns](references/extraction-schemas.md) - Detailed schema examples
- [Chunk Types Reference](references/chunk-types.md) - Complete chunk type guide
- [File Formats](references/file-formats.md) - Supported formats and considerations
- [Use Cases](references/use-cases.md) - Worked examples for invoices, forms, tables, and figure extraction
- [Troubleshooting](references/troubleshooting.md) - HTTP error codes and common issues
