---
name: cli
description: "Meridian CLI for deploying censorship-resistant VLESS+Reality proxy servers — one command deploys Xray, HAProxy, Caddy, and firewall on any VPS"
metadata:
  languages: "python"
  versions: "3.8.1"
  updated-on: "2026-03-25"
  source: official
  tags: "meridian,vpn,proxy,censorship,vless,reality,xray,deployment,cli"
---

# Meridian CLI Guide

Meridian is a Python CLI tool that deploys censorship-resistant VLESS+Reality proxy servers on any VPS. It orchestrates Docker, Xray, HAProxy, Caddy, firewall, and TLS — you run one command and share VPN access via QR codes.

- **Package:** `meridian-vpn` on PyPI
- **Install:** `uv tool install meridian-vpn` or `pipx install meridian-vpn`
- **Docs:** https://getmeridian.org
- **GitHub:** https://github.com/uburuntu/meridian
- **llms.txt:** https://getmeridian.org/llms.txt

## Install

```bash
curl -sSf https://getmeridian.org/install.sh | bash
```

Or manually:

```bash
uv tool install meridian-vpn    # recommended
pipx install meridian-vpn       # alternative
```

Requires Python 3.10+. Update with `meridian update`.

## Deploy a Proxy Server

Interactive wizard:

```bash
meridian deploy
```

Non-interactive:

```bash
meridian deploy 1.2.3.4 --sni www.microsoft.com --name alice --yes
```

Local deployment (on the VPS itself, no SSH):

```bash
meridian deploy local
```

### What deploy does

1. Installs Docker, deploys Xray via 3x-ui management panel
2. Generates x25519 keypair for Reality authentication
3. Hardens server — UFW firewall, SSH key-only auth, BBR congestion control
4. Configures VLESS+Reality on port 443 (impersonates a real TLS server)
5. Enables XHTTP transport (additional stealth, routed through Caddy)
6. Deploys connection pages with QR codes and shareable URLs

### Deploy flags

| Flag | Default | Description |
|------|---------|-------------|
| `--sni HOST` | www.microsoft.com | Site that Reality impersonates |
| `--domain DOMAIN` | (none) | Enable domain mode with CDN fallback |
| `--email EMAIL` | (none) | Email for TLS certificates |
| `--xhttp / --no-xhttp` | enabled | XHTTP transport |
| `--name NAME` | default | Name for the first client |
| `--user USER` | root | SSH user (non-root gets sudo) |
| `--harden / --no-harden` | enabled | Server hardening: SSH key-only + firewall |
| `--server NAME` | | Target a specific named server |
| `--yes` | | Skip confirmation prompts |

## Client Management

```bash
meridian client add alice          # generate keys + connection page
meridian client list               # show all clients
meridian client remove alice       # revoke access
```

Each client gets a unique UUID, QR code, and hosted connection page. Use `--server NAME` to target a specific server.

## Relay Nodes

A relay is a lightweight TCP forwarder (Realm) on a domestic server that forwards traffic to the exit server abroad. Useful when the exit IP gets blocked.

```bash
meridian relay deploy RELAY_IP --exit EXIT_IP    # deploy relay
meridian relay list                               # list relays
meridian relay remove RELAY_IP                    # remove relay
meridian relay check RELAY_IP                     # health check
```

All protocols (Reality, XHTTP, WSS) work through the relay with end-to-end encryption.

### Relay flags

| Flag | Default | Description |
|------|---------|-------------|
| `--exit/-e EXIT` | (required) | Exit server IP or name |
| `--name NAME` | (auto) | Friendly name for the relay |
| `--port/-p PORT` | 443 | Listen port on relay server |
| `--user/-u USER` | root | SSH user on relay |

## Server Management

Manage multiple VPS deployments from one machine:

```bash
meridian server list             # view all managed servers (name, IP, user)
meridian server add [IP]         # register an existing server + fetch its credentials
meridian server remove NAME      # remove from local registry
```

Use `--server NAME` with any command to target a specific server:

```bash
meridian client add alice --server finland
meridian doctor --server finland
```

If you have only one server registered, it's auto-selected.

## Diagnostics

```bash
meridian preflight [IP]          # pre-flight check (SNI, ports, DNS, OS, disk)
meridian scan [IP]               # find optimal SNI targets on server's network
meridian test [IP]               # test proxy reachability (no SSH needed)
meridian doctor [IP]             # collect system diagnostics for debugging
meridian teardown [IP]           # remove proxy from server
```

Add `--ai` to `preflight` or `doctor` to generate an AI-ready diagnostic prompt.

## Global Flags

| Flag | Description |
|------|-------------|
| `--server NAME` | Target a specific named server |

Server resolution priority: explicit IP > `--server` flag > local mode detection > single server auto-select > interactive prompt.

## Domain Mode

Adds CDN fallback via Cloudflare (VLESS+WSS). Deploy with:

```bash
meridian deploy 1.2.3.4 --domain proxy.example.com
```

Cloudflare setup order:
1. Create A record pointing to server IP (grey cloud — DNS only)
2. Run `meridian deploy` — Caddy obtains TLS certificate
3. Switch to orange cloud (Proxied)
4. SSL/TLS → Full (Strict), Network → Enable WebSockets

Users get three connection options: Reality (primary), XHTTP (alternative), WSS (CDN backup).

## Architecture

All modes deploy HAProxy (port 443, SNI routing) + Caddy (TLS + web serving):

- **HAProxy** — TCP-level SNI router on port 443. Does NOT terminate TLS. Routes by SNI hostname.
- **Caddy** — reverse proxy with auto-TLS. Handles connection pages, panel, XHTTP, and WSS traffic.
- **Xray** — runs inside 3x-ui Docker container. Handles Reality, XHTTP, and WSS inbounds.

### Port assignments

| Port | Service | Mode |
|------|---------|------|
| 443 | HAProxy (SNI router) | All |
| 80 | Caddy (ACME challenges) | All |
| 10443 | Xray Reality (internal) | All |
| 8443 | Caddy TLS (internal) | All |
| localhost | Xray XHTTP | When XHTTP enabled |
| localhost | Xray WSS | Domain mode |
| 2053 | 3x-ui panel (internal) | All |

### How Reality protocol works

1. Server generates x25519 keypair. Public key shared with clients.
2. Client sends TLS Client Hello with camouflage domain as SNI.
3. Observers see normal HTTPS to the camouflage site.
4. Probers get proxied to the real site — valid certificate returned.
5. Authenticated clients (x25519 key) get the VLESS tunnel.
6. uTLS makes Client Hello identical to Chrome's.

### File locations

On server:
- `/etc/meridian/proxy.yml` — credentials and client list
- `/etc/caddy/conf.d/meridian.caddy` — Caddy config
- `/etc/haproxy/haproxy.cfg` — HAProxy config

On local machine:
- `~/.meridian/credentials/<IP>/proxy.yml` — cached credentials
- `~/.meridian/servers` — server registry

### Credential lifecycle

1. Generated randomly on first deploy (panel password, x25519 keys, client UUID)
2. Saved locally BEFORE applying to server (prevents lockout on failure)
3. Applied to server (panel password, inbounds)
4. Synced to `/etc/meridian/proxy.yml` on server
5. On re-runs: loaded from cache, not regenerated (idempotent)

## SNI Target Selection

Default `www.microsoft.com` works well. For optimal stealth, run `meridian scan` to find same-ASN targets.

**Good:** `www.microsoft.com`, `www.twitch.tv`, `dl.google.com`, `github.com` (global CDN).
**Bad:** `apple.com`, `icloud.com` (Apple-owned ASN — instant detection).

## Client Apps

| Platform | App |
|----------|-----|
| iOS | v2RayTun |
| Android | v2rayNG |
| Windows | v2rayN |
| All platforms | Hiddify |

## Reference Files

For detailed content, see the reference files in this directory:
- [Troubleshooting](references/troubleshooting.md) — common issues, fixes, diagnostic tool interpretation
- [Architecture](references/architecture.md) — full service topology, Docker internals, Caddy config, provisioning pipeline
