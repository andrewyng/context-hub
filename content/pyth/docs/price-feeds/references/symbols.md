# Pyth Pro Symbol Naming Reference

## Symbol Format

All Pyth Pro symbols follow the pattern:

```
{AssetType}.{BASE}/{QUOTE}
```

or for single-ticker instruments:

```
{AssetType}.{TICKER}
```

Symbols are **case-sensitive**. Always use the exact casing shown below.

## Asset Type Prefixes

| Asset Type | API `asset_type` value | Symbol Prefix | Example Symbols |
|---|---|---|---|
| Cryptocurrency | `crypto` | `Crypto.` | `Crypto.BTC/USD`, `Crypto.ETH/USD`, `Crypto.SOL/USD`, `Crypto.DOGE/USD` |
| US Equities | `equity` | `Equity.US.` | `Equity.US.AAPL/USD`, `Equity.US.TSLA/USD`, `Equity.US.NVDA/USD`, `Equity.US.MSFT/USD` |
| Foreign Exchange | `fx` | `FX.` | `FX.EUR/USD`, `FX.GBP/USD`, `FX.USD/JPY`, `FX.AUD/USD` |
| Precious Metals | `metal` | `Metal.` | `Metal.XAU/USD`, `Metal.XAG/USD` |
| Commodities | `commodity` | `Commodity.` | `Commodity.WTI/USD`, `Commodity.NG/USD` |
| Interest Rates | `rates` | `Rates.` | `Rates.US10Y`, `Rates.US2Y`, `Rates.US30Y` |
| Funding Rates | `funding-rate` | `FundingRate.` | `FundingRate.BTC/USD`, `FundingRate.ETH/USD` |

## Common Mapping: Ticker to Pyth Symbol

Agents often receive bare tickers from users. Here's how to map them:

| User says | Pyth symbol |
|---|---|
| `BTC`, `Bitcoin` | `Crypto.BTC/USD` |
| `ETH`, `Ethereum` | `Crypto.ETH/USD` |
| `SOL`, `Solana` | `Crypto.SOL/USD` |
| `AAPL`, `Apple` | `Equity.US.AAPL/USD` |
| `TSLA`, `Tesla` | `Equity.US.TSLA/USD` |
| `NVDA`, `Nvidia` | `Equity.US.NVDA/USD` |
| `Gold`, `XAU` | `Metal.XAU/USD` |
| `Silver`, `XAG` | `Metal.XAG/USD` |
| `EUR/USD` | `FX.EUR/USD` |
| `Oil`, `WTI`, `Crude` | `Commodity.WTI/USD` |

## Discovery via API

When unsure about a symbol, always query the `/v1/symbols` endpoint:

```javascript
// Search by name
const res = await fetch("https://history.pyth-lazer.dourolabs.app/v1/symbols?query=Apple");
const feeds = await res.json();
// Returns feeds matching "Apple" — use the `symbol` field from the response

// Filter by asset type
const cryptoRes = await fetch("https://history.pyth-lazer.dourolabs.app/v1/symbols?asset_type=crypto");
const cryptoFeeds = await cryptoRes.json();
```

## Key Rules

1. **Always include the prefix.** `BTC/USD` will not work — use `Crypto.BTC/USD`.
2. **Quote currency is part of the symbol.** `Crypto.BTC` is not valid — use `Crypto.BTC/USD`.
3. **US equities have a country segment.** `Equity.AAPL/USD` is wrong — use `Equity.US.AAPL/USD`.
4. **Metals use standard codes.** Gold is `XAU`, Silver is `XAG`, not `GOLD` or `SILVER`.
5. **Rates use single tickers.** `Rates.US10Y` (no quote currency, no slash).
6. **When in doubt, search first.** The `/v1/symbols` endpoint is free and fast.
