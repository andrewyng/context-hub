---
name: arm-compute
description: "Azure Compute management client for JavaScript for working with virtual machines, managed disks, VM scale sets, and other ARM compute resources"
metadata:
  languages: "javascript"
  versions: "23.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,compute,virtual-machines,disks,vmss,javascript"
---

# Azure Compute Management Client For JavaScript

## Golden Rule

Use `@azure/arm-compute` for Azure Resource Manager control-plane operations on compute resources such as virtual machines, managed disks, snapshots, images, and VM scale sets. Authenticate with a `TokenCredential`, construct one shared `ComputeManagementClient` per subscription, and treat most create, update, start, stop, and delete operations as long-running ARM calls that should use `begin...AndWait(...)` helpers.

This is not a guest-level SSH or WinRM library, and it does not replace the Azure network, resource-group, or image configuration you still need around a VM deployment.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-compute@23.3.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The normal setup is `DefaultAzureCredential` plus an explicit Azure subscription ID.

For local development, Azure CLI login is usually the quickest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export AZURE_LOCATION="eastus"
export VM_NAME="example-vm"
export DISK_NAME="example-disk"
```

For CI or deployed workloads, `DefaultAzureCredential` can also use service-principal environment variables:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

If you plan to create or update a virtual machine, you usually also need existing sibling ARM resources such as a resource group and network interface. `@azure/arm-compute` manages the compute resource itself; it does not create VNets, subnets, NICs, or resource groups for you.

## Client Initialization

Create one shared client and reuse it across related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ComputeManagementClient } from "@azure/arm-compute";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const location = process.env.AZURE_LOCATION ?? "eastus";
const vmName = process.env.VM_NAME ?? "example-vm";
const diskName = process.env.DISK_NAME ?? "example-disk";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const computeClient = new ComputeManagementClient(
  credential,
  subscriptionId,
);

export { diskName, location, resourceGroupName, vmName };
```

Most day-to-day work starts from operation groups such as `computeClient.virtualMachines`, `computeClient.disks`, and `computeClient.virtualMachineScaleSets`.

## Core Usage

### Get one virtual machine

Use `get(...)` when you already know the resource group and VM name.

```js
import { computeClient, resourceGroupName, vmName } from "./client.js";

const vm = await computeClient.virtualMachines.get(resourceGroupName, vmName);

console.log(vm.id);
console.log(vm.location);
console.log(vm.hardwareProfile?.vmSize);
console.log(vm.provisioningState);
```

### List virtual machines in a resource group

List operations are paged async iterables, so iterate with `for await`.

```js
import { computeClient, resourceGroupName } from "./client.js";

for await (const vm of computeClient.virtualMachines.list(resourceGroupName)) {
  console.log(vm.name, vm.location, vm.provisioningState);
}
```

### Inspect VM runtime state with instance view

Use `instanceView(...)` when you need power-state and provisioning status details in addition to the ARM resource model.

```js
import { computeClient, resourceGroupName, vmName } from "./client.js";

const instanceView = await computeClient.virtualMachines.instanceView(
  resourceGroupName,
  vmName,
);

for (const status of instanceView.statuses ?? []) {
  console.log(status.code, status.displayStatus);
}
```

### Start a VM or deallocate it to stop compute billing

These are long-running operations.

```js
import { computeClient, resourceGroupName, vmName } from "./client.js";

await computeClient.virtualMachines.beginStartAndWait(resourceGroupName, vmName);

await computeClient.virtualMachines.beginDeallocateAndWait(
  resourceGroupName,
  vmName,
);
```

`beginPowerOffAndWait(...)` stops the guest but does not release compute allocation. Use `beginDeallocateAndWait(...)` when you need compute billing to stop.

### Create a managed disk

Creating a disk is also a long-running ARM operation.

```js
import {
  computeClient,
  diskName,
  location,
  resourceGroupName,
} from "./client.js";

const disk = await computeClient.disks.beginCreateOrUpdateAndWait(
  resourceGroupName,
  diskName,
  {
    location,
    diskSizeGB: 128,
    sku: {
      name: "StandardSSD_LRS",
    },
    creationData: {
      createOption: "Empty",
    },
  },
);

console.log(disk.id);
```

For an empty managed disk, the important fields are `location`, `creationData.createOption`, and `diskSizeGB`.

### Grant and revoke temporary disk access

Use disk SAS access only for time-limited workflows such as export or troubleshooting.

```js
import { computeClient, diskName, resourceGroupName } from "./client.js";

const access = await computeClient.disks.beginGrantAccessAndWait(
  resourceGroupName,
  diskName,
  {
    access: "Read",
    durationInSeconds: 3600,
  },
);

console.log(access.accessSAS);

await computeClient.disks.beginRevokeAccessAndWait(resourceGroupName, diskName);
```

The grant request needs both `access` and `durationInSeconds`.

### Create or update a virtual machine

VM creation depends on more than compute settings alone. In practice, you usually create the resource group and NIC separately, then pass the NIC resource ID into the VM request.

```js
import {
  computeClient,
  location,
  resourceGroupName,
  vmName,
} from "./client.js";

const networkInterfaceId = process.env.NETWORK_INTERFACE_ID;

if (!networkInterfaceId) {
  throw new Error("Set NETWORK_INTERFACE_ID to an existing NIC resource ID.");
}

const vm = await computeClient.virtualMachines.beginCreateOrUpdateAndWait(
  resourceGroupName,
  vmName,
  {
    location,
    hardwareProfile: {
      vmSize: "Standard_D2s_v5",
    },
    storageProfile: {
      imageReference: {
        publisher: "Canonical",
        offer: "0001-com-ubuntu-server-jammy",
        sku: "22_04-lts-gen2",
        version: "latest",
      },
    },
    osProfile: {
      computerName: vmName,
      adminUsername: "azureuser",
      adminPassword: "replace-me",
    },
    networkProfile: {
      networkInterfaces: [
        {
          id: networkInterfaceId,
          primary: true,
        },
      ],
    },
  },
);

console.log(vm.id);
```

Keep the compute, NIC, image, and region settings consistent. ARM validation failures often come from mismatched resource IDs, missing network dependencies, or an incomplete VM payload.

## Configuration Notes

- Reuse one `ComputeManagementClient` instead of creating a new client per call.
- `AZURE_SUBSCRIPTION_ID` is required separately from your credential configuration.
- Treat list results as async iterables, not plain arrays.
- Use `begin...AndWait(...)` helpers when you need the ARM operation to finish before the next step.
- `@azure/arm-compute` is a management-plane package. Use sibling Azure SDKs for resource groups, networks, or guest-level application traffic.
- If you need to discover sizes and regional availability before provisioning, check `computeClient.resourceSkus` in the current Learn reference for the filter shape supported by your package version.

## Common Pitfalls

- Installing `@azure/arm-compute` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Authenticating successfully but forgetting to pass `AZURE_SUBSCRIPTION_ID` into `ComputeManagementClient`.
- Calling a long-running `begin...` operation without waiting for the poller to finish.
- Using `beginPowerOffAndWait(...)` when you really need `beginDeallocateAndWait(...)` to release compute allocation.
- Treating VM creation as a compute-only task even though the VM usually depends on existing network resources.
- Copying older Azure management samples without re-checking model fields and helper names against the `23.3.0` reference.

## Version Notes For `23.3.0`

- This guide targets `@azure/arm-compute` `23.3.0`.
- The examples use `ComputeManagementClient` from `@azure/arm-compute` and `DefaultAzureCredential` from `@azure/identity`.
- If you adapt older Azure SDK samples, re-check the current Learn reference before copying model shapes or poller usage into a project.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-compute-readme?view=azure-node-latest`
- `ComputeManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/computemanagementclient?view=azure-node-latest`
- `VirtualMachines` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/virtualmachines?view=azure-node-latest`
- `Disks` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/disks?view=azure-node-latest`
- `VirtualMachineScaleSets` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/virtualmachinescalesets?view=azure-node-latest`
- `ResourceSkus` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/resourceskus?view=azure-node-latest`
- `Disk` model reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/disk?view=azure-node-latest`
- `CreationData` model reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/creationdata?view=azure-node-latest`
- `GrantAccessData` model reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-compute/grantaccessdata?view=azure-node-latest`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-compute`
