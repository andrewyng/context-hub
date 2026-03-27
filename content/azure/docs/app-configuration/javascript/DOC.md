---
name: app-configuration
description: "Azure App Configuration JavaScript client for connecting to a store, authenticating with connection strings or Microsoft Entra ID, and managing settings with labels and revisions"
metadata:
  languages: "javascript"
  versions: "1.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,app-configuration,configuration,javascript,entra-id"
---

# Azure App Configuration JavaScript Client

## Golden Rule

Use `@azure/app-configuration` when your code needs direct data-plane access to an Azure App Configuration store: read settings, write settings, filter by label, and inspect revision history. Prefer Microsoft Entra ID for deployed applications, use a connection string for local development or tightly scoped automation, and reuse one client instead of creating a new client per operation.

## Install

Pin the package version your project expects:

```bash
npm install @azure/app-configuration@1.11.0
```

If you authenticate with Microsoft Entra ID, install `@azure/identity` too:

```bash
npm install @azure/app-configuration@1.11.0 @azure/identity
```

## Authentication And Setup

You usually connect to App Configuration in one of two ways:

- connection string
- store endpoint plus a credential such as `DefaultAzureCredential`

Use environment variables instead of hard-coding secrets:

```bash
export AZURE_APPCONFIG_ENDPOINT="https://<store-name>.azconfig.io"
export AZURE_APPCONFIG_CONNECTION_STRING="Endpoint=https://<store-name>.azconfig.io;Id=...;Secret=..."
```

To retrieve a connection string with Azure CLI:

```bash
az appconfig credential list --name <store-name>
```

### Connection String Client

```js
import { AppConfigurationClient } from "@azure/app-configuration";

const client = new AppConfigurationClient(
  process.env.AZURE_APPCONFIG_CONNECTION_STRING,
);
```

### Microsoft Entra ID Client

```js
import { AppConfigurationClient } from "@azure/app-configuration";
import { DefaultAzureCredential } from "@azure/identity";

const client = new AppConfigurationClient(
  process.env.AZURE_APPCONFIG_ENDPOINT,
  new DefaultAzureCredential(),
);
```

For Entra ID, App Configuration data-plane roles matter:

- `App Configuration Data Reader` for read-only access
- `App Configuration Data Owner` for read/write/delete access

Management roles alone are not enough for SDK data access.

## Client Initialization

Create one shared client for the part of your app that talks to App Configuration.

```js
import { AppConfigurationClient } from "@azure/app-configuration";
import { DefaultAzureCredential } from "@azure/identity";

export const appConfigClient = process.env.AZURE_APPCONFIG_CONNECTION_STRING
  ? new AppConfigurationClient(process.env.AZURE_APPCONFIG_CONNECTION_STRING)
  : new AppConfigurationClient(
      process.env.AZURE_APPCONFIG_ENDPOINT,
      new DefaultAzureCredential(),
    );
```

## Core Usage

### Create a setting

Use `addConfigurationSetting(...)` when the key and label must not already exist.

```js
const created = await appConfigClient.addConfigurationSetting({
  key: "app:theme",
  label: "prod",
  value: "dark",
  contentType: "text/plain",
});

console.log(created.key, created.label, created.value);
```

### Create or replace a setting

Use `setConfigurationSetting(...)` when overwriting an existing key-label pair is acceptable.

```js
const saved = await appConfigClient.setConfigurationSetting({
  key: "app:theme",
  label: "prod",
  value: "light",
  contentType: "text/plain",
  tags: {
    service: "web",
    env: "prod",
  },
});

console.log(saved.etag);
```

### Read one setting

Pass the key and, when you use labels, the exact label you want.

```js
const setting = await appConfigClient.getConfigurationSetting({
  key: "app:theme",
  label: "prod",
});

console.log(setting.value);
```

If you omit `label`, the client reads the unlabeled variant of that key.

### Delete a setting

```js
await appConfigClient.deleteConfigurationSetting({
  key: "app:theme",
  label: "prod",
});
```

### List settings by key and label filters

`listConfigurationSettings(...)` returns an async iterator. Use it directly with `for await`.

```js
for await (const setting of appConfigClient.listConfigurationSettings({
  keyFilter: "app:*",
  labelFilter: "prod",
})) {
  console.log(`${setting.key} (${setting.label}): ${setting.value}`);
}
```

This is the normal way to load a small namespace such as `app:*` for one environment label.

### Inspect revision history

Use `listRevisions(...)` when you need to inspect previous values or labels.

```js
for await (const revision of appConfigClient.listRevisions({
  keyFilter: "app:*",
  labelFilter: "prod",
})) {
  console.log(revision.key, revision.label, revision.value, revision.lastModified);
}
```

## Practical Notes

- Treat the combination of `key` and `label` as the unique identity of a setting.
- Use labels deliberately for environments such as `dev`, `staging`, and `prod`.
- Reuse a long-lived client instead of constructing one for every request.
- Keep connection strings in a secret store, not in source control.
- Prefer Entra ID for deployed services when you can assign the correct data-plane role.

## Common Pitfalls

- Using `addConfigurationSetting(...)` when you really wanted overwrite behavior from `setConfigurationSetting(...)`.
- Forgetting that a labeled setting and an unlabeled setting are different records.
- Installing only `@azure/app-configuration` and then trying to use `DefaultAzureCredential` without `@azure/identity`.
- Assigning control-plane access in Azure and expecting that alone to grant SDK data access.
- Treating this low-level client as a full application configuration loader.

## Version Notes For `1.11.0`

- This guide targets `@azure/app-configuration` `1.11.0`.
- Keep examples on the current `AppConfigurationClient` API surface shown in the Microsoft Learn JavaScript reference.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/app-configuration/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/app-configuration-readme?view=azure-node-latest`
- `AppConfigurationClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/app-configuration/appconfigurationclient?view=azure-node-latest`
- `ConfigurationSetting` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/app-configuration/configurationsetting?view=azure-node-latest`
- Azure App Configuration quickstart for JavaScript: `https://learn.microsoft.com/en-us/azure/azure-app-configuration/quickstart-javascript`
- npm package page: `https://www.npmjs.com/package/@azure/app-configuration`
