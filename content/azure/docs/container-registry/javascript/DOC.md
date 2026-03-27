---
name: container-registry
description: "Azure Container Registry JavaScript client for authenticating with Azure Identity and inspecting repositories, tags, and manifests"
metadata:
  languages: "javascript"
  versions: "1.1.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,acr,container-registry,oci,javascript"
---

# Azure Container Registry JavaScript Client

## Golden Rule

Use `@azure/container-registry` for data-plane access to an existing Azure Container Registry: list repositories, inspect tags and manifests, and work with repository-scoped clients. Do not use it to create registries or manage Azure Resource Manager settings such as SKU, networking, or private endpoints.

## Install

Pin the package version your project expects:

```bash
npm install @azure/container-registry@1.1.2
```

If you authenticate with Microsoft Entra ID through `DefaultAzureCredential`, install `@azure/identity` too:

```bash
npm install @azure/container-registry@1.1.2 @azure/identity
```

## Authentication And Setup

Use the registry login server URL as the endpoint:

```bash
export AZURE_CONTAINER_REGISTRY_ENDPOINT="https://<registry-name>.azurecr.io"
```

For non-interactive authentication with `DefaultAzureCredential`, set the standard Azure service principal environment variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

For local development, `az login` is usually enough for `DefaultAzureCredential` to work without setting all three service principal variables.

### Client Initialization

```js
import { ContainerRegistryClient } from "@azure/container-registry";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_CONTAINER_REGISTRY_ENDPOINT;

if (!endpoint) {
  throw new Error("Missing AZURE_CONTAINER_REGISTRY_ENDPOINT");
}

const credential = new DefaultAzureCredential();
const client = new ContainerRegistryClient(endpoint, credential);
```

Create one shared client for your registry work instead of constructing a new client for every operation.

## Core Usage

### List repositories

`listRepositoryNames()` returns an async iterable:

```js
for await (const repositoryName of client.listRepositoryNames()) {
  console.log(repositoryName);
}
```

### Get a repository client

Repository names are registry-local names such as `hello-world` or `library/hello-world`, not full image references.

```js
const repository = client.getRepository("hello-world");
```

### List tags in a repository

```js
const repository = client.getRepository("hello-world");

for await (const tag of repository.listTagProperties()) {
  console.log(tag.name, tag.digest);
}
```

### List manifests in a repository

```js
const repository = client.getRepository("hello-world");

for await (const manifest of repository.listManifestProperties()) {
  console.log(manifest.digest, manifest.tags);
}
```

### Read one tag

```js
const repository = client.getRepository("hello-world");
const tag = repository.getTag("latest");

const properties = await tag.getProperties();

console.log(properties.name, properties.digest);
```

## Minimal Script

This is a complete script you can drop into a Node app to verify auth and inspect one repository:

```js
import { ContainerRegistryClient } from "@azure/container-registry";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_CONTAINER_REGISTRY_ENDPOINT;
const repositoryName = process.env.AZURE_CONTAINER_REPOSITORY ?? "hello-world";

if (!endpoint) {
  throw new Error("Missing AZURE_CONTAINER_REGISTRY_ENDPOINT");
}

const client = new ContainerRegistryClient(endpoint, new DefaultAzureCredential());
const repository = client.getRepository(repositoryName);

for await (const tag of repository.listTagProperties()) {
  console.log(`${repositoryName}:${tag.name} -> ${tag.digest}`);
}
```

## Configuration Notes

- Pass only the registry login server as the endpoint, for example `https://myregistry.azurecr.io`.
- Keep the repository name separate from the endpoint; pass it later to `getRepository(...)`.
- Use `for await ... of` for repository, tag, and manifest listing methods.
- Reuse a single `ContainerRegistryClient` in long-lived processes.
- Install `@azure/identity` when you use `DefaultAzureCredential`.

## Common Pitfalls

- Using `@azure/container-registry` for Azure management operations. This package is for registry content access, not ARM provisioning.
- Passing a portal URL or a full image reference where the client expects the registry endpoint.
- Passing `myregistry.azurecr.io/hello-world:latest` as the endpoint instead of `https://myregistry.azurecr.io`.
- Treating a tag like `latest` and a manifest digest like `sha256:...` as interchangeable identifiers.
- Forgetting that list operations are async iterables and trying to use them like plain arrays.

## Version Notes For 1.1.2

- This guide targets `@azure/container-registry` `1.1.2`.
- If you are on a newer release, keep the endpoint and authentication patterns the same, but confirm any additional helpers or option names against the current maintainer README and API reference.

## Official Sources

- Maintainer README: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/containerregistry/container-registry/README.md`
- Microsoft Learn quickstart: `https://learn.microsoft.com/en-us/azure/container-registry/quickstart-client-libraries`
- Microsoft Learn overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/container-registry-readme?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/container-registry`
