---
name: osquery
description: "osquery SQL-based operating system instrumentation framework — tables, schema, osqueryi shell, and query patterns for host monitoring and security."
metadata:
  languages: "sql"
  versions: "5.13.1"
  revision: 1
  updated-on: "2026-03-22"
  source: community
  tags: "osquery,sql,security,monitoring,endpoint,host,os,tables"
---

# osquery for agents

osquery exposes an operating system as a high-performance relational database. You write SQL queries against virtual tables that represent processes, network connections, file hashes, installed packages, and hundreds of other OS concepts. Data is returned in real time from OS APIs.

## Golden rules

- **SELECT only.** INSERT / UPDATE / DELETE exist but are no-ops (unless you create runtime views or use extensions).
- Use `osqueryi --json` for machine-readable output: `osqueryi --json "SELECT pid, name FROM processes LIMIT 5;"`
- Always run `.tables` and `.schema <table>` first to discover available columns before writing a query.
- Some tables (e.g. `file`, `hash`) **require a WHERE predicate** on specific columns (marked with a pushpin icon in the schema docs). `SELECT * FROM file` returns nothing — you must constrain with `path` or `directory`.
- Run as root/admin when possible — many tables return fewer results without elevated privileges.
- Use `--enable_foreign` flag to see tables for platforms other than the current host.

## osqueryi shell

`osqueryi` is the interactive query console. It is completely standalone — no daemon, no network.

```bash
# Launch
osqueryi

# Launch with JSON output
osqueryi --json "SELECT * FROM routes WHERE destination = '::1'"

# Pipe a query via stdin
echo "SELECT * FROM os_version;" | osqueryi --json
```

### Key meta-commands

| Command | Description |
|---------|-------------|
| `.tables` | List all available tables |
| `.schema <table>` | Show CREATE TABLE for a table |
| `PRAGMA table_info(<table>);` | Show columns with types and constraints |
| `.mode line` | One key=value per line (easier reading) |
| `.mode pretty` | Default columnar output |
| `.all <table>` | SELECT * from a table |
| `.help` | List all meta-commands |
| `.exit` or Ctrl-D | Exit the shell |

## High-value tables

### System info
| Table | What it returns |
|-------|----------------|
| `os_version` | OS name, version, build, platform |
| `system_info` | Hostname, CPU, RAM, hardware model |
| `uptime` | Days, hours, minutes since boot |
| `kernel_info` | Kernel version and arguments |
| `osquery_info` | osquery PID, version, config status |

### Processes and sockets
| Table | What it returns |
|-------|----------------|
| `processes` | PID, name, path, cmdline, uid, start_time, memory |
| `listening_ports` | Ports bound on 0.0.0.0 or specific addresses |
| `process_open_sockets` | Per-process socket details (local/remote addr, port, state) |
| `process_open_files` | Per-process open file descriptors |

### Files and hashes
| Table | Notes |
|-------|-------|
| `file` | Stat a file or directory — **requires** `path` or `directory` in WHERE |
| `hash` | SHA256/SHA1/MD5 — **requires** `path` in WHERE |

### Users and auth
| Table | What it returns |
|-------|----------------|
| `users` | Local user accounts |
| `logged_in_users` | Currently logged-in sessions |
| `last` | Login history |

### Packages and software
| Table | Platform |
|-------|----------|
| `deb_packages` | Debian/Ubuntu |
| `rpm_packages` | RHEL/CentOS |
| `homebrew_packages` | macOS |
| `npm_packages` | Node.js |
| `python_packages` | Python |
| `chrome_extensions` | Cross-platform |
| `firefox_addons` | Cross-platform |
| `apps` | macOS applications |
| `programs` | Windows installed programs |

### Network
| Table | What it returns |
|-------|----------------|
| `interface_addresses` | IP addresses per interface |
| `interface_details` | MTU, MAC, flags per interface |
| `routes` | Routing table |
| `arp_cache` | ARP table |
| `dns_resolvers` | Configured DNS servers |

### Security (platform-specific)
| Table | Platform |
|-------|----------|
| `alf` / `alf_services` | macOS Application Layer Firewall |
| `iptables` | Linux firewall rules |
| `suid_bin` | Linux SUID/SGID binaries |
| `kernel_modules` | Linux loaded kernel modules |
| `kernel_extensions` | macOS kernel extensions |
| `certificates` | Keychain / cert store |
| `yara_events` / `yara` | YARA rule matching |

## Common query patterns

### List listening services
```sql
SELECT DISTINCT p.name, l.port, p.pid
FROM processes AS p
JOIN listening_ports AS l ON p.pid = l.pid
WHERE l.address = '0.0.0.0';
```

### Find recently started processes
```sql
SELECT pid, name, path, cmdline, start_time
FROM processes
ORDER BY start_time DESC
LIMIT 20;
```

### Hash a specific file
```sql
SELECT path, sha256
FROM hash
WHERE path = '/usr/bin/ssh';
```

### List files in a directory with hashes
```sql
SELECT f.path, f.size, f.mtime, h.sha256
FROM file AS f
JOIN hash AS h ON f.path = h.path
WHERE f.directory = '/etc'
ORDER BY f.mtime DESC;
```

### Find SUID binaries (Linux)
```sql
SELECT path, username, permissions
FROM suid_bin;
```

### Installed packages with version
```sql
-- Debian/Ubuntu
SELECT name, version, source FROM deb_packages ORDER BY name;

-- RHEL/CentOS
SELECT name, version, release FROM rpm_packages ORDER BY name;
```

### Check osquery version and status
```sql
SELECT pid, version, config_valid, extensions, build_platform
FROM osquery_info;
```

## SQL extensions

osquery adds functions beyond standard SQLite:

- **Hashing:** `sha1(col)`, `sha256(col)`, `md5(col)`
- **String:** `split(col, tokens, index)`, `regex_match(col, pattern, index)`, `concat(...)`, `concat_ws(sep, ...)`
- **Network:** `in_cidr_block(cidr, ip)`, `community_id_v1(src, dst, sport, dport, proto)`
- **Encoding:** `to_base64(col)`, `from_base64(col)`
- **Math:** `sqrt`, `log`, `ceil`, `floor`, `power`, `pi`

## Common pitfalls

1. **Forgetting required WHERE predicates.** Tables like `file`, `hash`, `yara` produce no results without constrained columns. Check the schema docs for the pushpin icon.
2. **Running without root.** Many tables return partial data as a non-root user.
3. **Event tables need `--disable_events=false`.** Event-based tables (FIM, process auditing) are disabled by default in the shell.
4. **`osqueryi` uses an in-memory DB.** To access event history, connect to the daemon's database: `--database_path=/var/osquery/osquery.db` (only one process may attach at a time).
5. **Platform-specific tables.** Not all tables exist on all platforms. Use `.tables` to see what is available on the current host.

## Official sources

- osquery documentation: https://osquery.readthedocs.io/
- Full schema (all platforms): https://osquery.io/schema/
- osqueryi shell usage: https://osquery.readthedocs.io/en/stable/introduction/using-osqueryi/
- SQL introduction: https://osquery.readthedocs.io/en/stable/introduction/sql/
- GitHub: https://github.com/osquery/osquery

## Reference files

- `references/schema-and-tables.md` — Platform-specific high-value tables, common joins, and table argument patterns
- `references/osqueryi-usage.md` — Shell modes, flags, piping, and output formatting
- `references/query-patterns.md` — Security-focused query recipes for incident response and compliance
