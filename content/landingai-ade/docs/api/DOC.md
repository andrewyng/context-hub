---
name: api
description: "REST API specification for LandingAI's Agentic Document Extraction (ADE). Covers all endpoints (Parse, Extract, Split, Parse Jobs), request parameters, response structures, data types, error codes, model versions, and curl examples."
metadata:
  languages: "http"
  versions: "v1"
  updated-on: "2026-03-04"
  source: maintainer
  tags: "landingai,ade,api,document-extraction,parse,extract,split,parse-jobs,curl,rest"
---

# LandingAI ADE API Specification

Complete API specification for LandingAI's Agentic Document Extraction (ADE).

## Overview

ADE provides a REST API for document parsing, splitting, data extraction, and large file parse jobs. All SDKs and tools (Python, TypeScript) use this same underlying API.

**Core workflow**: Parse first → then Split and/or Extract from the parsed markdown. Extract and Split accept **markdown, not raw files**.

## Base Configuration

| Region | Base URL |
|--------|----------|
| US (default) | `https://api.va.landing.ai/v1/ade` |
| EU | `https://api.va.eu-west-1.landing.ai/v1/ade` |

All endpoint paths below are relative to the base URL (e.g., `POST {base}/parse`).

**Authentication**: All requests require `Authorization: Bearer $VISION_AGENT_API_KEY`

**Content type**: Always use `-F` (multipart form data), never `-d` (JSON body).

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Sending a PDF/image to `/extract` or `/split` | **Parse first** to get markdown, then extract/split from that |
| `Authorization: Basic` | Must be `Authorization: Bearer` |
| `-F "pdf=@..."` or `-F "file=@..."` | Field name is `document` (parse) or `markdown` (extract/split) |
| Missing `@` before file path in curl | `-F "document=@/path/to/file"` needs the `@` |
| Using `-d` (JSON body) instead of `-F` | Always use `-F` for multipart form data |
| Missing `schema` on extract | Required — define a JSON schema for the fields you want |
| Not using `jq -r` when extracting markdown | Plain `jq` wraps output in quotes with escapes; `jq -r` gives raw text |
| Sync parse on huge documents | Use `/parse/jobs` for files >50MB or >50 pages |

---

## API Endpoints

### 1. Parse API

**Endpoint**: `POST /parse`

Converts documents to structured markdown with visual grounding.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document` | file | One required | Local file — PDF, images (JPG/PNG/TIFF/WEBP/GIF/BMP/PSD + more), Word (DOC/DOCX/ODT), PowerPoint (PPT/PPTX/ODP), spreadsheets (XLSX/CSV) |
| `document_url` | string | One required | Remote document URL |
| `model` | string | No | Model version (default: `dpt-2-latest`) |
| `split` | string | No | Split mode: `"page"` to split by pages |

#### Response Structure

```
.markdown          → string: full document as markdown
.chunks[]          → {id, type, markdown, grounding: {page, box: {left, top, right, bottom}}}
.grounding         → {id → {type, page, box, confidence?, low_confidence_spans?, position?}} — bounding boxes, confidence scores, and tableCell positions
.splits[]          → {chunks[], class, identifier, markdown, pages[]} — always present; contains a single "full" split by default, or per-page splits if split="page". Note: singular `markdown` string since each split is one page (or the full doc)
.metadata          → {filename, org_id, page_count, duration_ms, credit_usage (float), version, job_id, failed_pages}
```

<details>
<summary>Full JSON example</summary>

```json
{
  "markdown": "string",
  "chunks": [
    {
      "id": "uuid",
      "type": "text|table|marginalia|figure|scan_code|logo|card|attestation",
      "markdown": "string",
      "grounding": {
        "page": 0,
        "box": { "left": 0.1, "top": 0.2, "right": 0.9, "bottom": 0.3 }
      }
    }
  ],
  "grounding": {
    "chunk-id": {
      "type": "chunkText|chunkTable|chunkFigure|chunkMarginalia|chunkLogo|chunkCard|chunkAttestation|chunkScanCode|table|tableCell",
      "page": 0,
      "box": { "left": 0.1, "top": 0.2, "right": 0.9, "bottom": 0.3 },
      "confidence": 0.95,
      "low_confidence_spans": []
    },
    "0-1": { "type": "table", "page": 0, "box": {} },
    "0-2": {
      "type": "tableCell", "page": 0, "box": {},
      "position": { "row": 0, "col": 0, "rowspan": 1, "colspan": 1, "chunk_id": "uuid" }
    }
  },
  "splits": [
    { "chunks": ["chunk-id-1"], "class": "full", "identifier": "full", "markdown": "string", "pages": [0, 1, 2] }
  ],
  "metadata": {
    "filename": "document.pdf", "org_id": "org_abc123", "page_count": 5,
    "duration_ms": 1234, "credit_usage": 3, "version": "dpt-2-latest",
    "job_id": "job_abc123", "failed_pages": []
  }
}
```

</details>

### 2. Extract API

**Endpoint**: `POST /extract`

Extracts structured data from markdown using JSON schemas. **Accepts markdown, not raw documents** — parse first if needed.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schema` | JSON string | Yes | JSON Schema defining extraction structure (under 30 properties recommended) |
| `markdown` | string/file | One required | Markdown content or markdown file to extract from |
| `markdown_url` | string | One required | URL to markdown content |
| `model` | string | No | Model version (default: `extract-latest`) |

#### Response Structure

```
.extraction        → object: extracted key-value pairs matching schema
.extraction_metadata → {field → {chunk_ids: [string], cell_ids?: [string]}} for grounding
.metadata          → {credit_usage, duration_ms, filename, job_id, org_id, version, fallback_model_version, schema_violation_error}
```

### 3. Split API

**Endpoint**: `POST /split`

Classifies and splits mixed documents by type. **Accepts markdown, not raw documents** — parse first if needed.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `split_class` | JSON array | Yes | Classification configuration (see below) |
| `markdown` | string | One required | Markdown content to split |
| `markdown_url` | string | One required | URL to markdown content |
| `model` | string | No | Model version (default: `split-latest`) |

#### Split Class Structure

```json
{
  "name": "Invoice",              // Required: Classification name
  "description": "Sales invoice", // Optional: Description for better classification
  "identifier": "Invoice Number"  // Optional: Field to group documents by
}
// Maximum 19 split classes per request
```

#### Response Structure

```
.splits[]          → {classification, identifier, markdowns[], pages[]}
.metadata          → {filename, page_count, duration_ms, credit_usage, org_id, job_id, version}
```

> **Note:** The Split API returns `markdowns[]` (array) because a split can span multiple pages. The Parse API's page-level splits return singular `markdown` (string) since each split is exactly one page.

### 4. Parse Jobs API (Async)

For large files (>50MB or >50 pages), use asynchronous processing. Supports files up to **1 GB** or **6,000 pages**.

#### Create Job

**Endpoint**: `POST /parse/jobs`

**Parameters**: Same as Parse API plus:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `output_save_url` | string | If ZDR | URL for zero data retention output |

**Response**: `{ "job_id": "cml1kaihb08dxcn01b3mlfy5b" }`

#### Get Job Status

**Endpoint**: `GET /parse/jobs/{job_id}`

```
.job_id            → string
.status            → string: pending|processing|completed|failed|cancelled
.progress          → number: 0.0 to 1.0
.failure_reason    → string | null: error message if failed
.received_at       → number: Unix timestamp
.data              → ParseResponse | null: full result when completed (if output_save_url not used)
.output_url        → string | null: presigned URL when result >1MB or output_save_url was set (expires 1hr)
.org_id            → string
.version           → string
.metadata          → ParseMetadata | null
```

#### List Jobs

**Endpoint**: `GET /parse/jobs`

**Query Parameters**: `status` (filter), `page` (0-indexed), `pageSize` (items per page)

```
.jobs[]            → {job_id, status, progress, failure_reason, received_at}
.has_more          → boolean
.org_id            → string
```

---

## Data Types

### Chunk Types
- `text` — Characters, paragraphs, headings, lists, form fields, checkboxes, code blocks
- `table` — Grid of rows and columns; includes spreadsheets and receipts
- `figure` — Visual/graphical non-text content — images, graphs, flowcharts, diagrams
- `marginalia` — Content in document margins — headers, footers, page numbers, handwritten notes
- `logo` — Logos (DPT-2 only)
- `card` — ID cards and driver's licenses (DPT-2 only)
- `attestation` — Signatures, stamps, and seals (DPT-2 only)
- `scan_code` — QR codes and barcodes (DPT-2 only)

### Grounding Types

#### For Chunks (with "chunk" prefix)
- `chunkText`, `chunkTable`, `chunkFigure`, `chunkMarginalia`, `chunkLogo`, `chunkCard`, `chunkAttestation`, `chunkScanCode`

#### For Structure Elements (no prefix)
- `table` — Actual table structure
- `tableCell` — Individual table cell with position

### Bounding Box

All coordinates normalized 0–1: `{ left, top, right, bottom }`.

### Confidence Scores

Top-level grounding entries may include:
- **`confidence`** (`float | null`): Overall confidence score (0.0–1.0) for the chunk's transcription
- **`low_confidence_spans`** (`array | null`): Specific text spans with low confidence, each containing `confidence` (float), `text` (string), and `span` (position markers)

Not all grounding entries have confidence (e.g., `table`/`tableCell` types may not).

### Table Cell Position

`{ row, col, rowspan, colspan, chunk_id }` — all zero-indexed.

### Table Chunk Formats

Table chunks render as HTML. The ID format and grounding availability differ by source document type.

#### PDF / Image / Document Tables

Element IDs use the format `{page_number}-{base62_sequential_number}` (page starts at 0, numbers increment per element within the page). Cells may include `rowspan`/`colspan` attributes. The `grounding` object contains bounding boxes and `tableCell` position entries for every cell.

```html
<a id='chunk-uuid'></a>

<table id="0-1">
<tr><td id="0-2" colspan="2">Product Summary</td></tr>
<tr><td id="0-3">Product</td><td id="0-4">Revenue</td></tr>
<tr><td id="0-5">Hardware</td><td id="0-6">15,230</td></tr>
</table>
```

#### Spreadsheet Tables (XLSX / CSV)

Element IDs use the format `{tab_name}-{cell_reference}` (e.g., `Sheet 1-A1`). The table element itself uses `{tab_name}-{start_cell}:{end_cell}` (e.g., `Sheet 1-A1:B4`). Embedded images and charts become `figure` chunks.

**`grounding` is `null`** for spreadsheet table chunks — cell positions are encoded in the IDs themselves.

```html
<a id='Sheet 1-A1:B4-chunk'></a>

<table id='Sheet 1-A1:B4'>
  <tr>
    <td id='Sheet 1-A1'>Program</td>
    <td id='Sheet 1-B1'>Interest Rate</td>
  </tr>
  <tr>
    <td id='Sheet 1-A2'>15 Year Fixed-Rate Mortgage</td>
    <td id='Sheet 1-B2'>0.05125</td>
  </tr>
</table>
```

### Spreadsheet Parse Response

Spreadsheets (CSV, XLSX) return a **different response type** (`SpreadsheetParseResponse`) with key differences:

| Field | Documents (`ParseResponse`) | Spreadsheets (`SpreadsheetParseResponse`) |
|---|---|---|
| `metadata.page_count` | ✓ | ✗ (uses `sheet_count`, `total_rows`, `total_cells`, `total_chunks`, `total_images`) |
| `splits[].pages` | ✓ | ✗ (uses `sheets` — array of sheet indices) |
| `grounding` (top-level) | ✓ | ✗ (not present for spreadsheets) |
| Chunk grounding | Always present | Optional (null for table chunks, present for embedded image chunks) |

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "type": "error_type",
    "details": { "field": "problem_field", "reason": "Specific reason" }
  }
}
```

### HTTP Status Codes

| Status | Name | Description | Solution |
|--------|------|-------------|----------|
| 200 | Success | Request completed successfully | Continue with normal operations |
| 206 | Partial Content | Parse: some pages failed (check `metadata.failed_pages`). Extract: data does not fully conform to schema (check `metadata.schema_violation_error`) | Review failed pages or schema violations; partial data is still returned and credits are consumed |
| 400 | Bad Request | Invalid request due to malformed input, unsupported version, or client-side errors | Review error message for specific issue |
| 401 | Unauthorized | Missing or invalid API key | Check that `VISION_AGENT_API_KEY` is present and valid |
| 402 | Payment Required | Account does not have enough credits | Verify correct API key; add more credits to your account |
| 413 | Payload Too Large | File exceeds sync parse limit | Use Parse Jobs API for large files |
| 422 | Unprocessable Entity | Input validation failed | Review request parameters, file format, and schema JSON |
| 429 | Too Many Requests | Rate limit exceeded | Wait before retrying; implement exponential backoff |
| 500 | Internal Server Error | Server error during processing | Retry with backoff; if persistent, contact support@landing.ai |
| 504 | Gateway Timeout | Request exceeded timeout limit (475 seconds) | Reduce document size or simplify schema; use Parse Jobs API |

## Model Versions

### Parse Models

| Model | Best For | Chunk Types |
|-------|----------|-------------|
| **`dpt-2-latest`** | Complex documents with logos, signatures, ID cards | text, table, figure, marginalia, logo, card, attestation, scan_code |
| **`dpt-2-mini`** | Simple, digitally-native documents (faster, cheaper) | text, table, figure, marginalia |
| **`dpt-1`** | ⚠️ **Deprecated March 31, 2026** — migrate to dpt-2 | text, table, figure, marginalia |

**Version Pinning:** For production, use dated versions (e.g., `dpt-2-20251103`) for reproducibility.

### Extract & Split Models

| Operation | Current Version | Description |
|-----------|----------------|-------------|
| Extract | `extract-latest` (currently `extract-20251024`) | Schema-based extraction |
| Split | `split-latest` | Document classification |

## Supported File Types

| Category | Formats | Notes |
|----------|---------|-------|
| **PDF** | PDF | Up to 100 pages in Playground (see rate limits for API); no password-protected files |
| **Images** | JPEG, JPG, PNG, APNG, BMP, DCX, DDS, DIB, GD, GIF, ICNS, JP2, PCX, PPM, PSD, TGA, TIF, TIFF, WEBP | |
| **Text Documents** | DOC, DOCX, ODT | Converted to PDF before parsing |
| **Presentations** | ODP, PPT, PPTX | Converted to PDF before parsing |
| **Spreadsheets** | CSV, XLSX | Up to 10 MB in Playground; no limit in API |

> **Note:** Word, PowerPoint, and OpenDocument files are converted to PDF server-side before parsing.

> **Spreadsheets** return a different response type — see [Spreadsheet Parse Response](#spreadsheet-parse-response) above.

## Best Practices

### File Size Handling
- < 50MB: Use synchronous Parse API
- \> 50MB: Use Parse Jobs API
- \> 100MB: Consider splitting document first

### Rate Limiting
- Implement exponential backoff — start with 10s, double on each retry, max 5 retries

### Cost Optimization
- Parse once, extract/split multiple times
- Use specific schemas (avoid extracting everything)
- Cache parsed results when possible

---

# API (curl) Reference

Direct HTTP API implementation using curl and shell scripts.

## Authentication

```bash
export VISION_AGENT_API_KEY="v2_..."
BASE_URL="https://api.va.landing.ai/v1/ade"  # or https://api.va.eu-west-1.landing.ai/v1/ade for EU
```

## Parse Examples

### Basic Parse
```bash
curl -s -X POST "$BASE_URL/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@document.pdf" \
  -F "model=dpt-2-latest"
```

### Parse with Page Splitting
```bash
curl -s -X POST "$BASE_URL/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@multi_page.pdf" \
  -F "split=page"
```

### Parse from URL
```bash
curl -s -X POST "$BASE_URL/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document_url=https://example.com/document.pdf"
```

## Extract Examples

```bash
SCHEMA='{
  "type": "object",
  "properties": {
    "invoice_number": {"type": "string", "description": "Invoice number"},
    "total_amount": {"type": "number", "description": "Total amount"},
    "vendor_name": {"type": "string", "description": "Vendor name"}
  }
}'

# Extract from a markdown file (parse first if you have a PDF)
curl -s -X POST "$BASE_URL/extract" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "markdown=@parsed_invoice.md" \
  -F "schema=$SCHEMA" \
  -F "model=extract-latest"
```

### Parse Once, Extract Many
```bash
# Parse once, save markdown
MARKDOWN=$(curl -s -X POST "$BASE_URL/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@invoice.pdf" \
  | jq -r '.markdown')

# Extract with different schemas
curl -s -X POST "$BASE_URL/extract" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "markdown=$MARKDOWN" \
  -F "schema=$SCHEMA"
```

## Split Examples

```bash
SPLIT_CLASSES='[
  {"name": "Invoice", "identifier": "Invoice Number"},
  {"name": "Receipt", "identifier": "Receipt Number"},
  {"name": "Purchase Order", "identifier": "PO Number"}
]'

# Parse first, then split
MARKDOWN=$(curl -s -X POST "$BASE_URL/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@mixed_documents.pdf" \
  | jq -r '.markdown')

curl -s -X POST "$BASE_URL/split" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "markdown=$MARKDOWN" \
  -F "split_class=$SPLIT_CLASSES" \
  -F "model=split-latest"
```

## Parse Jobs (Async, Large Files)

```bash
#!/bin/bash

# Create job
JOB_ID=$(curl -s -X POST "$BASE_URL/parse/jobs" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@large_document.pdf" \
  -F "model=dpt-2-latest" \
  | jq -r '.job_id')

echo "Created job: $JOB_ID"

# Poll for completion
while true; do
  STATUS=$(curl -s -X GET "$BASE_URL/parse/jobs/$JOB_ID" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY")

  STATE=$(echo "$STATUS" | jq -r '.status')
  PROGRESS=$(echo "$STATUS" | jq -r '.progress')

  echo "Status: $STATE, Progress: $(echo "$PROGRESS * 100" | bc)%"

  if [ "$STATE" = "completed" ]; then
    echo "$STATUS" | jq '.data' > "parse_result.json"
    break
  elif [ "$STATE" = "failed" ]; then
    echo "Job failed: $(echo "$STATUS" | jq -r '.failure_reason')" >&2
    exit 1
  fi

  sleep 5
done
```

## Complete Workflow: Parse → Split → Extract

```bash
#!/bin/bash

# 1. Parse
MARKDOWN=$(curl -s -X POST "$BASE_URL/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@mixed_invoices.pdf" \
  | jq -r '.markdown')

# 2. Split
SPLIT_CLASSES='[
  {"name": "Invoice", "identifier": "Invoice Number"},
  {"name": "Credit Note", "identifier": "Credit Note Number"}
]'

SPLITS=$(curl -s -X POST "$BASE_URL/split" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "markdown=$MARKDOWN" \
  -F "split_class=$SPLIT_CLASSES")

# 3. Extract from each split
SCHEMA='{"type": "object", "properties": {
  "document_number": {"type": "string"},
  "total": {"type": "number"},
  "date": {"type": "string"}
}}'

echo "$SPLITS" | jq -c '.splits[]' | while read -r split; do
  TYPE=$(echo "$split" | jq -r '.classification')
  ID=$(echo "$split" | jq -r '.identifier')
  MD=$(echo "$split" | jq -r '.markdowns[0]')

  echo "Processing $TYPE: $ID"

  curl -s -X POST "$BASE_URL/extract" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
    -F "markdown=$MD" \
    -F "schema=$SCHEMA" \
    | jq '.extraction'
done
```

## Error Handling with Retry

```bash
#!/bin/bash

MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/parse" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
    -F "document=@document.pdf")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 206 ]; then
    echo "$BODY"
    break
  elif [ "$HTTP_CODE" -eq 429 ]; then
    WAIT_TIME=$((2 ** RETRY_COUNT * 10))
    echo "Rate limited. Waiting ${WAIT_TIME}s..." >&2
    sleep $WAIT_TIME
    RETRY_COUNT=$((RETRY_COUNT + 1))
  elif [ "$HTTP_CODE" -eq 413 ] || [ "$HTTP_CODE" -eq 504 ]; then
    echo "File too large or timeout — use parse jobs API" >&2
    exit 1
  elif [ "$HTTP_CODE" -eq 402 ]; then
    echo "Insufficient credits" >&2
    exit 1
  else
    echo "Error: HTTP $HTTP_CODE" >&2
    echo "$BODY" | jq '.error' >&2
    exit 1
  fi
done
```

## jq Recipes

```bash
# Extract just markdown
curl -s ... | jq -r '.markdown'

# Get all tables
curl -s ... | jq '.chunks[] | select(.type == "table")'

# Extract table cells with positions
curl -s ... | jq '.grounding | to_entries[] | select(.value.type == "tableCell")'

# Get chunks from specific page
curl -s ... | jq '.chunks[] | select(.grounding.page == 0)'

# Group chunks by type with counts
curl -s ... | jq '.chunks | group_by(.type) | map({type: .[0].type, count: length})'

# Get specific extracted field
curl -s ... | jq '.extraction.invoice_number'

# Process extracted line items
curl -s ... | jq '.extraction.line_items[] | {sku: .sku, total: (.quantity * .unit_price)}'
```

## Shell Functions for Reuse

```bash
ade_parse() {
  curl -s -X POST "$BASE_URL/parse" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
    -F "document=@$1"
}

ade_extract() {
  curl -s -X POST "$BASE_URL/extract" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
    -F "markdown=$1" \
    -F "schema=$2"
}
```

---

## External Links

- [API Reference](https://docs.landing.ai/api-reference)
- [ADE Documentation](https://docs.landing.ai/ade)
- [Supported File Types](https://docs.landing.ai/ade/ade-file-types)
