---
name: openai
description: "Azure OpenAI JavaScript SDK guide for @azure/openai 2.0.0 with AzureOpenAI client setup, auth, chat completions, streaming, and embeddings"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,openai,llm,javascript,azure-openai"
---

# @azure/openai JavaScript Package Guide

## What This Package Is

`@azure/openai` is the Azure SDK package for calling Azure OpenAI from JavaScript and TypeScript.

For `2.0.0`, use the `AzureOpenAI` client and the OpenAI-style method groups such as:

- `client.chat.completions.create(...)`
- `client.embeddings.create(...)`

If you find older examples using `OpenAIClient`, `getChatCompletions()`, or `getEmbeddings()`, those are from older package generations and do not match `2.0.0`.

## Golden Rules

- Use your Azure **resource endpoint**, such as `https://<resource-name>.openai.azure.com`
- Use your Azure **deployment name** in `model`, not the base model family name by itself
- Set an explicit API version; Azure OpenAI requests are versioned
- Use `DefaultAzureCredential` for local `az login`, managed identity, or service principal flows when possible

## Install

Install the package:

```bash
npm install @azure/openai
```

If you want Microsoft Entra ID authentication:

```bash
npm install @azure/openai @azure/identity
```

## Required Azure Setup

You need all of the following before the SDK calls will work:

1. An Azure OpenAI resource
2. Its endpoint URL
3. At least one deployed model
4. The deployment name for each workload you call
5. Either an API key or Microsoft Entra credentials

Recommended environment variables:

```bash
export AZURE_OPENAI_ENDPOINT="https://<resource-name>.openai.azure.com"
export AZURE_OPENAI_API_KEY="<api-key>"
export AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"
export AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT="text-embedding-3-large"
export OPENAI_API_VERSION="2024-10-21"
```

If your app uses keyless auth, keep `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, and `OPENAI_API_VERSION`, and authenticate with `DefaultAzureCredential`.

## Authentication And Client Initialization

### API key authentication

Use this when you already have an Azure OpenAI key.

```js
import { AzureOpenAI } from "@azure/openai";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.OPENAI_API_VERSION ?? "2024-10-21",
});
```

### Microsoft Entra ID authentication

Use a bearer token provider when you want local `az login`, a managed identity, or a service principal.

```js
import { AzureOpenAI } from "@azure/openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

const scope = "https://cognitiveservices.azure.com/.default";
const azureADTokenProvider = getBearerTokenProvider(
  new DefaultAzureCredential(),
  scope,
);

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureADTokenProvider,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.OPENAI_API_VERSION ?? "2024-10-21",
});
```

## Common Workflows

### Chat completions

Use `client.chat.completions.create(...)` for standard prompt/response generation.

```js
import { AzureOpenAI } from "@azure/openai";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.OPENAI_API_VERSION ?? "2024-10-21",
});

const completion = await client.chat.completions.create({
  model: process.env.AZURE_OPENAI_DEPLOYMENT,
  messages: [
    { role: "system", content: "You write concise technical summaries." },
    { role: "user", content: "Explain vector search in two sentences." },
  ],
  max_tokens: 200,
});

console.log(completion.choices[0].message.content);
```

### Streaming chat completions

For incremental output, set `stream: true` and iterate over the returned events.

```js
import { AzureOpenAI } from "@azure/openai";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.OPENAI_API_VERSION ?? "2024-10-21",
});

const stream = await client.chat.completions.create({
  model: process.env.AZURE_OPENAI_DEPLOYMENT,
  messages: [
    { role: "user", content: "List three rollout risks for a database migration." },
  ],
  stream: true,
});

for await (const event of stream) {
  const delta = event.choices?.[0]?.delta?.content;
  if (delta) {
    process.stdout.write(delta);
  }
}

process.stdout.write("\n");
```

### Embeddings

Use a separate deployment if your Azure resource has one for embeddings.

```js
import { AzureOpenAI } from "@azure/openai";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: process.env.OPENAI_API_VERSION ?? "2024-10-21",
});

const result = await client.embeddings.create({
  model: process.env.AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT,
  input: [
    "Azure OpenAI supports deployment-scoped model routing.",
    "Embeddings are useful for retrieval and semantic search.",
  ],
});

console.log(result.data.length);
console.log(result.data[0].embedding.length);
```

## Configuration Notes

- `endpoint` should be the service root, not a deployment URL and not a path ending in `/openai/deployments/...`
- Keep `apiVersion` explicit in code or environment so upgrades are deliberate
- For Azure OpenAI, `model` is typically your deployment name in real applications
- Reuse one client instance per process or request scope instead of recreating it for every call

## Version-Sensitive Notes For 2.0.0

- `2.0.0` uses the OpenAI-style grouped API surface under `client.chat.completions` and `client.embeddings`
- Older examples that use `OpenAIClient`, `getChatCompletions()`, or `getEmbeddings()` do not match this package version
- The package requires an Azure OpenAI API version; keep `OPENAI_API_VERSION` pinned instead of relying on tutorial defaults from unrelated examples

## Common Pitfalls

- Passing the model family name when Azure expects your deployment name
- Forgetting to set `OPENAI_API_VERSION`
- Using the wrong resource URL format instead of `https://<resource-name>.openai.azure.com`
- Mixing API-key auth and Entra auth configuration in the same initialization path
- Copying pre-2.0 samples that use different client types and method names

## Official Sources

- Azure SDK for JavaScript `@azure/openai` README: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/openai/openai/README.md
- JavaScript API overview for `@azure/openai`: https://learn.microsoft.com/javascript/api/overview/azure/openai-readme?view=azure-node-latest
- Azure OpenAI endpoint switching guidance: https://learn.microsoft.com/azure/ai-foundry/openai/how-to/switching-endpoints
