---
name: controltower
description: "AWS SDK for JavaScript v3 client for AWS Control Tower landing zone, control, baseline, and tagging APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,controltower,javascript,nodejs,governance,landing-zone,organizations"
---

# `@aws-sdk/client-controltower`

Use this package for AWS Control Tower APIs in AWS SDK for JavaScript v3. The most common automation flows are:

- inspect the current landing zone
- list or change enabled controls on an organizational unit (OU)
- manage enabled baselines for an OU

Control Tower mutating APIs are asynchronous. After `EnableControl`, `DisableControl`, `ResetEnabledControl`, `EnableBaseline`, `DisableBaseline`, `ResetEnabledBaseline`, `CreateLandingZone`, `ResetLandingZone`, or `DeleteLandingZone`, store the returned `operationIdentifier` and poll the matching `Get*Operation` API until it reaches a terminal state.

This client is usually used from trusted server-side code with AWS credentials that already have permission to manage Control Tower resources.

## Install

```bash
npm install @aws-sdk/client-controltower
```

Prefer `ControlTowerClient` plus explicit command imports.

## Initialize the client

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=my-controltower-admin

export CONTROLTOWER_TARGET_IDENTIFIER=arn:aws:organizations::123456789012:ou/o-example/ou-abcd-12345678
export CONTROLTOWER_CONTROL_IDENTIFIER=<your-control-arn>
export CONTROLTOWER_BASELINE_IDENTIFIER=<your-baseline-arn>
export CONTROLTOWER_BASELINE_VERSION=<baseline-version>
export CONTROLTOWER_LANDING_ZONE_IDENTIFIER=<optional-landing-zone-arn>
```

Create the client:

```javascript
import { ControlTowerClient } from "@aws-sdk/client-controltower";

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

const controlTower = new ControlTowerClient({
  region: required("AWS_REGION"),
});
```

In Node.js, the default AWS SDK v3 credential provider chain is usually enough if you already configured credentials through environment variables, shared AWS config files, IAM Identity Center, ECS task roles, or EC2 instance metadata.

## What this client covers

`@aws-sdk/client-controltower` covers Control Tower APIs for:

- landing zones: `ListLandingZones`, `GetLandingZone`, `GetLandingZoneOperation`, `ListLandingZoneOperations`, `CreateLandingZone`, `ResetLandingZone`, `DeleteLandingZone`
- controls: `ListEnabledControls`, `GetEnabledControl`, `EnableControl`, `DisableControl`, `ResetEnabledControl`, `GetControlOperation`, `ListControlOperations`
- baselines: `ListBaselines`, `GetBaseline`, `ListEnabledBaselines`, `GetEnabledBaseline`, `EnableBaseline`, `DisableBaseline`, `ResetEnabledBaseline`, `UpdateEnabledBaseline`, `GetBaselineOperation`
- resource tags: `ListTagsForResource`, `TagResource`, `UntagResource`

Most applications only need the control and baseline workflows plus occasional landing zone inspection.

## Common workflows

### Find the current landing zone and inspect its status

`ListLandingZones` returns the landing zone ARN for the managed account. Use that ARN as `landingZoneIdentifier` for `GetLandingZone` and `ResetLandingZone`.

```javascript
import {
  ControlTowerClient,
  GetLandingZoneCommand,
  ListLandingZonesCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const listResult = await controlTower.send(
  new ListLandingZonesCommand({
    maxResults: 1,
  }),
);

const landingZoneIdentifier = listResult.landingZones?.[0];

if (!landingZoneIdentifier) {
  throw new Error("No landing zone ARN returned by ListLandingZones");
}

const detailResult = await controlTower.send(
  new GetLandingZoneCommand({
    landingZoneIdentifier,
  }),
);

console.log({
  landingZoneIdentifier,
  version: detailResult.landingZone?.version,
  latestAvailableVersion: detailResult.landingZone?.latestAvailableVersion,
  status: detailResult.landingZone?.status,
  driftStatus: detailResult.landingZone?.driftStatus?.status,
  remediationTypes: detailResult.landingZone?.remediationTypes,
});
```

The landing zone detail also includes `manifest`, which is the landing zone configuration document returned by the service.

### List enabled controls for one OU

`targetIdentifier` is the OU ARN. `ListEnabledControls` is paginated and can optionally include child OU results.

```javascript
import {
  ControlTowerClient,
  ListEnabledControlsCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const targetIdentifier = process.env.CONTROLTOWER_TARGET_IDENTIFIER;

if (!targetIdentifier) {
  throw new Error("Missing CONTROLTOWER_TARGET_IDENTIFIER");
}

let nextToken;

do {
  const page = await controlTower.send(
    new ListEnabledControlsCommand({
      targetIdentifier,
      includeChildren: false,
      maxResults: 50,
      nextToken,
    }),
  );

  for (const control of page.enabledControls ?? []) {
    console.log({
      enabledControlArn: control.arn,
      controlIdentifier: control.controlIdentifier,
      targetIdentifier: control.targetIdentifier,
      enablementStatus: control.statusSummary?.status,
      driftStatus: control.driftStatusSummary?.driftStatus,
      parentIdentifier: control.parentIdentifier,
    });
  }

  nextToken = page.nextToken;
} while (nextToken);
```

If you only care about a specific control, pass a filter:

```javascript
filter: {
  controlIdentifiers: [process.env.CONTROLTOWER_CONTROL_IDENTIFIER],
}
```

### Enable a control and wait for completion

`EnableControl` returns immediately with an `operationIdentifier`. Poll `GetControlOperation` until the status is `SUCCEEDED` or `FAILED`.

```javascript
import {
  ControlTowerClient,
  EnableControlCommand,
  GetControlOperationCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const controlIdentifier = process.env.CONTROLTOWER_CONTROL_IDENTIFIER;
const targetIdentifier = process.env.CONTROLTOWER_TARGET_IDENTIFIER;

if (!controlIdentifier || !targetIdentifier) {
  throw new Error("Missing CONTROLTOWER_CONTROL_IDENTIFIER or CONTROLTOWER_TARGET_IDENTIFIER");
}

const enableResult = await controlTower.send(
  new EnableControlCommand({
    controlIdentifier,
    targetIdentifier,
    tags: {
      owner: "platform-team",
    },
    // Some controls require parameters.
    // parameters: [{ key: "AllowedRegions", value: ["us-east-1", "us-west-2"] }],
  }),
);

const operationIdentifier = enableResult.operationIdentifier;

if (!operationIdentifier) {
  throw new Error("EnableControl did not return an operation identifier");
}

while (true) {
  const operationResult = await controlTower.send(
    new GetControlOperationCommand({
      operationIdentifier,
    }),
  );

  const operation = operationResult.controlOperation;
  const status = operation?.status;

  console.log({
    operationIdentifier,
    status,
    statusMessage: operation?.statusMessage,
  });

  if (status === "SUCCEEDED") {
    console.log({ enabledControlArn: enableResult.arn });
    break;
  }

  if (status === "FAILED") {
    throw new Error(operation?.statusMessage ?? "EnableControl failed");
  }

  await sleep(5000);
}
```

`EnableControl` only permits strongly recommended and elective controls, except for the Region deny control.

### Disable or reset an enabled control

If you already know the enabled control ARN, use that as `enabledControlIdentifier`. This is the safest identifier to use for `DisableControl` and `ResetEnabledControl`.

```javascript
import {
  ControlTowerClient,
  DisableControlCommand,
  GetControlOperationCommand,
  ListEnabledControlsCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const controlIdentifier = process.env.CONTROLTOWER_CONTROL_IDENTIFIER;
const targetIdentifier = process.env.CONTROLTOWER_TARGET_IDENTIFIER;

if (!controlIdentifier || !targetIdentifier) {
  throw new Error("Missing CONTROLTOWER_CONTROL_IDENTIFIER or CONTROLTOWER_TARGET_IDENTIFIER");
}

const listResult = await controlTower.send(
  new ListEnabledControlsCommand({
    targetIdentifier,
    filter: {
      controlIdentifiers: [controlIdentifier],
    },
    maxResults: 10,
  }),
);

const enabledControlIdentifier = listResult.enabledControls?.[0]?.arn;

if (!enabledControlIdentifier) {
  throw new Error("The requested control is not enabled on this OU");
}

const disableResult = await controlTower.send(
  new DisableControlCommand({
    enabledControlIdentifier,
  }),
);

const operationIdentifier = disableResult.operationIdentifier;

if (!operationIdentifier) {
  throw new Error("DisableControl did not return an operation identifier");
}

while (true) {
  const operationResult = await controlTower.send(
    new GetControlOperationCommand({
      operationIdentifier,
    }),
  );

  const status = operationResult.controlOperation?.status;

  if (status === "SUCCEEDED") {
    break;
  }

  if (status === "FAILED") {
    throw new Error(
      operationResult.controlOperation?.statusMessage ??
        `Control operation ${operationIdentifier} failed`,
    );
  }

  await sleep(5000);
}
```

Use `ResetEnabledControl` with the same `enabledControlIdentifier` if you need to repair drift instead of disabling. It does not work for controls implemented with SCPs.

### List available baselines and enabled baselines

`ListBaselines` returns baseline summaries. `ListEnabledBaselines` returns the baselines currently applied to targets, and supports filtering by target, baseline, parent, status, and drift state.

```javascript
import {
  ControlTowerClient,
  ListBaselinesCommand,
  ListEnabledBaselinesCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const targetIdentifier = process.env.CONTROLTOWER_TARGET_IDENTIFIER;

let baselineToken;

do {
  const page = await controlTower.send(
    new ListBaselinesCommand({
      maxResults: 50,
      nextToken: baselineToken,
    }),
  );

  for (const baseline of page.baselines ?? []) {
    console.log({
      arn: baseline.arn,
      name: baseline.name,
      description: baseline.description,
    });
  }

  baselineToken = page.nextToken;
} while (baselineToken);

if (targetIdentifier) {
  const enabledPage = await controlTower.send(
    new ListEnabledBaselinesCommand({
      filter: {
        targetIdentifiers: [targetIdentifier],
      },
      includeChildren: false,
      maxResults: 50,
    }),
  );

  for (const baseline of enabledPage.enabledBaselines ?? []) {
    console.log({
      enabledBaselineArn: baseline.arn,
      baselineIdentifier: baseline.baselineIdentifier,
      baselineVersion: baseline.baselineVersion,
      targetIdentifier: baseline.targetIdentifier,
      status: baseline.statusSummary?.status,
      inheritanceDriftStatus:
        baseline.driftStatusSummary?.types?.inheritance?.status,
    });
  }
}
```

### Enable a baseline on an OU and poll until complete

`EnableBaseline` requires a baseline ARN, a baseline version, and an OU ARN. The target must be an OU.

```javascript
import {
  ControlTowerClient,
  EnableBaselineCommand,
  GetBaselineOperationCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const baselineIdentifier = process.env.CONTROLTOWER_BASELINE_IDENTIFIER;
const baselineVersion = process.env.CONTROLTOWER_BASELINE_VERSION;
const targetIdentifier = process.env.CONTROLTOWER_TARGET_IDENTIFIER;

if (!baselineIdentifier || !baselineVersion || !targetIdentifier) {
  throw new Error(
    "Missing CONTROLTOWER_BASELINE_IDENTIFIER, CONTROLTOWER_BASELINE_VERSION, or CONTROLTOWER_TARGET_IDENTIFIER",
  );
}

const enableResult = await controlTower.send(
  new EnableBaselineCommand({
    baselineIdentifier,
    baselineVersion,
    targetIdentifier,
    tags: {
      owner: "platform-team",
    },
    // parameters: [{ key: "SomeBaselineParameter", value: "example" }],
  }),
);

const operationIdentifier = enableResult.operationIdentifier;

if (!operationIdentifier) {
  throw new Error("EnableBaseline did not return an operation identifier");
}

while (true) {
  const operationResult = await controlTower.send(
    new GetBaselineOperationCommand({
      operationIdentifier,
    }),
  );

  const operation = operationResult.baselineOperation;
  const status = operation?.status;

  console.log({
    operationIdentifier,
    status,
    statusMessage: operation?.statusMessage,
  });

  if (status === "SUCCEEDED") {
    console.log({ enabledBaselineArn: enableResult.arn });
    break;
  }

  if (status === "FAILED") {
    throw new Error(operation?.statusMessage ?? "EnableBaseline failed");
  }

  await sleep(5000);
}
```

## Practical notes

- Mutating APIs are async. Do not assume the resource is ready immediately after `Enable*`, `Disable*`, `Reset*`, `CreateLandingZone`, `ResetLandingZone`, or `DeleteLandingZone`.
- Use the matching poll API: `GetControlOperation`, `GetBaselineOperation`, or `GetLandingZoneOperation`.
- `ListEnabledControls`, `ListBaselines`, `ListEnabledBaselines`, `ListControlOperations`, `ListLandingZones`, and `ListLandingZoneOperations` all use `nextToken` pagination.
- Control Tower identifiers are ARNs. For control workflows, `targetIdentifier` is an OU ARN. For baseline enablement, only OUs are supported as targets.
- `DisableControl` and `ResetEnabledControl` are easier to drive from `enabledControlIdentifier`, which you can get from `ListEnabledControls` or `EnableControl` output.
- Drift repair uses `ResetEnabledControl`, `ResetEnabledBaseline`, and `ResetLandingZone`.
- Expect service-level errors such as `ConflictException`, `ValidationException`, `AccessDeniedException`, `ResourceNotFoundException`, `ServiceQuotaExceededException`, and `ThrottlingException`.
- Control operation details and landing zone operation details are available for 90 days.

## Minimal landing zone reset example

If the landing zone is drifted and you already know the landing zone ARN, reset it and poll the landing zone operation:

```javascript
import {
  ControlTowerClient,
  GetLandingZoneOperationCommand,
  ResetLandingZoneCommand,
} from "@aws-sdk/client-controltower";

const controlTower = new ControlTowerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const landingZoneIdentifier = process.env.CONTROLTOWER_LANDING_ZONE_IDENTIFIER;

if (!landingZoneIdentifier) {
  throw new Error("Missing CONTROLTOWER_LANDING_ZONE_IDENTIFIER");
}

const resetResult = await controlTower.send(
  new ResetLandingZoneCommand({
    landingZoneIdentifier,
  }),
);

const operationIdentifier = resetResult.operationIdentifier;

if (!operationIdentifier) {
  throw new Error("ResetLandingZone did not return an operation identifier");
}

while (true) {
  const operationResult = await controlTower.send(
    new GetLandingZoneOperationCommand({
      operationIdentifier,
    }),
  );

  const operation = operationResult.operationDetails;
  const status = operation?.status;

  if (status === "SUCCEEDED") {
    break;
  }

  if (status === "FAILED") {
    throw new Error(operation?.statusMessage ?? "ResetLandingZone failed");
  }

  await sleep(10000);
}
```
