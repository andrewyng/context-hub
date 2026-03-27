---
name: amplify
description: "AWS SDK for JavaScript v3 client for managing Amplify Hosting apps, branches, jobs, manual deployments, and custom domains"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,amplify,hosting,javascript,nodejs,deployments,domains"
---

# AWS Amplify SDK for JavaScript (v3)

Use `@aws-sdk/client-amplify` to manage Amplify Hosting resources from JavaScript or TypeScript. This package is the AWS control-plane client for creating apps, managing branches, starting build jobs, handling manual deployments, creating domain associations, and inspecting Amplify state.

This is not the `aws-amplify` frontend package. Use `@aws-sdk/client-amplify` when your code needs to manage Amplify resources from a backend service, CI job, or admin script.

## Golden Rules

- Install `@aws-sdk/client-amplify`, not the legacy `aws-sdk` v2 package, for new JavaScript work.
- Prefer `AmplifyClient` plus individual command imports over the aggregated service client.
- Configure AWS credentials and `region` before creating the client.
- If you create an app connected to GitHub, pass `accessToken`; for other supported repository providers, pass `oauthToken`.
- `StartJobCommand({ jobType: "RELEASE" })` is for apps connected to a repository.
- `StartDeploymentCommand` is for manually deployed apps that are not connected to a Git repository.
- The current Amplify job success status is `"SUCCEED"`, not `"SUCCEEDED"`.

## Install

```bash
npm install @aws-sdk/client-amplify
```

If you want to load named profiles explicitly in code, install the AWS credential helpers you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Amplify is regional. Set AWS credentials and a region before you create the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional

# Only needed when creating or reconnecting a GitHub-backed Amplify app
export GITHUB_TOKEN="..."
```

If you use shared AWS profiles locally, `AWS_PROFILE` also works with the standard AWS SDK for JavaScript v3 credential chain.

## Client Setup

### Minimal Node.js client

```javascript
import { AmplifyClient } from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { AmplifyClient } from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

### Named profile with `fromIni`

```javascript
import { AmplifyClient } from "@aws-sdk/client-amplify";
import { fromIni } from "@aws-sdk/credential-providers";

const amplify = new AmplifyClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if AWS access already comes from environment variables, shared config files, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  AmplifyClient,
  GetAppCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });

const { app } = await amplify.send(
  new GetAppCommand({
    appId: "d1234567890abc",
  }),
);

console.log({
  appId: app?.appId,
  name: app?.name,
  platform: app?.platform,
  defaultDomain: app?.defaultDomain,
});
```

## Common Workflows

### List apps with pagination

```javascript
import {
  AmplifyClient,
  ListAppsCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await amplify.send(
    new ListAppsCommand({
      maxResults: 25,
      nextToken,
    }),
  );

  for (const app of response.apps ?? []) {
    console.log(app.appId, app.name, app.platform, app.defaultDomain);
  }

  nextToken = response.nextToken;
} while (nextToken);
```

`ListAppsCommand`, `ListBranchesCommand`, `ListJobsCommand`, and `ListDomainAssociationsCommand` all use `nextToken` and `maxResults` pagination.

### Create an app connected to a repository

```javascript
import {
  AmplifyClient,
  CreateAppCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });

const { app } = await amplify.send(
  new CreateAppCommand({
    name: "marketing-site",
    repository: "https://github.com/acme/marketing-site",
    accessToken: process.env.GITHUB_TOKEN,
    platform: "WEB",
    enableBranchAutoBuild: true,
    environmentVariables: {
      NODE_ENV: "production",
    },
  }),
);

console.log(app?.appId, app?.defaultDomain);
```

Use `platform: "WEB"` for static apps. The current service model also includes `"WEB_DYNAMIC"` and `"WEB_COMPUTE"` for server-side rendered hosting modes.

If you connect a repository when creating the app, AWS requires repository auth:

- GitHub: use `accessToken`
- other supported providers such as Bitbucket or CodeCommit: use `oauthToken`

### Update app settings

```javascript
import {
  AmplifyClient,
  UpdateAppCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });

const { app } = await amplify.send(
  new UpdateAppCommand({
    appId: "d1234567890abc",
    description: "Production marketing site",
    enableBranchAutoBuild: true,
    environmentVariables: {
      NODE_ENV: "production",
      API_BASE_URL: "https://api.example.com",
    },
  }),
);

console.log(app?.updateTime, app?.environmentVariables);
```

For SSR apps, the current model also exposes `computeRoleArn` on `CreateAppCommand` and `UpdateAppCommand`.

### Create and inspect branches

```javascript
import {
  AmplifyClient,
  CreateBranchCommand,
  ListBranchesCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });
const appId = "d1234567890abc";

await amplify.send(
  new CreateBranchCommand({
    appId,
    branchName: "main",
    stage: "PRODUCTION",
    enableAutoBuild: true,
    displayName: "main",
    environmentVariables: {
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    },
  }),
);

let nextToken;

do {
  const response = await amplify.send(
    new ListBranchesCommand({
      appId,
      maxResults: 25,
      nextToken,
    }),
  );

  for (const branch of response.branches ?? []) {
    console.log(branch.branchName, branch.stage, branch.enableAutoBuild);
  }

  nextToken = response.nextToken;
} while (nextToken);
```

Valid branch stage values in the current model are `PRODUCTION`, `BETA`, `DEVELOPMENT`, `EXPERIMENTAL`, and `PULL_REQUEST`.

### Start a release job and wait for completion

```javascript
import {
  AmplifyClient,
  GetJobCommand,
  StartJobCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startRelease(appId, branchName) {
  const { jobSummary } = await amplify.send(
    new StartJobCommand({
      appId,
      branchName,
      jobType: "RELEASE",
      jobReason: "Deploy latest repository commit",
    }),
  );

  const jobId = jobSummary?.jobId;

  if (!jobId) {
    throw new Error("Amplify did not return a jobId");
  }

  for (;;) {
    const { job } = await amplify.send(
      new GetJobCommand({
        appId,
        branchName,
        jobId,
      }),
    );

    const status = job?.summary?.status;
    console.log(jobId, status);

    if (status === "SUCCEED") {
      return job;
    }

    if (status === "FAILED" || status === "CANCELLED") {
      throw new Error(`Amplify job ${jobId} ended with status ${status}`);
    }

    await sleep(5000);
  }
}

await startRelease("d1234567890abc", "main");
```

The current job type values are `RELEASE`, `RETRY`, `MANUAL`, and `WEB_HOOK`. If you use `RETRY`, you must also pass the existing `jobId`.

### Start a manual deployment from a public ZIP URL

Use this flow for apps that are not connected to a Git repository.

```javascript
import {
  AmplifyClient,
  StartDeploymentCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });

const { jobSummary } = await amplify.send(
  new StartDeploymentCommand({
    appId: "d1234567890abc",
    branchName: "production",
    sourceUrl: "https://downloads.example.com/site-build.zip",
    sourceUrlType: "ZIP",
  }),
);

console.log(jobSummary?.jobId, jobSummary?.status);
```

If you need Amplify-managed upload URLs instead of a public source URL, call `CreateDeploymentCommand` first. The current response shape includes a `jobId` plus either `zipUploadUrl` or `fileUploadUrls`, and the follow-up `StartDeploymentCommand` must happen within 8 hours.

### Create a custom domain association

```javascript
import {
  AmplifyClient,
  CreateDomainAssociationCommand,
  GetDomainAssociationCommand,
} from "@aws-sdk/client-amplify";

const amplify = new AmplifyClient({ region: "us-east-1" });
const appId = "d1234567890abc";
const domainName = "example.com";

await amplify.send(
  new CreateDomainAssociationCommand({
    appId,
    domainName,
    subDomainSettings: [
      { prefix: "", branchName: "main" },
      { prefix: "www", branchName: "main" },
    ],
  }),
);

const { domainAssociation } = await amplify.send(
  new GetDomainAssociationCommand({
    appId,
    domainName,
  }),
);

console.log({
  domainStatus: domainAssociation?.domainStatus,
  statusReason: domainAssociation?.statusReason,
  certificateVerificationDNSRecord:
    domainAssociation?.certificateVerificationDNSRecord,
});
```

Poll `GetDomainAssociationCommand` until `domainStatus` becomes `AVAILABLE`. If the status is `PENDING_VERIFICATION`, read `certificateVerificationDNSRecord` and make sure the required DNS record exists.

## Practical Notes

- This package manages Amplify resources in AWS. It does not build your frontend locally and it does not replace the `aws-amplify` application library.
- Amplify is regional. If your code points at the wrong region, you usually get not-found behavior against the wrong app inventory.
- `StartJobCommand` is the repo-connected CI/CD path. `StartDeploymentCommand` is the manual-deployment path.
- The current platform enum values are `WEB`, `WEB_DYNAMIC`, and `WEB_COMPUTE`.
- `GenerateAccessLogsCommand` returns a pre-signed `logUrl` if you need Amplify access logs.
- `CreateWebhookCommand` and `ListWebhooksCommand` are available when you need a repository webhook outside the default app setup flow.

## Common Pitfalls

- Using `aws-amplify` instead of `@aws-sdk/client-amplify` for control-plane operations.
- Forgetting to set `region`, which commonly leads to looking up the wrong Amplify app or branch.
- Expecting `StartJobCommand` to work for a manually deployed app that is not connected to a repository.
- Expecting `StartDeploymentCommand` to replace the repository-driven build flow for a connected app.
- Checking for `"SUCCEEDED"` instead of the actual Amplify success status `"SUCCEED"`.
- Passing plain `username:password` to `basicAuthCredentials`; the API expects base64-encoded credentials.

## Version Notes

- This guide targets `@aws-sdk/client-amplify` version `3.1007.0`.
- The current package surface includes the command-oriented client pattern shown here, including `CreateAppCommand`, `UpdateAppCommand`, `CreateBranchCommand`, `ListBranchesCommand`, `StartJobCommand`, `GetJobCommand`, `StartDeploymentCommand`, `CreateDomainAssociationCommand`, and `GetDomainAssociationCommand`.
- In the current service model, branch stage values include `PRODUCTION`, `BETA`, `DEVELOPMENT`, `EXPERIMENTAL`, and `PULL_REQUEST`.
- In the current service model, job type values include `RELEASE`, `RETRY`, `MANUAL`, and `WEB_HOOK`.
- AWS currently documents `WEB`, `WEB_DYNAMIC`, and `WEB_COMPUTE` as the relevant Amplify app platform values.

## Official Sources

- AWS SDK for JavaScript v3 Amplify client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/amplify/`
- AWS Amplify API Reference: `https://docs.aws.amazon.com/amplify/latest/APIReference/Welcome.html`
- AWS Amplify `CreateApp` API: `https://docs.aws.amazon.com/amplify/latest/APIReference/API_CreateApp.html`
- AWS Amplify `StartJob` API: `https://docs.aws.amazon.com/amplify/latest/APIReference/API_StartJob.html`
- AWS Amplify `StartDeployment` API: `https://docs.aws.amazon.com/amplify/latest/APIReference/API_StartDeployment.html`
- AWS Amplify `CreateDomainAssociation` API: `https://docs.aws.amazon.com/amplify/latest/APIReference/API_CreateDomainAssociation.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
