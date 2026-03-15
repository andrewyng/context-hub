---
name: acl-architecture
description: "Tailscale Access Control Lists (ACL) design patterns, including Tags, Auto-approvers, and Zero Trust security for AI agents."
metadata:
  languages: "json,hujson"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "tailscale,acl,zerotrust,security,architecture"
---

# Tailscale Access Control Lists (ACL) Architecture

> **System**: Context Hub Integration
> **Goal**: Defining Cognitive frameworks for Zero Trust networks via Tailscale ACLs.

This document trains AI agents on the **Cognitive (智力)** aspect of network structure: How to design robust, least-privilege Access Control Lists (ACLs) using Tailscale's HuJSON configuration language.

## 1. Core Philosophy: Identity Over Topology

Traditional network security relies on IP ranges (VLANs, Subnets). Tailscale Zero Trust relies on **Identity**. 

An ACL answers one question: **"Who can access what, on which ports?"**

*   **Who:** An explicit user (e.g., `alice@example.com`), a group (`group:admins`), or a **Tag** (`tag:ci-agent`).
*   **What:** A destination identity (IP, hostname, or tag).
*   **Ports:** Specific TCP/UDP ports, or `*` for all ports.

## 2. Tags: Decoupling Devices from Humans

A critical concept for automated fleets (Servers, CI/CD runners, AI Agents) is **Tags**. 

If a server is owned by `alice@example.com`, and Alice leaves the company, her devices may lose access. 
If an AI Agent provisions a node, the node should be owned by a system concept, not a human.

**Rule:** Always assign non-human devices a `tag:`.

### Tag Ownership

Before a tag can be used, 'Tag Owners' must be defined in the ACL. This dictates *who* is allowed to generate an auth key or authenticate a device assigning that tag.

```hujson
// Define who can apply which tags to devices
"tagOwners": {
  // Only the IT team can provision database servers
  "tag:db-server": ["group:it-team"],
  
  // The CI system (already tagged) can provision short-lived test agents
  "tag:ci-agent":  ["tag:ci"],
  
  // AI Agents can provision ephemeral worker nodes
  "tag:ai-worker": ["tag:ai-controller"]
},
```

## 3. Strict Target Access (Zero Trust)

By default, Tailscale ACLs are often configured to allow `* : *` (everyone can see everyone). **This must be removed in production environments.**

Implement strict, purpose-built access paths.

### Example: AI Agent Access Architecture

```hujson
"groups": {
  "group:engineers": ["alice@example.com", "bob@example.com"]
},

"acls": [
  // 1. Engineers can SSH into all AI Worker nodes
  {
    "action": "accept",
    "src":    ["group:engineers"],
    "dst":    ["tag:ai-worker:22"]
  },
  
  // 2. AI Workers can ONLY access the central Database on Port 5432
  {
    "action": "accept",
    "src":    ["tag:ai-worker"],
    "dst":    ["tag:database:5432"]
  },
  
  // 3. AI Controllers can access AI Workers on all ports for management
  {
    "action": "accept",
    "src":    ["tag:ai-controller"],
    "dst":    ["tag:ai-worker:*"]
  }
]
```
*Note: In this design, `tag:ai-worker` nodes cannot talk to each other, nor can they access the internet through an exit node unless explicitly allowed.*

## 4. Auto-approvers: Automating Subnet Routing

When an agent executes `tailscale up --advertise-routes=10.0.0.0/24`, the route goes into a "Pending" state requiring manual admin approval in the console.

To automate infrastructure provisioning, configure `autoApprovers`.

```hujson
"autoApprovers": {
  // Automatically approve subnet routes originating from specific tags
  "routes": {
    "10.0.0.0/24":   ["tag:vpc-router"],
    "192.168.1.0/24": ["tag:homelab-bridge"]
  },
  
  // Automatically approve Exit Node advertisements
  "exitNode": ["tag:exit-nodes"]
}
```

## 5. Tailscale SSH Access Control

If using `tailscale up --ssh`, access is governed by the `ssh` block in the ACL, completely separate from the `acls` network block.

```hujson
"ssh": [
  // Allow engineers to SSH as root to CI agents, requiring Check Mode (re-auth)
  {
    "action": "check",
    "src":    ["group:engineers"],
    "dst":    ["tag:ci-agent"],
    "users":  ["root"]
  },
  // Allow AI Controllers non-interactive SSH to AI Workers as the 'agent' user
  {
    "action": "accept",
    "src":    ["tag:ai-controller"],
    "dst":    ["tag:ai-worker"],
    "users":  ["agent"]
  }
]
```

## 6. Validating ACLs with Tests

As a best practice (and required by IaC pipelines), always append `tests` to the bottom of the HuJSON file. 
Tailscale evaluates these during CI/CD checks before applying the ACL.

```hujson
"tests": [
  // Explicitly check that our intended rules work
  {
    "src": "alice@example.com",
    "accept": ["tag:ai-worker:22"],
    "deny":   ["tag:database:5432"]
  },
  {
    "src": "tag:ai-worker",
    "accept": ["tag:database:5432"],
    "deny":   ["tag:ai-worker:22", "8.8.8.8:53"]
  }
]
```
