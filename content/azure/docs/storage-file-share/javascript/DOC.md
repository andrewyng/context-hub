---
name: storage-file-share
description: "Azure Files JavaScript client library for shares, directories, files, authentication, and file transfer workflows"
metadata:
  languages: "javascript"
  versions: "12.30.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,storage,file-share,javascript,files,smb,entra-id"
---

# Azure Files JavaScript Client

## Golden Rule

Use `@azure/storage-file-share` for Azure Files data-plane operations, keep the account endpoint on `https://<account>.file.core.windows.net`, and build your code around the current `ShareServiceClient` → `ShareClient` → `ShareDirectoryClient` → `ShareFileClient` hierarchy. Do not mix Azure Files code with Blob Storage endpoints or legacy `azure-storage` / `azure-storage-file` examples.

## Install

Pin the package version your project expects:

```bash
npm install @azure/storage-file-share@12.30.0
```

If you authenticate with Microsoft Entra ID, install `@azure/identity` too:

```bash
npm install @azure/storage-file-share@12.30.0 @azure/identity
```

## Prerequisites

- Use the Azure Files endpoint shape `https://<account>.file.core.windows.net`.
- Keep storage credentials in environment variables, not source code.
- If you use `DefaultAzureCredential`, sign in locally with `az login` or run in Azure with a managed identity or another supported Azure credential source.
- For token-based auth, the principal still needs an Azure Files data-plane role assignment.

Recommended environment variables:

```bash
export AZURE_STORAGE_ACCOUNT="<account-name>"
export AZURE_STORAGE_ACCOUNT_URL="https://<account-name>.file.core.windows.net"
export AZURE_STORAGE_CONNECTION_STRING="<connection-string>"
export AZURE_STORAGE_ACCOUNT_KEY="<account-key>"
export AZURE_STORAGE_FILE_SHARE_NAME="agent-docs"
```

## Authentication And Setup

### Microsoft Entra ID With `DefaultAzureCredential`

For Azure-hosted apps and developer environments that already use Azure CLI or workload identity, this is the best default. For Azure Files token auth, set `tokenIntent` explicitly.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ShareServiceClient } from "@azure/storage-file-share";

const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountUrl =
  process.env.AZURE_STORAGE_ACCOUNT_URL ||
  `https://${accountName}.file.core.windows.net`;

const serviceClient = new ShareServiceClient(
  accountUrl,
  new DefaultAzureCredential(),
  { tokenIntent: "backup" },
);
```

### Shared Key Authentication

Use a shared key when your deployment already manages storage account keys directly:

```js
import {
  ShareServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-file-share";

const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

const credential = new StorageSharedKeyCredential(accountName, accountKey);
const serviceClient = new ShareServiceClient(
  `https://${accountName}.file.core.windows.net`,
  credential,
);
```

### Connection String Setup

Connection strings are the quickest setup for scripts and local tools:

```js
import { ShareServiceClient } from "@azure/storage-file-share";

const serviceClient = ShareServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
);
```

## Client Model

The client hierarchy mirrors Azure Files resources:

- `ShareServiceClient`: account-level operations and share access
- `ShareClient`: one file share
- `ShareDirectoryClient`: one directory path inside a share
- `ShareFileClient`: one file path inside a share

Create the service client once and reuse it.

```js
import { DefaultAzureCredential } from "@azure/identity";
import {
  ShareServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-file-share";

export function createShareServiceClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (connectionString) {
    return ShareServiceClient.fromConnectionString(connectionString);
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountUrl =
    process.env.AZURE_STORAGE_ACCOUNT_URL ||
    (accountName
      ? `https://${accountName}.file.core.windows.net`
      : undefined);

  if (!accountUrl) {
    throw new Error(
      "Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_URL",
    );
  }

  if (process.env.AZURE_STORAGE_ACCOUNT_KEY) {
    if (!accountName) {
      throw new Error("AZURE_STORAGE_ACCOUNT is required with account keys");
    }

    return new ShareServiceClient(
      accountUrl,
      new StorageSharedKeyCredential(
        accountName,
        process.env.AZURE_STORAGE_ACCOUNT_KEY,
      ),
    );
  }

  return new ShareServiceClient(accountUrl, new DefaultAzureCredential(), {
    tokenIntent: "backup",
  });
}
```

## Core Usage

### Create A Share, Directory, And File

Create the share and parent directory before writing the file. When you use the low-level file APIs, create the file with its final size before uploading a range.

```js
import { createShareServiceClient } from "./shareClient.js";

const serviceClient = createShareServiceClient();
const shareClient = serviceClient.getShareClient(
  process.env.AZURE_STORAGE_FILE_SHARE_NAME,
);

await shareClient.createIfNotExists();

const directoryClient = shareClient.getDirectoryClient("incoming");
await directoryClient.createIfNotExists();

const fileClient = directoryClient.getFileClient("hello.txt");
const body = Buffer.from("hello from Azure Files\n", "utf8");

await fileClient.create(body.length);
await fileClient.uploadRange(body, 0, body.length);
```

### Download A File

`download(...)` returns a response whose `readableStreamBody` is a Node.js stream.

```js
import { createShareServiceClient } from "./shareClient.js";

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

const serviceClient = createShareServiceClient();
const fileClient = serviceClient
  .getShareClient(process.env.AZURE_STORAGE_FILE_SHARE_NAME)
  .getDirectoryClient("incoming")
  .getFileClient("hello.txt");

const download = await fileClient.download(0);
const content = await streamToBuffer(download.readableStreamBody);

console.log(content.toString("utf8"));
```

### Work Directly With A Known File Path

If you already know the share name and file path, you can build the file client directly from a connection string:

```js
import { ShareFileClient } from "@azure/storage-file-share";

const fileClient = ShareFileClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
  process.env.AZURE_STORAGE_FILE_SHARE_NAME,
  "incoming/hello.txt",
);

const download = await fileClient.download(0);
console.log(download.contentLength);
```

### List Directory Contents

Use the directory client to enumerate files and child directories:

```js
import { createShareServiceClient } from "./shareClient.js";

const serviceClient = createShareServiceClient();
const directoryClient = serviceClient
  .getShareClient(process.env.AZURE_STORAGE_FILE_SHARE_NAME)
  .getDirectoryClient("incoming");

for await (const item of directoryClient.listFilesAndDirectories()) {
  console.log(item.kind, item.name);
}
```

## Configuration Notes

- Prefer `DefaultAzureCredential` for deployed applications when you can assign the required Azure Files data-plane permissions.
- Keep the file service URL explicit in config so the app does not drift to `blob.core.windows.net` or `dfs.core.windows.net`.
- Reuse one long-lived `ShareServiceClient` instead of creating a new client for every operation.
- `uploadRange(...)` is a low-level API: call `create(size)` first and use the correct byte count.
- Create parent directories before writing a file into them.
- Use connection strings or shared keys for simple local tools when Entra ID is not part of the deployment model.

## Common Pitfalls

- Using the Blob or Data Lake endpoint instead of `file.core.windows.net`.
- Copying legacy `azure-storage` or `azure-storage-file` examples instead of the current 12.x client surface.
- Forgetting `tokenIntent: "backup"` when constructing a client with a token credential for Azure Files.
- Trying to upload bytes with `uploadRange(...)` before the file exists.
- Skipping parent directory creation and then writing to a nested file path.
- Installing only `@azure/storage-file-share` and then trying to use `DefaultAzureCredential` without `@azure/identity`.

## Version Notes For 12.30.0

- This guide targets `@azure/storage-file-share` `12.30.0`.
- `@azure/identity` is versioned separately; pin it according to your application's Azure SDK policy.
- If you are updating old Azure Files code, move it to the current `ShareServiceClient` / `ShareClient` / `ShareFileClient` API surface before reusing examples.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-share/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-file-share-readme?view=azure-node-latest`
- `ShareServiceClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-share/shareserviceclient?view=azure-node-latest`
- `ShareClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-share/shareclient?view=azure-node-latest`
- `ShareDirectoryClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-share/sharedirectoryclient?view=azure-node-latest`
- `ShareFileClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-file-share/sharefileclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/storage-file-share`
