# Error Reference

## Error Response Format

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {},
  "request_id": "req_abc123"
}
```

## Error Codes

| Code | HTTP | Description | Action |
|------|------|-------------|--------|
| VALIDATION_ERROR | 400 | Missing or invalid parameters | Check request body |
| INVALID_API_KEY | 401 | Key missing, revoked, or malformed | Verify `X-API-Key` header |
| INSUFFICIENT_CREDITS | 402 | Not enough credits for operation | Top up at billing page |
| INSUFFICIENT_PERMISSIONS | 403 | Key can't access this resource | Check workspace scope |
| JOB_NOT_FOUND | 404 | Run ID doesn't exist | Verify run_id |
| DOCUMENT_NOT_FOUND | 404 | Document ID doesn't exist | Verify document_id |
| INVALID_DOCUMENT | 422 | Not a valid or readable PDF | Ensure valid PDF with %PDF header |
| FILE_TOO_LARGE | 422 | Exceeds 50MB limit | Reduce file size |
| UNSUPPORTED_CATEGORY | 422 | Document category not supported | Check supported categories |
| SANDBOX_LIMIT_EXCEEDED | 429 | Sandbox page quota exhausted | Contact support for upgrade |
| INTERNAL_ERROR | 500 | Server error | Retry with exponential backoff |

## Rate Limiting

- 100 requests per 60-second sliding window per API key
- Returns 429 with `Retry-After` header (seconds to wait)

## IP Allowlisting Errors

When an API key has IP restrictions and the request comes from a disallowed IP:

```json
{
  "error": "Request from this IP address is not allowed."
}
```

## Expired Key

```json
{
  "error": "API key has expired."
}
```
