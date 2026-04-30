---
name: price-feeds
description: "Pyth Pro real-time and historical market data API — 500+ price feeds across crypto, equities, FX, metals, commodities, and rates"
metadata:
  languages: "javascript"
  versions: "5.2.1"
  revision: 1
  updated-on: "2026-03-11"
  source: maintainer
  tags: "pyth,oracle,price-feeds,market-data,real-time,crypto,defi,financial-data"
---

# Pyth Pro JavaScript Integration Guide

You are a Pyth Pro API integration expert. Help me write code that uses Pyth Pro for real-time and historical market data.

## 1. Golden Rule

**Always use the Pyth Pro APIs (Router API + History API). Always use full symbols with the asset-type prefix (e.g., `Crypto.BTC/USD`, not `BTC/USD`).**

- **Library:** `@pythnetwork/pyth-lazer-sdk` (for real-time prices via the Router API)
- **History API:** Plain `fetch` calls (no SDK needed)
- **Do NOT** use Hermes, `@pythnetwork/pyth-evm-js`, or legacy Pyth v1 endpoints — those are for on-chain oracle use cases, not market data.

## 2. Two APIs Overview

| Feature | Router API | History API |
|---|---|---|
| **Base URL** | `https://pyth-lazer.dourolabs.app` | `https://history.pyth-lazer.dourolabs.app` |
| **Auth** | Access token required | Public / free |
| **Use for** | Real-time latest prices | Feed discovery, OHLC/candlestick data, historical price snapshots |
| **Interface** | `@pythnetwork/pyth-lazer-sdk` | `fetch` (REST) |

## 3. Installation

```bash
npm install @pythnetwork/pyth-lazer-sdk
```

The SDK is only needed for the Router API (real-time prices). The History API uses plain `fetch`.

## 4. Authentication

An access token is required for the Router API. Get one at [pyth.network/pricing](https://pyth.network/pricing).

Pass the token when creating the SDK client:

```javascript
import { PythLazerClient } from "@pythnetwork/pyth-lazer-sdk";

const client = await PythLazerClient.create({
  priceServiceUrl: "https://pyth-lazer.dourolabs.app",
  token: process.env.PYTH_ACCESS_TOKEN,
});
```

The History API is public and does not require authentication.

## 5. Discover Feeds (History API)

Use `GET /v1/symbols` to search for available price feeds.

**Parameters:**
- `query` (optional) — Search string (e.g., `"BTC"`, `"Apple"`)
- `asset_type` (optional) — Filter by type: `crypto`, `fx`, `equity`, `metal`, `rates`, `commodity`, `funding-rate`

```javascript
const HISTORY_URL = "https://history.pyth-lazer.dourolabs.app";

async function discoverFeeds(query, assetType) {
  const url = new URL("/v1/symbols", HISTORY_URL);
  if (query) url.searchParams.set("query", query);
  if (assetType) url.searchParams.set("asset_type", assetType);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`/v1/symbols returned ${res.status}`);
  return await res.json();
}

// Example: find all crypto feeds matching "BTC"
const feeds = await discoverFeeds("BTC", "crypto");
// Each feed has: { pyth_lazer_id, symbol, name, asset_type, exponent, ... }
```

**Response shape (per feed):**
```json
{
  "pyth_lazer_id": 2,
  "symbol": "Crypto.BTC/USD",
  "name": "BTC/USD",
  "description": "BITCOIN / US DOLLAR",
  "asset_type": "crypto",
  "exponent": -8,
  "quote_currency": "USD",
  "min_channel": "fixed_rate@200ms",
  "state": "stable"
}
```

**Pagination:** The API returns up to 200 feeds per page. Use the `offset` query parameter to paginate:

```javascript
async function getAllFeeds(query, assetType) {
  const allFeeds = [];
  let offset = 0;
  while (true) {
    const url = new URL("/v1/symbols", HISTORY_URL);
    if (query) url.searchParams.set("query", query);
    if (assetType) url.searchParams.set("asset_type", assetType);
    url.searchParams.set("offset", String(offset));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`/v1/symbols returned ${res.status}`);
    const feeds = await res.json();
    allFeeds.push(...feeds);
    if (feeds.length < 200) break;
    offset += feeds.length;
  }
  return allFeeds;
}
```

## 6. Get Real-Time Prices (Router API)

Use the SDK to fetch the latest price for one or more feeds. You can query by symbol names or numeric feed IDs.

```javascript
import { PythLazerClient } from "@pythnetwork/pyth-lazer-sdk";

const client = await PythLazerClient.create({
  priceServiceUrl: "https://pyth-lazer.dourolabs.app",
  token: process.env.PYTH_ACCESS_TOKEN,
});

// Query by symbol names
const response = await client.getLatestPrice({
  symbols: ["Crypto.BTC/USD", "Crypto.ETH/USD"],
  channel: "fixed_rate@200ms",
  properties: ["price", "bestBidPrice", "bestAskPrice", "exponent", "confidence"],
  formats: ["leUnsigned"],
});

// response.parsed.priceFeeds contains the price data
for (const feed of response.parsed.priceFeeds) {
  const price = Number(feed.price);
  const exponent = feed.exponent;
  const humanPrice = price * Math.pow(10, exponent);
  console.log(`Feed ${feed.priceFeedId}: $${humanPrice}`);
}
```

**Query by numeric feed IDs:**
```javascript
const response = await client.getLatestPrice({
  priceFeedIds: [2, 17],  // BTC/USD=2, ETH/USD=17 (get IDs from /v1/symbols)
  channel: "fixed_rate@200ms",
  properties: ["price", "exponent"],
  formats: ["leUnsigned"],
});
```

**Available properties:** `price`, `bestBidPrice`, `bestAskPrice`, `exponent`, `confidence`, `publisherCount`

**Limit:** Maximum 100 feeds per call.

## 7. Get Historical Prices (History API)

Use `GET /v1/{channel}/price` to get prices at a specific point in time.

**Parameters:**
- `ids` (required, repeated) — Numeric feed IDs (get from `/v1/symbols` → `pyth_lazer_id`)
- `timestamp` (required) — Microsecond Unix timestamp

```javascript
const HISTORY_URL = "https://history.pyth-lazer.dourolabs.app";

async function getHistoricalPrice(channel, feedIds, timestampUs) {
  const url = new URL(`/v1/${channel}/price`, HISTORY_URL);
  for (const id of feedIds) {
    url.searchParams.append("ids", String(id));
  }
  url.searchParams.set("timestamp", String(timestampUs));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`/v1/${channel}/price returned ${res.status}`);
  return await res.json();
}

// Example: get BTC/USD (id=2) price 1 hour ago
const oneHourAgo = (Date.now() - 60 * 60 * 1000) * 1000; // convert ms to μs
const prices = await getHistoricalPrice("fixed_rate@200ms", [2], oneHourAgo);
// Returns: [{ price_feed_id, price, exponent, publish_time, confidence, ... }]
```

**Response shape (per feed):**
```json
{
  "price_feed_id": 2,
  "price": 8372633211834,
  "exponent": -8,
  "publish_time": 1741651200000000,
  "confidence": 3500000,
  "best_bid_price": 8372533211834,
  "best_ask_price": 8372733211834,
  "publisher_count": 12,
  "channel": "fixed_rate@200ms"
}
```

**Limits:**
- Maximum 50 feeds per call
- One timestamp per call

## 8. Get Candlestick/OHLC Data (History API)

Use `GET /v1/{channel}/history` to get OHLC candlestick data.

**Parameters:**
- `symbol` (required) — Full symbol name (e.g., `Crypto.BTC/USD`)
- `resolution` (required) — Candle interval (see Section 11)
- `from` (required) — Start time, Unix timestamp in **seconds**
- `to` (required) — End time, Unix timestamp in **seconds**

```javascript
const HISTORY_URL = "https://history.pyth-lazer.dourolabs.app";

async function getCandlestickData(channel, symbol, resolution, fromSec, toSec) {
  const url = new URL(`/v1/${channel}/history`, HISTORY_URL);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("resolution", resolution);
  url.searchParams.set("from", String(fromSec));
  url.searchParams.set("to", String(toSec));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`/v1/${channel}/history returned ${res.status}`);
  return await res.json();
}

// Example: BTC/USD hourly candles for the last 24 hours
const now = Math.floor(Date.now() / 1000);
const oneDayAgo = now - 24 * 60 * 60;
const ohlc = await getCandlestickData(
  "fixed_rate@200ms",
  "Crypto.BTC/USD",
  "60",        // 60-minute candles
  oneDayAgo,
  now,
);
```

**Response shape:**
```json
{
  "s": "ok",
  "t": [1741564800, 1741568400],
  "o": [83726.33, 83800.12],
  "h": [83950.00, 83900.45],
  "l": [83650.10, 83750.00],
  "c": [83800.12, 83825.67],
  "v": [0, 0]
}
```

| Field | Description |
|---|---|
| `s` | Status: `"ok"`, `"no_data"`, or `"error"` |
| `t` | Array of candle open timestamps (seconds) |
| `o` | Open prices |
| `h` | High prices |
| `l` | Low prices |
| `c` | Close prices |
| `v` | Volumes (may be 0 for non-volume feeds) |
| `errmsg` | Error message (only when `s` is `"error"`) |

**Limit:** Maximum 500 candles per response.

## 9. Price Scaling and Exponents

Prices from the Router API are returned as **raw integers**. Convert to human-readable values using the `exponent` field:

```
human_price = price * 10^exponent
```

**Example:** If `price = 8372633211834` and `exponent = -8`:
```
human_price = 8372633211834 * 10^(-8) = 83726.33211834
```

```javascript
function toHumanPrice(rawPrice, exponent) {
  return rawPrice * Math.pow(10, exponent);
}
```

**Important:** The History API's candlestick endpoint (`/v1/{channel}/history`) returns **pre-scaled human-readable prices** — no exponent conversion needed. The historical price endpoint (`/v1/{channel}/price`) returns raw integers that need exponent conversion.

## 10. Channels

Channels control the update frequency for price data. Use these with both the Router API and History API.

| Channel | Description |
|---|---|
| `fixed_rate@200ms` | **Default.** Updates every 200ms. Best for most use cases. |
| `fixed_rate@50ms` | Ultra-low-latency. Updates every 50ms. |
| `fixed_rate@1000ms` | Updates every 1 second. |
| `real_time` | Event-driven updates (no fixed interval). |

**Format pattern:** `fixed_rate@{interval}ms` or `real_time`

Each feed has a `min_channel` field (from `/v1/symbols`) indicating the fastest channel it supports.

## 11. Resolutions (Candlestick Intervals)

Use these string values for the `resolution` parameter in the OHLC endpoint:

| Resolution | Meaning |
|---|---|
| `1` | 1 minute |
| `5` | 5 minutes |
| `15` | 15 minutes |
| `30` | 30 minutes |
| `60` | 1 hour |
| `120` | 2 hours |
| `240` | 4 hours |
| `360` | 6 hours |
| `720` | 12 hours |
| `D` | 1 day |
| `W` | 1 week |
| `M` | 1 month |

## 12. Symbol Naming Conventions

All symbols use the format `{AssetType}.{BASE}/{QUOTE}` or `{AssetType}.{TICKER}`. Always use the full symbol including the asset-type prefix.

| Asset Type | Prefix | Examples |
|---|---|---|
| Crypto | `Crypto.` | `Crypto.BTC/USD`, `Crypto.ETH/USD`, `Crypto.SOL/USD` |
| Equities | `Equity.US.` | `Equity.US.AAPL/USD`, `Equity.US.TSLA/USD`, `Equity.US.NVDA/USD` |
| FX | `FX.` | `FX.EUR/USD`, `FX.GBP/USD`, `FX.USD/JPY` |
| Metals | `Metal.` | `Metal.XAU/USD`, `Metal.XAG/USD` |
| Commodities | `Commodity.` | `Commodity.WTI/USD`, `Commodity.NG/USD` |
| Rates | `Rates.` | `Rates.US10Y`, `Rates.US2Y` |
| Funding Rates | `FundingRate.` | `FundingRate.BTC/USD` |

**Important:**
- Symbols are case-sensitive: `Crypto.BTC/USD` works, `crypto.btc/usd` does not.
- When in doubt, use the `/v1/symbols` endpoint to discover the exact symbol string.
- See `references/symbols.md` for detailed naming conventions.

## 13. Limits and Constraints

| Constraint | Limit |
|---|---|
| Latest price (Router API) | Max 100 feeds per call |
| Historical price (History API) | Max 50 feeds per call, one timestamp per call |
| Candlestick data (History API) | Max 500 candles per response |
| Symbol search (History API) | Max 200 results per page (paginate with `offset`) |
| Data availability | No data before April 2025 |

## 14. Error Handling

### Common Errors

| Error | Cause | Fix |
|---|---|---|
| **403 Unauthorized** | Invalid or expired access token | Get a new token at pyth.network/pricing |
| **400 Bad Request** | Invalid symbol, channel, or parameter | Verify symbol exists via `/v1/symbols`; check channel format |
| **404 Not Found** | Feed ID doesn't exist | Look up correct IDs via `/v1/symbols` |
| **No data returned** | Timestamp before data availability | Use timestamps after April 2025 |
| **OHLC `s: "no_data"`** | No candles in requested range | Widen the time range or check the symbol |

### Error Handling Pattern

```javascript
async function safeFetch(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return await res.json();
}
```

## 15. Complete Example: Price Dashboard

```javascript
import { PythLazerClient } from "@pythnetwork/pyth-lazer-sdk";

const HISTORY_URL = "https://history.pyth-lazer.dourolabs.app";

// Step 1: Discover feeds
const symbolsRes = await fetch(
  `${HISTORY_URL}/v1/symbols?query=BTC&asset_type=crypto`
);
const feeds = await symbolsRes.json();
const btcFeed = feeds.find((f) => f.symbol === "Crypto.BTC/USD");
console.log(`BTC feed ID: ${btcFeed.pyth_lazer_id}, exponent: ${btcFeed.exponent}`);

// Step 2: Get real-time price (requires access token)
const client = await PythLazerClient.create({
  priceServiceUrl: "https://pyth-lazer.dourolabs.app",
  token: process.env.PYTH_ACCESS_TOKEN,
});

const latest = await client.getLatestPrice({
  priceFeedIds: [btcFeed.pyth_lazer_id],
  channel: "fixed_rate@200ms",
  properties: ["price", "exponent", "bestBidPrice", "bestAskPrice"],
  formats: ["leUnsigned"],
});

const priceFeed = latest.parsed.priceFeeds[0];
const livePrice = Number(priceFeed.price) * Math.pow(10, priceFeed.exponent);
console.log(`BTC live price: $${livePrice.toFixed(2)}`);

// Step 3: Get hourly candles for the last 24 hours (no token needed)
const now = Math.floor(Date.now() / 1000);
const ohlcRes = await fetch(
  `${HISTORY_URL}/v1/fixed_rate@200ms/history?symbol=Crypto.BTC/USD&resolution=60&from=${now - 86400}&to=${now}`
);
const ohlc = await ohlcRes.json();
if (ohlc.s === "ok") {
  console.log(`Got ${ohlc.t.length} hourly candles`);
  console.log(`Last close: $${ohlc.c[ohlc.c.length - 1]}`);
}
```
