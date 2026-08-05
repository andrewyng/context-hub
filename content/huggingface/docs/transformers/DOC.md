---
name: transformers
description: "Transformers.js coding guidelines for running ML models in the browser or Node.js"
metadata:
  languages: "javascript"
  versions: "4.2.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "huggingface,transformers,ml,inference,models"
---

# Transformers.js Coding Guidelines (JavaScript/TypeScript)

You are a Transformers.js expert. Help me with writing code using the Transformers.js library for running machine learning models directly in the browser or Node.js.

Please follow the following guidelines when generating code.

You can find the official documentation and examples here:
https://huggingface.co/docs/transformers.js/

## Golden Rule: Use the Correct and Current Package

Always use the official Transformers.js package `@huggingface/transformers` for all machine learning inference tasks. This is the standard library for running transformer models in JavaScript environments.

- **Library Name:** Transformers.js
- **NPM Package:** `@huggingface/transformers`
- **Current Version:** 4.2.0

**Installation:**

- **Correct:** `npm i @huggingface/transformers`
- **Browser CDN:** `https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0`

**Main APIs and Usage:**

- **Correct:** `import { pipeline } from '@huggingface/transformers'`
- **Correct:** `const pipe = await pipeline('task-name')`
- **Correct:** `const result = await pipe(input)` 

## Installation and Setup

### Browser Installation

For browser environments, you can use either NPM or CDN:

**NPM Installation:**
```bash
npm i @huggingface/transformers
```

**CDN Installation:**
```html
<script type="module">
    import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
</script>
```


### Node.js Installation

For Node.js environments, install via NPM and configure your project:

**ESM (Recommended):**
To indicate that your project uses ECMAScript modules, you need to add `"type": "module"` to your `package.json`:

```json
{
  //...
  "type": "module",
  //...
}
```

**CommonJS:**
Use dynamic imports for Transformers.js

Following that, let's import Transformers.js and define the `MyClassificationPipeline` class. Since Transformers.js is an ESM module, we will need to dynamically import the library using the [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) function:

```javascript
class MyClassificationPipeline {
  static task = 'text-classification';
  static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // Dynamically import the Transformers.js library
      let { pipeline, env } = await import('@huggingface/transformers');

      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}
```

## Basic Inference (Text Processing)

The `pipeline()` function is the easiest way to use pretrained models:

```javascript
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('sentiment-analysis');
```

**Text Classification Example:**

```javascript
const result = await classifier('I love transformers!');
// [{'label': 'POSITIVE', 'score': 0.9998}]
```


**Multiple Inputs:**

```javascript
const result = await classifier(['I love transformers!', 'I hate transformers!']);
// [{'label': 'POSITIVE', 'score': 0.9998}, {'label': 'NEGATIVE', 'score': 0.9982}]
```

**Custom Models:**
```javascript
const reviewer = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');

const result = await reviewer('The Shawshank Redemption is a true masterpiece of cinema.');
// [{label: '5 stars', score: 0.8167929649353027}]
```

## Multimodal Input Support

Transformers.js supports various input types including images, audio, and video:

**Image Processing:**

By default, when running in the browser, the model will be run on your CPU (via WASM). If you would like
to run the model on your GPU (via WebGPU), you can do this by setting `device: 'webgpu'`, for example:
```javascript
// Run the model on WebGPU
const pipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
  device: 'webgpu',
});
```

For more information, check out the [WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu).



In resource-constrained environments, such as web browsers, it is advisable to use a quantized version of
the model to lower bandwidth and optimize performance. This can be achieved by adjusting the `dtype` option,
which allows you to select the appropriate data type for your model. While the available options may vary
depending on the specific model, typical choices include `"fp32"` (default for WebGPU), `"fp16"`, `"q8"`
(default for WASM), and `"q4"`. For more information, check out the [quantization guide](https://huggingface.co/docs/transformers.js/guides/dtypes).
```javascript
// Run the model at 4-bit quantization
const pipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
  dtype: 'q4',
});
```

**Audio Processing (ASR):**



## Device Configuration

### WebGPU Acceleration

For GPU acceleration in browsers, use the `device: 'webgpu'` option: 

**WebGPU Usage Example:** 

### Device Options

Available device options include:
- `'cpu'` - CPU execution (default for Node.js)
- `'wasm'` - WebAssembly execution (default for browsers)  
- `'webgpu'` - GPU acceleration (browsers with WebGPU support)
- `'webnn'` - Web Neural Network API acceleration 

## Quantization and Data Types

### Basic Quantization

Use the `dtype` parameter to control model precision and size: 

**Available dtypes:**
- `"fp32"` - Full precision (default for WebGPU)
- `"fp16"` - Half precision
- `"q8"` - 8-bit quantization (default for WASM)
- `"q4"` - 4-bit quantization (smallest size) 

**Basic Quantization Example:** 

### Per-Module Quantization

For complex models, you can specify different quantization levels per module: 

## Environment Configuration

### Global Settings

Configure Transformers.js behavior using the `env` object: 

**Common Configuration Options:**

- **Remote Models:** `env.allowRemoteModels = false`
- **Local Model Path:** `env.localModelPath = '/path/to/models/'`
- **Cache Directory:** `env.cacheDir = '/path/to/cache/'` 

### Node.js Specific Settings

For Node.js applications, you can customize caching and model loading: 

**Default Cache Location:**
- Node.js: `node_modules/@huggingface/transformers/.cache/`
- Models are organized by author/model-name subdirectories
- Each model contains config.json, tokenizer files, and ONNX weights in an `onnx/` subfolder 

## Pipeline Options and Generation Parameters

### Loading Options

Control how models are loaded with PretrainedOptions: 

**Model Revision:** 

**Available Options:**
```javascript
const pipe = await pipeline('task-name', 'model-name', {
  device: 'webgpu',           // 'cpu', 'wasm', 'webgpu', 'webnn'
  dtype: 'q8',                // 'fp32', 'fp16', 'q8', 'q4'
  progress_callback: (info) => console.log(info),  // Track download progress
  revision: 'main',           // Specific model revision/branch
});
```

### Generation Parameters

For text generation models, use GenerationConfig options: 

**Common Generation Options:**
```javascript
const result = await generator(prompt, {
  max_new_tokens: 50,        // Maximum tokens to generate
  temperature: 0.9,          // Randomness (0.0 = deterministic, 1.0+ = creative)
  do_sample: true,           // Enable sampling (required for temperature/top_k)
  top_k: 50,                 // Consider only top K tokens
  repetition_penalty: 2.0,   // Penalize repetition
  no_repeat_ngram_size: 3,   // Prevent n-gram repetition
});
```

### Feature Extraction Options

For embedding models, specify pooling and normalization:

```javascript
const embeddings = await extractor(texts, {
  pooling: 'mean',           // 'mean', 'max', 'cls'
  normalize: true            // L2 normalization for similarity tasks
});

// Convert tensor to array
const embeddingArray = embeddings.tolist();
``` 

### Streaming Output

Enable streaming for real-time text generation: 

## Translation and Multilingual Models

### Available Translation Models

Transformers.js supports several translation model families on Hugging Face Hub:

**OPUS-MT Models (Recommended for Lightweight Use):**
- Lightweight, fast translation models from the Marian framework
- Trained on OPUS multilingual data by Helsinki-NLP
- Available as Xenova-converted ONNX models for browser compatibility
- Examples: `Xenova/opus-mt-en-es`, `Xenova/opus-mt-en-fr`, `Xenova/opus-mt-ja-en`
- Best for: Single language-pair translation, browser applications, fast inference

**NLLB (No Language Left Behind):**
- Meta's multilingual model supporting 200+ languages
- Models: `Xenova/nllb-200-distilled-600M` (and larger variants)
- Requires more resources but supports many language pairs
- Best for: Multi-language support, low-resource languages

**mBART Models:**
- Facebook's multilingual translation models
- Good for document-level translation

### Translation Usage

For translation tasks, specify source and target languages: 

**Language Code Format:**
- OPUS-MT models: Often work with simple language codes
- NLLB models: Use codes like `eng_Latn`, `spa_Latn`, `fra_Latn`, etc.
- Check model card on Hugging Face for supported language codes

**Important Notes:**
- OPUS-MT models are typically single-direction (e.g., EN→ES only)
- For bi-directional translation, you need two separate OPUS-MT models
- NLLB models support multiple directions but are much larger
- Translation quality and speed vary significantly between model families 

## Supported Tasks

### Natural Language Processing

Main NLP tasks include:
- Text Classification (`text-classification` or `sentiment-analysis`)
- Question Answering (`question-answering`)
- Text Generation (`text-generation`)
- Translation (`translation`)
- Summarization (`summarization`)
- Token Classification (`token-classification` or `ner`)
- Fill Mask (`fill-mask`)
- Zero-Shot Classification (`zero-shot-classification`)
- Feature Extraction (`feature-extraction`) 

**Recommended Models by Task:**

- **Sentiment Analysis:** `Xenova/distilbert-base-uncased-finetuned-sst-2-english` (fast, accurate)
- **Text Generation:** `Xenova/gpt2` (lightweight), `onnx-community/Qwen2.5-Coder-0.5B-Instruct` (code/chat)
- **Feature Extraction:** `Xenova/all-MiniLM-L6-v2` (384-dim embeddings, fast)
- **Translation:** `Xenova/opus-mt-*` series (lightweight, language-specific)
- **Question Answering:** `Xenova/distilbert-base-cased-distilled-squad` 

### Computer Vision

Vision tasks include:
- Image Classification (`image-classification`)
- Object Detection (`object-detection`)
- Image Segmentation (`image-segmentation`)
- Depth Estimation (`depth-estimation`)
- Background Removal (`background-removal`)
- Image-to-Image (`image-to-image`)
- Image Feature Extraction (`image-feature-extraction`) 

### Audio Processing

Audio tasks include:
- Automatic Speech Recognition (`automatic-speech-recognition`)
- Audio Classification (`audio-classification`)
- Text-to-Speech (`text-to-speech` or `text-to-audio`)  

### Multimodal

Multimodal tasks include:
- Document Question Answering (`document-question-answering`)
- Image-to-Text (`image-to-text`)
- Zero-Shot Image Classification (`zero-shot-image-classification`)
- Zero-Shot Audio Classification (`zero-shot-audio-classification`)
- Zero-Shot Object Detection (`zero-shot-object-detection`) 

## Framework Integration

### Node.js Server Example

Create a basic HTTP server with Transformers.js: 

Use the singleton pattern for efficient model loading:

## Error Handling and Best Practices

### General Best Practices

- Always await pipeline creation and inference calls
- Use lazy loading patterns (singleton pattern) for efficient model loading
- Enable WebGPU when available for better performance in browsers
- Choose appropriate quantization levels based on your requirements
- Cache models locally for production applications

### Singleton Pattern for Model Loading

Use the singleton pattern to load models once and reuse them across requests:

```javascript
class MyPipeline {
  static task = 'sentiment-analysis';
  static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      const { pipeline, env } = await import('@huggingface/transformers');

      // Configure environment if needed
      // env.cacheDir = './.cache';

      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}
```

### Model Loading Warnings

When loading models, you may see dtype warnings in the console:

```
dtype not specified for "model". Using the default dtype (fp32) for this device (cpu).
```

These are informational warnings and can be safely ignored. To suppress them, explicitly specify the dtype:

```javascript
const pipe = await pipeline('task-name', 'model-name', {
  dtype: 'q8'  // or 'fp32', 'fp16', 'q4', etc.
});
```

### Common Issues and Solutions

**Model Cache Issues:**
- If a model fails to load with "Protobuf parsing failed" errors, the cached model may be corrupted
- Clear the cache directory (default: `node_modules/@huggingface/transformers/.cache/`)
- Consider using a different model or switching to a lighter variant

**Translation Models:**
- Large translation models (600M+ parameters) may be too heavy for browser environments
- Prefer lightweight OPUS-MT models for single language pairs
- NLLB models require significant memory and may time out in resource-constrained environments

**Response Structure:**
- Different pipelines return different response structures
- Sentiment analysis: `[{label: 'POSITIVE', score: 0.99}]`
- Translation: `[{translation_text: 'Hola mundo'}]`
- Feature extraction: Returns tensor objects, use `.tolist()` to convert to arrays
- Question answering: `{answer: 'text', score: 0.95}`
- Text generation: `[{generated_text: 'text'}]`

## Model Conversion

To use custom models, convert them to ONNX format:

The conversion script supports quantization:

## Version-Sensitive Notes For 4.2.0

- `@huggingface/transformers` `4.x` introduced a new WebGPU runtime rewritten in C++ while keeping the high-level API (`pipeline`, `AutoModel*`, etc.) backward-compatible with `3.x` code.
- WebGPU is now usable from Node.js, Bun, and Deno in addition to browsers.
- New `env` knobs in 4.x include `env.useWasmCache` for offline-capable apps, `env.logLevel` to control logging, and `env.fetch` to plug in a custom fetch (useful for authenticated model access).
- A `ModelRegistry` API gives explicit visibility into pipeline assets when you need to introspect or pre-cache them.
- Expanded model coverage in the `4.x` line includes newer architectures such as Gemma family, DeepSeek-v3-class models, Mamba-style state-space models, and MoE variants.

## Useful Links

- Documentation: https://huggingface.co/docs/transformers.js
- NPM Package: https://www.npmjs.com/package/@huggingface/transformers
- GitHub Repository: https://github.com/huggingface/transformers.js
- Model Hub (transformers.js compatible): https://huggingface.co/models?library=transformers.js
- Examples and Templates: https://github.com/huggingface/transformers.js-examples

## Notes

This is a comprehensive guide for using Transformers.js in JavaScript applications. The library is designed to be functionally equivalent to Hugging Face's Python transformers library but optimized for JavaScript environments. It supports running inference in browsers, Node.js, and web workers using ONNX Runtime for optimal performance.

Key advantages include:
- No server required for inference
- Support for quantized models for better performance
- WebGPU acceleration when available
- Comprehensive task coverage across NLP, computer vision, and audio
- Easy integration with existing JavaScript applications

### Citations

```markdown
To install via [NPM](https://www.npmjs.com/package/@huggingface/transformers), run:
```bash
npm i @huggingface/transformers
```
```

```markdown
Alternatively, you can use it in vanilla JS, without any bundler, by using a CDN or static hosting. For example, using [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), you can import the library with:
```html
<script type="module">
    import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
</script>
```
```

```markdown
By default, when running in the browser, the model will be run on your CPU (via WASM). If you would like
to run the model on your GPU (via WebGPU), you can do this by setting `device: 'webgpu'`, for example:
```javascript
// Run the model on WebGPU
const pipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
  device: 'webgpu',
});
```

For more information, check out the [WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu).

> [!WARNING]
> The WebGPU API is still experimental in many browsers, so if you run into any issues,
> please file a [bug report](https://github.com/huggingface/transformers.js/issues/new?title=%5BWebGPU%5D%20Error%20running%20MODEL_ID_GOES_HERE&assignees=&labels=bug,webgpu&projects=&template=1_bug-report.yml).

In resource-constrained environments, such as web browsers, it is advisable to use a quantized version of
the model to lower bandwidth and optimize performance. This can be achieved by adjusting the `dtype` option,
which allows you to select the appropriate data type for your model. While the available options may vary
depending on the specific model, typical choices include `"fp32"` (default for WebGPU), `"fp16"`, `"q8"`
(default for WASM), and `"q4"`. For more information, check out the [quantization guide](https://huggingface.co/docs/transformers.js/guides/dtypes).
```javascript
// Run the model at 4-bit quantization
const pipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
  dtype: 'q4',
});
```
```

```markdown
```javascript
import { env } from '@huggingface/transformers';

// Specify a custom location for models (defaults to '/models/').
env.localModelPath = '/path/to/models/';

// Disable the loading of remote models from the Hugging Face Hub:
env.allowRemoteModels = false;

// Set location of .wasm files. Defaults to use a CDN.
env.backends.onnx.wasm.wasmPaths = '/path/to/files/';
```
```

```markdown
```bash
python -m scripts.convert --quantize --model_id <model_name_or_path>
```

For example, convert and quantize [bert-base-uncased](https://huggingface.co/bert-base-uncased) using:
```bash
python -m scripts.convert --quantize --model_id bert-base-uncased
```

```

```markdown
This will save the following files to `./models/`:

```
bert-base-uncased/
├── config.json
├── tokenizer.json
├── tokenizer_config.json
└── onnx/
    ├── model.onnx
    └── model_quantized.onnx
```
```

```markdown
To indicate that your project uses ECMAScript modules, you need to add `"type": "module"` to your `package.json`:

```json
{
  ...
  "type": "module",
  ...
}
```
```

```markdown
class MyClassificationPipeline {
  static task = 'text-classification';
  static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}
```
```

```markdown
Following that, let's import Transformers.js and define the `MyClassificationPipeline` class. Since Transformers.js is an ESM module, we will need to dynamically import the library using the [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) function:

```javascript
class MyClassificationPipeline {
  static task = 'text-classification';
  static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // Dynamically import the Transformers.js library
      let { pipeline, env } = await import('@huggingface/transformers');

      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}
```
```

```markdown
// Define the HTTP server
const server = http.createServer();
const hostname = '127.0.0.1';
const port = 3000;

// Listen for requests made to the server
server.on('request', async (req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url);

  // Extract the query parameters
  const { text } = querystring.parse(parsedUrl.query);

  // Set the response headers
  res.setHeader('Content-Type', 'application/json');

  let response;
  if (parsedUrl.pathname === '/classify' && text) {
    const classifier = await MyClassificationPipeline.getInstance();
    response = await classifier(text);
    res.statusCode = 200;
  } else {
    response = { 'error': 'Bad request' }
    res.statusCode = 400;
  }

  // Send the JSON response
  res.end(JSON.stringify(response));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

```
```

```markdown
### Model caching

By default, the first time you run the application, it will download the model files and cache them on your file system (in `./node_modules/@huggingface/transformers/.cache/`). All subsequent requests will then use this model. You can change the location of the cache by setting `env.cacheDir`. For example, to cache the model in the `.cache` directory in the current working directory, you can add:

```javascript
env.cacheDir = './.cache';
```

### Use local models

If you want to use local model files, you can set `env.localModelPath` as follows:

```javascript
// Specify a custom location for models (defaults to '/models/').
env.localModelPath = '/path/to/models/';
```

You can also disable loading of remote models by setting `env.allowRemoteModels` to `false`:

```javascript
// Disable the loading of remote models from the Hugging Face Hub:
env.allowRemoteModels = false;
```

```markdown
```javascript
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('sentiment-analysis');
```

```

```markdown
```javascript
const result = await classifier('I love transformers!');
// [{'label': 'POSITIVE', 'score': 0.9998}]
```
```

```markdown
```javascript
const result = await classifier(['I love transformers!', 'I hate transformers!']);
// [{'label': 'POSITIVE', 'score': 0.9998}, {'label': 'NEGATIVE', 'score': 0.9982}]
```
```

```markdown
```javascript
const reviewer = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');

const result = await reviewer('The Shawshank Redemption is a true masterpiece of cinema.');
// [{label: '5 stars', score: 0.8167929649353027}]
```
```

```markdown
// Create a pipeline for Automatic Speech Recognition
const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small.en');

// Transcribe an audio file, loaded from a URL.
const result = await transcriber('https://huggingface.co/datasets/Narsil/asr_dummy/resolve/main/mlk.flac');
// {text: ' I have a dream that one day this nation will rise up and live out the true meaning of its creed.'}
```
```

```markdown
// Create a pipeline for feature extraction, using the full-precision model (fp32)
const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    dtype: "fp32",
});
```
Check out the section on [quantization](./guides/dtypes) to learn more.
```

```markdown
```javascript
const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
    revision: 'output_attentions',
});
```
```

```markdown
// Create a pipeline for translation
const translator = await pipeline('translation', 'Xenova/nllb-200-distilled-600M');

// Translate from English to Greek
const result = await translator('I like to walk my dog.', {
    src_lang: 'eng_Latn',
    tgt_lang: 'ell_Grek'
});
// [ { translation_text: 'Μου αρέσει να περπατάω το σκυλί μου.' } ]

// Translate back to English
const result2 = await translator(result[0].translation_text, {
    src_lang: 'ell_Grek',
    tgt_lang: 'eng_Latn'
});
// [ { translation_text: 'I like to walk my dog.' } ]
```
```

```markdown
```javascript
// Create a pipeline for text2text-generation
const poet = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
const result = await poet('Write me a love poem about cheese.', {
    max_new_tokens: 200,
    temperature: 0.9,
    repetition_penalty: 2.0,
    no_repeat_ngram_size: 3,
});
```
```

```markdown
Some pipelines such as `text-generation` or `automatic-speech-recognition` support streaming output. This is achieved using the `TextStreamer` class. For example, when using a chat model like `Qwen2.5-Coder-0.5B-Instruct`, you can specify a callback function that will be called with each generated token text (if unset, new tokens will be printed to the console).

```js
import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
  { dtype: "q4" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content:  "Write a quick sort algorithm." },
];

// Create text streamer
const streamer = new TextStreamer(generator.tokenizer, {
  skip_prompt: true,
  // Optionally, do something with the text (e.g., write to a textbox)
  // callback_function: (text) => { /* Do something with text */ },
})

// Generate a response
const result = await generator(messages, { max_new_tokens: 512, do_sample: false, streamer });
```
```

```markdown
```js
import { pipeline } from "@huggingface/transformers";

// Create a feature-extraction pipeline
const extractor = await pipeline(
  "feature-extraction",
  "mixedbread-ai/mxbai-embed-xsmall-v1",
  { device: "webgpu" },
);

// Compute embeddings
const texts = ["Hello world!", "This is an example sentence."];
const embeddings = await extractor(texts, { pooling: "mean", normalize: true });
console.log(embeddings.tolist());
// [
//   [-0.016986183822155, 0.03228696808218956, -0.0013630966423079371, ... ],
//   [0.09050482511520386, 0.07207386940717697, 0.05762749910354614, ... ],
// ]
```
```

```markdown
Before Transformers.js v3, we used the `quantized` option to specify whether to use a quantized (q8) or full-precision (fp32) variant of the model by setting `quantized` to `true` or `false`, respectively. Now, we've added the ability to select from a much larger list with the `dtype` parameter.

The list of available quantizations depends on the model, but some common ones are: full-precision (`"fp32"`), half-precision (`"fp16"`), 8-bit (`"q8"`, `"int8"`, `"uint8"`), and 4-bit (`"q4"`, `"bnb4"`, `"q4f16"`).

```

```markdown
```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/Qwen2.5-0.5B-Instruct",
  { dtype: "q4", device: "webgpu" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Tell me a funny joke." },
];

// Generate a response
const output = await generator(messages, { max_new_tokens: 128 });
console.log(output[0].generated_text.at(-1).content);
```
```

```markdown
Some encoder-decoder models, like Whisper or Florence-2, are extremely sensitive to quantization settings: especially of the encoder. For this reason, we added the ability to select per-module dtypes, which can be done by providing a mapping from module name to dtype.

**Example:** Run Florence-2 on WebGPU ([demo](https://v2.scrimba.com/s0pdm485fo))

```js
import { Florence2ForConditionalGeneration } from "@huggingface/transformers";

const model = await Florence2ForConditionalGeneration.from_pretrained(
  "onnx-community/Florence-2-base-ft",
  {
    dtype: {
      embed_tokens: "fp16",
      vision_encoder: "fp16",
      encoder_model: "q4",
      decoder_model_merged: "q4",
    },
    device: "webgpu",
  },
);
```
```

```javascript
 * **Example:** Disable remote models.
 * ```javascript
 * import { env } from '@huggingface/transformers';
 * env.allowRemoteModels = false;
 * ```
 * 
 * **Example:** Set local model path.
 * ```javascript
 * import { env } from '@huggingface/transformers';
 * env.localModelPath = '/path/to/local/models/';
 * ```
 * 
 * **Example:** Set cache directory.
 * ```javascript
 * import { env } from '@huggingface/transformers';
 * env.cacheDir = '/path/to/cache/directory/';
 * ```
 * 
 * @module env
 */
```

```text
| Task                     | ID | Description | Supported? |
|--------------------------|----|-------------|------------|
| [Fill-Mask](https://huggingface.co/tasks/fill-mask)                     | `fill-mask`   | Masking some of the words in a sentence and predicting which words should replace those masks. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FillMaskPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=fill-mask&library=transformers.js) |
| [Question Answering](https://huggingface.co/tasks/question-answering)   | `question-answering`   | Retrieve the answer to a question from a given text. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.QuestionAnsweringPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=question-answering&library=transformers.js) |
| [Sentence Similarity](https://huggingface.co/tasks/sentence-similarity) | `sentence-similarity`  | Determining how similar two texts are. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FeatureExtractionPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=sentence-similarity&library=transformers.js) |
| [Summarization](https://huggingface.co/tasks/summarization)             |  `summarization`  | Producing a shorter version of a document while preserving its important information. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.SummarizationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=summarization&library=transformers.js) |
| [Table Question Answering](https://huggingface.co/tasks/table-question-answering) |  `table-question-answering`  | Answering a question about information from a given table. | ❌ |
| [Text Classification](https://huggingface.co/tasks/text-classification)      | `text-classification` or `sentiment-analysis`  | Assigning a label or class to a given text. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextClassificationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=text-classification&library=transformers.js) |
| [Text Generation](https://huggingface.co/tasks/text-generation#completion-generation-models)          | `text-generation`  | Producing new text by predicting the next word in a sequence. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js) |
| [Text-to-text Generation](https://huggingface.co/tasks/text-generation#text-to-text-generation-models)  | `text2text-generation`  | Converting one text sequence into another text sequence. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.Text2TextGenerationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=text2text-generation&library=transformers.js) |
| [Token Classification](https://huggingface.co/tasks/token-classification)     | `token-classification` or `ner`  | Assigning a label to each token in a text. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TokenClassificationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=token-classification&library=transformers.js) |
| [Translation](https://huggingface.co/tasks/translation)              |  `translation`  | Converting text from one language to another. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TranslationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=translation&library=transformers.js) |
| [Zero-Shot Classification](https://huggingface.co/tasks/zero-shot-classification) | `zero-shot-classification`  | Classifying text into classes that are unseen during training.  | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ZeroShotClassificationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=zero-shot-classification&library=transformers.js) |
| [Feature Extraction](https://huggingface.co/tasks/feature-extraction)         |  `feature-extraction`  | Transforming raw data into numerical features that can be processed while preserving the information in the original dataset. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FeatureExtractionPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=feature-extraction&library=transformers.js) |
```

```text
| Task                     | ID | Description | Supported? |
|--------------------------|----|-------------|------------|
| [Background Removal](https://huggingface.co/tasks/image-segmentation#background-removal)       | `background-removal`   | Isolating the main subject of an image by removing or making the background transparent. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.BackgroundRemovalPipeline)<br>[(models)](https://huggingface.co/models?other=background-removal&library=transformers.js) |
| [Depth Estimation](https://huggingface.co/tasks/depth-estimation)         |  `depth-estimation`  | Predicting the depth of objects present in an image. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.DepthEstimationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=depth-estimation&library=transformers.js) |
| [Image Classification](https://huggingface.co/tasks/image-classification)                | `image-classification`   | Assigning a label or class to an entire image. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageClassificationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=image-classification&library=transformers.js) |
| [Image Segmentation](https://huggingface.co/tasks/image-segmentation)       | `image-segmentation`   | Divides an image into segments where each pixel is mapped to an object. This task has multiple variants such as instance segmentation, panoptic segmentation and semantic segmentation. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageSegmentationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=image-segmentation&library=transformers.js) |
| [Image-to-Image](https://huggingface.co/tasks/image-to-image)      |  `image-to-image` | Transforming a source image to match the characteristics of a target image or a target image domain. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageToImagePipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=image-to-image&library=transformers.js) |
| [Mask Generation](https://huggingface.co/tasks/mask-generation)            |  `mask-generation`  | Generate masks for the objects in an image. | ❌ |
| [Object Detection](https://huggingface.co/tasks/object-detection)            | `object-detection`   | Identify objects of certain defined classes within an image. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ObjectDetectionPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=object-detection&library=transformers.js) |
| [Video Classification](https://huggingface.co/tasks/video-classification) |  n/a  | Assigning a label or class to an entire video. | ❌ |
| [Unconditional Image Generation](https://huggingface.co/tasks/unconditional-image-generation)      |  n/a   | Generating images with no condition in any context (like a prompt text or another image). | ❌ |
| [Image Feature Extraction](https://huggingface.co/tasks/image-feature-extraction)         |  `image-feature-extraction`  | Transforming raw data into numerical features that can be processed while preserving the information in the original image. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageFeatureExtractionPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=image-feature-extraction&library=transformers.js) |
```

```text
| Task                     | ID | Description | Supported? |
|--------------------------|----|-------------|------------|
| [Audio Classification](https://huggingface.co/tasks/audio-classification)         |  `audio-classification`  | Assigning a label or class to a given audio. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AudioClassificationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=audio-classification&library=transformers.js) |
| [Audio-to-Audio](https://huggingface.co/tasks/audio-to-audio)         |  n/a  | Generating audio from an input audio source. | ❌ |
| [Automatic Speech Recognition](https://huggingface.co/tasks/automatic-speech-recognition)         | `automatic-speech-recognition`  | Transcribing a given audio into text. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=automatic-speech-recognition&library=transformers.js) |
| [Text-to-Speech](https://huggingface.co/tasks/text-to-speech)         | `text-to-speech` or `text-to-audio` | Generating natural-sounding speech given text input. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextToAudioPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=text-to-audio&library=transformers.js) |
```

```text
| Task                     | ID | Description | Supported? |
|--------------------------|----|-------------|------------|
| [Document Question Answering](https://huggingface.co/tasks/document-question-answering)         | `document-question-answering`  | Answering questions on document images. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.DocumentQuestionAnsweringPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=document-question-answering&library=transformers.js) |
| [Image-to-Text](https://huggingface.co/tasks/image-to-text)         |  `image-to-text`  | Output text from a given image. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageToTextPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=image-to-text&library=transformers.js) |
| [Text-to-Image](https://huggingface.co/tasks/text-to-image)         |  `text-to-image`  | Generates images from input text.  | ❌ |
| [Visual Question Answering](https://huggingface.co/tasks/visual-question-answering)         |  `visual-question-answering`  | Answering open-ended questions based on an image. | ❌ |
| [Zero-Shot Audio Classification](https://huggingface.co/learn/audio-course/chapter4/classification_models#zero-shot-audio-classification) | `zero-shot-audio-classification`  | Classifying audios into classes that are unseen during training. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ZeroShotAudioClassificationPipeline)<br>[(models)](https://huggingface.co/models?other=zero-shot-audio-classification&library=transformers.js) |
| [Zero-Shot Image Classification](https://huggingface.co/tasks/zero-shot-image-classification) | `zero-shot-image-classification`  | Classifying images into classes that are unseen during training. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ZeroShotImageClassificationPipeline)<br>[(models)](https://huggingface.co/models?pipeline_tag=zero-shot-image-classification&library=transformers.js) |
| [Zero-Shot Object Detection](https://huggingface.co/tasks/zero-shot-object-detection) | `zero-shot-object-detection`  | Identify objects of classes that are unseen during training. | ✅ [(docs)](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ZeroShotObjectDetectionPipeline)<br>[(models)](https://huggingface.co/models?other=zero-shot-object-detection&library=transformers.js) |
```
