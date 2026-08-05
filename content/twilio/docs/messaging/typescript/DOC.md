---
name: messaging
description: "Cloud communications platform for SMS, voice, video, and WhatsApp messaging with programmable APIs"
metadata:
  languages: "typescript"
  versions: "6.0.2"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "twilio,sdk,sms,voice,communications"
---
# Twilio Node.js Coding Guidelines

You are a Twilio API coding expert. Help me with writing code using the Twilio Node.js library for building communication applications with SMS, voice calls, WhatsApp, and other messaging channels.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://www.twilio.com/docs/libraries/reference/twilio-node/

## Golden Rule: Use the Correct and Current SDK

Always use the official Twilio Node.js library, which is the standard library for all Twilio API interactions.

**Library Name:** Twilio Node.js Helper Library
**NPM Package:** `twilio`
**Supported Node.js Versions:** Node.js 20, 22 (LTS) and later (v6.x of the library requires Node.js >= 20)

**Installation:**
- **Correct:** `npm install twilio` or `yarn add twilio`

**APIs and Usage:**
- **Correct:** `const client = require('twilio')(accountSid, authToken)`
- **Correct:** `client.messages.create({...})` for SMS/MMS
- **Correct:** `client.calls.create({...})` for voice calls
- **Incorrect:** Using legacy or unofficial Twilio libraries
- **Incorrect:** Exposing credentials in front-end applications

## Authentication and Initialization

The Twilio Node.js library requires your Account SID and Auth Token for authentication.

### Environment Variables (Recommended)

Set up environment variables for secure credential management:

```javascript
// Uses TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables
const client = require('twilio')();

// Or explicitly pass credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
```

### Client Configuration Options

The Twilio client supports various configuration options:

```javascript
const client = require('twilio')(accountSid, authToken, {
  lazyLoading: false,        // Disable lazy loading for faster initial loads
  autoRetry: true,           // Enable automatic retry with exponential backoff
  maxRetries: 3,             // Maximum number of retries
  timeout: 30000,            // HTTPS agent socket timeout in milliseconds
  keepAlive: true,           // Enable connection reuse
  keepAliveMsecs: 1000,      // Keep-alive timeout
  maxSockets: 20,            // Maximum number of sockets
  region: 'au1',             // Specify region for Global Infrastructure
  edge: 'sydney',            // Specify edge location
  logLevel: 'debug'          // Enable debug logging
});
```

## Core Messaging (SMS/MMS)

### Basic SMS Messaging

Send SMS messages using the Messages API:

```javascript
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS() {
  try {
    const message = await client.messages.create({
      body: 'Hello from Twilio!',
      to: '+1234567890',     // Recipient's phone number in E.164 format
      from: '+0987654321'    // Your Twilio phone number
    });
    console.log(`Message sent with SID: ${message.sid}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}
```

### MMS with Media

Send MMS messages with media attachments:

```javascript
async function sendMMS() {
  const message = await client.messages.create({
    body: 'Check out this image!',
    to: '+1234567890',
    from: '+0987654321',
    mediaUrl: [
      'https://example.com/image.jpg',
      'https://example.com/video.mp4'
    ]
  });
  console.log(`MMS sent with SID: ${message.sid}`);
}
```

### WhatsApp Messaging

Send WhatsApp messages using channel addressing:

```javascript
async function sendWhatsApp() {
  const message = await client.messages.create({
    body: 'Hello via WhatsApp!',
    to: 'whatsapp:+1234567890',
    from: 'whatsapp:+0987654321'
  });
  console.log(`WhatsApp message sent: ${message.sid}`);
}
```

### Using Messaging Services

Use Messaging Services for better delivery and sender pool management:

```javascript
async function sendWithMessagingService() {
  const message = await client.messages.create({
    body: 'Hello from Messaging Service!',
    to: '+1234567890',
    messagingServiceSid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    // 'from' parameter is optional when using Messaging Service
  });
}
```

## Voice Calls

### Making Phone Calls

Create outbound calls using the Calls API:

```javascript
async function makeCall() {
  try {
    const call = await client.calls.create({
      to: '+1234567890',                    // Number to call
      from: '+0987654321',                  // Your Twilio number
      url: 'https://example.com/twiml',     // TwiML instructions URL
      method: 'POST',                       // HTTP method for TwiML URL
      statusCallback: 'https://example.com/status',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      timeout: 30,                          // Ring timeout in seconds
      record: true                          // Record the call
    });
    console.log(`Call initiated with SID: ${call.sid}`);
  } catch (error) {
    console.error('Error making call:', error);
  }
}
```

### Using TwiML Directly

Pass TwiML instructions directly without external URLs:

```javascript
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

async function makeCallWithTwiML() {
  const twiml = new VoiceResponse();
  twiml.say('Hello! This is a call from Twilio.');
  twiml.hangup();

  const call = await client.calls.create({
    to: '+1234567890',
    from: '+0987654321',
    twiml: twiml.toString()
  });
}
```

## TwiML Generation

### Voice TwiML

Generate TwiML for voice applications:

```javascript
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

function generateVoiceTwiML() {
  const twiml = new VoiceResponse();

  // Text-to-speech
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, 'Hello, thanks for calling!');

  // Play audio file
  twiml.play('https://example.com/welcome.mp3');

  // Gather user input
  const gather = twiml.gather({
    numDigits: 1,
    action: '/process-input',
    method: 'POST'
  });
  gather.say('Press 1 for sales, 2 for support');

  // Dial another number
  twiml.dial('+1234567890');

  return twiml.toString();
}
```

### Advanced Voice Features

Use advanced voice capabilities:

```javascript
function advancedVoiceTwiML() {
  const twiml = new VoiceResponse();

  // Conference calling
  const dial = twiml.dial();
  dial.conference('Customer Support Conference');

  // Record call
  twiml.record({
    action: '/handle-recording',
    method: 'POST',
    maxLength: 30,
    transcribe: true
  });

  // Connect to client/browser
  const dial2 = twiml.dial();
  dial2.client('john');

  return twiml.toString();
}
```

### Messaging TwiML

Generate TwiML responses for incoming messages:

```javascript
const MessagingResponse = twilio.twiml.MessagingResponse;

function generateMessagingTwiML() {
  const twiml = new MessagingResponse();
  twiml.message('Thanks for your message! We will get back to you soon.');
  return twiml.toString();
}
```

## Webhook Handling and Validation

### Express.js Webhook Integration

Handle and validate incoming Twilio webhooks:

```javascript
const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

// Webhook validation
function validateTwilioSignature(req, res, next) {
  const twilioSignature = req.headers['x-twilio-signature'];
  const params = req.body;
  const url = `https://${req.headers.host}${req.originalUrl}`;

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    url,
    params
  );

  if (!isValid) {
    return res.status(403).send('Forbidden');
  }
  next();
}

// Handle incoming calls
app.post('/voice', validateTwilioSignature, (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Hello from your webhook!');
  res.type('text/xml');
  res.send(twiml.toString());
});

// Handle incoming messages
app.post('/sms', validateTwilioSignature, (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();
  const incomingMessage = req.body.Body;

  if (incomingMessage.toLowerCase() === 'hello') {
    twiml.message('Hi there! How can I help you?');
  } else {
    twiml.message('Thanks for your message!');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});
```

### Webhook Validation Utilities

Use built-in validation helpers:

```javascript
// For Express.js
const isValid = twilio.validateExpressRequest(req, authToken);

// For general request validation
const isValid = twilio.validateRequest(
  authToken,
  twilioSignature,
  url,
  params
);

// Validate request with body
const isValid = twilio.validateRequestWithBody(
  authToken,
  twilioSignature,
  url,
  body
);
```

## Error Handling and Debugging

### Exception Handling

Handle Twilio API errors gracefully:

```javascript
// With promises
client.messages.create({
  body: 'Hello from Node',
  to: '+12345678901',
  from: '+12345678901',
})
.then((message) => console.log(message))
.catch((error) => {
  console.log(error.code);     // Twilio error code
  console.log(error.message);  // Error message
  console.log(error.status);   // HTTP status code
});

// With async/await
try {
  const message = await client.messages.create({
    body: 'Hello from Node',
    to: '+12345678901',
    from: '+12345678901',
  });
  console.log(message);
} catch (error) {
  console.error('Twilio Error:', error.code, error.message);
}
```

### Debug Logging

Enable debug logging to troubleshoot issues:

```javascript
// Via environment variable
process.env.TWILIO_LOG_LEVEL = 'debug';

// Via client configuration
const client = require('twilio')(accountSid, authToken, {
  logLevel: 'debug'
});

// Set after client creation
client.logLevel = 'debug';
```

### Request/Response Debugging

Access underlying request and response details:

```javascript
client.messages.create({
  to: '+14158675309',
  from: '+14258675310',
  body: 'Ahoy!',
})
.then(() => {
  // Access request details
  console.log(client.lastRequest.method);
  console.log(client.lastRequest.url);
  console.log(client.lastRequest.auth);
  console.log(client.lastRequest.params);
  console.log(client.lastRequest.headers);
  console.log(client.lastRequest.data);

  // Access response details
  console.log(client.httpClient.lastResponse.statusCode);
  console.log(client.httpClient.lastResponse.body);
});
```

## Advanced Features

### Pagination and Resource Iteration

Handle large result sets efficiently:

```javascript
// List all messages (with automatic pagination)
const messages = await client.messages.list({
  from: '+1234567890',
  limit: 100
});

// Stream through messages efficiently
client.messages.each({
  from: '+1234567890',
  pageSize: 50
}, (message) => {
  console.log(`Message: ${message.sid} - ${message.body}`);
});

// Manual pagination
let messages = await client.messages.page({
  from: '+1234567890',
  pageSize: 20
});

while (messages.instances.length > 0) {
  messages.instances.forEach(message => {
    console.log(message.body);
  });

  if (messages.nextPageUrl) {
    messages = await messages.nextPage();
  } else {
    break;
  }
}
```

### Subaccount Management

Work with main accounts and subaccounts:

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const subaccountSid = process.env.TWILIO_SUBACCOUNT_SID;

const client = require('twilio')(accountSid, authToken);

// Operations on main account (default)
const mainAccountCalls = await client.api.v2010.account.calls.list();

// Operations on subaccount
const subaccountCalls = await client.api.v2010.account(subaccountSid).calls.list();
```

### Auto-Retry Configuration

Configure automatic retry with exponential backoff:

```javascript
const client = require('twilio')(accountSid, authToken, {
  autoRetry: true,           // Enable auto-retry on 429 errors
  maxRetries: 3              // Maximum number of retries
});
```

### Connection Management

Configure HTTP agent options for connection reuse:

```javascript
const client = require('twilio')(accountSid, authToken, {
  timeout: 30000,            // Socket timeout in milliseconds
  keepAlive: true,           // Enable connection reuse
  keepAliveMsecs: 1000,      // Keep-alive timeout
  maxSockets: 20,            // Maximum number of sockets
  maxTotalSockets: 100,      // Maximum total sockets
  maxFreeSockets: 5,         // Maximum free sockets
  scheduling: "lifo"         // Socket scheduling
});
```

### Global Infrastructure

Target specific regions and edges:

```javascript
// Set during client initialization
const client = require('twilio')(accountSid, authToken, {
  region: 'au1',
  edge: 'sydney'
});

// Or set after client creation
client.region = 'au1';
client.edge = 'sydney';
```

## Security Best Practices

### Environment Variables

Never hardcode credentials in your application:

```javascript
//  Good - Use environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

//  Bad - Hardcoded credentials
const accountSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const authToken = 'your_auth_token';
```

### SSL Certificate Validation

Configure SSL bundle if needed:

```javascript
// Set CA bundle path via environment variable
process.env.TWILIO_CA_BUNDLE = '/path/to/ca-bundle.crt';
```

### Frontend Security Warning

Never use this library in frontend applications:

## Common Integration Patterns

### Message Status Tracking

Track message delivery status:

```javascript
async function sendAndTrackMessage() {
  const message = await client.messages.create({
    body: 'Hello World!',
    to: '+1234567890',
    from: '+0987654321',
    statusCallback: 'https://yourapp.com/sms-status'
  });

  // Later, check message status
  const updatedMessage = await client.messages(message.sid).fetch();
  console.log(`Message status: ${updatedMessage.status}`);
}
```

### Call Recording and Transcription

Record and transcribe calls:

```javascript
async function makeRecordedCall() {
  const call = await client.calls.create({
    to: '+1234567890',
    from: '+0987654321',
    url: 'https://yourapp.com/twiml',
    record: true,
    recordingStatusCallback: 'https://yourapp.com/recording-status'
  });
}
```

## OAuth Support (Beta)

The library supports OAuth 2.0 authentication:

```javascript
// OAuth with Client Credentials Flow
const client = twilio.ClientCredentialProviderBuilder()
  .username('your_api_key')
  .password('your_api_secret')
  .accountSid('your_account_sid')
  .build();
```

## TypeScript Support

The library includes TypeScript definitions:

```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

interface MessageOptions {
  body: string;
  to: string;
  from: string;
}

async function sendTypedMessage(options: MessageOptions): Promise<string> {
  const message = await client.messages.create(options);
  return message.sid;
}
```

## Error Codes and Troubleshooting

Common error scenarios to handle:

- **20003**: Authentication failed - check credentials
- **21211**: Invalid phone number format - use E.164 format
- **21608**: Phone number not verified - verify number first
- **30034**: Message delivery failed - recipient carrier issue

## Useful Links

- **Documentation**: https://www.twilio.com/docs/libraries/reference/twilio-node/
- **API Reference**: https://www.twilio.com/docs/api
- **Console**: https://console.twilio.com
- **TwiML Reference**: https://www.twilio.com/docs/voice/twiml
- **Error Codes**: https://www.twilio.com/docs/api/errors
- **Support**: https://support.twilio.com

## Notes

This guide covers the core functionality of the Twilio Node.js library. The library is auto-generated from Twilio's OpenAPI specifications, ensuring it stays current with API changes. For the most up-to-date information and additional services not covered here, refer to the official documentation.

## Official Documentation

# twilio-node

This library (v6.x) supports the following Node.js implementations:

- Node.js 20
- Node.js lts(22)
- Node.js 24

TypeScript is supported for TypeScript version 2.9 and above.

> **Warning**
> Do not use this Node.js library in a front-end application. Doing so can expose your Twilio credentials to end-users as part of the bundled HTML/JavaScript sent to their browser.

`npm install twilio` or `yarn add twilio`

```javascript
// Your AccountSID and Auth Token from console.twilio.com
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token';
```

```javascript
const client = require('twilio')(accountSid, authToken);
```

```javascript
client.messages
  .create({
    body: 'Hello from twilio-node',
    to: '+12345678901', // Text your number
    from: '+12345678901', // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
```

> **Warning**
> It's okay to hardcode your credentials when testing locally, but you should use environment variables to keep them secret before committing any code or deploying to production. Check out [How to Set Environment Variables](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html) for more information.

## OAuth Feature for Twilio APIs
We are introducing Client Credentials Flow-based OAuth 2.0 authentication. This feature is currently in beta and its implementation is subject to change.

API examples [here](https://github.com/twilio/twilio-node/blob/main/examples/public_oauth.js)

Organisation API examples [here](https://github.com/twilio/twilio-node/blob/main/examples/orgs_api.js)

`twilio-node` supports credential storage in environment variables. If no credentials are provided when instantiating the Twilio client (e.g., `const client = require('twilio')();`), the values in following env vars will be used: `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.

If your environment requires SSL decryption, you can set the path to CA bundle in the env var `TWILIO_CA_BUNDLE`.

If you invoke any V2010 operations without specifying an account SID, `twilio-node` will automatically use the `TWILIO_ACCOUNT_SID` value that the client was initialized with. This is useful for when you'd like to, for example, fetch resources for your main account but also your subaccount. See below:

```javascript
// Your Account SID, Subaccount SID Auth Token from console.twilio.com
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const subaccountSid = process.env.TWILIO_ACCOUNT_SUBACCOUNT_SID;

const client = require('twilio')(accountSid, authToken);
const mainAccountCalls = client.api.v2010.account.calls.list; // SID not specified, so defaults to accountSid
const subaccountCalls = client.api.v2010.account(subaccountSid).calls.list; // SID specified as subaccountSid
```

```javascript
const client = require('twilio')(accountSid, authToken, {
  lazyLoading: false,
});
```

### Enable Auto-Retry with Exponential Backoff

`twilio-node` supports automatic retry with exponential backoff when API requests receive an [Error 429 response](https://support.twilio.com/hc/en-us/articles/360044308153-Twilio-API-response-Error-429-Too-Many-Requests-). This retry with exponential backoff feature is disabled by default. To enable this feature, instantiate the Twilio client with the `autoRetry` flag set to `true`.

Optionally, the maximum number of retries performed by this feature can be set with the `maxRetries` flag. The default maximum number of retries is `3`.

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken, {
  autoRetry: true,
  maxRetries: 3,
});
```

```
### Set HTTP Agent Options

`twilio-node` allows you to set HTTP Agent Options in the Request Client. This feature allows you to re-use your connections. To enable this feature, instantiate the Twilio client with the `keepAlive` flag set to `true`.

Optionally, the socket timeout and maximum number of sockets can also be set. See the example below:

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken, {
    timeout: 30000, // HTTPS agent's socket timeout in milliseconds, default is 30000
    keepAlive: true, // https.Agent keepAlive option, default is false
    keepAliveMsecs: 1000, // https.Agent keepAliveMsecs option in milliseconds, default is 1000
    maxSockets: 20, // https.Agent maxSockets option, default is 20
    maxTotalSockets: 100, // https.Agent maxTotalSockets option, default is 100
    maxFreeSockets: 5, // https.Agent maxFreeSockets option, default is 5
    scheduling: "lifo", // https.Agent scheduling option, default is 'lifo'
});
```
```

```
### Specify Region and/or Edge

To take advantage of Twilio's [Global Infrastructure](https://www.twilio.com/docs/global-infrastructure), specify the target Region and/or Edge for the client:

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken, {
  region: 'au1',
  edge: 'sydney',
});
```

Alternatively, specify the edge and/or region after constructing the Twilio client:

```javascript
const client = require('twilio')(accountSid, authToken);
client.region = 'au1';
client.edge = 'sydney';
```

This will result in the `hostname` transforming from `api.twilio.com` to `api.sydney.au1.twilio.com`.
```

```
### Iterate through records

The library automatically handles paging for you. Collections, such as `calls` and `messages`, have `list` and `each` methods that page under the hood. With both `list` and `each`, you can specify the number of records you want to receive (`limit`) and the maximum size you want each page fetch to be (`pageSize`). The library will then handle the task for you.

`list` eagerly fetches all records and returns them as a list, whereas `each` streams records and lazily retrieves pages of records as you iterate over the collection. You can also page manually using the `page` method.

For more information about these methods, view the [auto-generated library docs](https://www.twilio.com/docs/libraries/reference/twilio-node/).
```

```
### Enable Debug Logging

There are two ways to enable debug logging in the default HTTP client. You can create an environment variable called `TWILIO_LOG_LEVEL` and set it to `debug` or you can set the logLevel variable on the client as debug:

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken, {
  logLevel: 'debug',
});
```

You can also set the logLevel variable on the client after constructing the Twilio client:

```javascript
const client = require('twilio')(accountSid, authToken);
client.logLevel = 'debug';
```
```

```
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token';

const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    to: '+14158675309',
    from: '+14258675310',
    body: 'Ahoy!',
  })
  .then(() => {
    // Access details about the last request
    console.log(client.lastRequest.method);
    console.log(client.lastRequest.url);
    console.log(client.lastRequest.auth);
    console.log(client.lastRequest.params);
    console.log(client.lastRequest.headers);
    console.log(client.lastRequest.data);

    // Access details about the last response
    console.log(client.httpClient.lastResponse.statusCode);
    console.log(client.httpClient.lastResponse.body);
  });
```
```

```
If the Twilio API returns a 400 or a 500 level HTTP response, `twilio-node` will throw an error including relevant information, which you can then `catch`:

```js
client.messages
  .create({
    body: 'Hello from Node',
    to: '+12345678901',
    from: '+12345678901',
  })
  .then((message) => console.log(message))
  .catch((error) => {
    // You can implement your fallback code here
    console.log(error);
  });
```
```

```
## Contributing

Bug fixes, docs, and library improvements are always welcome. Please refer to our [Contributing Guide](CONTRIBUTING.md) for detailed information on how you can contribute.

>  Please be aware that a large share of the files are auto-generated by our backend tool. You are welcome to suggest changes and submit PRs illustrating the changes. However, we'll have to make the changes in the underlying tool. You can find more info about this in the [Contributing Guide](CONTRIBUTING.md).
```

```typescript
  /** The recipient\'s phone number in [E.164](https://www.twilio.com/docs/glossary/what-e164) format (for SMS/MMS) or [channel address](https://www.twilio.com/docs/messaging/channels), e.g. `whatsapp:+15552229999`. */
  to: string;
```

```typescript
  /** The SID of the [Messaging Service](https://www.twilio.com/docs/messaging/services) you want to associate with the Message. When this parameter is provided and the `from` parameter is omitted, Twilio selects the optimal sender from the Messaging Service\'s Sender Pool. You may also provide a `from` parameter if you want to use a specific Sender from the Sender Pool. */
  messagingServiceSid?: string;
```

```typescript
  /** The URL of media to include in the Message content. `jpeg`, `jpg`, `gif`, and `png` file types are fully supported by Twilio and content is formatted for delivery on destination devices. The media size limit is 5 MB for supported file types (`jpeg`, `jpg`, `png`, `gif`) and 500 KB for [other types](https://www.twilio.com/docs/messaging/guides/accepted-mime-types) of accepted media. To send more than one image in the message, provide multiple `media_url` parameters in the POST request. You can include up to ten `media_url` parameters per message. [International](https://support.twilio.com/hc/en-us/articles/223179808-Sending-and-receiving-MMS-messages) and [carrier](https://support.twilio.com/hc/en-us/articles/223133707-Is-MMS-supported-for-all-carriers-in-US-and-Canada-) limits apply. */
  mediaUrl?: Array<string>;
```

```typescript
export interface CallListInstanceCreateOptions {
  /** The phone number, SIP address, or client identifier to call. */
  to: string;
  /** The phone number or client identifier to use as the caller id. If using a phone number, it must be a Twilio number or a Verified [outgoing caller id](https://www.twilio.com/docs/voice/api/outgoing-caller-ids) for your account. If the `to` parameter is a phone number, `From` must also be a phone number. */
  from: string;
```

```typescript
  /** TwiML instructions for the call Twilio will use without fetching Twiml from url parameter. If both `twiml` and `url` are provided then `twiml` parameter will be ignored. Max 4000 characters. */
  twiml?: TwiML | string;
```

```typescript
class VoiceResponse extends TwiML {
  /**
   * <Response> TwiML for Voice
   */
  constructor() {
    super();
    this._propertyName = "response";
  }
```

```typescript
  connect(attributes?: VoiceResponse.ConnectAttributes): VoiceResponse.Connect {
    return new VoiceResponse.Connect(this.response.ele("Connect", attributes));
```

```typescript
    export type MessagingResponse = IMessagingResponse;
    export const MessagingResponse = IMessagingResponse;
```

```typescript
  export type validateBody = typeof webhooks.validateBody;
  export const validateBody = webhooks.validateBody;
  export type validateRequest = typeof webhooks.validateRequest;
  export const validateRequest = webhooks.validateRequest;
  export type validateRequestWithBody = typeof webhooks.validateRequestWithBody;
  export const validateRequestWithBody = webhooks.validateRequestWithBody;
  export type validateExpressRequest = typeof webhooks.validateExpressRequest;
  export const validateExpressRequest = webhooks.validateExpressRequest;
  export type validateIncomingRequest = typeof webhooks.validateIncomingRequest;
  export const validateIncomingRequest = webhooks.validateIncomingRequest;
```

```typescript
export interface Request {
  protocol: string;
  header(name: string): string | undefined;
  headers: IncomingHttpHeaders;
  originalUrl: string;
  rawBody?: any;
  body: any;
}
```
