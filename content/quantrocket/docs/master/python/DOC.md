---
name: master
description: "QuantRocket Master module - securities master database, universes, listings, calendars, and security lookups"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,master,securities,universes,listings,calendar"
---

# quantrocket.master

Securities master database: listings, universes, calendars, and security lookups.

## Import

```python
from quantrocket.master import (
    get_securities,
    get_securities_reindexed_like,
    download_master_file,
    create_universe,
    delete_universe,
    list_universes,
    collect_ibkr_listings,
    collect_alpaca_listings,
    collect_usstock_listings,
    collect_edi_listings,
    collect_figi_listings,
    collect_ibkr_option_chains,
    list_ibkr_exchanges,
    list_calendar_statuses,
    collect_ibkr_calendar,
    delist_ibkr_security,
    create_ibkr_combo,
    round_to_tick_sizes,
)
```

## Query Securities

```python
from quantrocket.master import get_securities

# By symbol, universe, or SID
securities = get_securities(symbols=["SPY", "QQQ", "IWM"])
securities = get_securities(universes=["us-stk"])
securities = get_securities(sids=["FIBBG000BDTBL9"])

# With filters
securities = get_securities(
    exchanges=["XNYS", "XNAS"],
    sec_types=["STK"],
    exclude_delisted=True,
    fields=["Symbol", "Name", "Exchange", "Currency", "SecType"],
)
```

**Returns:** DataFrame with SIDs as index.

**sec_types:** `"STK"`, `"ETF"`, `"FUT"`, `"CASH"`, `"IND"`, `"OPT"`, `"FOP"`, `"BAG"`, `"CFD"`

**vendors:** `"alpaca"`, `"edi"`, `"ibkr"`, `"sharadar"`, `"usstock"`

### Aligned to price data

```python
from quantrocket.master import get_securities_reindexed_like

# prices: DataFrame with dates as index, SIDs as columns
symbols = get_securities_reindexed_like(prices, fields=["Symbol", "Name"])
spy_symbols = symbols.loc["Symbol"]  # MultiIndex (Field, Date) DataFrame
```

## Universes

```python
from quantrocket.master import create_universe, delete_universe, list_universes

create_universe("my-universe", sids=["FIBBG000BDTBL9", "FIBBG000BSWKH7"])
create_universe("my-universe", infilepath_or_buffer="/tmp/sids.csv")
create_universe("combined", from_universes=["us-large", "us-mid"])
create_universe("my-universe", sids=["FIBBG000CN1S49"], append=True)
create_universe("my-universe", sids=["FIBBG000BDTBL9"], replace=True)
create_universe("active-stocks", from_universes=["us-stk"], exclude_delisted=True)

universes = list_universes()        # {"us-stk": 5000, "my-universe": 3}
delete_universe("old-universe")
```

## Exchange Calendars

```python
from quantrocket.master import list_calendar_statuses

statuses = list_calendar_statuses(exchanges=["XNYS"], sec_type="STK")
# Returns: {"XNYS": "open"} or {"XNYS": "closed"}

statuses = list_calendar_statuses(exchanges=["XNYS"], in_="30min")   # open in 30 min?
statuses = list_calendar_statuses(exchanges=["XNYS"], ago="1h")      # open 1h ago?
```

## Collect Listings

```python
from quantrocket.master import collect_alpaca_listings, collect_ibkr_listings

collect_alpaca_listings()
collect_ibkr_listings(exchanges=["XNYS", "XNAS"], sec_types=["STK"], currencies=["USD"])
```

## CLI Equivalents

```bash
quantrocket master get --symbols 'SPY' 'QQQ' -o securities.csv
quantrocket master list-universes
quantrocket master create-universe 'my-universe' -f sids.csv
quantrocket master collect-alpaca-listings
quantrocket master calendar 'XNYS' --sec-type 'STK'
```
