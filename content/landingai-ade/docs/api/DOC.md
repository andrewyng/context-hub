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
| US (default) | `https://api.va.landing.ai` |
| EU | `https://api.va.eu-west-1.landing.ai` |

All endpoint paths below are relative to the base URL (e.g., `POST {base}/v1/ade/parse`).

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
| Sync parse on huge documents | Use `/v1/ade/parse/jobs` for files >50MB or >50 pages |

---

## API Endpoints

### 1. Parse API

**Endpoint**: `POST /v1/ade/parse`

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
.grounding         → {id → {type, page, box, position?}} — bounding boxes + tableCell positions
.splits[]          → {chunks[], class, identifier, markdown, pages[]} (only if split="page")
.metadata          → {filename, org_id, page_count, duration_ms, credit_usage, version, job_id, failed_pages}
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
      "type": "chunkText|chunkTable|chunkFigure|chunkLogo|chunkCard|chunkAttestation|chunkScanCode|chunkForm|chunkMarginalia|chunkTitle|chunkPageHeader|chunkPageFooter|chunkPageNumber|chunkKeyValue|table|tableCell",
      "page": 0,
      "box": { "left": 0.1, "top": 0.2, "right": 0.9, "bottom": 0.3 }
    },
    "0-1": { "type": "table", "page": 0, "box": {} },
    "0-2": {
      "type": "tableCell", "page": 0, "box": {},
      "position": { "row": 0, "col": 0, "rowspan": 1, "colspan": 1, "chunk_id": "uuid" }
    }
  },
  "splits": [
    { "chunks": ["chunk-id-1"], "class": "page", "identifier": "0", "markdown": "string", "pages": [0] }
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

**Endpoint**: `POST /v1/ade/extract`

Extracts structured data from markdown using JSON schemas. **Accepts markdown, not raw documents** — parse first if needed.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schema` | JSON string | Yes | JSON Schema defining extraction structure |
| `markdown` | string/file | One required | Markdown content or markdown file to extract from |
| `markdown_url` | string | One required | URL to markdown content |
| `model` | string | No | Model version (default: `extract-latest`) |

#### Response Structure

```
.extraction        → object: extracted key-value pairs matching schema
.extraction_metadata → {field → {references: [chunk_ids]}} for grounding
.metadata          → {credit_usage, duration_ms, filename, job_id, org_id, version, fallback_model_version, schema_violation_error}
```

### 3. Split API

**Endpoint**: `POST /v1/ade/split`

Classifies and splits mixed documents by type. **Accepts markdown, not raw documents** — parse first if needed.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `split_class` | JSON array | Yes | Classification configuration (see below) |
| `markdown` | string | One required | Markdown content to split |
| `markdownUrl` | string | One required | URL to markdown content |
| `model` | string | No | Model version (default: `split-latest`) |

#### Split Class Structure

```json
{
  "name": "Invoice",              // Required: Classification name
  "description": "Sales invoice", // Optional: Description for better classification
  "identifier": "Invoice Number"  // Optional: Field to group documents by
}
```

#### Response Structure

```
.splits[]          → {chunks[], class, classification, identifier, markdowns[], pages[]}
.metadata          → {credit_usage, duration_ms, filename, page_count, job_id, org_id, version}
```

### 4. Parse Jobs API (Async)

For large files (>50MB), use asynchronous processing.

#### Create Job

**Endpoint**: `POST /v1/ade/parse/jobs`

**Parameters**: Same as Parse API plus:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `output_save_url` | string | If ZDR | URL for zero data retention output |

**Response**: `{ "job_id": "cml1kaihb08dxcn01b3mlfy5b" }`

#### Get Job Status

**Endpoint**: `GET /v1/ade/parse/jobs/{job_id}`

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

**Endpoint**: `GET /v1/ade/parse/jobs`

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

| Status | Error Type | Description | Solution |
|--------|------------|-------------|----------|
| 400 | `validation_error` | Invalid parameters | Check request format |
| 401 | `authentication_error` | Invalid API key | Check VISION_AGENT_API_KEY |
| 413 | `payload_too_large` | File too large | Use Parse Jobs API |
| 422 | `unprocessable_entity` | Invalid file type or malformed schema | Validate file format and schema JSON |
| 429 | `rate_limit_error` | Too many requests | Implement backoff |
| 500 | `internal_error` | Server error | Retry with backoff |
| 504 | `timeout_error` | Request timeout | Use Parse Jobs API |

## Model Versions

| Operation | Current Version | Description |
|-----------|----------------|-------------|
| Parse | `dpt-2-latest` | Document parsing and OCR |
| Extract | `extract-latest` | Schema-based extraction |
| Split | `split-latest` | Document classification |

## Supported File Types

| Category | Formats | Notes |
|----------|---------|-------|
| **PDF** | PDF | Up to 100 pages; no password-protected files |
| **Images** | JPEG, JPG, PNG, APNG, BMP, DCX, DDS, DIB, GD, GIF, ICNS, JP2, PCX, PPM, PSD, TGA, TIF, TIFF, WEBP | |
| **Text Documents** | DOC, DOCX, ODT | Converted to PDF before parsing |
| **Presentations** | ODP, PPT, PPTX | Converted to PDF before parsing |
| **Spreadsheets** | CSV, XLSX | Up to 10 MB in Playground; no sheet/column/row limits |

> **Note:** Word, PowerPoint, and OpenDocument files are converted to PDF server-side before parsing.

## Best Practices

### File Size Handling
- < 50MB: Use synchronous Parse API
- \> 50MB: Use Parse Jobs API
- \> 100MB: Consider splitting document first

### Rate Limiting
- Implement exponential backoff — start with 1s, double on each retry, max 5 retries

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
BASE_URL="https://api.va.landing.ai"  # or https://api.va.eu-west-1.landing.ai for EU
```

## Parse Examples

### Basic Parse
```bash
curl -s -X POST "$BASE_URL/v1/ade/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@document.pdf" \
  -F "model=dpt-2-latest"
```

### Parse with Page Splitting
```bash
curl -s -X POST "$BASE_URL/v1/ade/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@multi_page.pdf" \
  -F "split=page"
```

### Parse from URL
```bash
curl -s -X POST "$BASE_URL/v1/ade/parse" \
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
curl -s -X POST "$BASE_URL/v1/ade/extract" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "markdown=@parsed_invoice.md" \
  -F "schema=$SCHEMA" \
  -F "model=extract-latest"
```

### Parse Once, Extract Many
```bash
# Parse once, save markdown
MARKDOWN=$(curl -s -X POST "$BASE_URL/v1/ade/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@invoice.pdf" \
  | jq -r '.markdown')

# Extract with different schemas
curl -s -X POST "$BASE_URL/v1/ade/extract" \
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
MARKDOWN=$(curl -s -X POST "$BASE_URL/v1/ade/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@mixed_documents.pdf" \
  | jq -r '.markdown')

curl -s -X POST "$BASE_URL/v1/ade/split" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "markdown=$MARKDOWN" \
  -F "split_class=$SPLIT_CLASSES" \
  -F "model=split-latest"
```

## Parse Jobs (Async, Large Files)

```bash
#!/bin/bash

# Create job
JOB_ID=$(curl -s -X POST "$BASE_URL/v1/ade/parse/jobs" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@large_document.pdf" \
  -F "model=dpt-2-latest" \
  | jq -r '.job_id')

echo "Created job: $JOB_ID"

# Poll for completion
while true; do
  STATUS=$(curl -s -X GET "$BASE_URL/v1/ade/parse/jobs/$JOB_ID" \
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
MARKDOWN=$(curl -s -X POST "$BASE_URL/v1/ade/parse" \
  -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
  -F "document=@mixed_invoices.pdf" \
  | jq -r '.markdown')

# 2. Split
SPLIT_CLASSES='[
  {"name": "Invoice", "identifier": "Invoice Number"},
  {"name": "Credit Note", "identifier": "Credit Note Number"}
]'

SPLITS=$(curl -s -X POST "$BASE_URL/v1/ade/split" \
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

  curl -s -X POST "$BASE_URL/v1/ade/extract" \
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
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/ade/parse" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
    -F "document=@document.pdf")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -eq 200 ]; then
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
  curl -s -X POST "$BASE_URL/v1/ade/parse" \
    -H "Authorization: Bearer $VISION_AGENT_API_KEY" \
    -F "document=@$1"
}

ade_extract() {
  curl -s -X POST "$BASE_URL/v1/ade/extract" \
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
