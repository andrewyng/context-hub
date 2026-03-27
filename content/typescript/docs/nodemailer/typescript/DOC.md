---
name: nodemailer
description: "TypeScript declarations for Nodemailer transports, message options, SMTP configuration, and typed sendMail workflows."
metadata:
  languages: "typescript"
  versions: "7.0.11"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,nodemailer,email,smtp,types,definitelytyped"
---

# Nodemailer TypeScript Guide

## Golden Rule

Install `@types/nodemailer` alongside the real `nodemailer` runtime package.

`@types/nodemailer` only provides declarations. Your application imports and runs `nodemailer`; the declaration package adds types for `createTransport()`, `sendMail()`, `verify()`, `createTestAccount()`, transport option objects, and message payloads.

## Install

Install the runtime package first, then add TypeScript and the declaration packages you need.

```bash
npm install nodemailer
npm install -D typescript @types/node @types/nodemailer
```

If `nodemailer` is already in your app, add only the missing declarations:

```bash
npm install -D @types/node @types/nodemailer
```

`@types/nodemailer` depends on Node.js types. If your project restricts loaded ambient types with `compilerOptions.types`, include `node` in that list.

## Recommended `tsconfig.json`

The declaration package is Node-oriented, so keep Node types available and use normal strict TypeScript settings.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": false,
    "types": ["node"]
  }
}
```

If your app uses CommonJS settings instead, keep those settings. The important parts here are strict checking and including Node types.

## Import and Initialize

The declarations expose named exports from `nodemailer`, so a portable TypeScript import looks like this:

```typescript
import { createTransport, type SendMailOptions } from "nodemailer";
```

### Create an SMTP transporter

```typescript
import { createTransport, type SendMailOptions } from "nodemailer";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.SMTP_PORT ?? "587");
const secure = process.env.SMTP_SECURE === "true";

export const transporter = createTransport(
  {
    host: requireEnv("SMTP_HOST"),
    port,
    secure,
    auth: {
      user: requireEnv("SMTP_USER"),
      pass: requireEnv("SMTP_PASS"),
    },
  },
  {
    from: requireEnv("SMTP_FROM"),
  },
);

await transporter.verify();

const message: SendMailOptions = {
  to: "recipient@example.com",
  subject: "Hello",
  text: "Plain-text body",
  html: "<p>HTML body</p>",
};

const info = await transporter.sendMail(message);

console.log(info.messageId);
console.log(info.accepted);
console.log(info.rejected);
console.log(info.response);
```

The second `createTransport()` argument is a defaults object. A common pattern is to keep `from` there so each message only supplies recipients and content.

## Common Workflows

### Send attachments and inline images

`SendMailOptions` includes `attachments`, `html`, `text`, `cc`, `bcc`, `replyTo`, `headers`, `priority`, `icalEvent`, and other message fields.

```typescript
import { createTransport, type SendMailOptions } from "nodemailer";

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const message: SendMailOptions = {
  from: process.env.SMTP_FROM,
  to: "recipient@example.com",
  subject: "Monthly report",
  text: "See the attached report.",
  html: '<p>See the attached report.</p><img src="cid:logo@example.com" />',
  attachments: [
    {
      filename: "report.csv",
      content: Buffer.from("id,total\n1,42\n", "utf8"),
      contentType: "text/csv",
    },
    {
      filename: "invoice.pdf",
      path: "./invoices/invoice-42.pdf",
    },
    {
      filename: "logo.png",
      path: "./public/logo.png",
      cid: "logo@example.com",
    },
  ],
};

await transporter.sendMail(message);
```

Attachment `content` accepts a `string`, `Buffer`, or `Readable` stream. Attachment `path` is typed for file paths and URLs.

### Reuse pooled SMTP connections

For workers or bulk mail senders, the SMTP pool overload adds pool-specific options such as `maxConnections`, `maxMessages`, `rateDelta`, and `rateLimit`.

```typescript
import { createTransport } from "nodemailer";

const transporter = createTransport({
  pool: true,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 25,
});

if (transporter.isIdle()) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: "recipient@example.com",
    subject: "Queued message",
    text: "Sent through a pooled transporter.",
  });
}

transporter.close();
```

### Create a test account and preview URL

The declarations include `createTestAccount()` and `getTestMessageUrl()` for typed test-account flows.

```typescript
import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
} from "nodemailer";

const account = await createTestAccount();

const transporter = createTransport({
  host: account.smtp.host,
  port: account.smtp.port,
  secure: account.smtp.secure,
  auth: {
    user: account.user,
    pass: account.pass,
  },
});

const info = await transporter.sendMail({
  from: account.user,
  to: "recipient@example.com",
  subject: "Preview message",
  text: "Open the preview URL returned by Nodemailer.",
});

const previewUrl = getTestMessageUrl(info);

if (previewUrl) {
  console.log(previewUrl);
}
```

The returned account object includes `user`, `pass`, `smtp`, `imap`, `pop3`, and `web` fields.

## TypeScript-Specific Patterns

### Type the SMTP config explicitly

If you want the concrete SMTP option interface instead of an inferred object literal, import the transport submodule type and pass it to `createTransport()`.

```typescript
import { createTransport } from "nodemailer";
import SMTPTransport = require("nodemailer/lib/smtp-transport");

const transport: SMTPTransport.Options = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
  requireTLS: true,
};

const transporter = createTransport(transport);
```

The `SMTPTransport.Options` type includes the connection fields most apps need in practice: `host`, `port`, `secure`, `auth`, `ignoreTLS`, `requireTLS`, `connectionTimeout`, `greetingTimeout`, `socketTimeout`, `logger`, `debug`, and `tls`.

### Rely on inferred send results

When you create an SMTP transporter with the SMTP overload, `sendMail()` returns a typed SMTP result. You can use its fields directly without adding your own result interface.

```typescript
const info = await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: "recipient@example.com",
  subject: "Typed result",
  text: "This result is inferred from the selected transport.",
});

info.messageId;
info.accepted;
info.rejected;
info.pending;
info.response;
```

## Common Pitfalls

- Install `nodemailer` separately. `@types/nodemailer` does not include the runtime.
- Import from `nodemailer`, not from `@types/nodemailer`.
- If your project uses `compilerOptions.types`, include `node` or Node.js globals such as `Buffer`, `Readable`, and `process` will not be available to these declarations.
- `verify()` checks the selected transport configuration and resolves to `true`; it does not send a message.
- `pool: true` switches you to the pooled SMTP transport overload. Close pooled transporters when the process is shutting down.
- Message options can disable file-backed or URL-backed content with `disableFileAccess` and `disableUrlAccess`. That affects attachments and other message parts loaded from files or URLs.
- The submodule transport declarations such as `nodemailer/lib/smtp-transport` use `export =`. `import SMTPTransport = require("nodemailer/lib/smtp-transport")` is the safe form when you need those exact types.

## Official Sources

- https://www.npmjs.com/package/@types/nodemailer
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/nodemailer
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/nodemailer/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/nodemailer/lib/mailer/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/nodemailer/lib/smtp-transport/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/nodemailer/lib/smtp-connection/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/nodemailer/lib/smtp-pool/index.d.ts
