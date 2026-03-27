---
name: package
description: "pyasn1-modules package guide for Python projects that decode and encode RFC-based ASN.1 structures with pyasn1"
metadata:
  languages: "python"
  versions: "0.4.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "pyasn1-modules,pyasn1,asn1,x509,cms,ldap,snmp"
---

# pyasn1-modules Python Package Guide

## Golden Rule

Use `pyasn1-modules` for prebuilt ASN.1 schema definitions, and use `pyasn1` codecs to decode or encode bytes against those schemas.

This package does not create network clients, manage certificates, or validate trust chains for you. It gives you Python classes for standards-based ASN.1 structures such as X.509, CMS, LDAP, SNMP, and PKCS so you can parse or build those payloads correctly.

## Install

`pyasn1-modules 0.4.2` requires Python 3.8 or newer. The maintainer `pyproject.toml` declares `pyasn1>=0.6.1,<0.7.0`.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "pyasn1-modules==0.4.2"
```

If you pin both packages explicitly:

```bash
python -m pip install "pyasn1-modules==0.4.2" "pyasn1>=0.6.1,<0.7.0"
```

There are no environment variables, credentials, or client initialization steps. Usage starts with imports.

## Imports

```python
from pyasn1.codec.der.decoder import decode as der_decode
from pyasn1.codec.der.encoder import encode as der_encode
from pyasn1.codec.native.encoder import encode as to_native
from pyasn1_modules import pem, rfc5280
```

`pyasn1-modules` ships many RFC-specific modules. The maintainer repository includes modules such as `rfc2251.py`, `rfc5280.py`, `rfc5652.py`, `rfc5958.py`, and `rfc7030.py`. Import the RFC module that matches the payload you are working with, then pass its top-level ASN.1 type to a `pyasn1` codec.

## Decode A PEM Certificate

The package includes `pyasn1_modules.pem` helpers for PEM and base64 inputs. `readPemFromFile()` returns DER bytes for the first matching PEM block in a text file.

```python
from pyasn1.codec.der.decoder import decode as der_decode
from pyasn1.codec.native.encoder import encode as to_native
from pyasn1_modules import pem, rfc5280

with open("certificate.pem", "r", encoding="ascii") as fh:
    der_bytes = pem.readPemFromFile(fh)

certificate, rest = der_decode(
    der_bytes,
    asn1Spec=rfc5280.Certificate(),
)

if rest:
    raise ValueError(f"Unexpected trailing bytes: {len(rest)}")

native_certificate = to_native(certificate)

print(native_certificate["tbsCertificate"]["serialNumber"])
print(native_certificate["tbsCertificate"]["issuer"])
print(native_certificate["tbsCertificate"]["subject"])
```

Use this pattern whenever you already know which ASN.1 structure the bytes should contain:

1. Read PEM or DER bytes.
2. Import the matching RFC module from `pyasn1_modules`.
3. Pass `asn1Spec=...` to the decoder.
4. Check `rest` so you do not silently ignore trailing data.

## Read Specific PEM Block Types

`readPemBlocksFromFile()` is useful when one file can contain different block types and you need to choose which one you got back.

```python
from pyasn1_modules import pem

markers = (
    ("-----BEGIN CERTIFICATE-----", "-----END CERTIFICATE-----"),
    ("-----BEGIN PKCS7-----", "-----END PKCS7-----"),
)

with open("bundle.pem", "r", encoding="ascii") as fh:
    marker_index, substrate = pem.readPemBlocksFromFile(fh, *markers)

if marker_index == 0:
    print("Decoded a certificate block")
elif marker_index == 1:
    print("Decoded a PKCS7 block")
else:
    raise ValueError("No supported PEM block found")
```

For base64 text that is not wrapped in PEM markers, `pem.readBase64fromText()` and `pem.readBase64FromFile()` return decoded bytes you can feed into BER, CER, or DER decoders.

## Re-Encode A Parsed Object

Once you have a typed ASN.1 object, re-encode it with the matching codec:

```python
from pyasn1.codec.der.decoder import decode as der_decode
from pyasn1.codec.der.encoder import encode as der_encode
from pyasn1_modules import pem, rfc5280

with open("certificate.pem", "r", encoding="ascii") as fh:
    original_der = pem.readPemFromFile(fh)

certificate, rest = der_decode(original_der, asn1Spec=rfc5280.Certificate())
if rest:
    raise ValueError("Unexpected trailing bytes")

encoded_der = der_encode(certificate)

assert encoded_der == original_der
```

Use BER codecs for BER payloads and DER codecs for DER payloads. `pyasn1-modules` gives you the schema objects; the wire-format codec still comes from `pyasn1`.

## Generating Missing RFC Modules

The maintainer README describes `pyasn1-modules` as a collection of precompiled ASN.1 modules and points to `asn1ate` if the RFC or schema you need is not already included. Use that path when you have ASN.1 syntax for a standard or private schema that `pyasn1-modules` does not ship.

## Common Pitfalls

- Do not treat `pyasn1-modules` as a certificate or CMS validation library. It parses structures; it does not verify signatures, trust stores, revocation, or application-level policy.
- Open PEM inputs in text mode. The package PEM helpers read lines and strip marker text before base64-decoding.
- Always pass `asn1Spec=` to the decoder when you know the expected structure. Without it, `pyasn1` will decode into generic ASN.1 objects that are harder to work with correctly.
- Always inspect the decoder `rest` value. Non-empty trailing bytes usually mean you decoded the wrong top-level type or only part of the payload.
- Keep `pyasn1` compatible with the maintainer pin. For `pyasn1-modules 0.4.2`, the upstream project declares `pyasn1>=0.6.1,<0.7.0`.

## Version Notes For 0.4.2

- PyPI currently lists `0.4.2` as the package version for `pyasn1-modules`.
- The maintainer `pyproject.toml` for the current main branch also uses version `0.4.2`.
- If your project is pinned to an older `pyasn1-modules` release, confirm the paired `pyasn1` range before copying examples from newer docs.

## Official Sources

- PyPI package page: https://pypi.org/project/pyasn1-modules/
- Maintainer repository: https://github.com/pyasn1/pyasn1-modules
- Maintainer README: https://github.com/pyasn1/pyasn1-modules/blob/main/README.md
- Maintainer `pyproject.toml`: https://github.com/pyasn1/pyasn1-modules/blob/main/pyproject.toml
- Maintainer `pem.py`: https://github.com/pyasn1/pyasn1-modules/blob/main/pyasn1_modules/pem.py
- pyasn1 codec documentation: https://pyasn1.readthedocs.io/en/stable/pyasn1/codec/der/contents.html
- pyasn1 native codec documentation: https://pyasn1.readthedocs.io/en/stable/pyasn1/codec/native/contents.html
