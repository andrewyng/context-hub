---
id: groq/chat
title: Groq Chat Completions
version: "1.0"
lang: py
---

# Groq Chat Completions — Python

## Install
```bash
pip install groq
```

## Basic usage
```python
import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain fast LLM inference."},
    ],
    max_completion_tokens=1024,
)
print(response.choices[0].message.content)
```

## Streaming
```python
stream = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Count to 5."}],
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")
```

## Async
```python
from groq import AsyncGroq
import asyncio

async def main():
    client = AsyncGroq()
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Hello"}],
    )
    print(response.choices[0].message.content)

asyncio.run(main())
```

## Error handling
```python
import groq

try:
    client.chat.completions.create(...)
except groq.RateLimitError:
    # Back off and retry
    pass
except groq.APIConnectionError as e:
    print(e.__cause__)
```