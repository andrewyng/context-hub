---
name: countdown
description: "QuantRocket Countdown module - crontab scheduling service timezone management and conditional scheduling"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,countdown,crontab,scheduling,timezone"
---

# quantrocket.countdown

Crontab scheduling service and timezone management.

## Import

```python
from quantrocket.countdown import get_timezone, set_timezone
```

## Timezone

```python
from quantrocket.countdown import get_timezone, set_timezone

tz = get_timezone()
set_timezone("America/New_York")
tz = get_timezone(service="countdown-usa")  # specific service
```

## Crontab Management

Crontab is managed via file, not Python API. The countdown service auto-loads the crontab file.

### Crontab syntax

```bash
# minute hour day month weekday command

# Run at 14:30 UTC, Mon-Fri
30 14 * * mon-fri quantrocket satellite exec 'mypackage.mymodule.my_function'

# Conditional: only if NYSE is open
0 14 * * mon-fri quantrocket master isopen 'XNYS' && quantrocket satellite exec 'mypackage.run'

# Conditional: only if NYSE will be open in 30 minutes
30 9 * * mon-fri quantrocket master isopen 'XNYS' --in '30min' && quantrocket satellite exec 'mypackage.run'
```

### Validate

```bash
quantrocket countdown validate
```

## CLI Equivalents

```bash
quantrocket countdown timezone
quantrocket countdown timezone 'America/New_York'
quantrocket countdown validate
quantrocket countdown crontab
```
