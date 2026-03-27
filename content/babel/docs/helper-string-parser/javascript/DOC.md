---
name: helper-string-parser
description: "Babel helper for parsing JavaScript string literal contents, numeric fragments, and Unicode escape code points"
metadata:
  languages: "javascript"
  versions: "7.27.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "babel,build,parser,strings,unicode"
---

# @babel/helper-string-parser

`@babel/helper-string-parser` is a low-level Babel utility for decoding JavaScript string literal contents and escape fragments while you keep track of parser state. In `7.27.1`, it exports three functions:

- `readStringContents(...)`
- `readInt(...)`
- `readCodePoint(...)`

Use it when you are building a tokenizer, parser, Babel extension, or codemod that already tracks the current source index. This package is not a Babel plugin and does not read Babel config files.

## Install

```bash
npm install @babel/helper-string-parser
```

The published package for `7.27.1` is CommonJS, so the examples below use `require()`.

## Prerequisites

- No environment variables, auth, or client initialization are required.
- You must pass the current `pos`, `lineStart`, and `curLine` for the source you are parsing.
- You must provide the error-handler callbacks each helper expects.

## Define shared error handlers

```javascript
const {
  readCodePoint,
  readInt,
  readStringContents,
} = require("@babel/helper-string-parser");

function syntaxError(message, pos, lineStart, curLine) {
  const column = pos - lineStart;
  throw new SyntaxError(`${message} at line ${curLine}, column ${column}`);
}

const errors = {
  unterminated(pos, lineStart, curLine) {
    syntaxError("Unterminated string", pos, lineStart, curLine);
  },
  strictNumericEscape(pos, lineStart, curLine) {
    syntaxError("Legacy numeric escape is not allowed here", pos, lineStart, curLine);
  },
  invalidEscapeSequence(pos, lineStart, curLine) {
    syntaxError("Invalid escape sequence", pos, lineStart, curLine);
  },
  invalidCodePoint(pos, lineStart, curLine) {
    syntaxError("Invalid Unicode code point", pos, lineStart, curLine);
  },
  numericSeparatorInEscapeSequence(pos, lineStart, curLine) {
    syntaxError("Numeric separator is not allowed in an escape sequence", pos, lineStart, curLine);
  },
  unexpectedNumericSeparator(pos, lineStart, curLine) {
    syntaxError("Unexpected numeric separator", pos, lineStart, curLine);
  },
  invalidDigit(pos, lineStart, curLine, radix) {
    syntaxError(`Invalid base-${radix} digit`, pos, lineStart, curLine);
  },
};
```

If you want recovery instead of an immediate throw, `invalidDigit(...)` can return `true` so parsing continues.

## Read quoted string contents

Call `readStringContents(type, input, pos, lineStart, curLine, errors)` with `pos` set to the first character after the opening quote.

```javascript
const source = '"hello\\nworld";';

const result = readStringContents("double", source, 1, 0, 1, errors);

console.log(result.str);
// hello
// world

console.log(result.pos); // 13
console.log(result.containsInvalid); // false
```

Use `"single"`, `"double"`, or `"template"` for the first argument.

## Read a template literal chunk

In template mode, `readStringContents(...)` stops before either the closing backtick or `${`.

```javascript
const source = '`hi${name}`';

const result = readStringContents("template", source, 1, 0, 1, errors);

console.log(result.str); // hi
console.log(result.pos); // 3, the `$` before `${`
```

Template mode also keeps going when it finds an invalid escape and reports the first bad location on the return value:

```javascript
const invalid = readStringContents("template", '`\\8`', 1, 0, 1, errors);

console.log(invalid.firstInvalidLoc);
// { pos: 1, lineStart: 0, curLine: 1 }

console.log(invalid.containsInvalid); // true
```

## Parse integer fragments

`readInt(...)` parses digits only. If your language syntax has a prefix such as `0x`, `0o`, or `0b`, skip that prefix before calling the helper.

```javascript
const hex = readInt("0xff;", 2, 0, 1, 16, undefined, false, false, errors, false);

console.log(hex.n); // 255
console.log(hex.pos); // 4

const dec = readInt("1_000;", 0, 0, 1, 10, undefined, false, true, errors, false);

console.log(dec.n); // 1000
console.log(dec.pos); // 5
```

Parameter meanings:

- `radix` is the numeric base to parse.
- `len` limits how many digits to read. Use `undefined` for an open-ended read.
- `forceLen` requires exactly `len` digits.
- `allowNumSeparator` can be `true`, `false`, or `"bail"`.
- `bailOnError` returns `{ n: null, pos }` for some invalid cases instead of calling the error handler.

Use `allowNumSeparator: "bail"` when you want parsing to stop at `_` and let your caller decide what to do next.

## Parse Unicode escape code points

`readCodePoint(...)` expects input starting immediately after `\u`.

```javascript
const braced = readCodePoint("{1F600}", 0, 0, 1, true, errors);

console.log(braced.code); // 128512
console.log(String.fromCodePoint(braced.code)); // 😀

const short = readCodePoint("0041", 0, 0, 1, true, errors);

console.log(short.code); // 65
console.log(String.fromCodePoint(short.code)); // A
```

Pass `throwOnInvalid: false` when you want invalid escapes to return `{ code: null, pos }` instead of raising through the error handlers.

## Important pitfalls

- Start `pos` after the opening delimiter or numeric prefix; none of these helpers skip it for you.
- `readStringContents("template", ...)` stops before `${`, so your parser still needs to consume the expression boundary.
- Raw line breaks are only accepted in template mode. In single-quoted and double-quoted strings, they trigger `unterminated(...)`.
- In template mode, CRLF and CR line breaks are normalized to `\n` in the returned `str`.
- `readInt(...)` returns a number and the next position, but it does not attach source text or numeric kind metadata.
- `readCodePoint(...)` returns a numeric code point, not a JavaScript string. Convert it with `String.fromCodePoint(...)` when you need the character.

## Version-sensitive notes

- This guide targets `@babel/helper-string-parser@7.27.1`.
- The published package declares `node >= 6.9.0` in `engines`.
- In `7.27.1`, the package exports CommonJS from `lib/index.js`.
- In `7.27.1`, `readStringContents(...)` returns `containsInvalid`; the published source also contains a Babel 8 compatibility branch gated by `process.env.BABEL_8_BREAKING`.

## Official sources

- Babel docs: https://babel.dev/docs/en/next/babel-helper-string-parser
- npm package page: https://www.npmjs.com/package/@babel/helper-string-parser
- Babel source package: https://github.com/babel/babel/tree/main/packages/babel-helper-string-parser
