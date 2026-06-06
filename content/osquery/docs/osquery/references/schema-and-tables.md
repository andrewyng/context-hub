# Schema and tables reference

Detailed reference for osquery's table model, platform-specific tables, table arguments, and common join patterns.

> Full interactive schema: https://osquery.io/schema/

## Table categories

osquery tables fall into several categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **Cross-platform** | Available on macOS, Linux, Windows | `processes`, `users`, `routes`, `interface_addresses`, `os_version` |
| **Platform-specific** | Only on one or two OSes | `iptables` (Linux), `kernel_extensions` (macOS), `programs` (Windows) |
| **Event-based** | Buffered event streams, require `--disable_events=false` | `process_events`, `file_events`, `socket_events`, `yara_events` |
| **Utility / Action** | Require input columns (pushpin tables) | `file`, `hash`, `yara`, `curl`, `augeas` |
| **Meta** | Info about osquery itself | `osquery_info`, `osquery_schedule`, `osquery_packs`, `osquery_extensions` |

## Tables requiring WHERE predicates (pushpin tables)

These tables need at least one constrained column to produce results. Check the schema docs for columns marked with a pushpin icon.

| Table | Required column(s) | Example |
|-------|-------------------|---------|
| `file` | `path` or `directory` | `SELECT * FROM file WHERE directory = '/etc';` |
| `hash` | `path` or `directory` | `SELECT sha256 FROM hash WHERE path = '/bin/ls';` |
| `yara` | `path` and `sigfile` or `sig_group` | `SELECT * FROM yara WHERE path = '/tmp/suspicious' AND sigfile = '/rules/malware.yar';` |
| `augeas` | `path` or `node` | `SELECT * FROM augeas WHERE path = '/etc/ssh/sshd_config';` |
| `curl` | `url` | `SELECT result FROM curl WHERE url = 'https://example.com/health';` |
| `plist` | `path` | `SELECT * FROM plist WHERE path = '/Library/Preferences/...';` |

## High-value tables by use case

### Incident response

| Table | Use |
|-------|-----|
| `processes` | Running processes with cmdline, path, start_time |
| `process_open_sockets` | Network connections per process |
| `process_open_files` | Open file handles per process |
| `listening_ports` | Services listening on network ports |
| `logged_in_users` | Active sessions |
| `last` | Login history |
| `shell_history` | Shell command history (user-scoped) |
| `file` + `hash` | File metadata and hashes |
| `yara` | YARA rule matches |
| `process_events` | Process execution events (event table) |
| `socket_events` | Network connection events (event table) |
| `file_events` | FIM events (event table) |

### Compliance and inventory

| Table | Use |
|-------|-----|
| `os_version` | OS version compliance |
| `deb_packages` / `rpm_packages` / `programs` | Installed software inventory |
| `interface_addresses` | Network configuration |
| `users` / `groups` | Account inventory |
| `disk_encryption` | Encryption status (macOS FileVault, Linux LUKS) |
| `suid_bin` | SUID/SGID binaries (Linux) |
| `alf` / `iptables` | Firewall configuration |
| `certificates` | Certificate inventory |
| `browser_plugins` / `chrome_extensions` | Browser extension audit |

### Performance monitoring

| Table | Use |
|-------|-----|
| `cpu_time` | Per-CPU usage |
| `memory_info` | System memory breakdown |
| `processes` (resident_size, user_time, system_time) | Per-process resource usage |
| `mounts` / `disk_info` | Disk space and mount status |
| `load_average` | System load (Linux/macOS) |

## Platform availability quick reference

| Table | macOS | Linux | Windows |
|-------|:-----:|:-----:|:-------:|
| `processes` | Y | Y | Y |
| `users` | Y | Y | Y |
| `routes` | Y | Y | Y |
| `file` / `hash` | Y | Y | Y |
| `deb_packages` | - | Y | - |
| `rpm_packages` | - | Y | - |
| `homebrew_packages` | Y | Y | - |
| `programs` | - | - | Y |
| `iptables` | - | Y | - |
| `alf` | Y | - | - |
| `kernel_modules` | - | Y | - |
| `kernel_extensions` | Y | - | - |
| `suid_bin` | - | Y | - |
| `process_events` | Y | Y | Y |
| `file_events` | Y | Y | - |
| `yara` | Y | Y | Y |
| `certificates` | Y | - | Y |

## Common JOIN patterns

### Process with network connections
```sql
SELECT p.pid, p.name, p.path, pos.local_address, pos.local_port,
       pos.remote_address, pos.remote_port, pos.protocol
FROM processes p
JOIN process_open_sockets pos ON p.pid = pos.pid
WHERE pos.remote_address != '' AND pos.remote_address != '0.0.0.0';
```

### Process with open files
```sql
SELECT p.pid, p.name, pof.path AS open_file
FROM processes p
JOIN process_open_files pof ON p.pid = pof.pid
WHERE pof.path LIKE '/etc/%';
```

### File metadata with hash
```sql
SELECT f.path, f.size, f.mtime,
       h.sha256, h.md5
FROM file f
JOIN hash h ON f.path = h.path
WHERE f.directory = '/usr/bin'
ORDER BY f.mtime DESC;
```

### Listening port to process mapping
```sql
SELECT l.port, l.address, l.protocol, p.name, p.pid, p.path
FROM listening_ports l
JOIN processes p ON l.pid = p.pid
ORDER BY l.port;
```

### Users with login history
```sql
SELECT u.username, u.uid, u.shell, l.tty, l.time AS last_login
FROM users u
LEFT JOIN last l ON u.username = l.username
ORDER BY l.time DESC;
```

## Official sources

- Complete schema for all platforms: https://osquery.io/schema/
- Creating new tables: https://osquery.readthedocs.io/en/stable/development/creating-tables/
