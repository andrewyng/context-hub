---
name: agent-completions
description: "Langdock Agents Completions API for Vercel AI SDK-style chat requests, attachments, temporary agents, and structured output handling"
metadata:
  languages: "http"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-26"
  source: community
  tags: "langdock,agents,chat,api,vercel-ai-sdk,structured-output"
---

# Langdock Agents Completions API

Use this doc when you need to call Langdock agents over HTTP, including structured output, attachments, tool-enabled agents, and temporary inline agent configs.

Official docs:
- https://docs.langdock.com/de/api-endpoints/api-introduction
- https://docs.langdock.com/de/api-endpoints/agent/agent

## Base URL and Authentication

Cloud endpoint:

```text
POST https://api.langdock.com/agent/v1/chat/completions
```

Required headers:

```http
Authorization: Bearer <LANGDOCK_API_KEY>
Content-Type: application/json
```

Dedicated deployments do not use `api.langdock.com`. Replace it with your deployment base URL and append `/api/public`.

```text
https://<deployment-url>/api/public/agent/v1/chat/completions
```

## Minimal Request

```bash
curl -X POST "https://api.langdock.com/agent/v1/chat/completions" \
  -H "Authorization: Bearer $LANGDOCK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_123",
    "messages": [
      {
        "id": "msg_1",
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "Summarize this document."
          }
        ]
      }
    ],
    "stream": false
  }'
```

## Request Shape

Important request fields:

- `agentId` or `agent`: one of these is required
- `messages`: required array of Vercel AI SDK `UIMessage` objects
- `stream`: optional, defaults to `false`
- `output`: optional structured output specification
- `maxSteps`: optional tool-step cap from `1` to `20`
- `imageResponseFormat`: optional, `"url"` or `"b64_json"`

Use `agentId` when you already have a persistent agent in Langdock. Use `agent` when you want to define a temporary inline agent configuration for a single request.

## UIMessage Format

Langdock's Agents Completions API uses the Vercel AI SDK `UIMessage` format rather than OpenAI chat-completions message objects.

Each message should include:

- `id`
- `role`: `system`, `user`, or `assistant`
- `parts`: array of message parts
- `metadata`: optional, including attachments

Common user message parts:

- `type: "text"` with `text`
- `type: "file"` with inline file metadata for inline file references

Common agent response parts:

- `type: "text"`
- `type: "reasoning"`
- `type: "tool-{name}"`
- `type: "source-url"`
- `type: "source-document"`

For follow-up turns, preserve the returned assistant message parts in the conversation history instead of flattening them to plain text. Tool call state lives inside those parts.

## Attachments

For uploaded files, use the Upload Attachment API first, then reference the returned UUIDs in `message.metadata.attachments`.

```json
{
  "id": "msg_2",
  "role": "user",
  "parts": [
    {
      "type": "text",
      "text": "Analyze the attached transcript."
    }
  ],
  "metadata": {
    "attachments": ["550e8400-e29b-41d4-a716-446655440000"]
  }
}
```

Do not use `type: "file"` for files uploaded through the attachment upload endpoint. Langdock documents that uploaded attachments should be passed through `metadata.attachments`.

Important current limitation: `agent.attachmentIds` in inline temporary agent configs is documented as not currently functional. For request-scoped file access, prefer `metadata.attachments` on individual messages.

## Temporary Agent Configs

When using the inline `agent` field, Langdock accepts fields such as:

- `name`
- `instructions`
- `description`
- `temperature`
- `model`
- `capabilities`
- `knowledgeFolderIds`
- `attachmentIds`

Do not assume these field names match the create/update agent APIs. Langdock documents that the completions endpoint uses:

- `instructions` instead of CRUD `instruction`
- `temperature` instead of CRUD `creativity`
- nested `capabilities` instead of CRUD-style flat booleans

## Structured Output

Langdock documents an optional `output` field for structured output. A minimal request shape looks like this:

```json
{
  "agentId": "agent_123",
  "messages": [
    {
      "id": "system_1",
      "role": "system",
      "parts": [
        {
          "type": "text",
          "text": "Return valid JSON only."
        }
      ]
    },
    {
      "id": "user_1",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Extract the key themes from this interview."
        }
      ]
    }
  ],
  "stream": false,
  "output": {
    "type": "object"
  }
}
```

Treat structured output as best-effort model output, not as guaranteed parser-safe JSON. In observed production usage, responses intended as JSON may still arrive wrapped in Markdown code fences. Strip fences and validate before decoding.

See `references/production-notes.md` for observed response behavior that matters in batch pipelines.

## Response Handling

For non-streaming requests, expect a Vercel AI SDK-style assistant response with `parts` and output data. Keep the full assistant message when continuing the same conversation.

For streaming requests, build your client to handle incremental message parts instead of assuming a single plain-text string.

Useful response metadata observed in successful requests includes:

- `ld-model-id`
- `x-usage-input-tokens`
- `x-usage-output-tokens`
- `x-ratelimit-limit-requests`
- `x-ratelimit-remaining-requests`

These headers are useful for logging, rate-limit handling, and debugging which underlying model served the request.

## Common Pitfalls

- Sending OpenAI chat-completions message objects instead of Langdock/Vercel `UIMessage` objects.
- Dropping assistant tool parts from conversation history before the next turn.
- Using uploaded files as `type: "file"` parts instead of `metadata.attachments`.
- Assuming inline `agent.attachmentIds` works for temporary agents.
- Assuming "JSON only" instructions guarantee raw JSON without code fences.
- Forgetting to swap the base URL for dedicated deployments.

## Official Sources

- https://docs.langdock.com/de/api-endpoints/api-introduction
- https://docs.langdock.com/de/api-endpoints/agent/agent
- https://docs.langdock.com/de/api-endpoints/agent/attachments
