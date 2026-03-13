---
name: package
description: "oauthlib package guide for low-level OAuth 1.0a and OAuth 2.0 client flows in Python"
metadata:
  languages: "python"
  versions: "3.3.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,oauthlib,oauth,oauth1,oauth2"
---

# oauthlib Python Package Guide

## What It Does

`oauthlib` is a low-level OAuth library. It prepares authorization URLs, token request bodies, signed request headers, and token parsing logic, but it does not send HTTP requests for you.

Use it when you want direct control over the OAuth protocol details or need to integrate with your own HTTP stack. If you mainly want OAuth support on top of `requests`, the maintainer README points to `requests-oauthlib` as the higher-level option.

This guide focuses on the client-side pieces most applications need:

- `oauthlib.oauth2.WebApplicationClient` for authorization code flow
- `oauthlib.oauth2.BackendApplicationClient` for client credentials flow
- `oauthlib.oauth1.Client` for OAuth 1.0a request signing

`oauthlib 3.3.1` requires Python `>=3.8`.

## Install

```bash
pip install oauthlib==3.3.1
```

Optional extras declared in the package metadata:

```bash
pip install "oauthlib[rsa]"
pip install "oauthlib[signedtoken]"
pip install "oauthlib[signals]"
```

## Shared Setup

Keep provider-specific endpoints and secrets in environment variables:

```bash
export OAUTH_CLIENT_ID="replace-me"
export OAUTH_CLIENT_SECRET="replace-me"
export OAUTH_REDIRECT_URI="https://app.example.com/callback"
export OAUTH_AUTHORIZATION_URL="https://provider.example.com/oauth/authorize"
export OAUTH_TOKEN_URL="https://provider.example.com/oauth/token"
export API_BASE_URL="https://provider.example.com/api"
```

For local HTTP callback testing only, `oauthlib` also recognizes:

```bash
export OAUTHLIB_INSECURE_TRANSPORT=1
```

Do not set that in production. `oauthlib` checks for HTTPS on authorization URLs, token URLs, and protected-resource URLs unless that variable is present.

The examples below use the Python standard library to send HTTP requests because `oauthlib` itself does not include an HTTP client.

```python
import base64
from urllib.request import Request, urlopen


def basic_auth_header(client_id, client_secret):
    raw = f"{client_id}:{client_secret}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def post_form(url, body, client_id=None, client_secret=None):
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    if client_id and client_secret:
        headers["Authorization"] = basic_auth_header(client_id, client_secret)

    request = Request(url, data=body.encode("utf-8"), headers=headers, method="POST")
    with urlopen(request) as response:
        return response.read().decode("utf-8")
```

## OAuth 2.0 Authorization Code Flow

`WebApplicationClient` is the normal choice for server-side web apps. The base client docs recommend the `prepare_*_request` methods because they add HTTPS and state checks.

This example uses PKCE with `S256`. `oauthlib` accepts `code_challenge` and `code_verifier`, but you generate them yourself.

```python
import base64
import hashlib
import os
import secrets
from urllib.request import Request, urlopen

from oauthlib.oauth2 import WebApplicationClient


CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
CLIENT_SECRET = os.environ["OAUTH_CLIENT_SECRET"]
REDIRECT_URI = os.environ["OAUTH_REDIRECT_URI"]
AUTHORIZATION_URL = os.environ["OAUTH_AUTHORIZATION_URL"]
TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]
API_BASE_URL = os.environ["API_BASE_URL"]


def code_challenge_s256(code_verifier):
    digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


client = WebApplicationClient(CLIENT_ID)
state = secrets.token_urlsafe(32)
code_verifier = secrets.token_urlsafe(64)

authorization_url, _, _ = client.prepare_authorization_request(
    AUTHORIZATION_URL,
    redirect_url=REDIRECT_URI,
    scope=["openid", "profile", "email"],
    state=state,
    code_challenge=code_challenge_s256(code_verifier),
    code_challenge_method="S256",
)

print("Open this URL in a browser:")
print(authorization_url)

authorization_response = input("Paste the full redirect URL: ").strip()

token_url, _, token_body = client.prepare_token_request(
    TOKEN_URL,
    authorization_response=authorization_response,
    redirect_url=REDIRECT_URI,
    include_client_id=False,
    code_verifier=code_verifier,
)

token_response_body = post_form(
    token_url,
    token_body,
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
)
token = client.parse_request_body_response(token_response_body)

resource_url, resource_headers, _ = client.add_token(
    f"{API_BASE_URL}/userinfo",
    http_method="GET",
)

request = Request(resource_url, headers=resource_headers, method="GET")
with urlopen(request) as response:
    profile = response.read().decode("utf-8")

print(token)
print(profile)
```

Notes:

- `prepare_token_request(..., authorization_response=...)` parses the callback URL and verifies `state`
- `include_client_id=False` is appropriate when the token request uses HTTP Basic auth with `client_id` and `client_secret`
- for public clients with no client secret, omit the Basic auth header and keep `include_client_id=True`

## Client Credentials Flow

Use `BackendApplicationClient` when the application is acting on its own behalf and the provider supports the `client_credentials` grant.

```python
import os
from urllib.request import Request, urlopen

from oauthlib.oauth2 import BackendApplicationClient


CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
CLIENT_SECRET = os.environ["OAUTH_CLIENT_SECRET"]
TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]
API_BASE_URL = os.environ["API_BASE_URL"]

client = BackendApplicationClient(CLIENT_ID)

token_body = client.prepare_request_body(
    scope=["read:orders"],
    include_client_id=False,
)

token_response_body = post_form(
    TOKEN_URL,
    token_body,
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
)
token = client.parse_request_body_response(token_response_body)

resource_url, resource_headers, _ = client.add_token(
    f"{API_BASE_URL}/orders",
    http_method="GET",
)

request = Request(resource_url, headers=resource_headers, method="GET")
with urlopen(request) as response:
    orders = response.read().decode("utf-8")

print(token)
print(orders)
```

If your provider expects client credentials in the form body instead of HTTP Basic auth, call `prepare_request_body(..., include_client_id=True)` and send the request without the `Authorization` header.

## Refreshing An OAuth 2.0 Token

If the token response included a `refresh_token`, pass the stored token dict back into the client and prepare a refresh request.

```python
import json
import os
from pathlib import Path

from oauthlib.oauth2 import WebApplicationClient


CLIENT_ID = os.environ["OAUTH_CLIENT_ID"]
CLIENT_SECRET = os.environ["OAUTH_CLIENT_SECRET"]
TOKEN_URL = os.environ["OAUTH_TOKEN_URL"]

stored_token = json.loads(Path("oauth-token.json").read_text())
client = WebApplicationClient(CLIENT_ID, token=stored_token)

refresh_url, _, refresh_body = client.prepare_refresh_token_request(
    TOKEN_URL,
    include_client_id=False,
)

refresh_response_body = post_form(
    refresh_url,
    refresh_body,
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
)
new_token = client.parse_request_body_response(refresh_response_body)

Path("oauth-token.json").write_text(json.dumps(new_token))
print(new_token)
```

`parse_request_body_response()` expects the raw JSON response body string, not a pre-parsed dict.

## OAuth 1.0a Request Signing

Use `oauthlib.oauth1.Client` when you already have OAuth 1.0a credentials and need to sign outgoing requests.

```bash
export OAUTH1_CLIENT_KEY="replace-me"
export OAUTH1_CLIENT_SECRET="replace-me"
export OAUTH1_RESOURCE_OWNER_KEY="replace-me"
export OAUTH1_RESOURCE_OWNER_SECRET="replace-me"
export API_BASE_URL="https://provider.example.com/api"
```

```python
import os
from urllib.request import Request, urlopen

from oauthlib.oauth1 import Client as OAuth1Client


client = OAuth1Client(
    client_key=os.environ["OAUTH1_CLIENT_KEY"],
    client_secret=os.environ["OAUTH1_CLIENT_SECRET"],
    resource_owner_key=os.environ["OAUTH1_RESOURCE_OWNER_KEY"],
    resource_owner_secret=os.environ["OAUTH1_RESOURCE_OWNER_SECRET"],
)

uri, headers, body = client.sign(
    f"{os.environ['API_BASE_URL']}/account/verify_credentials",
    http_method="GET",
)

request = Request(uri, headers=headers, method="GET")
with urlopen(request) as response:
    payload = response.read().decode("utf-8")

print(payload)
```

If your provider requires a different signature algorithm, pass one of the exported constants such as `SIGNATURE_HMAC_SHA256`, `SIGNATURE_HMAC_SHA512`, `SIGNATURE_RSA_SHA1`, `SIGNATURE_RSA_SHA256`, or `SIGNATURE_RSA_SHA512` when you create the client.

## Common Pitfalls

- `oauthlib` does not perform token exchange or API calls by itself; you must send the returned URL, headers, and body through your own HTTP library
- OAuth 2.0 helper methods reject non-HTTPS authorization, token, and resource URLs unless `OAUTHLIB_INSECURE_TRANSPORT` is set
- keep the redirect URI identical between the authorization request and token request or the provider can reject the code exchange
- keep `state` stable across the redirect; `prepare_token_request(..., authorization_response=...)` raises `MismatchingStateError` if it does not match
- `add_token()` needs an `access_token`; if the token dict includes an expired `expires_at`, it raises `TokenExpiredError`
- for OAuth 1.0a, body signatures only work with `application/x-www-form-urlencoded` payloads, and `GET` or `HEAD` requests should not include a body
- `LegacyApplicationClient` exists for the resource owner password credentials grant, but its own class docs describe it as suitable only when there is a strong trust relationship and other flows are not viable
