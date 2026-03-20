---
name: sdk
description: "TypeScript/JavaScript SDK reference for LandingAI's Agentic Document Extraction (ADE). Includes type definitions, Zod schema validation, async processing, error handling, type guards, and complete API context."
metadata:
  languages: "typescript"
  versions: "2.2.0"
  updated-on: "2026-03-04"
  source: maintainer
  tags: "landingai,ade,typescript,javascript,sdk,zod,document-extraction,parse,extract,split,async"
---

# LandingAI ADE — TypeScript SDK Reference

TypeScript/JavaScript SDK for LandingAI's Agentic Document Extraction.

## Installation

```bash
npm install landingai-ade
# or: yarn add landingai-ade / pnpm add landingai-ade
export VISION_AGENT_API_KEY="v2_..."
```

## Client Setup

```typescript
import { LandingAIADE } from "landingai-ade";

const client = new LandingAIADE();  // Uses VISION_AGENT_API_KEY env var
```

### Constructor Arguments

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apikey` | `string \| undefined` | env `VISION_AGENT_API_KEY` | API key (note: lowercase) |
| `environment` | `"production" \| "eu"` | `"production"` | Region — `"production"` (US) or `"eu"` |
| `baseURL` | `string \| undefined` | — | Override base URL |
| `timeout` | `number \| undefined` | SDK default | Request timeout in ms |
| `maxRetries` | `number \| undefined` | SDK default | Max retry attempts for transient errors |
| `defaultHeaders` | `Record<string, string>` | — | Custom headers for all requests |
| `fetch` | `typeof global.fetch` | — | Custom fetch implementation |

```typescript
// EU region
const client = new LandingAIADE({ environment: "eu" });

// Pass key directly
const client = new LandingAIADE({ apikey: "v2_..." });

// Full config
const client = new LandingAIADE({
  apikey: "v2_...",
  timeout: 60000,
  maxRetries: 3,
});
```

---

## 1. Parse

Converts documents to structured markdown with visual grounding.

### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document` | `Uploadable \| null` | One required | Local file (Buffer, ReadStream, File object) |
| `document_url` | `string \| null` | One required | Remote document URL |
| `model` | `string \| null` | No | Model version (default: `dpt-2-latest`) |
| `split` | `"page" \| null` | No | Split by pages |
| `saveTo` | `string` | No | Directory to save `{filename}_parse_output.json` |

### Returns `ParseResponse`

```
.markdown          → string: full document as markdown
.chunks[]          → Chunk: {id, type, markdown, grounding: {page, box}}
.grounding         → Record<string, Grounding>: bounding boxes, confidence scores, and tableCell positions
.splits[]          → Split: {chunks[], class, identifier, markdown, pages[]} — always present; contains a single "full" split by default, or per-page splits if split="page"
.metadata          → Metadata: {filename, org_id, page_count, duration_ms, credit_usage (float), version, job_id, failed_pages}
```

### Example

```typescript
const response = await client.parse({
  document: fs.createReadStream("./invoice.pdf"),
  model: "dpt-2-latest",
  saveTo: "./output",
});

console.log(response.markdown);
console.log(`${response.chunks.length} chunks, ${response.metadata.page_count} pages`);

const tables = response.chunks.filter(c => c.type === "table");
```

### Working with Chunks and Grounding

```typescript
// Filter by type and page
const tables = response.chunks.filter(c => c.type === "table");
const page0 = response.chunks.filter(c => c.grounding.page === 0);

// Find table cells with positions
const tableCells = Object.entries(response.grounding)
  .filter(([_, g]) => g.type === "tableCell")
  .map(([id, g]) => ({ id, page: g.page, position: g.position! }));

tableCells.forEach(cell => {
  const { row, col, rowspan, colspan } = cell.position;
  console.log(`Cell (${row},${col}) span ${rowspan}x${colspan}`);
});
```

---

## 2. Extract

Extracts structured data from markdown using a JSON schema.

### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schema` | `string` | Yes | JSON schema string (use `zodToJsonSchema()` from `zod-to-json-schema` to generate from Zod models) |
| `markdown` | `Uploadable \| string \| null` | One required | Markdown content, string, or file |
| `markdown_url` | `string \| null` | One required | URL to markdown |
| `model` | `string \| null` | No | Model version (default: `extract-latest`) |
| `saveTo` | `string` | No | Directory to save `{filename}_extract_output.json` |

### Returns `ExtractResponse`

```
.extraction        → Record<string, any>: extracted key-value pairs matching schema
.extraction_metadata → Record<string, {chunk_ids?: string[], cell_ids?: string[]}>: chunk and cell references for grounding
.metadata          → Metadata: {credit_usage, duration_ms, filename, job_id, org_id, version, schema_violation_error, fallback_model_version}
```

### Using Zod for Schema Validation

```typescript
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";  // separate npm package

const InvoiceSchema = z.object({
  invoice_number: z.string().describe("Invoice number or ID"),
  total_amount: z.number().positive().describe("Total amount"),
  vendor_name: z.string().describe("Vendor name"),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    total: z.number().positive()
  })).optional()
});

// Parse once, extract many
const parsed = await client.parse({ document: fs.createReadStream("./invoice.pdf") });

const response = await client.extract({
  markdown: parsed.markdown,
  schema: JSON.stringify(zodToJsonSchema(InvoiceSchema)),
});

// Validate extracted data against Zod schema
const validated = InvoiceSchema.parse(response.extraction);
console.log(`Invoice ${validated.invoice_number}: $${validated.total_amount}`);
```

### Grounding References (Tracing Back to Source)

```typescript
const chunkMap = new Map(parsed.chunks.map(c => [c.id, c]));

Object.entries(response.extraction).forEach(([field, value]) => {
  const chunkIds = response.extraction_metadata[field]?.chunk_ids;
  if (chunkIds?.length) {
    const chunk = chunkMap.get(chunkIds[0]);
    if (chunk) {
      console.log(`${field}=${value} → page ${chunk.grounding.page}`);
    }
  }
});
```

---

## 3. Split

Classifies and splits mixed documents by type.

### Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `split_class` | `Array<{name: string, description?: string, identifier?: string}>` | Yes | Classification configuration |
| `markdown` | `Uploadable \| string \| null` | One required | Markdown content or file |
| `markdown_url` | `string \| null` | One required | URL to markdown |
| `model` | `string \| null` | No | Model version (default: `split-latest`) |
| `saveTo` | `string` | No | Directory to save `{filename}_split_output.json` |

### Returns `SplitResponse`

```
.splits[]          → Split: {classification, identifier, markdowns[], pages[]}
.metadata          → SplitMetadata: {filename, page_count, duration_ms, credit_usage, org_id, job_id, version}
```

### Split → Extract Pipeline

```typescript
const parsed = await client.parse({ document: fs.createReadStream("./mixed_invoices.pdf") });

const splitResponse = await client.split({
  markdown: parsed.markdown,
  split_class: [
    { name: "Invoice", description: "Sales invoice", identifier: "Invoice Number" },
    { name: "Receipt", description: "Payment receipt", identifier: "Receipt Number" },
  ],
});

for (const split of splitResponse.splits) {
  console.log(`${split.classification}: ${split.identifier} (pages ${split.pages})`);
}

// Extract from each split
const schema = JSON.stringify(zodToJsonSchema(InvoiceSchema));
const results = [];
for (const split of splitResponse.splits) {
  const extracted = await client.extract({ markdown: split.markdowns[0], schema });
  results.push({ type: split.classification, id: split.identifier, data: extracted.extraction });
}
```

---

## 4. Parse Jobs (Async, Large Files)

For files >50MB, use asynchronous processing.

### `parseJobs.create()` Arguments

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document` | `Uploadable \| null` | One required | Local file |
| `document_url` | `string \| null` | One required | Remote document URL |
| `model` | `string \| null` | No | Model version (default: `dpt-2-latest`) |
| `split` | `"page" \| null` | No | Split by pages |
| `output_save_url` | `string \| null` | If ZDR | URL for zero data retention output |

### Returns `ParseJobCreateResponse`

```
.job_id            → string: unique job identifier
```

### `parseJobs.get(jobId)` Returns `ParseJobGetResponse`

```
.job_id            → string
.status            → string: pending|processing|completed|failed|cancelled
.progress          → number: 0.0 to 1.0
.failure_reason    → string | undefined: error message if failed
.data              → ParseResponse | undefined: full result when completed
.output_url        → string | undefined: presigned URL if result >1MB (expires 1hr)
.received_at       → number: Unix timestamp
.org_id            → string
.version           → string
.metadata          → ParseMetadata | undefined
```

### `parseJobs.list()` Arguments & Returns

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `string` | No | Filter: `"pending" \| "processing" \| "completed" \| "failed" \| "cancelled"` |
| `page` | `number` | No | Page number (0-indexed) |
| `pageSize` | `number` | No | Items per page |

```
.jobs[]            → JobSummary: {job_id, status, progress, received_at, failure_reason}
.has_more          → boolean
```

### Example

```typescript
const job = await client.parseJobs.create({
  document: fs.createReadStream("./large.pdf"),
});
console.log(`Job ID: ${job.job_id}`);

while (true) {
  const status = await client.parseJobs.get(job.job_id);
  console.log(`${status.status}: ${(status.progress * 100).toFixed(0)}%`);

  if (status.status === "completed") {
    const result = status.data!;  // ParseResponse
    break;
  }
  if (status.status === "failed") {
    throw new Error(`Job failed: ${status.failure_reason}`);
  }

  await new Promise(r => setTimeout(r, 5000));
}
```

---

## Error Handling

### Error Classes

All errors inherit from `LandingAIADEError`. Import from `"landingai-ade"`:

| Exception | HTTP Status | Description |
|-----------|-------------|-------------|
| `BadRequestError` | 400 | Invalid request due to malformed input or unsupported version |
| `AuthenticationError` | 401 | Missing or invalid API key |
| `UnprocessableEntityError` | 422 | Input validation failed |
| `RateLimitError` | 429 | Rate limit exceeded |
| `InternalServerError` | 5xx | Server error during processing |
| `APIConnectionError` | — | Network failure |
| `APIConnectionTimeoutError` | — | Request timeout (extends `APIConnectionError`) |

Note: HTTP 206 (Partial Content) is returned as a successful response with `schema_violation_error` or `failed_pages` in metadata. HTTP 402 (Payment Required) indicates insufficient credits. HTTP 413 (Payload Too Large) means the file exceeds the sync parse limit — use Parse Jobs API.

### Retry with Fallback to Jobs

```typescript
import {
  RateLimitError,
  APIConnectionTimeoutError,
  AuthenticationError,
  APIConnectionError,
} from "landingai-ade";

async function robustParse(
  client: LandingAIADE, filePath: string, maxRetries = 3
): Promise<ParseResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.parse({ document: fs.createReadStream(filePath) });
    } catch (error) {
      if (error instanceof RateLimitError) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 10000));
      } else if (error instanceof APIConnectionTimeoutError) {
        console.log("Timeout — switching to parse jobs");
        return await parseLargeFile(client, filePath);
      } else if (error instanceof AuthenticationError) {
        throw error;  // Non-retryable
      } else if (error instanceof APIConnectionError) {
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed after retries");
}
```

---

## Type Definitions

```typescript
interface ParseResponse {
  markdown: string;
  chunks: Chunk[];
  grounding: Record<string, Grounding>;
  splits?: Split[];
  metadata: Metadata;
}

interface Chunk {
  id: string;
  type: "text" | "table" | "figure" | "marginalia" | "logo" | "card" | "attestation" | "scan_code";
  markdown: string;
  grounding: { page: number; box: BoundingBox };
}

interface BoundingBox {
  left: number; top: number; right: number; bottom: number;  // 0-1 normalized
}

interface Grounding {
  type: string;
  page: number;
  box: BoundingBox;
  confidence?: number;  // 0.0-1.0, not all types have this
  low_confidence_spans?: Array<{ confidence: number; text: string; span: number[] }>;
  position?: TablePosition;  // Only for tableCell type
}

interface TablePosition {
  row: number; col: number; rowspan: number; colspan: number; chunk_id: string;
}

interface ExtractResponse {
  extraction: Record<string, any>;
  extraction_metadata: Record<string, { chunk_ids?: string[]; cell_ids?: string[] }>;
  metadata: Metadata;
}

interface SplitResponse {
  splits: Split[];
  metadata: Metadata;
}

interface Split {
  classification: string;
  identifier: string | null;
  markdowns: string[];
  pages: number[];
}

interface Metadata {
  filename: string; org_id: string; page_count: number;
  duration_ms: number; credit_usage: number; version: string;
  job_id: string; failed_pages?: number[];
}
```

### Type Guards

```typescript
function isTableChunk(chunk: Chunk): boolean {
  return chunk.type === "table";
}

function isTableCell(
  grounding: Grounding
): grounding is Grounding & { position: TablePosition } {
  return grounding.type === "tableCell" && grounding.position !== undefined;
}

// Usage
Object.values(response.grounding).forEach(g => {
  if (isTableCell(g)) {
    console.log(`Cell at (${g.position.row}, ${g.position.col})`);
  }
});
```

---

## API Reference

The following sections provide the complete API context so this document is fully self-contained.

### Base Configuration

| Region | Base URL |
|--------|----------|
| US (default) | `https://api.va.landing.ai/v1/ade` |
| EU | `https://api.va.eu-west-1.landing.ai/v1/ade` |

**Authentication**: All requests require `Authorization: Bearer $VISION_AGENT_API_KEY`

### Quick Reference

| Endpoint | Method | Path | Model | Input |
|----------|--------|------|-------|-------|
| Parse | POST | `/v1/ade/parse` | `dpt-2-latest` | `document` (file) or `document_url` |
| Extract | POST | `/v1/ade/extract` | `extract-latest` | `markdown` (file/string) or `markdown_url` + `schema` |
| Split | POST | `/v1/ade/split` | `split-latest` | `markdown` (file/string) or `markdown_url` + `split_class` |
| Create Job | POST | `/v1/ade/parse/jobs` | `dpt-2-latest` | `document` or `document_url` |
| Get Job | GET | `/v1/ade/parse/jobs/{id}` | — | — |
| List Jobs | GET | `/v1/ade/parse/jobs` | — | `?status=&page=&pageSize=` |

### Data Types

#### Chunk Types
- `text` — Characters, paragraphs, headings, lists, form fields, checkboxes, code blocks
- `table` — Grid of rows and columns; includes spreadsheets and receipts
- `figure` — Visual/graphical non-text content — images, graphs, flowcharts, diagrams
- `marginalia` — Content in document margins — headers, footers, page numbers, handwritten notes
- `logo` — Logos (DPT-2 only)
- `card` — ID cards and driver's licenses (DPT-2 only)
- `attestation` — Signatures, stamps, and seals (DPT-2 only)
- `scan_code` — QR codes and barcodes (DPT-2 only)

#### Grounding Types
- Chunk grounding: `chunkText`, `chunkTable`, `chunkFigure`, `chunkMarginalia`, `chunkLogo`, `chunkCard`, `chunkAttestation`, `chunkScanCode`
- Structure: `table`, `tableCell` (with position data)

#### Bounding Box
All coordinates normalized 0–1: `{ left, top, right, bottom }`.

#### Confidence Scores
Top-level grounding entries may include `confidence` (float, 0.0–1.0) and `low_confidence_spans` (list of `{confidence, text, span}`). Not all entries have confidence (e.g., `table`/`tableCell` types may not).

#### Table Cell Position
`{ row, col, rowspan, colspan, chunk_id }` — zero-indexed.

#### Table Chunk Formats

**PDF/Image tables**: Element IDs use `{page}-{base62_seq}`. Grounding object has bounding boxes and `tableCell` entries.

**Spreadsheet tables (XLSX/CSV)**: Element IDs use `{tab_name}-{cell_ref}` (e.g., `Sheet 1-B2`). **Grounding is null** — positions are encoded in IDs.

### Error Codes

| Status | Name | Description | Solution |
|--------|------|-------------|----------|
| 200 | Success | Request completed successfully | Continue with normal operations |
| 206 | Partial Content | Parse: some pages failed (`metadata.failed_pages`). Extract: schema violation (`metadata.schema_violation_error`) | Review failed pages or schema violations; partial data returned, credits consumed |
| 400 | Bad Request | Invalid request due to malformed input or unsupported version | Review error message for specific issue |
| 401 | Unauthorized | Missing or invalid API key | Check VISION_AGENT_API_KEY |
| 402 | Payment Required | Account does not have enough credits | Verify correct API key; add credits |
| 413 | Payload Too Large | File exceeds sync parse limit | Use Parse Jobs API |
| 422 | Unprocessable Entity | Input validation failed | Review request parameters and schema JSON |
| 429 | Too Many Requests | Rate limit exceeded | Implement exponential backoff |
| 500 | Internal Server Error | Server error during processing | Retry with backoff |
| 504 | Gateway Timeout | Request exceeded timeout limit (475 seconds) | Reduce document size or use Parse Jobs API |

### Supported File Types

| Category | Formats | Notes |
|----------|---------|-------|
| **PDF** | PDF | Up to 100 pages in Playground (see rate limits for API); no password-protected files |
| **Images** | JPEG, JPG, PNG, APNG, BMP, DCX, DDS, DIB, GD, GIF, ICNS, JP2, PCX, PPM, PSD, TGA, TIF, TIFF, WEBP | |
| **Text Documents** | DOC, DOCX, ODT | Converted to PDF before parsing |
| **Presentations** | ODP, PPT, PPTX | Converted to PDF before parsing |
| **Spreadsheets** | CSV, XLSX | Up to 10 MB in Playground; no limit in API |

> **Note:** Word, PowerPoint, and OpenDocument files are converted to PDF server-side before parsing.

> **Spreadsheets** return a different response type (`SpreadsheetParseResponse`) — uses `sheet_count`/`total_rows`/`total_cells` instead of `page_count`, splits use `sheets` instead of `pages`, and top-level `grounding` is not present.

### Model Versions

| Model | Best For | Chunk Types |
|-------|----------|-------------|
| **`dpt-2-latest`** | Complex documents with logos, signatures, ID cards | text, table, figure, marginalia, logo, card, attestation, scan_code |
| **`dpt-2-mini`** | Simple, digitally-native documents (faster, cheaper) | text, table, figure, marginalia |
| **`dpt-1`** | ⚠️ **Deprecated March 31, 2026** — migrate to dpt-2 | text, table, figure, marginalia |

| Operation | Current Version | Description |
|-----------|----------------|-------------|
| Extract | `extract-latest` (currently `extract-20251024`) | Schema-based extraction |
| Split | `split-latest` | Document classification |

**Version Pinning:** For production, use dated versions (e.g., `dpt-2-20251103`) for reproducibility.

---

## External Links

- [TypeScript SDK Documentation](https://docs.landing.ai/ade/ade-typescript)
- [TypeScript SDK GitHub](https://github.com/landing-ai/ade-typescript)
