---
name: tailwindcss
description: "Tailwind CSS v4 utility framework for styling JavaScript applications with official Vite or PostCSS integrations"
metadata:
  languages: "javascript"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "tailwindcss,css,postcss,vite,javascript,npm"
---

# tailwindcss JavaScript Guide

## Golden Rule

Install `tailwindcss` together with the integration package for your build tool.

- Use `@tailwindcss/vite` with Vite.
- Use `@tailwindcss/postcss` with PostCSS.
- Do not configure `tailwindcss` itself as a PostCSS plugin in v4.

Tailwind CSS is a build-time dependency. There are no API keys, accounts, authentication steps, or application runtime environment variables to configure. The only environment-sensitive behavior in the official integrations is CSS optimization: the Vite and PostCSS plugins check `NODE_ENV` to decide whether Lightning CSS optimization should run by default.

## Install with Vite

```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

Your main stylesheet only needs the Tailwind import:

`src/style.css`:

```css
@import "tailwindcss";
```

Import that stylesheet from your app entrypoint:

`src/main.ts`:

```ts
import './style.css';
```

## Install with PostCSS

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

`postcss.config.mjs`:

```js
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [tailwindcss()],
};
```

`src/app.css`:

```css
@import "tailwindcss";
```

`@tailwindcss/postcss` handles Tailwind's `@import` processing itself, so you do not need a separate `postcss-import` plugin just to load Tailwind.

## Common Workflows

### Change where PostCSS scans for source files

The PostCSS plugin searches from the current working directory by default. Set `base` when your frontend code lives in a subdirectory or workspace package.

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/postcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [
    tailwindcss({
      base: path.resolve(__dirname, './src'),
    }),
  ],
};
```

### Control CSS optimization explicitly

Both official integrations use Lightning CSS and infer production mode from `NODE_ENV`. Set `optimize` when you want deterministic behavior instead of environment-based defaults.

Vite example:

```ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss({
      optimize: { minify: false },
    }),
  ],
});
```

PostCSS example:

```js
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcss({
      optimize: false,
    }),
  ],
};
```

### Disable automatic `url(...)` rewriting in PostCSS

Leave `transformAssetUrls` enabled unless your framework or bundler already rewrites asset URLs for imported CSS.

```js
import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcss({
      transformAssetUrls: false,
    }),
  ],
};
```

### Import Tailwind helper modules from JavaScript

The `tailwindcss` package exports JavaScript helpers and CSS entrypoints in addition to the main stylesheet.

```js
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

console.log(colors.sky[500]);
console.log(defaultTheme.fontFamily.sans);
console.log(typeof plugin);
```

If you need the distributed CSS entrypoints separately, the package also exports `tailwindcss/theme`, `tailwindcss/preflight`, and `tailwindcss/utilities`.

## Important Pitfalls

- `tailwindcss` is not the PostCSS plugin in v4. If you add it directly to `postcss.config.*`, Tailwind throws an error telling you to install `@tailwindcss/postcss` instead.
- Vite and PostCSS integration packages decide whether to optimize CSS by checking `NODE_ENV`. Set `optimize` yourself if you need stable behavior across local builds, CI, and preview environments.
- `@tailwindcss/postcss` rewrites `url(...)` references by default because it also handles `@import`. Disable `transformAssetUrls` only when your framework already owns that step.
- When your app source is not rooted at the current working directory, set the PostCSS plugin's `base` option or Tailwind can scan the wrong place.
- Prefer current v4 setup docs over older Tailwind examples that show `tailwindcss` directly in PostCSS configuration.
