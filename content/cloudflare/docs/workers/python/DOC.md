---
name: workers
description: "Cloudflare Workers SDK for building edge functions with KV and R2 storage in Python"
metadata:
  languages: "python"
  versions: "5.2.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "cloudflare,workers,edge,kv,r2"
---

# Cloudflare API Coding Guidelines (Python)

You are a Cloudflare API coding expert. Help me with writing code using the Cloudflare API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://developers.cloudflare.com/api/

## Golden Rule: Use the Correct and Current SDK

Always use the official Cloudflare Python SDK to interact with the Cloudflare API, which is the standard library for all Cloudflare API interactions. Do not use unofficial libraries or deprecated packages.

- **Library Name:** Cloudflare Python SDK
- **PyPI Package:** `cloudflare`
- **Legacy Libraries:** Avoid `python-cloudflare` (archived) or unofficial packages

**Installation:**

```bash
pip install cloudflare
```

**APIs and Usage:**

- **Correct:** `from cloudflare import Cloudflare`
- **Correct:** `client = Cloudflare()`
- **Correct:** `client.zones.create(...)`
- **Correct:** `from cloudflare import AsyncCloudflare`
- **Incorrect:** `CloudflareAPI` or `CloudFlare`
- **Incorrect:** Using the archived `python-cloudflare` package
- **Incorrect:** `CloudflareClient`

## Installation

Install the Cloudflare SDK:

```bash
pip install cloudflare
```

Set your API token as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN='your_api_token_here'
```

## Initialization

The `cloudflare` library requires creating a `Cloudflare` instance for all API calls.

```python
import os
from cloudflare import Cloudflare

# Uses the CLOUDFLARE_API_TOKEN environment variable if api_token not specified
client = Cloudflare()

# Or pass the API token directly
# client = Cloudflare(api_token=os.environ.get("CLOUDFLARE_API_TOKEN"))
```

### Alternative Authentication

You can also authenticate with API email and key (legacy method):

```python
client = Cloudflare(
    api_email=os.environ.get("CLOUDFLARE_API_EMAIL"),
    api_key=os.environ.get("CLOUDFLARE_API_KEY"),
)
```

### Async Client

The SDK provides an async client for asynchronous operations:

```python
import asyncio
import os
from cloudflare import AsyncCloudflare

client = AsyncCloudflare(
    api_token=os.environ.get("CLOUDFLARE_API_TOKEN"),
)

async def main():
    zone = await client.zones.create(
        account={"id": "023e105f4ecef8ad9ca31a8372d0c353"},
        name="example.com",
        type="full",
    )
    print(zone.id)

asyncio.run(main())
```

## Zone Management

Zones are the foundation of Cloudflare - each zone represents a domain.

### Create a Zone

```python
from cloudflare import Cloudflare

client = Cloudflare()

zone = client.zones.create(
    account={"id": "023e105f4ecef8ad9ca31a8372d0c353"},
    name="example.com",
    type="full",
)

print(zone.id)
print(zone.name)
print(zone.status)
```

### Get Zone Details

```python
zone = client.zones.get(zone_id="023e105f4ecef8ad9ca31a8372d0c353")

print(zone.name)
print(zone.status)
print(zone.name_servers)
```

### List Zones

```python
# List all zones with auto-pagination
all_zones = []
for zone in client.zones.list():
    all_zones.append(zone)
    print(f"{zone.id}: {zone.name}")

# Or with filtering
zones = client.zones.list(
    account={"id": "023e105f4ecef8ad9ca31a8372d0c353"},
    status="active",
)
for zone in zones:
    print(zone.name)
```

### Edit a Zone

```python
client.zones.edit(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    paused=False,
    type="full",
)
```

### Delete a Zone

```python
client.zones.delete(zone_id="023e105f4ecef8ad9ca31a8372d0c353")
```

## DNS Records Management

Manage DNS records for your zones.

### Create DNS Record

```python
from cloudflare import Cloudflare

client = Cloudflare()

record = client.dns.records.create(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    type="A",
    name="www",
    content="192.0.2.1",
    ttl=3600,
    proxied=True,
)

print(record.id)
print(record.name)
print(record.type)
```

### List DNS Records

```python
# List all DNS records for a zone
records = client.dns.records.list(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for record in records:
    print(f"{record.type} {record.name} -> {record.content}")

# Filter by record type
a_records = client.dns.records.list(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    type="A",
)

for record in a_records:
    print(f"{record.name}: {record.content}")
```

### Update DNS Record

```python
client.dns.records.update(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    dns_record_id="372e67954025e0ba6aaa6d586b9e0b59",
    type="A",
    name="www",
    content="192.0.2.2",
    ttl=3600,
    proxied=True,
)
```

### Delete DNS Record

```python
client.dns.records.delete(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    dns_record_id="372e67954025e0ba6aaa6d586b9e0b59",
)
```

## Workers Management

Cloudflare Workers allows you to run code at the edge.

### Upload a Worker Script

```python
from cloudflare import Cloudflare

client = Cloudflare()

# Read worker script from file
with open("worker.js", "r") as f:
    script_content = f.read()

client.workers.scripts.update(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    script_name="my-worker",
    **{"<any part name>": script_content},
    metadata={
        "main_module": "worker.js",
        "compatibility_date": "2025-01-01",
    },
)
```

### List Worker Scripts

```python
scripts = client.workers.scripts.list(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for script in scripts:
    print(script.id)
```

### Get Worker Script

```python
script = client.workers.scripts.get(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    script_name="my-worker",
)
```

### Delete Worker Script

```python
client.workers.scripts.delete(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    script_name="my-worker",
)
```

## Workers KV Storage

Workers KV is a global, low-latency key-value data store.

### Create KV Namespace

```python
namespace = client.kv.namespaces.create(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    title="my-kv-namespace",
)

print(namespace.id)
print(namespace.title)
```

### List KV Namespaces

```python
namespaces = client.kv.namespaces.list(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for ns in namespaces:
    print(f"{ns.id}: {ns.title}")
```

### Write KV Value

```python
client.kv.namespaces.values.update(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    namespace_id="0f2ac74b498b48028cb68387c421e279",
    key_name="my-key",
    value="my-value",
    metadata='{"someMetadata": "value"}',
)
```

### Read KV Value

```python
value = client.kv.namespaces.values.get(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    namespace_id="0f2ac74b498b48028cb68387c421e279",
    key_name="my-key",
)

print(value)
```

### Delete KV Value

```python
client.kv.namespaces.values.delete(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    namespace_id="0f2ac74b498b48028cb68387c421e279",
    key_name="my-key",
)
```

### Delete KV Namespace

```python
client.kv.namespaces.delete(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    namespace_id="0f2ac74b498b48028cb68387c421e279",
)
```

## R2 Object Storage

R2 is S3-compatible object storage without egress fees.

### Create R2 Bucket

```python
bucket = client.r2.buckets.create(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    name="my-bucket",
)

print(bucket.name)
print(bucket.creation_date)
```

### List R2 Buckets

```python
buckets = client.r2.buckets.list(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for bucket in buckets.buckets:
    print(bucket.name)
```

### Delete R2 Bucket

```python
client.r2.buckets.delete(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    bucket_name="my-bucket",
)
```

## D1 Database

D1 is Cloudflare's native serverless SQL database.

### Create D1 Database

```python
database = client.d1.database.create(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    name="my-database",
)

print(database.uuid)
print(database.name)
```

### List D1 Databases

```python
databases = client.d1.database.list(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for db in databases:
    print(f"{db.uuid}: {db.name}")
```

### Query D1 Database

```python
result = client.d1.database.query(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    database_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    sql="SELECT * FROM users WHERE id = ?",
    params=["123"],
)

print(result)
```

### Delete D1 Database

```python
client.d1.database.delete(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    database_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
)
```

## Pages Projects

Cloudflare Pages allows you to deploy static sites and full-stack applications.

### Create Pages Project

```python
project = client.pages.projects.create(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    name="my-project",
    production_branch="main",
)

print(project.name)
print(project.subdomain)
```

### List Pages Projects

```python
projects = client.pages.projects.list(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for project in projects:
    print(f"{project.name}: {project.subdomain}")
```

### Get Pages Project

```python
project = client.pages.projects.get(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    project_name="my-project",
)

print(project.name)
print(project.production_branch)
```

### Delete Pages Project

```python
client.pages.projects.delete(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    project_name="my-project",
)
```

## Account Management

### List Accounts

```python
# Auto-pagination
all_accounts = []
for account in client.accounts.list():
    all_accounts.append(account)
    print(f"{account.id}: {account.name}")

# Manual pagination
page = client.accounts.list(per_page=20)
for account in page.result:
    print(account.name)

if page.has_next_page():
    next_page = page.get_next_page()
    for account in next_page.result:
        print(account.name)
```

### Get Account Details

```python
account = client.accounts.get(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
)

print(account.name)
print(account.settings)
```

## Load Balancers

### Create Load Balancer

```python
load_balancer = client.load_balancers.create(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    name="my-load-balancer",
    default_pools=["17b5962d775c646f3f9725cbc7a53df4"],
    fallback_pool="17b5962d775c646f3f9725cbc7a53df4",
    ttl=30,
    steering_policy="random",
)

print(load_balancer.id)
```

### List Load Balancers

```python
load_balancers = client.load_balancers.list(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for lb in load_balancers:
    print(f"{lb.id}: {lb.name}")
```

### Create Load Balancer Pool

```python
pool = client.load_balancers.pools.create(
    account_id="023e105f4ecef8ad9ca31a8372d0c353",
    name="my-pool",
    origins=[
        {
            "name": "origin-1",
            "address": "192.0.2.1",
            "enabled": True,
            "weight": 1,
        },
    ],
)

print(pool.id)
```

## Cache Management

### Purge Cache

```python
# Purge everything
client.cache.purge(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    purge_everything=True,
)

# Purge by URLs
client.cache.purge(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    files=[
        "https://example.com/file1.jpg",
        "https://example.com/file2.jpg",
    ],
)

# Purge by tags
client.cache.purge(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    tags=["tag1", "tag2"],
)

# Purge by prefix
client.cache.purge(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    prefixes=["https://example.com/images/"],
)
```

## WAF and Firewall Rules

### Create Firewall Rule

```python
rule = client.firewall.rules.create(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    filter={
        "expression": "(ip.src eq 192.0.2.1)",
    },
    action="block",
    description="Block specific IP",
)

print(rule.id)
```

### List Firewall Rules

```python
rules = client.firewall.rules.list(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for rule in rules:
    print(f"{rule.id}: {rule.description}")
```

## SSL/TLS Certificate Management

### List SSL Certificates

```python
certificates = client.ssl.certificates.list(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)

for cert in certificates:
    print(cert.id)
    print(cert.hosts)
```

### Get SSL Settings

```python
settings = client.ssl.settings.get(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)

print(settings)
```

## File Uploads

The SDK supports multiple file input formats for endpoints that require file uploads:

```python
from pathlib import Path
from cloudflare import Cloudflare

client = Cloudflare()

# Using Path objects (recommended)
client.api_gateway.user_schemas.create(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
    file=Path("/path/to/file"),
    kind="openapi_v3",
)

# Using file-like objects
with open("/path/to/file", "rb") as f:
    client.api_gateway.user_schemas.create(
        zone_id="023e105f4ecef8ad9ca31a8372d0c353",
        file=f,
        kind="openapi_v3",
    )

# Using bytes
with open("/path/to/file", "rb") as f:
    file_bytes = f.read()
    client.api_gateway.user_schemas.create(
        zone_id="023e105f4ecef8ad9ca31a8372d0c353",
        file=file_bytes,
        kind="openapi_v3",
    )
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```python
import cloudflare
from cloudflare import Cloudflare

client = Cloudflare()

try:
    zone = client.zones.get(zone_id="023e105f4ecef8ad9ca31a8372d0c353")
except cloudflare.APIConnectionError as e:
    print("Server unreachable")
    print(e.__cause__)
except cloudflare.RateLimitError as e:
    print("429 rate limit error")
    print(e.status_code)
    print(e.response)
except cloudflare.APIStatusError as e:
    print(f"Error {e.status_code}")
    print(e.response)
except Exception as e:
    print(f"Unexpected error: {e}")
```

### Error Types

- `APIConnectionError` - Server unreachable or connection issues
- `RateLimitError` - 429 rate limit exceeded
- `APIStatusError` - Any HTTP error status (400, 401, 403, 404, etc.)
- `APITimeoutError` - Request timeout

All errors have access to:
- `e.status_code` - HTTP status code (if available)
- `e.response` - Raw response object
- `e.body` - Response body

## Advanced Configuration

### Retries

Configure automatic retry behavior:

```python
from cloudflare import Cloudflare

# Configure default retries for all requests
client = Cloudflare(max_retries=3)  # default is 2

# Or configure per-request
client.with_options(max_retries=5).zones.get(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)
```

The SDK automatically retries:
- Connection errors
- 408 Request Timeout
- 409 Conflict
- 429 Rate Limit
- >=500 Internal errors

### Timeouts

Set custom timeout values:

```python
from cloudflare import Cloudflare
import httpx

# Simple timeout (20 seconds)
client = Cloudflare(timeout=20.0)  # default is 1 minute

# Granular timeout control
client = Cloudflare(
    timeout=httpx.Timeout(
        60.0,           # total timeout
        read=5.0,       # read timeout
        write=10.0,     # write timeout
        connect=2.0,    # connect timeout
    ),
)

# Override per-request
client.with_options(timeout=5.0).zones.edit(
    zone_id="023e105f4ecef8ad9ca31a8372d0c353",
)
```

### Custom HTTP Client

Provide a custom HTTP client for proxies or custom configuration:

```python
import httpx
from cloudflare import Cloudflare, DefaultHttpxClient

client = Cloudflare(
    http_client=DefaultHttpxClient(
        proxy="http://my.test.proxy.example.com",
        transport=httpx.HTTPTransport(local_address="0.0.0.0"),
    ),
)
```

### Base URL Override

Override the base API URL:

```python
client = Cloudflare(
    base_url="http://my.test.server.example.com:8083",
)
```

### Accessing Raw Response Data

Access underlying HTTP response data:

```python
from cloudflare import Cloudflare

client = Cloudflare()

# Get raw response
response = client.zones.with_raw_response.create(
    account={"id": "023e105f4ecef8ad9ca31a8372d0c353"},
    name="example.com",
    type="full",
)

print(response.headers.get("X-Request-ID"))
print(response.status_code)

# Parse the response
zone = response.parse()
print(zone.id)
```

### Streaming Responses

Stream large responses:

```python
with client.zones.with_streaming_response.create(
    account={"id": "023e105f4ecef8ad9ca31a8372d0c353"},
    name="example.com",
    type="full",
) as response:
    print(response.headers.get("X-My-Header"))
    for line in response.iter_lines():
        print(line)
```

## Pagination

Handle paginated responses automatically or manually:

```python
from cloudflare import Cloudflare

client = Cloudflare()

# Auto-pagination (recommended)
all_zones = []
for zone in client.zones.list():
    all_zones.append(zone)
    print(zone.name)

# Manual pagination
first_page = client.zones.list(per_page=20)
for zone in first_page.result:
    print(zone.name)

if first_page.has_next_page():
    print(f"Next page info: {first_page.next_page_info()}")
    next_page = first_page.get_next_page()
    for zone in next_page.result:
        print(zone.name)
```

### Async Pagination

```python
import asyncio
from cloudflare import AsyncCloudflare

client = AsyncCloudflare()

async def main():
    # Auto-pagination
    all_accounts = []
    async for account in client.accounts.list():
        all_accounts.append(account)
    print(all_accounts)

    # Manual pagination
    first_page = await client.accounts.list()
    if first_page.has_next_page():
        next_page = await first_page.get_next_page()
        print(f"Items: {len(next_page.result)}")

asyncio.run(main())
```

## Context Manager Usage

Use context managers to ensure proper resource cleanup:

```python
from cloudflare import Cloudflare

with Cloudflare() as client:
    zone = client.zones.get(zone_id="023e105f4ecef8ad9ca31a8372d0c353")
    print(zone.name)
# HTTP client is automatically closed

# Async context manager
import asyncio
from cloudflare import AsyncCloudflare

async def main():
    async with AsyncCloudflare() as client:
        zone = await client.zones.get(zone_id="023e105f4ecef8ad9ca31a8372d0c353")
        print(zone.name)

asyncio.run(main())
```

## Type Checking

The SDK includes full type annotations for use with mypy or other type checkers:

```python
from cloudflare import Cloudflare
from cloudflare.types import Zone

client: Cloudflare = Cloudflare()

zone: Zone = client.zones.get(zone_id="023e105f4ecef8ad9ca31a8372d0c353")
print(zone.id)
print(zone.name)
```

## Custom/Undocumented Endpoints

Make requests to endpoints not yet in the typed SDK:

```python
import httpx

# POST request to custom endpoint
response = client.post(
    "/some/path",
    cast_to=httpx.Response,
    body={"some_prop": "foo"},
)

print(response.headers.get("x-foo"))

# GET request
response = client.get(
    "/custom/endpoint",
    cast_to=httpx.Response,
    options={"params": {"filter": "active"}},
)
```

## Checking for Null vs. Missing Fields

Distinguish between null values and missing fields:

```python
response = client.zones.get(zone_id="023e105f4ecef8ad9ca31a8372d0c353")

if response.my_field is None:
    if "my_field" not in response.model_fields_set:
        print("Field was missing entirely")
    else:
        print("Field was explicitly null")
```

## Useful Links

- Documentation: https://developers.cloudflare.com/api/
- SDK GitHub: https://github.com/cloudflare/cloudflare-python
- API Keys: https://dash.cloudflare.com/profile/api-tokens
- Workers Docs: https://developers.cloudflare.com/workers/
- R2 Docs: https://developers.cloudflare.com/r2/
- D1 Docs: https://developers.cloudflare.com/d1/
- KV Docs: https://developers.cloudflare.com/kv/
- Pages Docs: https://developers.cloudflare.com/pages/
- Rate Limits: https://developers.cloudflare.com/fundamentals/api/reference/limits/
