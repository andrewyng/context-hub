# osqueryi usage reference

Detailed reference for osqueryi shell modes, flags, piping, and output formatting.

## Invocation

```bash
# Interactive mode
osqueryi

# Single query with default output
osqueryi "SELECT * FROM os_version;"

# JSON output (best for machine consumption)
osqueryi --json "SELECT * FROM os_version;"

# CSV output
osqueryi --csv "SELECT * FROM os_version;"

# Pipe query via stdin
echo "SELECT name, version FROM os_version;" | osqueryi --json

# With a specific database (to read event tables)
osqueryi --database_path=/var/osquery/osquery.db

# Enable foreign platform tables
osqueryi --enable_foreign
```

## Output modes

Set interactively with `.mode <name>` or via flags:

| Mode | Flag | Description |
|------|------|-------------|
| `pretty` | (default) | Column-aligned ASCII table |
| `line` | | One `key = value` per line, blank line between rows |
| `csv` | `--csv` | Comma-separated output |
| `json` | `--json` | JSON array of objects |
| `column` | | Padded columns without borders |
| `list` | | Pipe-separated values |

**Recommendation:** Use `--json` for all programmatic processing.

## Useful flags

| Flag | Description |
|------|-------------|
| `--json` | Output JSON |
| `--csv` | Output CSV |
| `--header=false` | Suppress column headers (list/csv modes) |
| `--separator=\|` | Change list-mode separator |
| `--database_path=PATH` | Attach to osqueryd's RocksDB for event data |
| `--disable_events=false` | Enable event publisher tables |
| `--enable_foreign` | Show tables for other platforms |
| `--config_path=PATH` | Load a config file for packs/decorators |
| `-S` or `-A` | When invoking `osqueryd`, act as interactive shell |
| `--verbose` | Enable verbose logging |

## Meta-commands

| Command | Description |
|---------|-------------|
| `.help` | List all meta-commands |
| `.tables` | List all tables |
| `.tables <pattern>` | List tables matching a partial string |
| `.schema <table>` | Show CREATE TABLE statement |
| `.all <table>` | SELECT * FROM table |
| `.mode <mode>` | Set output mode |
| `.separator <char>` | Set separator for list mode |
| `.headers on|off` | Toggle column headers |
| `.bail on|off` | Stop after hitting an error |
| `.echo on|off` | Echo commands before execution |
| `.connect <path>` | Connect to an osquery extension socket |
| `.disconnect` | Disconnect from extension |
| `.exit` / Ctrl-D | Exit the shell |

## Scripting patterns

### Run multiple queries from a file
```bash
osqueryi < queries.sql
```

### JSON output piped to jq
```bash
osqueryi --json "SELECT name, pid FROM processes WHERE name = 'sshd';" | jq '.[].pid'
```

### Combining with shell tools
```bash
# Count listening ports
osqueryi --json "SELECT port FROM listening_ports WHERE address='0.0.0.0';" | jq length

# Extract specific fields
osqueryi --json "SELECT name, version FROM deb_packages;" | jq -r '.[] | "\(.name)=\(.version)"'
```

### Checking if a table exists
```bash
osqueryi --json "SELECT name FROM osquery_registry WHERE registry='table' AND name='iptables';"
```

## Key behavior notes

- `osqueryi` is an **in-memory** virtual database by default. It does not connect to `osqueryd`.
- Event-based tables (`process_events`, `file_events`, `socket_events`) are empty unless using `--disable_events=false` or connecting to the daemon's database with `--database_path`.
- Only one process can attach to a RocksDB database at a time. If `osqueryd` is running, you cannot also attach with `--database_path`.
- The shell supports standard SQLite syntax with osquery extensions. See SQL reference: https://osquery.readthedocs.io/en/stable/introduction/sql/
- Running as non-root returns fewer rows for many tables (processes, sockets, etc.).

## Official sources

- osqueryi shell usage: https://osquery.readthedocs.io/en/stable/introduction/using-osqueryi/
- CLI flags reference: https://osquery.readthedocs.io/en/stable/installation/cli-flags/
