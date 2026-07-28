# Migration Guide: ADE v1 to v2

Read this only when moving an existing v1 pipeline to the v2 APIs. The v2 Parse API is a redesign, not a version bump: the request changes very little, but the response is a new shape, and there is no field-for-field mapping. Plan to rewrite the code that reads the parse response.

## Before You Migrate: Confirm Inputs

- **v2 Parse accepts PDFs and images only.** Pipelines that parse Word, PowerPoint, or spreadsheet files stay on v1 Parse.
- **v2 Parse does not support password-protected files** (providing a password returns HTTP 422). Decrypt first, or stay on v1.
- **v1 Section and v1 Split consume the v1 Parse shape.** A pipeline that chains Parse into Section stays on v1 end to end. For extraction chains, move both steps: v2 Parse feeds v2 Extract.
- **Confidence scores and custom figure prompts have no v2 equivalent.** Pipelines that depend on them stay on v1.

## Request Changes

| Aspect | v1 | v2 |
| --- | --- | --- |
| SDK call | `client.parse(...)` | `client.v2.parse(...)` |
| Endpoint | `POST /v1/ade/parse` | `POST /v2/parse` |
| Authentication | Bearer API key | Unchanged |
| File input | `document` or `document_url` | Unchanged |
| Model | `model="dpt-2-latest"` | `model="dpt-3-pro-latest"` (or a dated snapshot) |
| Page splitting | `split` parameter | Removed. Use `options={"pages": [...]}` to select pages (1-indexed). |
| Figure prompts | `custom_prompts` | Removed. |
| Password | `password` parameter (ZDR) | Not supported; returns HTTP 422. |
| Output customization | Not available | `options`: page selection, table format, block suppression, `atomic_grounding`, `inline_markdown`. |

For extraction:

| Aspect | v1 | v2 |
| --- | --- | --- |
| SDK call | `client.extract(...)` | `client.v2.extract(...)` |
| Schema argument | JSON string only (use `pydantic_to_json_schema()` / `json.dumps()`) | Pydantic class, dict, or JSON string directly |
| Markdown input | `markdown` (file or string) or `markdown_url` | `markdown` (string) or `markdown_url`; exactly one |
| Strict mode | `strict` parameter | `strict` parameter (sent as `options.strict`) |

## Response Changes (the Real Work)

### Chunks Become Blocks

v1 returns a flat `chunks` array where each chunk carries its own `markdown` and grounding. v2 returns a hierarchical `structure` tree: a `document` whose `children` are pages, each page's `children` are blocks, and tables nest `table_cell` children.

Block ids are semantic (`<type>-<index>`: `text-0`, `table_cell-3`) instead of UUIDs and `{page}-{base62}` table ids. Ids are stable within a response but not across re-parses.

```python
# v1: flat iteration
for chunk in response.chunks:
    print(chunk.type, chunk.markdown[:60])

# v2: walk the tree; text comes from slicing the top-level markdown
for page in response.structure.children:
    for block in page.children:
        r = block.grounding.range
        print(block.type, response.markdown[r.start:r.end][:60])
```

To avoid slicing, request `options={"inline_markdown": True}`; every node then carries its own `markdown` field.

### Grounding Moves Inline and Changes Values

There is no top-level grounding map in v2. Every node carries a self-contained `grounding` object with three fields, and the values changed:

- **Pages are 1-indexed** in v2 (`grounding.page`, `metadata.failed_pages`, `options.pages`). v1 used 0-indexed pages. Table `row`/`col` stay 0-indexed.
- **`range`** (`{start, end}`, Unicode code points, end exclusive) locates the block in the top-level `markdown`. v1 had no equivalent; chunks carried their own Markdown copy.
- **Box keys renamed**: still normalized 0 to 1 fractions of the page, but `left/top/right/bottom` become `xmin/ymin/xmax/ymax`.
- **`atomic_grounding`** is new: per-line `{page, range, box}` entries on leaf blocks, for line-level highlighting.
- **`confidence` and `low_confidence_spans` are removed.**

```python
# v1 box                                # v2 box
left = box.left * width                 left = box.xmin * width
top = box.top * height                  top = box.ymin * height
```

### Markdown Is Cleaner

- No `<a id='...'></a>` anchors; blocks link to the Markdown through ranges. Remove any anchor-stripping code.
- Visual blocks are structured: figures as `<figure type="CHART">...<description>...</description></figure>`, attestations as bracketed labels (`[STAMPED][SIGNED]`), scan codes as `[BARCODE]` plus the decoded value. The v1 `<::...::>` tags are gone.
- `<!-- PAGE BREAK -->` separates pages; the final line is `<!-- doc_id=<job_id> -->`, which v2 Extract reads to link extraction to parse.
- Tables are HTML by default; `options={"blocks": {"table": {"format": "markdown"}}}` gives pipe syntax.

### Removed v1 Fields with No v2 Equivalent

`chunks`, per-chunk `markdown` (use ranges or `inline_markdown`), `splits` and the `split` parameter, `custom_prompts`, top-level `password`, `confidence`, `low_confidence_spans`, the top-level `grounding` map, and embedded anchors.

### Extract Response Changes

| v1 | v2 |
| --- | --- |
| `extraction_metadata[field].chunk_ids` (chunk references) | `extraction_metadata[field]` is `{"value": ..., "ranges": [...]}`; each range is `{start, end}` into the input Markdown. `null` value and ranges when synthesized. |
| `metadata.schema_violation_error` | Top-level `schema_violation_error` (plus `warnings`); HTTP 206 semantics unchanged. |
| `metadata.fallback_model_version` | Removed. |
| No echo of input | `markdown` echoes the input; `metadata.doc_id` links to the parse job. |

### Jobs API Changes

| v1 | v2 |
| --- | --- |
| `client.parse_jobs.create/get/list`; manual polling loop | `client.v2.parse_jobs.create/get/list/wait`; `wait()` polls with backoff |
| Extract Jobs: REST only | `client.v2.extract_jobs.*` in the SDK |
| Statuses include `cancelled` | `pending`, `processing`, `completed`, `failed` |
| Result in `data` / `output_url` | Result in `result` / `output_url` (when `output_save_url` was set) |
| No service tiers | `service_tier="standard"` (default, half credits) or `"priority"` |
| ZDR requires `document_url` + `output_save_url` | Not required; ZDR applies automatically when enabled. Presigned URLs still recommended for strict control. |

## Migration Checklist

- Change calls to `client.v2.parse()` / `client.v2.extract()`; update `model` to `dpt-3-pro-latest` (or a dated snapshot).
- Remove `split`, `custom_prompts`, and `password` arguments; add `options` if you need page selection or output control.
- Stop reading `chunks`. Walk `structure.children` (pages) and their `children` (blocks), or flatten the tree into a map by block `id`.
- Read each block's location from its inline `grounding`: `page` (now 1-indexed), `range`, `box` (keys now `xmin/ymin/xmax/ymax`).
- Get a block's text by slicing the top-level `markdown` with its range, or set `options={"inline_markdown": True}`.
- Drop schema string conversion: pass Pydantic classes or dicts directly to `schema=`.
- Replace polling loops with `wait()`; handle `V2SyncTimeoutError`, `JobFailedError`, and `JobWaitTimeoutError` from `landingai_ade.lib.v2_errors`.
- Remove logic that depends on `confidence` / `low_confidence_spans`.
- Update visual-block handling to the structured formats (`<figure type="...">`, bracketed labels) and delete anchor-stripping code.
- If the workflow chained Parse into v1 Extract, move the extraction to v2 Extract. If it chained into Section, keep that workflow fully on v1.
- Update field-traceability code from `chunk_ids` to `{value, ranges}` range grounding.
