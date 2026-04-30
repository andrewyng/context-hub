---
name: realtime
description: "QuantRocket Realtime module - create tick databases, collect and query real-time market data from IBKR, Alpaca, Polygon"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,realtime,tick-data,market-data,streaming"
---

# quantrocket.realtime

Create tick databases and collect/query real-time market data.

## Import

```python
from quantrocket.realtime import (
    create_ibkr_tick_db,
    create_alpaca_tick_db,
    create_polygon_tick_db,
    create_agg_db,
    collect_market_data,
    get_active_collections,
    cancel_market_data,
    download_market_data_file,
    list_databases,
    get_db_config,
    drop_db,
    drop_ticks,
)
```

## Create Tick Databases

### Alpaca

```python
from quantrocket.realtime import create_alpaca_tick_db

create_alpaca_tick_db(
    "alpaca-ticks",
    universes=["my-universe"],
    fields=["LastPrice", "LastSize", "BidPrice", "AskPrice", "BidSize", "AskSize"],
)
```

**Alpaca fields:** `"AskPrice"`, `"AskSize"`, `"BidPrice"`, `"BidSize"`, `"LastPrice"`, `"LastSize"`, `"MinuteClose"`, `"MinuteOpen"`, `"MinuteHigh"`, `"MinuteLow"`, `"MinuteVolume"`

### IBKR

```python
from quantrocket.realtime import create_ibkr_tick_db

create_ibkr_tick_db(
    "ibkr-ticks",
    universes=["us-stk"],
    fields=["LastPrice", "LastSize", "BidPrice", "AskPrice", "Volume"],
)
```

**IBKR fields (55+):** `"AskExch"`, `"AskPrice"`, `"AskSize"`, `"BidPrice"`, `"BidSize"`, `"LastPrice"`, `"LastSize"`, `"Volume"`, `"OptionImpliedVol"`, `"OptionCallOpenInterest"`, `"OptionPutOpenInterest"`, and many more.

### Aggregate database

```python
from quantrocket.realtime import create_agg_db

create_agg_db(
    "alpaca-1min",
    tick_db_code="alpaca-ticks",
    bar_size="1m",                              # Pandas timedelta: "10s", "1m", "5m", "1h", "1d"
    fields={
        "LastPrice": ["Close", "Open", "High", "Low"],
        "LastSize": ["Sum"],
    },
)
```

**Aggregate functions:** `"Close"`, `"Open"`, `"High"`, `"Low"`, `"Mean"`, `"Sum"`, `"Count"`

## Collect Data

```python
from quantrocket.realtime import collect_market_data, get_active_collections, cancel_market_data

collect_market_data("alpaca-ticks")                     # continuous
collect_market_data("alpaca-ticks", until="2h")         # auto-cancel after 2h
collect_market_data("alpaca-ticks", snapshot=True, wait=True)  # single snapshot

active = get_active_collections(detail=True)
# Returns: {"alpaca": {"alpaca-ticks": 14}}

cancel_market_data("alpaca-ticks")
cancel_market_data(cancel_all=True)
```

## Download Data

```python
from quantrocket.realtime import download_market_data_file

download_market_data_file(
    "alpaca-ticks",
    filepath_or_buffer="/tmp/ticks.csv",
    start_date="2024-01-15",
    sids=["FIBBG000BDTBL9"],
)
```

## Manage Databases

```python
from quantrocket.realtime import list_databases, drop_ticks, drop_db

dbs = list_databases()                  # {"alpaca-ticks": ["alpaca-1min"]}
drop_ticks("alpaca-ticks", older_than="7d")
drop_db("old-ticks", confirm_by_typing_db_code_again="old-ticks", cascade=True)
```

## CLI Equivalents

```bash
quantrocket realtime create-alpaca-tick-db 'alpaca-ticks' \
    --universes 'my-universe' --fields 'LastPrice' 'LastSize'
quantrocket realtime collect 'alpaca-ticks'
quantrocket realtime active
quantrocket realtime cancel 'alpaca-ticks'
quantrocket realtime get 'alpaca-ticks' --start-date '2024-01-15' -o ticks.csv
quantrocket realtime create-agg-db 'alpaca-1min' \
    --tick-db 'alpaca-ticks' --bar-size '1m' \
    --fields 'LastPrice:Close,Open,High,Low' 'LastSize:Sum'
quantrocket realtime drop-ticks 'alpaca-ticks' --older-than '7d'
```
