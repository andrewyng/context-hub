# Novita LLM Batch API

Use this reference when you need asynchronous processing for many LLM requests and do not need an immediate response.

Primary source: https://novita.ai/docs/guides/llm-batch-api.md

## When to Use Batch

Use batch for:
- evaluations
- bulk classification
- offline summarization
- large backfills

Prefer regular chat completions for interactive applications.

## Input File Format

Novita's batch input format is JSONL. Each line is one request payload.

Rules:
- every line must be valid JSON
- every request must include a unique `custom_id`
- all requests in the same file must target the same model
- endpoint must be `/v1/chat/completions` or `/v1/completions`

Example:

```json
{"custom_id":"request-1","body":{"model":"deepseek/deepseek-v3-0324","messages":[{"role":"user","content":"Hello"}],"max_tokens":400}}
{"custom_id":"request-2","body":{"model":"deepseek/deepseek-v3-0324","messages":[{"role":"user","content":"Summarize this text"}],"max_tokens":400}}
```

## Upload the Input File

Use the Files API with `purpose="batch"`.

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.novita.ai/openai/v1",
    api_key="...",
)

batch_input_file = client.files.create(
    file=open("batch_input.jsonl", "rb"),
    purpose="batch",
)
```

## Create the Batch

```python
batch = client.batches.create(
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="48h",
)
```

Notes:
- `completion_window` is fixed at `48h`
- this is an asynchronous workflow

## Poll Batch Status

Retrieve the batch until it reaches a terminal state.

Possible statuses documented by Novita:
- `VALIDATING`
- `PROGRESS`
- `COMPLETED`
- `FAILED`
- `EXPIRED`
- `CANCELLING`
- `CANCELLED`

## Retrieve Results

When the batch completes, read `output_file_id` and fetch the file content through the Files API.

The returned content is raw file content. Keep `custom_id` stable so you can match outputs back to requests.

## Limits and Retention

Documented limits and lifecycle notes:
- up to 50,000 requests per batch
- input file size up to 100 MB
- output files are not retained forever; Novita's official batch guide says completed output files are deleted after 30 days

Download output promptly rather than treating Novita as long-term storage.

## Common Failure Modes

- malformed JSONL
- missing `custom_id`
- mixed models in one file
- wrong endpoint value
- invalid or expired API key
- polling the wrong batch ID
