# Troubleshooting

## HTTP Error Codes

| Code | Meaning | Common Causes | Action |
|------|---------|---------------|--------|
| **400** | Bad Request | `anyOf` sub-schema missing `type`/`anyOf` keyword; invalid parameter | Fix schema per error message |
| **401** | Unauthorized | Missing or invalid `VISION_AGENT_API_KEY` | Check `.env` file and key validity |
| **413** | Payload Too Large | File exceeds sync parse limit | Use Parse Jobs API for large files |
| **422** | Unprocessable Entity | Invalid JSON schema; unsupported keywords; top-level type not `"object"`; password-protected file without ZDR or with wrong password | Validate schema structure; check password; enable ZDR |
| **429** | Rate Limited | Too many concurrent requests | Add retry with exponential backoff |
| **206** | Partial Content | Some pages failed (parse) or schema violation (extract) | Check `metadata.failed_pages` or `metadata.schema_violation_error` |

## Parse Failures

- **Password-protected file**: Pass `password="..."` parameter (requires ZDR). Without ZDR, remove password protection before parsing
- **Unsupported format**: Check [file formats reference](file-formats.md)
- **File too large**: Use Parse Jobs API (`client.parse_jobs.create()`) for files > 50 pages or > 10 MB
- **Poor OCR quality**: Use high-resolution scans (300+ DPI); consider `dpt-2-latest` over `dpt-2-mini` for scanned docs

## Low Extraction Accuracy

- Add more detailed field descriptions (include format hints: "as YYYY-MM-DD", "in USD")
- Use more specific field names (`invoice_total_usd` rather than `total`)
- Match schema field order to how data appears in the document
- Reduce schema complexity — stay under 30 properties for best results
- Try `model="extract-20251024"` if the latest model misses fields it should return as `null`

## Missing Fields

- Verify the field actually exists in the document
- Check that the field description clearly identifies the data
- `extract-20251024` returns `null` for absent fields; `extract-latest` may omit them entirely
- Check `extraction_metadata` — if the field has `chunk_ids`, the model found it but may have returned an unexpected value

## Schema Validation Errors (HTTP 422)

- Top-level schema must have `"type": "object"`
- `anyOf` / `oneOf` sub-schemas each need their own `type` or `anyOf` keyword
- Avoid unsupported JSON Schema keywords (e.g., `if`/`then`, `$ref`)
- Use `pydantic_to_json_schema()` from `landingai_ade.lib` for reliable schema generation

## Performance Issues

- Use `dpt-2-mini` for simple, digitally-native documents (faster and cheaper)
- Enable Parse Jobs (`client.parse_jobs.create()`) for large files to avoid timeouts
- Process documents in parallel with `ThreadPoolExecutor` — see [document-workflows batch-processing.md](../../document-workflows/references/batch-processing.md)
- Cache parse results (save `response.markdown` to disk) when running multiple extractions on the same document

## Partial Results (HTTP 206)

**Parse 206** — Some pages failed:
```python
response = client.parse(document=Path("doc.pdf"), model="dpt-2-latest")
if response.metadata.failed_pages:
    print(f"Failed pages: {response.metadata.failed_pages}")
    # Remaining pages were parsed successfully; credits are consumed
```

**Extract 206** — Schema violation:
```python
response = client.extract(schema=schema, markdown=markdown)
err = response.metadata.schema_violation_error
if err:
    print(f"Schema violation: {err}")
    # Partial data is still returned; credits are consumed
```
