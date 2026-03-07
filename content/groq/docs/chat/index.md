---
id: groq/chat
title: Groq Chat Completions
version: "1.0"
description: Fast LLM inference via Groq's OpenAI-compatible chat API
---

# Groq Chat Completions

Groq provides high-speed LLM inference via an OpenAI-compatible REST API.
Base URL: `https://api.groq.com/openai/v1`

## Authentication

Set your key as an environment variable:
```bash
export GROQ_API_KEY="your_api_key_here"
```

Get a free key at https://console.groq.com/keys

## Key Models

| Model | Context | Best for |
|-------|---------|----------|
| `llama-3.3-70b-versatile` | 128k | General tasks, high quality |
| `llama-3.1-8b-instant` | 128k | Low latency, simple tasks |
| `mixtral-8x7b-32768` | 32k | Instruction following |
| `gemma2-9b-it` | 8k | Lightweight tasks |

## Gotchas

- `n > 1` is not supported (only one completion per request)
- `logprobs` and `logit_bias` are not yet supported
- Rate limits are per-model; check `x-ratelimit-*` response headers
- Use `max_completion_tokens` (not `max_tokens`, which is deprecated)