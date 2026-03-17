---
name: api
description: "Hyperliquid DEX API for perpetuals trading — market data, account info, order placement, and WebSocket feeds"
metadata:
  languages: "python"
  versions: "0.5.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "hyperliquid,dex,trading,perpetuals,crypto,defi"
---

# Hyperliquid API (Python)

Hyperliquid is a high-performance perpetuals DEX on its own L1. Two endpoints:
- **Info API** (read-only): `https://api.hyperliquid.xyz/info`
- **Exchange API** (trading): `https://api.hyperliquid.xyz/exchange`

## Install

```bash
pip install hyperliquid-python-sdk
```

## Initialization

```python
from hyperliquid.info import Info
from hyperliquid.exchange import Exchange
from hyperliquid.utils import constants
import eth_account

# Read-only
info = Info(constants.MAINNET_API_URL, skip_ws=True)

# Trading
account = eth_account.Account.from_key(os.environ["HYPERLIQUID_PRIVATE_KEY"])
exchange = Exchange(account, constants.MAINNET_API_URL)
```

## Market Data

```python
# All mid prices
mids = info.all_mids()
# { "BTC": "74000.0", "ETH": "2100.0", ... }

# L2 order book
book = info.l2_snapshot("BTC")
# { "coin": "BTC", "levels": [[bids], [asks]], "time": 1234567890 }

# Meta + asset contexts (funding rates, OI, etc.)
meta, asset_ctxs = info.meta_and_asset_ctxs()
# asset_ctxs[i]["fundingRate"], asset_ctxs[i]["openInterest"]

# Candles
candles = info.candles_snapshot("BTC", "15m", start_time_ms, end_time_ms)
```

## Account Info

```python
address = account.address  # or any wallet address for read-only

# Perp state: positions, equity, margin
state = info.user_state(address)
# state["crossMarginSummary"]["accountValue"] — total equity
# state["assetPositions"] — list of open positions

# Open orders
orders = info.open_orders(address)

# Trade history
fills = info.user_fills(address)
```

## Trading

```python
# Place limit order (GTC)
result = exchange.order(
    "BTC",
    is_buy=True,
    sz=0.001,
    limit_px=74000,
    order_type={"limit": {"tif": "Gtc"}},
    reduce_only=False,
)

# Place market order
result = exchange.order(
    "BTC",
    is_buy=True,
    sz=0.001,
    limit_px=0,
    order_type={"market": {}},
    reduce_only=False,
)

# Cancel order
exchange.cancel("BTC", order_id)

# Close position (market)
exchange.market_close("BTC")

# Set leverage
exchange.update_leverage(10, "BTC", is_cross=True)
```

## WebSocket

```python
from hyperliquid.utils.signing import get_timestamp_ms
import websocket, json, threading

ws_url = "wss://api.hyperliquid.xyz/ws"

def on_message(ws, message):
    data = json.loads(message)
    print(data)

ws = websocket.WebSocketApp(ws_url, on_message=on_message)

# Subscribe after connect
def on_open(ws):
    ws.send(json.dumps({"method": "subscribe", "subscription": {"type": "allMids"}}))

ws.on_open = on_open
thread = threading.Thread(target=ws.run_forever)
thread.start()
```

## Notes

- All prices returned as strings — use `float()` when doing arithmetic
- `sz` is in base asset units (BTC, ETH, etc.), not USD notional
- Private key is the EVM wallet key controlling the Hyperliquid vault
- Testnet: use `constants.TESTNET_API_URL` and `wss://api.hyperliquid-testnet.xyz/ws`
- Rate limit: ~1200 requests/min for info, lower for exchange
