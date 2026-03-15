---
name: cli
description: "Tailscale CLI commands for Windows, macOS, and Linux, including SSH and subnet routing flags."
metadata:
  languages: "bash,powershell"
  versions: "1.78.1"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "tailscale,cli,ssh,subnet,networking,zerotrust"
---

# Tailscale CLI Action Guide

> **System**: Context Hub Integration
> **Goal**: Executing Tailscale network operations via CLI.

This document serves as the action guide for AI Agents to execute Tailscale CLI commands. 
Tailscale's CLI provides direct access to node configuration, authentication, routing, and secure service exposure.

## 1. Installation & Authentication

Before exposing services or routing traffic, the node must be authenticated to the tailnet.

### Standard Authentication

Authenticate a node using a one-off pre-approved authorization key:

```bash
tailscale up --authkey="tskey-auth-..."
```

### Headless & Ephemeral Environments (Containers/CI/CD)

For automated environments, combine `--authkey` with specific flags to ensure the node is clean when the environment resets.

**Ephemeral Nodes**: Automatically remove the node from the tailnet when its process terminates.

```bash
tailscale up --authkey="tskey-auth-..." --ephemeral
```

**Unattended Authentication**: Do not prompt for browser-based interactive authentication if the key fails.

```bash
tailscale up --authkey="tskey-auth-..." --unattended
```

**Hostname Customization**: Enforce a specific hostname on the tailnet, bypassing the default OS hostname.

```bash
tailscale up --authkey="tskey-auth-..." --hostname="ci-agent-runner-01"
```

## 2. Secure Service Exposure

Tailscale allows bypassing traditional firewalls securely by routing traffic over your encrypted tailnet.

### `tailscale serve` (Internal Service Exposure)

Exposes a local service (like a development web server) over your tailnet. Only authenticated nodes on your Tailscale network can access it.

**Expose a local port:**
If you have a server running on `localhost:3000`:

```bash
tailscale serve 3000
```
This routes `https://<your-tailnet-hostname>.<tailnet-domain>.ts.net` to `localhost:3000`.

**Expose a specific local path to a specific tailnet path:**

```bash
tailscale serve /api/ http://127.0.0.1:8080
```

**View current serve status:**

```bash
tailscale serve status
```

**Disable serve:**

```bash
tailscale serve reset
```

### `tailscale funnel` (Public Service Exposure)

Exposes a local service to the **public internet**. Anyone with the URL can access it, regardless of whether they have Tailscale installed.

*Note: The node's Access Control List (ACL) must explicitly allow Funnel usage.*

**Expose a local port publicly:**

```bash
tailscale funnel 3000
```

**View current funnel status:**

```bash
tailscale funnel status
```

**Disable funnel:**

```bash
tailscale funnel reset
```

## 3. Subnet Routing & SSH

Tailscale can act as a bridge (Subnet Router) into existing physical networks (VPCs, homelabs), or facilitate secure SSH access without managing traditional SSH keys.

### Advertising Subnet Routes

If a node sits within a VPC (e.g., `10.0.0.0/24`) and needs to grant access to other tailnet nodes:

1. **Enable IP Forwarding (Linux):**

```bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
```

2. **Advertise Routes:**

```bash
tailscale up --advertise-routes=10.0.0.0/24,192.168.1.0/24
```
*Note: Depending on your ACL auto-approvers setup, an administrator may still need to approve these routes in the Tailscale admin console.*

### Tailscale SSH

Tailscale SSH allows users and agents to SSH into devices using Tailscale authentication (identity) instead of managing `authorized_keys`.

1. **Enable Tailscale SSH on the target node:**

```bash
tailscale up --ssh
```
*Note: This replaces the standard SSH daemon on port 22 for traffic arriving over the tailnet.*

2. **Connecting to a node:**
From another authenticated Tailscale node, simply SSH using the target node's Tailscale IP or hostname.

```bash
ssh user@<tailnet-hostname>
```

### Hybrid Startup

You can combine all arguments for a complete initialization script:

```bash
sudo tailscale up \
  --authkey="tskey-auth-..." \
  --hostname="db-subnet-router" \
  --advertise-routes="10.100.0.0/16" \
  --ssh
```

## 4. Diagnostics & Status

**Check overall connectivity and status:**

```bash
tailscale status
```
*Use `tailscale status --json` for machine-readable output.*

**Check connection to a specific peer:**

```bash
tailscale ping <peer-hostname-or-ip>
```

**Show the active Tailscale IP address:**

```bash
tailscale ip      # Shows both IPv4 and IPv6
tailscale ip -4   # Shows only IPv4
```
