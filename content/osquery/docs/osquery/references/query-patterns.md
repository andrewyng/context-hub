# Security-focused query patterns

Practical query recipes for incident response, compliance auditing, and threat hunting with osquery.

## Incident response

### Suspicious processes
```sql
-- Processes running from /tmp or unusual locations
SELECT pid, name, path, cmdline, uid, start_time
FROM processes
WHERE path LIKE '/tmp/%'
   OR path LIKE '/dev/shm/%'
   OR path LIKE '/var/tmp/%'
ORDER BY start_time DESC;

-- Processes where the binary is deleted from disk
SELECT pid, name, path, cmdline
FROM processes
WHERE on_disk = 0;

-- Processes with suspicious command-line patterns
SELECT pid, name, path, cmdline
FROM processes
WHERE cmdline LIKE '%base64%'
   OR cmdline LIKE '%curl%|%sh%'
   OR cmdline LIKE '%wget%|%bash%'
   OR cmdline LIKE '%-e /bin/sh%';
```

### Network investigation
```sql
-- Established outbound connections
SELECT p.pid, p.name, p.path,
       pos.remote_address, pos.remote_port, pos.local_port
FROM process_open_sockets pos
JOIN processes p ON pos.pid = p.pid
WHERE pos.remote_address != ''
  AND pos.remote_address != '0.0.0.0'
  AND pos.remote_address != '::';

-- Processes listening on non-standard ports
SELECT l.port, l.address, l.protocol, p.name, p.pid, p.path
FROM listening_ports l
JOIN processes p ON l.pid = p.pid
WHERE l.port NOT IN (22, 80, 443, 53, 8080, 8443, 3306, 5432)
ORDER BY l.port;

-- DNS resolver configuration (detect tampering)
SELECT * FROM dns_resolvers;
```

### File integrity
```sql
-- Recently modified files in sensitive directories
SELECT path, mtime, size, uid
FROM file
WHERE directory = '/etc'
  AND mtime > (SELECT unix_timestamp FROM time) - 86400
ORDER BY mtime DESC;

-- Hash critical binaries
SELECT h.path, h.sha256, f.mtime, f.size
FROM hash h
JOIN file f ON h.path = f.path
WHERE h.path IN ('/usr/bin/ssh', '/usr/bin/sudo', '/usr/bin/passwd', '/bin/login');

-- World-writable files in system directories
SELECT path, mode, uid, gid
FROM file
WHERE directory = '/usr/local/bin'
  AND mode LIKE '%7'
  AND type = 'regular';
```

### User activity
```sql
-- Currently logged-in users
SELECT user, tty, host, time, pid
FROM logged_in_users
WHERE type = 'user';

-- Recent logins
SELECT username, tty, host, time
FROM last
ORDER BY time DESC
LIMIT 50;

-- Shell history (run as each user or as root)
SELECT uid, command, history_file
FROM shell_history
WHERE command LIKE '%passwd%'
   OR command LIKE '%shadow%'
   OR command LIKE '%ssh-keygen%'
   OR command LIKE '%authorized_keys%';
```

## Compliance auditing

### CIS Benchmark-style checks
```sql
-- SSH configuration via augeas
SELECT label, value
FROM augeas
WHERE path = '/etc/ssh/sshd_config'
  AND label IN ('PermitRootLogin', 'PasswordAuthentication', 'Protocol', 'MaxAuthTries');

-- Verify disk encryption (macOS FileVault)
SELECT name, uuid, encrypted
FROM disk_encryption;

-- Check firewall status (macOS ALF)
SELECT global_state, stealth_enabled, logging_enabled
FROM alf;

-- Verify no duplicate UIDs
SELECT uid, COUNT(*) as cnt
FROM users
GROUP BY uid
HAVING cnt > 1;

-- List SUID/SGID binaries
SELECT path, username, groupname, permissions
FROM suid_bin
ORDER BY path;
```

### Software inventory and vulnerability surface
```sql
-- All installed packages with versions (Debian)
SELECT name, version, source, maintainer
FROM deb_packages
ORDER BY name;

-- Python packages (potential supply-chain risk)
SELECT name, version, directory
FROM python_packages
ORDER BY name;

-- Browser extensions (Chrome)
SELECT identifier, name, version, author, path, profile
FROM chrome_extensions;

-- Kernel modules loaded
SELECT name, size, used_by, status
FROM kernel_modules
WHERE status = 'Live';
```

## Threat hunting patterns

### Persistence mechanisms
```sql
-- Cron jobs
SELECT command, path, minute, hour, day_of_month
FROM crontab;

-- Startup items (macOS launchd)
SELECT name, program, program_arguments, run_at_load, keep_alive
FROM launchd
WHERE run_at_load = '1';

-- Startup items (Linux systemd)
SELECT id, description, load_state, active_state, sub_state, path
FROM systemd_units
WHERE active_state = 'active'
  AND sub_state = 'running';
```

### Lateral movement indicators
```sql
-- Authorized SSH keys
SELECT uid, key, key_file
FROM authorized_keys;

-- Known hosts entries
SELECT uid, key, key_file
FROM known_hosts;

-- Recent SSH sessions
SELECT user, host, time
FROM logged_in_users
WHERE host != ''
  AND host != 'localhost'
ORDER BY time DESC;
```

### Process tree analysis
```sql
-- Process parent-child relationships
SELECT p.pid, p.name, p.path, p.parent,
       pp.name AS parent_name, pp.path AS parent_path
FROM processes p
LEFT JOIN processes pp ON p.parent = pp.pid
WHERE p.name IN ('sh', 'bash', 'python', 'perl', 'ruby', 'nc', 'ncat')
ORDER BY p.start_time DESC;
```

## Performance tips

1. **Always use WHERE clauses** to avoid full table scans on large tables.
2. **LIMIT results** when exploring — `LIMIT 20` prevents overwhelming output.
3. **Avoid wildcards on constrained tables** — `SELECT * FROM file WHERE directory = '/'` scans only one directory level, but wide scans are still expensive.
4. **Use `--json` with `jq`** for post-processing instead of complex SQL when possible.
5. **Schedule heavy queries in osqueryd** rather than running them interactively in production.

## Official sources

- FIM documentation: https://osquery.readthedocs.io/en/stable/deployment/file-integrity-monitoring/
- Process auditing: https://osquery.readthedocs.io/en/stable/deployment/process-auditing/
- YARA scanning: https://osquery.readthedocs.io/en/stable/deployment/yara/
- Performance safety: https://osquery.readthedocs.io/en/stable/deployment/performance-safety/
