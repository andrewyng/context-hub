---
name: history
description: "QuantRocket History module - create databases, collect and query historical price data from IBKR, Sharadar, EDI, US Stock"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,history,historical-data,price-data,database"
---

# quantrocket.history

Create, collect, and query historical price data from multiple providers.

## Import

```python
from quantrocket.history import (
    create_ibkr_db,
    create_usstock_db,
    create_sharadar_db,
    create_edi_db,
    create_custom_db,
    collect_history,
    get_history_queue,
    cancel_collections,
    wait_for_collections,
    download_history_file,
    list_databases,
    get_db_config,
    drop_db,
    list_sids,
)
```

## Create History Databases

### IBKR database

```python
from quantrocket.history import create_ibkr_db

# Daily stock data
create_ibkr_db(
    "ibkr-stk-1d",
    universes=["us-stk"],
    bar_size="1 day",
    bar_type="ADJUSTED_LAST",
    start_date="2007-01-01",
)

# Minute data with time filter and sharding
create_ibkr_db(
    "ibkr-stk-1m",
    universes=["us-stk"],
    bar_size="1 min",
    bar_type="TRADES",
    start_date="2023-01-01",
    between_times=["09:30:00", "16:00:00"],
    shard="sid,time",
)
```

**bar_size options:** `"1 secs"`, `"5 secs"`, `"10 secs"`, `"15 secs"`, `"30 secs"`, `"1 min"`, `"2 mins"`, `"3 mins"`, `"5 mins"`, `"10 mins"`, `"15 mins"`, `"20 mins"`, `"30 mins"`, `"1 hour"`, `"2 hours"`, `"3 hours"`, `"4 hours"`, `"8 hours"`, `"1 day"`, `"1 week"`, `"1 month"`

**bar_type options:** `"TRADES"`, `"ADJUSTED_LAST"`, `"MIDPOINT"`, `"BID"`, `"ASK"`, `"BID_ASK"`, `"HISTORICAL_VOLATILITY"`, `"OPTION_IMPLIED_VOLATILITY"`

**shard options:** `"year"`, `"month"`, `"day"`, `"time"`, `"sid"`, `"sid,time"`, `"off"`

### US Stock database

```python
from quantrocket.history import create_usstock_db
create_usstock_db("usstock-1d", bar_size="1 day")
```

### Custom database

```python
from quantrocket.history import create_custom_db

create_custom_db(
    "my-custom-db",
    bar_size="1 day",
    columns={"Signal": "float", "Category": "str", "EventDate": "date"},
)
```

**Column types:** `"int"`, `"float"`, `"str"`, `"date"`, `"datetime"`

## Collect Data

```python
from quantrocket.history import collect_history, get_history_queue, cancel_collections, wait_for_collections

collect_history("ibkr-stk-1d")
collect_history("ibkr-stk-1d", start_date="2024-01-01", end_date="2024-12-31")
collect_history("ibkr-stk-1d", priority=True)  # jumps the queue
queue = get_history_queue()
result = wait_for_collections("ibkr-stk-1d", timeout="2h")
cancel_collections("ibkr-stk-1d")
```

## Download Historical Data

```python
from quantrocket.history import download_history_file
import pandas as pd
from io import StringIO

# Download to file
download_history_file(
    "my-history-db",
    filepath_or_buffer="/tmp/prices.csv",
    start_date="2024-01-01",
    sids=["FIBBG000BDTBL9"],
    fields=["Close", "Volume"],
)

# Download to DataFrame
f = StringIO()
download_history_file("my-history-db", filepath_or_buffer=f, start_date="2024-01-01")
f.seek(0)
prices = pd.read_csv(f, parse_dates=["Date"])
```

**Parameters:**
- `code` (str, required): Database code
- `filepath_or_buffer` (str or file-like): Output destination
- `start_date`, `end_date` (str): Date range
- `universes`, `sids` (list of str): Filter securities
- `exclude_universes`, `exclude_sids` (list of str): Exclusions
- `times` (list of str): Time filter for intraday data
- `cont_fut` (str): `"concat"` to stitch continuous futures
- `fields` (list of str): Specific fields
- `output` (str): `"csv"` (default)

## Manage Databases

```python
from quantrocket.history import list_databases, get_db_config, drop_db, list_sids

dbs = list_databases()                  # ["ibkr-stk-1d", "usstock-1d", ...]
config = get_db_config("ibkr-stk-1d")
sids = list_sids("ibkr-stk-1d")
drop_db("old-db", confirm_by_typing_db_code_again="old-db")  # IRREVERSIBLE
```

## CLI Equivalents

```bash
quantrocket history create-ibkr-db 'ibkr-stk-1d' \
    --universes 'us-stk' --bar-size '1 day' --bar-type 'ADJUSTED_LAST' \
    --start-date '2007-01-01'
quantrocket history collect 'ibkr-stk-1d'
quantrocket history get 'my-history-db' --start-date '2024-01-01' -o prices.csv
quantrocket history list-databases
quantrocket history queue
```
