---
name: model-hosting
description: "Replicate JavaScript SDK coding guide for running ML models via the official Replicate npm package"
metadata:
  languages: "javascript"
  versions: "1.4.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "replicate,model-hosting,ml,inference,ai"
---

# Replicate JavaScript SDK Coding Guide

## 1. Golden Rule

**Always use the official Replicate SDK package:** `replicate` from npm. The GitHub repository is `replicate/replicate-javascript`.

**Never use unofficial or deprecated libraries.** The `replicate` package is the only officially supported Node.js/JavaScript SDK maintained by Replicate. Do not use packages like `replicate-api` or other third-party alternatives.

**Important version note:** This SDK requires Node.js 18 or later, as it uses the native `fetch` API available in modern Node.js environments.

## 2. Installation

### npm
```bash
npm install replicate
```

### yarn
```bash
yarn add replicate
```

### pnpm
```bash
pnpm add replicate
```

**Environment Variables (Required):**
```bash
REPLICATE_API_TOKEN=r8_your_api_token_here
```

**Optional Environment Variables:**
```bash
REPLICATE_API_BASE_URL=https://api.replicate.com/v1  # Custom API endpoint
```

**Security Best Practices:** Never hardcode API tokens in source code. Use environment variables or secure secret management services. Use different tokens for development, staging, and production. Refresh tokens periodically. Never commit tokens to version control. Replicate automatically scans GitHub for accidentally committed tokens and disables them.

## 3. Initialization

### Basic Initialization
```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
```

### Custom Configuration
```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: "my-app/1.0.0",
  baseUrl: "https://api.replicate.com/v1",
  fetch: customFetch, // Custom fetch implementation
  fileEncodingStrategy: "upload", // "upload" or "no-upload"
});
```

### TypeScript Usage
```typescript
import Replicate from "replicate";
import type { Prediction, Model, Training } from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
```

**File Encoding Strategy:** `"upload"` (default) automatically uploads file handles to Replicate's file storage. `"no-upload"` does not upload files and is useful when you want to manage file uploads manually.

## 4. Core API Surfaces

### Running Models with `replicate.run()`

**Minimal Example:**
```javascript
const output = await replicate.run(
  "black-forest-labs/flux-schnell",
  {
    input: {
      prompt: "a 19th century portrait of a raccoon gentleman wearing a suit"
    }
  }
);

console.log(output);
```

**Advanced Example with Version and Options:**
```javascript
const output = await replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  {
    input: {
      prompt: "a futuristic cityscape at sunset",
      negative_prompt: "blurry, low quality",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      width: 1024,
      height: 1024,
      seed: 42
    },
    wait: {
      mode: "block", // "block" or "poll"
      interval: 500, // Polling interval in ms (default 500)
    }
  },
  (progress) => {
    console.log("Progress:", progress);
  }
);
```

**Identifier Formats:**

The identifier parameter accepts three formats:

1. **Model name only** (uses latest version):
   ```javascript
   "black-forest-labs/flux-schnell"
   ```

2. **Model name with version**:
   ```javascript
   "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
   ```

3. **Version ID only**:
   ```javascript
   "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
   ```

**Progress Callback:**
```javascript
const output = await replicate.run(
  "meta/llama-2-70b-chat",
  {
    input: {
      prompt: "Write a story about a brave knight"
    }
  },
  (prediction) => {
    console.log("Status:", prediction.status);
    if (prediction.output) {
      console.log("Partial output:", prediction.output);
    }
  }
);
```

### Streaming Output with `replicate.stream()`

**Minimal Streaming Example:**
```javascript
for await (const event of replicate.stream(
  "meta/llama-2-70b-chat",
  {
    input: {
      prompt: "Tell me a story about a dragon"
    }
  }
)) {
  process.stdout.write(event.toString());
}
```

**Note (1.4.0):** When a streamed model emits file outputs, `event.data` defaults to a `FileOutput` instance you can write directly to disk. Pass `useFileOutput: false` in the stream options if you would rather receive plain HTTP URLs or data URLs as in earlier 1.x releases.

**Advanced Streaming with Event Handling:**
```javascript
const stream = await replicate.stream(
  "meta/llama-2-70b-chat",
  {
    input: {
      prompt: "Explain quantum computing",
      max_new_tokens: 500,
      temperature: 0.7
    }
  }
);

let fullOutput = "";

for await (const event of stream) {
  if (event.event === "output") {
    fullOutput += event.data;
    process.stdout.write(event.data);
  } else if (event.event === "error") {
    console.error("Error:", event.data);
  } else if (event.event === "done") {
    console.log("\nGeneration complete");
  }
}

console.log("\nFull output:", fullOutput);
```

**Streaming with EventSource (Server-Sent Events):**
```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Create a prediction with streaming enabled
const prediction = await replicate.predictions.create({
  version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
  input: {
    prompt: "Tell me a story"
  },
  stream: true,
});

// For browser environments
if (typeof EventSource !== 'undefined') {
  const source = new EventSource(prediction.urls.stream, {
    withCredentials: true,
  });

  source.addEventListener("output", (e) => {
    console.log("Output:", e.data);
  });

  source.addEventListener("error", (e) => {
    console.error("Error:", JSON.parse(e.data));
    source.close();
  });

  source.addEventListener("done", (e) => {
    console.log("Done:", JSON.parse(e.data));
    source.close();
  });
}
```

### Predictions API

**Create a Prediction:**
```javascript
const prediction = await replicate.predictions.create({
  version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  input: {
    prompt: "a beautiful landscape"
  }
});

console.log(prediction.id);
console.log(prediction.status); // "starting"
```

**Advanced Prediction with All Options:**
```javascript
const prediction = await replicate.predictions.create({
  version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  input: {
    prompt: "astronaut riding a horse on mars",
    width: 1024,
    height: 1024,
    num_inference_steps: 50
  },
  webhook: "https://api.myapp.com/webhooks/replicate",
  webhook_events_filter: ["start", "output", "logs", "completed"],
  stream: false,
  wait: {
    mode: "poll",
    interval: 500
  }
});
```

**Get Prediction Status:**
```javascript
const prediction = await replicate.predictions.get("gm3qorzdhgbfurvjtvhg6dckhu");

console.log(prediction.status); // "succeeded", "processing", "failed", "canceled"
console.log(prediction.output);
console.log(prediction.logs);
console.log(prediction.metrics);
```

**Wait for Prediction to Complete:**
```javascript
let prediction = await replicate.predictions.create({
  version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  input: { prompt: "a serene lake" }
});

// Poll until completion
prediction = await replicate.wait(prediction);

console.log(prediction.status); // "succeeded" or "failed"
console.log(prediction.output);
```

**Cancel a Prediction:**
```javascript
const canceled = await replicate.predictions.cancel("gm3qorzdhgbfurvjtvhg6dckhu");

console.log(canceled.status); // "canceled"
```

**Important:** If you cancel a prediction before it starts, there's no charge. If you cancel after it starts, you're billed for the time used.

**List Predictions:**
```javascript
// Automatic pagination
for await (const prediction of replicate.predictions.list()) {
  console.log(prediction.id, prediction.status);
}

// Manual pagination
let page = await replicate.predictions.list();
for (const prediction of page.results) {
  console.log(prediction.id);
}

while (page.next) {
  page = await replicate.predictions.list({ cursor: page.next });
  for (const prediction of page.results) {
    console.log(prediction.id);
  }
}
```

### Models API

**Get Model Information:**
```javascript
const model = await replicate.models.get("stability-ai", "sdxl");

console.log(model.name);
console.log(model.description);
console.log(model.latest_version);
console.log(model.visibility); // "public" or "private"
```

**List All Models:**
```javascript
// Automatic pagination
const allModels = [];
for await (const model of replicate.models.list()) {
  allModels.push(model);
}

// Manual pagination
let page = await replicate.models.list();
for (const model of page.results) {
  console.log(model.owner, model.name);
}

while (page.hasNextPage()) {
  page = await page.getNextPage();
  for (const model of page.results) {
    console.log(model.owner, model.name);
  }
}
```

**Get Model Versions:**
```javascript
const versions = await replicate.models.versions.list(
  "stability-ai",
  "sdxl"
);

for await (const version of versions) {
  console.log(version.id);
  console.log(version.created_at);
}
```

**Get Specific Version:**
```javascript
const version = await replicate.models.versions.get(
  "stability-ai",
  "sdxl",
  "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
);

console.log(version.openapi_schema); // Input/output schema
```

**Create a Model:**
```javascript
const model = await replicate.models.create({
  owner: "your-username",
  name: "my-custom-model",
  description: "A custom model for specific tasks",
  visibility: "private", // "public" or "private"
  hardware: "gpu-a40-large"
});
```

### Collections API

**Get Collection:**
```javascript
const collection = await replicate.collections.get("text-to-image");

console.log(collection.name);
console.log(collection.description);

for (const model of collection.models) {
  console.log(model.owner, model.name);
}
```

**List Featured Collections:**
```javascript
// Collections are curated lists of models available at replicate.com/collections
const collection = await replicate.collections.get("super-resolution");

collection.models.forEach(model => {
  console.log(`${model.owner}/${model.name}: ${model.description}`);
});
```

### Deployments API

**Create a Deployment:**
```javascript
const deployment = await replicate.deployments.create({
  name: "my-production-deployment",
  model: "stability-ai/sdxl",
  version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  hardware: "gpu-a40-large",
  min_instances: 1,
  max_instances: 5
});

console.log(deployment.url);
```

**Available Hardware SKUs:** To list all available hardware SKUs and their specifications programmatically, use `await replicate.hardware.list()`. Common options include `"cpu"`, `"gpu-t4"`, `"gpu-a40-small"`, `"gpu-a40-large"`, and `"gpu-a100"`. From the CLI, run `replicate hardware list` to see all available hardware types with their SKUs, names, and specifications.

**Get Deployment:**
```javascript
const deployment = await replicate.deployments.get(
  "your-username",
  "my-production-deployment"
);

console.log(deployment.current_version);
console.log(deployment.hardware);
console.log(deployment.min_instances);
console.log(deployment.max_instances);
```

**Update Deployment:**
```javascript
const updated = await replicate.deployments.update(
  "your-username",
  "my-production-deployment",
  {
    version: "new-version-id",
    min_instances: 2,
    max_instances: 10
  }
);
```

**List Deployments:**
```javascript
for await (const deployment of replicate.deployments.list()) {
  console.log(deployment.owner, deployment.name);
}
```

**Run Prediction on Deployment:**
```javascript
const prediction = await replicate.deployments.predictions.create(
  "your-username",
  "my-production-deployment",
  {
    input: {
      prompt: "a beautiful sunset"
    }
  }
);

console.log(prediction.output);
```

**Delete Deployment:**
```javascript
await replicate.deployments.delete(
  "your-username",
  "my-production-deployment"
);
```

### Training API

**Create Training:**
```javascript
const training = await replicate.trainings.create(
  "stability-ai",
  "sdxl",
  "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  {
    destination: "your-username/my-fine-tuned-model",
    input: {
      input_images: "https://example.com/training-data.zip",
      learning_rate: 1e-6,
      num_train_epochs: 100
    },
    webhook: "https://api.myapp.com/webhooks/training-complete"
  }
);

console.log(training.id);
console.log(training.status); // "starting"
```

**Get Training Status:**
```javascript
const training = await replicate.trainings.get("zz4ibbonubfz7carwiefibzgga");

console.log(training.status); // "succeeded", "processing", "failed", "canceled"
console.log(training.output); // New model version created
console.log(training.logs);
```

**Cancel Training:**
```javascript
const canceled = await replicate.trainings.cancel("zz4ibbonubfz7carwiefibzgga");
console.log(canceled.status); // "canceled"
```

**List Trainings:**
```javascript
for await (const training of replicate.trainings.list()) {
  console.log(training.id, training.status);
}
```

### Files API

**Upload File:**
```javascript
import fs from "fs";

const file = await replicate.files.create(
  fs.readFileSync("path/to/image.png")
);

console.log(file.id);
console.log(file.urls.get); // URL to download the file
```

**Use File in Prediction:**
```javascript
import fs from "fs";

// Upload file first
const file = await replicate.files.create(
  fs.readFileSync("input-image.png")
);

// Use file handle in prediction
const prediction = await replicate.predictions.create({
  version: "image-to-image-model-version-id",
  input: {
    image: file.urls.get,
    prompt: "turn this into a watercolor painting"
  }
});
```

**File Encoding Strategy:**
```javascript
// Automatically upload files (default behavior)
const replicateAutoUpload = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  fileEncodingStrategy: "upload"
});

// Manual file management (no automatic upload)
const replicateManual = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  fileEncodingStrategy: "no-upload"
});
```

**Get File:**
```javascript
const file = await replicate.files.get("file-id-here");
console.log(file.urls.get);
```

**List Files:**
```javascript
for await (const file of replicate.files.list()) {
  console.log(file.id, file.created_at);
}
```

**Delete File:**
```javascript
await replicate.files.delete("file-id-here");
```

### Hardware API

**List Available Hardware:**
```javascript
const hardware = await replicate.hardware.list();

for (const sku of hardware) {
  console.log(sku.name);
  console.log(sku.sku);
}
```

### Account API

**Get Account Information:**
```javascript
const account = await replicate.account.get();

console.log(account.type); // "user" or "organization"
console.log(account.username);
console.log(account.name);
```

## 5. Webhooks

### Setting Up Webhooks

**Create Prediction with Webhook:**
```javascript
const prediction = await replicate.predictions.create({
  version: "model-version-id",
  input: {
    prompt: "a painting of a cat"
  },
  webhook: "https://api.myapp.com/webhooks/replicate",
  webhook_events_filter: ["start", "output", "logs", "completed"]
});
```

**Webhook Event Types:** `"start"` fires when prediction starts processing. `"output"` fires each time prediction generates output (throttled to max 1 per 500ms). `"logs"` fires each time log output is generated (throttled to max 1 per 500ms). `"completed"` fires when prediction reaches terminal state (succeeded/failed/canceled).

**Webhook Payload Example:**
```javascript
{
  "id": "gm3qorzdhgbfurvjtvhg6dckhu",
  "status": "succeeded",
  "output": ["https://replicate.delivery/output.png"],
  "created_at": "2024-01-15T10:30:00.000Z",
  "started_at": "2024-01-15T10:30:01.000Z",
  "completed_at": "2024-01-15T10:30:05.000Z",
  "metrics": {
    "predict_time": 4.2
  },
  "logs": "Processing complete",
  "error": null
}
```

**Webhook Handler (Express.js):**
```javascript
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.post("/webhooks/replicate", async (req, res) => {
  const prediction = req.body;

  console.log("Webhook received:", prediction.id);
  console.log("Status:", prediction.status);

  if (prediction.status === "succeeded") {
    console.log("Output:", prediction.output);
    // Process the output
    await processOutput(prediction.output);
  } else if (prediction.status === "failed") {
    console.error("Prediction failed:", prediction.error);
    // Handle failure
  }

  // Always respond quickly to webhooks
  res.status(200).json({ received: true });
});
```

**Webhook Best Practices:** Respond to webhooks within 30 seconds with 200 OK. Process webhook payloads asynchronously (don't block the response). Implement idempotency since webhooks may be retried. Replicate will retry failed webhooks automatically. Use HTTPS endpoints for webhooks. Validate webhook authenticity in production.

### Webhook Security

**Implement Webhook Signature Verification (recommended for production):**
```javascript
// Note: Replicate webhook signature verification details
// Check Replicate's documentation for current signature scheme

app.post("/webhooks/replicate", (req, res) => {
  const signature = req.headers['x-replicate-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // Verify signature (implementation depends on Replicate's scheme)
  if (!verifySignature(signature, req.body, secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process webhook
  const prediction = req.body;
  processWebhook(prediction);

  res.status(200).json({ received: true });
});
```

## 6. Advanced Features

### Error Handling

**Comprehensive Error Handling:**
```javascript
import Replicate from "replicate";

async function runModelSafely() {
  try {
    const output = await replicate.run(
      "stability-ai/sdxl",
      {
        input: {
          prompt: "a beautiful landscape"
        }
      }
    );

    return output;
  } catch (error) {
    // Handle specific error types
    if (error.response) {
      // API error response
      console.error("Status:", error.response.status);
      console.error("Error:", error.response.data);

      if (error.response.status === 401) {
        throw new Error("Invalid API token");
      } else if (error.response.status === 402) {
        throw new Error("Insufficient credits");
      } else if (error.response.status === 429) {
        throw new Error("Rate limit exceeded");
      } else if (error.response.status === 500) {
        throw new Error("Replicate server error");
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.message);
      throw new Error("Failed to connect to Replicate API");
    } else {
      // Other errors
      console.error("Error:", error.message);
      throw error;
    }
  }
}
```

**Retry Logic with Exponential Backoff:**
```javascript
async function runWithRetry(identifier, options, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const output = await replicate.run(identifier, options);
      return output;
    } catch (error) {
      lastError = error;

      // Only retry on transient errors
      const isRetryable =
        error.response?.status === 429 || // Rate limit
        error.response?.status === 500 || // Server error
        error.response?.status === 503 || // Service unavailable
        !error.response; // Network error

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### Polling vs Blocking

**Blocking Mode (holds connection open):**
```javascript
const output = await replicate.run(
  "meta/llama-2-70b-chat",
  {
    input: { prompt: "Hello" },
    wait: {
      mode: "block", // Hold connection open
      interval: 60000 // Fallback to polling after 60s
    }
  }
);
```

**Polling Mode (repeated requests):**
```javascript
const output = await replicate.run(
  "meta/llama-2-70b-chat",
  {
    input: { prompt: "Hello" },
    wait: {
      mode: "poll", // Make repeated requests
      interval: 500 // Check every 500ms
    }
  }
);
```

### Async/Await Patterns

**Parallel Predictions:**
```javascript
const prompts = [
  "a sunset over mountains",
  "a city at night",
  "a forest in autumn"
];

const predictions = await Promise.all(
  prompts.map(prompt =>
    replicate.predictions.create({
      version: "model-version-id",
      input: { prompt }
    })
  )
);

// Wait for all to complete
const results = await Promise.all(
  predictions.map(p => replicate.wait(p))
);

results.forEach((result, i) => {
  console.log(`Result ${i}:`, result.output);
});
```

**Sequential Processing with Rate Limiting:**
```javascript
async function processSequentially(prompts, delayMs = 1000) {
  const results = [];

  for (const prompt of prompts) {
    const output = await replicate.run(
      "stability-ai/sdxl",
      { input: { prompt } }
    );

    results.push(output);

    // Delay between requests
    if (prompts.indexOf(prompt) < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
```

## 7. Best Practices

### Request Structure

**Always specify exact versions in production:**
```javascript
// Good - pinned version
const output = await replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  { input: { prompt: "a cat" } }
);

// Avoid - uses latest version (can change unexpectedly)
const output = await replicate.run(
  "stability-ai/sdxl",
  { input: { prompt: "a cat" } }
);
```

**Validate inputs before sending:**
```javascript
function validateInput(input) {
  if (!input.prompt || input.prompt.trim().length === 0) {
    throw new Error("Prompt is required");
  }

  if (input.width && (input.width < 256 || input.width > 2048)) {
    throw new Error("Width must be between 256 and 2048");
  }

  if (input.height && (input.height < 256 || input.height > 2048)) {
    throw new Error("Height must be between 256 and 2048");
  }

  return true;
}

// Use validation
const input = { prompt: "a landscape", width: 1024, height: 1024 };
validateInput(input);

const output = await replicate.run("stability-ai/sdxl", { input });
```

### Rate Limits and Retries

**Implement exponential backoff:**
```javascript
async function callWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter
          ? parseInt(retryAfter) * 1000
          : Math.pow(2, i) * 1000;

        console.log(`Rate limited. Retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error("Max retries exceeded");
}

// Usage
const output = await callWithBackoff(() =>
  replicate.run("model-name", { input: { prompt: "test" } })
);
```

**Respect Retry-After headers:**
```javascript
catch (error) {
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    if (retryAfter) {
      const delaySeconds = parseInt(retryAfter);
      console.log(`Waiting ${delaySeconds}s before retry`);
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
  }
}
```

### Safety and Compliance

**Content moderation:**
```javascript
function checkContentSafety(prompt) {
  // Implement your content policy
  const blockedTerms = ['harmful', 'illegal'];

  const normalized = prompt.toLowerCase();
  for (const term of blockedTerms) {
    if (normalized.includes(term)) {
      throw new Error("Content policy violation");
    }
  }

  return true;
}

// Use before API calls
try {
  checkContentSafety(userPrompt);
  const output = await replicate.run("model", { input: { prompt: userPrompt } });
} catch (error) {
  console.error("Safety check failed:", error.message);
}
```

**Monitor and log predictions:**
```javascript
async function runWithLogging(identifier, options) {
  const startTime = Date.now();

  try {
    const prediction = await replicate.predictions.create({
      version: identifier,
      input: options.input
    });

    console.log({
      event: "prediction_created",
      id: prediction.id,
      model: identifier,
      timestamp: new Date().toISOString()
    });

    const result = await replicate.wait(prediction);
    const duration = Date.now() - startTime;

    console.log({
      event: "prediction_completed",
      id: result.id,
      status: result.status,
      duration_ms: duration,
      cost_estimate: result.metrics?.predict_time,
      timestamp: new Date().toISOString()
    });

    return result.output;
  } catch (error) {
    console.error({
      event: "prediction_failed",
      error: error.message,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
```

### Cost Management

**Estimate costs before running:**
```javascript
// Pricing varies by hardware
const PRICING = {
  "cpu": 0.0001, // $0.0001/sec
  "gpu-t4": 0.000225, // $0.000225/sec for public models
  "gpu-a40-small": 0.000575,
  "gpu-a40-large": 0.00118,
  "gpu-a100": 0.00385
};

function estimateCost(hardwareSku, estimatedSeconds) {
  const pricePerSecond = PRICING[hardwareSku] || 0;
  return pricePerSecond * estimatedSeconds;
}

// Use deployments for predictable costs
const deployment = await replicate.deployments.create({
  name: "cost-controlled-deployment",
  model: "stability-ai/sdxl",
  version: "version-id",
  hardware: "gpu-t4", // Choose appropriate hardware
  min_instances: 0, // Scale to zero when not in use
  max_instances: 2 // Cap maximum concurrent instances
});
```

**Cancel long-running predictions:**
```javascript
const prediction = await replicate.predictions.create({
  version: "model-version",
  input: { prompt: "test" }
});

// Set timeout to prevent excessive costs
const timeout = setTimeout(async () => {
  console.log("Prediction taking too long, canceling...");
  await replicate.predictions.cancel(prediction.id);
}, 60000); // Cancel after 60 seconds

try {
  const result = await replicate.wait(prediction);
  clearTimeout(timeout);
  return result.output;
} catch (error) {
  clearTimeout(timeout);
  throw error;
}
```

## 8. Production Patterns

### Checking SDK and Model Versions

To check the latest SDK version:
```bash
npm view replicate version
```

To list model versions programmatically:
```javascript
const versions = await replicate.models.versions.list("owner", "model-name");
```

To check model schema and version details from CLI:
```bash
replicate model schema owner/model-name
```

### Error Tracking Integration

```javascript
import * as Sentry from "@sentry/node";

try {
  const output = await replicate.run(identifier, options);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: "replicate",
      model: identifier
    },
    contexts: {
      prediction: {
        input: options.input
      }
    }
  });
  throw error;
}
```

### Account Information

```javascript
const account = await replicate.account.get();
console.log(account.type); // "user" or "organization"
console.log(account.username);
console.log(account.name);
```

### Testing with Mocks

```javascript
import { jest } from '@jest/globals';

jest.mock('replicate');

test('handles prediction success', async () => {
  const mockRun = jest.fn().mockResolvedValue(['output.png']);
  const replicate = { run: mockRun };

  const result = await myFunction(replicate);

  expect(mockRun).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      input: expect.any(Object)
    })
  );
  expect(result).toBeDefined();
});
```

### Input Validation

To inspect a model's expected input/output schema:
```javascript
const version = await replicate.models.versions.get("owner", "model", "version-id");
console.log(version.openapi_schema);
```

From CLI:
```bash
replicate model schema owner/model-name
```

Validation example:
```javascript
import validator from 'validator';

function validatePredictionInput(input) {
  if (!input.prompt || typeof input.prompt !== 'string') {
    throw new Error('Invalid prompt');
  }

  if (input.prompt.length > 10000) {
    throw new Error('Prompt too long');
  }

  if (input.image_url && !validator.isURL(input.image_url)) {
    throw new Error('Invalid image URL');
  }

  return true;
}
```

### Monitoring with Metrics

List and monitor predictions:
```javascript
for await (const prediction of replicate.predictions.list()) {
  console.log(prediction.id, prediction.status);
}
```

Monitor trainings:
```javascript
for await (const training of replicate.trainings.list()) {
  console.log(training.id, training.status);
}
```

Prometheus integration:
```javascript
import prometheus from 'prom-client';

const predictionCounter = new prometheus.Counter({
  name: 'replicate_predictions_total',
  help: 'Total number of predictions',
  labelNames: ['model', 'status']
});

const predictionDuration = new prometheus.Histogram({
  name: 'replicate_prediction_duration_seconds',
  help: 'Prediction duration in seconds',
  labelNames: ['model']
});

async function runWithMetrics(identifier, options) {
  const startTime = Date.now();

  try {
    const output = await replicate.run(identifier, options);
    predictionCounter.inc({ model: identifier, status: 'success' });
    return output;
  } catch (error) {
    predictionCounter.inc({ model: identifier, status: 'error' });
    throw error;
  } finally {
    const duration = (Date.now() - startTime) / 1000;
    predictionDuration.observe({ model: identifier }, duration);
  }
}
```

### Deployment Management

Create deployment:
```javascript
const deployment = await replicate.deployments.create({
  name: "production-deployment",
  model: "stability-ai/sdxl",
  version: "pinned-version-id",
  hardware: "gpu-a40-large",
  min_instances: 2,
  max_instances: 10
});
```

Update deployment:
```javascript
const updated = await replicate.deployments.update(
  "your-username",
  "deployment-name",
  {
    version: "new-version-id",
    min_instances: 0,
    max_instances: 5
  }
);
```

Delete deployment:
```javascript
await replicate.deployments.delete("your-username", "deployment-name");
```

List deployments:
```javascript
for await (const deployment of replicate.deployments.list()) {
  console.log(deployment.owner, deployment.name);
}
```

From CLI:
```bash
replicate model create yourname/model --private --hardware gpu-a40-small
```

### Canceling Predictions

Cancel programmatically:
```javascript
await replicate.predictions.cancel(prediction_id);
```

From CLI:
```bash
replicate prediction cancel <id>
```
