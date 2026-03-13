---
name: package
description: "requests-oauthlib package guide for OAuth 1.0a and OAuth 2.0 flows with Requests in Python"
metadata:
  languages: "python"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,requests-oauthlib,oauth,oauth1,oauth2,requests"
---

# requests-oauthlib Python Package Guide

## What It Does

`requests-oauthlib` adds OAuth support to `requests`.

The main entry points are:

- `OAuth2Session` for OAuth 2.0 authorization URLs, token exchange, token refresh, and authenticated API requests
- `OAuth1Session` for the OAuth 1.0a request-token → authorize → access-token flow
- `OAuth1` when you already have OAuth 1 credentials and only need request signing

Use provider-specific authorization, token, and API URLs from the provider's own documentation. This package does not discover endpoints for you.

## Install

```bash
pip install requests-oauthlib==2.0.0
```

`requests-oauthlib` depends on `requests>=2.0.0` and `oauthlib>=3.0.0`.

## Shared Setup

Keep client secrets and callback settings in environment variables:

```bash
export APP_SECRET_KEY="replace-me"
export OAUTH_CLIENT_ID="replace-me"
export OAUTH_CLIENT_SECRET="replace-me"
export OAUTH_REDIRECT_URI="http://localhost:8000/callback"
export OAUTH_AUTHORIZATION_URL="https://provider.example.com/oauth/authorize"
export OAUTH_TOKEN_URL="https://provider.example.com/oauth/token"
export API_BASE_URL="https://provider.example.com/api"
```

Common rules:

- register the redirect URI exactly as your provider expects
- keep the `state` value between the authorization request and callback
- persist the token dict returned by `fetch_token()` or `refresh_token()`
- use HTTPS endpoints; `OAuth2Session` rejects insecure transport by default

## OAuth 2.0 Authorization Code Flow

This is the default `OAuth2Session` flow. The session uses `WebApplicationClient` unless you pass a different OAuthlib client.

This example uses Flask only to show the login redirect and callback wiring.

```python
import os

from flask import Flask, jsonify, redirect, request, session
from requests_oauthlib import OAuth2Session

app = Flask(__name__)
app.secret_key = os.environ["APP_SECRET_KEY"]

CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
CLIENT_SECRET = os.environ["OAUTH_CLIENT_SECRET"]
REDIRECT_URI = os.environ["OAUTH_REDIRECT_URI"]
AUTHORIZATION_URL = os.environ["OAUTH_AUTHORIZATION_URL"]
TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]
API_BASE_URL = os.environ["API_BASE_URL"]
SCOPE = ["profile", "email"]


@app.get("/login")
def login():
    oauth = OAuth2Session(
        client_id=CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
    )
    authorization_url, state = oauth.authorization_url(AUTHORIZATION_URL)
    session["oauth_state"] = state
    return redirect(authorization_url)


@app.get("/callback")
def callback():
    oauth = OAuth2Session(
        client_id=CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        state=session["oauth_state"],
    )
    token = oauth.fetch_token(
        TOKEN_URL,
        authorization_response=request.url,
        client_secret=CLIENT_SECRET,
    )
    session["oauth_token"] = token
    return redirect("/me")


@app.get("/me")
def me():
    oauth = OAuth2Session(
        client_id=CLIENT_ID,
        token=session["oauth_token"],
    )
    response = oauth.get(f"{API_BASE_URL}/userinfo")
    response.raise_for_status()
    return jsonify(response.json())
```

If you already have a token in storage, recreate the session with `token=...` and use the normal `requests.Session` methods:

```python
import json
import os
from pathlib import Path

from requests_oauthlib import OAuth2Session

CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
API_BASE_URL = os.environ["API_BASE_URL"]
stored_token = json.loads(Path("oauth-token.json").read_text())

oauth = OAuth2Session(client_id=CLIENT_ID, token=stored_token)

if oauth.authorized:
    response = oauth.get(f"{API_BASE_URL}/userinfo")
    response.raise_for_status()
    profile = response.json()
```

The token dict you pass back in should include at least `access_token` and `token_type`.

## OAuth 2.0 PKCE

`2.0.0` adds PKCE support through the `pkce` argument. Use `"S256"` unless your provider explicitly requires plain-text challenges.

This example keeps the authorization URL generation and token exchange on the same session object so the generated code verifier is available for `fetch_token()`:

```python
import os

from requests_oauthlib import OAuth2Session

CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
REDIRECT_URI = os.environ["OAUTH_REDIRECT_URI"]
AUTHORIZATION_URL = os.environ["OAUTH_AUTHORIZATION_URL"]
TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]

oauth = OAuth2Session(
    client_id=CLIENT_ID,
    redirect_uri=REDIRECT_URI,
    scope=["openid", "profile", "email"],
    pkce="S256",
)

authorization_url, state = oauth.authorization_url(AUTHORIZATION_URL)
print("Open this URL in a browser:")
print(authorization_url)

authorization_response = input("Paste the full redirect URL: ").strip()

token = oauth.fetch_token(
    TOKEN_URL,
    authorization_response=authorization_response,
    include_client_id=True,
)

print(token)
```

For public clients, `include_client_id=True` is important because `fetch_token()` otherwise tries to build HTTP Basic auth from `client_id` and `client_secret` when no explicit `auth` object is provided.

## Refreshing OAuth 2.0 Tokens

Use `refresh_token()` when your provider issues refresh tokens:

```python
import json
import os
from pathlib import Path

from requests.auth import HTTPBasicAuth
from requests_oauthlib import OAuth2Session

CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
CLIENT_SECRET = os.environ["OAUTH_CLIENT_SECRET"]
TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]

token_path = Path("oauth-token.json")
stored_token = json.loads(token_path.read_text())

oauth = OAuth2Session(client_id=CLIENT_ID, token=stored_token)

new_token = oauth.refresh_token(
    TOKEN_URL,
    auth=HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET),
)

token_path.write_text(json.dumps(new_token))
```

If you configure `auto_refresh_url`, expired protected-resource requests will refresh automatically. Provide `token_updater` to persist the new token; otherwise the session raises `TokenUpdated` with the refreshed token instead of saving it for you.

## OAuth 1.0a Workflow

Use `OAuth1Session` when a provider still requires OAuth 1.0a.

```bash
export OAUTH1_CLIENT_KEY="replace-me"
export OAUTH1_CLIENT_SECRET="replace-me"
export OAUTH1_CALLBACK_URI="https://127.0.0.1/callback"
export OAUTH1_REQUEST_TOKEN_URL="https://provider.example.com/oauth/request_token"
export OAUTH1_AUTHORIZATION_URL="https://provider.example.com/oauth/authorize"
export OAUTH1_ACCESS_TOKEN_URL="https://provider.example.com/oauth/access_token"
export API_BASE_URL="https://provider.example.com/api"
```

```python
import os

from requests_oauthlib import OAuth1Session

oauth = OAuth1Session(
    client_key=os.environ["OAUTH1_CLIENT_KEY"],
    client_secret=os.environ["OAUTH1_CLIENT_SECRET"],
    callback_uri=os.environ["OAUTH1_CALLBACK_URI"],
)

request_token = oauth.fetch_request_token(os.environ["OAUTH1_REQUEST_TOKEN_URL"])
print(request_token)

authorization_url = oauth.authorization_url(os.environ["OAUTH1_AUTHORIZATION_URL"])
print("Open this URL in a browser:")
print(authorization_url)

redirect_response = input("Paste the full redirect URL: ").strip()
oauth.parse_authorization_response(redirect_response)

access_token = oauth.fetch_access_token(os.environ["OAUTH1_ACCESS_TOKEN_URL"])
print(access_token)

response = oauth.get(f"{os.environ['API_BASE_URL']}/account/settings.json")
response.raise_for_status()
print(response.json())
```

If you already have the OAuth 1 token and token secret, initialize the session with `resource_owner_key=...` and `resource_owner_secret=...` and use `get()`, `post()`, and other `requests.Session` methods directly.

## Compliance Hooks For Non-Standard Providers

`OAuth2Session.register_compliance_hook()` lets you patch token requests, refresh requests, protected-resource requests, or token responses when a provider is not fully RFC-compliant.

Available hook types in `2.0.0` are:

- `access_token_request`
- `access_token_response`
- `refresh_token_request`
- `refresh_token_response`
- `protected_request`

Use hooks only when the provider's docs or behavior require request/response rewriting.

## Important Pitfalls

- `OAuth2Session` requires HTTPS for authorization, token, refresh, and protected-resource URLs; otherwise it raises `InsecureTransportError`.
- `fetch_token()` accepts either `authorization_response=full_callback_url` or an explicit `code=...`.
- For `LegacyApplicationClient`, `fetch_token()` requires both `username` and `password`.
- For implicit/mobile flows, use `token_from_fragment(...)` instead of `fetch_token()`.
- `OAuth1Session.fetch_access_token()` needs an OAuth verifier, usually set by `parse_authorization_response(...)`.
- `OAuth1Session.authorized` and `OAuth2Session.authorized` are quick checks for whether the session currently has usable credentials.

## Version Notes For 2.0.0

- `OAuth2Session(..., pkce="S256")` is available in `2.0.0`.
- `access_token_request` and `refresh_token_request` compliance hooks are available in `2.0.0`.
- `fetch_token()` and `refresh_token()` in `2.0.0` use the session's `verify` setting when you do not pass `verify=` explicitly.
