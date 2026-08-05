---
name: llm
description: "Cohere API JavaScript/TypeScript SDK coding guide for LLM, embeddings, and rerank"
metadata:
  languages: "javascript"
  versions: "8.0.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "cohere,llm,ai,embeddings,rerank"
---

# Cohere API JavaScript/TypeScript SDK Coding Guide

## 1. Golden Rule

**Always use the official Cohere JavaScript SDK package:** `cohere-ai` (GitHub: https://github.com/cohere-ai/cohere-typescript)

**Never use deprecated or unofficial libraries.** The `cohere-ai` npm package is the only officially supported Cohere SDK for JavaScript/TypeScript maintained by Cohere. Avoid `cohere-js` (unofficial, different product), `cohere-api-web` (legacy/unofficial), and any other variants.

**Always use `CohereClientV2` for accessing the latest v2 API with current models like `command-a-03-2025`.**

## 2. Installation

### npm
```bash
npm install cohere-ai
```

### yarn
```bash
yarn add cohere-ai
```

### pnpm
```bash
pnpm add cohere-ai
```

**Environment Variables:**
```bash
COHERE_API_KEY=your_api_key_here
# Alternative:
CO_API_KEY=your_api_key_here
```

The SDK automatically reads from either `COHERE_API_KEY` or `CO_API_KEY` environment variables.

## 3. Initialization

### Basic Client Initialization

```javascript
import { CohereClientV2 } from "cohere-ai";

// Uses COHERE_API_KEY or CO_API_KEY environment variable
const cohere = new CohereClientV2({});

// Or pass API key directly
const cohere = new CohereClientV2({
  token: "your-api-key"
});
```

### Authentication Methods

The Cohere API uses Bearer token authentication. The SDK handles this automatically when you provide the API key via the constructor or environment variables.

```javascript
import { CohereClientV2 } from "cohere-ai";

// Best practice: use environment variables
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY
});
```

**Important:** Never hardcode API keys in your source code. Always use environment variables or secure configuration management.

## 4. Core API Surfaces

### Chat API

The Chat API enables conversational AI, text generation, and summarization with Cohere's Command models.

**Minimal Example:**
```javascript
import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({});

const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [
    { role: "user", content: "Explain quantum computing in simple terms" }
  ]
});

console.log(response.message.content[0].text);
```

**Advanced Example with Configuration:**
```javascript
const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [
    {
      role: "system",
      content: "You are a helpful AI assistant specialized in science education."
    },
    {
      role: "user",
      content: "Explain quantum computing"
    }
  ],
  temperature: 0.3,
  maxTokens: 500,
  k: 0,
  p: 0.75,
  stopSequences: ["--END--"],
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  safetyMode: "CONTEXTUAL"
});

console.log(response.message.content[0].text);
```

**Multi-turn Conversation:**
```javascript
const messages = [
  { role: "user", content: "What is machine learning?" },
  { role: "assistant", content: "Machine learning is a subset of AI..." },
  { role: "user", content: "Can you give me an example?" }
];

const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: messages
});
```

### Chat Streaming API

Stream responses in real-time to reduce perceived latency.

**Minimal Example:**
```javascript
import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({});

const stream = await cohere.chatStream({
  model: "command-a-03-2025",
  messages: [
    { role: "user", content: "Write a short story about a robot" }
  ]
});

for await (const chatEvent of stream) {
  if (chatEvent.type === "content-delta") {
    process.stdout.write(chatEvent.delta?.message?.content?.text || "");
  }
}
console.log(); // final newline
```

**Advanced Streaming with Event Handling:**
```javascript
const stream = await cohere.chatStream({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Explain photosynthesis" }],
  temperature: 0.5
});

for await (const event of stream) {
  switch (event.type) {
    case "message-start":
      console.log("Stream started");
      break;
    case "content-start":
      console.log("Content generation began");
      break;
    case "content-delta":
      process.stdout.write(event.delta?.message?.content?.text || "");
      break;
    case "content-end":
      console.log("\nContent generation complete");
      break;
    case "message-end":
      console.log("Stream ended");
      console.log(`Tokens used: ${event.delta?.usage?.tokens}`);
      break;
  }
}
```

### Embed API

Generate vector embeddings for text data to enable semantic search, clustering, and classification.

**Minimal Example:**
```javascript
const embedResponse = await cohere.embed({
  model: "embed-english-v3.0",
  texts: ["Hello world", "Cohere embeddings are powerful"],
  inputType: "search_document"
});

console.log(embedResponse.embeddings);
// Returns array of embedding vectors
```

**Advanced Example with Classification Input Type:**
```javascript
const embedResponse = await cohere.embed({
  model: "embed-multilingual-v3.0",
  texts: [
    "This product is amazing!",
    "Terrible customer service",
    "Neutral statement"
  ],
  inputType: "classification",
  embeddingTypes: ["float"]
});

console.log(`Generated ${embedResponse.embeddings.length} embeddings`);
console.log(`Embedding dimension: ${embedResponse.embeddings[0].length}`);
```

**Available Input Types:** `"search_document"` (for embeddings stored in vector databases), `"search_query"` (for search queries run against vector databases), `"classification"` (for embeddings passed through text classifiers), and `"clustering"` (for embeddings used in clustering algorithms). The `inputType` parameter is **required** for embed-v3 models and later.

**Multilingual Embeddings:**
```javascript
const multilingualEmbed = await cohere.embed({
  model: "embed-multilingual-v3.0",
  texts: [
    "Hello, how are you?",
    "Bonjour, comment allez-vous?",
    "Hola, ¿cómo estás?",
    "こんにちは、お元気ですか？"
  ],
  inputType: "search_document"
});
```

The `embed-multilingual-v3.0` model supports 100+ languages.

### Rerank API

Rerank search results by semantic relevance to improve retrieval quality.

**Minimal Example:**
```javascript
const rerankResponse = await cohere.rerank({
  model: "rerank-english-v3.0",
  query: "What is machine learning?",
  documents: [
    "Machine learning is a subset of artificial intelligence.",
    "Python is a programming language.",
    "Neural networks are computational models inspired by the brain.",
    "JavaScript is used for web development."
  ]
});

// Results ordered by relevance score
rerankResponse.results.forEach((result, idx) => {
  console.log(`${idx + 1}. Score: ${result.relevanceScore}`);
  console.log(`   Document: ${result.document.text}\n`);
});
```

**Advanced Example with Top-N and Metadata:**
```javascript
const documents = [
  { text: "Machine learning algorithms learn from data", id: "doc1" },
  { text: "Supervised learning uses labeled data", id: "doc2" },
  { text: "Deep learning uses neural networks", id: "doc3" },
  { text: "Cooking recipes for dinner", id: "doc4" }
];

const rerankResponse = await cohere.rerank({
  model: "rerank-english-v3.0",
  query: "What are machine learning techniques?",
  documents: documents,
  topN: 3,
  returnDocuments: true
});

console.log("Top ranked documents:");
rerankResponse.results.forEach((result) => {
  console.log(`Document ID: ${result.document.id}`);
  console.log(`Relevance: ${result.relevanceScore}`);
  console.log(`Text: ${result.document.text}\n`);
});
```

**Rerank with Raw Strings:**
```javascript
const query = "artificial intelligence applications";
const docs = [
  "AI is used in healthcare for diagnosis",
  "Machine learning powers recommendation systems",
  "The weather is sunny today",
  "Natural language processing enables chatbots"
];

const result = await cohere.rerank({
  model: "rerank-english-v3.0",
  query: query,
  documents: docs,
  topN: 2
});
```

### Classify API

Classify text into predefined categories using few-shot learning.

**Minimal Example:**
```javascript
const classifyResponse = await cohere.classify({
  model: "embed-english-v3.0",
  inputs: [
    "This movie was fantastic!",
    "Worst experience ever.",
    "It was okay, nothing special."
  ],
  examples: [
    { text: "I loved this!", label: "positive" },
    { text: "Amazing product", label: "positive" },
    { text: "Terrible quality", label: "negative" },
    { text: "Very disappointed", label: "negative" },
    { text: "It's fine", label: "neutral" },
    { text: "Average performance", label: "neutral" }
  ]
});

classifyResponse.classifications.forEach((classification) => {
  console.log(`Text: "${classification.input}"`);
  console.log(`Prediction: ${classification.prediction}`);
  console.log(`Confidence: ${classification.confidence}\n`);
});
```

**Advanced Classification with Multiple Categories:**
```javascript
const trainingExamples = [
  { text: "Fix login bug", label: "bug" },
  { text: "Login page not working", label: "bug" },
  { text: "Add dark mode feature", label: "feature" },
  { text: "Implement user profiles", label: "feature" },
  { text: "Update documentation", label: "documentation" },
  { text: "Improve README", label: "documentation" },
  { text: "How do I install this?", label: "question" },
  { text: "Where is the config file?", label: "question" }
];

const classifyResponse = await cohere.classify({
  model: "embed-english-v3.0",
  inputs: [
    "Cannot reset my password",
    "Need help with setup",
    "Add support for webhooks"
  ],
  examples: trainingExamples
});

classifyResponse.classifications.forEach((item) => {
  console.log(`"${item.input}" → ${item.prediction}`);

  // Show confidence for all labels
  item.labels.forEach((labelConf) => {
    console.log(`  ${labelConf.labelName}: ${labelConf.confidence}`);
  });
});
```

**Requirements:** Minimum 2 examples per label, maximum 2500 examples total, and can classify up to 96 texts in a single request.

## 5. Advanced Features

### RAG (Retrieval Augmented Generation)

Combine Chat, Embed, and Rerank for production-grade RAG systems.

**Complete RAG Example:**
```javascript
import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({});

async function ragPipeline(query, documents) {
  // Step 1: Embed documents
  const embedResponse = await cohere.embed({
    model: "embed-english-v3.0",
    texts: documents,
    inputType: "search_document"
  });

  // Step 2: Embed query
  const queryEmbedResponse = await cohere.embed({
    model: "embed-english-v3.0",
    texts: [query],
    inputType: "search_query"
  });

  // Step 3: Find top candidates using similarity (simplified)
  const topDocs = documents.slice(0, 10); // In production, use vector DB

  // Step 4: Rerank for precision
  const rerankResponse = await cohere.rerank({
    model: "rerank-english-v3.0",
    query: query,
    documents: topDocs,
    topN: 3
  });

  // Step 5: Generate answer with context
  const context = rerankResponse.results
    .map(r => r.document.text)
    .join("\n\n");

  const chatResponse = await cohere.chat({
    model: "command-a-03-2025",
    messages: [
      {
        role: "system",
        content: `Answer the question based on this context:\n\n${context}`
      },
      { role: "user", content: query }
    ]
  });

  return {
    answer: chatResponse.message.content[0].text,
    sources: rerankResponse.results
  };
}

// Usage
const docs = [
  "Machine learning is a subset of AI that enables systems to learn from data.",
  "Deep learning uses neural networks with multiple layers.",
  "Supervised learning requires labeled training data.",
  // ... more documents
];

const result = await ragPipeline("What is machine learning?", docs);
console.log(result.answer);
```

### Tool Use (Function Calling)

Enable the model to call external functions and APIs.

**Minimal Example:**
```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City name"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"]
          }
        },
        required: ["location"]
      }
    }
  }
];

const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [
    { role: "user", content: "What's the weather in San Francisco?" }
  ],
  tools: tools
});

if (response.message.toolCalls) {
  console.log("Function to call:", response.message.toolCalls[0].function.name);
  console.log("Arguments:", response.message.toolCalls[0].function.arguments);
}
```

**Advanced Multi-Step Tool Use:**
```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "search_database",
      description: "Search internal knowledge base",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "integer", default: 5 }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Perform mathematical calculations",
      parameters: {
        type: "object",
        properties: {
          expression: { type: "string" }
        },
        required: ["expression"]
      }
    }
  }
];

// Initial request
let messages = [
  { role: "user", content: "Search for quantum computing papers and calculate citations" }
];

const firstResponse = await cohere.chat({
  model: "command-a-03-2025",
  messages: messages,
  tools: tools
});

// Execute tool calls
if (firstResponse.message.toolCalls) {
  for (const toolCall of firstResponse.message.toolCalls) {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    // Execute function (mock example)
    let result;
    if (functionName === "search_database") {
      result = { papers: ["Paper A", "Paper B"], citations: [42, 38] };
    }

    // Add tool result to conversation
    messages.push({
      role: "tool",
      content: JSON.stringify(result),
      toolCallId: toolCall.id
    });
  }

  // Get final response
  const finalResponse = await cohere.chat({
    model: "command-a-03-2025",
    messages: messages,
    tools: tools
  });

  console.log(finalResponse.message.content[0].text);
}
```

### Web Search Connector

Use Cohere's built-in web search to ground responses in current information.

**Example:**
```javascript
const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [
    { role: "user", content: "What are the latest developments in fusion energy?" }
  ],
  connectors: [{ id: "web-search" }]
});

console.log(response.message.content[0].text);

// Access citations
if (response.message.citations) {
  console.log("\nSources:");
  response.message.citations.forEach((citation) => {
    console.log(`- ${citation.sources[0]}`);
  });
}
```

### Citations

Enable inline citations for transparency and verification.

**Example:**
```javascript
const documents = [
  { id: "doc1", text: "AI was founded as an academic discipline in 1956." },
  { id: "doc2", text: "Machine learning is a subset of AI." },
  { id: "doc3", text: "Deep learning breakthrough occurred in 2012." }
];

const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [
    { role: "user", content: "When was AI founded?" }
  ],
  documents: documents
});

console.log(response.message.content[0].text);

// Access citations
if (response.message.citations) {
  response.message.citations.forEach((citation) => {
    console.log(`\nCitation: "${citation.text}"`);
    console.log(`Source: Document ${citation.documentIds.join(", ")}`);
  });
}
```

## 6. TypeScript Support

The SDK is written in TypeScript and provides full type definitions.

### Type Imports

```typescript
import {
  CohereClientV2,
  ChatRequest,
  ChatResponse,
  ChatStreamRequest,
  EmbedRequest,
  EmbedResponse,
  RerankRequest,
  RerankResponse,
  CohereError,
  CohereTimeoutError
} from "cohere-ai";
```

### Type-Safe Chat

```typescript
import { CohereClientV2, ChatRequest } from "cohere-ai";

const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

const request: ChatRequest = {
  model: "command-a-03-2025",
  messages: [
    { role: "user", content: "Explain TypeScript benefits" }
  ],
  temperature: 0.3,
  maxTokens: 1000
};

const response = await cohere.chat(request);
const text: string = response.message.content[0].text;
```

### Type-Safe Embeddings

```typescript
import { EmbedRequest, EmbedResponse } from "cohere-ai";

const embedRequest: EmbedRequest = {
  model: "embed-english-v3.0",
  texts: ["Sample text"],
  inputType: "classification"
};

const embedResponse: EmbedResponse = await cohere.embed(embedRequest);
const embeddings: number[][] = embedResponse.embeddings;
```

### Custom Types

```typescript
interface DocumentWithMetadata {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
}

async function embedDocuments(docs: DocumentWithMetadata[]) {
  const texts = docs.map(d => d.text);

  const response = await cohere.embed({
    model: "embed-english-v3.0",
    texts: texts,
    inputType: "search_document"
  });

  return docs.map((doc, idx) => ({
    ...doc,
    embedding: response.embeddings[idx]
  }));
}
```

## 7. Best Practices

### Error Handling

**Always wrap API calls in try-catch blocks:**

```javascript
import { CohereClientV2, CohereError, CohereTimeoutError } from "cohere-ai";

const cohere = new CohereClientV2({});

async function generateText(prompt) {
  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [{ role: "user", content: prompt }]
    });
    return response.message.content[0].text;
  } catch (err) {
    if (err instanceof CohereTimeoutError) {
      console.error("Request timed out:", err.message);
      // Retry logic here
    } else if (err instanceof CohereError) {
      console.error(`API Error ${err.statusCode}:`, err.message);
      console.error("Error body:", err.body);

      // Handle specific error codes
      if (err.statusCode === 429) {
        console.error("Rate limit exceeded");
        // Implement backoff strategy
      } else if (err.statusCode === 401) {
        console.error("Invalid API key");
      } else if (err.statusCode === 402) {
        console.error("Billing limit reached");
      }
    } else {
      console.error("Unexpected error:", err);
    }
    throw err;
  }
}
```

### Timeout Configuration

```javascript
// Set custom timeout (default is 60 seconds)
const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Hello" }]
}, {
  timeoutInSeconds: 10
});
```

### Retry Configuration

```javascript
// Configure retries (default: 2 retries with exponential backoff)
// 409 Conflict, 429 Rate Limit, and >=500 errors are automatically retried

const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Hello" }]
}, {
  maxRetries: 3
});

// Disable retries
const responseNoRetry = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Hello" }]
}, {
  maxRetries: 0
});
```

### Rate Limiting

**Trial Keys:** Chat 20 calls/minute, Embed 5 calls/minute, all endpoints 1,000 calls/month total.

**Production Keys:** Chat 500 requests/minute, Embed (Text) 2,000 requests/minute, Embed (Images) 400 requests/minute, Rerank 1,000 requests/minute, unlimited monthly usage.

**Handle rate limits gracefully:**

```javascript
async function chatWithBackoff(messages, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await cohere.chat({
        model: "command-a-03-2025",
        messages: messages
      });
    } catch (err) {
      if (err instanceof CohereError && err.statusCode === 429) {
        if (i < retries - 1) {
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }
}
```

### Model Selection

**Current Production Models (verified May 2026):** `command-a-03-2025` (latest Command A model with 256K context, 111B parameters, highest throughput - 150% faster than Command R+), `command-r-plus-08-2024` (Command R+ with strong reasoning capabilities), `embed-english-v3.0` (English embeddings with 1024 dimensions), `embed-multilingual-v3.0` (multilingual embeddings supporting 100+ languages), `rerank-english-v3.0` (English reranking model), and `rerank-multilingual-v3.0` (multilingual reranking). Verify current model IDs in the Cohere docs before deploying — model availability evolves independently of the SDK version.

**Choosing the right model:**

```javascript
// For general chat and high throughput
const model = "command-a-03-2025";

// For embeddings - English only
const embedModel = "embed-english-v3.0";

// For embeddings - Multilingual
const multilingualEmbedModel = "embed-multilingual-v3.0";

// For reranking search results
const rerankModel = "rerank-english-v3.0";
```

### Temperature Guidelines

**Temperature** controls randomness (0.0 to 1.0, default 0.3):

```javascript
// Deterministic, factual responses
const factualResponse = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "What is 2+2?" }],
  temperature: 0
});

// Balanced (default)
const balancedResponse = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Explain photosynthesis" }],
  temperature: 0.3
});

// Creative, varied responses
const creativeResponse = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Write a poem" }],
  temperature: 0.8
});
```

**Warning:** High temperatures (>0.9) can introduce hallucinations and factually incorrect information.

### Token Management

```javascript
// Control max output length
const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Summarize this in 50 words" }],
  maxTokens: 100
});

// Monitor token usage (available in streaming)
const stream = await cohere.chatStream({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "Hello" }]
});

for await (const event of stream) {
  if (event.type === "message-end" && event.delta?.usage) {
    console.log(`Input tokens: ${event.delta.usage.inputTokens}`);
    console.log(`Output tokens: ${event.delta.usage.outputTokens}`);
  }
}
```

### Security Best Practices

**API Key Management:**

```javascript
// ✅ CORRECT: Use environment variables
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY
});

// ❌ WRONG: Never hardcode API keys
const cohere = new CohereClientV2({
  token: "sk-xxxxxx" // DON'T DO THIS
});
```

**Input Validation:**

```javascript
function validateInput(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }
  if (text.length > 100000) {
    throw new Error("Input too long");
  }
  return text.trim();
}

async function safeChat(userInput) {
  const validatedInput = validateInput(userInput);

  return await cohere.chat({
    model: "command-a-03-2025",
    messages: [{ role: "user", content: validatedInput }]
  });
}
```

**Safety Mode:**

```javascript
// Enable contextual safety filtering
const response = await cohere.chat({
  model: "command-a-03-2025",
  messages: [{ role: "user", content: "User message" }],
  safetyMode: "CONTEXTUAL" // or "STRICT" or "NONE"
});
```

### Performance Optimization

**Batch Embeddings:**

```javascript
// ✅ GOOD: Batch multiple texts in one request
const texts = ["text1", "text2", "text3", /* ... up to 96 texts */];
const response = await cohere.embed({
  model: "embed-english-v3.0",
  texts: texts,
  inputType: "search_document"
});

// ❌ INEFFICIENT: Multiple individual requests
for (const text of texts) {
  await cohere.embed({
    model: "embed-english-v3.0",
    texts: [text],
    inputType: "search_document"
  });
}
```

**Streaming for Long Responses:**

```javascript
// Use streaming for better user experience
async function streamResponse(prompt) {
  const stream = await cohere.chatStream({
    model: "command-a-03-2025",
    messages: [{ role: "user", content: prompt }]
  });

  for await (const event of stream) {
    if (event.type === "content-delta") {
      // Display partial results immediately
      process.stdout.write(event.delta?.message?.content?.text || "");
    }
  }
}
```

**Caching Strategy:**

```javascript
// Cache embeddings to avoid redundant API calls
class EmbeddingCache {
  constructor() {
    this.cache = new Map();
  }

  async getEmbedding(text, cohere) {
    if (this.cache.has(text)) {
      return this.cache.get(text);
    }

    const response = await cohere.embed({
      model: "embed-english-v3.0",
      texts: [text],
      inputType: "search_document"
    });

    const embedding = response.embeddings[0];
    this.cache.set(text, embedding);
    return embedding;
  }
}
```

## 8. Production Checklist

### Version Management

```json
// package.json - Pin exact SDK version
{
  "dependencies": {
    "cohere-ai": "8.0.0"
  }
}
```

- Pin exact SDK version in `package.json`
- `cohere-ai` 8.x requires Node.js 18 or higher
- Review changelog before upgrading
- Test thoroughly in staging before production deployment
- Monitor Cohere's release notes for breaking changes

### Environment Configuration

```javascript
// config.js
const config = {
  development: {
    cohereApiKey: process.env.COHERE_API_KEY_DEV,
    model: "command-a-03-2025",
    timeout: 30,
    maxRetries: 2
  },
  production: {
    cohereApiKey: process.env.COHERE_API_KEY_PROD,
    model: "command-a-03-2025",
    timeout: 60,
    maxRetries: 3
  }
};

const env = process.env.NODE_ENV || "development";
export default config[env];
```

**Environment variables:** Set `COHERE_API_KEY` or `CO_API_KEY`, `NODE_ENV` (development/staging/production), use separate API keys for each environment, and use secret management systems (AWS Secrets Manager, Azure Key Vault, etc.).

### Error Handling & Monitoring

```javascript
import { CohereClientV2, CohereError, CohereTimeoutError } from "cohere-ai";

class CohereService {
  constructor(logger, metrics) {
    this.cohere = new CohereClientV2({
      token: process.env.COHERE_API_KEY
    });
    this.logger = logger;
    this.metrics = metrics;
  }

  async chat(messages, options = {}) {
    const startTime = Date.now();

    try {
      const response = await this.cohere.chat({
        model: "command-a-03-2025",
        messages: messages,
        ...options
      }, {
        timeoutInSeconds: 60,
        maxRetries: 3
      });

      // Log success metrics
      const duration = Date.now() - startTime;
      this.metrics.recordSuccess("chat", duration);
      this.logger.info("Chat request succeeded", {
        duration,
        model: "command-a-03-2025"
      });

      return response;

    } catch (err) {
      const duration = Date.now() - startTime;

      if (err instanceof CohereTimeoutError) {
        this.metrics.recordError("chat", "timeout");
        this.logger.error("Chat request timed out", { duration });
      } else if (err instanceof CohereError) {
        this.metrics.recordError("chat", `http_${err.statusCode}`);
        this.logger.error("Chat request failed", {
          statusCode: err.statusCode,
          message: err.message,
          duration
        });

        // Alert on specific errors
        if (err.statusCode === 429) {
          this.logger.warn("Rate limit exceeded");
        } else if (err.statusCode >= 500) {
          this.logger.error("Cohere service error", { statusCode: err.statusCode });
        }
      } else {
        this.metrics.recordError("chat", "unknown");
        this.logger.error("Unexpected error", { error: err });
      }

      throw err;
    }
  }
}
```

### Validate Responses

```javascript
function validateChatResponse(response) {
  if (!response || !response.message) {
    throw new Error("Invalid response: missing message");
  }

  if (!response.message.content || response.message.content.length === 0) {
    throw new Error("Invalid response: empty content");
  }

  if (!response.message.content[0].text) {
    throw new Error("Invalid response: missing text");
  }

  return true;
}

async function safeChat(messages) {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    messages: messages
  });

  validateChatResponse(response);
  return response.message.content[0].text;
}
```

### Testing Strategy

```javascript
// Mock Cohere client for testing
class MockCohereClient {
  async chat({ messages }) {
    return {
      message: {
        content: [{ text: "Mocked response" }],
        role: "assistant"
      }
    };
  }

  async embed({ texts }) {
    return {
      embeddings: texts.map(() => Array(1024).fill(0))
    };
  }
}

// Test example
describe("CohereService", () => {
  it("should handle chat requests", async () => {
    const mockClient = new MockCohereClient();
    const service = new CohereService(mockClient);

    const response = await service.chat([
      { role: "user", content: "test" }
    ]);

    expect(response.message.content[0].text).toBe("Mocked response");
  });
});
```

### Monitoring Checklist

**Metrics to track:** Request count (by endpoint, model), success rate, error rate (by error type, status code), latency (p50, p95, p99), token usage, rate limit hits, and timeout frequency.

**Logging requirements:** All API errors with context, rate limit warnings, unusual latency spikes, and token usage patterns.

**Alerting:** Error rate > 5%, rate limit exceeded, average latency > 10 seconds, service availability < 99%.

### API Key Rotation

```javascript
class CohereClientManager {
  constructor() {
    this.client = null;
    this.apiKey = null;
  }

  initialize(apiKey) {
    this.apiKey = apiKey;
    this.client = new CohereClientV2({ token: apiKey });
  }

  rotateApiKey(newApiKey) {
    console.log("Rotating API key...");
    this.apiKey = newApiKey;
    this.client = new CohereClientV2({ token: newApiKey });
    console.log("API key rotated successfully");
  }

  getClient() {
    if (!this.client) {
      throw new Error("Client not initialized");
    }
    return this.client;
  }
}

// Usage
const manager = new CohereClientManager();
manager.initialize(process.env.COHERE_API_KEY);

// When rotating keys
manager.rotateApiKey(process.env.NEW_COHERE_API_KEY);
```

### Cost Optimization

**Monitor usage:**

```javascript
class UsageTracker {
  constructor() {
    this.usage = {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0
    };
  }

  async trackChat(messages) {
    this.usage.requests++;

    const stream = await cohere.chatStream({
      model: "command-a-03-2025",
      messages: messages
    });

    for await (const event of stream) {
      if (event.type === "message-end" && event.delta?.usage) {
        this.usage.inputTokens += event.delta.usage.inputTokens || 0;
        this.usage.outputTokens += event.delta.usage.outputTokens || 0;
      }
    }

    return this.getUsage();
  }

  getUsage() {
    return { ...this.usage };
  }
}
```

**Optimize costs:** Use appropriate models (don't use command-a-03-2025 for simple tasks), set reasonable `maxTokens` limits, cache embeddings and rerank results, batch requests when possible, and use streaming to cancel long-running requests early if needed.

### Upgrade to Production API Key

**Trial key limitations:** 20 chat calls/minute, 5 embed calls/minute, 1,000 calls/month total.

**To upgrade:** Add payment method in Cohere dashboard, get production API key, update `COHERE_API_KEY` environment variable, and verify rate limits increased.

**Production benefits:** 500+ requests/minute (varies by endpoint), unlimited monthly usage, priority support, and higher rate limits available on request.

### Compliance & Safety

```javascript
// Content moderation example
async function moderatedChat(userMessage) {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    messages: [{ role: "user", content: userMessage }],
    safetyMode: "STRICT"
  });

  // Log for compliance audit
  auditLogger.log({
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    input: userMessage,
    output: response.message.content[0].text,
    model: "command-a-03-2025"
  });

  return response;
}
```

**Compliance considerations:** Log all interactions for audit trails, implement content filtering, handle PII appropriately, follow data retention policies, and comply with regional regulations (GDPR, CCPA, etc.)

### Deployment Checklist

Ensure API key is stored in secure secret management system, exact SDK version is pinned in `package.json`, comprehensive error handling is implemented, timeout and retry configuration is set, response validation is in place, logging and monitoring is configured, rate limiting is handled gracefully, tests cover error scenarios, load testing is completed, alerting rules are configured, documentation is updated, staging environment is tested, rollback plan is prepared, and team is trained on debugging procedures.

---

## Additional Resources

Access comprehensive documentation and resources using the npm CLI:

```bash
# View package information and links
npm info cohere-ai

# Open package homepage in browser
npm home cohere-ai

# Open package repository in browser
npm repo cohere-ai

# Open package issues page
npm bugs cohere-ai

# View package documentation
npm docs cohere-ai
```

Official documentation available at: https://docs.cohere.com/reference/about
