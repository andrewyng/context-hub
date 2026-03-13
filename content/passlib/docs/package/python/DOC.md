---
name: package
description: "Passlib password hashing framework for Python applications"
metadata:
  languages: "python"
  versions: "1.7.4"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "passlib,passwords,hashing,security,python"
---

# Passlib Python Package Guide

Passlib is a local password-hashing library for Python. It does not talk to a remote service, so there are no API keys or required environment variables. The main API for application code is `passlib.context.CryptContext`, which lets you hash new passwords, verify existing hashes, and migrate old hashes to a new policy during login.

## Install

Install the base package if you only need schemes implemented by Passlib itself:

```bash
pip install passlib==1.7.4
```

Install an extra when you want a backend-dependent scheme:

```bash
pip install "passlib[bcrypt]==1.7.4"
pip install "passlib[argon2]==1.7.4"
```

Passlib 1.7.4 declares these extras upstream:

- `passlib[bcrypt]` installs `bcrypt>=3.1.0`
- `passlib[argon2]` installs `argon2-cffi>=18.2.0`

## Recommended App Pattern

Create one `CryptContext` during app startup and reuse it everywhere you hash or verify passwords.

```python
# security.py
from passlib.context import CryptContext

password_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
    pbkdf2_sha256__default_rounds=200000,
    pbkdf2_sha256__min_rounds=200000,
)


def hash_password(password):
    return password_context.hash(password)


def verify_password(password, password_hash):
    return password_context.verify(password, password_hash)
```

Use it when creating or updating a user record:

```python
from security import hash_password

user.password_hash = hash_password(plain_password)
```

Store the returned hash string exactly as Passlib returns it. Passlib identifies the algorithm from the stored hash content, so you do not need a separate "algorithm" column for normal application code.

## Rehash On Login

Use `verify_and_update()` when you want old hashes to be upgraded automatically after a successful login.

```python
from security import password_context


def authenticate_user(user, password):
    verified, replacement_hash = password_context.verify_and_update(
        password,
        user.password_hash,
    )

    if not verified:
        return False

    if replacement_hash is not None:
        user.password_hash = replacement_hash
        user.save(update_fields=["password_hash"])

    return True
```

`verify_and_update()` always returns one of these shapes:

- `(False, None)` when verification fails
- `(True, None)` when the password matches and the stored hash is still acceptable
- `(True, "<new hash>")` when the password matches but the stored hash should be replaced

This is the easiest way to move users off deprecated schemes or too-low work factors without forcing password resets.

## Direct Handler API

If you are writing a one-off script, migration, or CLI tool, you can use a specific handler directly instead of building a full `CryptContext`.

```python
from passlib.hash import pbkdf2_sha256

password_hash = pbkdf2_sha256.hash("correct horse battery staple")

if pbkdf2_sha256.verify("correct horse battery staple", password_hash):
    print("password matches")

stronger_hash = pbkdf2_sha256.using(rounds=300000).hash(
    "correct horse battery staple"
)
```

Use direct handlers for narrow tasks. For application code that must accept old hashes and issue new ones consistently, prefer `CryptContext`.

## Load Policy From Config

Passlib can build a `CryptContext` from an INI-style config string or file. This is useful when you want password policy outside application code.

```ini
; passlib.ini
[passlib]
schemes = pbkdf2_sha256
default = pbkdf2_sha256
deprecated = auto
pbkdf2_sha256__default_rounds = 200000
pbkdf2_sha256__min_rounds = 200000
```

```python
from passlib.context import CryptContext

password_context = CryptContext.from_path("passlib.ini")
```

You can also use `CryptContext.from_string()` if the config comes from another source.

## Common Pitfalls

- Install the matching backend for the scheme you choose. The base `passlib` install does not include `bcrypt` or `argon2-cffi`.
- Do not use the deprecated `scheme=` keyword with `CryptContext.hash()`, `verify()`, `needs_update()`, or `verify_and_update()`. In Passlib 1.7 it is deprecated and scheduled for removal in 2.0.
- Do not use legacy APIs such as `encrypt()`, `genconfig()`, or `genhash()` in new code. Use `hash()`, direct handler `.using(...)`, and `verify()` or `verify_and_update()`.
- If you choose `bcrypt`, remember that BCrypt truncates passwords longer than 72 bytes by default. Set `truncate_error=True` to reject oversize passwords, or use `bcrypt_sha256` if you want a bcrypt-based scheme without the 72-byte truncation limit.
- `verify(password, None)` returns `False`, and `verify_and_update(password, None)` returns `(False, None)`. That lets you keep a single login code path even when a user has no stored hash.

## Version Notes For 1.7.x

- Passlib 1.7 renamed `encrypt()` to `hash()`; `encrypt()` remains only as a deprecated alias.
- Passlib 1.7 deprecated the explicit `scheme=` keyword on `CryptContext` hash/verify methods.
- Passlib 1.7.3 changed `bcrypt_sha256` to an HMAC-SHA256-based `v=2` format while retaining support for older hashes. Let Passlib verify existing hashes instead of parsing bcrypt-sha256 strings yourself.

## Official Sources

- Maintainer docs: https://passlib.readthedocs.io/en/stable/
- Changelog: https://passlib.readthedocs.io/en/stable/history
- PyPI package page: https://pypi.org/project/passlib/
