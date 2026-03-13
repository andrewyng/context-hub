---
name: package
description: "PyNaCl package guide for Python projects using the official PyNaCl 1.6.2 APIs for signing, encryption, and password hashing"
metadata:
  languages: "python"
  versions: "1.6.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "pynacl,python,cryptography,libsodium,signing,encryption,password-hashing"
---

# PyNaCl Python Package Guide

## Install

PyNaCl `1.6.2` requires Python `>=3.8`.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "pynacl==1.6.2"
```

Common alternatives:

```bash
uv add "pynacl==1.6.2"
poetry add "pynacl==1.6.2"
```

PyNaCl ships binary wheels for common macOS, Windows, and Linux environments. If you need to build from source against your system `libsodium`, set `SODIUM_INSTALL=system` during install:

```bash
SODIUM_INSTALL=system python -m pip install "pynacl==1.6.2"
```

Useful source-build environment variables from the maintainer install docs:

```bash
LIBSODIUM_MAKE_ARGS=-j4 python -m pip install "pynacl==1.6.2"
MAKE=gmake python -m pip install "pynacl==1.6.2"
```

## Runtime Basics

PyNaCl is a local cryptography library. There is no service account, API key, or runtime authentication step.

- Use `bytes` for messages, passwords, salts, keys, and associated data.
- Use `nacl.encoding.HexEncoder` or another encoder when you need to store keys as text.
- Let PyNaCl generate nonces unless you have a strict interoperability requirement.

```python
from nacl import encoding, exceptions, pwhash, utils
from nacl.public import Box, PrivateKey, SealedBox
from nacl.secret import Aead, SecretBox
from nacl.signing import SigningKey, VerifyKey

message = "hello".encode("utf-8")
```

## Choose The Right Primitive

- `SigningKey` and `VerifyKey`: sign data with Ed25519 and verify tampering.
- `SecretBox`: encrypt with a shared 32-byte secret key.
- `Aead`: encrypt with a shared 32-byte secret key and authenticate extra metadata with `aad`.
- `Box`: encrypt between two Curve25519 keypairs.
- `SealedBox`: encrypt to a recipient public key when the sender should not be able to decrypt later.
- `pwhash`: store password hashes or derive a key from a password.

## Generate And Serialize Keys

Use `generate()` for new keys and `encode()` for storage. Rebuild the key object with the same encoder when loading it back.

```python
from nacl.encoding import HexEncoder
from nacl.signing import SigningKey, VerifyKey

signing_key = SigningKey.generate()
verify_key = signing_key.verify_key

signing_key_hex = signing_key.encode(encoder=HexEncoder).decode("ascii")
verify_key_hex = verify_key.encode(encoder=HexEncoder).decode("ascii")

loaded_signing_key = SigningKey(signing_key_hex.encode("ascii"), encoder=HexEncoder)
loaded_verify_key = VerifyKey(verify_key_hex.encode("ascii"), encoder=HexEncoder)
```

For public-key encryption, generate a `PrivateKey` and keep its `public_key` for peers:

```python
from nacl.public import PrivateKey

private_key = PrivateKey.generate()
public_key = private_key.public_key
```

## Sign And Verify Messages

`SigningKey.sign()` returns a `SignedMessage` that contains the combined signed payload plus `.signature` and `.message` helpers.

```python
from nacl import exceptions
from nacl.signing import SigningKey

signing_key = SigningKey.generate()
verify_key = signing_key.verify_key

message = b"important payload"
signed = signing_key.sign(message)

assert signed.message == message
assert verify_key.verify(signed) == message
assert verify_key.verify(message, signed.signature) == message

try:
    verify_key.verify(message, b"\x00" * len(signed.signature))
except exceptions.BadSignatureError:
    print("signature check failed")
```

## Encrypt With A Shared Secret

Use `SecretBox` when both sides already share the same secret key.

```python
from nacl import utils
from nacl.secret import SecretBox

key = utils.random(SecretBox.KEY_SIZE)
box = SecretBox(key)

message = b"encrypt this"
encrypted = box.encrypt(message)

print(encrypted.nonce)
print(encrypted.ciphertext)

plaintext = box.decrypt(encrypted)
assert plaintext == message
```

`SecretBox.encrypt()` prepends the nonce to the returned value, so `box.decrypt(encrypted)` works without passing the nonce separately.

## Encrypt With Associated Data

Use `Aead` when you need to authenticate extra unencrypted metadata, such as a record ID or protocol header.

```python
from nacl import utils
from nacl.secret import Aead

key = utils.random(Aead.KEY_SIZE)
box = Aead(key)

message = b"ciphertext body"
aad = b"order:1234"

encrypted = box.encrypt(message, aad=aad)
plaintext = box.decrypt(encrypted, aad=aad)

assert plaintext == message
```

The same `aad` must be supplied on decrypt or PyNaCl raises `nacl.exceptions.CryptoError`.

## Encrypt Between Peers

Use `Box` when both peers have long-lived keypairs.

```python
from nacl.public import Box, PrivateKey

alice_private = PrivateKey.generate()
bob_private = PrivateKey.generate()

alice_box = Box(alice_private, bob_private.public_key)
bob_box = Box(bob_private, alice_private.public_key)

ciphertext = alice_box.encrypt(b"hello bob")
plaintext = bob_box.decrypt(ciphertext)

assert plaintext == b"hello bob"
```

Use `SealedBox` for one-way encryption to a recipient public key:

```python
from nacl.public import PrivateKey, SealedBox

recipient_private = PrivateKey.generate()
recipient_public = recipient_private.public_key

sender_box = SealedBox(recipient_public)
recipient_box = SealedBox(recipient_private)

sealed = sender_box.encrypt(b"hello")
plaintext = recipient_box.decrypt(sealed)

assert plaintext == b"hello"
```

`SealedBox(recipient_public)` can encrypt only. To decrypt, build the `SealedBox` with the recipient `PrivateKey`.

## Password Hashing And Key Derivation

Use `pwhash.str()` to store a password hash. Use `pwhash.verify()` to check a candidate password.

```python
from nacl import pwhash

password = b"correct horse battery staple"

password_hash = pwhash.str(password)
assert pwhash.verify(password_hash, password) is True
```

When you need a fixed-size key from a password, use `nacl.pwhash.argon2id.kdf()` with a random salt:

```python
from nacl import utils
from nacl.pwhash import argon2id

password = b"correct horse battery staple"
salt = utils.random(argon2id.SALTBYTES)

key = argon2id.kdf(
    size=32,
    password=password,
    salt=salt,
    opslimit=argon2id.OPSLIMIT_MODERATE,
    memlimit=argon2id.MEMLIMIT_MODERATE,
)
```

## Common Pitfalls

- Do not pass Python `str` objects directly; encode to `bytes` first.
- Do not reuse a nonce with the same key for `SecretBox`, `Aead`, or `Box` if you supply nonces manually.
- Catch `nacl.exceptions.BadSignatureError` for invalid signatures and `nacl.exceptions.CryptoError` for failed decrypt/auth checks.
- Keep `SigningKey` seeds, `PrivateKey` values, and symmetric keys secret; they are raw key material, not opaque handles.
- `SecretBox` and `Aead` both use 32-byte keys, but only `Aead` accepts `aad`.
- Serialize keys with an explicit encoder such as `HexEncoder`; re-create the object with the same encoder on load.

## Version Notes For 1.6.2

- PyPI metadata for `1.6.2` declares `Requires-Python: >=3.8`.
- The package metadata publishes a docs extra with Sphinx dependencies and keeps the canonical documentation at `https://pynacl.readthedocs.io`.
- This guide targets the `1.6.2` API surface exposed by the `nacl` package modules in that release.
