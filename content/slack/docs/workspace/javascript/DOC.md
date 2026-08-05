---
name: workspace
description: "Slack Node SDK for building bots, handling workspace events, and messaging integrations"
metadata:
  languages: "javascript"
  versions: "7.16.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "slack,bot,workspace,messaging,events-api"
---

# Slack Node SDK Examples

Examples demonstrating the official Slack Node SDK packages for JavaScript/TypeScript applications.

## Examples

- **[example/](./example/)** - Production-Ready Slack Bot
  - Socket Mode real-time events with WebSocket connection
  - Message echo and pattern matching
  - User info retrieval (`users.info`)
  - Channel listing (`conversations.list`)
  - Automatic token refresh with OAuth v2
  - Auto-join channels on `not_in_channel` error
  - Comprehensive error handling with retry logic
  - Bot message filtering to prevent infinite loops
  - App mention handling
  - Environment variable validation
  - Graceful shutdown handlers

## Slack Node SDK Guidelines

<cite>

## Golden Rule: Use the Correct and Current SDK

Always use the official Slack Node SDK packages, which are the standard libraries for all Slack API interactions. Do not use legacy or deprecated packages.

- **Primary Package:** `@slack/web-api` - Official library for using the Slack Platform's Web API
- **OAuth Package:** `@slack/oauth` - For app installation and authentication flows  
- **Socket Mode Package:** `@slack/socket-mode` - For real-time WebSocket connections
- **Legacy/Deprecated Packages:** `@slack/events-api`, `@slack/interactive-messages`, `@slack/client` should not be used

**Installation:**
- **Correct:** `npm install @slack/web-api`
- **Correct:** `npm install @slack/socket-mode @slack/oauth`
- **Deprecated:** `npm install @slack/events-api` (End-of-Life as of May 31st, 2021)
- **Deprecated:** `npm install @slack/interactive-messages` (End-of-Life as of May 31st, 2021)

**APIs and Usage:**
- **Correct:** `import { WebClient } from '@slack/web-api'`
- **Correct:** `const web = new WebClient(token)`
- **Correct:** `await web.chat.postMessage({ ... })`
- **Correct:** `import { SocketModeClient } from '@slack/socket-mode'`
- **Correct:** `import { InstallProvider } from '@slack/oauth'`

## System Requirements

The Slack Node SDK requires:
- Node.js v18 or higher
- npm v8.6.0 or higher

## Initialization and Authentication

### Web API Client

The `@slack/web-api` package provides the `WebClient` class for all Web API interactions.

```javascript
import { WebClient } from '@slack/web-api';

// Initialize with bot token
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// Or with user token
const web = new WebClient(process.env.SLACK_USER_TOKEN);
```

### Socket Mode Client

For real-time events without exposing public endpoints:

```javascript
import { SocketModeClient } from '@slack/socket-mode';

const socketMode = new SocketModeClient({
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});
```

## Core API Methods

### Sending Messages

```javascript
import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

async function sendMessage() {
  try {
    const result = await web.chat.postMessage({
      channel: 'C1234567890',
      text: 'Hello world!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Hello *world*!'
          }
        }
      ]
    });
    console.log(`Message sent: ${result.ts}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

### File Uploads

```javascript
import { WebClient } from '@slack/web-api';
import fs from 'fs';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

async function uploadFile() {
  try {
    const result = await web.files.uploadV2({
      channel_id: 'C1234567890',
      file: fs.createReadStream('./document.pdf'),
      filename: 'document.pdf',
      initial_comment: 'Here is the document you requested.'
    });
    console.log('File uploaded:', result.file.id);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
```

### Getting User Information

```javascript
async function getUserInfo(userId) {
  try {
    const result = await web.users.info({
      user: userId
    });
    return result.user;
  } catch (error) {
    console.error('Error getting user info:', error);
  }
}
```

### Listing Conversations

```javascript
async function listChannels() {
  try {
    const result = await web.conversations.list({
      types: 'public_channel,private_channel',
      limit: 100
    });
    return result.channels;
  } catch (error) {
    console.error('Error listing channels:', error);
  }
}
```

## Socket Mode for Real-time Events

Socket Mode enables real-time event handling without public endpoints. Always acknowledge events immediately.

### Basic Setup

```javascript
import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_APP_TOKEN) {
  console.error('Missing required tokens');
  process.exit(1);
}

let currentBotToken = process.env.SLACK_BOT_TOKEN;
let web = new WebClient(currentBotToken);

const socketMode = new SocketModeClient({
  appToken: process.env.SLACK_APP_TOKEN
});
```

### Message Event Handling

Filter bot messages and handle app mentions properly:

```javascript
socketMode.on('message', async ({ event, ack }) => {
  try {
    await ack(); // Always acknowledge first

    // Skip bot messages and subtypes
    if (event.type === 'message' && !event.bot_id && event.text && event.subtype !== 'bot_message') {
      // Skip app mentions (handled by app_mention handler)
      if (event.subtype === 'app_mention' || (event.text && event.text.match(/<@[A-Z0-9]+>/))) {
        return;
      }

      console.log(`Message received: "${event.text}" from user: ${event.user}`);

      // Process message
      await web.chat.postMessage({
        channel: event.channel,
        text: `You said: "${event.text}"`
      });
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
});
```

### App Mention Handling

```javascript
socketMode.on('app_mention', async ({ event, ack }) => {
  try {
    await ack();

    console.log(`App mention: "${event.text}" from user: ${event.user}`);

    await web.chat.postMessage({
      channel: event.channel,
      text: `<@${event.user}> Hello!`
    });
  } catch (error) {
    console.error('Error handling app mention:', error);
  }
});
```

### Error Handling and Startup

```javascript
socketMode.on('error', (error) => {
  console.error('Socket Mode error:', error);
});

async function startBot() {
  try {
    console.log('Starting Slack bot...');

    // Test authentication first
    const auth = await web.auth.test();
    console.log(`Connected as: ${auth.user} (${auth.team})`);

    // Start socket mode
    await socketMode.start();
    console.log('Bot is running successfully!');
  } catch (error) {
    console.error('Error starting bot:', error);

    if (error.data?.error === 'invalid_auth') {
      console.error('Authentication failed. Check your SLACK_BOT_TOKEN.');
    } else if (error.data?.error === 'token_expired') {
      console.error('Token expired. Attempting refresh...');
      // Implement token refresh logic here
    }

    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down bot...');
  await socketMode.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down bot...');
  await socketMode.disconnect();
  process.exit(0);
});

startBot();
```

## OAuth Installation Flow

```javascript
import { InstallProvider } from '@slack/oauth';
import { WebClient } from '@slack/web-api';

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  installationStore: {
    storeInstallation: async (installation) => {
      // Store installation data in your database
      console.log('Installation:', installation);
    },
    fetchInstallation: async (installQuery) => {
      // Fetch installation data from your database
      return installation;
    }
  }
});

// Generate install URL
const installUrl = await installer.generateInstallUrl({
  scopes: ['chat:write', 'channels:read'],
  userScopes: ['chat:write']
});

// Handle OAuth callback
app.get('/slack/oauth_redirect', async (req, res) => {
  try {
    const installation = await installer.handleCallback(req, res);
    console.log('Installation successful:', installation);
  } catch (error) {
    console.error('OAuth error:', error);
  }
});
```

## Error Handling and Resilience

### Basic Error Handling

All API responses follow a consistent structure:

```javascript
import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

async function handleApiCall() {
  try {
    const result = await web.chat.postMessage({
      channel: 'C1234567890',
      text: 'Hello!'
    });

    if (result.ok) {
      console.log('Success:', result.ts);
    } else {
      console.error('API Error:', result.error);
    }
  } catch (error) {
    if (error.code === 'slack_webapi_platform_error') {
      console.error('Slack API Error:', error.data);
    } else {
      console.error('Network/Other Error:', error);
    }
  }
}
```

### Token Refresh Pattern

Implement automatic token refresh for OAuth apps:

```javascript
import fs from 'fs';

async function refreshBotToken() {
  try {
    console.log('Refreshing bot token...');
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: process.env.SLACK_BOT_REFRESH_TOKEN,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      currentBotToken = data.access_token;
      web = new WebClient(currentBotToken);

      // Update .env file with new token
      const envContent = fs.readFileSync('.env', 'utf8');
      const updatedContent = envContent.replace(
        /SLACK_BOT_TOKEN=.*/,
        `SLACK_BOT_TOKEN=${currentBotToken}`
      );
      fs.writeFileSync('.env', updatedContent);

      console.log('Bot token refreshed successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}
```

### Retry Pattern for Token Errors

Automatically retry API calls after token refresh:

```javascript
async function sendMessage(channel, text) {
  try {
    const result = await web.chat.postMessage({
      channel: channel,
      text: text
    });
    console.log(`Message sent: ${text}`);
    return result;
  } catch (error) {
    console.error('Error sending message:', error);

    // Handle token-related errors with refresh and retry
    if (error.data?.error === 'invalid_auth' ||
        error.data?.error === 'token_revoked' ||
        error.data?.error === 'token_expired') {
      console.log('Token appears invalid, attempting refresh...');
      const refreshed = await refreshBotToken();
      if (refreshed) {
        // Retry the message after token refresh
        try {
          const result = await web.chat.postMessage({
            channel: channel,
            text: text
          });
          console.log(`Message sent after token refresh: ${result.ts}`);
          return result;
        } catch (retryError) {
          console.error('Failed to send message even after token refresh:', retryError);
        }
      }
    }

    throw error;
  }
}
```

### Auto-Join Channel Pattern

Handle `not_in_channel` errors by joining automatically:

```javascript
async function ensureBotInChannel(channel) {
  try {
    const result = await web.conversations.join({ channel });
    if (result.ok) {
      console.log(`Joined channel ${channel} before sending message`);
      return true;
    }
  } catch (error) {
    if (error.data?.error === 'already_in_channel') {
      return true;
    }
    if (error.data?.error === 'method_not_supported_for_channel_type') {
      console.warn(`Cannot join channel type for ${channel}; proceeding without join.`);
    } else {
      console.error('Error joining channel:', error);
    }
  }
  return false;
}

async function sendMessage(channel, text) {
  try {
    return await web.chat.postMessage({ channel, text });
  } catch (error) {
    // Handle not_in_channel error
    if (error.data?.error === 'not_in_channel') {
      console.log(`Bot is not in channel ${channel}, attempting to join...`);
      const joined = await ensureBotInChannel(channel);
      if (joined) {
        try {
          const result = await web.chat.postMessage({ channel, text });
          console.log(`Message sent after joining channel: ${result.ts}`);
          return result;
        } catch (retryError) {
          console.error('Failed to send message even after joining channel:', retryError);
        }
      }
    }
    throw error;
  }
}
```

### Combined Error Handling Pattern

Apply retry logic to all API methods:

```javascript
async function getUserInfo(userId) {
  try {
    const result = await web.users.info({ user: userId });
    return result.user;
  } catch (error) {
    console.error('Error getting user info:', error);

    // Retry with token refresh if needed
    if (error.data?.error === 'invalid_auth' ||
        error.data?.error === 'token_revoked' ||
        error.data?.error === 'token_expired') {
      console.log('Token appears invalid, attempting refresh...');
      const refreshed = await refreshBotToken();
      if (refreshed) {
        try {
          const result = await web.users.info({ user: userId });
          return result.user;
        } catch (retryError) {
          console.error('Failed to get user info even after token refresh:', retryError);
        }
      }
    }
  }
}

async function listChannels() {
  try {
    const result = await web.conversations.list({
      types: 'public_channel,private_channel',
      limit: 100
    });
    return result.channels;
  } catch (error) {
    console.error('Error listing channels:', error);

    // Retry with token refresh if needed
    if (error.data?.error === 'invalid_auth' ||
        error.data?.error === 'token_revoked' ||
        error.data?.error === 'token_expired') {
      console.log('Token appears invalid, attempting refresh...');
      const refreshed = await refreshBotToken();
      if (refreshed) {
        try {
          const result = await web.conversations.list({
            types: 'public_channel,private_channel',
            limit: 100
          });
          return result.channels;
        } catch (retryError) {
          console.error('Failed to list channels even after token refresh:', retryError);
        }
      }
    }
  }
}
```

## Pagination

```javascript
async function getAllChannels() {
  const channels = [];
  let cursor;
  
  do {
    const result = await web.conversations.list({
      types: 'public_channel,private_channel',
      limit: 200,
      cursor: cursor
    });
    
    channels.push(...result.channels);
    cursor = result.response_metadata?.next_cursor;
  } while (cursor);
  
  return channels;
}
```

## Rate Limiting

The SDK automatically handles rate limiting with built-in retry logic:

```javascript
import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_BOT_TOKEN, {
  retryConfig: {
    retries: 3,
    factor: 2
  }
});
```

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import { WebClient, ChatPostMessageResponse } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

async function sendTypedMessage(): Promise<ChatPostMessageResponse> {
  return await web.chat.postMessage({
    channel: 'C1234567890',
    text: 'Hello TypeScript!'
  });
}
```

## Webhook Usage

```javascript
import { IncomingWebhook } from '@slack/webhook';

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

async function sendWebhookMessage() {
  await webhook.send({
    text: 'Hello from webhook!',
    attachments: [
      {
        color: 'good',
        text: 'This is an attachment'
      }
    ]
  });
}
```

## Block Kit Messages

```javascript
async function sendRichMessage() {
  await web.chat.postMessage({
    channel: 'C1234567890',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Welcome!'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'This is a *rich* message with buttons.'
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Click Me'
          },
          action_id: 'button_click'
        }
      }
    ]
  });
}
```

## Production Best Practices

### Environment Variable Validation

Always validate required environment variables at startup:

```javascript
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.SLACK_BOT_TOKEN) {
  console.error('❌ SLACK_BOT_TOKEN is required. Please check your .env file.');
  process.exit(1);
}

if (!process.env.SLACK_APP_TOKEN) {
  console.error('❌ SLACK_APP_TOKEN is required. Please check your .env file.');
  process.exit(1);
}
```

### Token Management

Use mutable references for tokens that may need refreshing:

```javascript
let currentBotToken = process.env.SLACK_BOT_TOKEN;
let web = new WebClient(currentBotToken);

// After refresh, reassign both:
currentBotToken = data.access_token;
web = new WebClient(currentBotToken);
```

### Comprehensive Startup Flow

Test authentication before starting Socket Mode:

```javascript
async function startBot() {
  try {
    console.log('🤖 Starting Slack bot...');

    // Test authentication first
    console.log('🔐 Testing authentication...');
    const auth = await web.auth.test();
    console.log(`✅ Connected as: ${auth.user} (${auth.team})`);

    // Start socket mode connection
    console.log('🔌 Starting Socket Mode connection...');
    await socketMode.start();

    console.log('🚀 Bot is running successfully!');
    console.log('📝 Available commands:');
    console.log('   - Send messages containing: "hello", "info", "channels"');
    console.log('   - Mention the bot in any channel');

  } catch (error) {
    console.error('❌ Error starting bot:', error);

    // Provide helpful error messages based on error type
    if (error.data?.error === 'invalid_auth') {
      console.error('🔑 Authentication failed. Please check your SLACK_BOT_TOKEN.');
    } else if (error.data?.error === 'token_revoked') {
      console.error('🔑 Token has been revoked. Please generate a new SLACK_BOT_TOKEN.');
    } else if (error.data?.error === 'token_expired') {
      console.error('🔑 Token has expired. Attempting to refresh...');
      const refreshed = await refreshBotToken();
      if (refreshed) {
        console.log('✅ Token refreshed successfully. Restarting bot...');
        return startBot(); // Restart with new token
      }
    } else if (error.message?.includes('invalid_app_token')) {
      console.error('🔑 Invalid app token. Please check your SLACK_APP_TOKEN.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error. Please check your internet connection.');
    }

    console.log('\n💡 Make sure you have:');
    console.log('   1. Created a .env file with valid tokens');
    console.log('   2. Enabled Socket Mode in your Slack app');
    console.log('   3. Added the required OAuth scopes');

    process.exit(1);
  }
}

startBot();
```

### Graceful Shutdown Handlers

Always disconnect Socket Mode cleanly:

```javascript
process.on('SIGINT', async () => {
  console.log('\nShutting down bot...');
  await socketMode.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down bot...');
  await socketMode.disconnect();
  process.exit(0);
});
```

### Message Filtering Best Practices

Prevent infinite loops and duplicate processing:

```javascript
socketMode.on('message', async ({ event, ack }) => {
  try {
    await ack(); // Always acknowledge first

    // Filter out bot messages, subtypes, and app mentions
    if (event.type === 'message' &&
        !event.bot_id &&
        event.text &&
        event.subtype !== 'bot_message') {

      // Skip app mentions (handled by app_mention handler)
      if (event.subtype === 'app_mention' ||
          (event.text && event.text.match(/<@[A-Z0-9]+>/))) {
        return;
      }

      // Process the message
      // ...
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
});
```

### Error Recovery Strategies

Implement comprehensive error recovery:

```javascript
async function sendMessage(channel, text) {
  try {
    const result = await web.chat.postMessage({
      channel: channel,
      text: text
    });
    console.log(`Message sent: ${text}`);
    return result;
  } catch (error) {
    console.error('Error sending message:', error);

    // 1. Handle token errors
    if (error.data?.error === 'invalid_auth' ||
        error.data?.error === 'token_revoked' ||
        error.data?.error === 'token_expired') {
      const refreshed = await refreshBotToken();
      if (refreshed) {
        return await web.chat.postMessage({ channel, text });
      }
    }
    // 2. Handle channel access errors
    else if (error.data?.error === 'not_in_channel') {
      const joined = await ensureBotInChannel(channel);
      if (joined) {
        return await web.chat.postMessage({ channel, text });
      }
    }

    // Don't try to send error messages for auth/channel errors
    if (!['invalid_auth', 'token_revoked', 'token_expired', 'not_in_channel'].includes(error.data?.error)) {
      try {
        await web.chat.postMessage({
          channel: channel,
          text: `⚠️ Error occurred: ${error.message}`
        });
      } catch (secondError) {
        console.error('Failed to send error message to channel:', secondError);
      }
    }

    throw error;
  }
}
```

## Notes

The Slack Node SDK is modular and designed for specific use cases. <cite/> The `@slack/web-api` package is the primary interface for most Slack API interactions, while `@slack/socket-mode` enables real-time communication without exposing public endpoints. <cite/> Legacy packages like `@slack/events-api` and `@slack/interactive-messages` reached End-of-Life on May 31st, 2021 and should be migrated to Socket Mode or the Bolt framework. <cite/> The SDK includes comprehensive TypeScript support and handles rate limiting, retries, and pagination automatically. <cite/>

Wiki pages you might want to explore:
- [Overview (slackapi/node-slack-sdk)](/wiki/slackapi/node-slack-sdk#1)

### Citations

```json
  "name": "@slack/web-api",
  "version": "7.9.2",
  "description": "Official library for using the Slack Platform's Web API",
```

```json
  "types": "./dist/index.d.ts",
```

```json
  "engines": {
    "node": ">= 18",
    "npm": ">= 8.6.0"
  },
```

```json
  "version": "2.0.2",
  "description": "Official library for using the Slack Platform's Interactive Buttons, Menus, Dialogs, Actions, and Block Actions",
  "author": "Slack Technologies, LLC",
  "license": "MIT",
  "keywords": [
    "slack",
    "interactive",
    "interactive-messages",
    "interactive-components",
    "dialog",
    "button",
    "menu",
    "action",
    "block-kit",
    "block-actions",
    "bot",
    "server",
    "http",
    "api",
    "verify",
    "signature",
    "request-signing"
  ],
```

```typescript
import type { WebAPICallResult } from '../../WebClient';
export type AuthTeamsListResponse = WebAPICallResult & {
  error?: string;
  needed?: string;
  ok?: boolean;
  provided?: string;
  response_metadata?: ResponseMetadata;
  teams?: Team[];
};
```
