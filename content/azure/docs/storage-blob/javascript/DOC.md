---
name: storage-blob
description: "Azure Blob Storage JavaScript client for authentication, container and blob clients, uploads, downloads, and listing workflows"
metadata:
  languages: "javascript"
  versions: "12.31.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,storage,blob,blob-storage,javascript,nodejs,azure-storage,entra-id"
---

# Azure Blob Storage JavaScript Client

## Golden Rule

Use `@azure/storage-blob` for Azure Blob Storage and stay on the current 12.x client surface:

- `BlobServiceClient` for account-level operations
- `ContainerClient` for one container
- `BlobClient` or `BlockBlobClient` for one blob
- `@azure/identity` plus `DefaultAzureCredential` when you want Microsoft Entra ID authentication

Do not copy legacy examples built on the old `azure-storage` package or `createBlobService(...)` API shape.

## Install

Pin the SDK version your application expects:

```bash
npm install @azure/storage-blob@12.31.0
```

If you want Microsoft Entra ID authentication, install `@azure/identity` too:

```bash
npm install @azure/storage-blob@12.31.0 @azure/identity
```

## Prerequisites

- an Azure Storage account or a local Azurite emulator
- a blob endpoint such as `https://<account>.blob.core.windows.net`
- a container name for your application data
- if you use `DefaultAzureCredential`, a local `az login` or another supported developer credential source, or a managed identity in Azure
- Azure RBAC on the storage account or container

Practical role guidance:

- read-only flows such as listing or downloading need `Storage Blob Data Reader` or higher
- upload, create, delete, and tag changes need `Storage Blob Data Contributor` or higher

Use environment variables instead of hard-coding credentials:

```bash
export AZURE_STORAGE_ACCOUNT_NAME="<account-name>"
export AZURE_STORAGE_ACCOUNT_URL="https://<account-name>.blob.core.windows.net"
export AZURE_STORAGE_CONNECTION_STRING="<connection-string>"
export AZURE_STORAGE_ACCOUNT_KEY="<account-key>"
export AZURE_STORAGE_CONTAINER="documents"
```

## Authentication And Setup

The practical auth choices are:

- Microsoft Entra ID with `DefaultAzureCredential`
- a storage account connection string
- a shared account key when you explicitly manage storage keys

### Microsoft Entra ID With `DefaultAzureCredential`

Use this for deployed apps in Azure and for normal local development after a developer sign-in:

```bash
az login
export AZURE_STORAGE_ACCOUNT_URL="https://<account>.blob.core.windows.net"
```

```js
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const accountUrl =
  process.env.AZURE_STORAGE_ACCOUNT_URL ||
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;

if (
  !process.env.AZURE_STORAGE_ACCOUNT_URL &&
  !process.env.AZURE_STORAGE_ACCOUNT_NAME
) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_URL or AZURE_STORAGE_ACCOUNT_NAME is required",
  );
}

const serviceClient = new BlobServiceClient(
  accountUrl,
  new DefaultAzureCredential(),
);
```

If a brand-new RBAC assignment fails, wait a few minutes and retry before changing the auth flow. Azure role assignments can take time to propagate.

### Connection String Or Azurite

Use this for local tools, migration scripts, or environments that already provide a storage connection string:

```js
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is required");
}

const serviceClient = BlobServiceClient.fromConnectionString(connectionString);
```

For local Azurite development, use the documented storage shortcut connection string:

```bash
export AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"
export AZURE_STORAGE_CONTAINER="documents"
```

### Shared Key

Use a shared key only when your application explicitly manages storage account keys:

```js
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!accountName || !accountKey) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY are required",
  );
}

const credential = new StorageSharedKeyCredential(accountName, accountKey);
const serviceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential,
);
```

## Client Initialization

Create one `BlobServiceClient` and derive child clients from it. This keeps auth and transport setup in one place.

```js
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

export function createBlobServiceClient() {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountUrl =
    process.env.AZURE_STORAGE_ACCOUNT_URL ||
    `https://${accountName}.blob.core.windows.net`;

  if (!process.env.AZURE_STORAGE_ACCOUNT_URL && !accountName) {
    throw new Error(
      "Set AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_ACCOUNT_URL, or AZURE_STORAGE_ACCOUNT_NAME",
    );
  }

  if (process.env.AZURE_STORAGE_ACCOUNT_KEY) {
    return new BlobServiceClient(
      accountUrl,
      new StorageSharedKeyCredential(
        accountName,
        process.env.AZURE_STORAGE_ACCOUNT_KEY,
      ),
    );
  }

  return new BlobServiceClient(accountUrl, new DefaultAzureCredential());
}
```

The normal hierarchy is:

- `BlobServiceClient`: account scope
- `ContainerClient`: one container
- `BlobClient`: base blob operations
- `BlockBlobClient`: upload-heavy block blob workflows

## Core Usage

### Create A Container And Upload A Blob

The SDK does not auto-create missing containers. Create them before you upload application data.

```js
import { createBlobServiceClient } from "./blobClient.js";

const serviceClient = createBlobServiceClient();
const containerClient = serviceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER ?? "documents",
);

await containerClient.createIfNotExists();

const blockBlobClient = containerClient.getBlockBlobClient(
  "reports/hello.json",
);

const body = JSON.stringify({
  ok: true,
  generatedAt: new Date().toISOString(),
});

await blockBlobClient.deleteIfExists();
await blockBlobClient.upload(body, Buffer.byteLength(body), {
  blobHTTPHeaders: {
    blobContentType: "application/json",
  },
});
```

For Node.js file uploads, `BlockBlobClient` also exposes `uploadFile(...)` and `uploadStream(...)`.

### Download A Blob

In Node.js, `downloadToBuffer()` is the most direct way to read a smaller blob into memory:

```js
import { createBlobServiceClient } from "./blobClient.js";

const serviceClient = createBlobServiceClient();
const containerClient = serviceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER ?? "documents",
);
const blobClient = containerClient.getBlobClient("reports/hello.json");

const buffer = await blobClient.downloadToBuffer();
console.log(buffer.toString("utf8"));
```

If you are building for a browser runtime, use `download()` and the browser response body helpers instead of Node-only buffer helpers.

### List Blobs

Flat listing returns blobs directly. Hierarchical listing adds prefix entries so you can present virtual folders.

```js
import { createBlobServiceClient } from "./blobClient.js";

const serviceClient = createBlobServiceClient();
const containerClient = serviceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER ?? "documents",
);

for await (const blob of containerClient.listBlobsFlat({
  prefix: "reports/",
})) {
  console.log("blob", blob.name);
}

for await (const item of containerClient.listBlobsByHierarchy("/", {
  prefix: "reports/",
})) {
  if (item.kind === "prefix") {
    console.log("dir", item.name);
  } else {
    console.log("blob", item.name);
  }
}
```

Blob Storage is fundamentally flat. Folder-like behavior comes from blob names plus a delimiter such as `/`.

## Practical Notes

- Prefer `DefaultAzureCredential` unless you specifically need a connection string or account key.
- Keep the account URL explicit in configuration so the app does not drift to the wrong storage account.
- Reuse one `BlobServiceClient` instead of creating a new client for every request.
- Create containers up front with `createIfNotExists()` in bootstrap code; normal reads and writes expect the container to exist.
- Use `BlockBlobClient` for ordinary uploads. Page blobs and append blobs are separate blob types with different clients and semantics.
- Start with the SDK defaults for retry and transfer behavior unless you have evidence that a workload needs tuning.

## Common Pitfalls

- Installing `@azure/storage-blob` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Treating account-level secrets as application defaults when Microsoft Entra ID would work.
- Assuming containers are created automatically.
- Assuming Blob Storage has real directories. It does not; hierarchy comes from naming conventions.
- Using Node-only helpers such as `uploadFile()` or `downloadToBuffer()` in browser code.
- Copying old `azure-storage` examples into a 12.x app.
- Writing to the same blob from multiple processes at the same time without a coordination strategy.

## Version Notes For 12.31.0

- This guide targets `@azure/storage-blob` `12.31.0`.
- `@azure/identity` is versioned separately; pin it according to your application's Azure SDK policy.
- If you copy older Azure Storage samples that use the legacy `azure-storage` package, rewrite them for `BlobServiceClient`, `ContainerClient`, and `BlobClient` before using them with this version.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-blob-readme?view=azure-node-latest`
- `BlobServiceClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blobserviceclient?view=azure-node-latest`
- `ContainerClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient?view=azure-node-latest`
- `BlockBlobClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blockblobclient?view=azure-node-latest`
- Node.js quickstart: `https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs`
- Upload guide: `https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-upload-javascript`
- Download guide: `https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-download-javascript`
- List guide: `https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-list-javascript`
- Azure SDK changelog: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/CHANGELOG.md`
- npm package page: `https://www.npmjs.com/package/@azure/storage-blob`
