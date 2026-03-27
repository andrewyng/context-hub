---
name: webrisk
description: "Google Cloud Web Risk Python client for URI lookups, hash-prefix lookups, threat-list diff updates, and submission of suspected phishing URLs"
metadata:
  languages: "python"
  versions: "1.20.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,webrisk,safebrowsing,security,malware,phishing,python"
---

# Google Cloud Web Risk Python Client

## Golden Rule

Use the official `google-cloud-webrisk` package with `from google.cloud import webrisk_v1`, authenticate with Application Default Credentials (ADC), and choose the API surface that matches your design:

- `search_uris()` for direct server-side URL checks
- `compute_threat_list_diff()` plus `search_hashes()` only if you are maintaining a local threat database
- `create_submission()` only for the submission workflow, and only when your project is allowlisted for it

Prefer the `v1` client unless you have a specific reason to target older beta surfaces.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-webrisk==1.20.0"
```

Common alternatives:

```bash
uv add "google-cloud-webrisk==1.20.0"
poetry add "google-cloud-webrisk==1.20.0"
```

Prerequisites:

- a Google Cloud project with billing enabled
- the Web Risk API enabled for that project
- credentials that can call Google Cloud APIs

## Authentication And Setup

For local development, Google recommends ADC:

```bash
gcloud auth application-default login
```

For service-account based setups, point ADC at the key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

The client library uses the standard Cloud Platform OAuth scope. If you create credentials explicitly, include that scope:

```python
from google.cloud import webrisk_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "service-account.json",
    scopes=["https://www.googleapis.com/auth/cloud-platform"],
)

client = webrisk_v1.WebRiskServiceClient(credentials=credentials)
```

Default client initialization with ADC:

```python
from google.cloud import webrisk_v1

client = webrisk_v1.WebRiskServiceClient()
```

Reuse the client for multiple requests instead of constructing one per URL.

## Lookup API: Check A URL Directly

Use `search_uris()` when you want Google to do the lookup remotely and return a positive match, if any. The product docs note that the Lookup API takes one URL per request and the URL does not need to be canonicalized first.

```python
from google.cloud import webrisk_v1

THREAT_TYPES = [
    webrisk_v1.ThreatType.MALWARE,
    webrisk_v1.ThreatType.SOCIAL_ENGINEERING,
    webrisk_v1.ThreatType.UNWANTED_SOFTWARE,
    webrisk_v1.ThreatType.SOCIAL_ENGINEERING_EXTENDED_COVERAGE,
]

client = webrisk_v1.WebRiskServiceClient()

response = client.search_uris(
    uri="https://example.com",
    threat_types=THREAT_TYPES,
)

if response.threat and response.threat.threat_types:
    print("Matched threat types:", response.threat.threat_types)
    print("Cache positive result until:", response.threat.expire_time)
else:
    print("No threat match")
```

Use the returned `expire_time` as the positive-cache TTL. If there is no match, the response is empty.

## Update API: Maintain A Local Threat Database

Use the Update API when you need privacy-preserving checks or high-volume local lookups. This flow is more work than `search_uris()`:

1. fetch diffs with `compute_threat_list_diff()`
2. apply additions and removals to your local store
3. hash URL expressions locally and look up matching full hashes with `search_hashes()`
4. persist the returned version token per threat type

Minimal diff request:

```python
from google.cloud import webrisk_v1

client = webrisk_v1.WebRiskServiceClient()

constraints = webrisk_v1.ComputeThreatListDiffRequest.Constraints(
    max_diff_entries=1 << 10,
    max_database_entries=1 << 20,
    supported_compressions=[
        webrisk_v1.CompressionType.RAW,
        webrisk_v1.CompressionType.RICE,
    ],
)

response = client.compute_threat_list_diff(
    threat_type=webrisk_v1.ThreatType.MALWARE,
    version_token=b"",
    constraints=constraints,
)

print("Response type:", response.response_type)
print("Next token:", response.new_version_token)
print("Recommended next diff:", response.recommended_next_diff)

if response.checksum and response.checksum.sha256:
    print("SHA256 checksum:", response.checksum.sha256.hex())
```

Practical notes from the API reference:

- `version_token` is an opaque byte string. Store it exactly as returned and send it back on the next diff request for the same threat type.
- `max_diff_entries` and `max_database_entries` must be powers of two between `2**10` and `2**20`.
- `recommended_next_diff` is the server-side backoff hint for your next update request.
- When the response type indicates a reset, rebuild the local state from the returned data instead of trying to apply it as an incremental patch.

### Confirm A Full Hash After A Local Prefix Match

`search_hashes()` is for a hash prefix you already derived from your local Update API pipeline. It is not a shortcut for passing raw URLs.

```python
from google.cloud import webrisk_v1

client = webrisk_v1.WebRiskServiceClient()

response = client.search_hashes(
    hash_prefix=bytes.fromhex("00112233"),
    threat_types=[
        webrisk_v1.ThreatType.MALWARE,
        webrisk_v1.ThreatType.SOCIAL_ENGINEERING,
    ],
)

for threat_hash in response.threats:
    print("Full hash:", threat_hash.hash_.hex())
    print("Threat types:", threat_hash.threat_types)
    print("Cache until:", threat_hash.expire_time)

print("Negative cache until:", response.negative_expire_time)
```

If you are implementing the full Update API flow, the product docs also require URL canonicalization, generation of suffix and prefix expressions, and SHA-256 hashing before you ever call `search_hashes()`.

## Submission API: Report A Suspected Phishing URL

The Python client exposes `create_submission()`. The maintainer reference says this method is for URIs suspected of containing phishing content. The product REST reference also notes that submitting malicious URLs is an Early Access feature and your project must be allowlisted first.

`parent` uses the project number, not the project ID:

```python
from google.cloud import webrisk_v1

client = webrisk_v1.WebRiskServiceClient()

submission = webrisk_v1.Submission(
    uri="https://example.invalid/login",
)

response = client.create_submission(
    parent="projects/123456789012",
    submission=submission,
)

print(response)
```

Do not build your normal URL-check path around submissions. Use it only when you are explicitly reporting content and your project is enabled for that workflow.

## Endpoint And Transport Notes

`WebRiskServiceClient` accepts standard Google API `client_options`, including a custom `api_endpoint`. This matters if you need to force an endpoint instead of relying on the library's endpoint and mTLS environment detection.

```python
from google.api_core.client_options import ClientOptions
from google.cloud import webrisk_v1

client = webrisk_v1.WebRiskServiceClient(
    client_options=ClientOptions(api_endpoint="webrisk.googleapis.com")
)
```

Advanced environment variables used by Google API clients:

```bash
export GOOGLE_API_USE_MTLS_ENDPOINT="never"
export GOOGLE_API_USE_CLIENT_CERTIFICATE="false"
```

Only set those when you actually need to control endpoint selection or mTLS behavior.

## Common Pitfalls

- Install `google-cloud-webrisk`, but import from `google.cloud import webrisk_v1`.
- `search_uris()` and `search_hashes()` solve different problems. Do not hash a raw URL and treat that as a replacement for the full Update API pipeline.
- The library does not manage your local threat database for you. If you use `compute_threat_list_diff()`, you must store version tokens, apply resets and diffs, and verify checksums yourself.
- Cache lifetimes matter. Positive URI and hash matches include expiration times, and hash lookups also return `negative_expire_time` for safe negative caching.
- The submission workflow is gated. If `create_submission()` is central to your integration, confirm project allowlisting before you depend on it.

## Version-Sensitive Notes

- This guide targets `google-cloud-webrisk==1.20.0`.
- The official changelog entry for `1.20.0` notes automatic mTLS enablement when a client certificate is available and the relevant environment settings request it. If endpoint selection changes unexpectedly after an upgrade, set `client_options.api_endpoint` explicitly and review the `GOOGLE_API_USE_MTLS_ENDPOINT` and `GOOGLE_API_USE_CLIENT_CERTIFICATE` environment variables.

## Official Sources

- Python client reference root: https://cloud.google.com/python/docs/reference/webrisk/latest
- `WebRiskServiceClient` reference: https://cloud.google.com/python/docs/reference/webrisk/latest/google.cloud.webrisk_v1.services.web_risk_service.WebRiskServiceClient
- Web Risk Lookup API guide: https://cloud.google.com/web-risk/docs/lookup-api
- Web Risk Update API guide: https://cloud.google.com/web-risk/docs/update-api
- Web Risk REST reference: https://cloud.google.com/web-risk/docs/reference/rest
- Web Risk RPC reference: https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1
- Google Cloud ADC overview: https://cloud.google.com/docs/authentication/provide-credentials-adc
- `gcloud auth application-default login`: https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login
- Package page: https://pypi.org/project/google-cloud-webrisk/
- Changelog: https://cloud.google.com/python/docs/reference/webrisk/latest/changelog
