---
name: communication-common
description: "Azure Communication Services JavaScript common package for token credentials and communication identifiers shared across ACS client libraries"
metadata:
  languages: "javascript"
  versions: "2.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,communication,communication-common,javascript,authentication,identifiers"
---

# Azure Communication Services Common JavaScript Package

## Golden Rule

Use `@azure/communication-common` for the shared building blocks that other Azure Communication Services SDKs expect: `AzureCommunicationTokenCredential` for user-token auth and `CommunicationIdentifier` helpers for user, phone number, and Teams identities. This package does not create users, issue tokens, or talk to Azure Communication Services by itself.

## Install

Install the shared package at the version your app expects:

```bash
npm install @azure/communication-common@2.4.0
```

You usually install it alongside the ACS client you actually use:

```bash
npm install @azure/communication-common@2.4.0 @azure/communication-chat
```

## What It Provides

- `AzureCommunicationTokenCredential` for passing ACS user access tokens into client constructors
- `CommunicationIdentifier` shapes used by ACS SDKs when you send or receive identities
- `getIdentifierKind(...)` for branching safely on identifier type before reading identifier-specific fields

## Authentication And Setup

The common package wraps a Communication Services user access token. It does not mint that token for you.

Use environment variables instead of hard-coding values:

```bash
export ACS_ENDPOINT="https://<resource-name>.communication.azure.com"
export ACS_USER_TOKEN="<communication-services-user-access-token>"
```

`ACS_ENDPOINT` is your Azure Communication Services resource endpoint. `ACS_USER_TOKEN` must be a user access token returned by your trusted backend or token service.

## Client Initialization

`@azure/communication-common` is normally used when constructing another ACS client.

### Static token credential

Use this when your process already has a valid user access token and you can replace the client when the token expires:

```js
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient } from "@azure/communication-chat";

const endpoint = process.env.ACS_ENDPOINT;
const token = process.env.ACS_USER_TOKEN;

if (!endpoint || !token) {
  throw new Error("ACS_ENDPOINT and ACS_USER_TOKEN are required");
}

const credential = new AzureCommunicationTokenCredential(token);
const chatClient = new ChatClient(endpoint, credential);
```

### Refreshing token credential

Use a refresher when the app should keep the credential alive without rebuilding clients. The refresher must return the raw token string.

```js
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient } from "@azure/communication-chat";

const endpoint = process.env.ACS_ENDPOINT;

if (!endpoint) {
  throw new Error("ACS_ENDPOINT is required");
}

const credential = new AzureCommunicationTokenCredential({
  tokenRefresher: async () => {
    const response = await fetch("/api/acs/token", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed with ${response.status}`);
    }

    const { token } = await response.json();
    return token;
  },
  refreshProactively: true,
});

const chatClient = new ChatClient(endpoint, credential);
```

Keep token minting on a trusted backend. Do not ship your ACS connection string or token-issuing secrets to browser code.

## Core Usage

### Build identifier objects for ACS SDK calls

ACS clients use structured identifier objects, not plain strings.

```js
const participant = {
  id: {
    communicationUserId: process.env.ACS_OTHER_USER_ID,
  },
  displayName: "Support agent",
  shareHistoryTime: new Date(),
};
```

The same pattern applies when you need other identifier types, such as phone numbers or Teams users: pass the identifier object shape the client expects instead of flattening it into a string.

### Inspect identifiers safely

Use `getIdentifierKind(...)` before reading identifier-specific fields.

```js
import { getIdentifierKind } from "@azure/communication-common";

export function normalizeIdentifier(identifier) {
  switch (getIdentifierKind(identifier)) {
    case "communicationUser":
      return {
        kind: "communicationUser",
        value: identifier.communicationUserId,
      };
    case "phoneNumber":
      return {
        kind: "phoneNumber",
        value: identifier.phoneNumber,
      };
    case "microsoftTeamsUser":
      return {
        kind: "microsoftTeamsUser",
        value: identifier.microsoftTeamsUserId,
      };
    default:
      return {
        kind: "unknown",
        value: identifier.id,
      };
  }
}
```

This is the safe pattern when you read participant lists, sender identities, or event payloads from ACS SDKs.

## Configuration Notes

- Reuse one long-lived credential per signed-in user instead of constructing a new credential for every request.
- Pair this package with the ACS client library that actually performs the service operations.
- Use a static token only for short-lived processes or controlled server-side flows; use `tokenRefresher` for interactive apps that need seamless renewal.
- Treat identifier values as typed objects. Check the identifier kind before reading fields such as `communicationUserId` or `phoneNumber`.

## Common Pitfalls

- Passing an ACS connection string where an `AzureCommunicationTokenCredential` or user token is required.
- Returning the entire JSON payload from `tokenRefresher` instead of returning just the token string.
- Creating a fresh credential and service client for every operation instead of reusing them for the current user session.
- Assuming every ACS identity is a `communicationUserId`; phone number and Teams identifiers use different fields.
- Sending token-minting secrets to frontend code instead of refreshing tokens through a backend endpoint.

## Version Notes For 2.4.0

- This guide targets `@azure/communication-common` `2.4.0`.
- The practical surface for most app code is the token credential plus identifier helpers shared by other ACS JavaScript SDKs.
- Token issuance and resource management stay outside this package; keep those concerns in backend code or in the appropriate ACS service SDK.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-common/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/communication-common-readme?view=azure-node-latest`
- `AzureCommunicationTokenCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-common/azurecommunicationtokencredential?view=azure-node-latest`
- `CommunicationIdentifier` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-common/communicationidentifier?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/communication-common`
