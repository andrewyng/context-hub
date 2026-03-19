---
name: fundamental
description: "QuantRocket Fundamental module - Sharadar fundamentals, Brain NLP sentiment, IBKR short sale data, Alpaca ETB"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,fundamental,sharadar,brain,ibkr,alpaca,etb,short-sale"
---

# quantrocket.fundamental

Collect and query fundamental data: Sharadar financials, Brain NLP, IBKR short sale, Alpaca ETB.

## Import

```python
from quantrocket.fundamental import (
    # Sharadar Fundamentals
    collect_sharadar_fundamentals,
    download_sharadar_fundamentals,
    get_sharadar_fundamentals_reindexed_like,
    # Sharadar S&P 500
    get_sharadar_sp500_reindexed_like,
    # Brain NLP
    collect_brain_bsi,
    get_brain_bsi_reindexed_like,
    # IBKR Short Sale
    collect_ibkr_shortable_shares,
    get_ibkr_shortable_shares_reindexed_like,
    get_ibkr_borrow_fees_reindexed_like,
    # Alpaca ETB
    collect_alpaca_etb,
    get_alpaca_etb_reindexed_like,
)
```

## Sharadar Fundamentals

```python
from quantrocket.fundamental import (
    collect_sharadar_fundamentals,
    download_sharadar_fundamentals,
    get_sharadar_fundamentals_reindexed_like,
)

collect_sharadar_fundamentals()

download_sharadar_fundamentals(
    filepath_or_buffer="/tmp/fundamentals.csv",
    dimensions=["ART"],
    fields=["REVENUE", "EPS", "PE", "MARKETCAP", "ROE"],
    start_date="2020-01-01",
)

# In Pipeline research (closes: DataFrame with dates x SIDs)
fundamentals = get_sharadar_fundamentals_reindexed_like(
    closes,
    fields=["REVENUE", "PE", "ROE"],
    dimension="ART",
    period_offset=0,             # 0 = most recent, -1 = prior period
)
revenue = fundamentals.loc["REVENUE"]
```

**Dimensions:** `"ARQ"` (As Reported Quarterly), `"ARY"` (Yearly), `"ART"` (Trailing 12M), `"MRQ"` (Most Recent Quarterly), `"MRY"` (Yearly), `"MRT"` (Trailing 12M)

**Common fields (100+):** `"REVENUE"`, `"EPS"`, `"EBITDA"`, `"MARKETCAP"`, `"PE"`, `"ROE"`, `"DEBT"`, `"FCF"`, `"NETINC"`, `"GP"`, `"ASSETS"`, `"EQUITY"`, `"DE"`, `"CURRENTRATIO"`, `"DIVYIELD"`, `"BVPS"`

## Brain NLP Sentiment

```python
from quantrocket.fundamental import collect_brain_bsi, get_brain_bsi_reindexed_like

collect_brain_bsi()
sentiment = get_brain_bsi_reindexed_like(closes, N=7, fields=["SENTIMENT_SCORE", "BUZZ"])
```

**N options:** `1`, `7`, or `30` (calculation window in days)

## IBKR Short Sale Data

```python
from quantrocket.fundamental import (
    get_ibkr_shortable_shares_reindexed_like,
    get_ibkr_borrow_fees_reindexed_like,
)

shortable = get_ibkr_shortable_shares_reindexed_like(
    closes, aggregate=True,
    fields=["MinQuantity", "MaxQuantity", "MeanQuantity", "LastQuantity"],
)
fees = get_ibkr_borrow_fees_reindexed_like(closes)
```

## Alpaca Easy-to-Borrow

```python
from quantrocket.fundamental import get_alpaca_etb_reindexed_like

etb = get_alpaca_etb_reindexed_like(closes)  # Boolean DataFrame (True = easy to borrow)
```

## Sharadar S&P 500 Membership

```python
from quantrocket.fundamental import get_sharadar_sp500_reindexed_like

in_sp500 = get_sharadar_sp500_reindexed_like(closes)  # Boolean DataFrame
```

## CLI Equivalents

```bash
quantrocket fundamental collect-sharadar-fundamentals
quantrocket fundamental sharadar-fundamentals \
    --dimensions 'ART' --fields 'REVENUE' 'EPS' 'PE' -o fundamentals.csv
quantrocket fundamental collect-brain-bsi
quantrocket fundamental collect-ibkr-shortable-shares
quantrocket fundamental collect-alpaca-etb
```
