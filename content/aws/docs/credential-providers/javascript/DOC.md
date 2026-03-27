---
name: credential-providers
description: "AWS SDK for JavaScript v3 credential provider helpers for shared profiles, IAM Identity Center, STS assume-role, web identity, Cognito, and Node.js credential resolution."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,credentials,sts,sso,cognito,iam,javascript,nodejs"
---

# `@aws-sdk/credential-providers`

Use this package when you need to tell an AWS SDK v3 client **how to get credentials**: shared profiles, IAM Identity Center (SSO), STS assume-role, OIDC/web identity, Cognito identity pools, ECS/EC2 metadata, or the same default Node.js credential chain that AWS clients already use.

## Install

Install the provider package plus the AWS service client you actually call:

```bash
npm install @aws-sdk/credential-providers @aws-sdk/client-s3
```

Examples below also use:

```bash
npm install @aws-sdk/client-sts @aws-sdk/s3-request-presigner
```

## Golden Rule

- In Node.js, AWS SDK v3 clients already use the default credential provider chain. You usually do **not** need to pass `credentials` at all.
- Use this package when you need an explicit credential source, a non-default profile, assume-role, SSO, token-file auth, Cognito identity pools, or credentials outside a client constructor.
- `fromIni()`, `fromEnv()`, `fromProcess()`, `fromTokenFile()`, `fromSSO()`, `fromNodeProviderChain()`, `fromContainerMetadata()`, and `fromInstanceMetadata()` are for Node.js.
- `fromCognitoIdentity()`, `fromCognitoIdentityPool()`, `fromWebToken()`, and `fromTemporaryCredentials()` are available in browsers and native apps.

## Default Node.js Behavior

This package powers the default credential behavior for Node.js AWS SDK clients.

If your environment already has working AWS credentials, this is enough:

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await s3.send(new ListBucketsCommand({}));
console.log(result.Buckets);
```

Typical local setup:

```bash
export AWS_REGION=us-east-1

# Option 1: shared profile files
export AWS_PROFILE=dev

# Option 2: static or temporary environment credentials
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

If you want the same default chain explicitly, use `fromNodeProviderChain()`.

## Shared Profiles with `fromIni()`

Use `fromIni()` when credentials come from `~/.aws/credentials`, `~/.aws/config`, an assume-role profile, or a profile selected with `AWS_PROFILE`.

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";

const profile = process.env.AWS_PROFILE ?? "app-dev";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-west-2",
  profile,
  credentials: fromIni({ profile }),
});

const result = await s3.send(new ListBucketsCommand({}));
console.log(result.Buckets);
```

Example shared files:

`~/.aws/credentials`

```ini
[source-user]
aws_access_key_id = AKIAEXAMPLE
aws_secret_access_key = SECRETEXAMPLE
```

`~/.aws/config`

```ini
[profile app-dev]
region = us-west-2
role_arn = arn:aws:iam::123456789012:role/AppDeveloper
source_profile = source-user
```

`fromIni()` also supports `credential_source` for role assumption without a separate `source_profile`:

```ini
[profile app-prod]
region = us-west-2
role_arn = arn:aws:iam::123456789012:role/AppProduction
credential_source = Ec2InstanceMetadata
```

Supported `credential_source` values in maintainer docs are:

- `Ec2InstanceMetadata`
- `Environment`
- `EcsContainer`

Useful options:

- `profile`: profile name to read.
- `filepath`: override `~/.aws/credentials`.
- `configFilepath`: override `~/.aws/config`.
- `mfaCodeProvider`: required when the selected profile requires MFA.
- `clientConfig`: overrides the inner STS or SSO client used to resolve credentials.

As of AWS SDK v3.714.0, AWS clients also accept a top-level `profile` field. In this package version, setting `profile` on the client is often the simplest way to select a profile for that client.

## Fail Fast on Environment Variables with `fromEnv()`

Use `fromEnv()` when you want credentials to come only from environment variables and you want a clear failure if they are missing.

```javascript
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { fromEnv } from "@aws-sdk/credential-providers";

const sts = new STSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromEnv(),
});

const caller = await sts.send(new GetCallerIdentityCommand({}));
console.log(caller.Arn);
```

`fromEnv()` reads:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_CREDENTIAL_EXPIRATION`

## Assume a Role at Runtime with `fromTemporaryCredentials()`

Use `fromTemporaryCredentials()` when you want to assume a role in code instead of relying on a preconfigured profile.

```javascript
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { fromIni, fromTemporaryCredentials } from "@aws-sdk/credential-providers";

const credentials = fromTemporaryCredentials({
  masterCredentials: fromIni({ profile: "source-user" }),
  clientConfig: {
    region: "us-east-1",
  },
  params: {
    RoleArn: "arn:aws:iam::123456789012:role/DeployRole",
    RoleSessionName: "deploy-session",
    DurationSeconds: 3600,
  },
});

const sts = new STSClient({
  region: "us-east-1",
  credentials,
});

const caller = await sts.send(new GetCallerIdentityCommand({}));
console.log(caller.Arn);
```

If your `AssumeRole` request includes `SerialNumber`, also provide `mfaCodeProvider` so the SDK can fetch the MFA code.

## OIDC or IRSA with `fromTokenFile()`

Use `fromTokenFile()` when an OIDC token is on disk and AWS should call `AssumeRoleWithWebIdentity`. This is the pattern used by environments such as Kubernetes service-account token files.

Required inputs come from either function options or environment variables:

```bash
export AWS_REGION=us-west-2
export AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token
export AWS_ROLE_ARN=arn:aws:iam::123456789012:role/EksAppRole
export AWS_ROLE_SESSION_NAME=my-app
```

```javascript
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { fromTokenFile } from "@aws-sdk/credential-providers";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromTokenFile(),
});

const result = await s3.send(new ListBucketsCommand({}));
console.log(result.Buckets);
```

`fromTokenFile()` reads:

- `AWS_WEB_IDENTITY_TOKEN_FILE`
- `AWS_ROLE_ARN`
- `AWS_ROLE_SESSION_NAME`

If the web identity token is already in memory instead of a file on disk, use `fromWebToken()` instead.

## IAM Identity Center with `fromSSO()`

Use `fromSSO()` for a profile that contains direct IAM Identity Center / AWS SSO settings.

First create an SSO-enabled profile with the AWS CLI:

```bash
aws configure sso
```

Example profile:

```ini
[profile my-sso-profile]
sso_account_id = 012345678901
sso_region = us-east-1
sso_role_name = SampleRole
sso_start_url = https://d-abc123.awsapps.com/start
region = us-east-1
```

Then use it explicitly:

```javascript
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { fromSSO } from "@aws-sdk/credential-providers";

const sts = new STSClient({
  region: "us-east-1",
  profile: "my-sso-profile",
  credentials: fromSSO({ profile: "my-sso-profile" }),
});

const caller = await sts.send(new GetCallerIdentityCommand({}));
console.log(caller.Account);
```

Important limitation from maintainer docs: `fromSSO()` only supports profiles that use the SSO credential directly. If the profile assumes another role derived from SSO, use `fromIni()` instead.

To clear local SSO sessions:

```bash
aws sso logout
```

## Browser or Mobile Apps with Cognito Identity Pools

Use `fromCognitoIdentityPool()` when browser or mobile code needs temporary AWS credentials from an identity pool.

```javascript
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: "us-east-1" },
    identityPoolId: "us-east-1:1699ebc0-7900-4099-b910-2df94f52a030",
    logins: {
      "cognito-idp.us-east-1.amazonaws.com/us-east-1_Example": idToken,
    },
  }),
});

const objects = await s3.send(
  new ListObjectsV2Command({
    Bucket: "example-bucket",
    MaxKeys: 10,
  }),
);

console.log(objects.Contents);
```

Maintainer docs note that `fromCognitoIdentityPool()` caches the `GetId` result internally, but does not cache `GetCredentialsForIdentity` results.

If you already have a Cognito `IdentityId`, use `fromCognitoIdentity()` instead of `fromCognitoIdentityPool()`.

## Use the Default Chain Outside a Client Constructor

`fromNodeProviderChain()` is useful when a helper needs credentials directly, such as an S3 presigner.

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

const credentials = fromNodeProviderChain();

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials,
});

const url = await getSignedUrl(
  s3,
  new PutObjectCommand({
    Bucket: "example-bucket",
    Key: "uploads/example.txt",
  }),
  { expiresIn: 900 },
);

console.log(url);
```

## Other Providers You May Need

- `fromProcess()`: reads `credential_process` from shared AWS config and credentials files.
- `fromContainerMetadata()`: reads credentials from the ECS task metadata endpoint.
- `fromInstanceMetadata()`: reads credentials from the EC2 instance metadata service.
- `fromWebToken()`: uses an in-memory web identity token instead of reading a token file.
- `createCredentialChain()`: combines multiple providers or custom async credential functions into one chain.

## Credential Provider Gotchas

- In Node.js, do not add `credentials: fromNodeProviderChain()` unless you actually need an explicit provider. The client already uses that chain by default.
- `~/.aws/credentials` and `~/.aws/config` profiles are not merged. If the same profile appears in both files, the credentials-file version takes precedence.
- Provider `clientConfig` applies to the inner STS, SSO, or Cognito client used to resolve credentials. If you set `clientConfig.region`, that can override region values coming from the selected profile.
- `fromIni()` can use `source_profile`, `credential_source`, SSO-backed profiles, and MFA, but the profile data must be valid AWS shared-config syntax.
- `fromTokenFile()` requires both a web identity token file and a role ARN.
- `fromSSO()` is for direct SSO profiles only; use `fromIni()` when an SSO profile is part of a larger assume-role chain.
- `fromContainerMetadata()` and `fromInstanceMetadata()` are for AWS runtime environments, not local development laptops.
- Credential providers refresh temporary credentials when the credential object includes an `expiration` and the remaining lifetime drops under five minutes.
