---
name: chat
description: "OpenAI API for text generation, chat completions, streaming, function calling, vision, embeddings, and assistants"
metadata:
  languages: "go"
  versions: "1.3.0"
  revision: 1
  updated-on: "2026-03-09"
  source: community
  tags: "openai,chat,llm,ai"
---

# OpenAI Go SDK Coding Guidelines

You are an OpenAI API coding expert. Help me with writing code using the OpenAI API calling the official Go SDK.

You can find the official SDK documentation and code samples here:
https://platform.openai.com/docs/api-reference

## Golden Rule: Use the Correct and Current SDK

Always use the official OpenAI Go SDK to call OpenAI models.

**Module:** `github.com/openai/openai-go`

**Installation:**
```bash
go get github.com/openai/openai-go
```

**APIs and Usage:**
- **Primary API (Recommended):** `client.Responses.Create(...)`
- **Legacy API (Still Supported):** `client.Chat.Completions.New(...)`

## Initialization and API Key

Set the `OPENAI_API_KEY` environment variable; the SDK picks it up automatically.

```go
import (
    "github.com/openai/openai-go"
    "github.com/openai/openai-go/option"
)

// Uses OPENAI_API_KEY environment variable automatically
client := openai.NewClient()

// Or pass the API key explicitly (not recommended for production)
// client := openai.NewClient(option.WithAPIKey("your-api-key-here"))
```

Use environment secrets or a secrets manager to keep keys out of source control.

## Models (as of March 2026)

Use typed model constants from the SDK — never hardcode strings directly.

Default choices:
- **General Text Tasks:** `openai.ChatModelGPT4_1` (non-reasoning)
- **Fast & Cost-Efficient:** `openai.ChatModelGPT4_1Mini`
- **Cheapest / Fastest:** `openai.ChatModelGPT4_1Nano`

```go
// Typed constants — preferred
model: openai.F(openai.ChatModelGPT4_1),

// String literal — only when using a model not yet in constants
model: openai.F("gpt-5.4"),
```

## Basic Inference (Text Generation)

### Primary Method: Responses API (Recommended)

```go
package main

import (
    "context"
    "fmt"

    "github.com/openai/openai-go"
    "github.com/openai/openai-go/responses"
)

func main() {
    client := openai.NewClient()

    resp, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
        Model:        openai.F("gpt-4.1"),
        Instructions: openai.F("You are a helpful coding assistant."),
        Input:        responses.ResponseNewParamsInputUnionString("How do I reverse a slice in Go?"),
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

    "github.com/openai/openai-go"
)

func main() {
    client := openai.NewClient()

    completion, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
        Model: openai.F(openai.ChatModelGPT4_1),
        Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
            openai.SystemMessage("You are a helpful assistant."),
            openai.UserMessage("How do I reverse a slice in Go?"),
        }),
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(completion.Choices[0].Message.Content)
}
```

## The `openai.F()` Wrapper — Critical Pattern

**All parameter fields in the Go SDK must be wrapped with `openai.F()`.**
This is Go-specific and does not appear in Python or JavaScript SDK docs.

```go
// CORRECT — all fields wrapped
openai.ChatCompletionNewParams{
    Model:       openai.F(openai.ChatModelGPT4_1),
    MaxTokens:   openai.F(int64(1024)),
    Temperature: openai.F(0.7),
    Messages:    openai.F([]openai.ChatCompletionMessageParamUnion{...}),
}

// WRONG — missing F() wrappers (will not compile)
openai.ChatCompletionNewParams{
    Model:    openai.ChatModelGPT4_1,   // BAD
    Messages: []openai.ChatCompletionMessageParamUnion{...}, // BAD
}
```

Use `openai.Bool(true)` and `openai.Int(n)` as shortcuts for pointer-wrapped booleans and ints.

## Streaming Responses

### Responses API Streaming

```go
stream := client.Responses.NewStreaming(context.Background(), responses.ResponseNewParams{
    Model: openai.F("gpt-4.1"),
    Input: responses.ResponseNewParamsInputUnionString("Write a short story about a robot."),
})

for stream.Next() {
    event := stream.Current()
    fmt.Print(event.OutputText())
}
if err := stream.Err(); err != nil {
    panic(err)
}
```

### Chat Completions Streaming

```go
stream := client.Chat.Completions.NewStreaming(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.F(openai.ChatModelGPT4_1),
    Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("Tell me a joke"),
    }),
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
// acc.Choices[0].Message.Content now holds the full assembled response
```

## Function Calling (Tools)

```go
tools := []openai.ChatCompletionToolParam{
    {
        Type: openai.F(openai.ChatCompletionToolTypeFunction),
        Function: openai.F(openai.FunctionDefinitionParam{
            Name:        openai.F("get_weather"),
            Description: openai.F("Get current weather for a city"),
            Parameters: openai.F(openai.FunctionParameters{
                "type": "object",
                "properties": map[string]interface{}{
                    "city": map[string]string{
                        "type":        "string",
                        "description": "City name",
                    },
                },
                "required": []string{"city"},
            }),
        }),
    },
}

resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.F(openai.ChatModelGPT4_1),
    Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("What's the weather in Paris?"),
    }),
    Tools: openai.F(tools),
})
if err != nil {
    panic(err)
}
// Inspect resp.Choices[0].Message.ToolCalls for the model's invocation
for _, tc := range resp.Choices[0].Message.ToolCalls {
    fmt.Printf("Function: %s, Args: %s\n", tc.Function.Name, tc.Function.Arguments)
}
```

## Structured Outputs (JSON Schema)

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
    Name:        openai.F("math_reasoning"),
    Description: openai.F("Step-by-step math solution"),
    Schema:      openai.F(generateSchema[MathReasoning]()),
    Strict:      openai.Bool(true),
}

resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.F(openai.ChatModelGPT4_1Mini),
    Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
        openai.UserMessage("Solve: 8x + 31 = 2"),
    }),
    ResponseFormat: openai.F[openai.ChatCompletionNewParamsResponseFormatUnion](
        openai.ResponseFormatJSONSchemaParam{
            Type:       openai.F(openai.ResponseFormatJSONSchemaTypeJSONSchema),
            JSONSchema: openai.F(schemaParam),
        },
    ),
})

var result MathReasoning
json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result)
fmt.Println(result.FinalAnswer)
```

## Vision (Multimodal)

```go
resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
    Model: openai.F(openai.ChatModelGPT4_1Mini),
    Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
        openai.UserMessageParts(
            openai.TextPart("What is in this image?"),
            openai.ImagePart("https://example.com/image.jpg"),
        ),
    }),
})
```

## Embeddings

```go
resp, err := client.Embeddings.New(context.Background(), openai.EmbeddingNewParams{
    Model: openai.F(openai.EmbeddingModelTextEmbedding3Small),
    Input: openai.F(openai.EmbeddingNewParamsInputUnionString(
        "The quick brown fox jumps over the lazy dog.",
    )),
})
if err != nil {
    panic(err)
}
fmt.Printf("Dimensions: %d\n", len(resp.Data[0].Embedding))
```

## Error Handling

```go
import "github.com/openai/openai-go/apierror"

resp, err := client.Chat.Completions.New(ctx, params)
if err != nil {
    var apiErr *apierror.Error
    if errors.As(err, &apiErr) {
        fmt.Printf("API error %d: %s\n", apiErr.StatusCode, apiErr.Message)
        // apiErr.StatusCode: 401 auth, 429 rate limit, 500 server error
    }
    return err
}
```

## Retries and Timeouts

```go
import "time"

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

- **`openai.F()`** is mandatory for all param fields — missing it causes a compile error.
- **`openai.Bool()` / `openai.Int()`** are convenience wrappers for optional pointer types.
- **Context is always first** in every API call — use `context.WithTimeout` in production.
- Prefer the Responses API for new work; Chat Completions remains fully supported.
- Both sync calls and streaming iterators (`stream.Next()`) follow the same pattern throughout the SDK.
- Use `openai.ChatModelGPT4_1` typed constants; only use string literals for unreleased models.
