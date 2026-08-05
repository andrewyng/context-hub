---
name: email-api
description: "SendGrid Node.js library for sending transactional and marketing emails via the SendGrid API."
metadata:
  languages: "javascript"
  versions: "8.1.6"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "sendgrid,email,transactional,templates,delivery"
---

# SendGrid Node.js API Coding Guidelines (JavaScript/TypeScript)

You are a SendGrid Node.js API coding expert. Help me with writing code using the SendGrid Node.js library for email sending and API interactions. Please follow the following guidelines when generating code.

You can find the official documentation and code samples here: https://docs.sendgrid.com/for-developers/sending-email/nodejs

## Golden Rule: Use the Correct and Current Packages

Always use the official SendGrid Node.js packages, which are organized as a monorepo with specialized packages for different use cases. 

- **Main Email Package:** `@sendgrid/mail`
- **Full API Client:** `@sendgrid/client`
- **Helper Classes:** `@sendgrid/helpers`
- **Contact Management:** `@sendgrid/contact-importer`
- **Webhook Processing:** `@sendgrid/eventwebhook`
- **Inbound Email Parsing:** `@sendgrid/inbound-mail-parser`
- **Subscription Widget:** `@sendgrid/subscription-widget`

**Installation:**

- **For Email Sending Only:** `npm install @sendgrid/mail`
- **For Full API Access:** `npm install @sendgrid/client`
- **For Helper Classes:** `npm install @sendgrid/helpers`

**APIs and Usage:**

- **Incorrect:** `const sendgrid = require('sendgrid')` (legacy v2/v3 library)
- **Correct:** `const sgMail = require('@sendgrid/mail')`
- **Incorrect:** `sendgrid.send(...)` -> **Correct:** `sgMail.send(...)`
- **Incorrect:** `const client = require('@sendgrid/client')` without setup -> **Correct:** Set API key first

## Prerequisites and Setup

Before using SendGrid Node.js library, ensure you have:

- Node.js 18 or higher
- A Twilio SendGrid account (sign up for free to send up to 40,000 emails for the first 30 days)
- A verified sender identity 

## API Key Configuration

**Never hardcode your API key.** Always use environment variables: 

```bash
echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
echo "sendgrid.env" >> .gitignore
source ./sendgrid.env
```

## Basic Email Sending

### Simple Email

Here's how to send a basic email: 

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'test@example.com',
  from: 'test@example.com', // Use the email address or domain you verified
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

// ES6 Promise approach
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
  }, error => {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  });

// ES8 async/await approach
(async () => {
  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
})();
```

### Multiple Recipients

Send to multiple recipients: 

```javascript
sgMail.send({
  to: ['recipient1@example.org', 'recipient2@example.org'],
  from: 'sender@example.org',
  subject: 'Hello world',
  text: 'Hello plain world!',
  html: '<p>Hello HTML world!</p>',
});
```

### Send Multiple (Individual Emails)

Use `sendMultiple` to send individual emails to each recipient: 

```javascript
sgMail.sendMultiple({
  to: ['recipient1@example.org', 'recipient2@example.org'],
  from: 'sender@example.org',
  subject: 'Hello world',
  text: 'Hello plain world!',
  html: '<p>Hello HTML world!</p>',
});
```

## Advanced Email Features

### Personalizations with Substitutions

Send personalized emails with dynamic content: 

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  from: 'sender1@example.org',
  subject: 'Ahoy!',
  text: 'Ahoy {{name}}!',
  html: '<p>Ahoy {{name}}!</p>',
  personalizations: [
    {
      to: 'recipient1@example.org',
      substitutions: {
        name: 'Jon'
      }
    },
    {
      to: 'recipient2@example.org',
      substitutions: {
        name: 'Jane'
      }
    }
  ],
};

sgMail.send(msg);
```

### CC and BCC Recipients

Include CC and BCC recipients: 

```javascript
sgMail.send({
  to: 'recipient@example.org',
  cc: 'someone@example.org',
  bcc: ['me@example.org', 'you@example.org'],
  from: 'sender@example.org',
  replyTo: 'othersender@example.org',
  subject: 'Hello world',
  text: 'Hello plain world!',
  html: '<p>Hello HTML world!</p>',
});
```

## Client Configuration

### MailService Configuration

The MailService class provides various configuration options: 

```javascript
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Set timeout (in milliseconds)
sgMail.setTimeout(10000);

// Set substitution wrappers (default is {{ and }})
sgMail.setSubstitutionWrappers('{{', '}}');

// Use custom client instance
const {Client} = require('@sendgrid/client');
const customClient = new Client();
customClient.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setClient(customClient);
```

### Data Residency

Set data residency for EU compliance: 

```javascript
const client = require('@sendgrid/client');
const sgMail = require('@sendgrid/mail');

// Send to EU region
client.setDataResidency('eu');
sgMail.setClient(client);

const msg = {
  to: 'recipient@example.org',
  from: 'sender@example.org',
  subject: 'Hello world',
  text: 'Hello plain world!',
  html: '<p>Hello HTML world!</p>',
};

sgMail.send(msg);
```

## Direct API Client Usage

For accessing SendGrid's full v3 Web API: 

```javascript
const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_API_KEY);

const request = {
  method: 'GET',
  url: '/v3/api_keys'
};

client.request(request)
.then(([response, body]) => {
  console.log(response.statusCode);
  console.log(body);
})
```

### Custom Headers and Requests

Add custom headers and modify request defaults: 

```javascript
// Add custom default header
client.setDefaultHeader('User-Agent', 'Some user agent string');
// or
client.setDefaultHeader({'User-Agent': 'Some user agent string'});

// Change request defaults
client.setDefaultRequest('baseUrl', 'https://api.sendgrid.com/');
// or
client.setDefaultRequest({baseUrl: 'https://api.sendgrid.com/'});
```

### Multiple Client Instances

Create multiple client instances for different API keys: 

```javascript
const {Client} = require('@sendgrid/client');
const sgClient1 = new Client();
const sgClient2 = new Client();
sgClient1.setApiKey('KEY1');
sgClient2.setApiKey('KEY2');
```

## Error Handling

Handle SendGrid API errors properly: 

```javascript
try {
  await sgMail.send(msg);
  console.log('Email sent successfully');
} catch (error) {
  console.error('SendGrid Error:', error);
  
  if (error.response) {
    console.error('Response Status:', error.response.status);
    console.error('Response Body:', error.response.body);
    
    // Handle specific error codes
    if (error.response.status === 401) {
      console.error('Invalid API key');
    } else if (error.response.status === 403) {
      console.error('Sender not verified or insufficient permissions');
    }
  }
}
```

## Package Architecture

The SendGrid Node.js library follows a modular architecture: 

- **@sendgrid/mail** depends on **@sendgrid/client** and **@sendgrid/helpers**
- **@sendgrid/client** handles HTTP communication with SendGrid's API 
- **@sendgrid/helpers** provides utility classes for email construction 

## TypeScript Support

All packages include TypeScript definitions: 

```typescript
import { MailService, MailDataRequired, ClientResponse, ResponseError } from '@sendgrid/mail';

const sgMail: MailService = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg: MailDataRequired = {
  to: 'test@example.com',
  from: 'test@example.com',
  subject: 'Sending with TypeScript',
  text: 'Hello TypeScript world!',
  html: '<strong>Hello TypeScript world!</strong>',
};

sgMail.send(msg)
  .then(([response]: [ClientResponse, {}]) => {
    console.log('Email sent, status:', response.statusCode);
  })
  .catch((error: ResponseError) => {
    console.error('Error:', error);
  });
```

## Development and Testing

For development setup: 

```bash
git clone https://github.com/sendgrid/sendgrid-nodejs.git
cd sendgrid-nodejs
npm install
```

Run tests with Docker: 

```bash
make test-docker
```

## Useful Links

- **Documentation:** https://docs.sendgrid.com/for-developers/sending-email/nodejs
- **API Reference:** https://docs.sendgrid.com/api-reference/
- **GitHub Repository:** https://github.com/sendgrid/sendgrid-nodejs
- **Support:** https://support.sendgrid.com
- **Pricing:** https://sendgrid.com/pricing

## Notes

This SendGrid Node.js library is a monorepo containing seven specialized packages. The modular design allows you to install only the packages you need while maintaining consistency across the entire SDK. Always verify sender identities before sending emails to avoid 403 Forbidden responses.

### Wiki Pages

- [Monorepo Architecture (sendgrid/sendgrid-nodejs)](/wiki/sendgrid/sendgrid-nodejs#1.1)
- [Getting Started (sendgrid/sendgrid-nodejs)](/wiki/sendgrid/sendgrid-nodejs#1.2)
