---
name: workers
description: "Cloudflare Workers SDK for building edge functions with KV and R2 storage in JavaScript/TypeScript"
metadata:
  languages: "javascript"
  versions: "6.3.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "cloudflare,workers,edge,kv,r2"
---

# Cloudflare API Coding Guidelines (JavaScript/TypeScript)

You are a Cloudflare API coding expert. Help me with writing code using the Cloudflare API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://developers.cloudflare.com/api/

## Golden Rule: Use the Correct and Current SDK

Always use the official Cloudflare TypeScript SDK to interact with the Cloudflare API, which is the standard library for all Cloudflare API interactions. Do not use unofficial libraries or deprecated packages.

- **Library Name:** Cloudflare TypeScript SDK
- **NPM Package:** `cloudflare`
- **Legacy Libraries:** Avoid unofficial packages or legacy clients

**Installation:**

```bash
npm install cloudflare
```

**APIs and Usage:**

- **Correct:** `import Cloudflare from 'cloudflare'`
- **Correct:** `const client = new Cloudflare({})`
- **Correct:** `await client.zones.create(...)`
- **Correct:** `await client.dns.records.create(...)`
- **Incorrect:** `CloudflareClient` or `CloudflareAPI`
- **Incorrect:** Using deprecated multipart form data APIs directly
- **Incorrect:** Unofficial wrapper libraries

## Installation

Install the Cloudflare SDK:

```bash
npm install cloudflare
```

Set your API token as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN='your_api_token_here'
```

## Initialization

The `cloudflare` library requires creating a `Cloudflare` instance for all API calls.

- Always use `const client = new Cloudflare({})` to create an instance.
- Set the `CLOUDFLARE_API_TOKEN` environment variable, which will be picked up automatically.

```javascript
import Cloudflare from 'cloudflare';

// Uses the CLOUDFLARE_API_TOKEN environment variable if apiToken not specified
const client = new Cloudflare({});

// Or pass the API token directly
// const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN });
```

### Alternative Authentication

You can also authenticate with API email and key (legacy method):

```javascript
const client = new Cloudflare({
  apiEmail: process.env.CLOUDFLARE_API_EMAIL,
  apiKey: process.env.CLOUDFLARE_API_KEY,
});
```

## Zone Management

Zones are the foundation of Cloudflare - each zone represents a domain.

### Create a Zone

```javascript
import Cloudflare from 'cloudflare';

const client = new Cloudflare({});

async function run() {
  const zone = await client.zones.create({
    account: { id: '023e105f4ecef8ad9ca31a8372d0c353' },
    name: 'example.com',
    type: 'full',
  });

  console.log(zone.id);
  console.log(zone.name);
  console.log(zone.status);
}

run();
```

### Get Zone Details

```javascript
const zone = await client.zones.get({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

console.log(zone.name);
console.log(zone.status);
```

### List Zones

```javascript
// List all zones with auto-pagination
async function listAllZones() {
  const zones = [];
  for await (const zone of client.zones.list()) {
    zones.push(zone);
  }
  return zones;
}

// Or with filtering
const response = await client.zones.list({
  account: { id: '023e105f4ecef8ad9ca31a8372d0c353' },
  status: 'active',
});
```

### Edit a Zone

```javascript
await client.zones.edit(
  {
    zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  },
  {
    paused: false,
    type: 'full',
  }
);
```

### Delete a Zone

```javascript
await client.zones.delete({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});
```

## DNS Records Management

Manage DNS records for your zones.

### Create DNS Record

```javascript
import Cloudflare from 'cloudflare';

const client = new Cloudflare({});

async function run() {
  const record = await client.dns.records.create({
    zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
    type: 'A',
    name: 'www',
    content: '192.0.2.1',
    ttl: 3600,
    proxied: true,
  });

  console.log(record.id);
  console.log(record.name);
}

run();
```

### List DNS Records

```javascript
// List all DNS records for a zone
const records = await client.dns.records.list({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const record of records.result) {
  console.log(`${record.type} ${record.name} -> ${record.content}`);
}

// Filter by record type
const aRecords = await client.dns.records.list({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  type: 'A',
});
```

### Update DNS Record

```javascript
await client.dns.records.update({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  record_id: '372e67954025e0ba6aaa6d586b9e0b59',
  type: 'A',
  name: 'www',
  content: '192.0.2.2',
  ttl: 3600,
  proxied: true,
});
```

### Delete DNS Record

```javascript
await client.dns.records.delete({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  record_id: '372e67954025e0ba6aaa6d586b9e0b59',
});
```

## Workers Management

Cloudflare Workers allows you to run JavaScript at the edge.

### Upload a Worker Script

```javascript
import Cloudflare from 'cloudflare';
import fs from 'fs';

const client = new Cloudflare({});

async function uploadWorker() {
  const scriptContent = fs.readFileSync('./worker.js', 'utf8');

  await client.workers.scripts.update({
    account_id: '023e105f4ecef8ad9ca31a8372d0c353',
    script_name: 'my-worker',
    '<any part name>': scriptContent,
    metadata: {
      main_module: 'worker.js',
      compatibility_date: '2025-01-01',
    },
  });
}

uploadWorker();
```

### List Worker Scripts

```javascript
const scripts = await client.workers.scripts.list({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const script of scripts.result) {
  console.log(script.id);
}
```

### Get Worker Script

```javascript
const script = await client.workers.scripts.get({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  script_name: 'my-worker',
});
```

### Delete Worker Script

```javascript
await client.workers.scripts.delete({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  script_name: 'my-worker',
});
```

## Workers KV Storage

Workers KV is a global, low-latency key-value data store.

### Create KV Namespace

```javascript
const namespace = await client.kv.namespaces.create({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  title: 'my-kv-namespace',
});

console.log(namespace.id);
```

### List KV Namespaces

```javascript
const namespaces = await client.kv.namespaces.list({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const ns of namespaces.result) {
  console.log(`${ns.id}: ${ns.title}`);
}
```

### Write KV Value

```javascript
await client.kv.namespaces.values.update({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  namespace_id: '0f2ac74b498b48028cb68387c421e279',
  key_name: 'my-key',
  metadata: JSON.stringify({ someMetadata: 'value' }),
  value: 'my-value',
});
```

### Read KV Value

```javascript
const value = await client.kv.namespaces.values.get({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  namespace_id: '0f2ac74b498b48028cb68387c421e279',
  key_name: 'my-key',
});

console.log(value);
```

### Delete KV Value

```javascript
await client.kv.namespaces.values.delete({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  namespace_id: '0f2ac74b498b48028cb68387c421e279',
  key_name: 'my-key',
});
```

### Delete KV Namespace

```javascript
await client.kv.namespaces.delete({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  namespace_id: '0f2ac74b498b48028cb68387c421e279',
});
```

## R2 Object Storage

R2 is S3-compatible object storage without egress fees.

### Create R2 Bucket

```javascript
const bucket = await client.r2.buckets.create({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  name: 'my-bucket',
});

console.log(bucket.name);
```

### List R2 Buckets

```javascript
const buckets = await client.r2.buckets.list({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const bucket of buckets.buckets) {
  console.log(bucket.name);
}
```

### Delete R2 Bucket

```javascript
await client.r2.buckets.delete({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  bucket_name: 'my-bucket',
});
```

## D1 Database

D1 is Cloudflare's native serverless SQL database.

### Create D1 Database

```javascript
const database = await client.d1.database.create({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  name: 'my-database',
});

console.log(database.uuid);
console.log(database.name);
```

### List D1 Databases

```javascript
const databases = await client.d1.database.list({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const db of databases.result) {
  console.log(`${db.uuid}: ${db.name}`);
}
```

### Query D1 Database

```javascript
const result = await client.d1.database.query({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  database_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  sql: 'SELECT * FROM users WHERE id = ?',
  params: ['123'],
});

console.log(result);
```

### Delete D1 Database

```javascript
await client.d1.database.delete({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  database_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
});
```

## Pages Projects

Cloudflare Pages allows you to deploy static sites and full-stack applications.

### Create Pages Project

```javascript
const project = await client.pages.projects.create({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  name: 'my-project',
  production_branch: 'main',
});

console.log(project.name);
```

### List Pages Projects

```javascript
const projects = await client.pages.projects.list({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const project of projects.result) {
  console.log(project.name);
}
```

### Get Pages Project

```javascript
const project = await client.pages.projects.get({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  project_name: 'my-project',
});
```

### Delete Pages Project

```javascript
await client.pages.projects.delete({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  project_name: 'my-project',
});
```

## Account Management

### List Accounts

```javascript
// Auto-pagination
async function getAllAccounts() {
  const accounts = [];
  for await (const account of client.accounts.list()) {
    accounts.push(account);
  }
  return accounts;
}

// Manual pagination
let page = await client.accounts.list({ per_page: 20 });
for (const account of page.result) {
  console.log(account.name);
}

while (page.hasNextPage()) {
  page = await page.getNextPage();
  // Process next page
}
```

### Get Account Details

```javascript
const account = await client.accounts.get({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

console.log(account.name);
console.log(account.settings);
```

## Load Balancers

### Create Load Balancer

```javascript
const loadBalancer = await client.loadBalancers.create({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  name: 'my-load-balancer',
  default_pools: ['17b5962d775c646f3f9725cbc7a53df4'],
  fallback_pool: '17b5962d775c646f3f9725cbc7a53df4',
  ttl: 30,
  steering_policy: 'random',
});
```

### List Load Balancers

```javascript
const loadBalancers = await client.loadBalancers.list({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});
```

### Create Load Balancer Pool

```javascript
const pool = await client.loadBalancers.pools.create({
  account_id: '023e105f4ecef8ad9ca31a8372d0c353',
  name: 'my-pool',
  origins: [
    {
      name: 'origin-1',
      address: '192.0.2.1',
      enabled: true,
      weight: 1,
    },
  ],
});
```

## Cache Management

### Purge Cache

```javascript
// Purge everything
await client.cache.purge({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  purge_everything: true,
});

// Purge by URLs
await client.cache.purge({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  files: [
    'https://example.com/file1.jpg',
    'https://example.com/file2.jpg',
  ],
});

// Purge by tags
await client.cache.purge({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  tags: ['tag1', 'tag2'],
});

// Purge by prefix
await client.cache.purge({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  prefixes: ['https://example.com/images/'],
});
```

## WAF and Firewall Rules

### Create Firewall Rule

```javascript
const rule = await client.firewall.rules.create({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  filter: {
    expression: '(ip.src eq 192.0.2.1)',
  },
  action: 'block',
  description: 'Block specific IP',
});
```

### List Firewall Rules

```javascript
const rules = await client.firewall.rules.list({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});
```

## SSL/TLS Certificate Management

### List SSL Certificates

```javascript
const certificates = await client.ssl.certificates.list({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});

for (const cert of certificates.result) {
  console.log(cert.id);
  console.log(cert.hosts);
}
```

### Get SSL Settings

```javascript
const settings = await client.ssl.settings.get({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
});
```

## File Uploads

The SDK supports multiple file input formats for endpoints that require file uploads:

```javascript
import fs from 'fs';
import Cloudflare, { toFile } from 'cloudflare';

const client = new Cloudflare({});

// Using Node.js streams (recommended)
await client.apiGateway.userSchemas.create({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  file: fs.createReadStream('/path/to/file'),
  kind: 'openapi_v3',
});

// Using the File API
await client.apiGateway.userSchemas.create({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  file: new File(['my bytes'], 'file'),
  kind: 'openapi_v3',
});

// Using fetch Response
await client.apiGateway.userSchemas.create({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  file: await fetch('https://somesite/file'),
  kind: 'openapi_v3',
});

// Using the toFile helper
await client.apiGateway.userSchemas.create({
  zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  file: await toFile(Buffer.from('my bytes'), 'file'),
  kind: 'openapi_v3',
});
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```javascript
import Cloudflare from 'cloudflare';

const client = new Cloudflare({});

try {
  const zone = await client.zones.get({
    zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  });
} catch (err) {
  if (err instanceof Cloudflare.APIError) {
    console.log(err.status); // HTTP status code (e.g., 400, 404)
    console.log(err.name); // Error type (e.g., BadRequestError)
    console.log(err.headers); // Response headers
    console.log(err.message); // Error message
  } else {
    throw err;
  }
}
```

### Error Types

| Status Code | Error Type                    |
| ----------- | ----------------------------- |
| 400         | `BadRequestError`             |
| 401         | `AuthenticationError`         |
| 403         | `PermissionDeniedError`       |
| 404         | `NotFoundError`               |
| 422         | `UnprocessableEntityError`    |
| 429         | `RateLimitError`              |
| >=500       | `InternalServerError`         |
| N/A         | `APIConnectionError`          |

All errors extend from `APIError`.

## Advanced Configuration

### Retries

Configure automatic retry behavior:

```javascript
// Configure default retries for all requests
const client = new Cloudflare({
  maxRetries: 3, // default is 2
});

// Or configure per-request
await client.zones.get(
  {
    zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  },
  {
    maxRetries: 5,
  }
);
```

The SDK automatically retries:
- Connection errors
- 408 Request Timeout
- 409 Conflict
- 429 Rate Limit
- >=500 Internal errors

### Timeouts

Set custom timeout values:

```javascript
// Configure default timeout for all requests
const client = new Cloudflare({
  timeout: 20 * 1000, // 20 seconds (default is 1 minute)
});

// Override per-request
await client.zones.edit(
  {
    zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
  },
  {
    timeout: 5 * 1000,
  }
);
```

### Custom Fetch Implementation

Provide a custom fetch function for logging or middleware:

```javascript
import { fetch } from 'undici';
import Cloudflare from 'cloudflare';

const client = new Cloudflare({
  fetch: async (url, init) => {
    console.log('Request:', url, init);
    const response = await fetch(url, init);
    console.log('Response:', response);
    return response;
  },
});
```

### Accessing Raw Response Data

Access underlying HTTP response data:

```javascript
// Get raw response
const response = await client.zones
  .create({
    account: { id: '023e105f4ecef8ad9ca31a8372d0c353' },
    name: 'example.com',
    type: 'full',
  })
  .asResponse();

console.log(response.headers.get('X-Request-ID'));

// Get both data and response
const { data: zone, response: raw } = await client.zones
  .create({
    account: { id: '023e105f4ecef8ad9ca31a8372d0c353' },
    name: 'example.com',
    type: 'full',
  })
  .withResponse();

console.log(zone.id);
console.log(raw.headers);
```

## Pagination

Handle paginated responses automatically or manually:

```javascript
// Auto-pagination (recommended)
async function fetchAllZones() {
  const allZones = [];
  for await (const zone of client.zones.list()) {
    allZones.push(zone);
  }
  return allZones;
}

// Manual pagination
let page = await client.zones.list({ per_page: 20 });
for (const zone of page.result) {
  console.log(zone.name);
}

while (page.hasNextPage()) {
  page = await page.getNextPage();
  for (const zone of page.result) {
    console.log(zone.name);
  }
}
```

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import Cloudflare from 'cloudflare';

const client = new Cloudflare({});

// Use typed parameters
const params: Cloudflare.ZoneCreateParams = {
  account: { id: '023e105f4ecef8ad9ca31a8372d0c353' },
  name: 'example.com',
  type: 'full',
};

// Get typed response
const zone: Cloudflare.Zone = await client.zones.create(params);

// TypeScript will validate all fields
console.log(zone.id);
console.log(zone.name);
console.log(zone.status);
```

## Custom Endpoints

Make requests to endpoints not yet in the typed SDK:

```javascript
// POST request to custom endpoint
await client.post('/some/path', {
  body: { some_prop: 'foo' },
  query: { some_query_arg: 'bar' },
});

// GET request
const response = await client.get('/custom/endpoint', {
  query: { filter: 'active' },
});
```

For undocumented parameters in typed methods:

```typescript
client.zones.create({
  account: { id: '023e105f4ecef8ad9ca31a8372d0c353' },
  name: 'example.com',
  // @ts-expect-error undocumented_param is not in the types yet
  undocumented_param: 'some_value',
});
```

## Useful Links

- Documentation: https://developers.cloudflare.com/api/
- SDK Reference: https://github.com/cloudflare/cloudflare-typescript
- API Keys: https://dash.cloudflare.com/profile/api-tokens
- Workers Docs: https://developers.cloudflare.com/workers/
- R2 Docs: https://developers.cloudflare.com/r2/
- D1 Docs: https://developers.cloudflare.com/d1/
- KV Docs: https://developers.cloudflare.com/kv/
- Pages Docs: https://developers.cloudflare.com/pages/
- Rate Limits: https://developers.cloudflare.com/fundamentals/api/reference/limits/
