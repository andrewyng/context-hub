---
name: package
description: "python-jose package guide for signing, verifying, and encrypting JOSE tokens in Python"
metadata:
  languages: "python"
  versions: "3.5.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python-jose,jwt,jws,jwe,jwk,python,security"
---

# python-jose Package Guide

## Install

`python-jose 3.5.0` requires Python 3.9 or newer.

For most applications, install the `cryptography` extra so RSA, EC, AES, and certificate handling use the `cryptography` backend:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "python-jose[cryptography]==3.5.0"
```

If you install `python-jose` without extras, the package uses its native backend based on `rsa`, `ecdsa`, and `pyasn1`.

```bash
python -m pip install "python-jose==3.5.0"
```

Use the plain install for simple HMAC or key-based flows. Use the `cryptography` extra when you need PEM keys, X.509 certificates, or broader algorithm support through the preferred backend.

## Core Imports

The package exposes separate modules for each JOSE layer:

```python
from jose import jwe, jwk, jwt
from jose.constants import ALGORITHMS
from jose.exceptions import ExpiredSignatureError, JWEError, JWTClaimsError, JWTError
```

For typical application code, start with `jwt`. Drop to `jwe` for compact encryption or `jwk` when you need to construct a key object from a JWK payload directly.

## Create And Verify A JWT

Use `jwt.encode(...)` to sign a claims dictionary and `jwt.decode(...)` to verify the signature and validate reserved claims.

`python-jose` automatically converts `datetime` values in `exp`, `iat`, and `nbf` to NumericDate integers during encoding.

```python
import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from jose.constants import ALGORITHMS
from jose.exceptions import ExpiredSignatureError, JWTClaimsError, JWTError

secret = os.environ["JWT_SECRET"]

token = jwt.encode(
    {
        "sub": "user_123",
        "iss": "https://auth.example.com",
        "aud": "api://payments",
        "iat": datetime.now(timezone.utc),
        "nbf": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    },
    secret,
    algorithm=ALGORITHMS.HS256,
)

try:
    claims = jwt.decode(
        token,
        secret,
        algorithms=[ALGORITHMS.HS256],
        audience="api://payments",
        issuer="https://auth.example.com",
    )
    print(claims["sub"])
except ExpiredSignatureError:
    print("token expired")
except JWTClaimsError as exc:
    print(f"invalid claims: {exc}")
except JWTError as exc:
    print(f"invalid token: {exc}")
```

Important points:

- Always pass an explicit `algorithms=[...]` allowlist to `jwt.decode(...)`.
- If the token contains `aud`, pass `audience=...` or decoding fails with `Invalid audience`.
- `jwt.decode(...)` validates `exp`, `nbf`, `iat`, `iss`, `sub`, `jti`, and `at_hash` according to the options you enable.

## Require Claims And Allow Clock Skew

Use `options` when you need required claims or a small `leeway` for clock skew.

```python
import os

from jose import jwt
from jose.constants import ALGORITHMS

token = os.environ["JWT_TOKEN"]
secret = os.environ["JWT_SECRET"]

claims = jwt.decode(
    token,
    secret,
    algorithms=[ALGORITHMS.HS256],
    audience="api://payments",
    issuer="https://auth.example.com",
    options={
        "require_exp": True,
        "require_iat": True,
        "require_nbf": True,
        "leeway": 30,
    },
)
```

`leeway` is in seconds. You can also disable individual checks with options such as `{"verify_aud": False}` when that is intentional for your application.

## Sign And Verify RS256 Tokens With PEM Keys

When your issuer uses asymmetric keys, pass a PEM private key to `jwt.encode(...)` and a PEM public key to `jwt.decode(...)`.

```python
import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from jose.constants import ALGORITHMS

private_key = os.environ["JWT_PRIVATE_KEY_PEM"]
public_key = os.environ["JWT_PUBLIC_KEY_PEM"]

token = jwt.encode(
    {
        "sub": "user_123",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    },
    private_key,
    algorithm=ALGORITHMS.RS256,
    headers={"kid": "current-signing-key"},
)

claims = jwt.decode(
    token,
    public_key,
    algorithms=[ALGORITHMS.RS256],
)
```

If your verifier receives a PEM-encoded X.509 certificate instead of a public key, install `python-jose[cryptography]` and pass the certificate PEM to `jwt.decode(...)` the same way.

## Verify With A JWK Or JWK Set

`jwt.decode(...)` also accepts a JWK dictionary or a JWK set shaped like `{"keys": [...]}`.

```python
import json
import os

from jose import jwt
from jose.constants import ALGORITHMS

token = os.environ["JWT_TOKEN"]
jwks = json.loads(os.environ["JWT_JWKS_JSON"])

claims = jwt.decode(
    token,
    jwks,
    algorithms=[ALGORITHMS.RS256],
    audience="api://payments",
    issuer="https://auth.example.com",
)
```

If you already have a single JWK and need a key object directly, use `jwk.construct(...)`:

```python
import json
import os

from jose import jwk
from jose.constants import ALGORITHMS

signing_key = jwk.construct(
    json.loads(os.environ["JWT_JWK_JSON"]),
    algorithm=ALGORITHMS.RS256,
)
```

## Read Headers Or Claims Without Verifying

Use the unverified helpers only for routing decisions such as selecting a candidate key by `kid`. They do not authenticate the token.

```python
import os

from jose import jwt

token = os.environ["JWT_TOKEN"]

header = jwt.get_unverified_header(token)
claims = jwt.get_unverified_claims(token)

print(header.get("kid"))
print(claims.get("sub"))
```

Do not use `get_unverified_header(...)` or `get_unverified_claims(...)` as an authorization step. Always follow them with `jwt.decode(...)`.

## Encrypt And Decrypt A JWE

Use `jwe.encrypt(...)` and `jwe.decrypt(...)` for JWE compact serialization.

```python
import os

from jose import jwe
from jose.constants import ALGORITHMS

key = os.environ["JWE_SHARED_KEY"]

encrypted = jwe.encrypt(
    "sensitive payload",
    key,
    algorithm=ALGORITHMS.DIR,
    encryption=ALGORITHMS.A128GCM,
)

jwe_token = encrypted.decode("utf-8")
plaintext = jwe.decrypt(jwe_token, key).decode("utf-8")

print(jwe_token)
print(plaintext)
```

For direct encryption with `A128GCM`, the shared key must be 16 bytes long. If you switch to another content-encryption algorithm, use a key size that matches that algorithm.

## Common Pitfalls

- Use `python-jose[cryptography]` when you need PEM certificate support. The native backend cannot process X.509 certificates.
- Match the key type to the algorithm family: shared secret for `HS*`, PEM or JWK key material for `RS*` and `ES*`.
- Pass `algorithms=[...]` when decoding instead of trusting the token header.
- Treat `jwt.get_unverified_*` helpers as parsing utilities, not verification.
- Expect `jwe.encrypt(...)` to return bytes. Decode to UTF-8 text if you need to store or transmit the compact serialization as a string.

## Official References

- Maintainer docs: `https://python-jose.readthedocs.io/en/latest/`
- PyPI package: `https://pypi.org/project/python-jose/`
- Source repository: `https://github.com/mpdavis/python-jose/`
