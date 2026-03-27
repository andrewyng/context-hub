---
name: storage-file-datalake
description: "Azure Storage Data Lake JavaScript client for ADLS Gen2 filesystem, directory, file, and hierarchical access workflows"
metadata:
  languages: "javascript"
  versions: "12.29.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,storage,data-lake,adls,adls-gen2,javascript,filesystem,files,acl"
---

# Azure Storage Data Lake JavaScript Client

## Golden Rule

Use `@azure/storage-file-datalake` when your code needs Azure Data Lake Storage Gen2 semantics: filesystems, directories, files, and POSIX-style ACLs on a storage account with hierarchical namespace enabled. Build clients against the `dfs` endpoint, prefer Microsoft Entra authentication with `DefaultAzureCredential`, and keep the account URL explicit so your app does not accidentally mix Blob and Data Lake endpoints.

## Install

Pin the SDK version your project expects:

```bash
npm install @azure/storage-file-datalake@12.29.0
```

If you authenticate with Microsoft Entra ID, install `@azure/identity` too:

```bash
npm install @azure/storage-file-datalake@12.29.0 @azure/identity
```

## Prerequisites

- Use a storage account with hierarchical namespace enabled.
- Use the Data Lake DFS endpoint: `https://<account>.dfs.core.windows.net`.
- If you use `DefaultAzureCredential`, sign in locally with `az login` or run in Azure with a managed identity or other supported credential source.
- Keep secrets in environment variables, not source code.

Recommended environment variables:

```bash
export AZURE_STORAGE_ACCOUNT="<account-name>"
export AZURE_STORAGE_ACCOUNT_URL="https://<account-name>.dfs.core.windows.net"
export AZURE_STORAGE_CONNECTION_STRING="<connection-string>"
export AZURE_STORAGE_ACCOUNT_KEY="<account-key>"
```

## Authentication And Setup

### Microsoft Entra ID With `DefaultAzureCredential`

For new applications, this is the best default:

```js
import { DataLakeServiceClient } from "@azure/storage-file-datalake";
import { DefaultAzureCredential } from "@azure/identity";

const accountUrl =
  process.env.AZURE_STORAGE_ACCOUNT_URL ||
  `https://${process.env.AZURE_STORAGE_ACCOUNT}.dfs.core.windows.net`;

const serviceClient = new DataLakeServiceClient(
  accountUrl,
  new DefaultAzureCredential(),
);
```

### Shared Key Authentication

Use a shared key only when your deployment already depends on account keys:

```js
import {
  DataLakeServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-file-datalake";

const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

const credential = new StorageSharedKeyCredential(accountName, accountKey);
const serviceClient = new DataLakeServiceClient(
  `https://${accountName}.dfs.core.windows.net`,
  credential,
);
```

### Connection String Setup

Connection strings are also supported:

```js
import { DataLakeServiceClient } from "@azure/storage-file-datalake";

const serviceClient = DataLakeServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
);
```

## Client Model

The client hierarchy mirrors the storage hierarchy:

- `DataLakeServiceClient`: account-level operations and filesystem access
- `FileSystemClient`: one filesystem inside the storage account
- `DataLakeDirectoryClient`: one directory path
- `DataLakeFileClient`: one file path

Create the service client once and reuse it.

```js
import {
  DataLakeServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-file-datalake";
import { DefaultAzureCredential } from "@azure/identity";

export function createDataLakeServiceClient() {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return DataLakeServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountUrl =
    process.env.AZURE_STORAGE_ACCOUNT_URL ||
    `https://${accountName}.dfs.core.windows.net`;

  if (process.env.AZURE_STORAGE_ACCOUNT_KEY) {
    return new DataLakeServiceClient(
      accountUrl,
      new StorageSharedKeyCredential(
        accountName,
        process.env.AZURE_STORAGE_ACCOUNT_KEY,
      ),
    );
  }

  return new DataLakeServiceClient(accountUrl, new DefaultAzureCredential());
}
```

## Core Usage

### Create A Filesystem, Directory, And File

Use `createIfNotExists()` for idempotent setup code. When you append bytes manually, call `flush()` to commit them.

```js
import { createDataLakeServiceClient } from "./dataLakeClient.js";

const serviceClient = createDataLakeServiceClient();
const fileSystemClient = serviceClient.getFileSystemClient("raw");

await fileSystemClient.createIfNotExists();

const directoryClient = fileSystemClient.getDirectoryClient("incoming/2026/03/13");
await directoryClient.createIfNotExists();

const fileClient = fileSystemClient.getFileClient(
  "incoming/2026/03/13/events.jsonl",
);

const body = Buffer.from('{"id":1}\n{"id":2}\n', "utf8");

await fileClient.create();
await fileClient.append(body, 0, body.length);
await fileClient.flush(body.length);
```

### Download A File

`read()` returns a response whose `readableStreamBody` is a Node.js stream.

```js
import { createDataLakeServiceClient } from "./dataLakeClient.js";

function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    readableStream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
}

const serviceClient = createDataLakeServiceClient();

const fileClient = serviceClient
  .getFileSystemClient("raw")
  .getFileClient("incoming/2026/03/13/events.jsonl");

const download = await fileClient.read();
const content = await streamToBuffer(download.readableStreamBody);

console.log(content.toString("utf8"));
```

### List Paths

Use `listPaths(...)` to enumerate directories and files relative to a filesystem:

```js
import { createDataLakeServiceClient } from "./dataLakeClient.js";

const serviceClient = createDataLakeServiceClient();
const fileSystemClient = serviceClient.getFileSystemClient("raw");

for await (const path of fileSystemClient.listPaths({
  path: "incoming",
  recursive: true,
})) {
  console.log(path.name, path.isDirectory);
}
```

## Configuration Notes

- Prefer `DefaultAzureCredential` unless you specifically need a connection string or account key.
- Keep the DFS account URL explicit in config so the app does not drift to `blob.core.windows.net`.
- Reuse one `DataLakeServiceClient` instead of creating a new client for every operation.
- Use `createIfNotExists()` for bootstrap or one-time provisioning paths, not as a substitute for normal application flow control.
- If you append bytes with `append(...)`, call `flush(...)` or the file contents are not committed.
- Use the Data Lake directory and file clients, not Blob clients, when you need hierarchical paths or POSIX-style ACL behavior.

## Common Pitfalls

- Using `https://<account>.blob.core.windows.net` instead of the DFS endpoint.
- Forgetting that hierarchical namespace must be enabled for Data Lake directory and ACL features.
- Installing `@azure/storage-file-datalake` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Assuming Blob and Data Lake examples are interchangeable; many account concepts overlap, but the endpoint and directory semantics do not.
- Appending data without calling `flush(...)`.
- Hard-coding secrets instead of reading them from environment or managed identity.
- Treating Azure RBAC and POSIX ACLs as the same control plane. A principal can authenticate successfully and still fail on a path because of Data Lake ACLs.

## Version Notes For 12.29.0

- This guide targets `@azure/storage-file-datalake` `12.29.0`.
- `@azure/identity` is versioned separately; pin it according to your application's Azure SDK policy.
- If you copy older Azure Storage examples that only show Blob clients or Blob endpoints, rewrite them for `DataLakeServiceClient` and the DFS endpoint before using them with this package.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-datalake/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-file-datalake-readme?view=azure-node-latest`
- `DataLakeServiceClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-datalake/datalakeserviceclient?view=azure-node-latest`
- `DataLakeFileClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-datalake/datalakefileclient?view=azure-node-latest`
- `FileSystemClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-datalake/filesystemclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/storage-file-datalake`
