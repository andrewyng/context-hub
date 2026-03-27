---
name: location
description: "AWS SDK for JavaScript v3 Amazon Location client for place search, routing, and tracker position APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,amazon-location,location,maps,routing,geocoding,javascript,nodejs"
---

# `@aws-sdk/client-location`

Use this package for Amazon Location Service APIs in AWS SDK for JavaScript v3. The most common application-side tasks are place search, reverse geocoding, route calculation, and tracker position updates or reads.

This client works with named Amazon Location resources such as place indexes, route calculators, trackers, maps, and geofence collections. Create those resources first in the AWS console or your infrastructure tooling, then use their names in SDK calls.

## Install

```bash
npm install @aws-sdk/client-location
```

Prefer `LocationClient` plus explicit command imports.

## Credentials, region, and required resource names

Use the standard AWS SDK v3 credential chain in Node.js. A local shell setup usually looks like this:

```bash
export AWS_REGION=YOUR_REGION
export AWS_PROFILE=your-profile
# Or set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN instead.

export AWS_LOCATION_INDEX_NAME=your-place-index
export AWS_LOCATION_ROUTE_CALCULATOR_NAME=your-route-calculator
export AWS_LOCATION_TRACKER_NAME=your-tracker
```

Keep the client region aligned with the region that contains your Amazon Location resources. A place index or tracker in one region is not available from a client configured for another region.

## Initialize the client

```javascript
import { LocationClient } from "@aws-sdk/client-location";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Set ${name} before calling Amazon Location.`);
  }

  return value;
}

const location = new LocationClient({
  region: requiredEnv("AWS_REGION"),
});
```

For browser applications, use temporary credentials such as Cognito-backed credentials. Do not ship long-lived AWS access keys to the browser.

## Core usage pattern

The v3 SDK uses client-plus-command calls:

```javascript
import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
} from "@aws-sdk/client-location";

const location = new LocationClient({
  region: process.env.AWS_REGION,
});

const response = await location.send(
  new SearchPlaceIndexForTextCommand({
    IndexName: process.env.AWS_LOCATION_INDEX_NAME,
    Text: "1600 Amphitheatre Parkway, Mountain View, CA",
    MaxResults: 5,
  }),
);

for (const result of response.Results ?? []) {
  console.log(result.Place?.Label, result.Place?.Geometry?.Point);
}
```

Amazon Location coordinate arrays use `[longitude, latitude]`, not `[latitude, longitude]`.

## Common workflows

### Search for an address or point of interest

```javascript
import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
} from "@aws-sdk/client-location";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

const client = new LocationClient({
  region: requiredEnv("AWS_REGION"),
});

const response = await client.send(
  new SearchPlaceIndexForTextCommand({
    IndexName: requiredEnv("AWS_LOCATION_INDEX_NAME"),
    Text: "1 Market St, San Francisco, CA",
    MaxResults: 5,
  }),
);

for (const result of response.Results ?? []) {
  console.log({
    label: result.Place?.Label,
    position: result.Place?.Geometry?.Point,
  });
}
```

Use `MaxResults` to cap the response size when you only need a few candidates.

### Reverse geocode a known position

```javascript
import {
  LocationClient,
  SearchPlaceIndexForPositionCommand,
} from "@aws-sdk/client-location";

const client = new LocationClient({
  region: process.env.AWS_REGION,
});

const response = await client.send(
  new SearchPlaceIndexForPositionCommand({
    IndexName: process.env.AWS_LOCATION_INDEX_NAME,
    Position: [-122.395936, 37.793682],
    MaxResults: 1,
  }),
);

const bestMatch = response.Results?.[0];

console.log(bestMatch?.Place?.Label);
```

The `Position` array is still `[longitude, latitude]`.

### Calculate a route between two coordinates

```javascript
import {
  CalculateRouteCommand,
  LocationClient,
} from "@aws-sdk/client-location";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

const client = new LocationClient({
  region: requiredEnv("AWS_REGION"),
});

const response = await client.send(
  new CalculateRouteCommand({
    CalculatorName: requiredEnv("AWS_LOCATION_ROUTE_CALCULATOR_NAME"),
    DeparturePosition: [-122.335167, 47.608013],
    DestinationPosition: [-122.137469, 47.639721],
    TravelMode: "Car",
  }),
);

console.dir(response.Summary, { depth: null });
console.log(`Leg count: ${response.Legs?.length ?? 0}`);
```

Keep the route calculator name in configuration, not hard-coded in request handlers.

### Update one or more device positions in a tracker

```javascript
import {
  BatchUpdateDevicePositionCommand,
  LocationClient,
} from "@aws-sdk/client-location";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

const client = new LocationClient({
  region: requiredEnv("AWS_REGION"),
});

const response = await client.send(
  new BatchUpdateDevicePositionCommand({
    TrackerName: requiredEnv("AWS_LOCATION_TRACKER_NAME"),
    Updates: [
      {
        DeviceId: "vehicle-42",
        Position: [-122.335167, 47.608013],
        SampleTime: new Date(),
      },
      {
        DeviceId: "vehicle-43",
        Position: [-122.330062, 47.603832],
        SampleTime: new Date(),
      },
    ],
  }),
);

if ((response.Errors ?? []).length > 0) {
  console.error(response.Errors);
}
```

Batch tracker updates can partially fail. Always inspect `Errors` instead of assuming the whole batch succeeded.

### Read the latest known position for tracked devices

```javascript
import {
  BatchGetDevicePositionCommand,
  LocationClient,
} from "@aws-sdk/client-location";

const client = new LocationClient({
  region: process.env.AWS_REGION,
});

const response = await client.send(
  new BatchGetDevicePositionCommand({
    TrackerName: process.env.AWS_LOCATION_TRACKER_NAME,
    DeviceIds: ["vehicle-42", "vehicle-43"],
  }),
);

for (const device of response.DevicePositions ?? []) {
  console.log({
    deviceId: device.DeviceId,
    position: device.Position,
    sampleTime: device.SampleTime,
  });
}
```

Use this call when you need the current position snapshot. Reach for history-specific APIs only when you need older samples.

## Important gotchas

- Resource names are required on most operations. Store `IndexName`, `CalculatorName`, `TrackerName`, `MapName`, or `CollectionName` in configuration and inject them into requests.
- Coordinates are `[longitude, latitude]` throughout the Location APIs.
- Region mismatches are a common cause of confusing failures. Keep the client region and the resource region the same.
- Browser apps need temporary AWS credentials. Do not embed long-lived IAM user keys in frontend code.
- Map APIs return data such as tiles or style descriptors, but this package does not render a map UI by itself.
- Stick to top-level imports from `@aws-sdk/client-location`; do not deep-import from generated SDK internals.

## Related packages

- `@aws-sdk/credential-providers`: useful when you need explicit profile, SSO, Cognito, or assume-role credential configuration.

## Useful links

- AWS SDK for JavaScript v3 package: `https://www.npmjs.com/package/@aws-sdk/client-location`
- AWS SDK v3 client source: `https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-location`
- Amazon Location API Reference: `https://docs.aws.amazon.com/location/latest/APIReference/Welcome.html`
