---
name: api
description: "Hyperliquid DEX API for perpetuals trading — market data, account info, order placement, and WebSocket feeds"
metadata:
  languages: "javascript"
  versions: "1.5.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "hyperliquid,dex,trading,perpetuals,crypto,defi"
---

# Hyperliquid API (JavaScript/TypeScript)

Hyperliquid is a high-performance perpetuals DEX on its own L1. Two endpoints:
- **Info API** (read-only): `https://api.hyperliquid.xyz/info`
- **Exchange API** (trading): `https://api.hyperliquid.xyz/exchange`

## Install

```bash
npm install hyperliquid
```

## Initialization

```typescript
import { Hyperliquid } from "hyperliquid";

// Read-only
const sdk = new Hyperliquid();

// Trading (requires private key)
const sdk = new Hyperliquid({
  privateKey: process.env.HYPERLIQUID_PRIVATE_KEY, // 0x-prefixed hex
  testnet: false, // set true for testnet
});
```

## Market Data

```typescript
// All mids (asset → mid price)
const mids = await sdk.info.getAllMids();
// { "BTC": "74000.0", "ETH": "2100.0", ... }

// L2 order book
const book = await sdk.info.getL2Book("BTC");
// { coin: "BTC", levels: [[bids], [asks]], time: 1234567890 }

// Funding rates
const meta = await sdk.info.getMetaAndAssetCtxs();
// meta[1] is array of asset contexts with fundingRate, openInterest, etc.

// Candles (OHLCV)
const candles = await sdk.info.getCandleSnapshot("BTC", "15m", startTime, endTime);
```

## Account Info

```typescript
// Wallet address (no private key needed for reads)
const address = "0xYourWalletAddress";

// Perpetuals state: positions, equity, margin
const state = await sdk.info.perpetuals.getClearinghouseState(address);
// state.crossMarginSummary.accountValue — total equity
// state.assetPositions — array of open positions

// Open orders
const orders = await sdk.info.getUserOpenOrders(address);

// Trade history
const fills = await sdk.info.getUserFills(address);
```

## Trading

```typescript
// Place limit order
const order = await sdk.exchange.placeOrder({
  coin: "BTC",
  is_buy: true,
  sz: 0.001,           // size in base asset
  limit_px: 74000,     // limit price (ignored for market)
  order_type: { limit: { tif: "Gtc" } }, // Gtc | Alo | Ioc
  reduce_only: false,
});

// Place market order
const market = await sdk.exchange.placeOrder({
  coin: "BTC",
  is_buy: true,
  sz: 0.001,
  limit_px: 0,  // ignored
  order_type: { market: {} },
  reduce_only: false,
});

// Cancel order
await sdk.exchange.cancelOrder({ coin: "BTC", oid: orderId });

// Close position (market)
await sdk.exchange.closePosition("BTC");

// Set leverage
await sdk.exchange.updateLeverage({
  coin: "BTC",
  is_cross: true,  // true = cross margin, false = isolated
  leverage: 10,
});
```

## WebSocket

```typescript
import { WebSocketClient } from "hyperliquid";

const ws = new WebSocketClient();
await ws.connect();

// Subscribe to live prices
ws.subscribe({ type: "allMids" }, (data) => {
  console.log(data.mids); // { BTC: "74000", ... }
});

// Subscribe to user fills
ws.subscribe({ type: "userFills", user: address }, (data) => {
  console.log(data.fills);
});

await ws.disconnect();
```

## Notes

- All prices are strings to preserve precision — convert with `parseFloat()` when needed
- Size (`sz`) is in base asset units (BTC, ETH, etc.), not USD
- `limit_px` for market orders: set to a very high/low value or 0; it's ignored
- Private key must be the EVM wallet key that controls the Hyperliquid vault
- Testnet endpoint: `https://api.hyperliquid-testnet.xyz`
