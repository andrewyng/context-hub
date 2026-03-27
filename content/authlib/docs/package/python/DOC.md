---
name: package
description: "Authlib package guide for OAuth 2.0, OpenID Connect, and JOSE integrations in Python"
metadata:
  languages: "python"
  versions: "1.6.9"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,authlib,oauth2,openid-connect,jwt,jose,authentication"
---

# Authlib Python Package Guide

## What It Does

`authlib` is a Python library for OAuth 1.0, OAuth 2.0, OpenID Connect, and JOSE.

In application code, the most common entry points are:

- framework OAuth clients for Flask, Django, and Starlette/FastAPI
- `OAuth2Session` for sync HTTP flows
- `AsyncOAuth2Client` for async HTTP flows
- `authlib.jose.jwt` for signing and validating JWTs

Use the framework integrations when your app signs users in with an external identity provider. Use the HTTP client classes for service-to-service OAuth or custom authorization flows. Use the JOSE APIs when your app issues or validates JWTs directly.

This guide covers `1.6.9`.

## Install

Install Authlib plus the framework or HTTP client you are actually using:

```bash
pip install authlib==1.6.9
```

Common combinations:

```bash
pip install authlib==1.6.9 Flask
pip install authlib==1.6.9 Django
pip install authlib==1.6.9 fastapi starlette
pip install authlib==1.6.9 requests
pip install authlib==1.6.9 httpx
```

## Shared Setup Rules

For OAuth and OpenID Connect integrations, keep these inputs outside source control:

```bash
export APP_SECRET_KEY="replace-me"
export GOOGLE_CLIENT_ID="replace-me"
export GOOGLE_CLIENT_SECRET="replace-me"
```

Use these rules across frameworks:

- Set a session secret before calling `authorize_redirect(...)`; Authlib stores OAuth state and OIDC nonce in the session.
- Prefer `server_metadata_url` for OpenID Connect providers instead of hard-coding authorization, token, and JWKS endpoints.
- Keep `client_kwargs={"scope": "openid email profile"}` when you expect OIDC user identity data.
- Make the registered redirect URI match your callback route exactly.

## Flask: Sign In With Google

Use the Flask integration when a Flask app needs browser-based sign-in.

```python
import os

from flask import Flask, redirect, session, url_for
from authlib.integrations.flask_client import OAuth

app = Flask(__name__)
app.secret_key = os.environ["APP_SECRET_KEY"]

oauth = OAuth(app)
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=os.environ["GOOGLE_CLIENT_ID"],
    client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
    client_kwargs={"scope": "openid email profile"},
)


@app.get("/login/google")
def login_google():
    redirect_uri = url_for("auth_google", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@app.get("/auth/google")
def auth_google():
    token = oauth.google.authorize_access_token()
    session["user"] = token["userinfo"]
    return redirect("/")
```

If the provider is plain OAuth 2.0 rather than OpenID Connect, register the client with explicit URLs instead of `server_metadata_url`:

```python
oauth.register(
    name="provider",
    client_id=os.environ["OAUTH_CLIENT_ID"],
    client_secret=os.environ["OAUTH_CLIENT_SECRET"],
    api_base_url="https://provider.example.com/",
    authorize_url="https://provider.example.com/oauth/authorize",
    access_token_url="https://provider.example.com/oauth/token",
    client_kwargs={"scope": "read write"},
)
```

After `authorize_access_token()`, call the provider's user API yourself if there is no OIDC `userinfo` available in the token payload.

## Django: Sign In With Google

Use the Django integration when you want the same browser redirect flow in a Django app.

Make sure Django sessions are enabled with `django.contrib.sessions` and `django.contrib.sessions.middleware.SessionMiddleware`.

```python
# app/oauth.py
import os

from authlib.integrations.django_client import OAuth

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=os.environ["GOOGLE_CLIENT_ID"],
    client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
    client_kwargs={"scope": "openid email profile"},
)
```

```python
# app/views.py
from django.shortcuts import redirect

from .oauth import oauth


def login_google(request):
    redirect_uri = request.build_absolute_uri("/auth/google")
    return oauth.google.authorize_redirect(request, redirect_uri)


def auth_google(request):
    token = oauth.google.authorize_access_token(request)
    request.session["user"] = token["userinfo"]
    return redirect("/")
```

## FastAPI Or Starlette: Sign In With Google

FastAPI uses Starlette underneath, so use the Starlette Authlib integration.

```python
import os

from fastapi import FastAPI, Request
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.environ["APP_SECRET_KEY"])

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=os.environ["GOOGLE_CLIENT_ID"],
    client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
    client_kwargs={"scope": "openid email profile"},
)


@app.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google")
async def auth_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    request.session["user"] = token["userinfo"]
    return RedirectResponse(url="/")
```

## Service-To-Service OAuth 2.0

When there is no browser redirect and your app needs a bearer token directly, use `OAuth2Session` or `AsyncOAuth2Client`.

### Sync Client Credentials With `OAuth2Session`

```python
import os

from authlib.integrations.requests_client import OAuth2Session

client = OAuth2Session(
    client_id=os.environ["OAUTH_CLIENT_ID"],
    client_secret=os.environ["OAUTH_CLIENT_SECRET"],
    scope="read:orders",
)

token = client.fetch_token(
    "https://provider.example.com/oauth/token",
    grant_type="client_credentials",
)

response = client.get("https://provider.example.com/api/orders")
response.raise_for_status()
print(response.json())
```

### Async Client Credentials With `AsyncOAuth2Client`

```python
import os
import asyncio

from authlib.integrations.httpx_client import AsyncOAuth2Client


async def main():
    async with AsyncOAuth2Client(
        client_id=os.environ["OAUTH_CLIENT_ID"],
        client_secret=os.environ["OAUTH_CLIENT_SECRET"],
        scope="read:orders",
    ) as client:
        token = await client.fetch_token(
            "https://provider.example.com/oauth/token",
            grant_type="client_credentials",
        )

        response = await client.get("https://provider.example.com/api/orders")
        response.raise_for_status()
        print(token)
        print(response.json())


asyncio.run(main())
```

If the provider requires extra token request parameters such as `audience` or a custom resource indicator, pass them through `fetch_token(...)`.

## Manual Authorization Code Flow Outside A Framework

If you are not using Flask, Django, or Starlette/FastAPI, `OAuth2Session` gives you the lower-level browser flow.

```python
import os

from authlib.integrations.requests_client import OAuth2Session

client = OAuth2Session(
    client_id=os.environ["OAUTH_CLIENT_ID"],
    client_secret=os.environ["OAUTH_CLIENT_SECRET"],
    scope="openid profile email",
    redirect_uri="https://client.example.com/callback",
)

authorization_url, state = client.create_authorization_url(
    "https://provider.example.com/oauth/authorize"
)

print("Open this URL in a browser:")
print(authorization_url)

authorization_response = input("Paste the full callback URL: ").strip()

token = client.fetch_token(
    "https://provider.example.com/oauth/token",
    authorization_response=authorization_response,
)

userinfo_response = client.get("https://provider.example.com/userinfo")
userinfo_response.raise_for_status()

print(state)
print(token)
print(userinfo_response.json())
```

For production web apps, use a framework integration instead of copying this interactive example directly.

## Sign And Validate JWTs

Use `authlib.jose.jwt` when your application issues or verifies JWTs directly.

```python
import time

from authlib.jose import jwt

header = {"alg": "HS256"}
claims = {
    "iss": "https://issuer.example.com",
    "sub": "user-123",
    "aud": "api://my-service",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600,
}

secret = "replace-me-with-a-real-secret"

token = jwt.encode(header, claims, secret)
decoded = jwt.decode(token, secret)
decoded.validate()

print(token)
print(dict(decoded))
```

For asymmetric signing, pass your PEM private key to `jwt.encode(...)` and the corresponding public key to `jwt.decode(...)`.

Call `validate()` after `decode()`. Decoding alone parses the token; validation enforces claims such as expiration and not-before.

## Common Pitfalls

- Missing session configuration causes callback failures because Authlib cannot restore `state` or OIDC nonce.
- `token["userinfo"]` is an OpenID Connect convenience. For plain OAuth 2.0 providers, fetch the user profile from the provider API yourself.
- Redirect URI mismatches are provider-side configuration errors, not Authlib bugs.
- Do not mix sync and async clients. Use `OAuth2Session` in sync code and `AsyncOAuth2Client` in async code.
- Validate decoded JWT claims with `claims.validate()` before trusting them.

## Quick Reference

- Flask OAuth client: `from authlib.integrations.flask_client import OAuth`
- Django OAuth client: `from authlib.integrations.django_client import OAuth`
- Starlette/FastAPI OAuth client: `from authlib.integrations.starlette_client import OAuth`
- Sync OAuth 2.0 HTTP client: `from authlib.integrations.requests_client import OAuth2Session`
- Async OAuth 2.0 HTTP client: `from authlib.integrations.httpx_client import AsyncOAuth2Client`
- JOSE/JWT helpers: `from authlib.jose import jwt`
