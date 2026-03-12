---
name: genai
description: "Google Gemini GenAI SDK for multimodal LLM interactions, image generation (Nano Banana), and video generation in JavaScript/TypeScript"
metadata:
  languages: "javascript"
  versions: "1.43.0"
  updated-on: "2026-03-01"
  source: maintainer
  tags: "gemini,google,genai,llm,multimodal,nano banana,imagen,image generation,veo,video generation"
---

# Gemini API Coding Guidelines (JavaScript/TypeScript)

You are a Gemini API coding expert. Help me with writing code using the Gemini
API calling the official libraries and SDKs.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://googleapis.github.io/js-genai/


## Golden Rule: Use the Correct and Current SDK

Always use the Google Gen AI SDK to call the Gemini models, which is the
standard library for all Gemini API interactions. Do not use legacy libraries
and SDKs.

- **Library Name:** Google Gen AI SDK
- **NPM Package:** `@google/genai`
- **Legacy Libraries**: (`@google/generative-ai`) are deprecated

**Installation:**

- **Incorrect:** `npm install @google/generative-ai`
- **Incorrect:** `npm install @google-ai/generativelanguage`
- **Correct:** `npm install @google/genai`

**APIs and Usage:**

- **Incorrect:** `const { GenerativeModel } =
    require('@google/generative-ai')` -> **Correct:** `import { GoogleGenAI }
    from '@google/genai'`
- **Incorrect:** `const model = genai.getGenerativeModel(...)` -> **Correct:**
    `const ai = new GoogleGenAI({apiKey: "..."})`
- **Incorrect:** `await model.generateContent(...)` -> **Correct:** `await
    ai.models.generateContent(...)`
- **Incorrect:** `await model.generateContentStream(...)` -> **Correct:**
    `await ai.models.generateContentStream(...)`
- **Incorrect:** `const generationConfig = { ... }` -> **Correct:** Pass
    configuration directly: `config: { safetySettings: [...] }`
- **Incorrect** `GoogleGenerativeAI`
- **Incorrect** `google.generativeai`
- **Incorrect** `models.create`
- **Incorrect** `ai.models.create`
- **Incorrect** `models.getGenerativeModel`
- **Incorrect** `ai.models.getModel`
- **Incorrect** `ai.models['model_name']`
- **Incorrect** `generationConfig`
- **Incorrect** `GoogleGenAIError` -> **Correct** `ApiError`
- **Incorrect** `GenerateContentResult` -> **Correct**
    `GenerateContentResponse`.
- **Incorrect** `GenerateContentRequest` -> **Correct**
    `GenerateContentParameters`

## Initialization and API key

The `@google/genai` library requires creating a `GoogleGenAI` instance for all
API calls.

- Always use `const ai = new GoogleGenAI({})` to create an instance.
- Set the `GEMINI_API_KEY` environment variable, which will be picked up
    automatically in Node.js environments.

```javascript
import { GoogleGenAI } from '@google/genai';

// Uses the GEMINI_API_KEY environment variable if apiKey not specified
const ai = new GoogleGenAI({});

// Or pass the API key directly
// const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
```

## Models

- By default, use the following models as of March 2026:
    - **General Text & Multimodal Tasks:** `gemini-2.5-flash`
    - **Coding and Complex Reasoning Tasks:** `gemini-2.5-pro`
    - **Image Generation Tasks:** `imagen-4.0-fast-generate-001`,
        `imagen-4.0-generate-001` or `imagen-4.0-ultra-generate-001`
    - **Image Editing Tasks:** `gemini-2.5-flash-image-preview`
    - **Video Generation Tasks:** `veo-3.0-fast-generate-preview` or
        `veo-3.0-generate-preview`.

- It is also acceptable to use the following model if explicitly requested by
    the user:
    - **Gemini 2.0 Series**: `gemini-2.0-flash`, `gemini-2.0-pro`

- Do not use the following deprecated models (or their variants like
    `gemini-1.5-flash-latest`):
    - **Prohibited:** `gemini-1.5-flash`
    - **Prohibited:** `gemini-1.5-pro`
    - **Prohibited:** `gemini-pro`

## Basic Inference (Text Generation)

Here's how to generate a response from a text prompt.

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({}); // Assumes GEMINI_API_KEY is set

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'why is the sky blue?',
  });

  console.log(response.text); // output is often markdown
}

run();
```

Multimodal inputs are supported by passing file data in the `contents` array.

```javascript
import { GoogleGenAI, Part } from '@google/genai';
import * as fs from 'fs';

const ai = new GoogleGenAI({});

// Converts local file information to a Part object.
function fileToGenerativePart(path, mimeType): Part {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
    const imagePart = fileToGenerativePart("path/to/image.jpg", "image/jpeg");

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [imagePart, "explain that image"],
    });

    console.log(response.text); // The output often is markdown
}

run();
```

You can use this approach to pass a variety of data types (images, audio, video,
pdf). For PDF, use `application/pdf` as `mimeType`.

For larger files, use `ai.files.upload`:

```javascript
import { GoogleGenAI, createPartFromUri, createUserContent } from '@google/genai';
const ai = new GoogleGenAI({});

async function run() {
    const f = await ai.files.upload({
        file: 'path/to/sample.mp3',
        config:{mimeType: 'audio/mp3'},
    });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
         contents: createUserContent([
          createPartFromUri(f.uri, f.mimeType),
          "Describe this audio clip"
        ])
    });

    console.log(response.text);
}

run();
```

You can delete files after use like this:

```javascript
const myFile = await ai.files.upload({file: 'path/to/sample.mp3', mimeType: 'audio/mp3'});
await ai.files.delete({name: myFile.name});
```

## Additional Capabilities and Configurations

Below are examples of advanced configurations.

### Thinking

Gemini 2.5 series models support thinking, which is on by default for
`gemini-2.5-flash`. It can be adjusted by using `thinking_budget` setting.
Setting it to zero turns thinking off, and will reduce latency.

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: "Provide a list of 3 famous physicists and their key contributions",
    config: {
      thinkingConfig: {
        thinkingBudget: 1024,
        // Turn off thinking:
        // thinkingBudget: 0
        // Turn on dynamic thinking:
        // thinkingBudget: -1
      },
    },
  });

  console.log(response.text);
}

main();
```

IMPORTANT NOTES:

- Minimum thinking budget for `gemini-2.5-pro` is `128` and thinking can not
    be turned off for that model.
- No models (apart from Gemini 2.5 series) support thinking or thinking
    budgets APIs. Do not try to adjust thinking budgets other models (such as
    `gemini-2.0-flash` or `gemini-2.0-pro`) otherwise it will cause syntax
    errors.

### System instructions

Use system instructions to guide the model's behavior.

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function run() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Hello.",
        config: {
            systemInstruction: "You are a pirate",
        }
    });
    console.log(response.text);
}
run();
```

### Hyperparameters

You can also set `temperature` or `maxOutputTokens` within the `config` object.
**Avoid** setting `maxOutputTokens`, `topP`, `topK` unless explicitly requested
by the user.

### Safety configurations

Avoid setting safety configurations unless explicitly requested by the user. If
explicitly asked for by the user, here is a sample API:

```javascript
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from '@google/genai';
import * as fs from 'fs';

const ai = new GoogleGenAI({});

function fileToGenerativePart(path, mimeType): Part {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
    const img = fileToGenerativePart("/path/to/img.jpg", "image/jpeg");
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: ['Do these look store-bought or homemade?', img],
        config: {
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                },
            ]
        }
    });
    console.log(response.text);
}
run();
```

### Streaming

It is possible to stream responses to reduce user perceived latency:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});

async function run() {
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: ["Explain how AI works"],
  });

  for await (const chunk of responseStream) {
    process.stdout.write(chunk.text);
  }
  console.log(); // for a final newline
}
run();
```

### Chat

For multi-turn conversations, use the `chats` service to maintain conversation
history.

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function run() {
    const chat = ai.chats.create({model: "gemini-2.5-flash"});

    let response = await chat.sendMessage({message:"I have 2 dogs in my house."});
    console.log(response.text);

    response = await chat.sendMessage({message: "How many paws are in my house?"});
    console.log(response.text);

    const history = await chat.getHistory();
    for (const message of history) {
        console.log(`role - ${message.role}: ${message.parts[0].text}`);
    }
}
run();
``` It is also possible to use streaming with Chat:

```javascript
    const chat = ai.chats.create({model: "gemini-2.5-flash"});
    const stream = await chat.sendMessageStream({message:"I have 2 dogs in my house."});
    for await (const chunk of stream) {
      console.log(chunk.text);
      console.log("_".repeat(80));
    }
```

Note: ai.chats.create({model}) returns `Chat` under `@google/genai` which tracks
the session.

### Structured outputs

Ask the model to return a response in JSON format.

The recommended way is to configure a `responseSchema` for the expected output.

See the available types below that can be used in the `responseSchema`.

```javascript
export enum Type {
  /**
   * Not specified, should not be used.
   */
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
  /**
   * OpenAPI string type
   */
  STRING = 'STRING',
  /**
   * OpenAPI number type
   */
  NUMBER = 'NUMBER',
  /**
   * OpenAPI integer type
   */
  INTEGER = 'INTEGER',
  /**
   * OpenAPI boolean type
   */
  BOOLEAN = 'BOOLEAN',
  /**
   * OpenAPI array type
   */
  ARRAY = 'ARRAY',
  /**
   * OpenAPI object type
   */
  OBJECT = 'OBJECT',
  /**
   * Null type
   */
  NULL = 'NULL',
}
```

`Type.OBJECT` cannot be empty; it must contain other properties.

```javascript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});
const response = await ai.models.generateContent({
   model: "gemini-2.5-flash",
   contents: "List a few popular cookie recipes, and include the amounts of ingredients.",
   config: {
     responseMimeType: "application/json",
     responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
              description: 'The name of the recipe.',
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'The ingredients for the recipe.',
            },
          },
          propertyOrdering: ["recipeName", "ingredients"],
        },
      },
   },
});

let jsonStr = response.text.trim();
```

The `jsonStr` might look like this:

```javascript
[
  {
    "recipeName": "Chocolate Chip Cookies",
    "ingredients": [
      "1 cup (2 sticks) unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "1 teaspoon vanilla extract",
      "2 large eggs",
      "2 1/4 cups all-purpose flour",
      "1 teaspoon baking soda",
      "1 teaspoon salt",
      "2 cups chocolate chips"
    ]
  },
  ...
]
```

#### Function Calling (Tools)

You can provide the model with tools (functions) it can use to bring in external
information to answer a question or act on a request outside the model.

```javascript
import {GoogleGenAI, FunctionDeclaration, Type} from '@google/genai';
const ai = new GoogleGenAI({});

async function run() {
    const controlLightDeclaration = {
        name: 'controlLight',
        parameters: {
          type: Type.OBJECT,
          description: 'Set brightness and color temperature of a light.',
          properties: {
            brightness: { type: Type.NUMBER, description: 'Light level from 0 to 100.' },
            colorTemperature: { type: Type.STRING, description: '`daylight`, `cool`, or `warm`.'},
          },
          required: ['brightness', 'colorTemperature'],
        },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Dim the lights so the room feels cozy and warm.',
        config: {
            tools: [{functionDeclarations: [controlLightDeclaration]}]
        }
    });

    if (response.functionCalls) {
        console.log(response.functionCalls);
        // In a real app, you would execute the function and send the result back.
    }
}
run();
```

### Generate Images

Here's how to generate images using the Imagen models.

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function run() {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-fast-generate-001',
        prompt: 'A friendly robot holding a red skateboard, minimalist vector art',
        config: {
          numberOfImages: 1, // 1 to 4 (always 1 for the ultra model)
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1', // "1:1", "3:4", "4:3", "9:16", or "16:9"
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    // This can be used directly in an <img> src attribute
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    console.log(imageUrl);
}
run();
```

Note: Do not include negativePrompts in config, it's not supported.

### Edit Images

Editing images is better done using the Gemini native image generation model.
Configs are not supported in this model (except modality).

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image-preview',
  contents: [imagePart, 'koala eating a nano banana']
});
for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    const base64ImageBytes: string = part.inlineData.data;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
  }
}
```

### Generate Videos

Here's how to generate videos using the Veo models. Usage of Veo can be costly,
so after generating code for it, give user a heads up to check pricing for Veo.

```javascript
import { GoogleGenAI } from "@google/genai";
import { createWriteStream } from "fs";
import { Readable } from "stream";

const ai = new GoogleGenAI({});

async function main() {
  let operation = await ai.models.generateVideos({
    model: "veo-3.0-fast-generate-preview",
    prompt: "Panning wide shot of a calico kitten sleeping in the sunshine",
    config: {
      personGeneration: "dont_allow",
      aspectRatio: "16:9",
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  operation.response?.generatedVideos?.forEach(async (generatedVideo, n) => {
    const resp = await fetch(`${generatedVideo.video?.uri}&key=GEMINI_API_KEY`); // append your API key
    const writer = createWriteStream(`video${n}.mp4`);
    Readable.fromWeb(resp.body).pipe(writer);
  });
}

main();
```

### Search Grounding

Google Search can be used as a tool for grounding queries that with up to date
information from the web.

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function run() {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: "Who won the latest F1 race?",
       config: {
         tools: [{googleSearch: {}}],
       },
    });

    console.log("Response:", response.text);

    // Extract and display grounding URLs
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (searchChunks) {
        const urls = searchChunks.map(chunk => chunk.web.uri);
        console.log("Sources:", urls);
    }
}
run();
```

### Content and Part Hierarchy

While the simpler API call is often sufficient, you may run into scenarios where
you need to work directly with the underlying `Content` and `Part` objects for
more explicit control. These are the fundamental building blocks of the
`generateContent` API.

For instance, the following simple API call:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});

async function run() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "How does AI work?",
    });
    console.log(response.text);
}
run();
```

is effectively a shorthand for this more explicit structure:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});

async function run() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { role: "user", parts: [{ text: "How does AI work?" }] },
        ],
    });
    console.log(response.text);
}
run();
```

## API Errors

`ApiError` from `@google/genai` extends from EcmaScript `Error` and has
`message`, `name` fields in addition to `status` (HTTP Code).

## Other APIs

The list of APIs and capabilities above are not comprehensive. If users ask you
to generate code for a capability not provided above, refer them to
https://googleapis.github.io/js-genai/.

## Useful Links

- Documentation: ai.google.dev/gemini-api/docs
- API Keys and Authentication: ai.google.dev/gemini-api/docs/api-key
- Models: ai.google.dev/models
- API Pricing: ai.google.dev/pricing
- Rate Limits: ai.google.dev/rate-limits
