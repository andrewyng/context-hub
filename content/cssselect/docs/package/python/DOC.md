---
name: package
description: "cssselect package guide for translating CSS selectors into XPath 1.0 expressions in Python"
metadata:
  languages: "python"
  versions: "1.4.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "cssselect,python,css,xpath,selectors,html,xml"
---

# cssselect Python Package Guide

## Golden Rule

`cssselect` does not query documents by itself. It parses CSS selector strings and translates them to XPath 1.0 expressions that you execute in another library such as `lxml` or any XML/HTML engine that already supports XPath.

## Install

Pin the package version your project expects:

```bash
python -m pip install "cssselect==1.4.0"
```

Common alternatives:

```bash
uv add "cssselect==1.4.0"
poetry add "cssselect==1.4.0"
```

If you want to run the generated XPath against parsed HTML or XML, install an XPath-capable library too:

```bash
python -m pip install "lxml>=5" "cssselect==1.4.0"
```

## Initialization

`cssselect` is a local Python library. It does not require authentication, API keys, environment variables, or client configuration.

Import the translator and the exception types you plan to handle:

```python
from cssselect import (
    ExpressionError,
    GenericTranslator,
    HTMLTranslator,
    SelectorError,
    SelectorSyntaxError,
    parse,
)
```

Use `GenericTranslator` for generic XML-style documents and `HTMLTranslator` when you want HTML-specific selector behavior.

## Common Workflows

### Translate a CSS selector to XPath

Use `css_to_xpath()` when your input is a selector string.

```python
from cssselect import GenericTranslator

translator = GenericTranslator()
xpath = translator.css_to_xpath("div.content > a[href]")

print(xpath)
```

`css_to_xpath()` returns an XPath string. If the CSS contains a selector group such as `"div.content, aside.notice"`, the generated XPath uses a union expression.

### Execute the XPath with `lxml`

`cssselect` only performs the translation step. Use an XPath engine to get actual elements.

```python
from lxml import html
from cssselect import GenericTranslator

markup = """
<html>
  <body>
    <div class="content">
      <a href="/docs">Docs</a>
      <a>No href</a>
    </div>
  </body>
</html>
"""

document = html.fromstring(markup)
xpath = GenericTranslator().css_to_xpath("div.content > a[href]")
links = document.xpath(xpath)

for link in links:
    print(link.get("href"))
```

If you already use `lxml`'s CSS helper APIs such as `document.cssselect(...)`, keep `cssselect` installed because `lxml` uses it for CSS-to-XPath translation.

### Use `HTMLTranslator` for HTML-specific selectors

For HTML documents, prefer `HTMLTranslator()` when you rely on HTML semantics or HTML-only pseudo-classes.

```python
from cssselect import HTMLTranslator

translator = HTMLTranslator()
xpath = translator.css_to_xpath("input:checked")

print(xpath)
```

For XML documents that are not HTML, use `GenericTranslator()` instead.

### Parse selectors before translating them

Use `parse()` when you need structured selector objects or when you want to translate one parsed selector at a time.

```python
from cssselect import GenericTranslator, parse

selectors = parse("article.featured > h2.title, article.featured > p.summary")
translator = GenericTranslator()

for selector in selectors:
    xpath = translator.selector_to_xpath(selector)
    print(xpath)
```

This is useful when your application accepts user-provided selector lists and you want to inspect or translate each selector individually.

### Catch invalid or unsupported selectors

Handle selector problems explicitly so bad input does not fail deep inside your document-processing code.

```python
from cssselect import ExpressionError, GenericTranslator, SelectorSyntaxError

translator = GenericTranslator()

try:
    xpath = translator.css_to_xpath("div >> a")
except SelectorSyntaxError as exc:
    raise ValueError(f"Invalid CSS selector syntax: {exc}") from exc
except ExpressionError as exc:
    raise ValueError(f"Unsupported selector for XPath translation: {exc}") from exc
```

Use `SelectorError` if you want one catch-all base exception for both syntax and translation failures.

### Evaluate selectors against namespaced XML

`cssselect` keeps namespace prefixes in the generated XPath. Pass the actual namespace mapping to your XPath engine when you evaluate the result.

```python
from lxml import etree
from cssselect import GenericTranslator

xml = b"""
<root xmlns:svg="http://www.w3.org/2000/svg">
  <svg:svg>
    <svg:a href="/diagram" />
  </svg:svg>
</root>
"""

document = etree.fromstring(xml)
xpath = GenericTranslator().css_to_xpath("svg|a")
matches = document.xpath(xpath, namespaces={"svg": "http://www.w3.org/2000/svg"})

print(len(matches))
```

## Important Pitfalls

- `cssselect` translates selectors to XPath 1.0. It is not a browser selector engine and it does not implement every modern CSS selector.
- Use `HTMLTranslator` for HTML documents and `GenericTranslator` for generic XML. Translating HTML selectors with the generic translator can miss HTML-specific behavior.
- The library returns XPath strings, not matched nodes. You still need an XPath-capable parser or DOM library to execute the query.
- Invalid selector syntax raises `SelectorSyntaxError`. Selectors that parse but cannot be translated raise `ExpressionError`.
- Namespace prefixes are resolved when the XPath runs, not when `cssselect` generates the XPath.

## Version Notes For `1.4.0`

This guide targets `cssselect` version `1.4.0`.

When you upgrade, keep the package version pinned until you confirm that your selector set still translates to the XPath you expect, especially if your application depends on specific pseudo-classes or XML namespace handling.
