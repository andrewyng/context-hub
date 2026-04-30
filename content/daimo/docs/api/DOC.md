---
name: api
description: "Stablecoin deposit API with session-based payment flows, React modal SDK, and webhook notifications — accepts deposits from any wallet, chain, or token"
metadata:
  languages: "javascript"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "daimo,stablecoin,crypto,deposits,payments,fintech"
---
# Daimo API Coding Guide

## 1. What Daimo Does

Daimo is a deposit API for stablecoin apps. Integrate once, accept deposits from any wallet, any chain (EVM, Solana, Tron), any token. Funds arrive as the stablecoin you want, on the chain you want.

Two integration paths:
- **Modal SDK** (`@daimo/sdk`): Pre-built React deposit UI. ~30 lines of code.
- **REST API** (`https://api.daimo.com`): Full control, any language/framework.

Both use the same session-based flow.

## 2. Installation

```bash
npm install @daimo/sdk
```

Peer dependency: `react >= 18`.

## 3. Core Concepts

### Session Lifecycle

Every deposit is a **session** that moves through these statuses:

```
requires_payment_method → waiting_payment → processing → succeeded
                                                       → bounced
                       → expired
```

- `requires_payment_method`: Created, waiting for user to choose how to pay
- `waiting_payment`: Payment method set, waiting for deposit tx
- `processing`: Deposit detected, funds being routed
- `succeeded`: Funds delivered to destination address
- `bounced`: Delivery failed (e.g. contract call reverted), funds refunded
- `expired`: Timed out before deposit received

Terminal statuses: `succeeded`, `bounced`, `expired`.

### Credential Model

- **API key** (server-side only): Creates sessions, retrieves full details. Pass as `Authorization: Bearer <key>`.
- **Client secret** (safe for browser): Per-session token for setting payment method and checking status. Pass in request body.

## 4. Quick Start — Modal SDK

### Server: Create a session

```typescript
const response = await fetch("https://api.daimo.com/v1/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.DAIMO_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    destination: {
      type: "evm",
      address: "0xYourAddress",
      chainId: 8453, // Base
      tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      amountUnits: "10.00",
    },
    display: {
      title: "Deposit to Acme",
      verb: "Deposit",
    },
  }),
});

const { session } = await response.json();
// Return session.clientSecret and session.sessionId to the frontend
```

### Client: Render the modal

```tsx
import { DaimoSDKProvider, DaimoModal } from "@daimo/sdk/web";
import "@daimo/sdk/web/theme.css";

function App() {
  return (
    <DaimoSDKProvider>
      <DepositPage />
    </DaimoSDKProvider>
  );
}

function DepositPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/create-session", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setSessionId(data.session.sessionId);
        setClientSecret(data.session.clientSecret);
      });
  }, []);

  if (!sessionId || !clientSecret) return null;

  return (
    <DaimoModal
      sessionId={sessionId}
      clientSecret={clientSecret}
      onPaymentCompleted={() => console.log("deposit succeeded")}
    />
  );
}
```

### Handle completion

Poll for status or use webhooks. The session's `destination.delivery.txHash` contains the on-chain settlement tx.

## 5. REST API Reference

**Base URL:** `https://api.daimo.com`

### Sessions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST /v1/sessions` | API key | Create a deposit session |
| `GET /v1/sessions/{sessionId}` | API key or none | Retrieve session (full with API key, public without) |
| `PUT /v1/sessions/{sessionId}/check` | Client secret | Check/poll session status |
| `POST /v1/sessions/{sessionId}/paymentMethods` | Client secret | Set the payment method |

### Create Session — `POST /v1/sessions`

```typescript
// Required fields
{
  destination: {
    type: "evm",             // always "evm"
    address: "0x...",        // checksummed destination address
    chainId: 8453,           // destination chain ID
    tokenAddress: "0x...",   // destination token address
    amountUnits: "10.00",    // optional: fixed amount in token units
    calldata: "0x...",       // optional: contract call data
  },
  display: {
    title: "Deposit to Acme",
    verb: "Deposit",
    themeCssUrl: "https://...", // optional: custom theme CSS
    paymentOptions: [...],      // optional: control which payment methods appear
  },
  metadata: { orderId: "123" }, // optional: key-value string pairs
  refundAddress: "0x...",       // optional: address for failed contract calls
}
```

Response includes `session.sessionId` and `session.clientSecret`.

### Create Payment Method — `POST /v1/sessions/{sessionId}/paymentMethods`

Transitions session to `waiting_payment`. Three payment rails:

**EVM** (any supported EVM chain):
```json
{ "clientSecret": "...", "paymentMethod": { "type": "evm" } }
```
Response: `session.paymentMethod.receiverAddress` — display to user.

**Tron** (USDT):
```json
{ "clientSecret": "...", "paymentMethod": { "type": "tron", "amountUsd": 10 } }
```
Response: `tron.receiverAddress` — temporary Tron deposit address.

**Solana**:
```json
{
  "clientSecret": "...",
  "paymentMethod": {
    "type": "solana",
    "walletAddress": "So1ana...",
    "inputTokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amountUsd": 10
  }
}
```
Response: `solana.serializedTx` — hex-encoded tx for wallet to sign and submit.

### Check Session — `PUT /v1/sessions/{sessionId}/check`

```json
{ "clientSecret": "...", "txHash": "0x..." }
```

`txHash` is optional — pass it to speed up detection after user sends.

### Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST /v1/webhooks` | API key | Create webhook endpoint |
| `GET /v1/webhooks` | API key | List all endpoints |
| `GET /v1/webhooks/{webhookId}` | API key | Retrieve endpoint |
| `DELETE /v1/webhooks/{webhookId}` | API key | Delete endpoint |
| `POST /v1/webhooks/{webhookId}/test` | API key | Send test event |

Events: `session.processing`, `session.succeeded`, `session.bounced` (or `*` for all).

See the [webhooks reference](references/webhooks.md) for signature verification and handler examples.

### Errors

```json
{
  "error": {
    "type": "validation_error",
    "code": "invalid_parameter",
    "message": "invalid session create request",
    "param": "body"
  }
}
```

HTTP status codes: `400` (validation), `401` (auth), `404` (not found), `500` (server).

## 6. Modal SDK Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sessionId` | `string` | — | Required. Session ID from backend |
| `clientSecret` | `string` | — | Required. Client secret from backend |
| `defaultOpen` | `boolean` | `true` | Open automatically on mount |
| `connectedWalletOnly` | `boolean` | `false` | Skip chain selection, use connected wallet |
| `embedded` | `boolean` | `false` | Render inline instead of overlay |
| `animate` | `boolean` | `true` | Enable animations |
| `maxHeight` | `number` | — | Max height in pixels |
| `returnUrl` | `string` | — | URL shown after completion |
| `returnLabel` | `string` | — | Label for return link |

Event handlers: `onPaymentStarted`, `onPaymentCompleted`, `onOpen`, `onClose`.

## 7. Supported Chains

### Destination chains (EVM)

| Chain | Chain ID | USDC Address |
|-------|----------|--------------|
| Arbitrum | `42161` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| Base | `8453` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| BNB Smart Chain | `56` | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` |
| Celo | `42220` | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` |
| Ethereum | `1` | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Optimism | `10` | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` |
| Polygon | `137` | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |

Additional chains: Gnosis, HyperEVM, Linea, Monad, Scroll, Worldchain. Additional tokens (USDT, DAI, ETH) available on most chains.

### Source chains

- **All EVM chains above**: any supported token
- **Solana**: USDC, USDT, SOL, and other liquid tokens
- **Tron**: USDT

## 8. WebView Integration

For native mobile apps (iOS, Android, React Native), load the Daimo payment UI in a WebView:

```
https://daimo.com/webview?session={sessionId}&cs={clientSecret}
```

Query params: `locale` (language), `theme` (`light`/`dark`), `layout` (`embed` for inline).

Listen for `postMessage` events: `ready`, `paymentStarted`, `paymentCompleted`, `modalOpened`, `modalClosed`.

```tsx
// React Native example
import { WebView } from "react-native-webview";

<WebView
  source={{ uri: `https://daimo.com/webview?session=${sessionId}&cs=${clientSecret}` }}
  onMessage={(event) => {
    const msg = JSON.parse(event.nativeEvent.data);
    if (msg.type === "paymentCompleted") {
      // handle success
    }
  }}
  javaScriptEnabled
  domStorageEnabled
/>
```
