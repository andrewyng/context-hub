---
name: ecr
description: "Amazon ECR client for JavaScript with repository management, image metadata queries, and registry auth for Docker workflows"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,ecr,javascript,docker,containers,registry,images"
---

# Amazon ECR JavaScript Guide

## Golden Rule

Use `@aws-sdk/client-ecr` for Amazon ECR private registry operations from Node.js: creating repositories, querying image metadata, updating repository settings, and getting Docker auth tokens.

Do not use this package to push or pull image layers directly. Image transfer still happens through Docker or another OCI-compatible client after you authenticate. For Amazon ECR Public, use `@aws-sdk/client-ecr-public` instead.

## Install

```bash
npm install @aws-sdk/client-ecr
```

## Prerequisites and AWS Configuration

The SDK uses the standard AWS credential provider chain. For local development, the simplest setup is a named profile plus an explicit region:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-west-2
```

Or set credentials directly:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_REGION=us-west-2
```

Your IAM identity needs the ECR actions required by the calls you make, such as `ecr:DescribeRepositories`, `ecr:CreateRepository`, `ecr:DescribeImages`, `ecr:GetAuthorizationToken`, `ecr:BatchDeleteImage`, and `ecr:DeleteRepository`.

## Client Initialization

Prefer the default provider chain unless you have a specific reason to hard-code credentials:

```javascript
import { ECRClient } from "@aws-sdk/client-ecr";

export const ecr = new ECRClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

If you need explicit credentials:

```javascript
import { ECRClient } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Common Workflows

### Create a Repository

```javascript
import { ECRClient, CreateRepositoryCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const response = await ecr.send(
  new CreateRepositoryCommand({
    repositoryName: "example-app",
    imageTagMutability: "IMMUTABLE",
  })
);

console.log(response.repository.repositoryName);
console.log(response.repository.repositoryUri);
```

`repositoryUri` is the registry path you use with `docker tag` and `docker push`.

### List Repositories

```javascript
import { ECRClient, DescribeRepositoriesCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const page = await ecr.send(
  new DescribeRepositoriesCommand({
    maxResults: 100,
  })
);

for (const repository of page.repositories ?? []) {
  console.log(repository.repositoryName, repository.repositoryUri);
}

console.log("nextToken:", page.nextToken ?? null);
```

If your account has many repositories, keep calling `DescribeRepositoriesCommand` with the returned `nextToken` until it is absent.

### Inspect Image Tags and Digests

```javascript
import { ECRClient, DescribeImagesCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const images = await ecr.send(
  new DescribeImagesCommand({
    repositoryName: "example-app",
    maxResults: 100,
  })
);

for (const image of images.imageDetails ?? []) {
  console.log({
    digest: image.imageDigest,
    tags: image.imageTags,
    pushedAt: image.imagePushedAt,
    size: image.imageSizeInBytes,
  });
}
```

Use image digests for deletion and deployment logic when you need an immutable identifier.

### Get a Docker Login Token

`GetAuthorizationTokenCommand` returns a base64-encoded `AWS:password` pair and a registry endpoint. The token is temporary, so request it close to the time you run `docker login`.

```javascript
import { ECRClient, GetAuthorizationTokenCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const response = await ecr.send(new GetAuthorizationTokenCommand({}));
const auth = response.authorizationData?.[0];

if (!auth?.authorizationToken || !auth.proxyEndpoint) {
  throw new Error("ECR did not return authorization data");
}

const [username, password] = Buffer.from(auth.authorizationToken, "base64")
  .toString("utf8")
  .split(":", 2);

const registry = auth.proxyEndpoint.replace(/^https?:\/\//, "");

console.log({ username, password, registry });
```

### Log In to Docker from Node.js

```javascript
import { spawn } from "node:child_process";
import { ECRClient, GetAuthorizationTokenCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

async function dockerLoginToEcr() {
  const response = await ecr.send(new GetAuthorizationTokenCommand({}));
  const auth = response.authorizationData?.[0];

  if (!auth?.authorizationToken || !auth.proxyEndpoint) {
    throw new Error("ECR did not return authorization data");
  }

  const [username, password] = Buffer.from(auth.authorizationToken, "base64")
    .toString("utf8")
    .split(":", 2);

  const registry = auth.proxyEndpoint.replace(/^https?:\/\//, "");

  await new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      ["login", "--username", username, "--password-stdin", registry],
      { stdio: ["pipe", "inherit", "inherit"] }
    );

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`docker login exited with code ${code}`));
      }
    });

    child.stdin.end(password);
  });

  return registry;
}

const registry = await dockerLoginToEcr();
console.log(`Logged in to ${registry}`);
```

After login, tag and push with the repository URI returned by ECR:

```bash
export ECR_REPOSITORY_URI=123456789012.dkr.ecr.us-west-2.amazonaws.com/example-app

docker build -t example-app:latest .
docker tag example-app:latest "$ECR_REPOSITORY_URI:latest"
docker push "$ECR_REPOSITORY_URI:latest"
```

### Delete Images by Tag or Digest

```javascript
import { ECRClient, BatchDeleteImageCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

await ecr.send(
  new BatchDeleteImageCommand({
    repositoryName: "example-app",
    imageIds: [{ imageTag: "old-build" }],
  })
);

await ecr.send(
  new BatchDeleteImageCommand({
    repositoryName: "example-app",
    imageIds: [{ imageDigest: "sha256:0123456789abcdef..." }],
  })
);
```

Deleting by digest is safer when tags may have moved.

### Delete a Repository

```javascript
import { ECRClient, DeleteRepositoryCommand } from "@aws-sdk/client-ecr";

const ecr = new ECRClient({ region: process.env.AWS_REGION ?? "us-west-2" });

await ecr.send(
  new DeleteRepositoryCommand({
    repositoryName: "example-app",
    force: true,
  })
);
```

`force: true` deletes all images in the repository before removing the repository itself.

## Common Pitfalls

- `@aws-sdk/client-ecr` is for private Amazon ECR. Public ECR uses `@aws-sdk/client-ecr-public`.
- ECR is regional. Use the same region for the client, the repository URI, and the Docker registry login target.
- The SDK manages repositories and auth tokens, but Docker or another OCI client still handles image push and pull.
- `GetAuthorizationTokenCommand` returns a base64 token and a `proxyEndpoint`. Strip the `https://` prefix before passing the registry to `docker login`.
- If you use temporary AWS credentials, include `AWS_SESSION_TOKEN` or the SDK can authenticate incorrectly even when the key and secret are present.
- Large registries require pagination through `nextToken` on list and describe operations.

## Version Notes

This guide targets `@aws-sdk/client-ecr` version `3.1007.0`.
