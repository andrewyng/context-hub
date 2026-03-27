---
name: arm-deviceprovisioningservices
description: "Azure Device Provisioning Services management client for JavaScript with practical guidance for authentication, provisioning-service lifecycle operations, and shared access key lookup"
metadata:
  languages: "javascript"
  versions: "5.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,device-provisioning-services,arm,iot,dps,javascript"
---

# Azure Device Provisioning Services Management Client For JavaScript

## Golden Rule

Use `@azure/arm-deviceprovisioningservices` for Azure Resource Manager control-plane work on Azure IoT Device Provisioning Service resources: checking service name availability, creating or deleting a provisioning service, listing services in a subscription or resource group, reading service metadata, and retrieving shared access policies.

Do not use this package for device enrollment, registration status queries, or device-side provisioning traffic. Those are Device Provisioning Service data-plane tasks, not ARM management tasks.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-deviceprovisioningservices@5.1.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs a `TokenCredential` and your Azure subscription ID. For local development, Azure CLI login is usually the fastest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export DPS_NAME="example-dps"
export AZURE_LOCATION="eastus"
```

For CI or deployed applications, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

If you plan to create a provisioning service, also provide an existing IoT Hub owner connection string to link the service to a hub:

```bash
export IOTHUB_OWNER_CONNECTION_STRING="HostName=<hub>.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=<key>"
```

This package manages the ARM resource `Microsoft.Devices/provisioningServices`. It does not create the Azure subscription or resource group for you, and provisioning-service creation depends on at least one existing IoT Hub.

## Client Initialization

Create one shared client and reuse it for related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { IotDpsClient } from "@azure/arm-deviceprovisioningservices";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const provisioningServiceName = process.env.DPS_NAME ?? "example-dps";
const location = process.env.AZURE_LOCATION ?? "eastus";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const dpsClient = new IotDpsClient(credential, subscriptionId);
export { location, provisioningServiceName, resourceGroupName };
```

Most provisioning-service lifecycle work starts on `dpsClient.iotDpsResource`.

## Core Usage

### Check provisioning-service name availability

Provisioning-service names must be available before you create the ARM resource.

```js
import { dpsClient, provisioningServiceName } from "./client.js";

const availability = await dpsClient.iotDpsResource.checkProvisioningServiceNameAvailability({
  name: provisioningServiceName,
});

if (!availability.nameAvailable) {
  throw new Error(
    availability.message ??
      `${provisioningServiceName} is unavailable: ${availability.reason ?? "unknown reason"}`,
  );
}
```

### Create or update a provisioning service

Provisioning-service creation is a long-running ARM operation. Use the `AndWait` helper when you need the final resource before moving on.

```js
import {
  dpsClient,
  location,
  provisioningServiceName,
  resourceGroupName,
} from "./client.js";

const iotHubConnectionString = process.env.IOTHUB_OWNER_CONNECTION_STRING;

if (!iotHubConnectionString) {
  throw new Error(
    "Set IOTHUB_OWNER_CONNECTION_STRING before creating a provisioning service.",
  );
}

const service = await dpsClient.iotDpsResource.beginCreateOrUpdateAndWait(
  resourceGroupName,
  provisioningServiceName,
  {
    location,
    sku: {
      name: "S1",
      capacity: 1,
    },
    tags: {
      env: "dev",
      owner: "context-hub",
    },
    properties: {
      state: "Active",
      allocationPolicy: "Hashed",
      iotHubs: [
        {
          connectionString: iotHubConnectionString,
          location,
          allocationWeight: 100,
          applyAllocationPolicy: true,
        },
      ],
    },
  },
);

console.log(service.id);
console.log(service.name);
```

The linked IoT Hub must already exist. This SDK manages the provisioning service resource; it does not provision the backing IoT Hub for you.

### List provisioning services in a resource group

List operations are paged async iterables, so iterate with `for await`.

```js
import { dpsClient, resourceGroupName } from "./client.js";

for await (const service of dpsClient.iotDpsResource.listByResourceGroup(
  resourceGroupName,
)) {
  console.log(service.name, service.location);
}
```

If you need a subscription-wide inventory, use `dpsClient.iotDpsResource.listBySubscription()` instead.

### Get one provisioning service

Use `get()` when you already know the resource group and provisioning-service name.

```js
import {
  dpsClient,
  provisioningServiceName,
  resourceGroupName,
} from "./client.js";

const service = await dpsClient.iotDpsResource.get(
  resourceGroupName,
  provisioningServiceName,
);

console.log(service.id);
console.log(service.location);
console.log(service.tags);
```

### List shared access policies and keys

The management client can return the provisioning service's shared access policies. Use this only for administrative workflows that truly need shared keys.

```js
import {
  dpsClient,
  provisioningServiceName,
  resourceGroupName,
} from "./client.js";

const accessPolicies = await dpsClient.iotDpsResource.listKeys(
  resourceGroupName,
  provisioningServiceName,
);

console.dir(accessPolicies, { depth: null });
```

Prefer Microsoft Entra ID where possible for automation around Azure resources. Treat shared access keys as secrets and rotate them carefully.

### Delete a provisioning service

Delete is also a long-running ARM operation.

```js
import {
  dpsClient,
  provisioningServiceName,
  resourceGroupName,
} from "./client.js";

await dpsClient.iotDpsResource.beginDeleteAndWait(
  resourceGroupName,
  provisioningServiceName,
);
```

## Practical Notes

- Use this package only for ARM resource management. Device enrollment groups, individual enrollments, and runtime registration flows belong to Device Provisioning Service data-plane APIs.
- Treat `beginCreateOrUpdateAndWait(...)` and `beginDeleteAndWait(...)` as the normal pattern when the next step depends on the final ARM state.
- Treat `listByResourceGroup(...)` and `listBySubscription()` results as async iterables, not plain arrays.
- Provisioning-service creation depends on at least one linked IoT Hub. Keep the hub connection string out of source control and inject it through environment variables or secret storage.
- Use `listKeys(...)` only when you explicitly need shared-access administration details. Avoid spreading those keys into application code when an Azure AD-based flow will work.
