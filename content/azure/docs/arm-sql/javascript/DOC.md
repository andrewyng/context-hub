---
name: arm-sql
description: "Azure SQL management client for JavaScript with practical guidance for authentication, logical servers, databases, and firewall rules"
metadata:
  languages: "javascript"
  versions: "10.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,sql,azure-sql,management,database,javascript"
---

# Azure SQL Management Client For JavaScript

## Golden Rule

Use `@azure/arm-sql` for Azure Resource Manager control-plane work: creating and managing logical servers, databases, firewall rules, and related Azure SQL resources. Do not use it to open SQL connections or execute queries against a database. For application data access, use a SQL Server driver or ORM separately.

The normal management flow is:

1. Authenticate with `@azure/identity`
2. Construct one shared `SqlManagementClient`
3. Call an operation group such as `servers`, `databases`, or `firewallRules`
4. Wait for long-running ARM operations with `begin...AndWait` helpers

## Install

Install the management client and Azure Identity together:

```bash
npm install @azure/arm-sql@10.0.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

`SqlManagementClient` needs a credential and a subscription ID. For local development, Azure CLI login is usually the quickest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="rg-app-prod"
export AZURE_LOCATION="eastus"
```

For CI or deployed applications, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

When you create a logical server, you also need administrator credentials for that Azure SQL server resource:

```bash
export AZURE_SQL_SERVER_NAME="example-sql-server"
export AZURE_SQL_ADMIN_LOGIN="sqladminuser"
export AZURE_SQL_ADMIN_PASSWORD="<strong-password>"
```

This package manages Azure SQL resources inside Azure Resource Manager. Your subscription and resource group should already exist, and the identity you use needs ARM permission on the target scope.

## Client Initialization

Create one shared client and reuse it across related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { SqlManagementClient } from "@azure/arm-sql";

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

export const sqlClient = new SqlManagementClient(credential, subscriptionId);
export { resourceGroupName, location };
```

The main operation groups to expect are:

- `sqlClient.servers`
- `sqlClient.databases`
- `sqlClient.firewallRules`

## Core Usage

### List logical servers in a resource group

List operations are paged async iterables, so iterate with `for await`.

```js
import { sqlClient, resourceGroupName } from "./client.js";

for await (const server of sqlClient.servers.listByResourceGroup(resourceGroupName)) {
  console.log(server.name, server.location, server.fullyQualifiedDomainName);
}
```

### Create or update a logical server

Server provisioning is a long-running ARM operation. Use `beginCreateOrUpdateAndWait(...)` when you need the final resource before moving on.

```js
import { sqlClient, resourceGroupName, location } from "./client.js";

const serverName = process.env.AZURE_SQL_SERVER_NAME;
const administratorLogin = process.env.AZURE_SQL_ADMIN_LOGIN;
const administratorLoginPassword = process.env.AZURE_SQL_ADMIN_PASSWORD;

if (!serverName || !administratorLogin || !administratorLoginPassword) {
  throw new Error(
    "Set AZURE_SQL_SERVER_NAME, AZURE_SQL_ADMIN_LOGIN, and AZURE_SQL_ADMIN_PASSWORD.",
  );
}

const server = await sqlClient.servers.beginCreateOrUpdateAndWait(
  resourceGroupName,
  serverName,
  {
    location,
    administratorLogin,
    administratorLoginPassword,
    version: "12.0",
    minimalTlsVersion: "1.2",
    publicNetworkAccess: "Enabled",
  },
);

console.log(server.name);
console.log(server.fullyQualifiedDomainName);
```

For read-only inspection of one existing server, use `get(...)`:

```js
const server = await sqlClient.servers.get(resourceGroupName, "example-sql-server");

console.log(server.id);
console.log(server.fullyQualifiedDomainName);
```

### Create or update a database

Database create and update operations are also long-running.

```js
import { sqlClient, resourceGroupName, location } from "./client.js";

const serverName = process.env.AZURE_SQL_SERVER_NAME ?? "example-sql-server";

const database = await sqlClient.databases.beginCreateOrUpdateAndWait(
  resourceGroupName,
  serverName,
  "appdb",
  {
    location,
    sku: {
      name: "Basic",
      tier: "Basic",
    },
  },
);

console.log(database.name);
console.log(database.status);
```

Use `get(...)` when you already know the database name:

```js
const database = await sqlClient.databases.get(
  resourceGroupName,
  "example-sql-server",
  "appdb",
);

console.log(database.id);
console.log(database.status);
```

### List databases on a server

```js
import { sqlClient, resourceGroupName } from "./client.js";

const serverName = process.env.AZURE_SQL_SERVER_NAME ?? "example-sql-server";

for await (const database of sqlClient.databases.listByServer(
  resourceGroupName,
  serverName,
)) {
  console.log(database.name, database.status);
}
```

### Create or update a firewall rule

Firewall rules are managed through `sqlClient.firewallRules`. This operation returns the resource directly instead of using a long-running poller.

```js
import { sqlClient, resourceGroupName } from "./client.js";

const serverName = process.env.AZURE_SQL_SERVER_NAME ?? "example-sql-server";

const rule = await sqlClient.firewallRules.createOrUpdate(
  resourceGroupName,
  serverName,
  "office-ip",
  {
    startIpAddress: "203.0.113.10",
    endIpAddress: "203.0.113.10",
  },
);

console.log(rule.name);
console.log(rule.startIpAddress, rule.endIpAddress);
```

To inspect existing rules:

```js
for await (const rule of sqlClient.firewallRules.listByServer(
  resourceGroupName,
  "example-sql-server",
)) {
  console.log(rule.name, rule.startIpAddress, rule.endIpAddress);
}
```

## Configuration Notes

- Keep `AZURE_SUBSCRIPTION_ID` explicit instead of assuming the currently selected Azure CLI subscription is always correct.
- `SqlManagementClient` targets Azure Resource Manager, not the SQL data endpoint.
- Most create and update operations need a resource payload with the expected ARM fields. Check the current model reference before adding optional properties that are not in your working example.
- The package exposes many operation groups beyond the common ones above, including elastic pools, failover groups, long-term retention policies, managed instances, and sync resources.

## Common Pitfalls

- Treating `@azure/arm-sql` as a query client. This SDK provisions and configures Azure SQL resources; it does not run SQL statements.
- Installing `@azure/arm-sql` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Forgetting to await `beginCreateOrUpdateAndWait(...)` for server or database provisioning.
- Passing a server DNS name like `example.database.windows.net` where ARM operations expect the logical server resource name such as `example`.
- Assuming list operations return plain arrays instead of paged async iterables.
- Treating an authentication success from `az login` as proof of write access. ARM RBAC on the subscription or resource group still controls whether create and update calls succeed.
- Using the special firewall rule address `0.0.0.0` without understanding that Azure SQL treats it as the "allow Azure services" behavior.

## Version Notes For `10.0.0`

- This guide targets `@azure/arm-sql` `10.0.0`.
- Prefer the current `@azure/identity` credential flow and promise-based client methods when adapting older Azure SQL management samples.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-sql/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-sql-readme?view=azure-node-latest`
- `SqlManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-sql/sqlmanagementclient?view=azure-node-latest`
- `servers` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-sql/servers?view=azure-node-latest`
- `databases` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-sql/databases?view=azure-node-latest`
- `firewallRules` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-sql/firewallrules?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-sql`
