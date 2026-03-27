---
name: identity
description: "Azure Identity for JavaScript: DefaultAzureCredential, managed identity, service principals, workload identity, bearer tokens, and auth configuration"
metadata:
  languages: "javascript"
  versions: "4.13.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,identity,azure-identity,javascript,authentication,entra-id,managed-identity,workload-identity"
---

# Azure Identity JavaScript Package Guide

## Golden Rule

Use `@azure/identity` to supply `TokenCredential` instances to Azure SDK clients and other code that needs Microsoft Entra ID access tokens. Start with `DefaultAzureCredential` when the same code must work both locally and in Azure, but prefer a narrower credential such as `ManagedIdentityCredential`, `WorkloadIdentityCredential`, or `ClientSecretCredential` once the runtime environment is fixed.

Authentication only gets you a token. The identity still needs the correct Azure RBAC role or service-specific data-plane permissions on the target resource.

## Install

Install `@azure/identity` and the Azure SDK client package you actually want to call:

```bash
npm install @azure/identity@4.13.0 @azure/storage-blob
```

This package version declares `node >=20.0.0` in its package metadata. It ships ESM, CommonJS, browser builds, and TypeScript types.

If you want `VisualStudioCodeCredential`, install its plugin package too:

```bash
npm install @azure/identity-vscode
```

## Choose The Credential

Use this selection rule:

- `DefaultAzureCredential`: best default when the same code must run locally and in Azure.
- `ManagedIdentityCredential`: best for Azure-hosted production workloads with managed identity enabled.
- `WorkloadIdentityCredential`: best for AKS or other OIDC federation setups using workload identity.
- `ClientSecretCredential`: use for CI or non-Azure hosting when a service principal secret is acceptable.
- `ClientCertificateCredential`: use when the app registration authenticates with a certificate instead of a client secret.
- `AzureCliCredential`, `AzureDeveloperCliCredential`, `DeviceCodeCredential`, or `InteractiveBrowserCredential`: useful for developer tools and scripts that need an interactive or user-bound flow.

If the app always runs in one environment, prefer the specific credential for that environment over `DefaultAzureCredential`.

## DefaultAzureCredential

In `4.13.0`, `DefaultAzureCredential` tries these credential types in this order:

1. `EnvironmentCredential`
2. `WorkloadIdentityCredential`
3. `ManagedIdentityCredential`
4. `VisualStudioCodeCredential`
5. `AzureCliCredential`
6. `AzurePowerShellCredential`
7. `AzureDeveloperCliCredential`
8. Broker credential when `@azure/identity-broker` is installed

Minimal Azure SDK client setup:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const accountUrl = process.env.AZURE_STORAGE_ACCOUNT_URL;

if (!accountUrl) {
  throw new Error("AZURE_STORAGE_ACCOUNT_URL is required");
}

const credential = new DefaultAzureCredential();
const client = new BlobServiceClient(accountUrl, credential);

for await (const container of client.listContainers()) {
  console.log(container.name);
}
```

Good defaults:

- Reuse one credential instance instead of creating a new one for every request.
- Let Azure SDK clients handle scopes automatically unless you are calling `getToken()` yourself.
- Use `DefaultAzureCredential` to get development working quickly, then narrow the credential choice for production.

## Local Development

The easiest path is to authenticate a developer tool that `DefaultAzureCredential` can reuse:

```bash
az login
```

Or:

```bash
azd auth login
```

Then run the same application code:

```bash
export AZURE_STORAGE_ACCOUNT_URL="https://<storage-account>.blob.core.windows.net"
```

```js
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const credential = new DefaultAzureCredential();
const client = new BlobServiceClient(
  process.env.AZURE_STORAGE_ACCOUNT_URL,
  credential,
);

for await (const container of client.listContainers()) {
  console.log(container.name);
}
```

Important behavior:

- `EnvironmentCredential` runs before Azure CLI and Azure Developer CLI credentials, so leftover `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_CLIENT_SECRET` values can unexpectedly override your local CLI login.
- If `AZURE_FEDERATED_TOKEN_FILE` and `AZURE_CLIENT_ID` are set, workload identity is attempted before managed identity.
- `VisualStudioCodeCredential` is part of the default chain in this version, but it requires the `@azure/identity-vscode` plugin package and an Azure sign-in in the VS Code Azure Resources extension.

## Production Credentials

### Managed Identity

Use managed identity for Azure-hosted apps when it is available:

```js
import { ManagedIdentityCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const credential = new ManagedIdentityCredential();
const client = new BlobServiceClient(
  process.env.AZURE_STORAGE_ACCOUNT_URL,
  credential,
);

for await (const container of client.listContainers()) {
  console.log(container.name);
}
```

For a user-assigned managed identity, pass exactly one selector:

```js
import { ManagedIdentityCredential } from "@azure/identity";

const byClientId = new ManagedIdentityCredential("<managed-identity-client-id>");

const byResourceId = new ManagedIdentityCredential({
  resourceId:
    "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<identity-name>",
});
```

Only one of `clientId`, `resourceId`, or `objectId` can be provided.

### Service Principal With A Secret

Use this for CI or non-Azure hosting when a secret is acceptable:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export AZURE_STORAGE_ACCOUNT_URL="https://<storage-account>.blob.core.windows.net"
```

```js
import { BlobServiceClient } from "@azure/storage-blob";
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET,
);

const client = new BlobServiceClient(
  process.env.AZURE_STORAGE_ACCOUNT_URL,
  credential,
);

for await (const container of client.listContainers()) {
  console.log(container.name);
}
```

### Service Principal With A Certificate

For certificate-based app registrations, either use `EnvironmentCredential` with environment variables or construct `ClientCertificateCredential` directly.

Environment-based configuration:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_CERTIFICATE_PATH="/path/to/cert.pem"
export AZURE_CLIENT_CERTIFICATE_PASSWORD="<optional-password>"
export AZURE_CLIENT_SEND_CERTIFICATE_CHAIN=true
```

Explicit credential setup:

```js
import { ClientCertificateCredential } from "@azure/identity";

const credential = new ClientCertificateCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_CERTIFICATE_PATH,
  {
    certificatePassword: process.env.AZURE_CLIENT_CERTIFICATE_PASSWORD,
    sendCertificateChain: true,
  },
);
```

### Workload Identity

Use `WorkloadIdentityCredential` for AKS and other OIDC federation setups:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<app-or-user-assigned-managed-identity-client-id>"
export AZURE_FEDERATED_TOKEN_FILE="/var/run/secrets/azure/tokens/azure-identity-token"
export AZURE_STORAGE_ACCOUNT_URL="https://<storage-account>.blob.core.windows.net"
```

```js
import { BlobServiceClient } from "@azure/storage-blob";
import { WorkloadIdentityCredential } from "@azure/identity";

const credential = new WorkloadIdentityCredential({
  tenantId: process.env.AZURE_TENANT_ID,
  clientId: process.env.AZURE_CLIENT_ID,
  tokenFilePath: process.env.AZURE_FEDERATED_TOKEN_FILE,
});

const client = new BlobServiceClient(
  process.env.AZURE_STORAGE_ACCOUNT_URL,
  credential,
);

for await (const container of client.listContainers()) {
  console.log(container.name);
}
```

`DefaultAzureCredential` can pick up workload identity automatically, but explicit `WorkloadIdentityCredential` is clearer when the deployment model is fixed.

## Non-SDK HTTP Calls

Use `getToken()` when you need an access token for raw HTTP calls:

```js
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const token = await credential.getToken(
  "https://management.azure.com/.default",
);

const response = await fetch(
  "https://management.azure.com/subscriptions?api-version=2020-01-01",
  {
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
  },
);

const data = await response.json();
console.log(data.value);
```

Use `getBearerTokenProvider()` when another library wants a callback that can return a bearer token string:

```js
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";

const credential = new DefaultAzureCredential();
const getAccessToken = getBearerTokenProvider(
  credential,
  "https://cognitiveservices.azure.com/.default",
);

const token = await getAccessToken();
console.log(token);
```

## Config And Auth Details

### Environment Variables

The most common environment variables are:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_CLIENT_CERTIFICATE_PATH`
- `AZURE_CLIENT_CERTIFICATE_PASSWORD`
- `AZURE_CLIENT_SEND_CERTIFICATE_CHAIN`
- `AZURE_FEDERATED_TOKEN_FILE`
- `AZURE_AUTHORITY_HOST`
- `AZURE_ADDITIONALLY_ALLOWED_TENANTS`

`EnvironmentCredential` uses these precedence rules:

- secret-based configuration first
- certificate-based configuration second
- username/password configuration last

Username/password authentication exists but is deprecated because it does not support MFA. Do not start new code with `UsernamePasswordCredential` or `AZURE_USERNAME` plus `AZURE_PASSWORD`.

### Sovereign Clouds

Credentials default to Azure Public Cloud. For Azure Government or another cloud, set the authority explicitly:

```js
import { AzureAuthorityHosts, DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential({
  authorityHost: AzureAuthorityHosts.AzureGovernment,
});
```

Or set it in the environment:

```bash
export AZURE_AUTHORITY_HOST="https://login.microsoftonline.us"
```

### Narrowing The Default Chain

If you want `DefaultAzureCredential` to fail fast or use fewer credential types, set `AZURE_TOKEN_CREDENTIALS`:

```bash
export AZURE_TOKEN_CREDENTIALS=prod
```

Other supported values in this version are `dev` or a single credential name such as `ManagedIdentityCredential`, `AzureCliCredential`, or `WorkloadIdentityCredential`.

You can also require environment variables up front:

```js
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential({
  requiredEnvVars: [
    "AZURE_TENANT_ID",
    "AZURE_CLIENT_ID",
    "AZURE_TOKEN_CREDENTIALS",
  ],
});
```

This throws immediately if any listed environment variable is missing or empty.

## Common Pitfalls

- Authentication succeeds but the service still returns `403` because the principal lacks RBAC or data-plane permissions.
- Local service principal environment variables unexpectedly override Azure CLI or Azure Developer CLI login.
- `DefaultAzureCredential` adds avoidable startup latency in production because it probes multiple credentials before finding the right one.
- Trying to use `VisualStudioCodeCredential` without installing `@azure/identity-vscode`.
- Passing more than one managed identity selector such as `clientId` and `resourceId` at the same time.
- Forgetting the `/.default` suffix when calling `getToken()` for raw HTTP APIs.
- Treating `EnvironmentCredential` as certificate-based when `AZURE_CLIENT_SECRET` is also set; secret-based configuration wins.
- Starting new code with username/password authentication even though it is deprecated and incompatible with MFA.

## Version Notes For `4.13.0`

- This guide targets `@azure/identity` `4.13.0`.
- Package metadata for this release declares `node >=20.0.0`.
- `DefaultAzureCredential` in this release includes `VisualStudioCodeCredential`, `AzureCliCredential`, `AzurePowerShellCredential`, and `AzureDeveloperCliCredential` in addition to environment, workload identity, and managed identity credentials.
- This release also supports `AZURE_TOKEN_CREDENTIALS` for narrowing the default chain and the `requiredEnvVars` option for fail-fast configuration checks.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/`
- Package overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- Credential chains guidance: `https://aka.ms/azsdk/js/identity/credential-chains`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- `ManagedIdentityCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/managedidentitycredential?view=azure-node-latest`
- `ClientSecretCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/clientsecretcredential?view=azure-node-latest`
- `WorkloadIdentityCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/workloadidentitycredential?view=azure-node-latest`
- Azure SDK source README: `https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/identity/identity/README.md`
- npm package page: `https://www.npmjs.com/package/@azure/identity`
