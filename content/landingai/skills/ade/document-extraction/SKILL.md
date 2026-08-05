---
name: document-extraction
description: "Parses documents into structured Markdown, extracts fields with JSON schemas, classifies pages, and splits mixed document batches using LandingAI's Agentic Document Extraction (ADE) REST APIs, with official Python and TypeScript libraries. Builds document pipelines: batch and async processing for large files, classify-then-extract routing, RAG chunking and embeddings, multi-page table stitching, bounding box visualization, cropping, and word-level highlighting. Use when processing PDFs, images, scans, invoices, forms, or bank statements, when migrating between ADE API versions, or when the user mentions ADE, parsing, extraction, classification, document splitting, table of contents generation, grounding, bounding boxes, blocks, chunks, or ranges."
---

# Document Extraction (ADE)

## Overview

LandingAI's Agentic Document Extraction (ADE) is a document processing service that parses, extracts, and classifies documents without templates or training. The REST APIs are the primary interface. Official libraries wrap them for Python (`landingai-ade` on PyPI) and TypeScript (`landingai-ade` on npm).

ADE has two API generations. The **v2 APIs** (powered by DPT-3) are the current generation for parsing and extraction. Several capabilities exist only as **v1 APIs** and remain fully supported.

| API | Version | Endpoint | Guide |
|-----|---------|----------|-------|
| Parse | v2 | `POST https://api.ade.landing.ai/v2/parse` | https://docs.landing.ai/dpt3/parse |
| Parse Jobs | v2 | `POST/GET https://api.ade.landing.ai/v2/parse/jobs` | https://docs.landing.ai/dpt3/parse-async |
| Extract | v2 | `POST https://api.ade.landing.ai/v2/extract` | https://docs.landing.ai/dpt3/extract |
| Extract Jobs | v2 | `POST/GET https://api.ade.landing.ai/v2/extract/jobs` | https://docs.landing.ai/dpt3/extract-async |
| Classify | v1 | `POST https://api.va.landing.ai/v1/ade/classify` | https://docs.landing.ai/ade/ade-classify |
| Section | v1 | `POST https://api.va.landing.ai/v1/ade/section` | https://docs.landing.ai/ade/ade-section |
| Build Extract Schema | v1 | `POST https://api.va.landing.ai/v1/ade/extract/build-schema` | https://docs.landing.ai/ade/ade-extract-schema-api |
| Split | v1 | `POST https://api.va.landing.ai/v1/ade/split` | https://docs.landing.ai/ade/ade-split |
| Parse (superseded) | v1 | `POST https://api.va.landing.ai/v1/ade/parse` | https://docs.landing.ai/ade/parse |
| Extract (superseded) | v1 | `POST https://api.va.landing.ai/v1/ade/extract` | https://docs.landing.ai/ade/ade-extract |

Every linked docs page can be fetched as raw Markdown by appending `.md` to its URL (for example, `https://docs.landing.ai/dpt3/parse.md`). A page index lives at https://docs.landing.ai/llms.txt. Full request and response contracts are in the API reference (linked per endpoint below).

## Which API Version? {#which-api-version}

**Use the v2 APIs by default.** Route to v1 only when one of these applies:

- The user has existing code calling the `/v1/ade/*` endpoints (or v1 library methods `client.parse()` / `client.extract()`) and has not asked to migrate.
- The document is not a PDF or an image (Word, PowerPoint, spreadsheets, and other formats need v1 Parse).
- The file is password-protected (v2 rejects it with HTTP 422; v1 accepts a `password` parameter).
- The pipeline needs confidence scores, custom figure prompts, or v1-style page splits (`split=page`).
- The pipeline feeds Parse output into the v1 Section or v1 Split APIs, which require the v1 Parse response shape.

To move an existing v1 pipeline to v2, follow https://docs.landing.ai/dpt3/migration-guide.

**Do not mix versions within one pipeline**, except as this matrix allows:

| Markdown produced by | v2 Extract | v1 Extract | v1 Section | v1 Split |
|---|---|---|---|---|
| Parse v2 | Yes (preferred; reads the embedded `doc_id`) | **No** | **No** | No (use v1 Parse for Split pipelines) |
| Parse v1 | Yes (works, but no `doc_id` link) | Yes | Yes | Yes |

The v1 Classify API takes the raw document, not Parse output, so it composes with either version.

## API Drift: Your Prior Knowledge May Be Stale

If you have seen ADE code before, it was probably v1. These v1 idioms cause silent wrong-output bugs in v2 code:

| Stale (v1) pattern | Current (v2) |
|---|---|
| `chunks` list in the response | `structure` tree of pages and blocks; slice `markdown` with each block's `grounding.range` |
| 0-indexed page numbers | Pages are **1-indexed** in v2: `grounding.page`, `metadata.failed_pages`, `options.pages` |
| Box keys `left/top/right/bottom` | Renamed `xmin/ymin/xmax/ymax` (still normalized 0 to 1) |
| `model=dpt-2-latest` | `model=dpt-3-pro-latest` (pin a dated snapshot such as `dpt-3-pro-20260710` in production) |
| `confidence`, `low_confidence_spans` | Removed in v2 |

For the full v1-to-v2 request and response mapping, see https://docs.landing.ai/dpt3/migration-guide.

## Setup

### API Key

All endpoints authenticate with the same header: `Authorization: Bearer YOUR_API_KEY`. Get a key at https://va.landing.ai/settings/api-key and set it as the `VISION_AGENT_API_KEY` environment variable (both libraries read it automatically). Before asking the user for a key, check for an existing `.env` file in the working directory and in this skill's own directory (`skills/document-extraction/.env`); a `.env-sample` template sits next to this file. Keys are region-specific; for EU endpoints and data residency see https://docs.landing.ai/dpt3/eu.

### Libraries (optional)

- **Python:** `pip install landingai-ade` (v1.13.0 or later for `client.v2`). Guide: https://docs.landing.ai/dpt3/ade-python
- **TypeScript:** `npm install landingai-ade` (v2.8.0 or later for `client.v2`). Guide: https://docs.landing.ai/dpt3/ade-typescript

When writing scripts, use the user's language and environment. Never install packages globally; use the project's virtualenv or package.json.

## Core Flow: Parse, Then Extract (v2)

Parse converts a PDF or image into Markdown plus structure. Extract pulls schema-defined fields from that Markdown. Keep the trailing `<!-- doc_id=... -->` comment when saving Markdown; v2 Extract reads it to link the extraction back to its parse job.

**Step 1: Parse.** Sync parse accepts PDFs and images only, up to 50 MiB; for the current page limits, see https://docs.landing.ai/dpt3/rate-limits. Models: `dpt-3-pro-latest` or a dated snapshot.

```bash
mkdir -p output
curl -X POST 'https://api.ade.landing.ai/v2/parse' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'document=@document.pdf' \
  -F 'model=dpt-3-pro-latest' \
  | tee output/parse-response.json | jq -r '.markdown' > output/parse-output.md
```

```python
from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()
Path("output").mkdir(exist_ok=True)

parse_response = client.v2.parse(
    document=Path("document.pdf"),
    model="dpt-3-pro-latest",
    save_to="output/",
)
Path("output/parse-output.md").write_text(parse_response.markdown, encoding="utf-8")
```

```typescript
import fs from "fs";
import LandingAIADE from "landingai-ade";

const client = new LandingAIADE();
fs.mkdirSync("output", { recursive: true });

const parseResponse = await client.v2.parse({
  document: fs.createReadStream("document.pdf"),
  model: "dpt-3-pro-latest",
  saveTo: "output/",
});
fs.writeFileSync("output/parse-output.md", parseResponse.markdown);
```

Useful `options` (multipart field with a JSON value): `{"pages": [1, 3]}` (1-indexed page selection), `{"blocks": {"table": {"format": "markdown"}}}` (pipe-syntax tables instead of HTML). Full contract: [Parse API reference](https://docs.landing.ai/api-reference/parse/ade-parse), https://docs.landing.ai/dpt3/parse-input.

**Step 2: Extract.** The schema is a JSON Schema object; descriptions guide the extraction, so treat them as prompts.

```bash
curl -X POST 'https://api.ade.landing.ai/v2/extract' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'markdown=@output/parse-output.md' \
  -F 'schema={"type":"object","properties":{"invoice_number":{"type":"string","description":"Invoice number"},"total_amount":{"type":"number","description":"Total amount in USD"}}}'
```

```python
from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

extract_response = client.v2.extract(
    markdown=Path("output/parse-output.md").read_text(encoding="utf-8"),
    schema={
        "type": "object",
        "properties": {
            "invoice_number": {"type": "string", "description": "Invoice number"},
            "total_amount": {"type": "number", "description": "Total amount in USD"},
        },
    },
)
print(extract_response.extraction)
```

```typescript
import fs from "fs";
import LandingAIADE from "landingai-ade";

const client = new LandingAIADE();

const extractResponse = await client.v2.extract({
  markdown: fs.readFileSync("output/parse-output.md", "utf8"),
  schema: {
    type: "object",
    properties: {
      invoice_number: { type: "string", description: "Invoice number" },
      total_amount: { type: "number", description: "Total amount in USD" },
    },
  },
});
console.log(extractResponse.extraction);
```

The libraries also accept a Pydantic class (Python) or Zod schema (TypeScript) directly on `schema`. Full contract: [Extract API reference](https://docs.landing.ai/api-reference/extract/ade-extract), https://docs.landing.ai/dpt3/extract-input.

## Reading v2 Responses

**Parse** returns three top-level fields (https://docs.landing.ai/dpt3/parse-response):

- `markdown`: the whole document in reading order. Every `range` in the response indexes into this string using Unicode code point offsets.
- `structure`: a `document` node whose children are pages; each page's children are blocks (`text`, `table`, `table_cell`, `figure`, `marginalia`, `attestation`, `logo`, `card`, `scan_code`). Tables nest their cells. Block ids (`text-0`, `table_cell-3`) are unique per response but not stable across re-parses.
- `metadata`: `job_id`, `model_version`, `page_count`, `failed_pages` (1-indexed), `duration_ms`, `billing`.

Every node carries an inline `grounding` object: `page` (1-indexed), `range` (`{start, end}`, end exclusive), and `box` (`xmin/ymin/xmax/ymax`, each normalized 0 to 1). To get a block's text, slice `markdown[range.start:range.end]`. To get pixels, multiply box values by the rendered page dimensions. Leaf text blocks also carry `atomic_grounding`, one entry per visual line, for line-level highlighting.

Markdown format details (page breaks, `<figure>` elements, attestation labels, the trailing `doc_id` comment): https://docs.landing.ai/dpt3/parse-response.

**Extract** returns (https://docs.landing.ai/dpt3/extract-response):

- `extraction`: values matching the schema. Fields the model cannot find come back as `null` (arrays as `[]`).
- `extraction_metadata`: mirrors `extraction` with each leaf replaced by `{"value": ..., "ranges": [...]}`. Each range indexes into the input Markdown; a synthesized value has `null` ranges. To get a field's bounding box, find the parse block whose `grounding.range` contains the field's range, then use that block's `grounding.box`.
- `metadata.doc_id`: the originating parse job, when the input Markdown carried the `doc_id` comment.

**Partial results (HTTP 206):** Parse sets `metadata.failed_pages` and per-page `status`; Extract sets `schema_violation_error` and `warnings`. Data is still returned and credits are consumed. **Errors:** every v2 error body has a stable snake_case `code` and a human-readable `message`; branch on `code`, never on message text. Credits are consumed only on 200/206; error responses are free, and async jobs bill only when they complete. Per-endpoint error tables: [parse-troubleshoot](https://docs.landing.ai/dpt3/parse-troubleshoot), [extract-troubleshoot](https://docs.landing.ai/dpt3/extract-troubleshoot).

## Async Jobs (v2)

Use the jobs APIs for large files (PDFs up to 1 GiB / 6,000 pages), long extractions, or cheaper batch processing. Create returns a `job_id`; poll GET until `status` is `completed` or `failed`.

Pick the processing mode and service tier by who is waiting (sync requests always run at `priority`):

| Mode | Best for | Result | Turnaround | Credits |
|------|----------|--------|-----------|---------|
| Sync | Interactive work: a person or agent is waiting on the result | Inline in the response | Seconds to minutes | Full rate |
| Jobs, `service_tier=priority` | Time-sensitive work sync can't handle: larger documents, or not holding a connection open | Poll, or `output_save_url` | Seconds to minutes | Full rate |
| Jobs, `service_tier=standard` (default) | Work with no one waiting: automated pipelines, background agent steps, scheduled ingestion | Poll, or `output_save_url` | Minutes to hours | Half the `priority` rate |

Turnaround times are estimates. Run large documents and batches at `standard`; rate limits depend on the pricing plan and differ by mode and tier, so check https://docs.landing.ai/dpt3/sync-async and https://docs.landing.ai/dpt3/rate-limits for current values rather than assuming them.

```bash
curl -X POST 'https://api.ade.landing.ai/v2/parse/jobs' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'document=@large-document.pdf' \
  -F 'model=dpt-3-pro-latest'

curl 'https://api.ade.landing.ai/v2/parse/jobs/JOB_ID' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

Both libraries wrap the polling with a `wait()` helper:

```python
from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()

job = client.v2.parse_jobs.create(
    document=Path("large-document.pdf"),
    model="dpt-3-pro-latest",
)
done = client.v2.parse_jobs.wait(job.job_id)
if done.status == "completed":
    print(done.result.markdown[:500])
```

```typescript
import fs from "fs";
import LandingAIADE, { type V2ParseResponse } from "landingai-ade";

const client = new LandingAIADE();

const job = await client.v2.parseJobs.create({
  document: fs.createReadStream("large-document.pdf"),
  model: "dpt-3-pro-latest",
});
const done = await client.v2.parseJobs.wait(job.job_id);
if (done.status === "completed") {
  console.log((done.result as V2ParseResponse).markdown.slice(0, 500));
}
```

Extract Jobs works the same way against `https://api.ade.landing.ai/v2/extract/jobs` with the sync Extract fields (`client.v2.extract_jobs` in Python, `client.v2.extractJobs` in TypeScript). Both create endpoints accept `output_save_url` (a presigned URL where the result is delivered instead of the poll response; recommended with zero data retention). The library's `save_to` / `saveTo` parameter is sync-only: the job `create` methods do not accept it, so save the fetched job result yourself or use `output_save_url`. Guides: [parse-async](https://docs.landing.ai/dpt3/parse-async), [extract-async](https://docs.landing.ai/dpt3/extract-async). API reference: [parse jobs](https://docs.landing.ai/api-reference/parse/ade-parse-jobs), [extract jobs](https://docs.landing.ai/api-reference/extract/ade-extract-jobs).

## v1 APIs Without a v2 Equivalent

### Classify: Page-Level Classification

Assigns a class to each page of a raw document (not Parse output), so it composes with v2 pipelines: classify first, then route pages to parsing. Guide: https://docs.landing.ai/ade/ade-classify. API reference: [ade-classify](https://docs.landing.ai/api-reference/tools/ade-classify).

```bash
curl -X POST 'https://api.va.landing.ai/v1/ade/classify' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'document=@batch.pdf' \
  -F 'classes=[{"class":"invoice","description":"Commercial bill with line items and totals"},{"class":"bank_statement","description":"Monthly summary of account transactions"}]' \
  -F 'model=classify-latest'
```

The response lists one `class` per `page`. **Classify pages are 0-indexed (v1 convention); v2 Parse `options.pages` is 1-indexed, so add 1 when routing pages.** Unmatched pages come back as `unknown` with a `suggested_class`. Response fields: [ade-classify-response](https://docs.landing.ai/ade/ade-classify-response).

### Section: Table of Contents Generation

Generates a hierarchical table of contents. **Requires v1 Parse output** (it depends on the anchor tags only v1 Parse emits); do not feed it v2 Markdown. Guide: https://docs.landing.ai/ade/ade-section. API reference: [ade-section](https://docs.landing.ai/api-reference/tools/ade-section).

```bash
curl -X POST 'https://api.va.landing.ai/v1/ade/section' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'markdown=@v1-parse-output.md' \
  -F 'model=section-latest'
```

An optional `guidelines` field steers the hierarchy. Each entry has `title`, `level`, `section_number`, and `start_reference` (the v1 chunk id where the section begins). Response fields: [ade-section-response](https://docs.landing.ai/ade/ade-section-response).

### Build Extract Schema: Schema Generation

Generates or refines a JSON extraction schema from sample Markdown and/or a prompt; the returned schema string passes directly to either Extract API. Guide: https://docs.landing.ai/ade/ade-extract-schema-api. API reference: [ade-build-extract-schema](https://docs.landing.ai/api-reference/tools/ade-build-extract-schema).

```bash
curl -X POST 'https://api.va.landing.ai/v1/ade/extract/build-schema' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'markdowns=@sample.md' \
  -F 'model=extract-latest' \
  -F 'prompt=Extract the vendor name, invoice date, and total amount due'
```

### Split: Multi-Document Separation

Classifies and separates a file containing multiple documents (for example, a scanned packet of invoices and receipts). **Runs on v1 Parse output** (parse with `split=page` first). Guide: https://docs.landing.ai/ade/ade-split. API reference: [ade-split](https://docs.landing.ai/api-reference/tools/ade-split).

```bash
curl -X POST 'https://api.va.landing.ai/v1/ade/split' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'markdown=@v1-parse-output.md' \
  -F 'split_class=[{"name":"Bank Statement","description":"Summary of account activity over a period"},{"name":"Pay Stub","description":"Earnings and deductions for one pay period","identifier":"Pay Stub Date"}]' \
  -F 'model=split-latest'
```

A next-generation **Split v2 API is in Preview** (select partners; accepts Markdown from either Parse version): https://docs.landing.ai/splitv2/splitv2.

### v1 Parse and Extract (Superseded)

Still required for Office formats and spreadsheets, password-protected files, confidence scores, custom figure prompts, and Section/Split pipelines. Same auth; host `api.va.landing.ai`; parse model `dpt-2-latest`; v1 responses use a flat `chunks` list with 0-indexed pages and `left/top/right/bottom` boxes. Guides: [v1 Parse](https://docs.landing.ai/ade/parse), [v1 Extract](https://docs.landing.ai/ade/ade-extract), [v1 Parse Jobs](https://docs.landing.ai/ade/ade-parse-async), [v1 Extract Jobs](https://docs.landing.ai/ade/ade-extract-async), [password-protected files](https://docs.landing.ai/ade/ade-parse-password), [custom figure prompts](https://docs.landing.ai/ade/ade-parse-custom-prompts), [chunk types](https://docs.landing.ai/ade/ade-chunk-types), [v1 JSON response](https://docs.landing.ai/ade/ade-json-response). File format support per version: [v2 file types](https://docs.landing.ai/dpt3/file-types), [v1 file types](https://docs.landing.ai/ade/ade-file-types).

## Workflow Rules

These rules come from field experience building document pipelines. Follow them whenever you write pipeline code around ADE. Full working pipelines (batch processing, classify-then-extract, RAG ingestion with vector databases, database loading, visualization, Streamlit review UIs) live at https://github.com/landing-ai/ade-sample-projects; most samples still use the v1 APIs, so check which endpoints a sample calls before borrowing code.

### Pre-Flight: Inspect Before You Code (mandatory)

Before writing any section-detection, heading-matching, or text-search code:

1. **Render 1 or 2 pages as PNG and read them as images.** Check: handwriting or scan versus digital text, single versus two-column layout, running headers or watermarks, whether headings are styled text or plain bold.
2. **Run one diagnostic parse on one sample** and inspect the Markdown head plus a block inventory (type, page, box, first characters of each block). Heading format is document-specific and cannot be inferred from the task description: `Introduction` may appear as `1. Introduction` (plain text), `## Introduction`, or `INTRODUCTION` inside a larger text block. Getting this wrong causes a silent zero-match failure.
3. **Cache parse output** (save the response JSON) and reuse it while developing; re-parse only when the document set changes. Parse 1 to 3 samples during development, never the full corpus.

If heading formats vary across documents, match sections with an Extract call instead of regex.

### Bounding-Box Work: Verify Visually (mandatory)

For any crop, overlay, or highlight built from grounding boxes:

- v2 `grounding.page` is 1-indexed; page renderers (such as PyMuPDF) are 0-indexed, so the renderer index is `page - 1`. An off-by-one lands the crop on an adjacent page.
- Boxes are normalized; multiply by the rendered page's pixel dimensions, not the PDF point size.
- **After producing the first output image, read it back as an image and describe what you see.** Compare against the request (asked for a table, got a chart? wrong page?). Only proceed with the remaining crops after the first is verified. A brightness heuristic cannot catch wrong-page bugs; visual inspection can.

### Multi-Page Tables (Stitching)

ADE may emit a table that spans pages as separate table blocks per page, and **any page's rows may come back as plain text instead of a table block**, not just the last page. Three approaches, in order of robustness:

1. **Parse, then Extract with a row schema** (an array-of-objects field): the extract model reads the full Markdown, so it absorbs format inconsistencies. Two API calls; use this by default.
2. **Parse the HTML tables from the Markdown**: one call, but fragile; requires uniform row structure and breaks silently if you switch tables to pipe syntax.
3. **`pandas.read_html` on the Markdown**: quick prototyping only; misses rows that were emitted as plain text.

After stitching, validate with domain checks: column totals match a stated total, running balances reconcile, dates are chronological, row counts match a stated count. These catch merge errors that no parser will flag.

### Classify-Then-Extract (Mixed Document Batches)

- **Each file is one document of unknown type:** run a one-field Extract (an enum `type` field) on the parsed Markdown, then extract again with the type-specific schema.
- **One file contains several documents:** use the v1 Split pipeline (v1 Parse with `split=page`, then Split, then Extract per sub-document).
- **Route pages before parsing:** use Classify on the raw file, then parse only the relevant pages with v2 `options.pages` (remember the 0-indexed to 1-indexed conversion).

### RAG and Embedding Granularity

Choose the embedding unit to match retrieval needs; ADE blocks are the finest unit but not always the right one:

| Level | Unit | Best for |
|-------|------|----------|
| Block | One ADE block | Tables, figures, forms with independent fields |
| Page | All blocks on a page | Slide decks, page-oriented documents |
| Section | Consecutive blocks grouped by heading | Narrative documents where answers span paragraphs |
| Document | Full Markdown or a summary | Classification, routing, coarse search |

Embed `text`, `table`, and `card` blocks; exclude `marginalia` (running headers, footers, page numbers). Carry grounding metadata (source file, page, box coordinates) into the vector store as columns so every retrieval hit traces back to a document location.

### Schema Design

- Start small (a few fields), then grow. Use descriptive field names and put format hints in descriptions ("in USD", "as YYYY-MM-DD"); descriptions act as extraction prompts.
- Keep nesting to one level of objects; use an array of objects for line items and transactions.
- v2 Extract **silently removes** unsupported JSON Schema keywords (`allOf`, `oneOf`, `const`, `pattern`, `maximum`, and others) instead of erroring; v1 Extract errors on them. Setting `strict=true` on v2 turns the silent removal into an HTTP 422. All fields are treated as required and nullable regardless of `required`.
- Schema authoring reference: https://docs.landing.ai/dpt3/ade-extract-schema-json. Or generate a starting schema with the Build Extract Schema API above.

### Batch Processing and Scale

- Prefer the jobs APIs at the `standard` tier for batches: half the credits, no client-side rate pressure.
- For client-side parallelism over sync endpoints, keep concurrency modest (single digits) and retry 429/5xx with exponential backoff. Limits: https://docs.landing.ai/dpt3/rate-limits.
- A sync request that times out (HTTP 504) means the document is too large for sync; resubmit it to the jobs API rather than retrying.
- Save every parse response to disk as you go; a re-run should never re-parse documents that already succeeded.

## Links

**Guides:**
- v2 overview: https://docs.landing.ai/dpt3/overview
- v2 quickstart: https://docs.landing.ai/dpt3/quickstart
- Migration guide (v1 to v2): https://docs.landing.ai/dpt3/migration-guide
- Rate limits: https://docs.landing.ai/dpt3/rate-limits
- Credit consumption: https://docs.landing.ai/dpt3/credit-consumption

**API reference (full contracts, with cURL/Python/Node tabs):**
- Parse v2: https://docs.landing.ai/api-reference/parse/ade-parse
- Parse Jobs v2: https://docs.landing.ai/api-reference/parse/ade-parse-jobs
- Extract v2: https://docs.landing.ai/api-reference/extract/ade-extract
- Extract Jobs v2: https://docs.landing.ai/api-reference/extract/ade-extract-jobs
- Classify: https://docs.landing.ai/api-reference/tools/ade-classify
- Section: https://docs.landing.ai/api-reference/tools/ade-section
- Build Extract Schema: https://docs.landing.ai/api-reference/tools/ade-build-extract-schema
- Split: https://docs.landing.ai/api-reference/tools/ade-split
- Parse v1: https://docs.landing.ai/api-reference/tools/ade-parse
- Extract v1: https://docs.landing.ai/api-reference/tools/ade-extract

**Troubleshooting (per endpoint):**
- Parse v2: https://docs.landing.ai/dpt3/parse-troubleshoot
- Extract v2: https://docs.landing.ai/dpt3/extract-troubleshoot
- Classify: https://docs.landing.ai/ade/ade-classify-troubleshoot
- Section: https://docs.landing.ai/ade/ade-section-troubleshoot
- Split: https://docs.landing.ai/ade/ade-split-troubleshoot

**Libraries:**
- Python guide (v2): https://docs.landing.ai/dpt3/ade-python
- ade-python source: https://github.com/landing-ai/ade-python
- TypeScript guide (v2): https://docs.landing.ai/dpt3/ade-typescript
- ade-typescript source: https://github.com/landing-ai/ade-typescript