---
name: lex-runtime-v2
description: "Amazon Lex V2 Runtime SDK for JavaScript v3 guide for sending text or audio to a bot and managing session state"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,lex,lex-v2,chatbot,conversational-ai,javascript,nodejs"
---

# Amazon Lex V2 Runtime SDK for JavaScript v3 Guide

## Golden Rule

Use `@aws-sdk/client-lex-runtime-v2` only for runtime conversations with an existing Amazon Lex V2 bot alias. Your app must already know the bot ID, bot alias ID, locale ID, and a session ID for the current conversation.

For most server-side apps, create one `LexRuntimeV2Client` for the AWS region that hosts the bot and call `client.send(new Command(...))` for each user turn.

## Install

```bash
npm install @aws-sdk/client-lex-runtime-v2
```

This guide uses ESM imports and the standard AWS SDK for JavaScript v3 command pattern.

## Prerequisites

Before you send runtime requests, have these values ready:

- `AWS_REGION` for the region where the Lex V2 bot alias is deployed.
- `LEX_BOT_ID` for the bot.
- `LEX_BOT_ALIAS_ID` for the alias you want to invoke.
- `LEX_LOCALE_ID` such as `en_US`.
- A stable `sessionId` for one conversation.

Set region and credentials with the normal AWS SDK credential chain.

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=dev

export LEX_BOT_ID=YOUR_BOT_ID
export LEX_BOT_ALIAS_ID=YOUR_BOT_ALIAS_ID
export LEX_LOCALE_ID=en_US
```

If you use environment credentials directly:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
```

For local development, a named AWS profile is usually safer than hardcoding credentials in application code.

## Initialize The Client

```javascript
import { LexRuntimeV2Client } from "@aws-sdk/client-lex-runtime-v2";

export const lex = new LexRuntimeV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

Create a small helper object so each command uses the same bot target.

```javascript
export const lexTarget = {
  botId: process.env.LEX_BOT_ID,
  botAliasId: process.env.LEX_BOT_ALIAS_ID,
  localeId: process.env.LEX_LOCALE_ID ?? "en_US",
};
```

## Core Usage

### Send One Text Turn

Use `RecognizeTextCommand` when the user message is already plain text in memory.

```javascript
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
} from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const sessionId = "web-user-123";

const response = await client.send(
  new RecognizeTextCommand({
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID ?? "en_US",
    sessionId,
    text: "I want to check my order status",
  }),
);

for (const message of response.messages ?? []) {
  console.log(message.contentType, message.content);
}

console.log(response.sessionState?.intent?.name);
console.log(response.sessionState?.sessionAttributes);
```

Reuse the same `sessionId` while the conversation is active so Lex keeps the current dialog state.

### Pass Session Attributes With A Request

Use `sessionState.sessionAttributes` when your application needs to send channel or tenant context with the turn.

```javascript
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
} from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new RecognizeTextCommand({
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID ?? "en_US",
    sessionId: "web-user-123",
    text: "Show my last invoice",
    sessionState: {
      sessionAttributes: {
        channel: "web",
        tenant: "sandbox",
      },
    },
    requestAttributes: {
      "x-application": "support-portal",
    },
  }),
);

console.log(response.sessionState?.sessionAttributes);
```

### Read The Current Session

Use `GetSessionCommand` when you need the current intent, messages, or session state without sending a new utterance.

```javascript
import {
  GetSessionCommand,
  LexRuntimeV2Client,
} from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const session = await client.send(
  new GetSessionCommand({
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID ?? "en_US",
    sessionId: "web-user-123",
  }),
);

console.log(session.sessionId);
console.log(session.sessionState?.intent?.name);
console.log(session.messages);
```

### Reset A Conversation

Use `DeleteSessionCommand` when the user starts over and you do not want to keep the existing dialog state.

```javascript
import {
  DeleteSessionCommand,
  LexRuntimeV2Client,
} from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new DeleteSessionCommand({
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID ?? "en_US",
    sessionId: "web-user-123",
  }),
);
```

After deletion, the next turn with the same `sessionId` starts from a clean session state.

### Send Recorded Audio

Use `RecognizeUtteranceCommand` when you already have audio bytes and want a single request-response call instead of a streaming conversation.

```javascript
import { readFile } from "node:fs/promises";
import {
  LexRuntimeV2Client,
  RecognizeUtteranceCommand,
} from "@aws-sdk/client-lex-runtime-v2";

const client = new LexRuntimeV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const audio = await readFile("./utterance.pcm");

const response = await client.send(
  new RecognizeUtteranceCommand({
    botId: process.env.LEX_BOT_ID,
    botAliasId: process.env.LEX_BOT_ALIAS_ID,
    localeId: process.env.LEX_LOCALE_ID ?? "en_US",
    sessionId: "voice-user-123",
    requestContentType: "audio/l16; rate=16000; channels=1",
    responseContentType: "text/plain; charset=utf-8",
    inputStream: audio,
  }),
);

console.log(response.contentType);
```

If you need bidirectional or streaming conversation behavior instead of a single request-response turn, use `StartConversationCommand` rather than `RecognizeTextCommand` or `RecognizeUtteranceCommand`.

## Choosing The Right Operation

- `RecognizeTextCommand` for ordinary chat or form-style text input.
- `RecognizeUtteranceCommand` for one-shot audio input you already captured as bytes.
- `GetSessionCommand` to inspect the current session state.
- `DeleteSessionCommand` to clear the active conversation.
- `PutSessionCommand` to seed or replace session state from your application.
- `StartConversationCommand` for streaming or duplex conversation flows.

## Common Pitfalls

- `botAliasId` is the alias ID, not the alias name you see in casual documentation or internal naming.
- `localeId` must match a locale enabled on the target bot alias, such as `en_US`.
- Reuse one `sessionId` per conversation. If you create a new `sessionId` for every message, Lex cannot keep dialog state across turns.
- Use `DeleteSessionCommand` when a user explicitly restarts. Reusing an old `sessionId` without clearing it can carry over stale slot or intent state.
- Use `RecognizeTextCommand` for text and `RecognizeUtteranceCommand` for recorded audio. Use `StartConversationCommand` only when you need streaming behavior.
- Do not expose long-lived AWS credentials in browser code. Put Lex runtime calls behind a server or use short-lived AWS credentials.
- This runtime client invokes an existing bot alias. Bot building, versioning, and publishing happen outside the runtime client.

## Version Notes

- This guide covers `@aws-sdk/client-lex-runtime-v2` version `3.1007.0`.
- The examples use the modular AWS SDK for JavaScript v3 pattern: `client.send(new Command(input))`.
