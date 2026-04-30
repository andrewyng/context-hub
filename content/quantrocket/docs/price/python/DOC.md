---
name: price
description: "QuantRocket Price module - unified price querying across history databases, real-time databases, and Zipline bundles"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,price,get_prices,data,research"
---

# quantrocket.price

Unified price querying across history databases, real-time aggregate databases, and Zipline bundles.

## Import

```python
from quantrocket import get_prices, get_prices_reindexed_like
```

## get_prices

```python
from quantrocket import get_prices

# Query a single database/bundle
prices = get_prices(
    "my-bundle",
    start_date="2024-01-01",
    end_date="2024-12-31",
    sids=["FIBBG000BDTBL9", "FIBBG000BSWKH7"],
    fields=["Close", "Volume"],
    data_frequency="daily",
)
closes = prices.loc["Close"]        # DataFrame: dates x SIDs
volumes = prices.loc["Volume"]

# Query multiple databases
prices = get_prices(
    ["stocks-db", "custom-data-db"],
    start_date="2024-01-01",
    fields=["Close"],
)

# Intraday data with timezone
prices = get_prices(
    "my-agg-db",
    start_date="2024-01-15",
    timezone="America/New_York",
)
# Returns: MultiIndex (Field, Date, Time) DataFrame
```

**Parameters:**
- `codes` (str or list of str, required): Database/bundle code(s)
- `start_date`, `end_date` (str): YYYY-MM-DD
- `universes`, `sids` (list of str): Filter securities
- `exclude_universes`, `exclude_sids` (list of str): Exclusions
- `times` (list of str): Time filter for intraday (HH:MM:SS)
- `fields` (list of str): `"Open"`, `"High"`, `"Low"`, `"Close"`, `"Volume"`
- `timezone` (str): Timezone for intraday data (e.g., `"America/New_York"`)
- `cont_fut` (str): `"concat"` for continuous futures
- `data_frequency` (str): `"daily"` or `"minute"`

**Returns:** MultiIndex DataFrame — daily: `(Field, Date)`, intraday: `(Field, Date, Time)`, SIDs as columns

## get_prices_reindexed_like

Align prices to another DataFrame's shape — essential for Pipeline-style research.

```python
from quantrocket import get_prices_reindexed_like

# closes: DataFrame with dates as index, SIDs as columns
other_prices = get_prices_reindexed_like(
    closes,
    "my-bundle",
    fields=["Close", "Volume"],
    shift=1,                    # shift forward 1 period (avoid lookahead bias)
)
```

**Parameters:**
- `reindex_like` (DataFrame, required): Shape template (dates x SIDs)
- `codes` (str or list of str, required): Database/bundle code(s)
- `fields` (list of str): Fields to return
- `shift` (int, default 1): Shift forward by N periods to avoid lookahead bias
- `ffill` (bool, default True): Forward-fill sparse data
- `lookback_window` (int, default 10): Calendar days of back data to load
- `agg` (str or function, default `"last"`): Aggregation for intraday to daily
