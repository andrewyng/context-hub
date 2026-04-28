---
name: Troubleshooting
description: Error codes, common issues, and fixes for ADE Parse, Extract, Split, Parse Jobs, Classify, and Section
type: reference
---

# Troubleshooting

## Common Errors (All Endpoints)

| Code | Issue | What to Do |
|------|-------|------------|
| **401** Unauthorized | Missing or invalid `VISION_AGENT_API_KEY` | Confirm the key is set in your environment or `.env` file. Get a key at [va.landing.ai/settings/api-key](https://va.landing.ai/settings/api-key). If you recently rotated your key, update all call sites. |
| **402** Payment Required | Not enough credits | Verify you are using the correct API key (credits are per-key). Add credits to your account. |
| **429** Too Many Requests | Rate limit exceeded | Wait before retrying. Implement exponential backoff for batch workloads. |

---

## Parse

### Partial results (206)

Some pages failed; successful pages are still returned. Check `metadata.failed_pages` (zero-indexed):

```python
response = client.parse(document=Path("doc.pdf"), model="dpt-2-latest")
if response.metadata.failed_pages:
    print(f"Failed pages: {response.metadata.failed_pages}")
```

Credits are consumed for pages that processed successfully.

### Common errors

| Code | Error | Fix |
|------|-------|-----|
| 400 | `Failed to download document from URL` | Verify the URL is publicly accessible and points to a supported file type. |
| 400 | `Unsupported model: {version}` | Use a supported model version. Omit `model` to use the latest. |
| 422 | `Unsupported format: {mime_type}` | See [File Formats](file-formats.md). |
| 422 | `PDF must not exceed {limit} pages` | Use Parse Jobs for large documents. |
| 422 | `Document is password-protected. Please provide the password parameter.` | Add `password="..."` to your request. Requires ZDR. See [Parse Password-Protected Files](https://docs.landing.ai/ade/ade-parse-password). |
| 422 | `Password-protected documents are not currently supported for your account.` | ZDR is not enabled. Remove password protection before uploading. |
| 422 | `Failed to decrypt document. The password is incorrect or the file is corrupted.` | Check the password; verify the file opens correctly. |
| 422 | `custom_prompts['figure'] must be 512 characters or fewer.` | Shorten the prompt to 512 characters. |
| 422 | `custom_prompts is not supported for the '{model}' model.` | `custom_prompts` requires DPT-2. |
| 500 | `Failed to process the document` | Retry. If the issue persists, contact support@landing.ai. |
| 504 | `Request timed out after {seconds} seconds` | Reduce document size or use Parse Jobs. |

---

## Parse Jobs

### Job status values

| Status | Description |
|--------|-------------|
| `pending` | Queued, waiting to process |
| `processing` | Currently processing |
| `completed` | Done. Results are in `data` (under 1 MB) or `output_url` (over 1 MB; URL expires in 1 hour) |
| `failed` | Check `failure_reason` |
| `cancelled` | Cancelled |

### Common issues

- **404 Not Found (Get job)**: The job ID belongs to a different API key, or the ID is incorrect.
- **ZDR accounts**: Use `document_url` (not file upload) and provide `output_save_url` when creating jobs.
- **Partial results (206)**: Some pages failed. Check `metadata.failed_pages` same as sync Parse.

---

## Extract

### Partial results (206)

Extracted data does not fully conform to the schema. Check `metadata.schema_violation_error`:

```python
response = client.extract(schema=schema, markdown=Path("parsed.md"))
if response.metadata.schema_violation_error:
    print(f"Schema violation: {response.metadata.schema_violation_error}")
```

For `extract-20260314` and later, `metadata.warnings` contains structured objects with `code` and `msg`:

| Warning Code | Meaning |
|---|---|
| `nonconformant_schema` | Schema issues affected extraction |
| `nonconformant_output` | Output does not fully conform to schema (also populates `schema_violation_error`) |

**Field returned as null:** The API could not find the field in the document.

- Check whether the field actually appears in the document. If it does not, the null result is correct.
- If the field is present but not found: add or refine `description` to be more specific; add `x-alternativeNames` entries that match how the field label appears in the document.
- To allow null in the schema: `"type": ["string", "null"]` or set `"nullable": true`.

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
| `The provided schema contains recursive local $ref cycles` | Remove circular references; ADE does not support them. |
| `The following schema fields were not supported: {keywords}` | Remove unsupported keywords, or use `strict=false` to allow the API to skip them. |

---

## Build Extract Schema

At least one of `markdowns`, `markdown_urls`, or `prompt` is required. If you pass an existing `schema` to refine, it must be valid JSON. All other errors (URL accessibility, model version) follow the same patterns as Extract.

---

## Split

### Common issues

- **Max 19 split classes**: Reduce the number of classes to 19 or fewer.
- **Pass Markdown from Parse**: Split expects the structured Markdown that Parse produces. Raw text or other formats produce poor results.
- **Improve accuracy**: Write detailed `description` values for each split class.
- **`identifier` field**: Use `identifier` only when a document contains multiple instances of the same class that need to be separated.
- **500 errors**: Retry. Verify that split class `name`, `description`, and `identifier` fields are properly formatted. Contact support@landing.ai if the issue persists.

---

## Classify (Preview)

### Common issues

- **`class_` attribute**: Access the assigned class as `result.class_` (trailing underscore) because `class` is a Python reserved word.
- **Unknown pages**: When a page cannot be confidently classified, `class_` is `"unknown"`. Check `suggested_class` to see the nearest match and refine your class list or descriptions.
- **Spreadsheets not supported**: CSV and XLSX files are not accepted by Classify. All other Parse-supported formats are supported, up to 200 MB.
- **Improve accuracy**: Add `description` to each class when the class name alone may be ambiguous.

---

## Section (Preview)

### Common issues

- **Must use Parse output**: Section requires Markdown from Parse with `<a id="..."></a>` reference anchors. Passing plain Markdown or manually formatted content returns a 422 error. Run Parse first, then pass `parse_response.markdown` directly to Section.
- **Only accepts Markdown files**: Section does not accept PDF, DOCX, or other document formats. Convert to Markdown via Parse before calling Section.
- **No `save_to` parameter**: Section does not support `save_to`. Save the response manually if needed.
- **TOC language**: The table of contents is always returned in English, regardless of the source document language.