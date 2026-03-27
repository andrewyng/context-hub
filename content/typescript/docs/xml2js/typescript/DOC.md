---
name: xml2js
description: "TypeScript declarations for the xml2js XML parser and builder, including CommonJS imports, parser options, built-in processors, and the typed boundary around parsed results."
metadata:
  languages: "typescript"
  versions: "0.4.14"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,xml2js,xml,parsing,builder,npm,types,definitelytyped"
---

# xml2js TypeScript Guide

`@types/xml2js` provides the TypeScript declarations for the `xml2js` runtime package.

Use it when your application parses XML into JavaScript objects or builds XML from plain objects in TypeScript. The type package only supplies declarations. It does not install the `xml2js` runtime.

## Install

Install the runtime and the declarations together:

```bash
npm install xml2js
npm install --save-dev typescript @types/xml2js
```

No environment variables, credentials, or client initialization are required.

## Import `xml2js` In TypeScript

The runtime is CommonJS-based. The declaration-matching import style is:

```ts
import xml2js = require("xml2js");
```

Import from `"xml2js"`, not from `"@types/xml2js"`.

## Parse XML At A Typed Boundary

The parser does not infer your XML schema. Parsed results need an application-defined type at the boundary where XML becomes domain data.

```ts
import xml2js = require("xml2js");

type Catalog = {
  catalog: {
    book: {
      $: { id: string };
      title: string;
      price: number;
      available: boolean;
    };
  };
};

function parseXml<T>(xml: string, options?: xml2js.ParserOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, options ?? {}, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result as T);
    });
  });
}

const xml = `
  <catalog>
    <book id="bk101">
      <title>XML Developer's Guide</title>
      <price>44.95</price>
      <available>true</available>
    </book>
  </catalog>
`;

async function main() {
  const result = await parseXml<Catalog>(xml, {
    explicitArray: false,
    trim: true,
    valueProcessors: [
      xml2js.processors.parseNumbers,
      xml2js.processors.parseBooleans,
    ],
  });

  console.log(result.catalog.book.$.id);
  console.log(result.catalog.book.price.toFixed(2));
}

void main();
```

Practical notes:

- `explicitArray` is `true` by default, so repeated or singular elements normally come back as arrays unless you set `explicitArray: false`.
- Attributes are stored under `$` by default.
- Character data is stored under `_` by default when it needs its own property.
- Built-in processors such as `parseNumbers` and `parseBooleans` help convert XML text before you use it in app code.

## Normalize Names And Values During Parse

`xml2js.processors` exposes small helpers you can compose into parser options.

```ts
import xml2js = require("xml2js");

const parserOptions: xml2js.ParserOptions = {
  explicitArray: false,
  tagNameProcessors: [xml2js.processors.stripPrefix],
  valueProcessors: [xml2js.processors.parseNumbers],
  attrValueProcessors: [xml2js.processors.parseBooleans],
};

xml2js.parseString(
  `
    <ns:feed enabled="true">
      <ns:item>
        <ns:id>42</ns:id>
      </ns:item>
    </ns:feed>
  `,
  parserOptions,
  (error, result) => {
    if (error) {
      throw error;
    }

    console.log(result.feed.$.enabled);
    console.log(result.feed.item.id);
  }
);
```

The built-in processor helpers are:

- `xml2js.processors.normalize`
- `xml2js.processors.firstCharLowerCase`
- `xml2js.processors.stripPrefix`
- `xml2js.processors.parseNumbers`
- `xml2js.processors.parseBooleans`

## Reuse Shared Parser Options With `Parser`

If your application parses many documents with the same settings, create a `Parser` instance with typed options.

```ts
import xml2js = require("xml2js");

const parser = new xml2js.Parser({
  explicitArray: false,
  trim: true,
  ignoreAttrs: false,
});

parser.parseString("<response><status>ok</status></response>", (error, result) => {
  if (error) {
    throw error;
  }

  console.log(result.response.status);
});
```

Use the top-level `parseString()` helper when you only need a one-off parse. Use `new Parser(...)` when you want to keep one shared option set in a reusable object.

## Build XML From Plain Objects

`xml2js` also includes a `Builder` class for turning plain objects into XML strings.

```ts
import xml2js = require("xml2js");

const builder = new xml2js.Builder({
  headless: true,
  rootName: "catalog",
  renderOpts: {
    pretty: true,
    indent: "  ",
    newline: "\n",
  },
});

const xml = builder.buildObject({
  book: {
    $: { id: "bk101", available: "true" },
    title: "XML Developer's Guide",
    price: "44.95",
  },
});

console.log(xml);
```

The builder uses the same default structural keys as the parser:

- `$` for attributes
- `_` for character content

If you customize `attrkey` or `charkey` in parser or builder options, keep the object shape consistent on both sides.

## Common Pitfalls

- Install `xml2js` as well as `@types/xml2js`; the type package does not include runtime code.
- Import from `"xml2js"`, not from `"@types/xml2js"`.
- Treat parsed output as an untyped boundary. The declarations do not infer your XML schema for you.
- `explicitArray` defaults to `true`, which changes property shapes unless you set it explicitly.
- Default parsed attributes live under `$`, and text content can live under `_`.
- Builder input uses the same `$` and `_` conventions.

## Version-Sensitive Notes

- This guide targets `@types/xml2js==0.4.14`.
- These declarations are for the `xml2js` runtime package and are not a standalone parser.

## Official Sources

- https://www.npmjs.com/package/@types/xml2js
- https://www.npmjs.com/package/xml2js
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/xml2js
- https://github.com/Leonidas-from-XIV/node-xml2js
