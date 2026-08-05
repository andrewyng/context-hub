---
name: error-tracking
description: "Sentry JavaScript SDK for error tracking, performance monitoring, and distributed tracing in Node.js and browser applications."
metadata:
  languages: "javascript"
  versions: "10.55.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "sentry,monitoring,error-tracking,performance,tracing"
---

# Sentry JavaScript SDK (10.55.0)

## Golden Rule

**ALWAYS use `@sentry/node` for Node.js applications or `@sentry/browser` for browser applications.**

The current stable version is **10.55.0**. Do not use deprecated packages like `raven` or `raven-js`.

For framework-specific applications, use the appropriate package:
- `@sentry/react` for React
- `@sentry/nextjs` for Next.js
- `@sentry/vue` for Vue
- `@sentry/angular` for Angular

## Installation

### Node.js Applications

```bash
npm install @sentry/node --save
```

### Browser Applications

```bash
npm install @sentry/browser --save
```

### Framework-Specific

```bash
npm install @sentry/react --save
npm install @sentry/nextjs --save
npm install @sentry/vue --save
```

### Environment Variables Setup

Create a `.env` file:

```env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=my-project@1.0.0
```

## Initialization

### Node.js Initialization

Create an `instrument.js` file and import it **before** any other modules:

```javascript
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  release: process.env.SENTRY_RELEASE,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance

  // Profiling
  integrations: [
    nodeProfilingIntegration(),
  ],
  profilesSampleRate: 1.0,

  // Send user IP and cookies
  sendDefaultPii: true,

  // Enable logging to Sentry
  enableLogs: true,
});

module.exports = Sentry;
```

Then import it first in your main file:

```javascript
require('./instrument');

const express = require('express');
const app = express();

// Your application code
```

### Browser Initialization

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  // Environment and release tracking
  environment: "production",
  release: "my-project@2.3.12",

  // Performance Monitoring
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Send user PII
  sendDefaultPii: true,
});
```

### React Initialization

```javascript
import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import App from "./App";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.render(<App />, document.getElementById("root"));
```

## Error Tracking

### Capture Exceptions

**Automatic Error Capture:**

Sentry automatically captures unhandled exceptions and promise rejections.

```javascript
// This error will be automatically captured
throw new Error("Something went wrong!");
```

**Manual Error Capture:**

```javascript
const Sentry = require("@sentry/node");

try {
  someFailingFunction();
} catch (error) {
  Sentry.captureException(error);
}
```

**Capture with Context:**

```javascript
try {
  processPayment(userId);
} catch (error) {
  Sentry.withScope((scope) => {
    scope.setTag("payment_method", "credit_card");
    scope.setUser({ id: userId });
    scope.setLevel("error");
    Sentry.captureException(error);
  });
}
```

### Capture Messages

```javascript
const Sentry = require("@sentry/node");

// Simple message
Sentry.captureMessage("User completed checkout");

// Message with severity level
Sentry.captureMessage("Payment processing slow", "warning");

// Available levels: "fatal", "error", "warning", "log", "info", "debug"
Sentry.captureMessage("Critical system failure", "fatal");
```

### Message with Context

```javascript
Sentry.withScope((scope) => {
  scope.setTag("section", "checkout");
  scope.setExtra("cart_total", 129.99);
  Sentry.captureMessage("Checkout completed", "info");
});
```

## Enriching Error Data

### Set User Information

```javascript
Sentry.setUser({
  id: "12345",
  email: "user@example.com",
  username: "john_doe",
  ip_address: "{{auto}}", // Automatically capture IP
});

// Clear user data
Sentry.setUser(null);
```

### Set Tags

Tags are searchable key-value pairs:

```javascript
// Set single tag
Sentry.setTag("page_locale", "en-us");
Sentry.setTag("environment", "staging");

// Set multiple tags
Sentry.setTags({
  page_locale: "en-us",
  user_type: "premium",
  platform: "web",
});
```

### Set Context

Context adds structured data to events:

```javascript
Sentry.setContext("character", {
  name: "Mighty Fighter",
  age: 19,
  attack_type: "melee",
  level: 42,
});

Sentry.setContext("order", {
  id: "ORD-12345",
  total: 249.99,
  items: 5,
  shipping_method: "express",
});
```

### Set Extra Data

```javascript
Sentry.setExtra("debug_data", {
  last_query: "SELECT * FROM users",
  response_time: 1234,
});
```

### Add Breadcrumbs

Breadcrumbs create a trail of events leading to an error:

```javascript
import * as Sentry from "@sentry/browser";

// Manual breadcrumb
Sentry.addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info",
});

Sentry.addBreadcrumb({
  category: "api",
  message: "API request to /users",
  level: "info",
  data: {
    url: "/api/users",
    method: "GET",
    status_code: 200,
  },
});

Sentry.addBreadcrumb({
  category: "navigation",
  message: "User navigated to checkout",
  level: "info",
  data: {
    from: "/cart",
    to: "/checkout",
  },
});
```

**Automatic Breadcrumbs:**

The SDK automatically captures:
- DOM clicks and key presses
- XHR/fetch requests
- Console API calls
- Navigation/location changes

**Filter Breadcrumbs:**

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out UI click events
    if (breadcrumb.category === "ui.click") {
      return null;
    }

    // Modify breadcrumb
    if (breadcrumb.category === "console") {
      breadcrumb.level = "debug";
    }

    return breadcrumb;
  },
});
```

## Scopes

Scopes contain data that is attached to events.

### Global Scope

```javascript
// Set data on global scope (affects all events)
Sentry.getGlobalScope().setTag("app_version", "1.0.0");
Sentry.getGlobalScope().setExtras({
  shared: "global",
  global: "data",
});
```

### Isolation Scope

```javascript
// Set data on isolation scope (default scope for most operations)
Sentry.setTag("my-tag", "my value");

// Equivalent to:
Sentry.getIsolationScope().setTag("my-tag", "my value");
```

### Current Scope

```javascript
// Set data on current scope
Sentry.getCurrentScope().setTag("request_id", "abc123");
```

### Temporary Scope with withScope

```javascript
// Create temporary scope for specific error
Sentry.withScope((scope) => {
  scope.setTag("section", "payment");
  scope.setLevel("warning");
  scope.setUser({ id: "12345" });
  Sentry.captureException(new Error("Payment failed"));
});

// This error won't have the above tags
Sentry.captureException(new Error("Another error"));
```

**Multiple Scopes:**

```javascript
Sentry.withScope((scope) => {
  scope.setTag("my-tag", "my value");
  scope.setLevel("warning");
  Sentry.captureException(new Error("my error")); // Has tag and level
});

Sentry.captureException(new Error("my other error")); // No tag or level
```

### Scope Data Precedence

```javascript
// Global scope (lowest priority)
Sentry.getGlobalScope().setExtras({
  shared: "global",
  global: "data",
});

// Isolation scope (medium priority)
Sentry.getIsolationScope().setExtras({
  shared: "isolation",
  isolation: "data",
});

// Current scope (highest priority)
Sentry.getCurrentScope().setExtras({
  shared: "current",
  current: "data",
});

// Event will have: { shared: "current", global: "data", isolation: "data", current: "data" }
Sentry.captureException(new Error("my error"));
```

## Performance Monitoring

### Basic Transaction

```javascript
const Sentry = require("@sentry/node");

// Synchronous operation
const result = Sentry.startSpan(
  {
    name: "Process Order",
    op: "task",
  },
  () => {
    return processOrder();
  }
);
```

### Async Transaction

```javascript
const result = await Sentry.startSpan(
  {
    name: "Fetch User Data",
    op: "http.client",
  },
  async () => {
    const response = await fetch("https://api.example.com/users");
    const data = await response.json();
    return data;
  }
);
```

### Nested Spans

```javascript
await Sentry.startSpan(
  {
    name: "Handle Request",
    op: "http.server",
  },
  async () => {
    // Child span 1
    await Sentry.startSpan(
      {
        name: "Database Query",
        op: "db.query",
      },
      async () => {
        return await db.query("SELECT * FROM users");
      }
    );

    // Child span 2
    await Sentry.startSpan(
      {
        name: "Process Results",
        op: "task",
      },
      async () => {
        return await processResults();
      }
    );
  }
);
```

### Manual Span Management

For cases where automatic span ending doesn't work:

```javascript
function middleware(_req, res, next) {
  return Sentry.startSpanManual(
    {
      name: "middleware",
      op: "middleware",
    },
    (span) => {
      res.once("finish", () => {
        span.setHttpStatus(res.status);
        span.end();
      });
      return next();
    }
  );
}
```

### Add Span Attributes

```javascript
Sentry.startSpan(
  {
    name: "Process Payment",
    op: "payment",
    attributes: {
      payment_method: "credit_card",
      amount: 99.99,
      currency: "USD",
      user_id: "12345",
    },
  },
  () => {
    return processPayment();
  }
);
```

### Span Operations

Use standard operation names:

```javascript
// HTTP requests
Sentry.startSpan({ name: "GET /api/users", op: "http.client" }, fetchUsers);

// Database queries
Sentry.startSpan({ name: "SELECT users", op: "db.query" }, queryUsers);

// Cache operations
Sentry.startSpan({ name: "Get from cache", op: "cache.get" }, getCache);

// File operations
Sentry.startSpan({ name: "Read file", op: "file.read" }, readFile);

// Custom tasks
Sentry.startSpan({ name: "Process data", op: "task" }, processData);
```

### Access Current Span

```javascript
const Sentry = require("@sentry/node");

function processItem(item) {
  const span = Sentry.getActiveSpan();

  if (span) {
    span.setAttribute("item_id", item.id);
    span.setAttribute("item_type", item.type);
  }

  // Process item
}
```

### Express.js Integration

```javascript
const express = require("express");
const Sentry = require("./instrument");

const app = express();

// RequestHandler creates a separate execution context
app.use(Sentry.expressIntegration());

app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// ErrorHandler must be registered before any other error middleware
app.use(Sentry.expressErrorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(3000);
```

## Session Replay

Session Replay captures user interactions for debugging.

### Basic Session Replay Setup

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Sample 10% of all sessions
  replaysSessionSampleRate: 0.1,

  // Sample 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,
});
```

### Session Replay Configuration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  integrations: [
    Sentry.replayIntegration({
      // Privacy settings
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,

      // Network details
      networkDetailAllowUrls: ["https://api.example.com"],
      networkRequestHeaders: ["X-Custom-Header"],
      networkResponseHeaders: ["X-Custom-Header"],

      // Performance
      networkCaptureBodies: true,

      // Canvas recording (experimental)
      // Note: No PII scrubbing for canvas!
    }),

    // Optional: Canvas recording
    Sentry.replayCanvasIntegration(),
  ],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Lazy-Load Session Replay

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [],
});

// Load replay later (e.g., after user interaction)
import("@sentry/browser").then((lazyLoadedSentry) => {
  Sentry.addIntegration(
    lazyLoadedSentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    })
  );
});
```

## Source Maps

Upload source maps to see readable stack traces:

### Install Sentry CLI

```bash
npm install @sentry/cli --save-dev
```

### Configure Source Maps Upload

Create `.sentryclirc`:

```ini
[auth]
token=YOUR_AUTH_TOKEN

[defaults]
url=https://sentry.io/
org=your-organization
project=your-project
```

### Upload with Webpack

```javascript
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

module.exports = {
  // ... other webpack config

  plugins: [
    new SentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "your-organization",
      project: "your-project",
      include: "./dist",
      ignore: ["node_modules", "webpack.config.js"],
    }),
  ],
};
```

### Manual Upload

```bash
sentry-cli releases files VERSION upload-sourcemaps /path/to/files
```

## Event Filtering

### Before Send Hook

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message && error.message.match(/network error/i)) {
        return null;
      }
    }

    // Modify event
    if (event.user) {
      delete event.user.ip_address;
    }

    return event;
  },
});
```

### Before Send Transaction Hook

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,

  beforeSendTransaction(event, hint) {
    // Don't send health check transactions
    if (event.transaction === "GET /health") {
      return null;
    }

    // Add custom data to all spans
    if (event.spans) {
      event.spans.forEach((span) => {
        span.data = span.data || {};
        span.data.custom_field = "custom_value";
      });
    }

    return event;
  },
});
```

## Sampling

### Error Sampling

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  // Sample 50% of errors
  sampleRate: 0.5,
});
```

### Performance Sampling

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  // Sample 25% of transactions
  tracesSampleRate: 0.25,

  // Or use dynamic sampling
  tracesSampler(samplingContext) {
    // Sample critical paths at 100%
    if (samplingContext.transactionContext.name.includes("/checkout")) {
      return 1.0;
    }

    // Sample health checks at 10%
    if (samplingContext.transactionContext.name.includes("/health")) {
      return 0.1;
    }

    // Default to 25%
    return 0.25;
  },
});
```

### Profile Sampling

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  integrations: [nodeProfilingIntegration()],

  // Profile 10% of transactions
  profilesSampleRate: 0.1,
});
```

## Releases and Deploys

### Set Release

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  release: "my-project@1.2.3",
  environment: "production",
});
```

### Create Release with CLI

```bash
# Create release
sentry-cli releases new my-project@1.2.3

# Associate commits
sentry-cli releases set-commits my-project@1.2.3 --auto

# Finalize release
sentry-cli releases finalize my-project@1.2.3

# Create deploy
sentry-cli releases deploys my-project@1.2.3 new -e production
```

## Testing Sentry Setup

### Test Error

```javascript
setTimeout(() => {
  throw new Error("Sentry Test Error - This is intentional!");
}, 1000);
```

### Test Message

```javascript
Sentry.captureMessage("Sentry is configured correctly!", "info");
```

### Test Transaction

```javascript
Sentry.startSpan(
  {
    name: "Test Transaction",
    op: "test",
  },
  () => {
    console.log("Testing Sentry performance monitoring");
  }
);
```

## Browser Integrations

### Breadcrumbs Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.breadcrumbsIntegration({
      console: true,  // Console logs
      dom: true,      // DOM events
      fetch: true,    // Fetch requests
      history: true,  // Navigation
      xhr: true,      // XHR requests
    }),
  ],
});
```

### HTTP Client Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.httpClientIntegration({
      failedRequestStatusCodes: [[400, 599]],
      failedRequestTargets: ["https://api.example.com"],
    }),
  ],
});
```

### Context Lines Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.contextLinesIntegration({
      frameContextLines: 5,
    }),
  ],
});
```

## Advanced Configuration

### Multiple Sentry Instances

```javascript
const Sentry = require("@sentry/node");

// Create hub for primary app
const primaryHub = new Sentry.Hub(new Sentry.Client({
  dsn: "https://primary@sentry.io/0",
}));

// Create hub for background jobs
const jobsHub = new Sentry.Hub(new Sentry.Client({
  dsn: "https://jobs@sentry.io/1",
}));

// Use specific hub
primaryHub.withScope((scope) => {
  primaryHub.captureException(new Error("Primary app error"));
});

jobsHub.withScope((scope) => {
  jobsHub.captureException(new Error("Background job error"));
});
```

### Custom Transport

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  transport: Sentry.makeNodeTransport,
  transportOptions: {
    headers: {
      "X-Custom-Header": "custom-value",
    },
  },
});
```

### Debug Mode

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  debug: true, // Enable debug logging
});
```

### Maximum Breadcrumbs

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  maxBreadcrumbs: 50, // Default is 100
});
```

### Shutdown

```javascript
// Flush events and close transport
await Sentry.close(2000); // Wait up to 2 seconds

// Or just flush without closing
await Sentry.flush(2000);
```

## Node.js Integrations

### HTTP Integration

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.httpIntegration({
      tracing: true,
      breadcrumbs: true,
    }),
  ],
});
```

### Console Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.consoleIntegration({
      levels: ["error", "warn"],
    }),
  ],
});
```

### Modules Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.modulesIntegration(),
  ],
});
```

### Context Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    Sentry.contextIntegration(),
  ],
});
```
