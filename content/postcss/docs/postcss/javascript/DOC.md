---
name: postcss
description: "PostCSS core JavaScript API for processing CSS with plugins, AST transforms, and source maps"
metadata:
  languages: "javascript"
  versions: "8.5.8"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "postcss,css,plugins,ast,source-maps"
---

# PostCSS for JavaScript

`postcss` is the core library API for parsing CSS, running plugins, editing the AST, and serializing output. Use it inside build scripts, bundlers, or custom tooling when you need direct programmatic control.

## Installation

```bash
npm install postcss
```

No authentication or environment variables are required.

The package metadata for `8.5.8` declares Node.js support as `^10 || ^12 || >=14`.

## Import and initialization

Use the library API directly. The core `postcss` package does not ship a CLI.

```javascript
import postcss from 'postcss'

const uppercaseHexColors = {
  postcssPlugin: 'uppercase-hex-colors',
  Declaration(decl) {
    decl.value = decl.value.replace(/#[0-9a-f]+/gi, match => match.toUpperCase())
  }
}

const processor = postcss([uppercaseHexColors])
```

CommonJS also works:

```javascript
const postcss = require('postcss')
```

## Process CSS

Always set `from` and `to` when you know the input and output paths. PostCSS uses them for source maps and syntax error reporting.

```javascript
import postcss from 'postcss'

const uppercaseHexColors = {
  postcssPlugin: 'uppercase-hex-colors',
  Declaration(decl) {
    decl.value = decl.value.replace(/#[0-9a-f]+/gi, match => match.toUpperCase())
  }
}

const input = `
.button {
  color: #ff00aa;
}
`

const result = await postcss([uppercaseHexColors]).process(input, {
  from: 'src/button.css',
  to: 'dist/button.css',
  map: { inline: false }
})

console.log(result.css)

if (result.map) {
  console.log(result.map.toString())
}
```

Use `await processor.process(...)` or `.then(...)` for normal application code. PostCSS can run asynchronous plugins, so treating the result as a promise-safe workflow is the default.

## Parse and edit the AST directly

If you already have CSS and want to mutate the AST yourself, parse it into a `Root`, change nodes, then serialize with `toResult()`.

```javascript
import postcss from 'postcss'

const root = postcss.parse('a { color: black; margin: 0 }', {
  from: 'src/input.css'
})

root.walkDecls('color', decl => {
  decl.value = '#111'
})

const cardRule = postcss.rule({ selector: '.card' })
cardRule.append(postcss.decl({ prop: 'padding', value: '1rem' }))
root.append(cardRule)

const result = root.toResult({
  to: 'dist/output.css',
  map: { inline: false }
})

console.log(result.css)
```

Useful constructors exposed by the package:

- `postcss.rule(...)`
- `postcss.decl(...)`
- `postcss.atRule(...)`
- `postcss.comment(...)`
- `postcss.root(...)`
- `postcss.document(...)`

## Write a plugin

For PostCSS 8, prefer the current plugin format: return an object with `postcssPlugin` and visitor methods.

```javascript
import postcss from 'postcss'

function warnOnImportant() {
  return {
    postcssPlugin: 'warn-on-important',
    Declaration(decl, { result }) {
      if (decl.important) {
        decl.warn(result, 'Avoid !important', { word: '!important' })
      }
    }
  }
}

warnOnImportant.postcss = true

const result = await postcss([warnOnImportant()]).process(
  'a { color: red !important }',
  { from: 'src/app.css' }
)

for (const warning of result.warnings()) {
  console.warn(warning.toString())
}
```

You can register visitors such as `Once`, `OnceExit`, `Rule`, `Declaration`, `AtRule`, `Comment`, and their `...Exit` variants. Declaration and at-rule visitors can also be keyed by property or rule name.

## Source maps

PostCSS supports source maps through the `map` option on `process()` or `toResult()`.

```javascript
import postcss from 'postcss'

const result = await postcss().process('a { color: black }', {
  from: 'src/app.css',
  to: 'dist/app.css',
  map: {
    inline: false,
    annotation: true,
    sourcesContent: true
  }
})

console.log(result.css)
console.log(result.map?.toString())
```

If you use `map.inline: true`, the source map is embedded into `result.css`, and `result.map` can be empty.

## Error handling

`postcss.parse()` throws `CssSyntaxError` for invalid CSS.

```javascript
import postcss from 'postcss'

try {
  postcss.parse('a { color: red', { from: 'src/broken.css' })
} catch (error) {
  if (error.name === 'CssSyntaxError') {
    console.error(error.message)
    console.error(error.showSourceCode())
  } else {
    throw error
  }
}
```

Check `error.name === 'CssSyntaxError'` instead of `instanceof`, since a project can end up with multiple PostCSS copies in `node_modules`.

## Important pitfalls

- Do not use `postcss.plugin(...)` for new code. It is deprecated in PostCSS 8.
- Do not pass a custom syntax object as a plugin. Use the `parser`, `stringifier`, or `syntax` process options instead.
- Do not rely on synchronous getters like `lazyResult.css`, `lazyResult.root`, or `lazyResult.messages` if any plugin may be asynchronous. Use `await` or call `.sync()` only when every plugin is synchronous.
- Reuse a `Processor` instance when you are processing many files with the same plugin set.
