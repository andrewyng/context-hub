---
name: websecurityscanner
description: "google-cloud-websecurityscanner package guide for Python covering ADC setup, scan configs, scan runs, findings, and authenticated-scan caveats"
metadata:
  languages: "python"
  versions: "1.19.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,web-security-scanner,security-command-center,vulnerability-scanning,google-cloud-websecurityscanner,python"
---

# google-cloud-websecurityscanner Python Package Guide

## Golden Rule

Use `google-cloud-websecurityscanner` with `from google.cloud import websecurityscanner_v1`, authenticate with Application Default Credentials (ADC), and model your code around the package's persistent resource flow:

1. create or update a `ScanConfig`
2. start a `ScanRun`
3. poll the run state
4. read findings and finding-type stats

This client is for the current Web Security Scanner API surface. The current Google Cloud product docs describe custom scans as part of Security Command Center, so make sure the target project has the required product/API enablement before you debug Python code.

## Version Notes

This guide is written for PyPI package version `1.19.0`.

Google's package landing page is current, but some deep generated-reference pages still render older package versions such as `1.17.2` or `1.18.0` in the page header. Use `1.19.0` for dependency pinning, and use the latest reference pages for method names, request types, and field names.

## Install

```bash
python -m pip install "google-cloud-websecurityscanner==1.19.0"
```

Common alternatives:

```bash
uv add "google-cloud-websecurityscanner==1.19.0"
poetry add "google-cloud-websecurityscanner==1.19.0"
```

## Authentication And Setup

Before calling the client:

1. enable the target Google Cloud project for Web Security Scanner / Security Command Center as required by your scan workflow
2. grant the calling identity permission to manage scan configs and runs
3. authenticate locally with ADC, or use a runtime-attached service account in production

Local development with ADC:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

Service-account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

Minimal client initialization:

```python
import os

from google.cloud import websecurityscanner_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
project_name = f"projects/{project_id}"

client = websecurityscanner_v1.WebSecurityScannerClient()
```

Explicit credentials object:

```python
import os

from google.cloud import websecurityscanner_v1
from google.oauth2 import service_account

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
project_name = f"projects/{project_id}"

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

client = websecurityscanner_v1.WebSecurityScannerClient(credentials=credentials)
```

## Core Workflow

### List Existing Scan Configs

```python
import os

from google.cloud import websecurityscanner_v1

project_name = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}"
client = websecurityscanner_v1.WebSecurityScannerClient()

request = websecurityscanner_v1.ListScanConfigsRequest(parent=project_name)

for scan_config in client.list_scan_configs(request=request):
    print(scan_config.name, scan_config.display_name)
```

### Create A Scan Config

The minimum useful config is a display name plus one or more starting URLs.

```python
import os

from google.cloud import websecurityscanner_v1

project_name = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}"
client = websecurityscanner_v1.WebSecurityScannerClient()

scan_config = websecurityscanner_v1.ScanConfig(
    display_name="staging-weekly-scan",
    starting_urls=["https://staging.example.com/"],
    max_qps=15,
)

created = client.create_scan_config(
    request=websecurityscanner_v1.CreateScanConfigRequest(
        parent=project_name,
        scan_config=scan_config,
    )
)

print(created.name)
```

Useful fields from the `ScanConfig` type:

- `starting_urls`: required scan entry points
- `max_qps`: crawler request rate
- `blacklist_patterns`: URL patterns to exclude
- `ignore_http_status_errors`: whether non-2xx/3xx responses should fail the scan less aggressively
- `static_ip_scan`: preview feature for static-IP custom scans

### Start A Scan Run And Poll Until Completion

Google's product docs note that a scan can stay queued for a while and might take hours before it starts, so poll for state instead of assuming immediate execution.

```python
import os
import time

from google.cloud import websecurityscanner_v1

project_name = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}"
client = websecurityscanner_v1.WebSecurityScannerClient()

scan_config = next(
    client.list_scan_configs(
        request=websecurityscanner_v1.ListScanConfigsRequest(parent=project_name)
    )
)

scan_run = client.start_scan_run(
    request=websecurityscanner_v1.StartScanRunRequest(
        name=scan_config.name,
    )
)

while True:
    current = client.get_scan_run(request={"name": scan_run.name})
    state = current.execution_state
    print(current.name, state)

    if state in (
        websecurityscanner_v1.ScanRun.ExecutionState.FINISHED,
        websecurityscanner_v1.ScanRun.ExecutionState.ERROR,
        websecurityscanner_v1.ScanRun.ExecutionState.KILLED,
    ):
        break

    time.sleep(30)
```

If you need to stop a run early:

```python
client.stop_scan_run(request={"name": scan_run.name})
```

### Read Findings And Finding-Type Stats

`list_findings` gives you the findings attached to a run. `list_finding_type_stats` is the fastest way to summarize the run by finding type.

```python
from google.cloud import websecurityscanner_v1

client = websecurityscanner_v1.WebSecurityScannerClient()

for finding in client.list_findings(request={"parent": scan_run.name}):
    print(finding.name)
```

```python
from google.cloud import websecurityscanner_v1

client = websecurityscanner_v1.WebSecurityScannerClient()

for stat in client.list_finding_type_stats(request={"parent": scan_run.name}):
    print(stat.finding_type, stat.finding_count)
```

If you already have a finding resource name and want the full record:

```python
finding = client.get_finding(
    request={"name": "projects/PROJECT_ID/scanConfigs/SCAN_CONFIG_ID/scanRuns/RUN_ID/findings/FINDING_ID"}
)

print(finding.name)
```

### Update A Scan Config

Use `update_scan_config` with a field mask. Changes outside the `FieldMask.paths` list are ignored.

```python
from google.cloud import websecurityscanner_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = websecurityscanner_v1.WebSecurityScannerClient()

scan_config = client.get_scan_config(request={"name": created.name})
scan_config.max_qps = 5
scan_config.ignore_http_status_errors = True

updated = client.update_scan_config(
    request=websecurityscanner_v1.UpdateScanConfigRequest(
        scan_config=scan_config,
        update_mask=FieldMask(
            paths=["max_qps", "ignore_http_status_errors"]
        ),
    )
)

print(updated.max_qps, updated.ignore_http_status_errors)
```

## Target Authentication Options

Google's product docs describe these target-app authentication modes for scan configs:

- custom account login with `username`, `password`, and `login_url`
- Google account login with `username` and `password`
- Identity-Aware Proxy (IAP) by granting the Web Security Scanner service account access to the protected application

Practical guidance from the product docs:

- Prefer IAP when possible for authenticated applications. Google documents it as the more reliable option.
- Google account authentication does not support two-factor authentication.
- Custom-account form auth breaks easily on complex HTML forms, custom JavaScript login flows, anti-bot / DDoS protection, or pages that do not set an auth cookie after login.
- Static-IP custom scans are more limited than standard custom scans. The current docs say they are preview-only, support public Compute Engine and GKE targets, do not support App Engine, and only work with no authentication or Google-account authentication.

## Important Pitfalls

- Custom scans target public URLs or public IPs. The current product docs say standard custom scans only support public IPv4 hosts, not internal-only services.
- Scans can create or modify server-side state. Use a staging environment or disposable test accounts when forms trigger writes.
- More exclusion patterns are not always better. Google documents a hard limit of 100 blacklist patterns and recommends avoiding more than about 10 different scans before cleanup because excessive configs slow the system down.
- Do not assume a started run is actively scanning right away. A scan may sit queued for a while before it begins.
- If your target is behind a firewall, allowlisting depends on the scan mode. Standard custom scans and static-IP custom scans use different source IP guidance.
- Reuse the client instead of recreating it per request. The generated client manages its own transport.

## Practical Workflow For Agents

When generating code against this package:

1. set up ADC and `GOOGLE_CLOUD_PROJECT` first
2. list existing scan configs before creating duplicates
3. create or update a `ScanConfig`
4. start a run and poll `get_scan_run`
5. read findings from the run resource, then summarize with `list_finding_type_stats`
6. stop the run explicitly if your automation no longer needs it

## Official Sources

- Package reference landing page: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest`
- `WebSecurityScannerClient` reference: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest/google.cloud.websecurityscanner_v1.services.web_security_scanner.WebSecurityScannerClient`
- `ScanConfig` type reference: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest/google.cloud.websecurityscanner_v1.types.ScanConfig`
- `CreateScanConfigRequest` type reference: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest/google.cloud.websecurityscanner_v1.types.CreateScanConfigRequest`
- `StartScanRunRequest` type reference: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest/google.cloud.websecurityscanner_v1.types.StartScanRunRequest`
- `ListFindingsRequest` type reference: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest/google.cloud.websecurityscanner_v1.types.ListFindingsRequest`
- `ScanRun` type reference: `https://cloud.google.com/python/docs/reference/websecurityscanner/latest/google.cloud.websecurityscanner_v1.types.ScanRun`
- Authentication with ADC: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Web Security Scanner custom scans guide: `https://cloud.google.com/security-command-center/docs/how-to-web-security-scanner-custom-scans`
- Scan with user credentials: `https://cloud.google.com/security-command-center/docs/how-to-use-web-security-scanner-scan-with-user-credentials`
- IAP setup for Web Security Scanner: `https://cloud.google.com/security-command-center/docs/how-to-web-security-scanner-scan-with-iap`
- PyPI package page: `https://pypi.org/project/google-cloud-websecurityscanner/`
