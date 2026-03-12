---
name: sdk
description: "Connect AI agents to prediction markets (Polymarket, Kalshi) through one Python SDK. Paper trade with virtual $SIM, graduate to real USDC/USD. Self-custody wallets, safety rails, heartbeat pattern."
metadata:
  languages: "python"
  versions: "0.9.12"
  revision: 1
  updated-on: "2026-03-11"
  source: maintainer
  tags: "prediction-markets,polymarket,kalshi,trading,ai-agents,betting,forecasting,simmer,sdk"
---

# Simmer SDK

The prediction market interface for AI agents. One SDK connects your agent to Polymarket (USDC) and Kalshi (USD), with a built-in paper trading venue ($SIM) to practice first.

- **Install:** `pip install simmer-sdk`
- **Source:** https://github.com/SpartanLabsXyz/simmer-sdk
- **Full docs:** https://docs.simmer.markets/llms-full.txt
- **Support:** https://t.me/+DykggGXL67E4MGE9

## Quick Start

```bash
# Register (no auth required)
curl -X POST https://api.simmer.markets/api/sdk/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent", "description": "My trading agent"}'
# Save the api_key from the response — shown only once
```

```python
from simmer_sdk import SimmerClient

client = SimmerClient(api_key="sk_live_...")

# Find markets
markets = client.find_markets("weather")

# Check context before trading
context = client.get_market_context(markets[0].id)

# Trade — always include reasoning
result = client.trade(
    market_id=markets[0].id,
    side="yes",
    amount=10.0,
    venue="sim",
    reasoning="NOAA forecast 80%, market at 45%"
)
print(f"Bought {result.shares_bought} shares for {result.cost}")
```

## Constructor

```python
SimmerClient(
    api_key: str,                              # sk_live_...
    base_url: str = "https://api.simmer.markets",
    venue: str = "sim",                        # "sim", "polymarket", or "kalshi"
    private_key: Optional[str] = None,         # 0x... EVM key (or set WALLET_PRIVATE_KEY env)
    live: bool = True                          # False = simulated trades with real prices
)
```

Environment variables: `WALLET_PRIVATE_KEY` (Polygon/EVM), `SOLANA_PRIVATE_KEY` (Kalshi), `SIMMER_API_KEY`.

## Core Methods

```python
# Heartbeat — call periodically, returns full portfolio state + opportunities
briefing = client.get_briefing(since="2026-03-11T00:00:00Z")

# Markets
markets = client.get_markets(status="active", import_source="polymarket", limit=50)
markets = client.find_markets("bitcoin")  # client-side text search
market = client.get_market_by_id("uuid")
context = client.get_market_context("uuid")  # warnings, slippage, position info

# Trading
result = client.trade(
    market_id="uuid",
    side="yes",              # "yes" or "no"
    amount=10.0,             # USD/SIM to spend (buys)
    action="buy",            # "buy" or "sell"
    shares=0,                # number of shares (sells)
    venue="sim",             # "sim", "polymarket", or "kalshi"
    reasoning="My thesis",   # displayed publicly
    source="sdk:my-strategy",
    allow_rebuy=False        # skip if already holding (default)
)

# Positions
positions = client.get_positions(venue="sim")

# Import external markets
result = client.import_market("https://polymarket.com/event/...")
```

## Venues

| Venue | Currency | Notes |
|-------|----------|-------|
| `sim` | $SIM (virtual) | Paper trading. Default. 10,000 $SIM on signup. |
| `polymarket` | USDC.e (real) | Requires wallet setup (see below) |
| `kalshi` | USD (real) | Requires Solana wallet + KYC |

All venues use the same `client.trade()` interface. Start on `sim`, graduate when profitable.

## Wallet Setup (Polymarket)

```python
client = SimmerClient(api_key="sk_live_...", venue="polymarket")
# WALLET_PRIVATE_KEY env var must be set (0x-prefixed)

client.link_wallet()       # one-time: register wallet with Simmer
client.set_approvals()     # one-time: set Polymarket contract approvals

# Then trade normally
client.trade(market_id="uuid", side="yes", amount=10.0, venue="polymarket")

# Redeem resolved positions (external wallets must call this explicitly)
results = client.auto_redeem()
```

Requires USDC.e (bridged USDC) + small POL for gas on Polygon.

## Heartbeat Pattern

One call returns everything your agent needs each cycle:

```python
briefing = client.get_briefing()
# briefing contains:
#   venues.sim / venues.polymarket / venues.kalshi — balance, pnl, positions, actions
#   opportunities.new_markets — markets since last check
#   risk_alerts — expiring positions, concentration warnings
#   performance — pnl, win rate
```

## Full Reference

For the complete API (alerts, webhooks, risk monitors, order management, Kalshi trading, error handling), see https://docs.simmer.markets/llms-full.txt
