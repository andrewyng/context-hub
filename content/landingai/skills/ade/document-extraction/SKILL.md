---
name: document-extraction
description: "Parses, extracts, and classifies documents using LandingAI's Agentic Document Extraction (ADE). Supports PDFs, images, spreadsheets, and presentations; outputs structured Markdown with hierarchical JSON. Covers schema-based field extraction (JSON Schema or Pydantic), document classification and splitting by type, async processing for large files, and visual grounding (bounding boxes, page numbers). Use when parsing documents into structured Markdown, extracting specific fields with a schema, classifying mixed document batches, processing large files asynchronously, or when the user mentions bounding boxes, word locations, grounding, or highlighting where data appears in a document."
---

# Document Extraction (ADE)

## Overview

LandingAI's Agentic Document Extraction (ADE) is a document processing SaaS that parses, extracts, and classifies documents without requiring templates or training. The `landingai-ade` Python library is the recommended approach for most use cases. It wraps the REST API and handles authentication and response parsing for you.

ADE provides these core API functions:

| API | Python Method | What It Does |
|-----|--------------|--------------|
| **Parse** | `client.parse()` | Converts documents into structured Markdown, chunks, and metadata. Always the first step. |
| **Extract** | `client.extract()` | Pulls specific fields from Markdown using a JSON schema. |
| **Build Extract Schema** | `client.extract_build_schema()` | Generates or refines a JSON extraction schema from Markdown using AI. |
| **Split** | `client.split()` | Classifies and separates multi-document batches by document type. |
| **Parse Jobs (Create)** | `client.parse_jobs.create()` | Creates an async parse job for large files (up to 6,000 pages). |
| **Parse Jobs (Get)** | `client.parse_jobs.get()` | Retrieves the status and results of an async parse job. |
| **Parse Jobs (List)** | `client.parse_jobs.list()` | Lists all async parse jobs with optional status filtering. |

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
1. .venv/bin/python       : uv-managed (this project)
2. venv/bin/python        : standard Python venv
3. uv run python          : if pyproject.toml exists
4. poetry run python      : if poetry.lock exists
5. python3                : system fallback; warn the user
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
| `splits[].pages` | ✓ | ✗ (uses `sheets`: array of sheet indices) |
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

- **dpt-2-latest**: Complex documents with logos, signatures, ID cards
- **dpt-2-mini**: Simple, digitally-native documents (faster, cheaper)
- **dpt-1**: ❌ Deprecated; migrate to dpt-2

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
- **`metadata`**: Processing info: `filename`, `org_id`, `page_count`, `duration_ms`, `credit_usage` (float), `job_id`, `version`, `failed_pages`
- **`splits`**: Array of split objects grouping chunks. Always present (contains a single `"full"` split by default, or per-page splits if `split="page"` was used). **Note:** Parse splits use a `class` field (values: `"full"` or `"page"`), which is different from the Split API's `classification` field.

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
- Is a **client-side convenience** that saves the full response locally after the API call

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
import json

response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest",
    split="page",                                          # Optional: organize chunks by page
    password="secret",                                     # Optional: decrypt protected files (ZDR only)
    custom_prompts=json.dumps({"figure": "YOUR_PROMPT"}),  # Optional: customize figure captions (DPT-2 only)
    save_to="output/",                                     # Optional: auto-save response JSON
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

### Custom Prompts for Figure Descriptions

Use the optional `custom_prompts` parameter to control how ADE describes figures during parsing. Useful for domain-specific charts, standardized formats, or specific languages.

```python
import json

response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest",
    custom_prompts=json.dumps({"figure": "Describe axis labels in detail."}),
)
```

**Constraints:** DPT-2 only (DPT-2 mini returns HTTP 422). Only `figure` key is supported. Max 512 characters. Must be passed as a JSON string via `json.dumps` (not a plain dict).

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
import json

schema = json.dumps({
    "type": "object",
    "properties": {
        "account_holder": {
            "type": "string",
            "description": "Account holder name"
        },
        "account_number": {
            "type": "string",
            "description": "Account number"
        }
    }
})
```

`client.extract()` requires `schema` to be a JSON string. Use `json.dumps()` when defining a schema as a Python dict. `pydantic_to_json_schema()` already returns a string, so no conversion is needed on the Pydantic path.

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

### Build Extract Schema

Use the Build Extract Schema API to generate or refine a JSON schema from parsed Markdown. Call it via `client.extract_build_schema()` using the Python library. Useful when you want to automate schema creation or detect schema drift when new document variants enter your pipeline.

```python
import json

with open("sample_invoice.md", "rb") as f:
    response = client.extract_build_schema(
        markdowns=[f],
        prompt="Extract invoice number, date, vendor name, and line items with quantities and amounts",
        model="extract-latest",
    )

schema = json.loads(response.extraction_schema)
```

You can also pass `schema` (an existing schema string) to refine it, `markdown_urls` instead of file handles, or `prompt` alone without any Markdown. The response `extraction_schema` is already a JSON string; pass it directly to `client.extract(schema=response.extraction_schema)` without parsing.

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

> **Note:** `extract-20260314` supports these JSON Schema keywords: `type`, `description`, `properties` (for objects only), `items` (for arrays only), `enum`, `format`, and `x-alternativeNames`. Other keywords are silently ignored or cause errors; see [Keyword Support](https://docs.landing.ai/ade/ade-extract-schema-json#keyword-support).

## Document Classification & Splitting

### When to Use Split API

Use the Split API when a single file contains multiple document types that need to be classified and separated for downstream processing.

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

### Grounding and Traceability

The top-level `grounding` dictionary is keyed by element ID (UUID for chunks, `{page}-{base62}` for tables and table cells). Each entry contains `box` (normalized 0–1 coordinates), `page` (zero-indexed), and `type`:

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
| `tableCell` | _(grounding only)_ | Individual cell within a table (includes a `position` object: `row`, `col`, `rowspan`, `colspan`, `chunk_id`) |

**Per-chunk grounding** (on each chunk object) contains only `box` and `page`. The **top-level grounding dictionary** adds `type` and, for table cells, `position`.

```python
# Per-chunk grounding (basic location)
for chunk in response.chunks:
    print(f"Chunk {chunk.id} on page {chunk.grounding.page}")
    bbox = chunk.grounding.box
    print(f"Location: ({bbox.left}, {bbox.top}) to ({bbox.right}, {bbox.bottom})")

# Top-level grounding (detailed, with type and position)
# NOTE: grounding values are Pydantic models (use attribute access, not dict access)
for elem_id, info in response.grounding.items():
    print(f"{elem_id}: type={info.type}, page={info.page}")
    if info.type == "tableCell" and info.position:
        print(f"  Cell at row={info.position.row}, col={info.position.col}")
```

> **Important:** `response.grounding` is a `Dict[str, Grounding]` (the outer container is a dict, so `.items()`, `.get()` work), but each **value** is a Pydantic model. Use **attribute access** (`info.type`, `info.box.left`) not dict access (`info["type"]`).

**Extract metadata fields:**
- **`schema_violation_error`**: `null` when extraction matches schema. Contains an error message when extracted data doesn't fully conform (HTTP 206). Extraction still returns partial data and consumes credits.
- **`fallback_model_version`**: `null` normally. Contains the model version actually used if the requested version failed and a fallback was applied.

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

- **Pin versions in production** for reproducibility (e.g., `dpt-2-20260410`)
- **Use extract-latest** for extraction (automatically uses the newest model, currently `extract-20260314`)
- **Do NOT use dpt-1**: deprecated; migrate to dpt-2

### Schema Design

- **Be specific**: Use descriptive field names (`invoice_number` not `number`)
- **Add descriptions**: Include format requirements ("in USD", "as YYYY-MM-DD")
- **Keep it simple**: Start with few fields, add more as needed
- **Match document structure**: Order fields as they appear in document
- **`extract-20260314` capabilities**: Unlimited schema size, cross-page table reconstruction, and `x-alternativeNames` for semantic field matching across document variations

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
- [Build Extract Schema API Reference](https://docs.landing.ai/api-reference/tools/ade-build-schema)
- [Split API Reference](https://docs.landing.ai/api-reference/tools/ade-split)
- [Python Library (GitHub)](https://github.com/landing-ai/ade-python)

### API Key
- [Get API Key](https://va.landing.ai/settings/api-key)

### Reference Files
- [Extraction Schema Patterns](references/extraction-schemas.md) - Detailed schema examples
- [Chunk Types Reference](references/chunk-types.md) - Complete chunk type guide
- [File Formats](references/file-formats.md) - Supported formats and considerations
- [Use Cases](references/use-cases.md) - Worked examples for invoices, forms, tables, and figure extraction
- [Troubleshooting](references/troubleshooting.md) - Error codes and common issues by endpoint
