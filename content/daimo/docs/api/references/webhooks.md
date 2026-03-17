# Webhooks

Webhooks send real-time `POST` requests to your endpoint when a session changes status.

## Events

| Event | Status | Description |
|-------|--------|-------------|
| `session.processing` | `processing` | Deposit detected, funds being routed |
| `session.succeeded` | `succeeded` | Funds delivered to destination |
| `session.bounced` | `bounced` | Delivery failed, funds refunded |

## Register an endpoint

```typescript
const response = await fetch("https://api.daimo.com/v1/webhooks", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.DAIMO_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com/webhooks/daimo",
    events: ["*"],
  }),
});

const { webhook } = await response.json();
// Save webhook.secret — needed for signature verification
```

## Verify signatures

Every delivery includes a `Daimo-Signature` header: `t=<unix_seconds>,v1=<hmac_hex>`.

```typescript
import * as crypto from "crypto";

function verifyWebhookSignature(
  secret: string,
  signatureHeader: string,
  rawBody: string,
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = parts["t"];
  const sig = parts["v1"];
  if (!ts || !sig) return false;

  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - tsNum) > 300) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}
```

## Complete handler

```typescript
import { createServer } from "node:http";

const WEBHOOK_SECRET = process.env.DAIMO_WEBHOOK_SECRET!;

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhooks/daimo") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const signature = req.headers["daimo-signature"] as string;
      if (!verifyWebhookSignature(WEBHOOK_SECRET, signature, body)) {
        res.writeHead(400).end("invalid signature");
        return;
      }

      const event = JSON.parse(body);
      if (event.isTestEvent) {
        res.writeHead(200).end();
        return;
      }

      switch (event.type) {
        case "session.succeeded":
          // Fulfill order. event.data.session has full session snapshot.
          // event.data.session.destination.delivery.txHash = settlement tx
          break;
        case "session.bounced":
          // Alert support — funds returned to refund address
          break;
      }

      res.writeHead(200).end();
    });
  }
});

server.listen(4242);
```

## Event payload

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "session.succeeded",
  "createdAt": 1700000000,
  "data": {
    "session": {
      "sessionId": "abcdef1234567890abcdef1234567890",
      "status": "succeeded",
      "destination": {
        "type": "evm",
        "address": "0x...",
        "chainId": 8453,
        "tokenName": "Base",
        "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "tokenSymbol": "USDC",
        "amountUnits": "10.00",
        "delivery": { "txHash": "0x...", "receivedUnits": "10.00" }
      },
      "paymentMethod": { "type": "evm", "receiverAddress": "0x...", "createdAt": 1700000000 },
      "metadata": { "orderId": "123" },
      "createdAt": 1700000000,
      "expiresAt": 1700003600
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `id` | Unique event ID (UUID). Use for idempotency. |
| `type` | `session.processing`, `session.succeeded`, or `session.bounced` |
| `data.session` | Session snapshot at event time (without `clientSecret`) |
| `isTestEvent` | `true` for test events via `/test` endpoint |

## Delivery behavior

- **Timeout:** 10 seconds
- **Success:** Any 2xx status
- **Retries:** Exponential backoff — retry n waits 2^(n-1) minutes, up to 10 attempts
- **Idempotency:** Events may be delivered more than once. Deduplicate on `event.id`.
