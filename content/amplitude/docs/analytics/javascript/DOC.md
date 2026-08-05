---
name: analytics
description: "Amplitude Analytics JavaScript SDK for browser-based event tracking and product analytics"
metadata:
  languages: "javascript"
  versions: "2.42.5"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "amplitude,analytics,events,tracking,product"
---

# Amplitude Analytics - JavaScript SDK (@amplitude/analytics-browser)

## Golden Rule

**ALWAYS** use `@amplitude/analytics-browser` version 2.42.5 or newer for browser-based JavaScript applications.

**DO NOT** use the deprecated `amplitude-js` package. It is no longer maintained and lacks modern features.

For Node.js/server-side applications, use `@amplitude/analytics-node` instead.

---

## Installation

### Browser SDK (NPM/Yarn)

```bash
npm install @amplitude/analytics-browser
```

```bash
yarn add @amplitude/analytics-browser
```

### Script Loader (CDN)

```html
<script src="https://cdn.amplitude.com/script/AMPLITUDE_API_KEY.js"></script>
```

---

## Environment Variables Setup

Store your API key securely using environment variables:

```javascript
// .env file
VITE_AMPLITUDE_API_KEY=your_api_key_here
```

```javascript
// Access in code
const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY; // Vite
const API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY; // Create React App
const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY; // Next.js
```

---

## Initialization

### Basic Initialization

```javascript
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('YOUR_API_KEY');
```

### Initialize with User ID

```javascript
amplitude.init('YOUR_API_KEY', 'user@example.com');
```

### Initialize with Configuration

```javascript
amplitude.init('YOUR_API_KEY', 'user@example.com', {
  serverZone: 'US', // or 'EU' for European data residency
  logLevel: amplitude.Types.LogLevel.Debug,
  flushIntervalMillis: 1000,
  flushQueueSize: 30,
  sessionTimeout: 1800000, // 30 minutes
  optOut: false,
  autocapture: true
});
```

### Wait for Initialization

```javascript
await amplitude.init('YOUR_API_KEY').promise;
console.log('Amplitude initialized');
```

### Angular Applications with Zone.js

```javascript
import { NgZone } from '@angular/core';

constructor(private ngZone: NgZone) {
  this.ngZone.runOutsideAngular(() => {
    amplitude.init('YOUR_API_KEY');
  });
}
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `flushIntervalMillis` | number | 1000 | Time between event batch uploads (ms) |
| `flushQueueSize` | number | 30 | Maximum events before triggering upload |
| `serverZone` | 'US' \| 'EU' | 'US' | Data residency region |
| `userId` | string | undefined | User identifier (min 5 characters) |
| `deviceId` | string | UUID() | Device identifier |
| `sessionTimeout` | number | 1800000 | Session timeout duration (ms) |
| `optOut` | boolean | false | Disable event tracking |
| `autocapture` | boolean \| object | true | Enable automatic event capture |
| `identityStorage` | string | 'cookie' | Storage method: 'cookie', 'localStorage', 'sessionStorage' |
| `minIdLength` | number | 5 | Minimum length for user/device IDs |
| `logLevel` | LogLevel | Warn | Console logging verbosity |
| `trackingOptions` | object | {} | Disable specific auto-tracked properties |

---

## Core API Surfaces

### Event Tracking

#### Basic Event

```javascript
amplitude.track('Button Clicked');
```

#### Event with Properties

```javascript
amplitude.track('Button Clicked', {
  buttonColor: 'primary',
  buttonText: 'Submit',
  section: 'header',
  userId: 12345
});
```

#### Advanced Event Object

```javascript
const event = {
  event_type: 'Product Viewed',
  event_properties: {
    productId: 'SKU-123',
    category: 'Electronics',
    price: 299.99
  },
  groups: {
    organization: 'acme-corp'
  },
  group_properties: {
    plan: 'enterprise',
    seats: 50
  }
};

amplitude.track(event);
```

#### Event with Callback

```javascript
const result = await amplitude.track('Form Submitted', {
  formName: 'contact'
}).promise;

console.log(result.code);    // HTTP status code
console.log(result.message); // Response message
console.log(result.event);   // Event object
```

---

### User Identification

#### Set User ID

```javascript
amplitude.setUserId('user@example.com');
```

#### Set Device ID

```javascript
amplitude.setDeviceId('custom-device-id-12345');
```

#### Set Session ID

```javascript
amplitude.setSessionId(Date.now());
```

#### Reset User (Logout)

```javascript
// Clears userId and generates new deviceId
amplitude.reset();
```

---

### User Properties

#### Create Identify Object

```javascript
const identify = new amplitude.Identify();
```

#### Set Properties

```javascript
const identify = new amplitude.Identify();
identify.set('name', 'John Doe');
identify.set('email', 'john@example.com');
identify.set('age', 30);
identify.set('premium', true);

amplitude.identify(identify);
```

#### Set Once (Only if Not Already Set)

```javascript
const identify = new amplitude.Identify();
identify.setOnce('signup_date', new Date().toISOString());
identify.setOnce('first_source', 'google');

amplitude.identify(identify);
```

#### Add (Increment Numeric Values)

```javascript
const identify = new amplitude.Identify();
identify.add('login_count', 1);
identify.add('credits', 100);

amplitude.identify(identify);
```

#### Append to Array

```javascript
const identify = new amplitude.Identify();
identify.append('visited_pages', '/dashboard');
identify.append('purchased_products', 'SKU-123');

amplitude.identify(identify);
```

#### Prepend to Array

```javascript
const identify = new amplitude.Identify();
identify.prepend('recent_searches', 'laptop');

amplitude.identify(identify);
```

#### Post Insert (Add to End if Not Present)

```javascript
const identify = new amplitude.Identify();
identify.postInsert('tags', 'premium');

amplitude.identify(identify);
```

#### Pre Insert (Add to Beginning if Not Present)

```javascript
const identify = new amplitude.Identify();
identify.preInsert('badges', 'early_adopter');

amplitude.identify(identify);
```

#### Remove from Array

```javascript
const identify = new amplitude.Identify();
identify.remove('blocked_users', 'user123');

amplitude.identify(identify);
```

#### Unset Property

```javascript
const identify = new amplitude.Identify();
identify.unset('temporary_token');

amplitude.identify(identify);
```

#### Clear All Properties

```javascript
const identify = new amplitude.Identify();
identify.clearAll();

amplitude.identify(identify);
```

#### Chain Multiple Operations

```javascript
const identify = new amplitude.Identify()
  .set('plan', 'premium')
  .add('login_count', 1)
  .append('visited_pages', '/checkout')
  .setOnce('signup_date', '2025-01-01');

amplitude.identify(identify);
```

---

### Group Analytics

#### Set Single Group

```javascript
amplitude.setGroup('organization', 'acme-corp');
```

#### Set Multiple Groups

```javascript
amplitude.setGroup('teams', ['engineering', 'product', 'design']);
```

#### Set Group Properties

```javascript
const groupIdentify = new amplitude.Identify();
groupIdentify.set('plan', 'enterprise');
groupIdentify.set('seats', 100);
groupIdentify.set('industry', 'technology');

amplitude.groupIdentify('organization', 'acme-corp', groupIdentify);
```

#### Event-Level Groups (Non-Persistent)

```javascript
amplitude.track({
  event_type: 'Feature Used',
  event_properties: {
    feature_name: 'export'
  },
  groups: {
    department: 'sales',
    region: 'north-america'
  }
});
```

---

### Revenue Tracking

#### Basic Revenue

```javascript
const revenue = new amplitude.Revenue()
  .setProductId('com.company.premium')
  .setPrice(9.99);

amplitude.revenue(revenue);
```

#### Advanced Revenue Tracking

```javascript
const revenue = new amplitude.Revenue()
  .setProductId('com.company.product')
  .setPrice(29.99)
  .setQuantity(2)
  .setRevenueType('purchase')
  .setReceipt('receipt-id-12345')
  .setReceiptSignature('signature-abc')
  .setEventProperties({
    region: 'US',
    currency: 'USD',
    paymentMethod: 'credit_card'
  });

amplitude.revenue(revenue);
```

---

### Autocapture Events

#### Enable All Autocapture

```javascript
amplitude.init('YOUR_API_KEY', {
  autocapture: true
});
```

#### Selective Autocapture

```javascript
amplitude.init('YOUR_API_KEY', {
  autocapture: {
    attribution: true,           // UTM parameters, referrer
    pageViews: true,             // Page view events
    sessions: true,              // Session start/end
    formInteractions: true,      // Form submissions
    fileDownloads: true,         // File download clicks
    elementInteractions: false,  // Element clicks (opt-in)
    webVitals: false            // Core Web Vitals (opt-in)
  }
});
```

#### Page View Tracking

```javascript
amplitude.init('YOUR_API_KEY', {
  autocapture: {
    pageViews: {
      trackOn: () => {
        // Custom logic to determine if page should be tracked
        return window.location.pathname.includes('/app');
      },
      trackHistoryChanges: 'pathOnly', // 'all' or 'pathOnly'
      eventType: 'Page Viewed' // Custom event type name
    }
  }
});
```

#### Element Interaction Tracking

```javascript
amplitude.init('YOUR_API_KEY', {
  autocapture: {
    elementInteractions: {
      cssSelectorAllowlist: ['.track-click', '[data-amp-track]'],
      pageUrlAllowlist: [/\/dashboard/, /\/checkout/],
      dataAttributePrefix: 'data-amp-track'
    }
  }
});
```

```html
<button class="track-click" data-amp-track-name="Checkout Button">
  Checkout
</button>
```

#### Network Request Tracking

```javascript
amplitude.init('YOUR_API_KEY', {
  autocapture: {
    networkTracking: {
      captureRules: [
        {
          urls: [/api\.example\.com/, /\.googleapis\.com/],
          statusCodeRange: '400-599', // Track errors only
          requestHeaders: ['content-type', 'authorization'],
          responseHeaders: ['x-request-id'],
          responseBody: {
            allowlist: ['error', 'message', 'code']
          }
        }
      ]
    }
  }
});
```

#### Attribution Tracking

```javascript
amplitude.init('YOUR_API_KEY', {
  autocapture: {
    attribution: {
      excludeReferrers: [
        /yourdomain\.com$/,
        'google.com',
        'facebook.com'
      ],
      initialEmptyValue: 'EMPTY',
      resetSessionOnNewCampaign: false
    }
  }
});
```

**Captured attribution parameters:**
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `referrer`, `referring_domain`
- `gclid`, `fbclid`, `dclid`, `ttclid`, `msclkid`

---

### Multiple Project Tracking

```javascript
// Default instance
const defaultInstance = amplitude.createInstance();
defaultInstance.init('API_KEY_DEFAULT');

// Production instance
const prodInstance = amplitude.createInstance();
prodInstance.init('API_KEY_PROD', { instanceName: 'production' });

// Development instance
const devInstance = amplitude.createInstance();
devInstance.init('API_KEY_DEV', { instanceName: 'development' });

// Track to specific instance
defaultInstance.track('Default Event');
prodInstance.track('Production Event');
devInstance.track('Development Event');
```

---

### Plugin System

#### Enrichment Plugin

```javascript
const urlEnrichmentPlugin = {
  name: 'url-enricher',
  type: 'enrichment',
  setup: async (config) => {
    console.log('Plugin setup complete');
  },
  execute: async (event) => {
    event.event_properties = {
      ...event.event_properties,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer
    };
    return event;
  }
};

amplitude.add(urlEnrichmentPlugin);
```

#### Destination Plugin

```javascript
const customDestinationPlugin = {
  name: 'custom-analytics',
  type: 'destination',
  setup: async (config) => {
    // Initialize custom analytics
  },
  execute: async (event) => {
    try {
      const response = await fetch('https://api.custom-analytics.com/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TOKEN'
        },
        body: JSON.stringify(event)
      });

      return {
        code: response.status,
        event: event,
        message: response.statusText
      };
    } catch (error) {
      return {
        code: 500,
        event: event,
        message: error.message
      };
    }
  }
};

amplitude.add(customDestinationPlugin);
```

#### Remove Plugin

```javascript
amplitude.remove('plugin-name');
```

---

### Session Management

#### Get Session ID

```javascript
const sessionId = amplitude.getSessionId();
console.log('Current session:', sessionId);
```

#### Set Custom Session ID

```javascript
amplitude.setSessionId(Date.now());
```

#### Custom Session Timeout

```javascript
amplitude.init('YOUR_API_KEY', {
  sessionTimeout: 600000 // 10 minutes
});
```

---

### Cross-Domain Tracking

#### Site 1: Get User/Device IDs

```javascript
const deviceId = amplitude.getDeviceId();
const sessionId = amplitude.getSessionId();
const userId = amplitude.getUserId();

// Redirect with IDs
window.location.href = `https://site2.com?ampDeviceId=${deviceId}&ampSessionId=${sessionId}`;
```

#### Site 2: Automatically Pick Up IDs

```javascript
// IDs automatically extracted from URL parameters
amplitude.init('YOUR_API_KEY');
```

---

### Opt-Out Control

#### Disable Tracking

```javascript
amplitude.setOptOut(true);
```

#### Enable Tracking

```javascript
amplitude.setOptOut(false);
```

---

### Buffer Management

#### Flush Events Immediately

```javascript
amplitude.flush();
```

#### Flush with Promise

```javascript
await amplitude.flush().promise;
console.log('All events sent');
```

#### Send Beacon on Page Exit

```javascript
window.addEventListener('pagehide', () => {
  amplitude.setTransport('beacon');
  amplitude.flush();
});
```

---

### Tracking Options

```javascript
amplitude.init('YOUR_API_KEY', {
  trackingOptions: {
    ipAddress: false,
    language: false,
    platform: false,
    osName: false,
    osVersion: false,
    deviceManufacturer: false,
    deviceModel: false,
    carrier: false,
    city: false,
    country: false,
    region: false,
    dma: false
  }
});
```

---

### Identity Storage

```javascript
amplitude.init('YOUR_API_KEY', {
  identityStorage: 'localStorage' // 'cookie', 'localStorage', 'sessionStorage', 'none'
});
```

---

### Custom Storage Provider

```javascript
class CustomStorage {
  isEnabled() {
    return true;
  }

  get(key) {
    return localStorage.getItem(key);
  }

  set(key, value) {
    localStorage.setItem(key, value);
  }

  remove(key) {
    localStorage.removeItem(key);
  }

  reset() {
    localStorage.clear();
  }

  getRaw(key) {
    return this.get(key);
  }
}

amplitude.init('YOUR_API_KEY', {
  storageProvider: new CustomStorage()
});
```

---

### Debugging

#### Enable Debug Logging

```javascript
amplitude.init('YOUR_API_KEY', {
  logLevel: amplitude.Types.LogLevel.Debug
});
```

**Available log levels:**
- `None` (0) - No logging
- `Error` (1) - Error messages only
- `Warn` (2) - Warnings and errors
- `Verbose` (3) - Verbose output
- `Debug` (4) - All debug information

#### Custom Logger

```javascript
class CustomLogger {
  disable() {}
  enable() {}
  log(...args) {
    console.log('[AMPLITUDE]', ...args);
  }
  warn(...args) {
    console.warn('[AMPLITUDE]', ...args);
  }
  error(...args) {
    console.error('[AMPLITUDE]', ...args);
  }
  debug(...args) {
    console.debug('[AMPLITUDE]', ...args);
  }
}

amplitude.init('YOUR_API_KEY', {
  loggerProvider: new CustomLogger()
});
```

---

### Transport Configuration

```javascript
amplitude.init('YOUR_API_KEY', {
  transport: 'xhr' // 'xhr', 'beacon', or 'fetch'
});
```

#### Switch Transport at Runtime

```javascript
amplitude.setTransport('beacon');
```

---

### Offline Mode

Events are automatically stored when offline and sent when connection is restored. This behavior is enabled by default.

```javascript
amplitude.init('YOUR_API_KEY', {
  offline: true // Default behavior
});
```

---

### Server URL Override

```javascript
amplitude.init('YOUR_API_KEY', {
  serverUrl: 'https://custom-proxy.example.com/amplitude'
});
```

---

### User Agent Parser

```javascript
amplitude.init('YOUR_API_KEY', {
  deviceId: 'custom-device-id',
  platform: 'Web',
  osName: 'MacOS',
  osVersion: '14.2',
  deviceModel: 'MacBook Pro'
});
```

---

### Middleware Pattern

```javascript
const timestampMiddleware = (payload) => {
  payload.events.forEach(event => {
    event.event_properties = {
      ...event.event_properties,
      middleware_timestamp: Date.now()
    };
  });
  return payload;
};

// Middleware is applied via plugins
const middlewarePlugin = {
  name: 'middleware',
  type: 'before',
  execute: async (event) => {
    return timestampMiddleware(event);
  }
};

amplitude.add(middlewarePlugin);
```

---

### Error Handling

```javascript
try {
  const result = await amplitude.track('Event Name', {
    property: 'value'
  }).promise;

  if (result.code === 200) {
    console.log('Event tracked successfully');
  } else {
    console.error('Failed to track event:', result.message);
  }
} catch (error) {
  console.error('Error tracking event:', error);
}
```

---

### TypeScript Types

```typescript
import * as amplitude from '@amplitude/analytics-browser';
import {
  BrowserConfig,
  Event,
  Identify,
  Revenue,
  Types
} from '@amplitude/analytics-browser';

const config: BrowserConfig = {
  serverZone: 'US',
  flushQueueSize: 30,
  logLevel: Types.LogLevel.Warn
};

amplitude.init('YOUR_API_KEY', config);

const event: Event = {
  event_type: 'Custom Event',
  event_properties: {
    key: 'value'
  }
};

amplitude.track(event);
```

---

### React Integration

```javascript
import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

function App() {
  useEffect(() => {
    amplitude.init(process.env.REACT_APP_AMPLITUDE_API_KEY);
  }, []);

  const handleClick = () => {
    amplitude.track('Button Clicked', {
      component: 'App',
      action: 'click'
    });
  };

  return <button onClick={handleClick}>Track Event</button>;
}
```

---

### Vue Integration

```javascript
import { onMounted } from 'vue';
import * as amplitude from '@amplitude/analytics-browser';

export default {
  setup() {
    onMounted(() => {
      amplitude.init(import.meta.env.VITE_AMPLITUDE_API_KEY);
    });

    const trackEvent = () => {
      amplitude.track('Button Clicked', {
        component: 'MyComponent'
      });
    };

    return { trackEvent };
  }
};
```

---

### Angular Integration

```typescript
import { Injectable, NgZone } from '@angular/core';
import * as amplitude from '@amplitude/analytics-browser';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      amplitude.init(environment.amplitudeApiKey);
    });
  }

  track(eventName: string, properties?: Record<string, any>) {
    amplitude.track(eventName, properties);
  }
}
```

---

### Next.js Integration

```javascript
// lib/amplitude.js
import * as amplitude from '@amplitude/analytics-browser';

let initialized = false;

export const initAmplitude = () => {
  if (typeof window !== 'undefined' && !initialized) {
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
    initialized = true;
  }
};

export const trackEvent = (eventName, properties) => {
  if (typeof window !== 'undefined') {
    amplitude.track(eventName, properties);
  }
};
```

```javascript
// pages/_app.js
import { useEffect } from 'react';
import { initAmplitude } from '../lib/amplitude';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initAmplitude();
  }, []);

  return <Component {...pageProps} />;
}
```

---

### EU Data Residency

```javascript
amplitude.init('YOUR_API_KEY', {
  serverZone: 'EU'
});
```

---

### Minimum ID Length

```javascript
amplitude.init('YOUR_API_KEY', {
  minIdLength: 3 // Default is 5
});
```

---

### Partner ID

```javascript
amplitude.init('YOUR_API_KEY', {
  partnerId: 'your-partner-id'
});
```

---

### App Version Tracking

```javascript
amplitude.init('YOUR_API_KEY', {
  appVersion: '1.2.3'
});
```

---

## Common Patterns

### Page View Tracking

```javascript
// Track page view on route change
amplitude.track('Page Viewed', {
  page_url: window.location.href,
  page_path: window.location.pathname,
  page_title: document.title,
  referrer: document.referrer
});
```

### Search Tracking

```javascript
amplitude.track('Search Performed', {
  search_query: 'laptop',
  search_results_count: 42,
  search_category: 'electronics'
});
```

### Form Submission Tracking

```javascript
amplitude.track('Form Submitted', {
  form_name: 'contact_us',
  form_id: 'contact-form',
  fields_completed: 5
});
```

### Error Tracking

```javascript
window.addEventListener('error', (event) => {
  amplitude.track('JavaScript Error', {
    error_message: event.message,
    error_filename: event.filename,
    error_lineno: event.lineno,
    error_colno: event.colno
  });
});
```

### Social Share Tracking

```javascript
amplitude.track('Content Shared', {
  platform: 'twitter',
  content_type: 'article',
  content_id: 'article-123'
});
```

### Video Playback Tracking

```javascript
// Video started
amplitude.track('Video Started', {
  video_id: 'video-123',
  video_title: 'Product Demo',
  video_duration: 300
});

// Video progress
amplitude.track('Video Progress', {
  video_id: 'video-123',
  percentage_watched: 25
});

// Video completed
amplitude.track('Video Completed', {
  video_id: 'video-123',
  time_watched: 295
});
```

---

## HTTP API Direct Usage

### Endpoint

**US:** `https://api2.amplitude.com/2/httpapi`
**EU:** `https://api.eu.amplitude.com/2/httpapi`

### Basic Request

```javascript
const response = await fetch('https://api2.amplitude.com/2/httpapi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: 'YOUR_API_KEY',
    events: [{
      user_id: 'user@example.com',
      device_id: 'C8F9E604-F01A-4BD9-95C6-8E5357DF265D',
      event_type: 'page_viewed',
      time: Date.now(),
      event_properties: {
        page: 'homepage'
      }
    }]
  })
});

const result = await response.json();
console.log(result);
```

---

## Constraints & Limits

- **Minimum ID length:** 5 characters (configurable via `minIdLength`)
- **Event batch size:** 30 events by default (`flushQueueSize`)
- **Flush interval:** 1000ms by default (`flushIntervalMillis`)
- **Session timeout:** 30 minutes by default (`sessionTimeout`)
- **User ID and Device ID:** Must be strings
- **Event requirements:** Must have `event_type` and at least one of `deviceId` or `userId`

---

## Best Practice Code Examples

### Complete Setup

```javascript
import * as amplitude from '@amplitude/analytics-browser';

// Initialize with full configuration
amplitude.init(process.env.VITE_AMPLITUDE_API_KEY, {
  serverZone: 'US',
  logLevel: amplitude.Types.LogLevel.Warn,
  flushIntervalMillis: 1000,
  flushQueueSize: 30,
  sessionTimeout: 1800000,
  autocapture: {
    attribution: true,
    pageViews: true,
    sessions: true,
    formInteractions: true,
    fileDownloads: true
  },
  identityStorage: 'cookie'
});

// Set user after login
amplitude.setUserId('user123@example.com');

// Set user properties
const identify = new amplitude.Identify()
  .set('plan', 'premium')
  .set('email', 'user123@example.com')
  .setOnce('signup_date', new Date().toISOString());

amplitude.identify(identify);

// Track custom events
amplitude.track('Feature Used', {
  feature_name: 'export',
  feature_category: 'data'
});
```

### Cleanup on Logout

```javascript
function handleLogout() {
  // Track logout event
  amplitude.track('User Logged Out');

  // Flush remaining events
  amplitude.flush();

  // Reset user identity
  amplitude.reset();
}
```
