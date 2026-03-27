---
name: bedrock-runtime
description: "AWS SDK for JavaScript v3 Bedrock Runtime client for model invocation, chat-style Converse APIs, token counting, and streaming inference."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,bedrock,bedrock-runtime,javascript,nodejs,genai,llm,inference,streaming"
---

# `@aws-sdk/client-bedrock-runtime`

Use this package for Amazon Bedrock **runtime inference** in AWS SDK for JavaScript v3. It covers chat-style `Converse` requests, streaming responses, raw model-native invocation, token counting, guardrails, and async invoke APIs.

This is the runtime client. If you need to discover model IDs or work with the Bedrock control plane, use `@aws-sdk/client-bedrock` instead.

Prefer `BedrockRuntimeClient` plus explicit command imports. That keeps call sites clear and avoids pulling in the full aggregated client surface by accident.

## Install

```bash
npm install @aws-sdk/client-bedrock-runtime
```

If you want to pin a named shared AWS profile in code instead of relying on the default credential provider chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-bedrock-runtime@3.1007.0`.

## Prerequisites And Authentication

Before sending requests, make sure all of the following are true:

- your AWS credentials are available to the SDK
- your chosen AWS region supports the Bedrock model you want to call
- your account has access to that model in that region
- your IAM policy allows the Bedrock runtime actions your code uses

Typical local setup:

```bash
export AWS_PROFILE=bedrock-dev
export AWS_REGION=us-east-1
export BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
```

The JavaScript SDK usually resolves credentials from the default provider chain in Node.js, including environment variables, shared AWS config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Minimal client setup:

```javascript
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to force a shared profile explicitly in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "bedrock-dev" }),
});
```

Keep Bedrock runtime calls on the server side unless you already have a browser-safe temporary credential flow. Do not ship long-lived AWS credentials to the browser.

## Choose The Right Runtime API

- `ConverseCommand`: higher-level message-based inference API
- `ConverseStreamCommand`: streaming version of `Converse`
- `InvokeModelCommand`: raw model-native request body and response body
- `InvokeModelWithResponseStreamCommand`: streaming version of raw model-native invocation
- `CountTokensCommand`: estimate input token count before sending a request

For new application code, start with `Converse` when your target model supports it. Reach for `InvokeModel` when you need the provider-specific native payload shape exactly as documented for that model.

## Send A Basic Chat Request With `Converse`

`Converse` uses a common message format across Bedrock-supported conversational models.

```javascript
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const modelId = process.env.BEDROCK_MODEL_ID;

if (!modelId) {
  throw new Error("Set BEDROCK_MODEL_ID before calling Bedrock Runtime");
}

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ConverseCommand({
    modelId,
    messages: [
      {
        role: "user",
        content: [{ text: "Summarize why region selection matters for Amazon Bedrock." }],
      },
    ],
    inferenceConfig: {
      maxTokens: 256,
      temperature: 0.2,
    },
  }),
);

const text = (response.output?.message?.content ?? [])
  .map((block) => block.text ?? "")
  .join("");

console.log(text);
console.log(response.usage?.inputTokens, response.usage?.outputTokens);
```

Useful request fields for `Converse`:

- `messages`: conversation history as `{ role, content }[]`
- `system`: optional system instructions separate from user messages
- `inferenceConfig`: shared knobs such as `maxTokens`, `temperature`, `topP`, and `stopSequences`

The response includes `output.message.content`, `stopReason`, `usage`, and `metrics`.

## Stream Text With `ConverseStream`

Use `ConverseStream` when you want tokens or text blocks as they arrive instead of waiting for the full response.

```javascript
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

const modelId = process.env.BEDROCK_MODEL_ID;

if (!modelId) {
  throw new Error("Set BEDROCK_MODEL_ID before calling Bedrock Runtime");
}

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ConverseStreamCommand({
    modelId,
    messages: [
      {
        role: "user",
        content: [{ text: "Write a short haiku about AWS logs." }],
      },
    ],
    inferenceConfig: {
      maxTokens: 128,
      temperature: 0.7,
    },
  }),
);

if (!response.stream) {
  throw new Error("Bedrock returned no stream");
}

for await (const event of response.stream) {
  const text = event.contentBlockDelta?.delta?.text;

  if (text) {
    process.stdout.write(text);
  }

  if (event.metadata) {
    console.error("\nusage:", event.metadata.usage);
  }
}

process.stdout.write("\n");
```

The stream emits structured events such as `messageStart`, `contentBlockDelta`, `messageStop`, and `metadata`. For plain text output, `contentBlockDelta.delta.text` is usually the field you want.

## Count Tokens Before Sending A Request

`CountTokens` is useful when you want to reject oversized prompts early or estimate cost before running inference.

```javascript
import {
  BedrockRuntimeClient,
  CountTokensCommand,
} from "@aws-sdk/client-bedrock-runtime";

const modelId = process.env.BEDROCK_MODEL_ID;

if (!modelId) {
  throw new Error("Set BEDROCK_MODEL_ID before calling Bedrock Runtime");
}

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new CountTokensCommand({
    modelId,
    input: {
      converse: {
        messages: [
          {
            role: "user",
            content: [{ text: "Draft a short release note for an SDK update." }],
          },
        ],
      },
    },
  }),
);

console.log(`Input tokens: ${response.inputTokens}`);
```

For `CountTokens`, the `input` object can describe either a `converse` request or an `invokeModel` request body.

## Use `InvokeModel` For Model-Native Payloads

`InvokeModel` is lower level than `Converse`. The request body and the parsed response shape depend on the specific model family you call.

This example uses a Titan Text payload. Do not reuse this JSON body unchanged for other model families.

```javascript
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const payload = {
  inputText: "Explain why explicit credential handling matters in production.",
  textGenerationConfig: {
    maxTokenCount: 256,
    temperature: 0.2,
  },
};

const response = await client.send(
  new InvokeModelCommand({
    modelId: "amazon.titan-text-express-v1",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  }),
);

const responseJson = JSON.parse(new TextDecoder().decode(response.body));

console.log(responseJson);
```

Use `InvokeModel` when the model documentation gives you a provider-specific JSON schema that does not map cleanly to the higher-level `Converse` request format.

## Common Runtime Errors And Pitfalls

- `@aws-sdk/client-bedrock` and `@aws-sdk/client-bedrock-runtime` are different clients. Use the runtime client for inference.
- Bedrock access is region-specific and model-specific. A valid model ID in one region may fail in another.
- `InvokeModel` request bodies are model-native. Do not assume one JSON payload works across Anthropic, Amazon, Meta, and other providers.
- `InvokeModelCommand` returns `body` as bytes. Decode it before calling `JSON.parse`.
- Streaming APIs return structured event streams, not a plain string. Read `contentBlockDelta` for `ConverseStream` and streamed chunks for `InvokeModelWithResponseStream`.
- Common service exceptions include `AccessDeniedException`, `ValidationException`, `ThrottlingException`, `ModelNotReadyException`, `ModelTimeoutException`, and `ModelErrorException`.

## Minimal Error Handling Pattern

```javascript
try {
  const response = await client.send(command);
  return response;
} catch (error) {
  if (error?.name === "ThrottlingException") {
    throw new Error("Bedrock throttled the request; retry with backoff.");
  }

  if (error?.name === "AccessDeniedException") {
    throw new Error("AWS credentials or IAM permissions do not allow this Bedrock runtime call.");
  }

  throw error;
}
```

## Related Packages

- `@aws-sdk/client-bedrock`: control-plane discovery and management APIs
- `@aws-sdk/credential-providers`: explicit profile, assume-role, IAM Identity Center, and other credential helpers

## Notes

- Keep your chosen `modelId` in configuration, not hard-coded deep inside request helpers.
- If you need to discover model IDs dynamically before inference, query Bedrock with `@aws-sdk/client-bedrock` and pass the selected ID into this runtime client.
- If you need a fully model-native streaming payload instead of `ConverseStream`, use `InvokeModelWithResponseStreamCommand` and read each event chunk from the response stream.
