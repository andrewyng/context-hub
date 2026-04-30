---
name: zipline
description: "QuantRocket Zipline module - backtesting, bundle management, trading, parameter scans, and data download"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,zipline,backtest,bundle,trading,algorithmic-trading,parameter-scan"
---

# quantrocket.zipline

Zipline integration for backtesting, bundle management, and live trading.

## Import

```python
from quantrocket.zipline import (
    backtest,
    scan_parameters,
    trade,
    create_bundle_from_db,
    create_usstock_bundle,
    ingest_bundle,
    list_bundles,
    get_bundle_config,
    download_bundle_file,
    drop_bundle,
    list_sids,
    ZiplineBacktestResult,
)
```

## Backtesting

### Run a backtest

```python
from quantrocket.zipline import backtest

backtest(
    "my_strategy",                              # strategy filename (without .py)
    bundle="usstock-1min",                      # data bundle
    start_date="2020-01-01",
    end_date="2024-12-31",
    capital_base=1_000_000,
    data_frequency="daily",                     # "daily" or "minute"
    progress="M",                               # progress: "D", "W", "M", "A"
    filepath_or_buffer="/tmp/results.csv",
)

# With custom parameters
backtest(
    "my_strategy",
    bundle="usstock-1min",
    start_date="2020-01-01",
    params={"LOOKBACK": "60", "THRESHOLD": "0.5"},
    filepath_or_buffer="results.csv",
)
```

**Parameters:**
- `strategy` (str, required): Strategy filename without .py extension
- `data_frequency` (str): `"daily"` or `"minute"` (or `"d"`, `"m"`). Default is minute
- `capital_base` (float): Starting capital (default 1,000,000)
- `bundle` (str): Data bundle name
- `start_date` (str): YYYY-MM-DD format
- `end_date` (str): YYYY-MM-DD format
- `progress` (str): Pandas offset alias for progress meter (`"D"`, `"W"`, `"M"`, `"A"`)
- `params` (dict): Key-value pairs passed to algorithm as module-level attributes
- `filepath_or_buffer` (str or file-like): Output destination for results CSV

**Returns:** None (writes CSV to filepath_or_buffer)

### Parameter scan (scan_parameters)

**Function name is `scan_parameters()`** — not `param_scan()` or `parameter_scan()`.

```python
from quantrocket.zipline import scan_parameters

# 1-D scan: test one parameter across multiple values
scan_parameters(
    "my_strategy",
    bundle="usstock-1min",
    data_frequency="daily",
    start_date="2020-01-01",
    end_date="2024-12-31",
    param1="MAVG_WINDOW",                       # module-level attribute in algo file
    vals1=[20, 50, 100],                        # int/float/str/tuple/True/False/None/'default'
    num_workers=4,
    filepath_or_buffer="scan_MAVG_WINDOW.csv",
)

# 2-D scan: test combinations of two parameters
scan_parameters(
    "my_strategy",
    bundle="usstock-1min",
    data_frequency="daily",
    start_date="2020-01-01",
    param1="LONG_MAVG",
    vals1=[100, 200],
    param2="SHORT_MAVG",
    vals2=[20, 50],
    num_workers=3,
    filepath_or_buffer="scan_2d.csv",
)

# Fix other params while scanning
scan_parameters(
    "my_strategy",
    bundle="usstock-1min",
    start_date="2020-01-01",
    param1="LOOKBACK",
    vals1=[20, 40, 60],
    params={"THRESHOLD": 0.5, "USE_FILTER": True},  # fixed during scan
    filepath_or_buffer="scan_with_fixed.csv",
)

# Use 'default' to include current parameter value in scan
scan_parameters(
    "my_strategy",
    bundle="usstock-1min",
    start_date="2020-01-01",
    param1="LOOKBACK",
    vals1=[20, 40, "default", 100],             # 'default' = current value in algo
    filepath_or_buffer="scan_with_default.csv",
)

# Visualize results
from moonchart import ParamscanTearsheet
ParamscanTearsheet.from_csv("scan_MAVG_WINDOW.csv")
```

**Parameters:**
- `strategy` (str, required): Strategy filename without .py extension
- `data_frequency` (str): `"daily"` or `"minute"` (default minute)
- `capital_base` (float): Starting capital (default 1,000,000)
- `bundle` (str): Data bundle name
- `start_date`, `end_date` (str): YYYY-MM-DD
- `param1` (str, required): Name of parameter to test (module-level attribute in algo)
- `vals1` (list, required): Values to test — int, float, str, tuple, True, False, None, `"default"`
- `param2` (str): Second parameter for 2-D scans
- `vals2` (list): Values for second parameter
- `params` (dict): Fix other parameters during the scan
- `num_workers` (int): Parallel workers (default 1). Avoid `progress` with num_workers > 1
- `progress` (str): Pandas offset alias — messy with parallel workers, not recommended
- `filepath_or_buffer` (str): Output CSV path

**Returns:** None (writes CSV to filepath_or_buffer)

### Analyze backtest results

```python
from quantrocket.zipline import ZiplineBacktestResult

result = ZiplineBacktestResult.from_csv("results.csv")
returns = result.returns          # pd.Series of daily returns
positions = result.positions      # pd.DataFrame of positions
transactions = result.transactions  # pd.DataFrame of trades
benchmark = result.benchmark_returns  # pd.Series of benchmark returns
perf = result.perf                # pd.DataFrame of performance metrics
```

## Bundle Management

### Create bundle from history database

```python
from quantrocket.zipline import create_bundle_from_db

# Create from a single database
create_bundle_from_db(
    "my-bundle",
    from_db="my-history-db",
    calendar="XNYS",                # NYSE calendar
    start_date="2007-01-01",
    sids=["FIBBG000BDTBL9"],        # optional: limit to specific SIDs
    universes=["my-universe"],       # optional: limit to universe
)

# Create from multiple databases
create_bundle_from_db(
    "combined-bundle",
    from_db=["stocks-db", "custom-data-db"],
    calendar="XNYS",
    start_date="2005-01-01",
)
```

**Parameters:**
- `code` (str, required): Bundle name (lowercase, hyphens allowed)
- `from_db` (str or list of str, required): Source database code(s)
- `calendar` (str, required): Trading calendar (e.g., `"XNYS"`, `"XASX"`, `"XCBF"`)
- `start_date` (str): YYYY-MM-DD
- `end_date` (str): YYYY-MM-DD
- `universes` (list of str): Limit to these universes
- `sids` (list of str): Limit to these SIDs
- `exclude_universes`, `exclude_sids` (list of str): Exclusions
- `fields` (dict): Map Zipline fields to database fields

### Create US stock bundle

```python
from quantrocket.zipline import create_usstock_bundle

# Daily data bundle
create_usstock_bundle("usstock-daily", data_frequency="daily")

# Minute data for specific universe
create_usstock_bundle(
    "usstock-minute",
    universes=["my-universe"],
    data_frequency="minute",
)

# Free sample data
create_usstock_bundle("usstock-free", free=True)
```

### Ingest (refresh) bundle data

```python
from quantrocket.zipline import ingest_bundle

ingest_bundle("my-bundle")
ingest_bundle("my-bundle", sids=["FIBBG000BDTBL9"])  # specific SIDs only
```

### List and inspect bundles

```python
from quantrocket.zipline import list_bundles, get_bundle_config, list_sids

bundles = list_bundles()          # {"my-bundle": True, "new-bundle": False}
config = get_bundle_config("my-bundle")
sids = list_sids("my-bundle")
```

### Delete a bundle

```python
from quantrocket.zipline import drop_bundle

drop_bundle("old-bundle", confirm_by_typing_bundle_code_again="old-bundle")
```

## Download Bundle Data

```python
from quantrocket.zipline import download_bundle_file
import pandas as pd
from io import StringIO

# Download to file
download_bundle_file(
    "my-bundle",
    filepath_or_buffer="/tmp/prices.csv",
    start_date="2024-01-01",
    sids=["FIBBG000BDTBL9"],
    fields=["Close", "Volume"],
    data_frequency="daily",
)

# Download to DataFrame
f = StringIO()
download_bundle_file("my-bundle", filepath_or_buffer=f, start_date="2024-01-01")
f.seek(0)
prices = pd.read_csv(f, parse_dates=["Date"])
```

**Parameters:**
- `code` (str, required): Bundle name
- `filepath_or_buffer` (str or file-like): Output destination
- `start_date`, `end_date` (str): Date range filter
- `data_frequency` (str): `"daily"` or `"minute"`
- `universes`, `sids` (list of str): Filter securities
- `exclude_universes`, `exclude_sids` (list of str): Exclusions
- `times` (list of str): Filter by time (HH:MM:SS) for minute data
- `fields` (list of str): `"Open"`, `"High"`, `"Low"`, `"Close"`, `"Volume"`

## Live Trading

```python
from quantrocket.zipline import trade, list_active_strategies, cancel_strategies

trade("my_strategy", bundle="my-bundle", account="DU12345", data_frequency="daily")
trade("my_strategy", bundle="my-bundle", dry_run=True)  # no actual orders
active = list_active_strategies()
cancel_strategies(strategies=["my_strategy"])
cancel_strategies(cancel_all=True)
```

## CLI Equivalents

```bash
# Backtest
quantrocket zipline backtest 'my_strategy' --bundle 'usstock-1min' \
    --start-date '2020-01-01' --end-date '2024-12-31' -o results.csv

# Parameter scan
quantrocket zipline param-scan 'my_strategy' --bundle 'usstock-1min' \
    --param1 'MAVG_WINDOW' --vals1 20 50 100 --num-workers 4 -o scan.csv

# Create bundle from database
quantrocket zipline create-db-bundle 'my-bundle' \
    --from-db 'my-history-db' --calendar 'XNYS' --start-date '2007-01-01'

# Ingest bundle
quantrocket zipline ingest 'my-bundle'

# List bundles
quantrocket zipline list-bundles

# Download bundle data
quantrocket zipline get 'my-bundle' --start-date '2024-01-01' \
    --sids 'FIBBG000BDTBL9' -o prices.csv

# Trade
quantrocket zipline trade 'my_strategy' --bundle 'my-bundle'
```
