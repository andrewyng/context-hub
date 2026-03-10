---
name: bot-api
description: "Telegram Bot API via python-telegram-bot for building Telegram bots in Python"
metadata:
  languages: "python"
  versions: "21.10"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "telegram,bot,messaging,python-telegram-bot,chat"
---

# Telegram Bot API — Python SDK Coding Guidelines

You are a Telegram Bot API coding expert. Help me write code using the Telegram Bot API with the official and recommended Python libraries.

Official Telegram Bot API documentation:
https://core.telegram.org/bots/api

## Golden Rule: Use the Correct and Current SDK

Use **python-telegram-bot** (recommended) for Telegram bot development in Python.

- **Library Name:** python-telegram-bot
- **PyPI Package:** `python-telegram-bot`
- **Current Version:** 21.10
- **Legacy:** v13.x used synchronous code — v20+ is fully async

**Installation:**

```bash
pip install python-telegram-bot
```

**APIs and Usage:**

- **Correct:** `from telegram import Update, Bot`
- **Correct:** `from telegram.ext import Application, CommandHandler, MessageHandler, filters`
- **Correct:** `application = Application.builder().token("TOKEN").build()`
- **Incorrect:** `from telegram.ext import Updater` (removed in v20+)
- **Incorrect:** `updater.start_polling()` (use `application.run_polling()`)
- **Incorrect:** `bot.send_message()` synchronously (all methods are async in v20+)

## Initialization

```python
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Welcome! I'm your bot.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Here's how to use me...")

def main() -> None:
    app = Application.builder().token("YOUR_BOT_TOKEN").build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.run_polling()

if __name__ == "__main__":
    main()
```

## Sending Messages

### Plain Text

```python
await update.message.reply_text("Hello!")

# With parse mode
await update.message.reply_text("*Bold* and _italic_", parse_mode="MarkdownV2")
await update.message.reply_text("<b>Bold</b> and <i>italic</i>", parse_mode="HTML")
```

### Sending to a Specific Chat

```python
# Use context.bot to send without an update
await context.bot.send_message(chat_id=chat_id, text="Hello from bot!")

# Send to a topic/thread in a group
await context.bot.send_message(
    chat_id=chat_id,
    text="Hello topic!",
    message_thread_id=topic_id,
)
```

### Photos, Documents, and Media

```python
# Send a photo by URL
await update.message.reply_photo("https://example.com/image.jpg")

# Send a photo with caption
await update.message.reply_photo(
    "https://example.com/image.jpg",
    caption="Check this out!",
)

# Send a document
await update.message.reply_document(open("/path/to/file.pdf", "rb"))

# Send a photo from bytes
await context.bot.send_photo(chat_id=chat_id, photo=image_bytes)

# Send media group (album)
from telegram import InputMediaPhoto
await update.message.reply_media_group([
    InputMediaPhoto("https://example.com/1.jpg"),
    InputMediaPhoto("https://example.com/2.jpg"),
])
```

## Inline Keyboards

```python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CallbackQueryHandler

keyboard = InlineKeyboardMarkup([
    [
        InlineKeyboardButton("Button 1", callback_data="btn_1"),
        InlineKeyboardButton("Button 2", callback_data="btn_2"),
    ],
    [InlineKeyboardButton("Visit Site", url="https://example.com")],
])

await update.message.reply_text("Choose an option:", reply_markup=keyboard)

# Handle callback queries
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer("You clicked!")
    await query.edit_message_text(f"You selected: {query.data}")

app.add_handler(CallbackQueryHandler(button_handler))
```

## Custom Keyboards (Reply Keyboards)

```python
from telegram import ReplyKeyboardMarkup, KeyboardButton

keyboard = ReplyKeyboardMarkup(
    [[KeyboardButton("Option A"), KeyboardButton("Option B")],
     [KeyboardButton("Option C")]],
    resize_keyboard=True,
    one_time_keyboard=True,
)

await update.message.reply_text("Pick one:", reply_markup=keyboard)
```

## Commands

```python
# Set bot commands (shows in menu)
from telegram import BotCommand

await context.bot.set_my_commands([
    BotCommand("start", "Start the bot"),
    BotCommand("help", "Show help"),
    BotCommand("settings", "Open settings"),
])

# Register handlers
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("help", help_command))
```

## Conversation Handler (Multi-step Dialogs)

```python
from telegram.ext import ConversationHandler, MessageHandler, filters

NAME, AGE = range(2)

async def start_conv(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("What's your name?")
    return NAME

async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["name"] = update.message.text
    await update.message.reply_text("How old are you?")
    return AGE

async def get_age(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    name = context.user_data["name"]
    age = update.message.text
    await update.message.reply_text(f"Hi {name}, age {age}!")
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("Cancelled.")
    return ConversationHandler.END

conv_handler = ConversationHandler(
    entry_points=[CommandHandler("register", start_conv)],
    states={
        NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
        AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_age)],
    },
    fallbacks=[CommandHandler("cancel", cancel)],
)

app.add_handler(conv_handler)
```

## Message Handlers with Filters

```python
from telegram.ext import MessageHandler, filters

# Handle text messages
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))

# Handle photos
app.add_handler(MessageHandler(filters.PHOTO, handle_photo))

# Handle documents
app.add_handler(MessageHandler(filters.Document.ALL, handle_document))

# Handle specific text patterns (regex)
app.add_handler(MessageHandler(filters.Regex(r"^/custom_\w+"), handle_custom))

# Combine filters
app.add_handler(MessageHandler(
    filters.TEXT & filters.ChatType.PRIVATE,
    handle_private_text,
))
```

## Webhooks

```python
async def main() -> None:
    app = Application.builder().token("YOUR_TOKEN").build()
    app.add_handler(CommandHandler("start", start))

    await app.bot.set_webhook(url="https://yourdomain.com/webhook")
    await app.run_webhook(
        listen="0.0.0.0",
        port=8443,
        url_path="webhook",
        webhook_url="https://yourdomain.com/webhook",
    )
```

## Forum Topics (Supergroups)

```python
# Create a topic
topic = await context.bot.create_forum_topic(
    chat_id=chat_id,
    name="New Topic",
    icon_color=0x6FB9F0,
)

# Send message to a topic
await context.bot.send_message(
    chat_id=chat_id,
    text="Hello topic!",
    message_thread_id=topic.message_thread_id,
)

# Close/reopen a topic
await context.bot.close_forum_topic(chat_id, topic.message_thread_id)
await context.bot.reopen_forum_topic(chat_id, topic.message_thread_id)

# Delete a topic
await context.bot.delete_forum_topic(chat_id, topic.message_thread_id)
```

## Editing and Deleting Messages

```python
# Edit message text
await update.message.edit_text("Updated text")

# Edit via callback query
await update.callback_query.edit_message_text("Updated text")

# Edit with bot API (when you have chat_id and message_id)
await context.bot.edit_message_text(
    chat_id=chat_id,
    message_id=message_id,
    text="Updated text",
)

# Delete a message
await update.message.delete()
await context.bot.delete_message(chat_id=chat_id, message_id=message_id)
```

## Scheduled Jobs

```python
from telegram.ext import Application

async def alarm(context: ContextTypes.DEFAULT_TYPE) -> None:
    await context.bot.send_message(
        chat_id=context.job.chat_id,
        text="Reminder!",
    )

async def set_timer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    context.job_queue.run_once(alarm, when=60, chat_id=chat_id, name=str(chat_id))
    await update.message.reply_text("Timer set for 60 seconds.")

# Recurring job
context.job_queue.run_repeating(alarm, interval=3600, chat_id=chat_id)
```

## Error Handling

```python
from telegram.error import TelegramError, BadRequest, Forbidden, TimedOut

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    error = context.error
    if isinstance(error, BadRequest):
        print(f"Bad request: {error.message}")
    elif isinstance(error, Forbidden):
        print(f"Forbidden: {error.message}")  # bot blocked by user
    elif isinstance(error, TimedOut):
        print("Request timed out")
    else:
        print(f"Error: {error}")

app.add_error_handler(error_handler)
```

## Rate Limits

Telegram enforces rate limits:

- **1 message/second** to the same chat
- **30 messages/second** overall
- **20 messages/minute** to the same group

Use `python-telegram-bot`'s built-in rate limiter:

```python
from telegram.ext import AIORateLimiter

app = (
    Application.builder()
    .token("YOUR_TOKEN")
    .rate_limiter(AIORateLimiter())
    .build()
)
```

## Common Patterns

### Restricting Access

```python
ADMIN_IDS = [123456789, 987654321]

def admin_only(func):
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.effective_user.id not in ADMIN_IDS:
            await update.message.reply_text("Unauthorized.")
            return
        return await func(update, context)
    return wrapper

@admin_only
async def secret_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Admin-only content.")
```

### Typing Indicator

```python
from telegram.constants import ChatAction

await context.bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
# ... do work ...
await context.bot.send_message(chat_id=chat_id, text="Done!")
```

### Deep Linking

```python
# User opens: t.me/yourbot?start=ref123
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    args = context.args  # ["ref123"]
    if args:
        await update.message.reply_text(f"Referred by: {args[0]}")
    else:
        await update.message.reply_text("Welcome!")
```
