
## Which tool to use

```
BEFORE INSTALL           → meridian preflight IP
  "Will this server work for Meridian?"
  Tests: SNI reachability, port 443, DNS, OS, disk space.

AFTER INSTALL, CAN'T CONNECT → meridian test IP
  "Is the proxy reachable from where I am right now?"
  Tests: TCP port 443, TLS handshake (Reality), domain HTTPS.
  No SSH needed — runs from the client device.

AFTER INSTALL, SOMETHING BROKE → meridian doctor IP
  "Collect everything for debugging."
  Collects: server OS, Docker, 3x-ui logs, ports, firewall, SNI, DNS.
```

Add `--ai` to preflight or doctor for an AI-ready diagnostic prompt.

## Can't connect at all

### Port 443 not reachable

**Causes:**
1. Cloud provider firewall / security group blocks port 443 inbound
2. ISP or network blocks the server IP entirely
3. Server is down or proxy is not running
4. UFW on the server doesn't allow port 443

**Fixes:**
1. Check cloud provider console — ensure port 443/TCP is allowed inbound
2. Try from a different network (mobile data, another Wi-Fi)
3. SSH in and check: `docker ps` (is 3x-ui running?), `ss -tlnp sport = :443`
4. Check UFW: `ufw status` — should show 443/tcp ALLOW

### TLS handshake fails

**Causes:**
1. Xray is not running inside the Docker container
2. Port 443 is occupied by another service
3. Reality SNI target is unreachable from the server

**Fixes:**
1. Check Xray: `docker logs 3x-ui --tail 20`
2. Check port: `ss -tlnp sport = :443` — should be haproxy
3. Test SNI: `meridian preflight IP`

### Domain not reachable

**Causes:**
1. DNS not pointing to server IP
2. Caddy not running or failed to get TLS certificate
3. HAProxy not routing domain SNI correctly

**Fixes:**
1. Check DNS: `dig +short yourdomain.com @8.8.8.8`
2. Check Caddy: `systemctl status caddy`
3. Check HAProxy: `/etc/haproxy/haproxy.cfg`

## Connection drops after seconds

**Causes:**
1. System clock skew >30 seconds between client and server
2. MTU issues on the network path
3. ISP resetting long-lived TLS sessions

**Fixes:**
1. Server: `timedatectl set-ntp true`. Client: enable automatic date/time
2. Try a different network
3. Use WSS/CDN connection (domain mode)

## Setup fails

### Port 443 conflict

Another service (Apache, Nginx) is using port 443. Stop it or use a clean server. `meridian preflight` will tell you what's using the port.

### Docker installation fails

Conflicting Docker packages from distro repos. Meridian auto-removes them, but if Docker is already running with containers, it skips to avoid disruption.

### SSH connection errors

Test SSH manually: `ssh root@SERVER_IP`. Ensure you have key-based access. Use `--user` flag if not root.

### Xray fails to start (invalid JSON / MarshalJSON error)

The 3x-ui inbound `settings` or `streamSettings` fields contain corrupted JSON. This happens when `settings` is sent as a nested object instead of a JSON string — the 3x-ui Go struct expects a `string` type. The API returns `success: true` but stores only the first key name instead of the full JSON.

**Fix:** Uninstall and reinstall: `meridian teardown IP && meridian deploy IP`. To verify the database: `sqlite3 /opt/3x-ui/db/x-ui.db "SELECT settings FROM inbounds;"` — each field should be valid JSON.

### XHTTP inbound creation fails (port conflict)

In older versions (pre-v3.6.0), both Reality and XHTTP tried to use port 443. 3x-ui rejects duplicate ports.

**Fix:** Update to v3.6.0+. XHTTP now runs on a localhost-only port, routed through Caddy.

### Disk space insufficient

Less than 2GB free. Free up space: `docker system prune -af`, `journalctl --vacuum-time=1d`, check `/var/log/`.

### DNS resolution fails (domain mode)

Domain doesn't resolve to server IP yet. Update the DNS A record. Propagation is usually 5-15 minutes (up to 48 hours). Meridian warns if DNS doesn't resolve but lets you proceed.

## Was working, now stopped

**Most common cause:** Server IP got blocked. This is very common in censored regions.

**Fixes:**
1. Run `meridian test IP` — if TCP fails, the IP is likely blocked
2. Use the WSS/CDN link (domain mode)
3. Deploy a new server: get a new IP and re-run `meridian deploy`

Other causes:
- Server rebooted and Docker didn't auto-start → `docker start 3x-ui`
- Disk full → `df -h /`, `docker system prune -af`

## Slow speeds

1. Choose a server geographically closer (Finland, Netherlands, Sweden for Europe/Middle East)
2. Check server load: `htop` or `uptime`
3. Try WSS/CDN link — may have better routing through Cloudflare
4. Verify BBR is enabled: `sysctl net.ipv4.tcp_congestion_control`

**Do NOT** run other protocols (OpenVPN, WireGuard) on the same server — it flags the IP.

## AI-powered help

```
meridian doctor --ai
```

Copies a diagnostic prompt to your clipboard for use with any AI assistant.

Or collect diagnostics for a [GitHub issue](https://github.com/uburuntu/meridian/issues):

```
meridian doctor
```

## Relay not working

**Check relay health:**
```bash
meridian relay check RELAY_IP
```

**Common issues:**
- **Port conflict** — Another service is using port 443 on the relay server. Check with `ss -tlnp sport = :443` and stop the conflicting service.
- **Firewall blocking** — Ensure port 443 is open on the relay's cloud provider firewall / security group.
- **Exit server unreachable** — The relay must be able to reach the exit server on port 443. Test with `curl -I https://EXIT_IP`.
- **Relay not started** — Check the Realm service: `systemctl status meridian-relay`.

## Interpreting preflight output

| Check | What It Tests | If It Fails |
|-------|--------------|-------------|
| SNI target reachability | Can the server reach the camouflage site? | Server's outbound is restricted. Try a different SNI with `--sni` |
| SNI ASN match | Does the SNI target share a CDN/ASN with the server? | Use a global CDN domain. Avoid apple.com (Apple-owned ASN) |
| Port 443 availability | Is port 443 free or used by Meridian? | Another service is on 443. Stop it or use a clean server |
| Port 443 external reachability | Can the outside world reach port 443? | Cloud firewall blocks it. Open port 443/TCP inbound |
| Domain DNS | Does the domain resolve to server IP? | Update DNS A record |
| Server OS | Is it Ubuntu/Debian? | Other distros may work but are untested |
| Disk space | At least 2GB free? | Free up space |

## Interpreting doctor output

| Section | What to Look For |
|---------|-----------------|
| Local Machine | OS compatibility |
| Server | OS version, uptime (recent reboot?), disk/memory usage |
| Docker | Is 3x-ui container running? Status should be "Up" |
| 3x-ui Logs | Error messages, "failed to start" entries, certificate issues |
| Listening Ports | Port 443 should show haproxy. If missing, proxy isn't running |
| Firewall (UFW) | Port 443/tcp should be ALLOW. If not listed, it's blocked |
| SNI Target | Should show CONNECTED with a certificate chain |
| Domain DNS | Should resolve to server IP |

## Interpreting test output

| Check | Pass | Fail |
|-------|------|------|
| TCP port 443 | Server is network-reachable | Firewall, ISP block, or server down |
| TLS handshake | Reality protocol is working | Xray not running, port conflict, or SNI issue |
| Domain HTTPS | Caddy + HAProxy working | DNS, Caddy, or HAProxy issue |

If all checks pass but the VPN client still can't connect: re-scan the QR code, check device clock is accurate (within 30 seconds), or try a different app (v2rayNG, Hiddify).
