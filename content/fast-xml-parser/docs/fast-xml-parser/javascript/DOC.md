---
name: fast-xml-parser
description: "Parse, validate, and build XML in JavaScript or TypeScript with fast-xml-parser"
metadata:
  languages: "javascript"
  versions: "5.5.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "fast-xml-parser,xml,javascript,typescript,parser,builder,validation"
---

# fast-xml-parser for JavaScript / TypeScript

`fast-xml-parser` is a pure JavaScript package for three related jobs:

- parse XML into JavaScript objects with `XMLParser`
- validate XML syntax with `XMLValidator`
- build XML from JavaScript objects with `XMLBuilder`

It works in both ESM and CommonJS projects and ships its own TypeScript declarations.

## Install

```bash
npm install fast-xml-parser
```

The package already includes its own type definitions, so you do not need `@types/fast-xml-parser`.

## Imports and initialization

No environment variables, credentials, or service setup are required.

### ESM / TypeScript

```ts
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";

const parser = new XMLParser();
const builder = new XMLBuilder();
```

### CommonJS

```js
const { XMLBuilder, XMLParser, XMLValidator } = require("fast-xml-parser");

const parser = new XMLParser();
const builder = new XMLBuilder();
```

## Parse XML

The most important parser default is that attributes are ignored unless you opt in with `ignoreAttributes: false`.

```ts
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
});

const xml = `
<catalog version="1">
  <book id="bk-1">
    <title>XML Guide</title>
    <price currency="USD">19.99</price>
  </book>
</catalog>`;

const result = parser.parse(xml);

console.log(result.catalog["@_version"]); // "1"
console.log(result.catalog.book["@_id"]); // "bk-1"
console.log(result.catalog.book.price); // 19.99
```

Default parsing behavior that commonly surprises people:

- `ignoreAttributes` defaults to `true`
- `attributeNamePrefix` defaults to `"@_"`
- `textNodeName` defaults to `"#text"`
- `parseTagValue` defaults to `true`, so numeric-looking tag text becomes numbers
- `parseAttributeValue` defaults to `false`, so attributes stay strings unless you enable it

If you want numeric attribute values too, enable `parseAttributeValue`:

```ts
const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
});

const result = parser.parse(`<item qty="2">10</item>`);

console.log(result.item["@_qty"]); // 2
console.log(result.item); // { "#text": 10, "@_qty": 2 }
```

## Validate XML before parsing

`XMLValidator.validate()` checks XML syntax and returns either `true` or an error object with `code`, `msg`, `line`, and `col`.

```ts
import { XMLValidator } from "fast-xml-parser";

const validation = XMLValidator.validate("<root>");

if (validation !== true) {
  throw new Error(`${validation.err.msg} at ${validation.err.line}:${validation.err.col}`);
}
```

For XML-like or HTML-like input, pass validator options when you need boolean attributes or unpaired tags:

```ts
const validation = XMLValidator.validate("<input disabled>", {
  allowBooleanAttributes: true,
  unpairedTags: ["input", "br", "img"],
});
```

You can also ask `XMLParser` to validate inline. Invalid XML throws an error before parsing:

```ts
const parser = new XMLParser({ ignoreAttributes: false });

const result = parser.parse(xml, {
  allowBooleanAttributes: true,
  unpairedTags: ["input", "br", "img"],
});
```

Use the validator for syntax checks only. If you need schema or business-rule validation, handle that separately.

## Common parser workflows

### Keep array shapes stable

Repeated XML elements become arrays automatically, but single elements do not. Use `isArray` when your application needs a stable array shape.

```ts
const parser = new XMLParser({
  isArray: (tagName, jPath) => jPath === "feed.entry",
});

const result = parser.parse(`
<feed>
  <entry><title>First</title></entry>
</feed>`);

console.log(Array.isArray(result.feed.entry)); // true
```

### Strip namespace prefixes

Use `removeNSPrefix: true` when you want `ns:item` to become `item` in the parsed output.

```ts
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

const result = parser.parse(`
<ns:feed xmlns:ns="urn:example">
  <ns:item ns:id="1">hello</ns:item>
</ns:feed>`);

console.log(result.feed.item["#text"]); // "hello"
console.log(result.feed.item["@_id"]); // "1"
```

### Preserve raw inner content for specific nodes

Use `stopNodes` for tags whose contents should stay as raw text instead of being parsed as nested XML. This is useful for embedded HTML, script blocks, or template fragments.

```ts
const parser = new XMLParser({
  ignoreAttributes: false,
  stopNodes: ["page.script", "page.template"],
});

const result = parser.parse(`
<page>
  <script><![CDATA[if (a < b) { render(); }]]></script>
</page>`);

console.log(result.page.script); // "<![CDATA[if (a < b) { render(); }]]>"
```

### Add custom entities

If your input uses entities that are not built in, register them on the parser before calling `parse()`:

```ts
const parser = new XMLParser();

parser.addEntity("company", "OpenAI");

const result = parser.parse("<root>&company;</root>");

console.log(result.root); // "OpenAI"
```

## Build XML from JavaScript objects

When building XML, attributes use the same `@_` prefix by default and text values use `#text` when the same element also has attributes or child nodes.

```ts
import { XMLBuilder } from "fast-xml-parser";

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
});

const data = {
  catalog: {
    "@_version": "1",
    book: [
      {
        "@_id": "bk-1",
        title: "XML Guide",
        price: {
          "@_currency": "USD",
          "#text": 19.99,
        },
      },
    ],
  },
};

const xml = builder.build(data);

console.log(xml);
```

If you customize parser naming options such as `attributeNamePrefix`, `textNodeName`, or `attributesGroupName`, use the same settings in `XMLBuilder` when you need predictable round-tripping.

## TypeScript notes

The package exports its own typings, so TypeScript projects can use the library directly:

```ts
import { XMLValidator, type ValidationError } from "fast-xml-parser";

const validation = XMLValidator.validate("<root>");

if (validation !== true) {
  const err: ValidationError = validation;
  console.error(err.err.msg);
}
```

For source-location metadata, enable `captureMetaData`. Metadata is attached with the symbol returned by `XMLParser.getMetaDataSymbol()`.

```ts
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  captureMetaData: true,
  ignoreAttributes: false,
  alwaysCreateTextNode: true,
});

const result = parser.parse(`<root><child id="1">value</child></root>`);
const metaKey = XMLParser.getMetaDataSymbol();

console.log(result.root[metaKey]?.startIndex); // 0
console.log(result.root.child[metaKey]?.startIndex); // 6
```

## Important pitfalls

- Attributes disappear unless you set `ignoreAttributes: false`.
- Tag text is parsed by default, so values like `19.99`, `true`, or `001` may not stay strings.
- Attribute values stay strings unless you set `parseAttributeValue: true`.
- `preserveOrder: true` changes the output to an ordered array-based structure; do not enable it unless your code is written for that shape.
- If you change `attributeNamePrefix` or `textNodeName`, keep parser and builder options aligned.
- The package still exposes a built-in `fxparser` command, but the bundled CLI is deprecated. Use `fxp-cli` if you need a maintained CLI workflow.
