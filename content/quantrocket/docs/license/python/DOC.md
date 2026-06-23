---
name: license
description: "QuantRocket License module - manage license keys and broker API credentials (Alpaca, Polygon, Quandl)"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,license,api-keys,alpaca,credentials"
---

# quantrocket.license

Manage QuantRocket license and broker API credentials.

## Import

```python
from quantrocket.license import (
    get_license_profile,
    set_license,
    get_alpaca_key,
    set_alpaca_key,
    get_polygon_key,
    set_polygon_key,
    get_quandl_key,
    set_quandl_key,
)
```

## License

```python
from quantrocket.license import get_license_profile, set_license

profile = get_license_profile()
profile = get_license_profile(force_refresh=True)
set_license("your-license-key")
```

## Alpaca API Keys

```python
from quantrocket.license import get_alpaca_key, set_alpaca_key

creds = get_alpaca_key()

# Paper trading
set_alpaca_key(api_key="PK...", secret_key="...", trading_mode="paper")

# Live trading
set_alpaca_key(api_key="AK...", secret_key="...", trading_mode="live")

# With SIP data feed (paid, all exchanges)
set_alpaca_key(api_key="AK...", secret_key="...", trading_mode="live", realtime_data="sip")
```

**Parameters:**
- `api_key` (str, required): Alpaca API key
- `trading_mode` (str, required): `"paper"` or `"live"`
- `secret_key` (str): Alpaca secret key
- `realtime_data` (str): `"iex"` (default, free) or `"sip"` (paid)

## Polygon.io and Quandl

```python
from quantrocket.license import set_polygon_key, set_quandl_key

set_polygon_key("your-polygon-api-key")
set_quandl_key("your-quandl-api-key")
```

## CLI Equivalents

```bash
quantrocket license get
quantrocket license set 'YOUR-LICENSE-KEY'
quantrocket license alpaca-key
quantrocket license alpaca-key --api-key 'AK...' --secret-key '...' --live
quantrocket license alpaca-key --api-key 'PK...' --secret-key '...' --paper
quantrocket license polygon-key 'your-polygon-api-key'
quantrocket license quandl-key 'your-quandl-api-key'
```
