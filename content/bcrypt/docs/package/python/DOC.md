---
name: package
description: "bcrypt password hashing library for Python applications"
metadata:
  languages: "python"
  versions: "5.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "bcrypt,passwords,hashing,security,python"
---

# bcrypt Python Package Guide

`bcrypt` is a local password-hashing library for Python. It does not call a remote API, so there are no API keys, service credentials, or required environment variables. Import the module and use `hashpw()`, `checkpw()`, and `gensalt()` directly.

The maintainers describe bcrypt as acceptable for password hashing, but note that new designs should prefer `argon2id` or `scrypt` when you are not constrained by bcrypt compatibility.

## Install

Install the package version you want to target:

```bash
python -m pip install bcrypt==5.0.0
```

`bcrypt` 5.0.0 requires Python 3.8+.

Most users should install from wheels. If `pip` falls back to building from source, current `bcrypt` releases use a Rust implementation. The upstream 5.0.0 changelog bumps the minimum supported Rust version to `1.74`.

## Initialization

There is no client object to create.

```python
import bcrypt
```

`bcrypt` works with `bytes`, not text strings, so encode user input before hashing or verifying.

## Hash A Password

Use `bcrypt.gensalt()` to create a random salt, then pass that salt into `bcrypt.hashpw()`.

```python
import bcrypt

password = "correct horse battery staple".encode("utf-8")
password_hash = bcrypt.hashpw(password, bcrypt.gensalt())

print(password_hash)
```

The returned hash contains the salt and work factor. Store the full returned value and pass it back into `checkpw()` later.

## Verify A Password

Use the stored hash as the second argument to `bcrypt.checkpw()`.

```python
import bcrypt

stored_hash = b"$2b$12$4B3JQKpcQv8Y7V0nR4N9mOui8Dw1YbtgxwiwA3HscFp8nAX9lLVCi"
candidate_password = "correct horse battery staple".encode("utf-8")

if bcrypt.checkpw(candidate_password, stored_hash):
    print("password matches")
else:
    print("invalid password")
```

For normal application code, wrap hashing and verification in one module and keep the byte encoding at the boundary:

```python
import bcrypt


def hash_password(password: str) -> bytes:
    password_bytes = password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt())


def verify_password(password: str, password_hash: bytes) -> bool:
    password_bytes = password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, password_hash)
```

## Tune The Work Factor

`bcrypt.gensalt()` defaults to `rounds=12`. Increase the rounds value when you need a higher work factor and your login latency budget allows it.

```python
import bcrypt

password = "correct horse battery staple".encode("utf-8")
password_hash = bcrypt.hashpw(password, bcrypt.gensalt(rounds=14))
```

If you need to interoperate with systems that expect a specific bcrypt prefix, `gensalt()` also accepts `prefix=` as bytes. Upstream documents `b"2b"` as the default and supports `b"2a"` when you need compatibility with older libraries.

```python
import bcrypt

salt = bcrypt.gensalt(rounds=12, prefix=b"2b")
password_hash = bcrypt.hashpw(b"secret", salt)
```

## Use `kdf()` Only For `bcrypt_pbkdf`

`bcrypt.kdf()` is separate from password-hash storage. The upstream README documents it as `bcrypt_pbkdf`, which is used by newer encrypted OpenSSH private key formats.

```python
import bcrypt

key = bcrypt.kdf(
    password=b"password",
    salt=b"salt",
    desired_key_bytes=32,
    rounds=100,
)
```

Use `hashpw()` and `checkpw()` for login passwords. Use `kdf()` only when you specifically need a derived key.

## Handle Long Passwords Explicitly

`bcrypt` 5.0.0 changes an important edge case: passing `hashpw()` a password longer than 72 bytes now raises `ValueError`. Older releases silently truncated after 72 bytes.

If your app must accept arbitrarily long passphrases while still storing bcrypt hashes, the upstream README shows a common workaround: hash the password first with SHA-256, base64-encode the digest, then bcrypt that result.

```python
import base64
import hashlib

import bcrypt


def normalize_password(password: str) -> bytes:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) <= 72:
        return password_bytes

    digest = hashlib.sha256(password_bytes).digest()
    return base64.b64encode(digest)


def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(normalize_password(password), bcrypt.gensalt())


def verify_password(password: str, password_hash: bytes) -> bool:
    return bcrypt.checkpw(normalize_password(password), password_hash)
```

Do not mix raw-password bcrypt hashes and pre-hashed bcrypt hashes for the same user population unless you have an explicit migration plan.

## Common Pitfalls

- Encode strings to `bytes` before calling `hashpw()`, `checkpw()`, or `kdf()`.
- Store the full bcrypt hash returned by `hashpw()`; verification expects that exact stored hash.
- Expect `ValueError` for passwords longer than 72 bytes in `bcrypt` 5.0.0.
- Keep `pip` reasonably current so it can install available wheels instead of forcing a source build.
- If a source build is required, make sure Rust is available; current `bcrypt` releases are implemented in Rust.

## Version Notes For 5.0.0

- Python 3.14 and free-threaded Python 3.14 are supported.
- Windows on ARM is supported.
- The minimum supported Rust version was bumped to `1.74` for source builds.
- `hashpw()` now raises `ValueError` for passwords longer than 72 bytes instead of silently truncating them.

## Official Sources

- Maintainer repository: https://github.com/pyca/bcrypt/
- PyPI package page: https://pypi.org/project/bcrypt/
- Security policy referenced by the package docs: https://cryptography.io/en/latest/security.html
