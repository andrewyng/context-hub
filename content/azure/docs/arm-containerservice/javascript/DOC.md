---
name: arm-containerservice
description: "Azure Kubernetes Service management client for JavaScript with practical guidance for authentication, cluster inspection, kubeconfig retrieval, upgrades, and AKS control-plane operations"
metadata:
  languages: "javascript"
  versions: "24.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,aks,kubernetes,containers,arm,management,javascript"
---

# Azure Kubernetes Service Management Client For JavaScript

## Golden Rule

Use `@azure/arm-containerservice` for Azure Resource Manager control-plane operations against Azure Kubernetes Service (AKS), authenticate with a `TokenCredential` such as `DefaultAzureCredential`, and treat most mutating methods as long-running operations that should use `begin...AndWait` helpers. This package manages AKS resources in Azure; it does not replace `kubectl`, the Kubernetes JavaScript client, or in-cluster Kubernetes APIs.

## Install

Install the management client and Azure Identity together:

```bash
npm install @azure/arm-containerservice@24.1.0 @azure/identity
```

If you also need to talk to the Kubernetes API after downloading kubeconfig credentials, use `kubectl` or a separate Kubernetes client library in addition to this package.

## Authentication And Setup

For local development, sign in with Azure CLI:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export AKS_CLUSTER_NAME="example-aks"
export AZURE_LOCATION="eastus"
```

For service principal authentication, set the standard Azure Identity environment variables:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

The credential proves who you are, but the client still needs an explicit subscription ID. Most operations also need an existing resource group and AKS cluster name.

## Client Initialization

Create one shared client and reuse it for related ARM operations:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ContainerServiceClient } from "@azure/arm-containerservice";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const clusterName = process.env.AKS_CLUSTER_NAME;
const location = process.env.AZURE_LOCATION ?? "eastus";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

if (!clusterName) {
  throw new Error("Set AKS_CLUSTER_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const aksClient = new ContainerServiceClient(credential, subscriptionId);
export { resourceGroupName, clusterName, location };
```

Two SDK behaviors matter throughout this package:

- List operations typically return paged async iterables, so use `for await ... of`.
- Create, update, delete, and upgrade flows commonly use long-running ARM operations. Prefer `begin...AndWait` when you need the final state before continuing.

## Core Usage

### List AKS clusters

List all managed clusters in the subscription:

```js
import { aksClient } from "./client.js";

for await (const cluster of aksClient.managedClusters.list()) {
  console.log(cluster.name, cluster.location, cluster.kubernetesVersion);
}
```

List clusters in one resource group:

```js
import { aksClient, resourceGroupName } from "./client.js";

for await (const cluster of aksClient.managedClusters.listByResourceGroup(resourceGroupName)) {
  console.log(cluster.name, cluster.provisioningState);
}
```

### Get one cluster

Use `get` when you already know the resource group and cluster name:

```js
import { aksClient, resourceGroupName, clusterName } from "./client.js";

const cluster = await aksClient.managedClusters.get(resourceGroupName, clusterName);

console.log(cluster.id);
console.log(cluster.kubernetesVersion);
console.log(cluster.dnsPrefix);
console.log(cluster.nodeResourceGroup);
console.log(cluster.provisioningState);
```

Important fields to inspect before writing update code include `agentPoolProfiles`, `identity`, `networkProfile`, and `kubernetesVersion`.

### Retrieve kubeconfig credentials

The management API can return kubeconfig payloads for the cluster. Prefer user credentials unless you explicitly need cluster-admin access.

```js
import { writeFile } from "node:fs/promises";
import { aksClient, resourceGroupName, clusterName } from "./client.js";

const credentials = await aksClient.managedClusters.listClusterUserCredentials(
  resourceGroupName,
  clusterName,
);

const kubeconfigEntry = credentials.kubeconfigs?.[0];

if (!kubeconfigEntry?.value) {
  throw new Error("No kubeconfig returned for this cluster.");
}

const kubeconfig = typeof kubeconfigEntry.value === "string"
  ? Buffer.from(kubeconfigEntry.value, "base64").toString("utf8")
  : Buffer.from(kubeconfigEntry.value).toString("utf8");

await writeFile("./kubeconfig", kubeconfig, { mode: 0o600 });
console.log("Wrote ./kubeconfig");
```

Admin credentials use a separate call:

```js
const adminCredentials = await aksClient.managedClusters.listClusterAdminCredentials(
  resourceGroupName,
  clusterName,
);

console.log(adminCredentials.kubeconfigs?.length ?? 0);
```

After you have kubeconfig, switch to `kubectl` or a Kubernetes client for Kubernetes API work.

### Check available Kubernetes upgrades

Use the upgrade profile before changing cluster version:

```js
import { aksClient, resourceGroupName, clusterName } from "./client.js";

const profile = await aksClient.managedClusters.getUpgradeProfile(
  resourceGroupName,
  clusterName,
);

console.log("Current:", profile.controlPlaneProfile?.kubernetesVersion);

for (const upgrade of profile.controlPlaneProfile?.upgrades ?? []) {
  console.log("Available:", upgrade.kubernetesVersion, upgrade.isPreview);
}
```

Do not guess an upgrade target. Read the upgrade profile first and use a supported version from that response.

### Create or update a cluster

Cluster creation uses a large ARM request body and should be treated like infrastructure code, not a tiny helper call. A minimal starting shape looks like this:

```js
import { aksClient, resourceGroupName, clusterName, location } from "./client.js";

const cluster = await aksClient.managedClusters.beginCreateOrUpdateAndWait(
  resourceGroupName,
  clusterName,
  {
    location,
    dnsPrefix: clusterName,
    identity: {
      type: "SystemAssigned",
    },
    agentPoolProfiles: [
      {
        name: "systempool",
        count: 1,
        vmSize: "Standard_DS2_v2",
        mode: "System",
        type: "VirtualMachineScaleSets",
        osType: "Linux",
      },
    ],
    linuxProfile: {
      adminUsername: "azureuser",
      ssh: {
        publicKeys: [
          {
            keyData: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...",
          },
        ],
      },
    },
    enableRBAC: true,
  },
);

console.log(cluster.id);
```

Before automating cluster creation, verify the exact payload your environment needs for region, network plugin, identity mode, and node-pool shape. For first-time provisioning, many teams prefer Bicep, ARM templates, or Terraform, then use this SDK for inspection and targeted updates.

## Minimal Inspection Script

This is a complete script you can drop into a Node app to verify authentication and inspect one cluster:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ContainerServiceClient } from "@azure/arm-containerservice";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const clusterName = process.env.AKS_CLUSTER_NAME;

if (!subscriptionId || !resourceGroupName || !clusterName) {
  throw new Error(
    "Set AZURE_SUBSCRIPTION_ID, RESOURCE_GROUP_NAME, and AKS_CLUSTER_NAME first.",
  );
}

const client = new ContainerServiceClient(new DefaultAzureCredential(), subscriptionId);
const cluster = await client.managedClusters.get(resourceGroupName, clusterName);

console.log({
  name: cluster.name,
  location: cluster.location,
  kubernetesVersion: cluster.kubernetesVersion,
  provisioningState: cluster.provisioningState,
});
```

## Configuration Notes

- This is an Azure Resource Manager management SDK. It manages AKS resources, not Kubernetes objects inside the cluster.
- Authentication and subscription targeting are separate. A credential can succeed while the client still fails if `AZURE_SUBSCRIPTION_ID` is missing or wrong.
- Reuse one `ContainerServiceClient` in long-lived processes instead of creating a new client for every call.
- Read the current cluster shape before applying updates; AKS payloads are large and partial changes can still depend on networking, identity, and node-pool settings.
- Use `getUpgradeProfile()` before any version change.

## Version Notes For `24.1.0`

- This guide targets `@azure/arm-containerservice` `24.1.0`.
- If you are on a newer release, keep the same authentication and client-construction pattern, but confirm operation names and parameter shapes against the current Microsoft Learn API reference before copying examples.

## Common Pitfalls

- Installing `@azure/arm-containerservice` without `@azure/identity`
- Assuming Azure login also selects the subscription for you inside the SDK
- Treating `begin...` operations as synchronous and forgetting to wait for the final result
- Using this package for Kubernetes in-cluster resources instead of using kubeconfig with `kubectl` or a Kubernetes client
- Requesting admin credentials when user credentials are enough
- Guessing a Kubernetes upgrade target without calling `getUpgradeProfile()` first
- Building create-or-update payloads from incomplete examples without checking your cluster's actual networking and identity requirements

## Recommended Workflow For Coding Agents

1. Confirm the task is AKS management-plane work, not Kubernetes object management.
2. Install `@azure/arm-containerservice@24.1.0` with `@azure/identity`.
3. Authenticate with `DefaultAzureCredential()` and pass `AZURE_SUBSCRIPTION_ID` explicitly.
4. Start with `managedClusters.get()` or `list()` to inspect the current cluster shape.
5. Use `getUpgradeProfile()` before writing any Kubernetes version change.
6. Fetch kubeconfig credentials only when the task needs to hand off to `kubectl` or a Kubernetes client.
7. Treat cluster creation and major updates as infrastructure changes that need a fully specified ARM payload.

## Official Sources Used

- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-containerservice/
- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-containerservice/containerserviceclient?view=azure-node-latest
- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-containerservice/managedclusters?view=azure-node-latest
- https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest
- https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest
- https://www.npmjs.com/package/@azure/arm-containerservice
