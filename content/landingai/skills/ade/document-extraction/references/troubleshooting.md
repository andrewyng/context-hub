---
name: Troubleshooting
description: Error codes, common issues, and fixes for the ADE v2 APIs (Parse, Extract, Parse Jobs, Extract Jobs) and v1 APIs (Parse, Extract, Split, Parse Jobs, Extract Jobs, Classify, Section)
type: reference
---

# Troubleshooting

## Table of Contents

- [Common Errors (All Endpoints)](#common-errors-all-endpoints)
- v2 APIs: [Parse](#parse-v2) | [Parse Jobs](#parse-jobs-v2) | [Extract](#extract-v2) | [Extract Jobs](#extract-jobs-v2)
- v1 APIs: [Parse](#parse-v1) | [Parse Jobs](#parse-jobs-v1) | [Extract](#extract-v1) | [Build Extract Schema](#build-extract-schema-v1) | [Extract Jobs](#extract-jobs-v1) | [Split](#split-v1) | [Classify](#classify-v1) | [Section](#section-v1)

## Common Errors (All Endpoints)

| Code | Issue | What to Do |
|------|-------|------------|
| **401** Unauthorized | Missing or invalid `VISION_AGENT_API_KEY` | Confirm the key is set in your environment or `.env` file. Get a key at [va.landing.ai/settings/api-key](https://va.landing.ai/settings/api-key). If you recently rotated your key, update all call sites. |
| **402** Payment Required | Not enough credits | Verify you are using the correct API key (credits are per-key). Add credits to your account. |
| **429** Too Many Requests | Rate limit exceeded | Wait before retrying. Implement exponential backoff for batch workloads. |

**v2 error format:** every v2 error body has a stable snake_case `code` you can branch on (`validation_error`, `unknown_model_version`, `invalid_url`, `invalid_api_key`, `rate_limit_exceeded`) and a human-readable `message` whose exact wording may change.

**v2 credits:** consumed only on 200 or 206 responses; error responses are free. Jobs consume credits only on `completed`.

---

## Parse (v2) {#parse-v2}

`POST /v2/parse` (`client.v2.parse()`)

### Partial results (206)

Some pages failed, the rest are returned. Check `metadata.failed_pages` (**1-indexed**) and each failed page node in `structure.children` (`status: "failed"` plus a `reason`, zero-length `range`). Credits are consumed. A 500 means every page failed; the body is still a full parse response with per-page reasons.

### 504 Gateway Timeout

The SDK raises `V2SyncTimeoutError`. Reduce document size or switch to Parse Jobs.

### Validation errors (422)

| Error message | Fix |
|-------|-----|
| `Unknown model version '{version}'. Available: {versions}.` | Use `dpt-3-pro-latest` or a listed snapshot; or omit `model`. v1 names like `dpt-2` are not valid here. |
| `One of `document` or `document_url` is required.` / `Provide exactly one of `document` or `document_url`, not both.` | Send exactly one input. |
| `document exceeds 50 MiB cap` / `document_url body exceeds 50 MiB cap` | Sync limit is 50 MiB. Use Parse Jobs (1 GiB PDFs). |
| `document has {N} pages; the per-request limit is 100` | Sync limit is 100 pages per PDF. Use Parse Jobs (6,000 pages). |
| `Unsupported format: {format} ({filename}).` / `Unrecognised file format ({filename}).` | v2 accepts PDFs and images only (detected from content, not extension). Other formats: use v1 Parse. |
| `Empty file ({filename}).` | Upload a file with content. |
| `pages: page numbers are 1-indexed (must be >= 1), got: [0]` | `options.pages` is 1-indexed. Numbers beyond the page count are silently ignored. |
| `options: invalid JSON: {details}` / `options.dpi: Extra inputs are not permitted` | `options` must be valid JSON with only recognized keys. Retired legacy options: `dpi` (no replacement; coordinates are normalized), `grounding.parts` (use `atomic_grounding`), `blocks.<type>.caption` (use `blocks.<type>.markdown`). |
| Password-protected PDF rejected | v2 does not support encrypted files; providing `options.password` returns 422. Decrypt first or use v1 Parse with ZDR. |

### document_url errors (422)

| Error message | Fix |
|-------|-----|
| `document_url scheme must be http or https, got '{scheme}'` | Use http(s). |
| `document_url missing hostname` | Supply a complete URL. |
| `document_url hostname did not resolve: {hostname}` | Check spelling; host must be publicly reachable. |
| `document_url resolves to a non-public IP: {ip}` | Private/loopback addresses are rejected; host publicly or upload with `document`. |
| `document_url returned a redirect; supply the final URL directly.` | Redirects are not followed. |
| `Failed to fetch document_url: HTTP {status}` / `request timed out` / `connection failed` | Verify the URL serves the file directly; presigned URLs may have expired. |

---

## Parse Jobs (v2) {#parse-jobs-v2}

`POST /v2/parse/jobs`, `GET /v2/parse/jobs[/{job_id}]` (`client.v2.parse_jobs.*`)

**Create:** 202 with `job_id` on success. 422 for the same validation causes as sync Parse plus an invalid `service_tier` value, PDFs over 6,000 pages, or files over the size caps (1 GiB PDF, 50 MiB image). 429 on rate limit; 500 means the job could not be queued (retry).

**Poll:** 200 normally (check `status`); 206 when the job completed with some failed pages; 404 when no job with that `job_id` exists for your API key.

**Failed jobs:** the poll still returns 200; `status` is `failed` and `error` (`code`, `message`) describes the cause. Resubmit to retry. `wait(..., raise_on_failure=True)` raises `JobFailedError` instead; `JobWaitTimeoutError` means the job is still running.

**Statuses:** `pending`, `processing`, `completed`, `failed` (v2 jobs have no `cancelled`).

---

## Extract (v2) {#extract-v2}

`POST /v2/extract` (`client.v2.extract()`)

### Partial success (206)

The response has the normal shape plus `schema_violation_error` (fields the model could not extract were skipped; set when `strict` is false) and/or a non-empty `warnings` array. Credits are consumed. Fix by refining field `description` and `x-alternativeNames`, or set `strict=True` to get a hard 422 instead.

**Field returned as null:** the model could not find it. If the field is genuinely absent, null is correct; otherwise refine the description or add `x-alternativeNames` matching the document's labels. Synthesized values (not copied from one location) legitimately have `ranges: null` in `extraction_metadata`.

### Other status codes

| Code | Meaning | Fix |
|------|---------|-----|
| 413 | Payload too large | Reduce the Markdown size or use Extract Jobs. |
| 500 | Server error | Retry; contact support@landing.ai if persistent. |
| 504 | Timeout (SDK raises `V2SyncTimeoutError`) | Reduce Markdown size, simplify the schema, or use Extract Jobs. |

### Validation errors (422)

| Error message | Fix |
|-------|-----|
| `Unknown extract version '{version}'. Valid versions: {versions} (or extract-latest).` | Use `extract-latest` or a listed snapshot. Note: this is the v2 model namespace, separate from v1. |
| `The provided string is not valid JSON, let alone a schema.` | Fix JSON syntax in the schema. |
| `Field extraction validation error: The provided schema must have "type": "object" for the root.` | Root must declare `"type": "object"`. |
| `Field extraction validation error: The provided JSON must parse to an object at the root.` | The schema root must be `{...}`, not an array or scalar. |
| `Field extraction validation error: The provided JSON object was not a valid JSON schema. Error: {details}` | Every `type` must be a JSON Schema type (`string`, `number`, `integer`, `boolean`, `object`, `array`, `null`); custom types like `"money"` fail. |
| `Field extraction validation error: The provided schema contains recursive local $ref cycles, which are not supported.` | Remove circular `$ref` references. |
| `The following schema fields were not supported: {keywords}` | Strict mode only. Remove the keywords or set `strict=False` to have them ignored. |
| `provide exactly one of markdown or markdown_url` / `Cannot provide both 'markdown' and 'markdown_url'. Please provide only one.` | Exactly one Markdown source per request. The SDK raises a `ValueError` client-side for this. |
| `No markdown file or URL provided.` | The parameter value is empty or blank. |
| `Invalid URL format: {url}` / `Failed to fetch markdown_url: ...` | Fix or refresh the URL; redirects are rejected. |
| `Multiple markdown files detected (X).` | One Markdown file per request. |
| `Unsupported format: {mime_type} ({filename}). Supported formats: MD` | Extract accepts Markdown only. Parse PDFs/images first. |
| `Field extraction invalid: {error_details}` | Review the details; validate the schema against the schema guidelines. |
| Fields the model cannot extract (strict mode) | With `strict=True`, unextractable fields are a 422 instead of a 206. Confirm the data exists; refine descriptions; or use `strict=False`. |

---

## Extract Jobs (v2) {#extract-jobs-v2}

`POST /v2/extract/jobs`, `GET /v2/extract/jobs[/{job_id}]` (`client.v2.extract_jobs.*`)

**Create:** 202 with `job_id`. 409 Conflict (a job with the same identifier exists: retry). 422 for the same validation causes as sync Extract. 429/500 as usual. Submissions are paced internally; creating a job normally never rate-limits.

**Poll:** always 200 (never 206). Partial-extraction signals (`schema_violation_error`, `warnings`) appear inside `result`. 404 when the `job_id` does not exist for your API key.

**Failed jobs:** `status: "failed"` with `error` (`code`, `message`). Credits are consumed only on `completed`.

---

## Parse (v1) {#parse-v1}

`POST /v1/ade/parse` (`client.parse()`)

### Partial results (206)

Some pages failed; check `metadata.failed_pages` (**zero-indexed** in v1). Credits are consumed for successful pages.

### Common errors

| Code | Error | Fix |
|------|-------|-----|
| 400 | `Failed to download document from URL` | Verify the URL is publicly accessible and points to a supported file type. |
| 400 | `Unsupported model: {version}` | Use a supported v1 model version (`dpt-2-latest` or a snapshot). Omit `model` for the latest. |
| 422 | `Unsupported format: {mime_type}` | See [File Formats](file-formats.md). |
| 422 | `PDF must not exceed {limit} pages` | Use v1 Parse Jobs for large documents. |
| 422 | `Document is password-protected. Please provide the password parameter.` | Add `password="..."`. Requires ZDR. |
| 422 | `Password-protected documents are not currently supported for your account.` | ZDR is not enabled. Remove password protection before uploading. |
| 422 | `Failed to decrypt document. The password is incorrect or the file is corrupted.` | Check the password; verify the file opens correctly. |
| 422 | `custom_prompts['figure'] must be 512 characters or fewer.` | Shorten the prompt. |
| 422 | `custom_prompts is not supported for the '{model}' model.` | `custom_prompts` requires DPT-2. |
| 500 | `Failed to process the document` | Retry. If the issue persists, contact support@landing.ai. |
| 504 | `Request timed out after {seconds} seconds` | Reduce document size or use Parse Jobs. |

---

## Parse Jobs (v1) {#parse-jobs-v1}

`client.parse_jobs.*`

| Status | Description |
|--------|-------------|
| `pending` / `processing` | Queued / running |
| `completed` | Results in `data` (under 1 MB) or `output_url` (over 1 MB; URL expires in 1 hour) |
| `failed` | Check `failure_reason` |
| `cancelled` | Cancelled |

- **404 Not Found (Get job)**: the job ID belongs to a different API key, or the ID is incorrect.
- **ZDR accounts**: use `document_url` (not file upload) and provide `output_save_url` when creating jobs.
- **Partial results (206)**: check `metadata.failed_pages` as with sync Parse.

---

## Extract (v1) {#extract-v1}

`POST /v1/ade/extract` (`client.extract()`)

### Partial results (206)

Check `metadata.schema_violation_error`. For `extract-20260314` and later, `metadata.warnings` contains structured objects with `code` and `msg`:

| Warning Code | Meaning |
|---|---|
| `nonconformant_schema` | Schema issues affected extraction |
| `nonconformant_output` | Output does not fully conform to schema (also populates `schema_violation_error`) |

**Field returned as null:** check whether the field appears in the document; refine `description`; add `x-alternativeNames`. To allow null: `"type": ["string", "null"]` or `"nullable": true`.

Credits are consumed even for 206 responses.

### Low extraction accuracy

- Add `description` fields with format hints ("as YYYY-MM-DD", "in USD").
- Use `x-alternativeNames` if field labels vary across document types.
- Use specific field names (`invoice_total_usd` rather than `total`).
- Match schema field order to how data appears in the document.

### Common schema errors (422)

| Error | Fix |
|-------|-----|
| `The provided schema must have "type": "object" for the root.` | Wrap all fields in a top-level object. |
| `The provided JSON object was not a valid JSON schema.` | Validate JSON structure; check for syntax errors. |
| `The provided schema contains recursive local $ref cycles` | Remove circular references. |
| `The following schema fields were not supported: {keywords}` | Remove unsupported keywords, or use `strict=false` to skip them. |

---

## Build Extract Schema (v1) {#build-extract-schema-v1}

At least one of `markdowns`, `markdown_urls`, or `prompt` is required. If you pass an existing `schema` to refine, it must be valid JSON. Other errors (URL accessibility, model version) follow the same patterns as v1 Extract.

---

## Extract Jobs (v1) {#extract-jobs-v1}

REST only (`/v1/ade/extract/jobs`); no SDK method. The create endpoint returns errors in an `error` field; Get and List use a `message` field. Credits are consumed only when a job reaches `completed` (including 206 completions).

### Create (`POST /v1/ade/extract/jobs`)

| Code | Meaning | What to Do |
|------|---------|------------|
| 202 | Accepted | Read `job_id` and poll the Get endpoint. |
| 400 | Bad request | Invalid JSON schema, unreachable `markdown_url`, or a ZDR config error (below). |
| 422 | Validation failed | Missing Markdown input or unsupported format; same messages as v1 sync Extract. |

ZDR-specific 400 errors:

| Error message | Fix |
|---------------|-----|
| `output_save_url must be present if zeroDataRetention is enabled` | Add `output_save_url`. |
| `Only markdown_url is accepted if zeroDataRetention is enabled` | Pass Markdown via `markdown_url`, not a file upload. |

### Get (`GET /v1/ade/extract/jobs/{job_id}`)

- **200 `status: completed`**: results in `data` (inline) or `output_url` (result over 1 MB or `output_save_url` set; `data` null, URL expires 1 hour after the GET).
- **200 `status: failed`**: read `failure_reason`; background errors including timeouts surface here. For timeouts, reduce Markdown size or simplify the schema.
- **206**: completed but nonconformant; check `schema_violation_error` and `warnings` in the extraction metadata.
- **404 `Job {job_id} not found`**: wrong ID or different API key.

### List (`GET /v1/ade/extract/jobs`)

- **422**: invalid query parameters; check `page`, `pageSize`, `status`.

---

## Split (v1) {#split-v1}

- **Max 19 split classes** per request.
- **Pass Markdown from v1 Parse**: Split expects v1 Parse Markdown; raw text or v2 Markdown produces poor results.
- **Improve accuracy**: write detailed `description` values for each split class.
- **`identifier`**: use only when a document contains multiple instances of the same class that need separation.
- **500 errors**: retry; verify split class fields are properly formatted.

---

## Classify (v1) {#classify-v1}

- **`class_` attribute**: access the assigned class as `result.class_` (trailing underscore) because `class` is a Python reserved word.
- **Unknown pages**: `class_` is `"unknown"`; check `suggested_class` and refine the class list or descriptions.
- **Spreadsheets not supported**: CSV and XLSX are not accepted. Other Parse-supported formats work, up to 200 MB.
- **Improve accuracy**: add `description` to each class when the name alone is ambiguous.

---

## Section (v1) {#section-v1}

- **Must use v1 Parse output**: Section requires Markdown with `<a id="..."></a>` anchors, which only v1 Parse emits. Plain Markdown or v2 Parse Markdown returns a 422. Run v1 Parse first and pass `parse_response.markdown` directly.
- **Only accepts Markdown**: convert documents via v1 Parse before calling Section.
- **No `save_to` parameter**: save the response manually if needed.
- **TOC language**: the table of contents is always returned in English.
