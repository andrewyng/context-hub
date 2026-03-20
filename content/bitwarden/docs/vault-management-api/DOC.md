---
name: vault-management-api
description: "Bitwarden Vault Management API for managing vault items via RESTful HTTP calls through the CLI serve command"
metadata:
  languages: "rest"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-20"
  source: community
  tags: "bitwarden,api,rest,vault,password-manager,cli,security"
---

# Bitwarden Vault Management API

RESTful API for managing Bitwarden vault items (logins, notes, cards, identities, folders, Send, attachments), including items owned by organizations if you have the appropriate permissions. Works by running `bw serve` from the Bitwarden CLI, which starts a local Express web server.

> This is not a cloud API. It controls a locally-running, authenticated Bitwarden CLI instance. The CLI must be logged in and the vault unlocked before making API calls.

## Setup

### 1. Install the CLI

```bash
npm install -g @bitwarden/cli
```

### 2. Log in

```bash
bw login <email>
# or with API key:
bw login --apikey
```

### 3. Unlock the vault

```bash
bw unlock
# Returns a session key — export it:
export BW_SESSION="<session_key>"
```

### 4. Start the API server

```bash
bw serve
# Default: http://localhost:8087

bw serve --port 8080
# Custom port

bw serve --hostname 0.0.0.0
# Listen on all interfaces (use with caution)
```

## Making requests

All requests go to `http://localhost:8087` (or your configured port). JSON request/response format.

```bash
# List all items
curl http://localhost:8087/list/object/items

# Get a specific item by ID
curl http://localhost:8087/object/item/<item_id>

# Sync the vault
curl -X POST http://localhost:8087/sync
```

## Key endpoints

### Vault status

| Method | Endpoint | Description |
|---|---|---|
| GET | `/status` | Vault status (locked/unlocked/unauthenticated) |
| POST | `/sync` | Sync vault with server |
| POST | `/lock` | Lock the vault |
| POST | `/unlock` | Unlock the vault (body: `{"password": "<master_password>"}`) |

### Items (logins, notes, cards, identities)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/list/object/items` | List all items |
| GET | `/list/object/items?search=<query>` | Search items |
| GET | `/list/object/items?folderid=<id>` | Items in a folder |
| GET | `/list/object/items?collectionid=<id>` | Items in a collection |
| GET | `/object/item/<id>` | Get item by ID |
| POST | `/object/item` | Create an item |
| PUT | `/object/item/<id>` | Update an item |
| DELETE | `/object/item/<id>` | Delete an item (soft delete) |
| POST | `/restore/item/<id>` | Restore a deleted item |

### Folders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/list/object/folders` | List all folders |
| GET | `/object/folder/<id>` | Get folder by ID |
| POST | `/object/folder` | Create a folder |
| PUT | `/object/folder/<id>` | Update a folder |
| DELETE | `/object/folder/<id>` | Delete a folder |

### Send

| Method | Endpoint | Description |
|---|---|---|
| GET | `/list/object/send` | List all Sends |
| GET | `/object/send/<id>` | Get Send by ID |
| POST | `/object/send` | Create a Send |
| DELETE | `/object/send/<id>` | Delete a Send |

### Attachments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/object/attachment?id=<attachment_id>&itemid=<item_id>` | Get attachment |
| POST | `/attachment?itemid=<item_id>` | Create attachment (multipart form) |
| DELETE | `/object/attachment/<attachment_id>?itemid=<item_id>` | Delete attachment |

### Generate

| Method | Endpoint | Description |
|---|---|---|
| GET | `/generate` | Generate a password |
| GET | `/generate?length=20&uppercase&lowercase&number&special` | Custom password options |
| GET | `/generate?passphrase&words=4&separator=-` | Generate a passphrase |

### Collections & Organizations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/list/object/collections` | List collections |
| GET | `/list/object/org-collections?organizationid=<id>` | Org collections |
| GET | `/list/object/org-members?organizationid=<id>` | Org members |
| GET | `/list/object/organizations` | List organizations |

## Creating an item

```bash
# Encode the item JSON as base64 (required by the API)
ITEM=$(echo '{"type":1,"name":"My Login","login":{"username":"<username>","password":"<password>","uris":[{"uri":"https://example.com"}]}}' | base64)

curl -X POST http://localhost:8087/object/item \
  -H 'Content-Type: application/json' \
  -d "$ITEM"
```

Item types: `1` = Login, `2` = Secure Note, `3` = Card, `4` = Identity.

## Confirm the vault is unlocked

```bash
curl -s http://localhost:8087/status | jq '.data.status'
# Should return "unlocked"
```

## Security considerations

- `bw serve` runs an unauthenticated HTTP server — anyone with network access to the port can read your vault
- Default binding is `localhost` only — keep it that way unless you understand the risks
- The vault must already be unlocked, meaning the master password has been provided at least once
- Consider using `--hostname 127.0.0.1` explicitly and firewall rules in production scripts

## Further reading

- [Vault Management API docs](https://bitwarden.com/help/vault-management-api/)
- [Bitwarden CLI serve command](https://bitwarden.com/help/cli/#serve)
- [Password Manager APIs overview](https://bitwarden.com/help/bitwarden-apis/)
