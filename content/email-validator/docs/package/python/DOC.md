---
name: package
description: "Python library for validating and normalizing email addresses, with optional DNS deliverability checks and internationalized email support"
metadata:
  languages: "python"
  versions: "2.3.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python,email,validation,dns,unicode"
---

# email-validator for Python

`email-validator` validates email address syntax, returns a normalized address you should store, and can optionally check whether the domain can receive mail. It is a local Python library, not a hosted service, so there is no API key, account setup, or client object.

## Install

```bash
python -m pip install email-validator
```

Requirements:

- Python 3.8+
- Working DNS access if you keep `check_deliverability=True` (the default)

## Imports And Setup

For normal application code, import the validator functions and call them directly.

```python
from email_validator import EmailNotValidError, validate_email
```

There is no client initialization step and no package-specific environment variable for normal library use.

If you want process-wide defaults, the module exposes globals such as `email_validator.CHECK_DELIVERABILITY` and `email_validator.TEST_ENVIRONMENT`, but passing explicit keyword arguments per call is usually clearer.

## Validate On Account Creation

For sign-up flows, keep deliverability checks enabled so obviously bad domains are rejected before you create the user.

```python
from email_validator import EmailNotValidError, validate_email


def normalize_signup_email(raw_email: str) -> str:
    try:
        info = validate_email(raw_email, check_deliverability=True)
    except EmailNotValidError as exc:
        raise ValueError(str(exc)) from exc

    return info.normalized
```

Store `info.normalized`, not the original input. The library normalizes Unicode and quoted forms and lowercases the domain.

When a deliverability check succeeds, the returned `ValidatedEmail` object may also include:

- `info.mx`: MX records as `(priority, host)` tuples
- `info.mx_fallback_type`: `"A"` or `"AAAA"` when the domain has no MX record and falls back to address records

## Validate On Login Or Repeated Checks

For login forms or repeated re-validation, skip DNS lookups and use syntax plus normalization only.

```python
from email_validator import EmailNotValidError, validate_email


def normalize_login_email(raw_email: str) -> str:
    try:
        info = validate_email(raw_email, check_deliverability=False)
    except EmailNotValidError as exc:
        raise ValueError("Enter a valid email address.") from exc

    return info.normalized
```

This avoids an external DNS lookup on every login attempt while still enforcing the library's syntax and normalization rules.

## Reuse A DNS Resolver

When validating many addresses, reuse a resolver so dnspython can cache answers and so you can control the timeout in one place.

```python
from email_validator import EmailNotValidError, caching_resolver, validate_email

resolver = caching_resolver(timeout=10)


def validate_batch_email(raw_email: str) -> str:
    try:
        info = validate_email(
            raw_email,
            check_deliverability=True,
            dns_resolver=resolver,
        )
    except EmailNotValidError as exc:
        raise ValueError(str(exc)) from exc

    return info.normalized
```

Do not pass both `dns_resolver=` and `timeout=` in the same `validate_email(...)` call. The library raises `ValueError` for that combination.

## Internationalized Addresses

The library supports internationalized domain names and internationalized local parts.

```python
from email_validator import validate_email

info = validate_email("example@ツ.ⓁⒾⒻⒺ", check_deliverability=False)

print(info.normalized)   # example@ツ.life
print(info.ascii_email)  # example@xn--bdk.life
print(info.ascii_domain) # xn--bdk.life
print(info.smtputf8)     # False
```

Important behavior:

- `info.normalized` and `info.domain` use Unicode, not Punycode
- `info.ascii_domain` gives the IDNA ASCII form for wire-format needs
- If the local part contains non-ASCII characters, `info.ascii_email` is `None` and `info.smtputf8` is `True`

If your outbound mail path does not support SMTPUTF8, set `allow_smtputf8=False` so those addresses fail validation immediately.

## Display Names And Special Formats

Display names are rejected by default. Enable them only if you actually accept mailbox strings such as `My Name <me@example.org>`.

```python
from email_validator import validate_email

info = validate_email(
    "My Name <me@example.org>",
    allow_display_name=True,
    check_deliverability=False,
)

print(info.display_name)  # My Name
print(info.normalized)    # me@example.org
```

Other useful opt-in flags:

- `allow_quoted_local=True` for quoted local parts
- `allow_domain_literal=True` for addresses like `user@[127.0.0.1]`
- `allow_empty_local=True` for cases such as Postfix aliases
- `strict=True` for additional syntax checks, including local-part length checks
- `test_environment=True` to allow `test` domains and disable DNS deliverability checks

## Error Types

Catch `EmailNotValidError` for normal form handling. If you need different UI or logging for syntax versus DNS failures, catch the more specific subclasses.

```python
from email_validator import (
    EmailNotValidError,
    EmailSyntaxError,
    EmailUndeliverableError,
    validate_email,
)

try:
    validate_email("user@example.org")
except EmailSyntaxError:
    print("The address format is invalid.")
except EmailUndeliverableError:
    print("The domain cannot receive email.")
except EmailNotValidError:
    print("The address is not valid.")
```

## CLI And Environment Variables

For ad hoc checks, the package also exposes a small CLI.

```bash
python -m email_validator 'me@example.org'
printf '%s\n' 'good@example.org' 'bad@localhost' | python -m email_validator
```

Normal library usage does not read environment variables. The CLI can read uppercase option names from the environment, plus `DEFAULT_TIMEOUT`.

```bash
export DEFAULT_TIMEOUT=10
python -m email_validator 'me@example.org'
```

Prefer the Python API in application code so options stay explicit in your source.

## Common Pitfalls

- Always store and compare `info.normalized`, not the raw user input.
- Domains without a dot are rejected by default, as are special-use or reserved names such as `localhost`, `.local`, `.onion`, and `invalid`.
- `test` domains are rejected unless you set `test_environment=True`.
- `check_deliverability=True` performs DNS lookups. Use `False` on login and other hot paths.
- A DNS timeout or `NoNameservers` result is treated as unknown deliverability, not a hard failure, so validation may still succeed without `info.mx`.
- `ValidatedEmail.email` and dict-style access on the return object are deprecated. Use attributes like `info.normalized`, `info.ascii_email`, and `info.mx` instead.
- Domain literals skip deliverability checks when you allow them, so do not treat `allow_domain_literal=True` as proof that an address can receive mail.
