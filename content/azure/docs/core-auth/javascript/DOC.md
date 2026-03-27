---
name: core-auth
description: "@azure/core-auth JavaScript credential primitives for Azure SDK clients: token credentials, API keys, named keys, and SAS tokens"
metadata:
  languages: "javascript"
  versions: "1.10.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,core-auth,javascript,credentials,authentication,tokens,keys,sas"
---

# @azure/core-auth JavaScript Package Guide

## Golden Rule

Use `@azure/core-auth` for the shared credential types and credential containers that Azure SDK clients accept. This package does not sign users in, fetch Microsoft Entra ID tokens by itself, or create service clients. For token acquisition, pair it with `@azure/identity`; for key-based auth, construct the credential objects from this package and pass them into the service SDK you are actually using.

## Install

Install `@azure/core-auth` when your app or shared helper code needs the common Azure credential types directly:

```bash
npm install @azure/core-auth@1.10.1
```

In most real applications, you install it alongside a service SDK and, for Entra ID auth, `@azure/identity`:

```bash
npm install @azure/core-auth@1.10.1 @azure/search-documents @azure/identity
```

## What This Package Provides

The main surface area is small:

- `TokenCredential`: interface implemented by token providers such as `DefaultAzureCredential`
- `AzureKeyCredential`: wraps one secret string and supports in-place rotation with `.update(...)`
- `AzureNamedKeyCredential`: wraps a name/key pair and supports in-place rotation with `.update(...)`
- `AzureSASCredential`: wraps a SAS signature string and supports in-place rotation with `.update(...)`

These credential objects are reused across many Azure JavaScript SDKs.

## Authentication And Client Initialization

### Choose the credential type your service client expects

For most Azure SDKs, the auth choice is one of these:

- `TokenCredential` for Microsoft Entra ID and managed identity flows
- `AzureKeyCredential` for simple API-key auth
- `AzureNamedKeyCredential` when the service expects both a name and a secret
- `AzureSASCredential` when the service accepts a SAS token

If the service supports token auth, prefer `DefaultAzureCredential` in deployed Azure environments and local development with Azure CLI, Azure Developer CLI, or service-principal environment variables.

### Minimal token-auth client setup

`@azure/core-auth` defines the `TokenCredential` contract. A concrete implementation usually comes from `@azure/identity`.

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export AZURE_SEARCH_SERVICE_ENDPOINT="https://<service-name>.search.windows.net"
export AZURE_SEARCH_INDEX_NAME="hotels"
```

```js
import { DefaultAzureCredential } from "@azure/identity";
import { SearchClient } from "@azure/search-documents";

const endpoint = process.env.AZURE_SEARCH_SERVICE_ENDPOINT;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

if (!endpoint || !indexName) {
  throw new Error(
    "AZURE_SEARCH_SERVICE_ENDPOINT and AZURE_SEARCH_INDEX_NAME are required",
  );
}

const credential = new DefaultAzureCredential();
const client = new SearchClient(endpoint, indexName, credential);

const searchResults = await client.search("wifi");

for await (const result of searchResults.results) {
  console.log(result.document.hotelName);
}
```

### Minimal API-key client setup

Use `AzureKeyCredential` when the service SDK accepts an API key instead of a token credential.

```bash
export AZURE_SEARCH_SERVICE_ENDPOINT="https://<service-name>.search.windows.net"
export AZURE_SEARCH_INDEX_NAME="hotels"
export AZURE_SEARCH_API_KEY="<query-or-admin-key>"
```

```js
import { AzureKeyCredential } from "@azure/core-auth";
import { SearchClient } from "@azure/search-documents";

const endpoint = process.env.AZURE_SEARCH_SERVICE_ENDPOINT;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const apiKey = process.env.AZURE_SEARCH_API_KEY;

if (!endpoint || !indexName || !apiKey) {
  throw new Error(
    "AZURE_SEARCH_SERVICE_ENDPOINT, AZURE_SEARCH_INDEX_NAME, and AZURE_SEARCH_API_KEY are required",
  );
}

const credential = new AzureKeyCredential(apiKey);
const client = new SearchClient(endpoint, indexName, credential);

const searchResults = await client.search("parking");

for await (const result of searchResults.results) {
  console.log(result.document.hotelName);
}
```

### One helper that supports key or token auth

This is a practical pattern for app code that should use an API key when one is configured and otherwise fall back to Entra ID:

```js
import { AzureKeyCredential } from "@azure/core-auth";
import { DefaultAzureCredential } from "@azure/identity";
import { SearchClient } from "@azure/search-documents";

export function createSearchClient() {
  const endpoint = process.env.AZURE_SEARCH_SERVICE_ENDPOINT;
  const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

  if (!endpoint || !indexName) {
    throw new Error(
      "AZURE_SEARCH_SERVICE_ENDPOINT and AZURE_SEARCH_INDEX_NAME are required",
    );
  }

  if (process.env.AZURE_SEARCH_API_KEY) {
    return new SearchClient(
      endpoint,
      indexName,
      new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
    );
  }

  return new SearchClient(endpoint, indexName, new DefaultAzureCredential());
}
```

## Common Workflows

### Read a token directly from a `TokenCredential`

Use this only when you are building custom HTTP logic or debugging auth flow. Service SDKs usually fetch and refresh tokens for you.

```js
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const token = await credential.getToken("https://storage.azure.com/.default");

if (!token) {
  throw new Error("Credential did not return an access token");
}

console.log(new Date(token.expiresOnTimestamp).toISOString());
```

When you call `getToken()` yourself, use the resource scope that the target service expects, typically ending in `/.default`.

### Rotate an API key without recreating the client

The `AzureKeyCredential` object is designed for this exact workflow.

```bash
export AZURE_SEARCH_API_KEY="<current-key>"
export AZURE_SEARCH_NEXT_API_KEY="<rotated-key>"
```

```js
import { AzureKeyCredential } from "@azure/core-auth";
import { SearchClient } from "@azure/search-documents";

const credential = new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY);
const client = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  credential,
);

credential.update(process.env.AZURE_SEARCH_NEXT_API_KEY);

const searchResults = await client.search("pool");

for await (const result of searchResults.results) {
  console.log(result.document.hotelName);
}
```

Recreate the client only if you also changed endpoint or other client options. A key rotation by itself does not require a new client.

### Work with a named key credential

Use `AzureNamedKeyCredential` when the client needs both a stable name and a secret.

```bash
export AZURE_STORAGE_ACCOUNT_NAME="<storage-account>"
export AZURE_STORAGE_ACCOUNT_KEY="<account-key>"
export AZURE_STORAGE_NEXT_ACCOUNT_KEY="<rotated-account-key>"
```

```js
import { AzureNamedKeyCredential } from "@azure/core-auth";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const nextAccountKey = process.env.AZURE_STORAGE_NEXT_ACCOUNT_KEY;

if (!accountName || !accountKey || !nextAccountKey) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, and AZURE_STORAGE_NEXT_ACCOUNT_KEY are required",
  );
}

const credential = new AzureNamedKeyCredential(accountName, accountKey);

console.log(credential.name);
console.log(credential.key.length);

credential.update(accountName, nextAccountKey);
```

Pass the same credential object into any SDK client that documents `AzureNamedKeyCredential` support, then call `.update(...)` when you rotate the secret.

### Work with a SAS credential

Use `AzureSASCredential` when the service client accepts a SAS token instead of a connection string or account key.

```bash
export AZURE_SERVICE_SAS="<sas-token>"
export AZURE_SERVICE_NEXT_SAS="<next-sas-token>"
```

```js
import { AzureSASCredential } from "@azure/core-auth";

const signature = process.env.AZURE_SERVICE_SAS;
const nextSignature = process.env.AZURE_SERVICE_NEXT_SAS;

if (!signature || !nextSignature) {
  throw new Error("AZURE_SERVICE_SAS and AZURE_SERVICE_NEXT_SAS are required");
}

const credential = new AzureSASCredential(signature);

console.log(credential.signature.length);

credential.update(nextSignature);
```

Pass the SAS token string your target SDK expects. Do not substitute a full resource URL or a connection string where a client constructor expects `AzureSASCredential`.

## Practical Notes

- `@azure/core-auth` is usually a support package. Most application code also installs a service SDK such as `@azure/search-documents`, `@azure/storage-blob`, or `@azure/data-tables`.
- `DefaultAzureCredential` and other token providers come from `@azure/identity`, not from `@azure/core-auth`.
- The key, named-key, and SAS credential classes are long-lived mutable containers. Reuse them and rotate secrets with `.update(...)` instead of rebuilding clients unnecessarily.
- Use the credential type documented by the target service SDK. Azure SDK constructors are not interchangeable across all credential kinds.

## Common Pitfalls

- Expecting `@azure/core-auth` to perform interactive login or token acquisition by itself.
- Importing `DefaultAzureCredential` from the wrong package; it comes from `@azure/identity`.
- Passing a connection string into a constructor that expects `AzureKeyCredential`, `AzureNamedKeyCredential`, `AzureSASCredential`, or a `TokenCredential`.
- Recreating long-lived clients for every request instead of reusing the client and rotating the credential object when the secret changes.
- Calling `getToken()` manually with the wrong scope or without the `/.default` suffix for Azure resource audiences.
- Assuming every Azure SDK client accepts every credential type from this package; check the specific client constructor docs.

## Version Notes For `1.10.1`

- This guide targets `@azure/core-auth` `1.10.1`.
- The day-to-day surface for application code is the shared `TokenCredential` contract plus the `AzureKeyCredential`, `AzureNamedKeyCredential`, and `AzureSASCredential` containers.
- In most apps, token credentials come from `@azure/identity` and the concrete service operations come from another Azure SDK package.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-auth/?view=azure-node-latest`
- Package overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/core-auth-readme?view=azure-node-latest`
- `TokenCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-auth/tokencredential?view=azure-node-latest`
- `AzureKeyCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-auth/azurekeycredential?view=azure-node-latest`
- `AzureNamedKeyCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-auth/azurenamedkeycredential?view=azure-node-latest`
- `AzureSASCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/core-auth/azuresascredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/core-auth`
