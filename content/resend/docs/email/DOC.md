---
name: email
description: "Modern email API platform with React Email integration, batch sending, scheduling, webhooks, and domain management"
metadata:
  languages: "javascript"
  versions: "6.12.4"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "resend,sdk,email,messaging"
---
# Resend Node.js SDK

## Golden Rule

**Always use the official `resend` package from npm.** The current version is 6.12.4.

```bash
npm install resend
```

Do not use unofficial or deprecated packages like `@philnash/resend` or `resend-client-sdk-python`. The official Resend Node.js SDK is maintained at https://github.com/resend/resend-node.

## Installation

Install the Resend SDK using npm, yarn, or pnpm:

```bash
npm install resend
```

## Environment Setup

Store your API key in an environment variable:

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxx
```

You can obtain an API key from the Resend Dashboard at https://resend.com/api-keys. The API key will only be shown once, so store it securely immediately.

## Initialization

Initialize the Resend client with your API key:

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

Or with a hardcoded key (not recommended for production):

```javascript
const resend = new Resend('re_xxxxxxxxx');
```

## Sending Emails

### Basic Email

Send a simple HTML email:

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
});

if (error) {
  console.error(error);
  return;
}

console.log(data);
// { id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' }
```

### Email with Plain Text

Send both HTML and plain text versions:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Hello World',
  html: '<p>This is the <strong>HTML</strong> version</p>',
  text: 'This is the plain text version',
});
```

If you omit the `text` parameter, it will be auto-generated from the HTML.

### Email with Multiple Recipients

Send to up to 50 recipients:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Hello World',
  html: '<p>Hello everyone!</p>',
});
```

### Email with CC and BCC

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['primary@example.com'],
  cc: ['cc1@example.com', 'cc2@example.com'],
  bcc: ['bcc1@example.com', 'bcc2@example.com'],
  subject: 'Hello World',
  html: '<p>Email with CC and BCC</p>',
});
```

### Email with Reply-To

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  replyTo: 'support@acme.com',
  subject: 'Hello World',
  html: '<p>Reply to this email!</p>',
});
```

Multiple reply-to addresses:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  replyTo: ['support@acme.com', 'help@acme.com'],
  subject: 'Hello World',
  html: '<p>Reply to this email!</p>',
});
```

### Email with Custom Headers

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Hello World',
  html: '<p>Email with custom headers</p>',
  headers: {
    'X-Entity-Ref-ID': '123456789',
    'X-Custom-Header': 'Custom Value',
  },
});
```

### Email with Tags

Tags are custom key/value pairs for tracking and categorizing emails:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Hello World',
  html: '<p>Email with tags</p>',
  tags: [
    { name: 'category', value: 'confirm_email' },
    { name: 'user_id', value: '12345' },
  ],
});
```

### Email with Attachments

Attachments support up to 40MB per email after Base64 encoding:

```javascript
import fs from 'fs';

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Invoice',
  html: '<p>Please find your invoice attached</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: fs.readFileSync('./invoice.pdf'),
    },
  ],
});
```

Attachment with custom content type:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Report',
  html: '<p>Your report is attached</p>',
  attachments: [
    {
      filename: 'report.csv',
      content: 'Name,Email\nJohn,john@example.com\n',
      contentType: 'text/csv',
    },
  ],
});
```

Multiple attachments:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Multiple Files',
  html: '<p>Multiple files attached</p>',
  attachments: [
    {
      filename: 'document1.pdf',
      content: fs.readFileSync('./document1.pdf'),
    },
    {
      filename: 'document2.pdf',
      content: fs.readFileSync('./document2.pdf'),
    },
  ],
});
```

### Scheduled Email

Schedule an email using natural language or ISO 8601 format. Emails can be scheduled up to 30 days in advance.

Natural language examples:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Scheduled Email',
  html: '<p>This email was scheduled</p>',
  scheduledAt: 'in 1 hour',
});
```

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Scheduled Email',
  html: '<p>This email was scheduled</p>',
  scheduledAt: 'tomorrow at 9am',
});
```

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Scheduled Email',
  html: '<p>This email was scheduled</p>',
  scheduledAt: 'Friday at 3pm ET',
});
```

ISO 8601 format:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Scheduled Email',
  html: '<p>This email was scheduled</p>',
  scheduledAt: '2024-08-05T11:52:01.858Z',
});
```

### Email with React Components

The Node.js SDK supports React components for email templates:

```javascript
import { Resend } from 'resend';
import { EmailTemplate } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Welcome',
  react: EmailTemplate({ firstName: 'John' }),
});
```

Example React email component:

```jsx
// email-template.jsx
import * as React from 'react';

export const EmailTemplate = ({ firstName }) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>Thanks for signing up.</p>
  </div>
);
```

With `@react-email/components`:

```jsx
import { Html, Button } from '@react-email/components';

export const EmailTemplate = ({ url }) => (
  <Html>
    <Button href={url}>Click me</Button>
  </Html>
);
```

### Idempotency

Use idempotency keys to prevent duplicate sends. Keys expire after 24 hours and must be max 256 characters:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Hello World',
  html: '<p>This is idempotent</p>',
}, {
  headers: {
    'Idempotency-Key': 'unique-key-123456',
  },
});
```

## Batch Emails

Send up to 100 emails in a single API call. Note that `attachments` and `scheduledAt` are not supported in batch mode.

### Basic Batch Send

```javascript
const { data, error } = await resend.batch.send([
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['user1@example.com'],
    subject: 'Hello User 1',
    html: '<p>Hello User 1</p>',
  },
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['user2@example.com'],
    subject: 'Hello User 2',
    html: '<p>Hello User 2</p>',
  },
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['user3@example.com'],
    subject: 'Hello User 3',
    html: '<p>Hello User 3</p>',
  },
]);

console.log(data);
// [
//   { id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' },
//   { id: '5d3a4f2e-8f7b-4c1d-9a3e-2b6c1e8f9a0b' },
//   { id: '7e9f1a3c-2d4b-5e6f-8a9c-3d4e5f6a7b8c' }
// ]
```

### Batch with Tags

```javascript
const { data, error } = await resend.batch.send([
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['user1@example.com'],
    subject: 'Hello',
    html: '<p>Hello</p>',
    tags: [{ name: 'category', value: 'welcome' }],
  },
  {
    from: 'Acme <onboarding@resend.dev>',
    to: ['user2@example.com'],
    subject: 'Hello',
    html: '<p>Hello</p>',
    tags: [{ name: 'category', value: 'welcome' }],
  },
]);
```

### Permissive Validation Mode

By default, if any email in a batch is invalid, the entire batch fails. Use permissive mode to process valid emails and return errors for invalid ones:

```javascript
const { data, error } = await resend.batch.send(
  [
    {
      from: 'Acme <onboarding@resend.dev>',
      to: ['valid@example.com'],
      subject: 'Valid Email',
      html: '<p>This is valid</p>',
    },
    {
      from: 'invalid-email',
      to: ['user@example.com'],
      subject: 'Invalid Email',
      html: '<p>This has invalid from address</p>',
    },
  ],
  {
    headers: {
      'X-Resend-Validation-Mode': 'permissive',
    },
  }
);

console.log(data);
// {
//   data: [{ id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' }],
//   errors: [{ message: 'Invalid from address', index: 1 }]
// }
```

## Managing Emails

### Retrieve Email by ID

Get details about a specific email:

```javascript
const { data, error } = await resend.emails.get(
  '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'
);

console.log(data);
// {
//   object: 'email',
//   id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794',
//   to: ['delivered@resend.dev'],
//   from: 'Acme <onboarding@resend.dev>',
//   created_at: '2023-04-03T22:13:42.674981+00:00',
//   subject: 'Hello World',
//   html: 'Congrats on sending your <strong>first email</strong>!',
//   text: null,
//   bcc: [],
//   cc: [],
//   reply_to: [],
//   last_event: 'delivered',
//   scheduled_at: null
// }
```

### Update Scheduled Email

Update the scheduled time for a scheduled email:

```javascript
const oneHourFromNow = new Date(Date.now() + 1000 * 60 * 60).toISOString();

const { data, error } = await resend.emails.update({
  id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794',
  scheduledAt: oneHourFromNow,
});

console.log(data);
// {
//   object: 'email',
//   id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'
// }
```

With natural language:

```javascript
const { data, error } = await resend.emails.update({
  id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794',
  scheduledAt: 'in 2 hours',
});
```

### Cancel Scheduled Email

Cancel a scheduled email that hasn't been sent yet:

```javascript
const { data, error } = await resend.emails.cancel(
  '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'
);

console.log(data);
// {
//   object: 'email',
//   id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'
// }
```

Note: Once an email is canceled, it cannot be rescheduled.

## Audiences

Audiences allow you to group and manage contacts for broadcasting.

### Create Audience

```javascript
const { data, error } = await resend.audiences.create({
  name: 'Registered Users',
});

console.log(data);
// {
//   object: 'audience',
//   id: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
//   name: 'Registered Users'
// }
```

### Retrieve Audience

```javascript
const { data, error } = await resend.audiences.get(
  '78261eea-8f8b-4381-83c6-79fa7120f1cf'
);
```

### List Audiences

```javascript
const { data, error } = await resend.audiences.list();

console.log(data);
// {
//   object: 'list',
//   data: [
//     {
//       id: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
//       name: 'Registered Users',
//       created_at: '2023-10-06T23:47:56.678Z'
//     }
//   ]
// }
```

### Delete Audience

```javascript
const { data, error } = await resend.audiences.remove(
  '78261eea-8f8b-4381-83c6-79fa7120f1cf'
);
```

## Contacts

Manage individual contacts within audiences.

### Create Contact

```javascript
const { data, error } = await resend.contacts.create({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  unsubscribed: false,
});

console.log(data);
// {
//   object: 'contact',
//   id: '479e3145-dd38-476b-932c-529ceb705947'
// }
```

### Create Contact (Minimal)

```javascript
const { data, error } = await resend.contacts.create({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  email: 'user@example.com',
});
```

### Retrieve Contact

```javascript
const { data, error } = await resend.contacts.get({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  id: '479e3145-dd38-476b-932c-529ceb705947',
});
```

### List Contacts

```javascript
const { data, error } = await resend.contacts.list({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
});

console.log(data);
// {
//   object: 'list',
//   data: [
//     {
//       id: '479e3145-dd38-476b-932c-529ceb705947',
//       email: 'user@example.com',
//       first_name: 'John',
//       last_name: 'Doe',
//       created_at: '2023-10-06T23:47:56.678Z',
//       unsubscribed: false
//     }
//   ]
// }
```

### Update Contact

```javascript
const { data, error } = await resend.contacts.update({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  id: '479e3145-dd38-476b-932c-529ceb705947',
  firstName: 'Jane',
  unsubscribed: true,
});
```

### Delete Contact

```javascript
const { data, error } = await resend.contacts.remove({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  id: '479e3145-dd38-476b-932c-529ceb705947',
});
```

## Broadcasts

Broadcasts allow you to send emails to entire audiences.

### Create Broadcast

```javascript
const { data, error } = await resend.broadcasts.create({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  from: 'Acme <newsletter@acme.com>',
  subject: 'Monthly Newsletter',
  html: 'Hi {{{FIRST_NAME|there}}}, you can unsubscribe here: {{{RESEND_UNSUBSCRIBE_URL}}}',
  name: 'October Newsletter',
});

console.log(data);
// {
//   id: '559ac32e-9ef5-46fb-82a1-b76b840c0f7b'
// }
```

### Create Broadcast with React

```javascript
import { NewsletterTemplate } from './newsletter-template';

const { data, error } = await resend.broadcasts.create({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  from: 'Acme <newsletter@acme.com>',
  subject: 'Monthly Newsletter',
  react: NewsletterTemplate(),
});
```

### Broadcast Template Variables

Use template variables in broadcasts:

- `{{{FIRST_NAME}}}` - Contact's first name
- `{{{LAST_NAME}}}` - Contact's last name
- `{{{EMAIL}}}` - Contact's email
- `{{{RESEND_UNSUBSCRIBE_URL}}}` - Unsubscribe URL

With fallback values:

```javascript
const { data, error } = await resend.broadcasts.create({
  audienceId: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  from: 'Acme <newsletter@acme.com>',
  subject: 'Hello {{{FIRST_NAME|Friend}}}',
  html: '<p>Hi {{{FIRST_NAME|there}}},</p><p>Thanks for subscribing!</p>',
});
```

### Send Broadcast Immediately

```javascript
const { data, error } = await resend.broadcasts.send(
  '559ac32e-9ef5-46fb-82a1-b76b840c0f7b'
);

console.log(data);
// {
//   id: '559ac32e-9ef5-46fb-82a1-b76b840c0f7b'
// }
```

### Send Broadcast with Scheduling

```javascript
const { data, error } = await resend.broadcasts.send(
  '559ac32e-9ef5-46fb-82a1-b76b840c0f7b',
  {
    scheduledAt: 'tomorrow at 9am',
  }
);
```

```javascript
const { data, error } = await resend.broadcasts.send(
  '559ac32e-9ef5-46fb-82a1-b76b840c0f7b',
  {
    scheduledAt: '2024-08-05T11:52:01.858Z',
  }
);
```

### Retrieve Broadcast

```javascript
const { data, error } = await resend.broadcasts.get(
  '559ac32e-9ef5-46fb-82a1-b76b840c0f7b'
);
```

### List Broadcasts

```javascript
const { data, error } = await resend.broadcasts.list();
```

### Update Broadcast

```javascript
const { data, error } = await resend.broadcasts.update({
  id: '559ac32e-9ef5-46fb-82a1-b76b840c0f7b',
  subject: 'Updated Newsletter Subject',
  html: '<p>Updated content</p>',
});
```

### Delete Broadcast

```javascript
const { data, error } = await resend.broadcasts.remove(
  '559ac32e-9ef5-46fb-82a1-b76b840c0f7b'
);
```

## Domains

Manage domains for sending emails.

### Create Domain

```javascript
const { data, error } = await resend.domains.create({
  name: 'example.com',
});

console.log(data);
// {
//   id: 'd91cd9bd-1176-453e-8fc1-35364d380206',
//   name: 'example.com',
//   status: 'not_started',
//   records: [
//     {
//       record: 'SPF',
//       name: 'example.com',
//       type: 'TXT',
//       value: 'v=spf1 include:_spf.resend.com ~all'
//     },
//     {
//       record: 'DKIM',
//       name: 'resend._domainkey.example.com',
//       type: 'TXT',
//       value: 'p=...'
//     }
//   ]
// }
```

### Retrieve Domain

```javascript
const { data, error } = await resend.domains.get(
  'd91cd9bd-1176-453e-8fc1-35364d380206'
);
```

### List Domains

```javascript
const { data, error } = await resend.domains.list();

console.log(data);
// {
//   object: 'list',
//   data: [
//     {
//       id: 'd91cd9bd-1176-453e-8fc1-35364d380206',
//       name: 'example.com',
//       status: 'verified',
//       created_at: '2023-04-03T22:13:42.674981+00:00'
//     }
//   ]
// }
```

### Verify Domain

After adding DNS records, verify the domain:

```javascript
const { data, error } = await resend.domains.verify(
  'd91cd9bd-1176-453e-8fc1-35364d380206'
);

console.log(data);
// {
//   object: 'domain',
//   id: 'd91cd9bd-1176-453e-8fc1-35364d380206',
//   status: 'verified'
// }
```

### Update Domain

```javascript
const { data, error } = await resend.domains.update({
  id: 'd91cd9bd-1176-453e-8fc1-35364d380206',
  clickTracking: true,
  openTracking: true,
});
```

### Delete Domain

```javascript
const { data, error } = await resend.domains.remove(
  'd91cd9bd-1176-453e-8fc1-35364d380206'
);
```

## API Keys

Manage API keys programmatically.

### Create API Key

```javascript
const { data, error } = await resend.apiKeys.create({
  name: 'Production',
  permission: 'full_access',
});

console.log(data);
// {
//   id: 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e',
//   token: 're_xxxxxxxxx'
// }
```

Available permissions:
- `full_access` - Can create, delete, get, and update any resource
- `sending_access` - Can only send emails

Create sending-only API key:

```javascript
const { data, error } = await resend.apiKeys.create({
  name: 'Sending Key',
  permission: 'sending_access',
});
```

Restrict to specific domain:

```javascript
const { data, error } = await resend.apiKeys.create({
  name: 'Domain-Specific Key',
  permission: 'sending_access',
  domainId: 'd91cd9bd-1176-453e-8fc1-35364d380206',
});
```

### List API Keys

```javascript
const { data, error } = await resend.apiKeys.list();

console.log(data);
// {
//   object: 'list',
//   has_more: false,
//   data: [
//     {
//       id: '91f3200a-df72-4654-b0cd-f202395f5354',
//       name: 'Production',
//       created_at: '2023-04-08T00:11:13.110779+00:00'
//     }
//   ]
// }
```

### Delete API Key

```javascript
const { data, error } = await resend.apiKeys.remove(
  'b6d24b8e-af0b-4c3c-be0c-359bbd97381e'
);
```

## Error Handling

All API methods return an object with `data` and `error` properties:

```javascript
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Hello',
  html: '<p>Hello</p>',
});

if (error) {
  console.error('Failed to send email:', error);
  return;
}

console.log('Email sent successfully:', data.id);
```

Common error scenarios:

```javascript
// Missing required fields
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  // Missing subject
  html: '<p>Hello</p>',
});
// error: { message: 'Missing required parameter: subject' }

// Invalid API key
const resend = new Resend('invalid_key');
const { data, error } = await resend.emails.send({...});
// error: { message: 'Invalid API key' }

// Unverified domain
const { data, error } = await resend.emails.send({
  from: 'user@unverified-domain.com',
  to: ['user@example.com'],
  subject: 'Hello',
  html: '<p>Hello</p>',
});
// error: { message: 'Domain not verified' }

// Rate limit exceeded
// error: { message: 'Rate limit exceeded' }
```

## Complete Examples

### Basic Email Sending

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(userEmail, userName) {
  const { data, error } = await resend.emails.send({
    from: 'Acme <welcome@acme.com>',
    to: [userEmail],
    subject: `Welcome to Acme, ${userName}!`,
    html: `
      <h1>Welcome, ${userName}!</h1>
      <p>Thanks for signing up. We're excited to have you on board.</p>
      <p>Get started by visiting your dashboard.</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  return data.id;
}

// Usage
await sendWelcomeEmail('user@example.com', 'John Doe');
```

### Scheduled Email with Attachment

```javascript
import { Resend } from 'resend';
import fs from 'fs';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendScheduledReport(recipient, reportPath, sendTime) {
  const { data, error } = await resend.emails.send({
    from: 'Reports <reports@acme.com>',
    to: [recipient],
    subject: 'Weekly Report',
    html: '<p>Your weekly report is attached.</p>',
    attachments: [
      {
        filename: 'weekly-report.pdf',
        content: fs.readFileSync(reportPath),
        contentType: 'application/pdf',
      },
    ],
    scheduledAt: sendTime,
    tags: [
      { name: 'type', value: 'report' },
      { name: 'frequency', value: 'weekly' },
    ],
  });

  if (error) {
    throw new Error(`Failed to schedule report: ${error.message}`);
  }

  return data.id;
}

// Usage
await sendScheduledReport(
  'manager@example.com',
  './reports/weekly.pdf',
  'Friday at 9am'
);
```

### Newsletter Broadcast

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewsletter(audienceId, content) {
  // Create broadcast
  const { data: broadcast, error: createError } = await resend.broadcasts.create({
    audienceId: audienceId,
    from: 'Newsletter <newsletter@acme.com>',
    subject: 'Monthly Update - October 2024',
    html: `
      <h1>Hi {{{FIRST_NAME|there}}}!</h1>
      ${content}
      <p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p>
    `,
    name: 'October 2024 Newsletter',
  });

  if (createError) {
    throw new Error(`Failed to create broadcast: ${createError.message}`);
  }

  // Send immediately
  const { data: sent, error: sendError } = await resend.broadcasts.send(
    broadcast.id
  );

  if (sendError) {
    throw new Error(`Failed to send broadcast: ${sendError.message}`);
  }

  return sent.id;
}

// Usage
await sendNewsletter(
  '78261eea-8f8b-4381-83c6-79fa7120f1cf',
  '<p>Here is what is new this month...</p>'
);
```

### Batch Email with Error Handling

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBatchNotifications(users) {
  const emails = users.map(user => ({
    from: 'Notifications <notifications@acme.com>',
    to: [user.email],
    subject: 'Important Update',
    html: `<p>Hi ${user.name}, we have an important update for you.</p>`,
    tags: [{ name: 'user_id', value: user.id }],
  }));

  const { data, error } = await resend.batch.send(emails, {
    headers: {
      'X-Resend-Validation-Mode': 'permissive',
    },
  });

  if (error) {
    throw new Error(`Batch send failed: ${error.message}`);
  }

  // Handle partial failures
  if (data.errors && data.errors.length > 0) {
    console.warn('Some emails failed:', data.errors);
  }

  return {
    successful: data.data.length,
    failed: data.errors?.length || 0,
    emailIds: data.data.map(d => d.id),
  };
}

// Usage
const users = [
  { id: '1', email: 'user1@example.com', name: 'User 1' },
  { id: '2', email: 'user2@example.com', name: 'User 2' },
  { id: '3', email: 'user3@example.com', name: 'User 3' },
];

const result = await sendBatchNotifications(users);
console.log(`Sent ${result.successful} emails, ${result.failed} failed`);
```

### Managing Audience and Contacts

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function setupMarketingList(listName, contacts) {
  // Create audience
  const { data: audience, error: audienceError } = await resend.audiences.create({
    name: listName,
  });

  if (audienceError) {
    throw new Error(`Failed to create audience: ${audienceError.message}`);
  }

  console.log(`Created audience: ${audience.id}`);

  // Add contacts
  const results = [];
  for (const contact of contacts) {
    const { data, error } = await resend.contacts.create({
      audienceId: audience.id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
    });

    if (error) {
      console.error(`Failed to add ${contact.email}:`, error.message);
    } else {
      results.push(data.id);
    }
  }

  return {
    audienceId: audience.id,
    contactsAdded: results.length,
  };
}

// Usage
const contacts = [
  { email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
  { email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
];

const result = await setupMarketingList('Q4 Campaign', contacts);
console.log(`Setup complete: ${result.contactsAdded} contacts added`);
```

### Cancel and Reschedule

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function rescheduleEmail(emailId, newTime) {
  // Update scheduled time
  const { data, error } = await resend.emails.update({
    id: emailId,
    scheduledAt: newTime,
  });

  if (error) {
    throw new Error(`Failed to reschedule: ${error.message}`);
  }

  return data.id;
}

async function cancelScheduledEmail(emailId) {
  const { data, error } = await resend.emails.cancel(emailId);

  if (error) {
    throw new Error(`Failed to cancel: ${error.message}`);
  }

  return data.id;
}

// Usage
const emailId = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794';

// Reschedule for 2 hours later
await rescheduleEmail(emailId, 'in 2 hours');

// Or cancel completely
await cancelScheduledEmail(emailId);
```

## TypeScript Support

The Resend SDK is written in TypeScript and includes full type definitions:

```typescript
import { Resend } from 'resend';
import type { CreateEmailOptions, CreateEmailResponse } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(
  options: CreateEmailOptions
): Promise<CreateEmailResponse> {
  const { data, error } = await resend.emails.send(options);

  if (error) {
    throw error;
  }

  return data;
}
```

Type definitions for all API methods are included in the package.
