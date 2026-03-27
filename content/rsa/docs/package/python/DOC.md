---
name: package
description: "rsa package guide for Python projects using the archived Python-RSA 4.x API"
metadata:
  languages: "python"
  versions: "4.9.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "rsa,python,cryptography,signing,encryption,pem"
---

# rsa Python Package Guide

## Golden Rule

Use the official `rsa` package for the archived Python-RSA 4.x API, and treat it as a PKCS#1 v1.5 toolkit for key generation, encryption/decryption, and detached signatures.

This library is pure Python, has no client object, and does not read environment variables itself. You import `rsa`, then generate or load keys and call the module functions directly.

The maintainer has archived the project on PyPI and GitHub. The public docs site is still published as Python-RSA 4.8, while PyPI's latest release is `4.9.1`.

## Install

Use a virtual environment and pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "rsa==4.9.1"
```

`pip install rsa` also installs the dependency needed for loading and saving PEM or DER keys.

## Initialization

There is no SDK client to configure. Start by importing the package and either generating keys or loading existing PEM/DER files:

```python
import rsa
```

## Generate And Save Keys

`rsa.newkeys()` returns `(public_key, private_key)`. The docs note that larger keys take much longer to generate; if key generation is too slow, the maintainer recommends generating keys with OpenSSL and then loading them in Python.

```python
import rsa

public_key, private_key = rsa.newkeys(2048)

with open("public.pem", "wb") as public_file:
    public_file.write(public_key.save_pkcs1("PEM"))

with open("private.pem", "wb") as private_file:
    private_file.write(private_key.save_pkcs1("PEM"))
```

To load keys back from disk:

```python
import rsa

with open("public.pem", "rb") as public_file:
    public_key = rsa.PublicKey.load_pkcs1(public_file.read())

with open("private.pem", "rb") as private_file:
    private_key = rsa.PrivateKey.load_pkcs1(private_file.read())
```

## Encrypt And Decrypt

`rsa.encrypt()` and `rsa.decrypt()` operate on `bytes`, not Python strings. Encode text before encrypting and decode after decrypting.

```python
import rsa

with open("public.pem", "rb") as public_file:
    public_key = rsa.PublicKey.load_pkcs1(public_file.read())

with open("private.pem", "rb") as private_file:
    private_key = rsa.PrivateKey.load_pkcs1(private_file.read())

message = "hello Bob!".encode("utf-8")
ciphertext = rsa.encrypt(message, public_key)
plaintext = rsa.decrypt(ciphertext, private_key)

print(plaintext.decode("utf-8"))
```

If decryption fails, `rsa.decrypt()` raises `rsa.pkcs1.DecryptionError`. Catch that exception and return a generic failure instead of exposing a traceback:

```python
import rsa

try:
    plaintext = rsa.decrypt(ciphertext, private_key)
except rsa.pkcs1.DecryptionError:
    plaintext = None
```

## Sign And Verify

Use `rsa.sign()` for detached signatures and `rsa.verify()` to confirm the message and recover the hash name used in the signature.

```python
import rsa

message = b"ship release 2026-03-13"
signature = rsa.sign(message, private_key, "SHA-256")

hash_name = rsa.verify(message, signature, public_key)
print(hash_name)  # "SHA-256"
```

Handle signature failures with `rsa.pkcs1.VerificationError` and avoid printing the traceback:

```python
import rsa

try:
    rsa.verify(message, signature, public_key)
except rsa.pkcs1.VerificationError:
    is_valid = False
else:
    is_valid = True
```

For large files, `rsa.sign()` and `rsa.verify()` also accept file-like objects:

```python
import rsa

with open("artifact.tar.gz", "rb") as artifact:
    signature = rsa.sign(artifact, private_key, "SHA-256")

with open("artifact.tar.gz", "rb") as artifact:
    rsa.verify(artifact, signature, public_key)
```

If you need to hash elsewhere and sign later, use `rsa.compute_hash()` plus `rsa.sign_hash()`.

## OpenSSL And PKCS#8 Interop

Python-RSA stores keys as PKCS#1 PEM or DER. If you already have OpenSSL-generated material, use the documented conversion and loading paths instead of guessing at formats.

OpenSSL public keys that start with `BEGIN PUBLIC KEY` should be loaded with `load_pkcs1_openssl_pem()`:

```python
import rsa

with open("openssl-public.pem", "rb") as public_file:
    public_key = rsa.PublicKey.load_pkcs1_openssl_pem(public_file.read())
```

If you have an OpenSSL private key and want a Python-RSA-compatible public key, the maintainer docs use:

```bash
pyrsa-priv2pub -i myprivatekey.pem -o mypublickey.pem
```

PKCS#8 private keys are not loaded directly by Python-RSA. Convert them first:

```bash
openssl rsa -in privatekey-pkcs8.pem -out privatekey.pem
```

Then load the converted file with `rsa.PrivateKey.load_pkcs1(...)`.

## Common Pitfalls

- `rsa.encrypt()`, `rsa.decrypt()`, `rsa.sign()`, and `rsa.verify()` work with bytes or file-like objects, not Python text strings.
- RSA can only encrypt messages smaller than the key size minus PKCS#1 padding overhead. For larger payloads, the maintainer docs recommend hybrid encryption: encrypt the payload with a symmetric cipher such as AES, then encrypt that random symmetric key with RSA.
- Python-RSA does not implement the AES part of that hybrid flow for you.
- `VARBLOCK` helpers and `encrypt_bigfile()` / `decrypt_bigfile()` were deprecated and removed in Python-RSA 4.0. Do not build new code around them.
- The project documentation explicitly warns not to display the traceback for `DecryptionError` or `VerificationError`, because it leaks information about the key.
- The package is archived. Prefer very conservative usage and verify whether a maintained alternative is more appropriate before introducing it into a new security-sensitive system.

## Version-Sensitive Notes

- PyPI lists `rsa 4.9.1` as the latest release and marks the project as archived.
- PyPI declares Python support as `>=3.6,<4`.
- The maintainer documentation site is still published as Python-RSA 4.8. The API calls shown in this guide are taken from that maintainer documentation and the archived project metadata for the 4.x line.
- Python-RSA implements PKCS#1 v1.5 encryption and signatures. It is not an OAEP or PSS wrapper.
- The project README and PyPI page both warn that a pure-Python RSA implementation is difficult or impossible to make secure against timing attacks, so use it with care.

## Official Sources

- Maintainer docs root: https://stuvel.eu/python-rsa-doc/
- Installation: https://stuvel.eu/python-rsa-doc/installation.html
- Usage: https://stuvel.eu/python-rsa-doc/usage.html
- Compatibility and OpenSSL / PKCS#8 interop: https://stuvel.eu/python-rsa-doc/compatibility.html
- API reference: https://stuvel.eu/python-rsa-doc/reference.html
- PyPI package page: https://pypi.org/project/rsa/4.9.1/
- Archived repository: https://github.com/sybrenstuvel/python-rsa
