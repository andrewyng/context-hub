---
name: satellite
description: "QuantRocket Satellite module - execute custom Python functions and shell commands on the satellite service"
metadata:
  languages: "python"
  versions: "2.11.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "quantrocket,satellite,custom-scripts,execution"
---

# quantrocket.satellite

Execute custom Python functions or shell commands on the satellite service.

## Import

```python
from quantrocket.satellite import execute_command
```

## Execute a Python function

```python
from quantrocket.satellite import execute_command

# Execute a Python function (dotted module path)
execute_command("mypackage.mymodule.my_function")

# Execute with parameters
execute_command(
    "mypackage.scripts.run",
    params={"start_date": "2024-01-01", "debug": "true"},
)

# Execute and retrieve a return file
execute_command(
    "mypackage.reports.generate",
    return_file="/path/to/output/report.csv",
    filepath_or_buffer="/tmp/report.csv",
)
```

**Parameters:**
- `cmd` (str, required): Dotted Python path to function (e.g., `"mypackage.module.function"`)
- `return_file` (str): Path to file on satellite to return after execution
- `filepath_or_buffer` (str or file-like): Local destination for return_file
- `params` (dict): Key-value pairs passed to the Python function
- `service` (str): Service name (default `"satellite"`)

**Returns:** dict (status message) or None (if return_file specified)

## CLI Equivalents

```bash
# Execute a Python function
quantrocket satellite exec 'mypackage.mymodule.my_function'

# Execute with parameters
quantrocket satellite exec 'mypackage.scripts.run' \
    --params 'start_date:2024-01-01' 'debug:true'

# Execute and retrieve output file
quantrocket satellite exec 'mypackage.reports.generate' \
    --return-file '/path/to/output/report.csv' -o report.csv
```

## Notes

- The function path uses Python dot notation: `package.module.function`
- The satellite service runs from the codeload directory
- Functions must be importable from the satellite container's Python path
- Parameters are passed as string key-value pairs
- Crontab entries use: `quantrocket satellite exec 'dotted.path.to.function'`
