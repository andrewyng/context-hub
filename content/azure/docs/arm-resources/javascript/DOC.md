---
name: arm-resources
description: "Azure Resource Manager client for JavaScript for resource groups, generic ARM resources, provider metadata, and tags"
metadata:
  languages: "javascript"
  versions: "7.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,resource-manager,resource-groups,tags,javascript"
---

# Azure Resource Manager Client For JavaScript

## Golden Rule

Use `@azure/arm-resources` for Azure Resource Manager control-plane work such as resource groups, generic ARM resources, provider metadata, and tags. Authenticate with a `TokenCredential` such as `DefaultAzureCredential`, pass your subscription ID explicitly to `ResourceManagementClient`, and use a service-specific management SDK when you need typed operations for a particular Azure service.

This package manages Azure resources through ARM. It is not a data-plane SDK for using the resource itself after it exists.

## Install

Install the management client and Azure Identity together:

```bash
npm install @azure/arm-resources@7.0.0 @azure/identity
```

## Authentication And Setup

For local development, sign in with the Azure CLI and export the subscription you want to manage:

```bash
az login

export AZURE_SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
export RESOURCE_GROUP_NAME="example-rg"
export AZURE_LOCATION="eastus"
```

For CI, automation, or other non-interactive environments, `DefaultAzureCredential` can use the standard service principal variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export AZURE_SUBSCRIPTION_ID="<subscription-id>"
```

## Client Initialization

Create one shared client and reuse it.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const location = process.env.AZURE_LOCATION ?? "eastus";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

const credential = new DefaultAzureCredential();

export const resourceClient = new ResourceManagementClient(
  credential,
  subscriptionId,
);

export { resourceGroupName, location };
```

## Core Usage

### Create or update a resource group

`resourceGroups.createOrUpdate(...)` is the normal entry point for making sure a resource group exists.

```js
import { resourceClient, resourceGroupName, location } from "./client.js";

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const resourceGroup = await resourceClient.resourceGroups.createOrUpdate(
  resourceGroupName,
  {
    location,
    tags: {
      env: "dev",
      owner: "context-hub",
    },
  },
);

console.log(resourceGroup.id);
console.log(resourceGroup.location);
```

### Get one resource group

```js
import { resourceClient, resourceGroupName } from "./client.js";

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const resourceGroup = await resourceClient.resourceGroups.get(resourceGroupName);

console.log(resourceGroup.name);
console.log(resourceGroup.id);
```

### List resource groups in the subscription

List operations are paged async iterables.

```js
import { resourceClient } from "./client.js";

for await (const group of resourceClient.resourceGroups.list()) {
  console.log(group.name, group.location);
}
```

### Discover a provider API version before generic resource calls

Generic ARM resource operations such as `resources.getById(...)` need an explicit provider API version. Read provider metadata first instead of guessing.

```js
import { resourceClient } from "./client.js";

const provider = await resourceClient.providers.get("Microsoft.Storage");

const storageAccountType = provider.resourceTypes?.find(
  (item) => item.resourceType === "storageAccounts",
);

const apiVersion = storageAccountType?.apiVersions?.[0];

if (!apiVersion) {
  throw new Error("Could not determine an API version for Microsoft.Storage/storageAccounts.");
}

console.log(apiVersion);
```

### Read a generic ARM resource by resource ID

Use the generic `resources` operations when you already have a full ARM ID and an API version.

```js
import { resourceClient } from "./client.js";

const resourceId = [
  "/subscriptions",
  process.env.AZURE_SUBSCRIPTION_ID,
  "resourceGroups",
  "example-rg",
  "providers",
  "Microsoft.Storage",
  "storageAccounts",
  "examplestorageacct",
].join("/");

const resource = await resourceClient.resources.getById(resourceId, "2023-05-01");

console.log(resource.id);
console.log(resource.type);
console.log(resource.location);
```

Prefer a typed client such as `@azure/arm-storage` when you need service-specific request bodies or strongly typed resource models.

### Delete a resource group

Delete is a long-running ARM operation, so use the `AndWait` helper when you want completion before the next step.

```js
import { resourceClient, resourceGroupName } from "./client.js";

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

await resourceClient.resourceGroups.beginDeleteAndWait(resourceGroupName);
```

## Configuration Notes

- `AZURE_SUBSCRIPTION_ID` is required when constructing `ResourceManagementClient`; the credential does not supply it.
- `DefaultAzureCredential` is the usual default for local development, CI, managed identity, and workload identity.
- Treat `list()` results as async iterables, not plain arrays.
- Generic `resources.*` calls require a provider API version; check provider metadata first instead of hardcoding blindly.
- ARM authentication success does not imply RBAC authorization for the target subscription or resource group.
- Use this package for control-plane operations; switch to a service-specific management or data-plane SDK when you need richer resource-specific functionality.

## Common Pitfalls

- Installing `@azure/arm-resources` without also installing `@azure/identity`.
- Omitting `AZURE_SUBSCRIPTION_ID` when creating the client.
- Treating paged `list()` results as materialized arrays.
- Using `resources.getById(...)` without a valid provider API version.
- Copying an ARM resource ID incorrectly and then debugging the wrong problem.
- Using the generic ARM client where a typed service SDK would be clearer and safer.

## Version Notes For 7.0.0

- This guide targets `@azure/arm-resources` `7.0.0`.
- The examples use `ResourceManagementClient` from `@azure/arm-resources` and `DefaultAzureCredential` from `@azure/identity`.
- For generic ARM resource operations in this package, keep the provider API version explicit per call.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-resources/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-resources-readme?view=azure-node-latest`
- `ResourceManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-resources/resourcemanagementclient?view=azure-node-latest`
- `ResourceGroups` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-resources/resourcegroups?view=azure-node-latest`
- `Resources` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-resources/resources?view=azure-node-latest`
- `Providers` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-resources/providers?view=azure-node-latest`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-resources`
