---
name: package
description: "python-slugify for turning Unicode text into predictable slugs in Python"
metadata:
  languages: "python"
  versions: "8.0.4"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python-slugify,slugify,unicode,transliteration,urls,text-processing"
---

# python-slugify Python Package Guide

## What It Does

`python-slugify` converts arbitrary text into slug strings you can use in URLs, filenames, and human-readable identifiers.

The default behavior lowercases the text, transliterates Unicode characters to ASCII, removes disallowed characters, and joins words with `-`.

This guide covers `8.0.4`.

## Install

Pin the version your application expects:

```bash
python -m pip install "python-slugify==8.0.4"
```

Common alternatives:

```bash
uv add "python-slugify==8.0.4"
poetry add "python-slugify==8.0.4"
```

The project documents `text-unidecode` as the default transliteration dependency. If you want the alternative `Unidecode` backend documented by the maintainer, install the extra:

```bash
python -m pip install "python-slugify[unidecode]==8.0.4"
```

## Initialize

There is no client object, auth flow, service endpoint, or environment-variable setup.

Import the top-level helper:

```python
from slugify import slugify
```

## Common Workflows

### Generate a basic slug

```python
from slugify import slugify

title = "This is a test ---"
slug = slugify(title)

print(slug)
```

Use this default path when you want lowercase ASCII output with hyphens.

### Keep Unicode characters in the result

By default, non-ASCII text is transliterated. Pass `allow_unicode=True` if you want the slug to keep Unicode characters:

```python
from slugify import slugify

ascii_slug = slugify("影師嗎")
unicode_slug = slugify("影師嗎", allow_unicode=True)
```

This matters for routes and persisted slugs. Decide early whether your application wants ASCII-only slugs or Unicode-preserving slugs, then keep that choice consistent.

### Change the separator

Use `separator` when your application wants underscores or another delimiter:

```python
from slugify import slugify

slug = slugify("C'est déjà l'été.", separator="_")
```

### Apply custom replacements before slug generation

`replacements` lets you map symbols or substrings before normalization:

```python
from slugify import slugify

slug = slugify(
    "10 | 20 %",
    replacements=[["|", "or"], ["%", "percent"]],
)
```

Use replacements for domain-specific tokens such as `%`, `&`, or abbreviations that should expand predictably.

### Remove stopwords

Use `stopwords` to drop filler words from the output:

```python
from slugify import slugify

slug = slugify(
    "the quick brown fox jumps over the lazy dog",
    stopwords=["the"],
)
```

### Limit slug length without cutting words arbitrarily

`max_length` truncates the slug. Add `word_boundary=True` if you want truncation to respect word boundaries:

```python
from slugify import slugify

slug = slugify(
    "the quick brown fox jumps over the lazy dog",
    max_length=24,
    word_boundary=True,
)
```

If you also pass `save_order=True`, the package keeps earlier words in their original order while fitting the slug into the requested length:

```python
from slugify import slugify

slug = slugify(
    "the quick brown fox jumps over the lazy dog",
    max_length=24,
    word_boundary=True,
    save_order=True,
)
```

### Control case and allowed characters

Use `lowercase=False` to preserve case, or `regex_pattern` to override what characters survive normalization:

```python
from slugify import slugify

slug = slugify("Build API v2", lowercase=False)

custom = slugify(
    "api_v2 release",
    regex_pattern=r"[^-a-zA-Z0-9_]+",
    lowercase=False,
)
```

Reach for `regex_pattern` only when your allowed-character set is truly different from the default. It changes the cleanup rules for the whole slug.

### Handle HTML entities and numeric references

The function exposes flags for entity and numeric reference decoding. The default path is usually what you want for user-visible titles that may already contain HTML entity text:

```python
from slugify import slugify

decoded = slugify("Jack &amp; Jill")
literal = slugify("Jack &amp; Jill", entities=False)
```

Related flags are:

- `entities`
- `decimal`
- `hexadecimal`

Disable them only if you need to preserve the literal input before slug cleanup.

## Configuration And Auth

There is no global configuration file, environment-variable contract, or authentication layer.

In practice, your configuration surface is the `slugify()` call itself:

- `allow_unicode` controls ASCII transliteration vs Unicode-preserving output
- `separator` controls the delimiter in the final slug
- `max_length`, `word_boundary`, and `save_order` control truncation behavior
- `stopwords`, `replacements`, and `regex_pattern` tailor normalization for your domain
- `lowercase` controls case folding

If slug stability matters, keep these options centralized in one helper function instead of scattering different combinations across the codebase.

## Common Pitfalls

- `python-slugify` does not guarantee uniqueness. If slugs back database rows or routes, add your own uniqueness check or suffixing strategy.
- Changing `allow_unicode`, `separator`, `lowercase`, or the transliteration backend after you have persisted slugs can break links and cache keys.
- `max_length` alone can cut a slug in the middle of a word; pair it with `word_boundary=True` when human readability matters.
- `regex_pattern` is powerful but easy to misuse. A permissive pattern can keep characters your routes, storage layer, or downstream systems do not expect.
- Different transliteration backends can produce different ASCII output for the same input text. Pin the backend choice if slug values are part of your public interface.
- Slugification is not semantic normalization. Do not use slugs as the only canonical copy of important text.

## Version-Sensitive Notes

- This guide targets `python-slugify==8.0.4`.
- The maintainer docs for this package are the repository README and PyPI project page rather than a separate API reference site.
- The project documents both the default `text-unidecode` path and an optional `unidecode` extra, which can affect transliteration results.

## Official Links

- Repository: `https://github.com/un33k/python-slugify`
- PyPI: `https://pypi.org/project/python-slugify/`
