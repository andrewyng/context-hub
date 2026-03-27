---
name: arm-appservice
description: "Azure App Service management client for JavaScript for App Service plans, web apps, app settings, and related Microsoft.Web control-plane operations"
metadata:
  languages: "javascript"
  versions: "18.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,app-service,arm,management,web-apps,javascript"
---

# Azure App Service Management Client For JavaScript

## Golden Rule

Use `@azure/arm-appservice` for Azure Resource Manager control-plane work on App Service resources: creating or updating App Service plans, creating web apps, reading site properties, replacing app settings, and managing other `Microsoft.Web` resources.

Do not use this package to deploy your application code or to call your running app. App deployment usually happens through Azure CLI, ZipDeploy, GitHub Actions, or another CI/CD path.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-appservice@18.0.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs a `TokenCredential` and an Azure subscription ID.

For local development, Azure CLI login is usually the quickest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export APP_SERVICE_PLAN_NAME="example-plan"
export WEB_APP_NAME="example-app-12345"
export AZURE_LOCATION="westus2"
```

For CI or deployed workloads, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

This package manages existing Azure resources inside a subscription. Your subscription and target resource group should already exist before you create an App Service plan or site.

## Client Initialization

Create one shared client and reuse it across related management operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { WebSiteManagementClient } from "@azure/arm-appservice";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const planName = process.env.APP_SERVICE_PLAN_NAME ?? "example-plan";
const webAppName = process.env.WEB_APP_NAME ?? "example-app-12345";
const location = process.env.AZURE_LOCATION ?? "westus2";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const appServiceClient = new WebSiteManagementClient(
  credential,
  subscriptionId,
);

export { location, planName, resourceGroupName, webAppName };
```

For everyday App Service automation, most code lives on `appServiceClient.appServicePlans` and `appServiceClient.webApps`.

## Core Usage

### Create an App Service plan

Plan creation is a long-running ARM operation. Use the `AndWait` helper when the next step depends on the finished resource.

For Linux plans, set `reserved: true`.

```js
import {
  appServiceClient,
  location,
  planName,
  resourceGroupName,
} from "./client.js";

const plan = await appServiceClient.appServicePlans.beginCreateOrUpdateAndWait(
  resourceGroupName,
  planName,
  {
    location,
    reserved: true,
    sku: {
      name: "B1",
      tier: "Basic",
      size: "B1",
      capacity: 1,
    },
  },
);

console.log(plan.id);
```

Important details:

- `location` is required.
- `reserved: true` is what marks the plan as Linux.
- Plan creation is not instant; treat it as a long-running operation.

### Create a web app on that plan

Read the App Service plan resource ID from Azure and pass it as `serverFarmId`.

```js
import {
  appServiceClient,
  location,
  planName,
  resourceGroupName,
  webAppName,
} from "./client.js";

const plan = await appServiceClient.appServicePlans.get(
  resourceGroupName,
  planName,
);

const site = await appServiceClient.webApps.beginCreateOrUpdateAndWait(
  resourceGroupName,
  webAppName,
  {
    location,
    serverFarmId: plan.id,
    httpsOnly: true,
    siteConfig: {
      linuxFxVersion: "NODE|20-lts",
      alwaysOn: true,
      ftpsState: "Disabled",
      minTlsVersion: "1.2",
    },
  },
);

console.log(site.defaultHostName);
```

Practical notes:

- `serverFarmId` should come from the actual plan object rather than a string assembled by hand.
- `linuxFxVersion` configures the runtime stack. Keep it aligned with a runtime App Service currently supports.
- `httpsOnly: true` and `minTlsVersion: "1.2"` are safer defaults than leaving them unset.

### List and inspect apps in a resource group

List operations use the Azure SDK paging model, so iterate with `for await`.

```js
import { appServiceClient, resourceGroupName, webAppName } from "./client.js";

for await (const app of appServiceClient.webApps.listByResourceGroup(resourceGroupName)) {
  console.log(app.name, app.state, app.defaultHostName);
}

const app = await appServiceClient.webApps.get(resourceGroupName, webAppName);

console.log(app.kind);
console.log(app.serverFarmId);
```

### Read and replace app settings

`updateApplicationSettings(...)` replaces the app settings payload, so merge with the current values when you only want to change one key.

```js
import { appServiceClient, resourceGroupName, webAppName } from "./client.js";

const current = await appServiceClient.webApps.listApplicationSettings(
  resourceGroupName,
  webAppName,
);

const settings = {
  ...(current.properties ?? {}),
  SCM_DO_BUILD_DURING_DEPLOYMENT: "1",
  WEBSITE_NODE_DEFAULT_VERSION: "~20",
};

const updated = await appServiceClient.webApps.updateApplicationSettings(
  resourceGroupName,
  webAppName,
  {
    properties: settings,
  },
);

console.log(updated.properties?.WEBSITE_NODE_DEFAULT_VERSION);
```

Do not treat this as a patch call. The official operation replaces the application settings of the app.

## Configuration Notes

- `subscriptionId` is required; the client does not infer it from the credential.
- App Service plan and site creation are long-running ARM operations; expect `begin*` methods and use `AndWait` helpers when a later step depends on the created resource.
- `listApplicationSettings()` returns a string-dictionary style result; the actual key-values live under `.properties`.
- This package is for control-plane management. Runtime deployment, build behavior, and startup behavior are still separate App Service concerns.

## Common Pitfalls

- Installing `@azure/arm-appservice` without `@azure/identity`
- Using this package for code deployment instead of Azure resource management
- Forgetting `reserved: true` when creating a Linux App Service plan
- Hard-coding `serverFarmId` instead of using the plan resource ID returned by Azure
- Treating `updateApplicationSettings()` as a patch instead of a replacement
- Forgetting that `begin*` operations are long-running and not immediately complete
- Setting a runtime in `siteConfig.linuxFxVersion` that your target App Service environment does not support

## Version Notes For `18.0.0`

This guide targets `@azure/arm-appservice@18.0.0` and the current Microsoft Learn JavaScript API reference for the package.

If you are copying older examples, confirm the current operation names and model fields on the latest `WebSiteManagementClient` reference before reusing them.

## Official Sources

- https://www.npmjs.com/package/@azure/arm-appservice
- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-appservice/
- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-appservice/websitemanagementclient?view=azure-node-latest
- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-appservice/appserviceplans?view=azure-node-latest
- https://learn.microsoft.com/en-us/javascript/api/@azure/arm-appservice/webapps?view=azure-node-latest
- https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
