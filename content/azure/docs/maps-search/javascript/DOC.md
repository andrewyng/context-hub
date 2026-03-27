---
name: maps-search
description: "Azure Maps Search JavaScript SDK preview package for geocoding, reverse geocoding, and batch search"
metadata:
  languages: "javascript"
  versions: "1.0.0-beta.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-maps,search,geocoding,reverse-geocoding,javascript"
---

# @azure/maps-search JavaScript Package Guide

## Golden Rule

Use `@azure/maps-search` for Azure Maps Search data-plane calls, pin the preview version your app expects, and start with subscription-key authentication unless you already have an Azure Maps Microsoft Entra ID setup in place.

This guide is scoped to `@azure/maps-search` `1.0.0-beta.2`.

## Install

Install the package with an explicit prerelease pin:

```bash
npm install @azure/maps-search@1.0.0-beta.2
```

If you plan to use Microsoft Entra ID authentication, install Azure Identity too:

```bash
npm install @azure/maps-search@1.0.0-beta.2 @azure/identity
```

## Environment And Authentication

For the common subscription-key path, keep the Azure Maps key in an environment variable:

```bash
export AZURE_SUBSCRIPTION_KEY="<your-azure-maps-key>"
```

If you are using Microsoft Entra ID, Azure Identity uses the standard environment variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export MAPS_CLIENT_ID="<azure-maps-account-client-id>"
```

The Azure Maps account client ID is separate from the Microsoft Entra application client ID. Keep those values distinct in your app configuration.

### Initialize The Client With A Subscription Key

```js
import { AzureKeyCredential, MapsSearchClient } from "@azure/maps-search";

const client = new MapsSearchClient(
  new AzureKeyCredential(process.env.AZURE_SUBSCRIPTION_KEY),
);
```

For most Node.js services and scripts, reuse one long-lived client instance instead of constructing a new client per request.

## Core Workflows

### Geocode An Address

```js
import { AzureKeyCredential, MapsSearchClient } from "@azure/maps-search";

const client = new MapsSearchClient(
  new AzureKeyCredential(process.env.AZURE_SUBSCRIPTION_KEY),
);

const result = await client.getGeocoding({
  query: "15127 NE 24th Street, Redmond, WA 98052",
});

const firstFeature = result.features?.[0];

if (!firstFeature) {
  console.log("No results");
} else {
  const [longitude, latitude] = firstFeature.geometry.coordinates;
  console.log(firstFeature.properties.address.formattedAddress);
  console.log(longitude, latitude);
}
```

The response shape is feature-based. In the common case, read the first item from `result.features` and then inspect `geometry.coordinates` and `properties.address`.

### Batch Geocoding

Batch geocoding sends a request body with `batchItems`.

```js
import { AzureKeyCredential, MapsSearchClient } from "@azure/maps-search";

const client = new MapsSearchClient(
  new AzureKeyCredential(process.env.AZURE_SUBSCRIPTION_KEY),
);

const result = await client.getGeocodingBatch({
  batchItems: [
    { query: "400 Broad St, Seattle, WA 98109" },
    { query: "15127 NE 24th Street, Redmond, WA 98052" },
  ],
});

for (const item of result.batchItems ?? []) {
  const firstFeature = item.features?.[0];

  if (!firstFeature) {
    continue;
  }

  const [longitude, latitude] = firstFeature.geometry.coordinates;
  console.log(longitude, latitude);
}
```

### Reverse Geocoding

Reverse geocoding expects coordinates in `[longitude, latitude]` order.

```js
import { AzureKeyCredential, MapsSearchClient } from "@azure/maps-search";

const client = new MapsSearchClient(
  new AzureKeyCredential(process.env.AZURE_SUBSCRIPTION_KEY),
);

const result = await client.getReverseGeocoding({
  coordinates: [-122.138679, 47.630356],
});

const firstFeature = result.features?.[0];

if (firstFeature) {
  console.log(firstFeature.properties.address.formattedAddress);
}
```

## Practical Notes

- Use `[longitude, latitude]` everywhere this package accepts coordinates.
- Treat `result.features?.[0]` as the normal starting point for single-result lookups.
- Send batch requests as `{ batchItems: [...] }`, not as a plain array.
- Keep the subscription key in environment variables or a secret manager, not in source control.
- Pin the exact beta version in app code and examples so a later prerelease does not silently change behavior.

## Common Pitfalls

- Installing `@azure/maps-search` without pinning the beta version and then assuming all preview examples still match your installed package.
- Swapping latitude and longitude when calling reverse geocoding.
- Treating batch methods like a list of strings instead of a request body with `batchItems`.
- Mixing this package with older Azure Maps JavaScript examples that use different client packages or older method names.
- Confusing the Azure Maps account client ID with the Microsoft Entra application client ID when setting up identity-based auth.

## Version Notes For `1.0.0-beta.2`

- `1.0.0-beta.2` is a prerelease package; keep your dependency pinned.
- Recheck method names and option shapes against the current Microsoft Learn reference before copying examples from earlier preview material.

## Official Sources Used

- Microsoft Learn API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/maps-search/`
- npm package page: `https://www.npmjs.com/package/@azure/maps-search`
