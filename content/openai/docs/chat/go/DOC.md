---
name: chat
description: "OpenAI API for text generation, chat completions, streaming, function calling, vision, embeddings, and assistants"
metadata:
  languages: "go"
  versions: "3.37.0"
  revision: 2
  updated-on: "2026-05-29"
  source: community
  tags: "openai,chat,llm,ai"
---

# OpenAI Go SDK Coding Guidelines

You are an OpenAI API coding expert. Help me with writing code using the OpenAI API calling the official Go SDK.

You can find the official SDK documentation and code samples here:
https://github.com/openai/openai-go

## Golden Rule: Use the Correct and Current SDK

Always use the official OpenAI Go SDK to call OpenAI models.

**Module (v3.x):** `github.com/openai/openai-go/v3`

**Installation:**
```bash
go get github.com/openai/openai-go/v3
```

**APIs and Usage:**
- **Primary API (Recommended):** `client.Responses.New(...)`
- **Legacy API (Still Supported):** `client.Chat.Completions.New(...)`

## Important: v2/v3 Breaking Changes

The Go SDK underwent significant breaking changes in `v2.x` and `v3.x`. If you are migrating from `v1.x`:

- The `openai.F(...)` wrapper for parameter fields has been **removed**. Pass values directly.
- Optional primitive types now use `param.Opt[T]` and constructors like `openai.String(...)`, `openai.Int(...)`, `openai.Bool(...)`, `openai.Float(...)`.
- The import path is now `github.com/openai/openai-go/v3`.
- Union input types are constructed with named fields (e.g. `responses.ResponseNewParamsInputUnion{OfString: openai.String("...")}`).

This document targets the current `v3.x` API. Do not mix old `openai.F()` patterns with new code.

## Initialization and API Key

Set the `OPENAI_API_KEY` environment variable; the SDK picks it up automatically.

```go
package main

import (
    "github.com/openai/openai-go/v3"
    "github.com/openai/openai-go/v3/option"
)

func main() {
    // Uses OPENAI_API_KEY environment variable automatically
    client := openai.NewClient()

    // Or pass the API key explicitly (not recommended for production)
    // client := openai.NewClient(option.WithAPIKey("your-api-key-here"))
    _ = client
}
```

Use environment secrets or a secrets manager to keep keys out of source control.

## Models (as of May 2026)

Use typed model constants from the SDK when available; otherwise pass a string.

Default choices:
- **General Text / Coding:** `openai.ChatModelGPT5_5` (flagship, 1M context)
- **More Affordable Frontier:** `openai.ChatModelGPT5_4`
- **Fast & Cost-Efficient:** `openai.ChatModelGPT5_4Mini`
- **Cheapest / Fastest:** `openai.ChatModelGPT5_4Nano`
- **Image Generation:** `gpt-image-2`
- **Embeddings:** `openai.EmbeddingModelTextEmbedding3Small`

```go
// Typed constants — preferred
Model: openai.ChatModelGPT5_5,

// String literal — for models not yet in constants
Model: "gpt-5.5",
```

## Basic Inference (Text Generation)

### Primary Method: Responses API (Recommended)

```go
package main

import (
    "context"
    "fmt"

    "github.com/openai/openai-go/v3"
    "github.com/openai/openai-go/v3/responses"
)

func main() {
    client := openai.NewClient()

    resp, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
        Model:        openai.ChatModelGPT5_5,
        Instructions: openai.String("You are a helpful coding assistant."),
        Input: responses.ResponseNewParamsInputUnion{
            OfString: openai.String("How do I reverse a slice in Go?"),
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(resp.OutputText())
}
```

### Legacy Method: Chat Completions API

```go
package main

import (
    "context"
    "fmt"

    "github.com/openai/openai-go/v3"
)

func main() {
    client := openai.NewClient()

    completion, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
        Model: openai.ChatModelGPT5_5,
        Messages: []openai.ChatCompletionMessageParamUnion{
            openai.SystemMessage("You are a helpful assistant."),
            openai.UserMessage("How do I reverse a slice in Go?"),
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(completion.Choices[0].Message.Content)
}
```

## Parameter Conventions

Pass required fields directly. For optional primitive fields, use the `openai.String / Int / Bool / Float` constructors which return a `param.Opt[T]`.

```go
// CORRECT for v3.x
openai.ChatCompletionNewParams{
    Model:       openai.ChatModelGPT5_5,
    MaxTokens:   openai.Int(1024),
    Temperature: openai.Float(0.7),
    Messages: []openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("hello"),
    },
}
```

Do not use the old `openai.F(...)` wrapper — it was removed in v2.x.

## Streaming Responses

### Responses API Streaming

```go
stream := client.Responses.NewStreaming(context.Background(), responses.ResponseNewParams{
    Model: openai.ChatModelGPT5_5,
    Input: responses.ResponseNewParamsInputUnion{
        OfString: openai.String("Write a short story about a robot."),
    },
})

for stream.Next() {
    event := stream.Current()
    // Stream emits typed events; text deltas arrive on response.output_text.delta
    fmt.Print(event.Delta)
}
if err := stream.Err(); err != nil {
    panic(err)
}
```

### Chat Completions Streaming

```go
stream := client.Chat.Completions.NewStreaming(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.ChatModelGPT5_5,
    Messages: []openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("Tell me a joke"),
    },
})

acc := openai.ChatCompletionAccumulator{}
for stream.Next() {
    chunk := stream.Current()
    acc.AddChunk(chunk)
    if len(chunk.Choices) > 0 {
        fmt.Print(chunk.Choices[0].Delta.Content)
    }
}
if err := stream.Err(); err != nil {
    panic(err)
}
// acc.Choices[0].Message.Content holds the full assembled response
```

## Function Calling (Tools)

```go
tools := []openai.ChatCompletionToolParam{
    {
        Function: openai.FunctionDefinitionParam{
            Name:        "get_weather",
            Description: openai.String("Get current weather for a city"),
            Parameters: openai.FunctionParameters{
                "type": "object",
                "properties": map[string]any{
                    "city": map[string]string{
                        "type":        "string",
                        "description": "City name",
                    },
                },
                "required": []string{"city"},
            },
        },
    },
}

resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.ChatModelGPT5_5,
    Messages: []openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("What's the weather in Paris?"),
    },
    Tools: tools,
})
if err != nil {
    panic(err)
}

for _, tc := range resp.Choices[0].Message.ToolCalls {
    fmt.Printf("Function: %s, Args: %s\n", tc.Function.Name, tc.Function.Arguments)
}
```

For the Responses API, function calls arrive as `function_call` items in the output:

```go
for _, item := range resp.Output {
    if item.Type == "function_call" {
        call := item.AsFunctionCall()
        var args map[string]any
        _ = json.Unmarshal([]byte(call.Arguments), &args)
        fmt.Println(call.Name, args)
    }
}
```

## Structured Outputs (JSON Schema)

Use a strict JSON schema to get parseable, type-safe output.

```go
import "encoding/json"

type Step struct {
    Explanation string `json:"explanation"`
    Output      string `json:"output"`
}
type MathReasoning struct {
    Steps       []Step `json:"steps"`
    FinalAnswer string `json:"final_answer"`
}

schemaParam := openai.ResponseFormatJSONSchemaJSONSchemaParam{
    Name:        "math_reasoning",
    Description: openai.String("Step-by-step math solution"),
    Schema:      generateSchema[MathReasoning](), // your schema generator
    Strict:      openai.Bool(true),
}

resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.ChatModelGPT5_5,
    Messages: []openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("Solve: 8x + 31 = 2"),
    },
    ResponseFormat: openai.ChatCompletionNewParamsResponseFormatUnion{
        OfJSONSchema: &openai.ResponseFormatJSONSchemaParam{
            JSONSchema: schemaParam,
        },
    },
})

var result MathReasoning
_ = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result)
fmt.Println(result.FinalAnswer)
```

## Vision (Multimodal)

```go
resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.ChatModelGPT5_4Mini,
    Messages: []openai.ChatCompletionMessageParamUnion{
        openai.UserMessage([]openai.ChatCompletionContentPartUnionParam{
            openai.TextContentPart("What is in this image?"),
            openai.ImageContentPart(openai.ChatCompletionContentPartImageImageURLParam{
                URL: "https://example.com/image.jpg",
            }),
        }),
    },
})
```

## Embeddings

```go
resp, err := client.Embeddings.New(context.Background(), openai.EmbeddingNewParams{
    Model: openai.EmbeddingModelTextEmbedding3Small,
    Input: openai.EmbeddingNewParamsInputUnion{
        OfString: openai.String("The quick brown fox jumps over the lazy dog."),
    },
})
if err != nil {
    panic(err)
}
fmt.Printf("Dimensions: %d\n", len(resp.Data[0].Embedding))
```

## Error Handling

```go
import (
    "errors"

    "github.com/openai/openai-go/v3"
)

resp, err := client.Chat.Completions.New(ctx, params)
if err != nil {
    var apiErr *openai.Error
    if errors.As(err, &apiErr) {
        fmt.Printf("API error %d: %s\n", apiErr.StatusCode, apiErr.Message)
        // Useful for debugging:
        // apiErr.DumpRequest(true)
        // apiErr.DumpResponse(true)
    }
    return err
}
_ = resp
```

Status codes: 401 auth, 429 rate limit, 5xx server error.

## Retries and Timeouts

```go
import (
    "context"
    "time"

    "github.com/openai/openai-go/v3"
    "github.com/openai/openai-go/v3/option"
)

// Configure retries at client level
client := openai.NewClient(
    option.WithMaxRetries(5),
)

// Configure timeout via context (preferred)
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

// Per-request options
resp, err := client.Chat.Completions.New(ctx, params,
    option.WithMaxRetries(3),
)
_ = resp
_ = err
```

## Microsoft Azure OpenAI

```go
client := openai.NewClient(
    option.WithBaseURL("https://your-endpoint.openai.azure.com/openai/deployments/your-deployment/"),
    option.WithAPIKey(os.Getenv("AZURE_OPENAI_API_KEY")),
    option.WithHeaderAdd("api-version", "2024-08-01-preview"),
)
```

## Notes

- **No more `openai.F()`** in v2.x/v3.x — pass values directly; wrap optional primitives with `openai.String / Int / Bool / Float`.
- **Context is always first** in every API call — use `context.WithTimeout` in production.
- Prefer the Responses API for new work; Chat Completions remains fully supported.
- Both sync calls and streaming iterators (`stream.Next()`) follow the same pattern throughout the SDK.
- Use typed `openai.ChatModel*` constants; fall back to string literals only when the constant is missing.
- The voice parameter on TTS endpoints accepts either a string or an object (`{id: string}`) since v3.28.0.

## Official Sources Used For This Update

- OpenAI Go SDK GitHub: `https://github.com/openai/openai-go`
- OpenAI Go SDK releases: `https://github.com/openai/openai-go/releases`
- OpenAI models guide: `https://developers.openai.com/api/docs/models`
- OpenAI API reference: `https://developers.openai.com/api/reference`
