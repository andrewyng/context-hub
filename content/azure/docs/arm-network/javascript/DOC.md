---
name: arm-network
description: "Azure Network resource management client for JavaScript with practical guidance for authentication, virtual networks, subnets, and public IPs"
metadata:
  languages: "javascript"
  versions: "36.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,network,virtual-network,subnet,public-ip,javascript"
---

# Azure Network Management Client For JavaScript

## Golden Rule

Use `@azure/arm-network` to manage Azure networking resources through Azure Resource Manager. Authenticate with a `TokenCredential`, construct one shared `NetworkManagementClient` with your subscription ID, and treat create, update, and delete calls as long-running operations that usually use `begin...AndWait` helpers.

This is a control-plane SDK for Azure resources such as virtual networks, subnets, public IP addresses, network security groups, load balancers, and related networking objects. It is not a packet-processing or socket library.

## Install

Install the management client and Azure Identity together:

```bash
npm install @azure/arm-network@36.0.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs Azure credentials and a subscription ID. For local development, `DefaultAzureCredential` can use your Azure CLI login. For CI or deployed apps, it can use service principal environment variables.

```bash
az login

export AZURE_SUBSCRIPTION_ID="<subscription-id>"
export RESOURCE_GROUP_NAME="<resource-group>"
export AZURE_LOCATION="eastus"
```

If you use service principal credentials instead of Azure CLI login, set the standard Azure Identity variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

Most `@azure/arm-network` operations also need names for existing Azure resources such as a resource group, virtual network, or subnet. This package manages network resources inside Azure Resource Manager; it does not create the Azure subscription itself, and your resource group should already exist.

## Client Initialization

Create one shared client and reuse it for related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { NetworkManagementClient } from "@azure/arm-network";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const location = process.env.AZURE_LOCATION ?? "eastus";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();
export const networkClient = new NetworkManagementClient(credential, subscriptionId);
export { resourceGroupName, location };
```

## Core Usage

### Get one virtual network

Use `get` when you already know the resource group and virtual network name.

```js
import { networkClient, resourceGroupName } from "./client.js";

const virtualNetwork = await networkClient.virtualNetworks.get(
  resourceGroupName,
  "app-vnet",
);

console.log(virtualNetwork.id);
console.log(virtualNetwork.addressSpace?.addressPrefixes);
```

### List virtual networks in a resource group

List operations are paged async iterables, so iterate with `for await`.

```js
import { networkClient, resourceGroupName } from "./client.js";

for await (const virtualNetwork of networkClient.virtualNetworks.list(resourceGroupName)) {
  console.log(virtualNetwork.name, virtualNetwork.location);
}
```

### Create or update a virtual network

Creating and updating Azure resources is usually a long-running ARM operation. Use the `AndWait` helper when you want the final resource before moving on.

```js
import { networkClient, resourceGroupName, location } from "./client.js";

const virtualNetwork = await networkClient.virtualNetworks.beginCreateOrUpdateAndWait(
  resourceGroupName,
  "app-vnet",
  {
    location,
    addressSpace: {
      addressPrefixes: ["10.20.0.0/16"],
    },
  },
);

console.log(virtualNetwork.id);
```

### Create or update a subnet

Subnets are child resources under a virtual network, so create the virtual network first.

```js
import { networkClient, resourceGroupName } from "./client.js";

const subnet = await networkClient.subnets.beginCreateOrUpdateAndWait(
  resourceGroupName,
  "app-vnet",
  "app-subnet",
  {
    addressPrefix: "10.20.1.0/24",
  },
);

console.log(subnet.id);
```

To retrieve a subnet later:

```js
const subnet = await networkClient.subnets.get(
  resourceGroupName,
  "app-vnet",
  "app-subnet",
);

console.log(subnet.name);
```

### Create a public IP address

Public IP creation is also a long-running operation.

```js
import { networkClient, resourceGroupName, location } from "./client.js";

const publicIp = await networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(
  resourceGroupName,
  "app-public-ip",
  {
    location,
    publicIPAllocationMethod: "Static",
    sku: {
      name: "Standard",
    },
  },
);

console.log(publicIp.id);
console.log(publicIp.ipAddress);
```

### Delete a network resource

Delete operations are long-running too.

```js
import { networkClient, resourceGroupName } from "./client.js";

await networkClient.publicIPAddresses.beginDeleteAndWait(
  resourceGroupName,
  "app-public-ip",
);
```

## Configuration Notes

- Reuse one `NetworkManagementClient` instead of creating a new client for every call.
- Keep `AZURE_SUBSCRIPTION_ID` in app configuration; it is required separately from your Azure credential.
- Use `DefaultAzureCredential` for both local development and deployed workloads so your auth path stays consistent.
- Treat list results as async iterables, not arrays.
- Use `beginCreateOrUpdateAndWait` and `beginDeleteAndWait` when you need the operation to finish before the next step.
- Create parent resources before child resources, such as a virtual network before a subnet.

## Common Pitfalls

- Forgetting to install and configure `@azure/identity` alongside `@azure/arm-network`.
- Passing credentials correctly but omitting the subscription ID when constructing `NetworkManagementClient`.
- Expecting `list(...)` to return a plain array instead of a paged async iterator.
- Calling `beginCreateOrUpdate(...)` without polling the long-running operation to completion.
- Trying to create a subnet before its virtual network exists.
- Mixing up control-plane resource management with data-plane traffic handling.

## Version Notes For 36.0.0

- This guide targets `@azure/arm-network` `36.0.0`.
- The examples use `NetworkManagementClient` from `@azure/arm-network` and `DefaultAzureCredential` from `@azure/identity`.
- If you find older Azure management examples that manually call `beginCreateOrUpdate(...)` and then poll, the `...AndWait` helpers are the simpler current pattern when available.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-network/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-network-readme?view=azure-node-latest`
- `NetworkManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-network/networkmanagementclient?view=azure-node-latest`
- `VirtualNetworks` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-network/virtualnetworks?view=azure-node-latest`
- `Subnets` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-network/subnets?view=azure-node-latest`
- `PublicIPAddresses` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-network/publicipaddresses?view=azure-node-latest`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-network`
