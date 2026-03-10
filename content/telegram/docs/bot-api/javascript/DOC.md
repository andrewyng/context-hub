---
name: bot-api
description: "Telegram Bot API via grammy and node-telegram-bot-api for building Telegram bots in JavaScript/TypeScript"
metadata:
  languages: "javascript"
  versions: "1.35.0"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "telegram,bot,messaging,grammy,chat"
---

# Telegram Bot API — JavaScript/TypeScript SDK Coding Guidelines

You are a Telegram Bot API coding expert. Help me write code using the Telegram Bot API with the official and recommended libraries.

Official Telegram Bot API documentation:
https://core.telegram.org/bots/api

## Golden Rule: Use the Correct and Current SDK

Use **grammY** (recommended) or **node-telegram-bot-api** for Telegram bot development in JavaScript/TypeScript.

- **Recommended Library:** grammY
- **NPM Package:** `grammy`
- **Current Version:** 1.35.0
- **Alternative:** `node-telegram-bot-api` (callback-based, less TypeScript support)

**Installation:**

```bash
npm install grammy
```

**APIs and Usage:**

- **Correct:** `import { Bot, Context, InlineKeyboard } from 'grammy'`
- **Correct:** `const bot = new Bot("BOT_TOKEN")`
- **Correct:** `bot.command("start", (ctx) => ctx.reply("Hello!"))`
- **Correct:** `bot.on("message:text", handler)`
- **Incorrect:** `new Telegraf()` (different library)
- **Incorrect:** `bot.sendMessage()` (use `ctx.reply()` or `ctx.api.sendMessage()`)

## Initialization

```typescript
import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Handle /start command
bot.command("start", (ctx) => ctx.reply("Welcome! I'm your bot."));

// Handle text messages
bot.on("message:text", (ctx) => {
  console.log(`Message from ${ctx.from?.first_name}: ${ctx.message.text}`);
  return ctx.reply(`You said: ${ctx.message.text}`);
});

bot.start();
```

## Sending Messages

### Plain Text

```typescript
await ctx.reply("Hello!");

// With parse mode
await ctx.reply("*Bold* and _italic_", { parse_mode: "MarkdownV2" });
await ctx.reply("<b>Bold</b> and <i>italic</i>", { parse_mode: "HTML" });
```

### Sending to a Specific Chat

```typescript
// Use bot.api to send without a context
await bot.api.sendMessage(chatId, "Hello from bot!");

// Send to a topic/thread in a group
await bot.api.sendMessage(chatId, "Hello topic!", {
  message_thread_id: topicId,
});
```

### Photos, Documents, and Media

```typescript
// Send a photo by URL
await ctx.replyWithPhoto("https://example.com/image.jpg");

// Send a photo with caption
await ctx.replyWithPhoto("https://example.com/image.jpg", {
  caption: "Check this out!",
});

// Send a document
await ctx.replyWithDocument(new InputFile("/path/to/file.pdf"));

// Send a photo from buffer
import { InputFile } from "grammy";
await ctx.replyWithPhoto(new InputFile(buffer, "photo.jpg"));

// Send media group (album)
await ctx.replyWithMediaGroup([
  { type: "photo", media: "https://example.com/1.jpg" },
  { type: "photo", media: "https://example.com/2.jpg" },
]);
```

## Inline Keyboards

```typescript
import { InlineKeyboard } from "grammy";

const keyboard = new InlineKeyboard()
  .text("Button 1", "btn_1")
  .text("Button 2", "btn_2")
  .row()
  .url("Visit Site", "https://example.com");

await ctx.reply("Choose an option:", { reply_markup: keyboard });

// Handle callback queries
bot.callbackQuery("btn_1", async (ctx) => {
  await ctx.answerCallbackQuery("You clicked Button 1!");
  await ctx.editMessageText("You selected option 1.");
});
```

## Custom Keyboards (Reply Keyboards)

```typescript
import { Keyboard } from "grammy";

const keyboard = new Keyboard()
  .text("Option A").text("Option B").row()
  .text("Option C")
  .resized()      // fit keyboard to buttons
  .oneTime();     // hide after use

await ctx.reply("Pick one:", { reply_markup: keyboard });
```

## Commands

```typescript
// Set bot commands (shows in menu)
await bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help" },
  { command: "settings", description: "Open settings" },
]);

// Handle commands
bot.command("start", (ctx) => ctx.reply("Welcome!"));
bot.command("help", (ctx) => ctx.reply("Here's how to use me..."));
```

## Conversations and Sessions

### Sessions (Persistent State)

```typescript
import { Bot, Context, session } from "grammy";

interface SessionData {
  count: number;
}

type MyContext = Context & { session: SessionData };

const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

bot.use(session({ initial: (): SessionData => ({ count: 0 }) }));

bot.command("count", (ctx) => {
  ctx.session.count++;
  return ctx.reply(`Count: ${ctx.session.count}`);
});
```

## Middleware

```typescript
// Logging middleware
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`Response time: ${ms}ms`);
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});
```

## Webhooks

```typescript
import express from "express";
import { webhookCallback } from "grammy";

const app = express();
app.use(express.json());

// Set webhook
await bot.api.setWebhook("https://yourdomain.com/webhook");

// Handle webhook
app.use("/webhook", webhookCallback(bot, "express"));

app.listen(3000);
```

## Forum Topics (Supergroups)

```typescript
// Create a topic
const topic = await bot.api.createForumTopic(chatId, "New Topic", {
  icon_color: 0x6FB9F0,
});

// Send message to a topic
await bot.api.sendMessage(chatId, "Hello topic!", {
  message_thread_id: topic.message_thread_id,
});

// Close/reopen a topic
await bot.api.closeForumTopic(chatId, topic.message_thread_id);
await bot.api.reopenForumTopic(chatId, topic.message_thread_id);

// Delete a topic
await bot.api.deleteForumTopic(chatId, topic.message_thread_id);
```

## Editing and Deleting Messages

```typescript
// Edit message text
await ctx.editMessageText("Updated text");

// Edit with API (when you have chat_id and message_id)
await bot.api.editMessageText(chatId, messageId, "Updated text");

// Delete a message
await ctx.deleteMessage();
await bot.api.deleteMessage(chatId, messageId);
```

## Error Handling

```typescript
import { GrammyError, HttpError } from "grammy";

bot.catch((err) => {
  const ctx = err.ctx;
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Telegram API error:", e.description);
    // e.error_code — numeric HTTP status
    // e.description — human-readable error
  } else if (e instanceof HttpError) {
    console.error("Network error:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
```

## Rate Limits

Telegram enforces rate limits:

- **1 message/second** to the same chat
- **30 messages/second** overall
- **20 messages/minute** to the same group

Use `bot.api.config.use(autoRetry())` from `@grammyjs/auto-retry` to handle rate limits automatically:

```typescript
import { autoRetry } from "@grammyjs/auto-retry";

bot.api.config.use(autoRetry());
```

## Plugins (grammY Ecosystem)

| Plugin | Package | Purpose |
|--------|---------|---------|
| Auto Retry | `@grammyjs/auto-retry` | Handle rate limits |
| Conversations | `@grammyjs/conversations` | Multi-step dialogs |
| Menu | `@grammyjs/menu` | Interactive menus |
| Router | `@grammyjs/router` | Route updates |
| Parse Mode | `@grammyjs/parse-mode` | Default parse mode |
| Hydrate | `@grammyjs/hydrate` | Call methods on API objects |
| Files | `@grammyjs/files` | Download files easily |
| Runner | `@grammyjs/runner` | Scale with long polling |

## Common Patterns

### Restricting Access

```typescript
// Only allow specific users
const ADMIN_IDS = [123456789, 987654321];

bot.use((ctx, next) => {
  if (ctx.from && ADMIN_IDS.includes(ctx.from.id)) {
    return next();
  }
  return ctx.reply("Unauthorized.");
});
```

### Typing Indicator

```typescript
await ctx.replyWithChatAction("typing");
// ... do work ...
await ctx.reply("Done!");
```

### Deep Linking

```typescript
// User opens: t.me/yourbot?start=ref123
bot.command("start", (ctx) => {
  const payload = ctx.match; // "ref123"
  if (payload) {
    return ctx.reply(`Referred by: ${payload}`);
  }
  return ctx.reply("Welcome!");
});
```
