---
name: flightlog
description: "QuantRocket Flightlog module - logging, log streaming, log file downloads, and message waiting"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,flightlog,logging,monitoring"
---

# quantrocket.flightlog

Logging, log streaming, and log message management.

## Import

```python
from quantrocket.flightlog import (
    FlightlogHandler,
    stream_logs,
    download_logfile,
    wait_for_message,
    get_timezone,
    set_timezone,
)
```

## Send Logs from Python

```python
import logging
from quantrocket.flightlog import FlightlogHandler

logger = logging.getLogger("my-strategy")
logger.addHandler(FlightlogHandler())
logger.setLevel(logging.INFO)

logger.info("Strategy started")
logger.warning("Low liquidity detected")
logger.error("Order rejected")

# Non-blocking background logging
logger.addHandler(FlightlogHandler(background=True))
```

## Stream and Wait

```python
from quantrocket.flightlog import stream_logs, wait_for_message

for line in stream_logs():                               # tail -f style
    print(line)

for line in stream_logs(detail=True, hist=100):          # last 100 lines with detail
    print(line)

result = wait_for_message("collection complete")                    # blocking
result = wait_for_message(r"backtest.*finished", regex=True)        # regex
result = wait_for_message("done", timeout="30min")                  # with timeout
```

## Download Logs

```python
from quantrocket.flightlog import download_logfile
download_logfile("/tmp/quantrocket.log")
download_logfile("/tmp/errors.log", match="ERROR")
```

## CLI Equivalents

```bash
quantrocket flightlog stream
quantrocket flightlog stream --detail
quantrocket flightlog get -o quantrocket.log
quantrocket flightlog wait 'collection complete' --timeout '30min'
quantrocket flightlog timezone 'America/New_York'
```
